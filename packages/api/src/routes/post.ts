// file name and directory: root/packages/api/routes/post.ts
import { router, publicProcedure, userProcedure } from "../trpc";
import {
  PostResolvedSchema,
  ShortToUUID,
  UsernameSchema,
} from "@semicolon/api/schema";
import { db } from "@semicolon/db";
import { TRPCError } from "@trpc/server";
import { BlobNotFoundError, head } from "@vercel/blob";
import { Expression, NotNull, SqlBool } from "kysely";
import { sql } from "kysely";
import _ from "lodash";
import { z } from "zod";

export const post = router({
  new: userProcedure
    .meta({ openapi: { method: "POST", path: "/posts/new" } })
    .input(
      z
        .object({
          content: z.string().optional(),
          to: ShortToUUID.optional(),
          media: z.array(z.string().url()).max(4),
        })
        .refine(
          ({ content, media }) => media.length > 0 || content !== undefined,
          { message: "Post must either contain content or media" },
        ),
    )
    .output(PostResolvedSchema)
    .mutation(async ({ ctx: { user }, input: { content, to, media } }) => {
      try {
        await Promise.all(media.map(async (blobUrl) => await head(blobUrl)));
      } catch (error) {
        if (error instanceof BlobNotFoundError) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "External media URLs are forbidden",
          });
        } else {
          throw error;
        }
      }

      const post = await db.post.create({
        data: {
          userId: user.id,
          parentId: to,
          media,
          content,
        },
        include: {
          user: {
            include: {
              followedBy: {
                where: {
                  username: user.username,
                },
              },
            },
          },
          likes: {
            where: {
              user: {
                username: user.username,
              },
            },
          },
          parent: {
            include: {
              user: true,
            },
          },
          _count: {
            select: {
              likes: true,
              children: true,
            },
          },
        },
      });

      return {
        ...post,
        name: user.name,
        to: post.parent?.user.username ?? null,
        username: user.username,
        verified: user.verified,
        avatar: user.image,
        likeCount: post._count.likes,
        replyCount: post._count.children,
        followed: post.user.followedBy.length > 0,
        liked: post.likes.length > 0,
      };
    }),
  search: publicProcedure
    .meta({ openapi: { method: "GET", path: "/posts/search" } })
    .input(
      z
        .object({
          query: z.string().optional(),
          since: z.date().optional(),
          until: z.date().optional(),
          from: UsernameSchema.optional(),
          to: UsernameSchema.optional(),
          reply: z.boolean().optional(),
          minLikes: z.number().optional(),
          minReplies: z.number().optional(),
          sortBy: z
            .union([z.literal("recency"), z.literal("relevancy")])
            .default("recency"),
          cursor: z.string().uuid().optional(),
          maxResults: z.number().min(1).max(100).default(50),
        })
        .transform((obj) => ({
          ...obj,
          ...(obj.query && { query: obj.query.split(/\s+/).join(" & ") }),
        })),
    )
    .output(
      z.object({
        results: z.array(PostResolvedSchema),
        nextCursor: z.string().uuid().optional(),
      }),
    )
    .query(
      async ({
        ctx: { session },
        input: {
          query,
          since,
          until,
          reply,
          from,
          to,
          minLikes,
          minReplies,
          sortBy,
          cursor,
          maxResults,
        },
      }) => {
        // We need to do raw queries here, because Prisma can't filter on aggregrate counts
        // https://github.com/prisma/prisma/issues/6570

        let dbQuery = db.$kysely
          .selectFrom("Post")
          .leftJoin(
            (eb) =>
              eb
                .selectFrom("User")
                .select([
                  "User.id",
                  "User.name",
                  "User.username",
                  "User.image",
                  "User.verified",
                ])
                .as("Author"),
            (join) => join.onRef("Post.userId", "=", "Author.id"),
          )
          .leftJoin(
            (eb) =>
              eb
                .selectFrom("Like")
                .select((eb) => [
                  "Like.postId",
                  eb.cast<number>(eb.fn.countAll(), "integer").as("count"),
                ])
                .groupBy("Like.postId")
                .as("AggrLike"),
            (join) => join.onRef("Post.id", "=", "AggrLike.postId"),
          )
          .leftJoin(
            (eb) =>
              eb
                .selectFrom("Post")
                .select((eb) => [
                  "Post.parentId",
                  eb.cast<number>(eb.fn.countAll(), "integer").as("count"),
                ])
                .groupBy("Post.parentId")
                .as("AggrReply"),
            (join) => join.onRef("Post.id", "=", "AggrReply.parentId"),
          )
          .leftJoin("Post as ParentPost", (join) =>
            join.onRef("ParentPost.id", "=", "Post.parentId"),
          )
          .leftJoin("User as ParentAuthor", (join) =>
            join.onRef("ParentAuthor.id", "=", "ParentPost.userId"),
          )
          .$if(session?.user?.id !== undefined, (qb) =>
            qb
              .leftJoin(
                (eb) =>
                  eb
                    .selectFrom("_UserFollow")
                    .select([
                      "A",
                      "B",
                      (eb) =>
                        eb
                          .cast<number>(eb.fn.countAll(), "integer")
                          .as("count"),
                    ])
                    .groupBy(["_UserFollow.A", "_UserFollow.B"])
                    .where(({ eb }) =>
                      eb(
                        "_UserFollow.B",
                        "=",
                        eb.cast<string>(eb.val(session!.user!.id), "uuid"),
                      ),
                    )
                    .as("UserFollow"),
                (join) => join.onRef("UserFollow.A", "=", "Author.id"),
              )
              .leftJoin(
                (eb) =>
                  eb
                    .selectFrom("Like")
                    .selectAll()
                    .groupBy(["Like.postId", "Like.userId"])
                    .where(({ eb }) =>
                      eb(
                        "Like.userId",
                        "=",
                        eb.cast<string>(eb.val(session!.user!.id), "uuid"),
                      ),
                    )
                    .as("LikeStatus"),
                (join) => join.onRef("LikeStatus.postId", "=", "Post.id"),
              )
              .select([
                "UserFollow.count as followedBy",
                "LikeStatus.userId as likeStatus",
              ]),
          )
          .select([
            "Post.id",
            "Post.createdAt",
            "Post.userId",
            "Post.content",
            "Post.parentId",
            "Post.media",
            "Post.views",
            "ParentAuthor.username as to",
            "Author.name",
            "Author.username",
            "Author.verified",
            "Author.image as avatar",
            (eb) =>
              eb.fn.coalesce("AggrLike.count", sql<number>`0`).as("likeCount"),
            (eb) =>
              eb.fn
                .coalesce("AggrReply.count", sql<number>`0`)
                .as("replyCount"),
          ])
          .$narrowType<{
            name: NotNull;
            username: NotNull;
            verified: NotNull;
          }>()
          .limit(maxResults + 1);

        const toTsvector = sql`to_tsvector(concat_ws(' ', "Post"."content"))`;
        const toTsquery = sql`to_tsquery(${query})`;
        const tsRank = sql<number>`ts_rank(${toTsvector}, ${toTsquery})`;

        if (query) {
          dbQuery = dbQuery.where(({ eb }) => eb(toTsvector, "@@", toTsquery));
        }

        if (since ?? until) {
          dbQuery = dbQuery.where(({ eb, and }) => {
            const ors: Expression<SqlBool>[] = [];
            if (since) {
              ors.push(eb("Post.createdAt", ">=", since));
            }
            if (until) {
              ors.push(eb("Post.createdAt", "<=", until));
            }
            return and(ors);
          });
        }

        if (reply !== undefined) {
          dbQuery = dbQuery.where(({ eb }) =>
            eb("Post.parentId", reply ? "is not" : "is", null),
          );
        }

        if (from) {
          dbQuery = dbQuery.where(({ eb, and }) =>
            and([
              eb("Author.username", "=", from),
              eb("Author.id", "is not", null),
            ]),
          );
        }

        if (to) {
          dbQuery = dbQuery.where(({ eb, and }) =>
            and([
              eb("ParentAuthor.username", "=", to),
              eb("ParentAuthor.id", "is not", null),
              eb("ParentPost.id", "is not", null),
            ]),
          );
        }

        if (minLikes) {
          dbQuery = dbQuery.where(({ eb }) =>
            eb("AggrLike.count", ">=", minLikes),
          );
        }

        if (minReplies) {
          dbQuery = dbQuery.where(({ eb }) =>
            eb("AggrReply.count", ">=", minReplies),
          );
        }

        switch (sortBy) {
          case "recency":
            dbQuery = dbQuery.orderBy(["Post.createdAt desc", "Post.id asc"]);
            break;
          case "relevancy":
            if (query) {
              dbQuery = dbQuery.orderBy([sql`${tsRank} DESC`, "Post.id asc"]);
            }
            break;
        }

        if (cursor) {
          dbQuery = dbQuery.where(({ eb, and, or }) => {
            const tieBreaker = eb(
              "Post.id",
              ">=",
              eb
                .selectFrom("Post")
                .select("Post.id")
                .where("Post.id", "=", eb.cast<string>(eb.val(cursor), "uuid")),
            );

            switch (sortBy) {
              case "recency": {
                const cursorQuery = eb
                  .selectFrom("Post")
                  .select("Post.createdAt")
                  .where(
                    "Post.id",
                    "=",
                    eb.cast<string>(eb.val(cursor), "uuid"),
                  );

                return or([
                  and([eb("Post.createdAt", "=", cursorQuery), tieBreaker]),
                  eb("Post.createdAt", "<", cursorQuery),
                ]);
              }
              case "relevancy": {
                const cursorQuery = eb
                  .selectFrom("Post")
                  .select(tsRank.as("rank"))
                  .where(
                    "Post.id",
                    "=",
                    eb.cast<string>(eb.val(cursor), "uuid"),
                  );

                return or([
                  and([eb(tsRank, "=", cursorQuery), tieBreaker]),
                  eb(tsRank, "<", cursorQuery),
                ]);
              }
            }
          });
        }

        const results = await dbQuery.execute();

        let nextCursor: typeof cursor | undefined;

        if (results.length > maxResults) {
          const nextItem = results.pop();
          nextCursor = nextItem!.id; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        }

        return {
          results: results.map((result) => ({
            ...result,
            followed: (result.followedBy ?? 0) > 0,
            liked: !!result.likeStatus,
          })),
          nextCursor,
        };
      },
    ),
  id: publicProcedure
    .meta({ openapi: { method: "GET", path: "/posts/{id}" } })
    .input(z.object({ id: ShortToUUID }))
    .output(PostResolvedSchema)
    .query(async ({ ctx: { session }, input: { id } }) => {
      const post = await db.post.findUnique({
        where: { id },
        include: {
          parent: {
            include: {
              user: true,
            },
          },
          user: {
            include: {
              followedBy: {
                where: {
                  username: session?.user?.username,
                },
              },
            },
          },
          likes: {
            where: {
              userId: session?.user?.id,
            },
          },
          _count: {
            select: {
              likes: true,
              children: true,
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The requested post does not exist",
        });
      }

      return {
        ...post,
        name: post.user.name!,
        to: post.parent?.user.username ?? null,
        username: post.user.username!,
        verified: post.user.verified,
        avatar: post.user.image,
        followed: post.user.followedBy.length > 0,
        likeCount: post._count.likes,
        replyCount: post._count.children,
        liked: post.likes.length > 0,
      };
    }),
  update: userProcedure
    .meta({ openapi: { method: "POST", path: "/posts/{id}" } })
    .input(
      z.object({
        id: z.string(),
        content: z.string(),
      }),
    )
    .output(PostResolvedSchema)
    .mutation(async ({ ctx: { user }, input: { id, content } }) => {
      const post = await db.post.findUnique({
        select: { userId: true },
        where: {
          id,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Requested post not found",
        });
      }

      if (post.userId !== user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not permitted to modify requested post",
        });
      }

      const updated = await db.post.update({
        where: { id: id },
        data: {
          content,
        },
        include: {
          user: true,
          parent: {
            include: {
              user: true,
            },
          },
          likes: {
            where: {
              user: {
                username: user.username,
              },
            },
          },
          _count: {
            select: {
              likes: true,
              children: true,
            },
          },
        },
      });

      return {
        ...updated,
        name: updated.user.name!,
        to: updated.parent?.user.username ?? null,
        username: updated.user.username!,
        verified: updated.user.verified,
        avatar: updated.user.image,
        likeCount: updated._count.likes,
        replyCount: updated._count.children,
        followed: false,
        liked: updated.likes.length > 0,
      };
    }),
  delete: userProcedure
    .meta({ openapi: { method: "DELETE", path: "/posts/{id}" } })
    .input(
      z.object({
        id: ShortToUUID,
      }),
    )
    .output(PostResolvedSchema)
    .mutation(async ({ ctx: { user }, input: { id } }) => {
      const post = await db.post.findUnique({
        select: { userId: true },
        where: {
          id,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Requested post not found",
        });
      }

      if (post.userId !== user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not permitted to modify requested post",
        });
      }

      const deleted = await db.post.delete({
        where: { id },
        include: {
          user: {
            include: {
              followedBy: {
                where: {
                  username: user.username,
                },
              },
            },
          },
          parent: {
            include: {
              user: true,
            },
          },
          likes: {
            where: {
              user: {
                username: user.username,
              },
            },
          },
          _count: {
            select: {
              likes: true,
              children: true,
            },
          },
        },
      });

      return {
        ...deleted,
        name: deleted.user.name!,
        to: deleted.parent?.user.username ?? null,
        username: deleted.user.username!,
        verified: deleted.user.verified,
        avatar: deleted.user.image,
        likeCount: deleted._count.likes,
        replyCount: deleted._count.children,
        followed: deleted.user.followedBy.length > 0,
        liked: deleted.likes.length > 0,
      };
    }),
  replies: publicProcedure
    .meta({ openapi: { method: "GET", path: "/posts/{id}/replies" } })
    .input(
      z.object({
        id: ShortToUUID,
        cursor: z.string().uuid().optional(),
        maxResults: z.number().min(1).max(100).default(50),
      }),
    )
    .output(
      z.object({
        replies: z.array(PostResolvedSchema),
        nextCursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx: { session }, input: { id, maxResults, cursor } }) => {
      const post = await db.post.findUnique({
        where: { id },
        include: {
          children: {
            ...(cursor && { cursor: { id: cursor } }),
            take: maxResults + 1,
            include: {
              likes: {
                where: {
                  user: {
                    username: session?.user?.username,
                  },
                },
              },
              user: {
                include: {
                  followedBy: {
                    where: {
                      username: session?.user?.username,
                    },
                  },
                },
              },
              parent: {
                include: {
                  user: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                  children: true,
                },
              },
            },
            orderBy: {
              likes: {
                _count: "desc",
              },
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The requested post does not exist",
        });
      }

      let nextCursor: typeof cursor | undefined;

      if (post.children.length > maxResults) {
        const nextItem = post.children.pop();
        nextCursor = nextItem!.id;
      }

      return {
        replies: post.children.map((child) => ({
          ...child,
          name: child.user.name!,
          username: child.user.username!,
          to: null,
          verified: child.user.verified,
          avatar: child.user.image,
          likeCount: child._count.likes,
          replyCount: child._count.children,
          followed: child.user.followedBy.length > 0,
          liked: child.likes.length > 0,
        })),
        nextCursor,
      };
    }),
  like: userProcedure
    .meta({ openapi: { method: "PUT", path: "/posts/{id}/like" } })
    .input(z.object({ id: ShortToUUID }))
    .output(z.void())
    .mutation(async ({ ctx: { user }, input: { id } }) => {
      await db.post.update({
        where: {
          id,
        },
        data: {
          likes: {
            connectOrCreate: {
              where: {
                postId_userId: {
                  postId: id,
                  userId: user.id,
                },
              },
              create: {
                userId: user.id,
              },
            },
          },
        },
      });
    }),
  unlike: userProcedure
    .meta({ openapi: { method: "DELETE", path: "/posts/{id}/like" } })
    .input(z.object({ id: ShortToUUID }))
    .output(z.void())
    .mutation(async ({ ctx: { user }, input: { id } }) => {
      await db.like.delete({
        where: {
          postId_userId: {
            postId: id,
            userId: user.id,
          },
        },
      });
    }),
});
