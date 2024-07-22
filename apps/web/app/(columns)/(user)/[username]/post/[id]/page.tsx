"use client";

import { BackHeader } from "@/components/back-header";
import { PostDetail } from "@/components/post-detail";
import { PostFeed } from "@/components/post-feed";
import { PostForm } from "@/components/post-form";
import { myPostsAtom } from "@/lib/atom";
import { trpc } from "@/lib/trpc";
import { PostResolved } from "@semicolon/api/schema";
import { Separator } from "@semicolon/ui/separator";
import Spinner from "@semicolon/ui/spinner";
import { useAtomValue } from "jotai";
import _ from "lodash";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

export default function Page({
  params: { username, id },
}: {
  params: { username: string; id: string };
}) {
  const { data: post } = trpc.post.id.useQuery({ id });
  const { data: session } = useSession();
  const {
    data: replies,
    fetchNextPage,
    isLoading,
    isLoadingError,
    isFetchingNextPage,
    hasNextPage,
    isFetchNextPageError,
    refetch,
  } = trpc.post.replies.useInfiniteQuery(
    { id, maxResults: 15 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const [repliesCustom, setRepliesCustom] = useState<PostResolved[]>([]);
  const myPosts = useAtomValue(myPostsAtom);

  useEffect(() => {
    // We need to filter twice because our query result is not necessarily up-to-date
    const myReplies = myPosts
      .filter((post) => post.parentId === id)
      .map((reply) => ({
        ...reply,
        to: null as string | null,
      }));

    setRepliesCustom(
      myReplies.concat(
        replies
          ? replies.pages
              .flatMap((page) => page.replies)
              .filter((reply) => !myReplies.find((r) => r.id === reply.id))
          : [],
      ),
    );
  }, [id, myPosts, replies]);

  useEffect(() => {
    if (post && username !== post.username) {
      window.history.replaceState(null, "", `/${post.username}/post/${id}`);
    }
  }, [username, post, id]);

  if (!post) {
    return (
      <div className="flex min-h-20 items-center justify-center">
        <Spinner size={30} />
      </div>
    );
  }

  return (
    <div>
      <BackHeader className="backdrop-blur-md">
        <h3 className="text-xl font-semibold">Post</h3>
      </BackHeader>
      <PostDetail {...post} />
      <PostForm
        to={id}
        avatar={session?.user?.image}
        placeholder="Post your reply"
      />
      <Separator />
      <div className="mb-4 flex flex-col">
        <PostFeed
          posts={repliesCustom}
          loading={isLoading || isFetchingNextPage}
          error={isLoadingError || isFetchNextPageError}
          fetchNextPage={fetchNextPage}
          refetch={refetch}
          hasNextPage={hasNextPage}
          indicateReply={false}
        />
      </div>
    </div>
  );
}
