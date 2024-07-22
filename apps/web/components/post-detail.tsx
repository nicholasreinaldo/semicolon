import { PostActions } from "./post-actions";
import { PostDropdown } from "./post-dropdown";
import { ThumbGrid } from "./thumb-grid";
import { trpc } from "@/lib/trpc";
import { formatLongDate } from "@/lib/utils";
import type { PostResolved } from "@semicolon/api/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@semicolon/ui/avatar";
import { Separator } from "@semicolon/ui/separator";
import { User } from "lucide-react";
import Link from "next/link";

export function PostDetail({
  showMedia = true,
  ...initialData
}: PostResolved & { showMedia?: boolean }) {
  const { data: post } = trpc.post.id.useQuery(
    { id: initialData.id },
    {
      initialData,
      staleTime: 5000,
    },
  );

  const { name, avatar, username, createdAt, content, views, media, id } = post;

  return (
    <div className="flex flex-col gap-3 px-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-3">
          <Link
            href={`/${username}`}
            className="hover:underline"
            aria-label="Go to user's profile"
          >
            <Avatar className="size-11">
              {avatar && <AvatarImage src={avatar} alt={`${name}'s avatar`} />}
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/${username}`} className="hover:underline">
                  <h4 className="text-md font-semibold">{name}</h4>
                </Link>
                <Link href={`/${username}`}>
                  <p className="text-sm text-zinc-500">@{username}</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <PostDropdown {...post} />
      </div>
      <p>{content}</p>
      {showMedia && media.length > 0 && <ThumbGrid {...post} />}
      <div className="flex flex-row items-center gap-1">
        <div className="text-sm text-zinc-500">
          <Link href={`/${username}/post/${id}`} className="hover:underline">
            {formatLongDate(createdAt)}
          </Link>
          {" · "}
          <b className="text-foreground text-base font-extrabold">
            {new Intl.NumberFormat("en-US", { notation: "compact" }).format(
              views,
            )}{" "}
          </b>
          views
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Separator />
        <PostActions {...post} variant="detail" />
        <Separator />
      </div>
    </div>
  );
}
