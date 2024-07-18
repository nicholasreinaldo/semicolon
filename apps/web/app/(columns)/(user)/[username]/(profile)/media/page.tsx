"use client";

import { PostFeed } from "@/components/post-feed";
import { trpc } from "@/lib/trpc";
import type { PostResolved } from "@semicolon/api/schema";
import _ from "lodash";
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
  } = trpc.user.media.useInfiniteQuery(
    { username, maxResults: 15 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const [feedArray, setFeedArray] = useState<PostResolved[]>([]);

  useEffect(() => {
    setFeedArray((feed?.pages ?? []).flatMap((page) => page.posts));
  }, [feed, username]);

  return (
    <PostFeed
      posts={feedArray}
      hasNextPage={hasNextPage}
      loading={isLoading || isFetchingNextPage}
      error={isLoadingError || isFetchNextPageError}
      fetchNextPage={fetchNextPage}
      refetch={refetch}
      media
    />
  );
}
