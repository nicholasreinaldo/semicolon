import { PostButton } from "./post-button";
import { PostForm } from "./post-form";
import { trpc } from "@/lib/trpc";
import { formatLongDate, formatShortDate } from "@/lib/utils";
import type { PostResolved } from "@semicolon/api/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@semicolon/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@semicolon/ui/dialog";
import { Separator } from "@semicolon/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@semicolon/ui/tooltip";
import {
  BadgeCheck,
  BarChart2,
  Bookmark,
  Heart,
  MessageCircle,
  Repeat2,
  Upload,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

function ReplyIndicator({
  name,
  avatar,
  username,
  verified,
  createdAt,
  content,
}: PostResolved) {
  return (
    <div className="relative flex w-full flex-row gap-3 p-3 pb-2">
      <div className="flex flex-col items-center pt-2">
        <Avatar className="size-11">
          {avatar && <AvatarImage width={300} height={300} src={avatar} />}
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
        <Separator orientation="vertical" className="shrink border-2" />
      </div>
      <div className="flex w-full min-w-0 flex-col gap-2">
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex w-full min-w-0 flex-col items-start justify-start gap-2 sm:flex-row sm:items-center">
              <div className="flex min-w-0 max-w-full gap-1">
                <div className="flex min-w-0 flex-row items-center gap-1 text-sm">
                  <p className="truncate font-bold">{name}</p>
                  {verified && (
                    <BadgeCheck className="size-5 flex-none stroke-sky-400" />
                  )}
                </div>
              </div>
              <div className="flex min-w-0 max-w-full flex-row items-center gap-1">
                <p className="text-muted-foreground truncate align-middle text-sm">
                  @{username}
                </p>
                <p className="text-muted-foreground align-middle text-sm">•</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-muted-foreground text-nowrap align-middle text-sm">
                      {formatShortDate(createdAt)}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{formatLongDate(createdAt)}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <p className="text-wrap text-sm leading-7">{content}</p>
          <p className="mt-3 text-[15px]">
            Replying to <span className="text-sky-400">@{username}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function PostActions({
  variant = "normal",
  ...initialData
}: PostResolved & { variant?: "normal" | "detail" }) {
  const { data: session } = useSession();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);

  const { data: post } = trpc.post.id.useQuery(
    { id: initialData.id },
    {
      initialData,
      staleTime: 5000,
    },
  );

  const { replyCount, id, views, likeCount, liked } = post;

  const likePost = trpc.post.like.useMutation({
    onMutate: () =>
      utils.post.id.setData(
        { id },
        {
          ...post,
          likeCount: post.likeCount + 1,
          liked: true,
        },
      ),
    onSuccess: () => utils.user.likes.invalidate(),
    onError: () =>
      utils.post.id.setData(
        { id },
        {
          ...post,
          likeCount: post.likeCount - 1,
          liked: false,
        },
      ),
  });
  const unlikePost = trpc.post.unlike.useMutation({
    onMutate: () =>
      utils.post.id.setData(
        { id },
        {
          ...post,
          likeCount: post.likeCount - 1,
          liked: false,
        },
      ),
    onSuccess: () => utils.user.likes.invalidate(),
    onError: () =>
      utils.post.id.setData(
        { id },
        {
          ...post,
          likeCount: post.likeCount + 1,
          liked: true,
        },
      ),
  });

  return (
    <div className="flex w-full min-w-0 items-center justify-between">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <PostButton
            icon={MessageCircle}
            label={replyCount}
            iconSize={variant === "normal" ? "small" : "big"}
          />
        </DialogTrigger>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col">
            <ReplyIndicator {...initialData} />
            <PostForm
              to={id}
              placeholder="Post your reply"
              avatar={session?.user?.image}
              className="pt-0"
              onPost={() => setOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
      <PostButton
        icon={Repeat2}
        highlight="green"
        label={0}
        iconSize={variant === "normal" ? "small" : "big"}
      />
      <PostButton
        icon={Heart}
        highlight="pink"
        active={liked}
        iconSize={variant === "normal" ? "small" : "big"}
        label={new Intl.NumberFormat("en-US", {
          notation: "compact",
        }).format(likeCount)}
        onClick={() =>
          liked ? unlikePost.mutate({ id }) : likePost.mutate({ id })
        }
      />
      {variant === "normal" && (
        <PostButton
          icon={BarChart2}
          label={new Intl.NumberFormat("en-US", {
            notation: "compact",
          }).format(views)}
        />
      )}
      {variant === "normal" ? (
        <div className="hidden flex-row min-[300px]:flex">
          <PostButton icon={Bookmark} className="hidden min-[350px]:block" />
          <PostButton icon={Upload} />
        </div>
      ) : (
        <>
          <PostButton icon={Bookmark} label={0} />
          <PostButton icon={Upload} />
        </>
      )}
    </div>
  );
}
