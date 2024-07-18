import { BackHeader } from "@/components/back-header";
import { SearchBar } from "@/components/search-bar";
import { TabsList, TabsLink } from "@/components/tabs-link";
import { Button } from "@semicolon/ui/button";
import { Ellipsis } from "lucide-react";
import React from "react";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-card sticky top-0 z-40 flex w-full min-w-[257px] flex-col gap-1 md:max-w-[650px]">
      <BackHeader className="flex flex-row px-3">
        <SearchBar />
        <Button
          variant="ghost"
          size="icon"
          className="aspect-square size-fit rounded-full p-2"
        >
          <Ellipsis className="flex-none" size={19} />
        </Button>
      </BackHeader>
      <TabsList className="bg-background relative mt-1">
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
      {children}
    </div>
  );
}
