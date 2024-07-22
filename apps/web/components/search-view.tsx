import { PostFeed } from "@/components/post-feed";
import { UserList } from "@/components/user-list";
import { trpc } from "@/lib/trpc";
import type { RouterInput } from "@semicolon/api";
import { PostResolved, PublicUserResolved } from "@semicolon/api/schema";
import { cn } from "@semicolon/ui/utils";
import React, { useEffect, useState } from "react";

export function NoResultsMessage({
  term,
  className,
}: React.ComponentProps<"article"> & { term: string }) {
  return (
    <article
      className={cn("mx-auto flex max-w-[450px] flex-col gap-3 p-9", className)}
    >
      <p className="text-3xl font-black">No results for {`"${term}"`}</p>
      <p className="text-muted-foreground text-base">
        Try searching for something else, or check if you made a mistake in your
        query.
      </p>
    </article>
  );
}

export function PostSearch(
  query: RouterInput["post"]["search"] & { query: string },
) {
  const [results, setResults] = useState<PostResolved[]>([]);

  const {
    data: rawResults,
    fetchNextPage,
    isLoading,
    isLoadingError,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    refetch,
  } = trpc.post.search.useInfiniteQuery(query, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    setResults((rawResults?.pages ?? []).flatMap((page) => page.results));
  }, [rawResults]);

  return (
    <>
      <PostFeed
        posts={results}
        loading={isLoading || isFetchingNextPage}
        error={isLoadingError || isFetchNextPageError}
        fetchNextPage={fetchNextPage}
        refetch={refetch}
        hasNextPage={hasNextPage}
      />
      {rawResults?.pages[0]?.results?.length === 0 && (
        <NoResultsMessage term={query.query} />
      )}
    </>
  );
}

export function UserSearch(query: RouterInput["user"]["search"]) {
  const [results, setResults] = useState<PublicUserResolved[]>([]);

  const {
    data: rawResults,
    fetchNextPage,
    isLoading,
    isLoadingError,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    refetch,
  } = trpc.user.search.useInfiniteQuery(query, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    setResults((rawResults?.pages ?? []).flatMap((page) => page.users));
  }, [rawResults]);

  return (
    <>
      <UserList
        users={results}
        loading={isLoading || isFetchingNextPage}
        error={isLoadingError || isFetchNextPageError}
        fetchNextPage={fetchNextPage}
        refetch={refetch}
        hasNextPage={hasNextPage}
      />
      {rawResults?.pages[0]?.users?.length === 0 && (
        <NoResultsMessage term={query.query} />
      )}
    </>
  );
}
