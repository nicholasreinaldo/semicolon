"use client";

import { followsAtom } from "@/lib/atom";
import { trpc } from "@/lib/trpc";
import { PublicUserResolved } from "@semicolon/api/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@semicolon/ui/avatar";
import { Button } from "@semicolon/ui/button";
import { useAtom } from "jotai";
import _ from "lodash";
import { BadgeCheck } from "lucide-react";
import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function UserCard({
  displayBio = true,
  variant = "normal",
  ...user
}: PublicUserResolved & {
  displayBio?: boolean;
  variant?: "normal" | "tight";
}) {
  const { username, image, verified, name, bio, followed } = user;
  const router = useRouter();
  const [follows, updateFollows] = useAtom(followsAtom);
  const [disableFollow, setDisableFollow] = useState(false);
  const utils = trpc.useUtils();

  useEffect(() => {
    if (follows[username] === undefined) {
      updateFollows((follows) => {
        follows[username] = followed;
      });
    }
  }, [username, follows, followed, updateFollows]);

  const followUser = trpc.user.follow.useMutation({
    onMutate: () => setDisableFollow(true),
    onSuccess: async () => {
      updateFollows((follows) => {
        follows[username] = true;
      });
      await utils.feed.following.invalidate();
      await utils.post.search.invalidate();
      await utils.user.search.invalidate();
    },
    onSettled: () => setDisableFollow(false),
  });

  const unfollowUser = trpc.user.unfollow.useMutation({
    onMutate: () => setDisableFollow(true),
    onSuccess: async () => {
      updateFollows((follows) => {
        follows[username] = false;
      });
      await utils.feed.following.invalidate();
      await utils.post.search.invalidate();
      await utils.user.search.invalidate();
    },
    onSettled: () => setDisableFollow(false),
  });

  return (
    <div
      className="flex min-w-full cursor-pointer flex-row items-center justify-between p-4 no-underline"
      tabIndex={0}
      onClick={() => {
        if (document.getSelection()?.type !== "Range") {
          utils.user.username.setData({ username }, user);
          router.push(`/${username}/`);
        }
      }}
      onKeyUp={(e) => {
        e.target === e.currentTarget && e.key === "Enter"
          ? router.push(`/${username}`)
          : null;
      }}
    >
      <div
        className={`flex min-w-0 flex-row items-center ${variant === "normal" ? "gap-2" : "gap-0"}`}
      >
        <Link
          href={`/${username}`}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Go to ${username}'s profile`}
          className="z-10"
        >
          <Avatar
            className={`${variant === "normal" ? "h-12 w-12" : "h-10 w-10"} rounded-full`}
          >
            {image && <AvatarImage src={image} alt={`${name}'s avatar`} />}
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="ml-2 flex min-w-0 flex-grow flex-col">
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-2">
              <Link
                href={`/${username}`}
                onClick={(e) => e.stopPropagation()}
                className="truncate font-bold hover:underline"
              >
                <p
                  className={`truncate font-bold ${variant === "normal" ? "text-base" : "text-sm"}`}
                >
                  {name}
                </p>
              </Link>
              {verified && (
                <BadgeCheck className="size-5 flex-none stroke-sky-400" />
              )}
            </div>
            <Link
              href={`/${username}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate font-bold"
            >
              <p
                className={`truncate ${variant === "normal" ? "text-sm" : "text-xs"} text-gray-500`}
              >
                @{username}
              </p>
            </Link>
          </div>
          {displayBio && (
            <div className="mt-2">
              {bio && <p className="text-[15px]">{bio}</p>}
            </div>
          )}
        </div>
      </div>
      <Button
        className={`group ml-2 w-full ${variant === "normal" ? "max-w-[110px]" : "h-9 max-w-[102px]"} flex-none cursor-pointer text-nowrap rounded-full font-bold text-black ${
          follows[username] ?? followed
            ? "text-foreground hover:bg-destructive/15 hover:border-red-900"
            : "text-background"
        }`}
        disabled={disableFollow}
        variant={follows[username] ?? followed ? "outline" : "default"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          follows[username] ?? followed
            ? unfollowUser.mutate({ username })
            : followUser.mutate({ username });
        }}
      >
        {follows[username] ?? followed ? (
          <>
            <p className="truncate group-hover:hidden">Following</p>
            <p className="hidden truncate text-red-700 group-hover:block">
              Unfollow
            </p>
          </>
        ) : (
          <p className="truncate text-black">Follow</p>
        )}
      </Button>
    </div>
  );
}
