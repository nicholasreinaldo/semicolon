"use client";

import { BackHeader } from "@/components/back-header";
import { SearchBar } from "@/components/search-bar";
import { SearchDropdown } from "@/components/search-dropdown";
import { TabsList, TabsLink } from "@/components/tabs-link";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const searchParams = useSearchParams();

  return (
    <div className="relative z-0 flex w-full flex-col">
      <div className="sticky top-0 z-10 flex flex-col backdrop-blur-md">
        <BackHeader className="flex flex-row px-3">
          <SearchBar />
          <SearchDropdown />
        </BackHeader>
        <TabsList className="relative">
          <TabsLink href="/search" query={{ f: null }}>
            Relevance
          </TabsLink>
          <TabsLink href="/search" query={{ f: "latest" }}>
            Latest
          </TabsLink>
          <TabsLink href="/search" query={{ f: "people" }}>
            People
          </TabsLink>
        </TabsList>
      </div>
      <Suspense key={searchParams.toString()}>{children}</Suspense>
    </div>
  );
}
