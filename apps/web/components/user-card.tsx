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

export default function UserCard(user: PublicUserResolved) {
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
    },
    onSettled: () => setDisableFollow(false),
  });

  return (
    <div
      className="flex w-full max-w-full cursor-pointer flex-row items-center p-4 no-underline"
      tabIndex={0}
      onClick={() => {
        if (document.getSelection()?.type !== "Range") {
          utils.user.username.setData({ username }, user);
          router.push(`/${username}/`);
        }
      }}
      onKeyUp={(e) => {
        e.key === "Enter" ? router.push(`/${username}`) : null;
      }}
    >
      <Link
        href={`/${username}`}
        onClick={(e) => e.stopPropagation()}
        className="z-10"
      >
        <Avatar className="h-12 w-12 rounded-full">
          {image && <AvatarImage width={300} height={300} src={image} />}
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="ml-4 flex flex-grow flex-col">
        <div className="flex">
          <div>
            <div className="flex flex-row items-center gap-2">
              <Link
                href={`/${username}`}
                onClick={(e) => e.stopPropagation()}
                className="truncate font-bold hover:underline"
              >
                <p className="font-bold">{name}</p>
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
              <p className="text-sm text-gray-500">@{username}</p>
            </Link>
          </div>
        </div>
        <div className="mt-2">
          {bio && <p className="text-[15px]">{bio}</p>}
        </div>
      </div>
      <Button
        className={`group min-w-[110px] cursor-pointer text-nowrap rounded-full font-bold text-black ${
          follows[username]
            ? "text-foreground hover:bg-destructive/15 hover:border-red-900"
            : "text-background"
        }`}
        disabled={disableFollow}
        variant={follows[username] ? "outline" : "default"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          follows[username]
            ? unfollowUser.mutate({ username })
            : followUser.mutate({ username });
        }}
      >
        {follows[username] ? (
          <>
            <p className="group-hover:hidden">Following</p>
            <p className="hidden text-red-700 group-hover:block">Unfollow</p>
          </>
        ) : (
          <p className="text-black">Follow</p>
        )}
      </Button>
    </div>
  );
}
