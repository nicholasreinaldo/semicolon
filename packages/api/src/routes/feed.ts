import { PostResolvedSchema, PublicUserResolvedSchema } from "../schema";
import { router, userProcedure } from "../trpc";
import { db } from "@semicolon/db";
import { NotNull, sql } from "kysely";
import { z } from "zod";

export const feed = router({
  recommended: userProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/feed/recommended",
        summary: "Recommended posts feed",
        tags: ["feed"],
      },
    })
    .input(
      z.object({
        cursor: z.string().uuid().optional(),
        maxResults: z.number().min(1).max(100).default(50),
      }),
    )
    .output(
      z.object({
        posts: z.array(PostResolvedSchema),
        nextCursor: z.string().uuid().optional(),
      }),
    )
    .query(
      async ({
        ctx: {
          session,
          user: { id },
        },
        input: { cursor, maxResults },
      }) => {
        const rank = sql<number>`"AggrLike".count * "Post".views / (((EXTRACT(epoch from (current_timestamp - "Post"."createdAt")) / 3600) + 2) ^ 1.8)`;

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
          .where(({ eb, and }) =>
            and([
              eb("Author.id", "!=", eb.cast<string>(eb.val(id), "uuid")),
              eb("ParentAuthor.id", "is", null),
            ]),
          )
          .orderBy([sql`${rank} DESC`, "Post.id asc"])
          .$narrowType<{
            name: NotNull;
            username: NotNull;
            verified: NotNull;
          }>()
          .limit(maxResults + 1);

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

            const cursorQuery = eb
              .selectFrom("Post")
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
              .select(rank.as("rank"))
              .where("Post.id", "=", eb.cast<string>(eb.val(cursor), "uuid"));

            return or([
              and([eb(rank, "=", cursorQuery), tieBreaker]),
              eb(rank, "<", cursorQuery),
            ]);
          });
        }

        const posts = await dbQuery.execute();

        let nextCursor: typeof cursor | undefined;

        if (posts.length > maxResults) {
          const nextItem = posts.pop();
          nextCursor = nextItem!.id;
        }

        return {
          posts: posts.map((result) => ({
            ...result,
            followed: (result.followedBy ?? 0) > 0,
            liked: !!result.likeStatus,
          })),
          nextCursor,
        };
      },
    ),
  following: userProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/feed/following",
        summary: "Chronological feed of posts from followed users",
        tags: ["feed"],
      },
    })
    .input(
      z.object({
        cursor: z.string().uuid().optional(),
        maxResults: z.number().min(1).max(100).default(50),
      }),
    )
    .output(
      z.object({
        results: z.array(PostResolvedSchema),
        nextCursor: z.string().uuid().optional(),
      }),
    )
    .query(
      async ({
        ctx: {
          user: { id, username },
        },
        input: { cursor, maxResults },
      }) => {
        const posts = await db.post.findMany({
          where: {
            user: {
              followedBy: {
                some: {
                  id,
                },
              },
            },
          },
          take: maxResults + 1,
          include: {
            user: {
              include: {
                followedBy: {
                  where: {
                    username: username,
                  },
                },
              },
            },
            likes: {
              where: {
                user: {
                  username,
                },
              },
            },
            _count: {
              select: {
                likes: true,
                children: true,
              },
            },
            parent: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        let nextCursor: typeof cursor | undefined;

        if (posts.length > maxResults) {
          const nextItem = posts.pop();
          nextCursor = nextItem!.id;
        }

        return {
          results: posts.map((post) => ({
            ...post,
            name: post.user.name!,
            to: post.parent?.user.username ?? null,
            followed: post.user.followedBy.length > 0,
            username: post.user.username!,
            verified: post.user.verified,
            avatar: post.user.image,
            likeCount: post._count.likes,
            replyCount: post._count.children,
            liked: post.likes.length > 0,
          })),
          nextCursor,
        };
      },
    ),
  user: userProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/feed/users",
        summary: "Recommended users feed",
        tags: ["feed"],
      },
    })
    .input(
      z.object({
        cursor: z.string().uuid().optional(),
        maxResults: z.number().min(1).max(100).default(50),
      }),
    )
    .output(
      z.object({
        users: z.array(PublicUserResolvedSchema),
        nextCursor: z.string().uuid().optional(),
      }),
    )
    .query(
      async ({
        ctx: {
          user: { username },
        },
        input: { cursor, maxResults },
      }) => {
        const users = await db.user.findMany({
          where: { username: { not: username } },
          orderBy: { followedBy: { _count: "desc" } },
          take: maxResults + 1,
          ...(cursor && { cursor: { id: cursor } }),
          include: {
            _count: {
              select: {
                followedBy: true,
                following: true,
                posts: true,
              },
            },
            followedBy: {
              where: {
                username,
              },
            },
          },
        });

        let nextCursor: typeof cursor | undefined;

        if (users.length > maxResults) {
          const nextItem = users.pop();
          nextCursor = nextItem!.id;
        }

        return {
          users: users.map((user) => ({
            ...user,
            name: user.name!,
            username: user.username!,
            registered: user.registered!,
            following: user._count.following,
            followers: user._count.followedBy,
            followed: user.followedBy.length > 0,
            posts: user._count.posts,
          })),
          nextCursor,
        };
      },
    ),
});
