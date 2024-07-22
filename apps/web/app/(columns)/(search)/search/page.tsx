"use client";

import { PostSearch, UserSearch } from "@/components/search-view";
import { useSearchFilters } from "@/lib/hooks";
import { redirect } from "next/navigation";
import React from "react";

export default function Page() {
  const [
    ,
    {
      tab,
      query,
      following,
      from,
      to,
      minLikes,
      minReplies,
      reply,
      since,
      until,
    },
  ] = useSearchFilters();

  if (!query) {
    redirect("/home");
  }

  return tab === "people" ? (
    <UserSearch query={query} following={following} maxResults={15} />
  ) : (
    <PostSearch
      sortBy={tab}
      maxResults={15}
      {...{
        query,
        following,
        from,
        to,
        minLikes,
        minReplies,
        reply,
        since,
        until,
      }}
    />
  );
}
