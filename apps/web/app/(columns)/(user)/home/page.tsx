"use client";

import { PostFeed } from "@/components/post-feed";
import { PostForm } from "@/components/post-form";
import { myPostsAtom } from "@/lib/atom";
import { trpc } from "@/lib/trpc";
import { PostResolved } from "@semicolon/api/schema";
import { Separator } from "@semicolon/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@semicolon/ui/tabs";
import { useAtomValue } from "jotai";
import _ from "lodash";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

enum ActiveTab {
  Recommended = "recommended",
  Following = "following",
}

function Recommended() {
  const {
    data: feed,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isLoadingError,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
  } = trpc.feed.recommended.useInfiniteQuery(
    { maxResults: 15 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const myPosts = useAtomValue(myPostsAtom);
  const [feedCustom, setFeedCustom] = useState<PostResolved[]>([]);

  useEffect(() => {
    setFeedCustom(
      myPosts.concat((feed?.pages ?? []).flatMap((page) => page.posts)),
    );
  }, [myPosts, feed]);

  return (
    <PostFeed
      posts={feedCustom}
      hasNextPage={hasNextPage}
      loading={isLoading || isFetchingNextPage}
      error={isLoadingError || isFetchNextPageError}
      fetchNextPage={fetchNextPage}
      refetch={refetch}
    />
  );
}

function Following() {
  const {
    data: feed,
    fetchNextPage,
    isLoading,
    isLoadingError,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    refetch,
  } = trpc.feed.following.useInfiniteQuery(
    { maxResults: 15 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const myPosts = useAtomValue(myPostsAtom);
  const [feedCustom, setFeedCustom] = useState<PostResolved[]>([]);

  useEffect(() => {
    setFeedCustom(
      myPosts.concat(
        (feed?.pages ?? [])
          .flatMap((page) => page.results)
          .filter((post) => !myPosts.find((p) => p.id === post.id)),
      ),
    );
  }, [myPosts, feed]);

  return (
    <>
      <PostFeed
        posts={feedCustom}
        loading={isLoading || isFetchingNextPage}
        error={isLoadingError || isFetchNextPageError}
        fetchNextPage={fetchNextPage}
        refetch={refetch}
        hasNextPage={hasNextPage}
      />
      {feed?.pages[0]?.results.length === 0 && (
        <article className="flex flex-col gap-3 p-9">
          <p className="text-2xl font-black">Welcome back</p>
          <p className="text-muted-foreground text-base">
            Select some topics you{"'"}re interested in to help personalize your
            Semicolon experience, starting with finding people to follow.
          </p>
        </article>
      )}
    </>
  );
}

export default function Page() {
  const { data: session } = useSession();

  return (
    <div className="relative flex flex-col">
      <Tabs defaultValue={ActiveTab.Recommended}>
        <TabsList>
          <TabsTrigger value={ActiveTab.Recommended}>For You</TabsTrigger>
          <TabsTrigger value={ActiveTab.Following}>Following</TabsTrigger>
        </TabsList>
        <PostForm avatar={session?.user?.image} />
        <Separator />
        <TabsContent value={ActiveTab.Recommended}>
          <Recommended />
        </TabsContent>
        <TabsContent value={ActiveTab.Following}>
          <Following />
        </TabsContent>
      </Tabs>
    </div>
  );
}
