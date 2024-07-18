import { PostActions } from "./post-actions";
import { PostDropdown } from "./post-dropdown";
import { ThumbGrid } from "./thumb-grid";
import { trpc } from "@/lib/trpc";
import { formatLongDate, formatShortDate } from "@/lib/utils";
import type { PostResolved } from "@semicolon/api/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@semicolon/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@semicolon/ui/tooltip";
import { BadgeCheck, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export function Post({
  indicateReply = true,
  ...initialData
}: PostResolved & { indicateReply?: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: post } = trpc.post.id.useQuery(
    { id: initialData.id },
    {
      initialData,
      staleTime: 5000,
    },
  );

  const {
    id,
    name,
    avatar,
    username,
    verified,
    createdAt,
    content,
    media,
    to,
  } = post;

  return (
    <div
      className="relative flex w-full cursor-pointer flex-row gap-3 p-4 pb-2"
      tabIndex={0}
      onClick={() => {
        if (document.getSelection()?.type !== "Range") {
          utils.post.id.setData({ id }, post);
          router.push(`/${username}/post/${id}`);
        }
      }}
      onKeyUp={(e) => {
        e.key === "Enter" ? router.push(`/${username}/post/${id}`) : null;
      }}
    >
      <div className="pt-2">
        <Link
          href={`/${username}`}
          onClick={(e) => e.stopPropagation()}
          className="z-10"
        >
          <Avatar className="size-11">
            {avatar && <AvatarImage width={300} height={300} src={avatar} />}
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
      <div className="flex w-full min-w-0 flex-col gap-2">
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex w-full min-w-0 flex-col items-start justify-start gap-0 sm:flex-row sm:items-center sm:gap-2">
              <div className="flex min-w-0 max-w-full gap-1">
                <div className="flex min-w-0 flex-row items-center gap-1 text-sm">
                  <Link
                    href={`/${username}`}
                    className="truncate font-bold hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {name}
                  </Link>
                  {verified && (
                    <BadgeCheck className="size-5 flex-none stroke-sky-400" />
                  )}
                </div>
              </div>
              <div className="flex min-w-0 max-w-full flex-row items-center gap-1">
                <Link
                  className="text-muted-foreground truncate align-middle text-sm"
                  href={`/${username}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  @{username}
                </Link>
                <p className="text-muted-foreground align-middle text-sm">•</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/${username}/post/${id}`}
                      className="text-muted-foreground text-nowrap align-middle text-sm hover:underline"
                      onClick={(e) => {
                        utils.post.id.setData({ id }, post);
                        e.stopPropagation();
                      }}
                    >
                      {formatShortDate(createdAt)}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{formatLongDate(createdAt)}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <PostDropdown
              {...post}
              isOwner={session?.user?.name === post.name}
            />
          </div>
          {to && indicateReply && (
            <p className="text-sm">
              <span className="text-muted-foreground">Replying to</span>{" "}
              <Link
                href={`/${to}`}
                className="truncate font-bold text-sky-400 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                @{to}
              </Link>
            </p>
          )}
          <p className="whitespace-pre text-wrap text-[15px] leading-7">
            {content}
          </p>
        </div>

        {media.length > 0 && <ThumbGrid {...post} />}

        <PostActions {...post} />
      </div>
    </div>
  );
}
