import { PostForm } from "./post-form";
import { followsAtom } from "@/lib/atom";
import { myPostsAtom } from "@/lib/atom";
import { trpc } from "@/lib/trpc";
import { PostResolved } from "@semicolon/api/schema";
import { Button } from "@semicolon/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@semicolon/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@semicolon/ui/dropdown-menu";
import { useAtom } from "jotai";
import { useSetAtom } from "jotai";
import { Ellipsis, Flag, Pencil, Trash2, UserPlus, UserX } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

export function PostDropdown({
  username,
  id,
  isOwner = false,
  content,
  media,
  followed,
  ...props
}: Omit<React.HtmlHTMLAttributes<HTMLDivElement>, "content"> &
  PostResolved & { isOwner?: boolean }) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const { data: session } = useSession();
  const setMyPosts = useSetAtom(myPostsAtom);
  const utils = trpc.useUtils();
  const deletePost = trpc.post.delete.useMutation({
    onSuccess: async ({ parentId }, { id }) => {
      setMyPosts((myPosts) => myPosts.filter((post) => post.id !== id));
      await utils.post.search.invalidate();
      if (parentId) {
        await utils.post.replies.invalidate();
      }
      await utils.user.posts.invalidate({ username });
      await utils.user.replies.invalidate({ username });
    },
  });

  const [follows, updateFollows] = useAtom(followsAtom);

  useEffect(() => {
    if (follows[username] === undefined) {
      updateFollows((follows) => {
        follows[username] = followed;
      });
    }
  }, [follows, followed, username, updateFollows]);

  const followUser = trpc.user.follow.useMutation({
    onSuccess: async () => {
      updateFollows((follows) => {
        follows[username] = true;
      });
      await utils.feed.following.refetch();
    },
  });

  const unfollowUser = trpc.user.unfollow.useMutation({
    onSuccess: async () => {
      updateFollows((follows) => {
        follows[username] = false;
      });
      await utils.feed.following.refetch();
    },
  });

  return (
    <DropdownMenu
      open={openDropdown}
      onOpenChange={(open) => setOpenDropdown(open)}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="aspect-square size-fit rounded-full p-2"
        >
          <Ellipsis className="flex-none" size={19} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="flex flex-col gap-0 rounded-3xl px-0 py-2 [&>*]:min-w-44 [&>*]:text-sm [&>*]:font-black"
        onClick={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
        {...props}
      >
        {isOwner ? (
          <>
            <DropdownMenuItem
              className="cursor-pointer justify-start gap-4 rounded-none px-4 py-4"
              onSelect={() => deletePost.mutate({ id })}
            >
              <Trash2 size={20} className="stroke-destructive" />
              <div className="text-destructive">Delete</div>
            </DropdownMenuItem>
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="cursor-pointer justify-start gap-4 rounded-none px-4 py-4"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Pencil size={20} />
                  <div>Edit post</div>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent onClick={(e) => e.stopPropagation()}>
                <PostForm
                  avatar={session?.user?.image}
                  className="min-h-[230px]"
                  onPost={() => {
                    setOpenEdit(false);
                    setOpenDropdown(false);
                  }}
                  editData={{
                    id,
                    content: content ?? undefined,
                    media,
                  }}
                />
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <DropdownMenuItem
              className="cursor-pointer justify-start gap-4 rounded-none px-4 py-4"
              onSelect={() =>
                follows[username]
                  ? unfollowUser.mutate({ username })
                  : followUser.mutate({ username })
              }
            >
              {follows[username] ? (
                <>
                  <UserX size={20} />
                  <div>Unfollow {`@${username}`}</div>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  {<div>Follow {`@${username}`}</div>}{" "}
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer justify-start gap-4 rounded-none px-4 py-4">
              <Flag size={20} />
              <div>Report post</div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
