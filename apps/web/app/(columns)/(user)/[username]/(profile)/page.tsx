"use client";

import { PostFeed } from "@/components/post-feed";
import { myPostsAtom } from "@/lib/atom";
import { trpc } from "@/lib/trpc";
import type { PostResolved } from "@semicolon/api/schema";
import { useAtomValue } from "jotai";
import _ from "lodash";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

export default function Page({
  params: { username },
}: {
  params: { username: string };
}) {
  const {
    data: feed,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isLoadingError,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
  } = trpc.user.posts.useInfiniteQuery(
    { username, maxResults: 15 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const { data: session } = useSession();

  const myPosts = useAtomValue(myPostsAtom);
  const [feedArray, setFeedArray] = useState<PostResolved[]>([]);

  useEffect(() => {
    setFeedArray((feed?.pages ?? []).flatMap((page) => page.posts));
  }, [myPosts, feed, session, username]);

  return (
    <PostFeed
      posts={feedArray}
      hasNextPage={hasNextPage}
      loading={isLoading || isFetchingNextPage}
      error={isLoadingError || isFetchNextPageError}
      fetchNextPage={fetchNextPage}
      refetch={refetch}
    />
  );
}
