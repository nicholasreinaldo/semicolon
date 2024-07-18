"use client";

import { PostFeed } from "@/components/post-feed";
import { UserList } from "@/components/user-list";
import { trpc } from "@/lib/trpc-client";
import { PostResolved, PublicUserResolved } from "@semicolon/api/schema";
import { skipToken } from "@tanstack/react-query";
import { redirect, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { z } from "zod";

export default function Page() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<{
    query: string;
    tab: "rel" | "latest" | "people";
  } | null>(null);
  const [postResults, setPostResults] = useState<PostResolved[]>([]);
  const [userResults, setUserResults] = useState<PublicUserResolved[]>([]);

  const {
    data: rawPostResults,
    fetchNextPage: fetchNextPostPage,
    isLoading: isPostLoading,
    isLoadingError: isPostLoadingError,
    isFetchingNextPage: isPostFetchingNextPage,
    isFetchNextPageError: isPostFetchNextPageError,
    hasNextPage: hasPostNextPage,
    refetch: refetchPosts,
  } = trpc.post.search.useInfiniteQuery(
    params && params.tab !== "people"
      ? { query: params.query, maxResults: 15 }
      : skipToken,
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  const {
    data: rawUserResults,
    fetchNextPage: fetchNextUserPage,
    isLoading: isUserLoading,
    isLoadingError: isUserLoadingError,
    isFetchingNextPage: isUserFetchingNextPage,
    isFetchNextPageError: isUserFetchNextPageError,
    hasNextPage: hasUserNextPage,
    refetch: refetchUsers,
  } = trpc.user.search.useInfiniteQuery(
    params && params.tab === "people"
      ? { query: params.query, maxResults: 15 }
      : skipToken,
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  useEffect(() => {
    if (params?.tab !== "people") {
      setPostResults(
        (rawPostResults?.pages ?? []).flatMap((page) => page.results),
      );
    }
  }, [rawPostResults, params]);

  useEffect(() => {
    if (params?.tab === "people") {
      setUserResults(
        (rawUserResults?.pages ?? []).flatMap((page) => page.users),
      );
    }
  }, [rawUserResults, params]);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query === null) {
      redirect("/home");
    }

    const { data: tab } = z
      .union([z.null(), z.literal("latest"), z.literal("people")])
      .safeParse(searchParams.get("f"));

    if (!tab) {
      const updated = new URLSearchParams(searchParams.toString());
      updated.delete("f");
      window.history.replaceState(null, "", `?${updated.toString()}`);
      setParams({ query, tab: "rel" });
    } else {
      setParams({ query, tab });
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center">
      {params?.tab === "people" ? (
        <UserList
          users={userResults}
          loading={isUserLoading || isUserFetchingNextPage}
          error={isUserLoadingError || isUserFetchNextPageError}
          fetchNextPage={fetchNextUserPage}
          refetch={refetchUsers}
          hasNextPage={hasUserNextPage}
        />
      ) : (
        <PostFeed
          posts={postResults}
          loading={isPostLoading || isPostFetchingNextPage}
          error={isPostLoadingError || isPostFetchNextPageError}
          fetchNextPage={fetchNextPostPage}
          refetch={refetchPosts}
          hasNextPage={hasPostNextPage}
        />
      )}
      {params?.tab !== "people" &&
        rawPostResults?.pages[0]?.results.length === 0 && (
          <article className="flex max-w-[450px] flex-col gap-3 p-9">
            <p className="text-3xl font-black">
              No results for {`"${params?.query}"`}
            </p>
            <p className="text-muted-foreground text-base">
              Try searching for something else, or check if you made a mistake
              in your query.
            </p>
          </article>
        )}
      {params?.tab === "people" &&
        rawUserResults?.pages[0]?.users.length === 0 && (
          <article className="flex max-w-[450px] flex-col gap-3 p-9">
            <p className="text-3xl font-black">
              No results for {`"${params?.query}"`}
            </p>
            <p className="text-muted-foreground text-base">
              Try searching for something else, or check if you made a mistake
              in your query.
            </p>
          </article>
        )}
    </div>
  );
}
