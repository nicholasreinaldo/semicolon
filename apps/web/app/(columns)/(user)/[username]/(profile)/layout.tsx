import { BackHeader } from "@/components/back-header";
import ProfileCard from "@/components/profile-card";
import ScrollTop from "@/components/scroll-top";
import { TabsList, TabsLink } from "@/components/tabs-link";
import { createCaller } from "@semicolon/api";
import { auth } from "@semicolon/auth";
import _ from "lodash";
import React from "react";

export default async function Page({
  params: { username },
  children,
}: {
  params: { username: string };
  children: React.ReactNode;
}) {
  const session = await auth();
  const caller = createCaller({ session });
  const user = await caller.user.username({ username });

  return (
    <div className="flex flex-col">
      {/* INSANE bug: 
      - https://github.com/vercel/next.js/discussions/64435#discussioncomment-9101547 
      - https://github.com/vercel/next.js/issues/64441 */}
      <ScrollTop />
      <BackHeader className="backdrop-blur-md">
        <article className="flex flex-col">
          <p className="text-xl font-semibold">{user.name}</p>
          <p className="text-muted-foreground text-xs">
            {`${new Intl.NumberFormat("en-US", {
              notation: "compact",
            }).format(user.posts)} posts`}
          </p>
        </article>
      </BackHeader>
      <ProfileCard
        {...user}
        isOwner={session?.user?.username === user.username}
      />
      <TabsList className="bg-background relative mt-1">
        <TabsLink href={`/${username}`}>Posts</TabsLink>
        <TabsLink href={`/${username}/replies`}>Replies</TabsLink>
        <TabsLink href={`/${username}/media`}>Media</TabsLink>
        <TabsLink href={`/${username}/likes`}>Likes</TabsLink>
      </TabsList>
      {children}
    </div>
  );
}
