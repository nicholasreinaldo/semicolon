"use client";

import { ProfileEdit } from "./profile-edit";
import { followsAtom } from "@/lib/atom";
import { trpc } from "@/lib/trpc";
import type { PublicUserResolved } from "@semicolon/api/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@semicolon/ui/avatar";
import { Button } from "@semicolon/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@semicolon/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@semicolon/ui/tooltip";
import { useAtom } from "jotai";
import { BadgeCheck, CalendarDays, Link2, MapPin, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface ProfileCardProps extends PublicUserResolved {
  isOwner: boolean;
  followed: boolean;
}

const ProfileCard = (props: ProfileCardProps) => {
  const {
    name,
    username,
    bio,
    location,
    following,
    followers,
    header,
    image,
    createdAt,
    verified,
    website,
    isOwner,
    followed,
  } = props;
  const joinDate = `Joined ${createdAt.toLocaleString("en-US", { year: "numeric", month: "long" })}`;
  const [disableFollow, setDisableFollow] = useState(false);
  const [open, setOpen] = useState(false);
  const [follows, updateFollows] = useAtom(followsAtom);
  const utils = trpc.useUtils();

  useEffect(() => {
    if (follows[username] === undefined) {
      updateFollows((follows) => {
        follows[username] = followed;
      });
    }
  }, [follows, followed, username, updateFollows]);

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
    <div className="flex h-fit flex-col gap-5">
      <div className="bg-muted relative h-[200px] w-full">
        {header && (
          <Image
            className="object-cover"
            alt={`${name}'s header image`}
            fill
            src={header}
          />
        )}
      </div>

      <div className="flex flex-col justify-start gap-3">
        <div className="flex flex-col gap-3.5 px-5">
          <div className="flex flex-row justify-between">
            <Avatar className="bg-background -mt-20 h-[120px] w-[120px] rounded-full border-4 border-black object-cover">
              {image && <AvatarImage src={image} alt={`${name}'s avatar`} />}
              <AvatarFallback>
                <User size={65} />
              </AvatarFallback>
            </Avatar>

            {isOwner ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="min-w-[100px] rounded-full">
                    <span className="font-bold">Edit profile</span>
                  </Button>
                </DialogTrigger>
                <DialogContent
                  close={false}
                  className="max-h-[650px] overflow-y-auto p-0"
                >
                  <ProfileEdit {...props} />
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                className={`group min-w-[110px] cursor-pointer text-nowrap rounded-full font-bold text-black ${follows[username] ? "text-foreground hover:bg-destructive/15 hover:border-red-900" : "text-background"}`}
                disabled={disableFollow}
                variant={follows[username] ? "outline" : "default"}
                onClick={() =>
                  follows[username]
                    ? unfollowUser.mutate({ username })
                    : followUser.mutate({ username })
                }
              >
                {follows[username] ? (
                  <>
                    <p className="group-hover:hidden">Following</p>
                    <p className="hidden text-red-700 group-hover:block">
                      Unfollow
                    </p>
                  </>
                ) : (
                  <p className="text-black">Follow</p>
                )}
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="flex flex-row items-center gap-2 text-base font-bold">
                <p className="truncate">{name}</p>
                {verified && (
                  <BadgeCheck className="size-5 flex-none stroke-sky-400" />
                )}
              </span>
              <p
                id="username"
                className="text-username text-muted-foreground text-sm"
              >
                @{username}
              </p>
            </div>
          </div>

          {bio && <p className="text-sm leading-[26px]">{bio}</p>}

          <div className="flex flex-col gap-1 md:flex-row md:gap-5">
            {(location ?? website) && (
              <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:gap-5">
                {location && (
                  <div className="flex min-w-0 gap-1.5">
                    <MapPin className="stroke-muted-foreground h-[18px] w-[18px] flex-none" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-muted-foreground truncate text-sm">
                          {location}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{location}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
                {website && (
                  <div className="flex min-w-0 gap-1.5">
                    <Link2 className="stroke-muted-foreground h-[18px] w-[18px] flex-none" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          className="truncate text-sm text-sky-400 hover:underline"
                          href={website}
                        >
                          {website}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{website}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-1.5">
              <CalendarDays className="stroke-muted-foreground h-[18px] w-[18px] flex-none" />
              <p className="text-muted-foreground text-nowrap text-sm">
                {joinDate}
              </p>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="flex flex-row items-center gap-2">
              <span className="text-sm font-bold">{following}</span>
              <span className="text-muted-foreground text-sm">Following</span>
            </div>

            <div className="flex flex-row items-center gap-2">
              <span className="text-sm font-bold">{followers}</span>
              <span className="text-muted-foreground text-sm">Followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
