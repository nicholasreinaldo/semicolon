import { followsAtom } from "@/lib/atom";
import { trpc } from "@/lib/trpc-client";
import { PublicUserResolved } from "@semicolon/api/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@semicolon/ui/avatar";
import { Button } from "@semicolon/ui/button";
import { useAtom } from "jotai";
import { User } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface UserListProps {
  users: PublicUserResolved[];
  loading: boolean;
  error: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  hasNextPage: boolean;
}

export function UserList({
  users,
  loading,
  error,
  fetchNextPage,
  refetch,
  hasNextPage,
}: UserListProps) {
  const [follows, updateFollows] = useAtom(followsAtom);
  const [disableFollow, setDisableFollow] = useState(false);
  const utils = trpc.useUtils();

  useEffect(() => {
    users.forEach((user) => {
      if (follows[user.username] === undefined) {
        updateFollows((follows) => {
          follows[user.username] = user.followed;
        });
      }
    });
  }, [users, follows, updateFollows]);

  const followUser = trpc.user.follow.useMutation({
    onMutate: () => setDisableFollow(true),
    onSuccess: async (data, variables) => {
      updateFollows((follows) => {
        follows[variables.username] = true;
      });
      await utils.feed.following.invalidate();
    },
    onSettled: () => setDisableFollow(false),
  });

  const unfollowUser = trpc.user.unfollow.useMutation({
    onMutate: () => setDisableFollow(true),
    onSuccess: async (data, variables) => {
      updateFollows((follows) => {
        follows[variables.username] = false;
      });
      await utils.feed.following.invalidate();
    },
    onSettled: () => setDisableFollow(false),
  });

  return (
    <div className="flex w-full flex-col items-center">
      {users.map((user) => (
        <Link
          key={user.id}
          href={`/${user.username}`}
          className="flex w-full max-w-full flex-row items-start p-4 no-underline"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className="h-12 w-12 rounded-full">
            {user.image ? (
              <AvatarImage
                width={300}
                height={300}
                src={user.image}
                alt={user.name}
              />
            ) : (
              <AvatarFallback>
                <User />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="ml-4 flex flex-grow flex-col">
            <div className="flex justify-between">
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
              <Button
                className={`group min-w-[110px] cursor-pointer text-nowrap rounded-full font-bold text-black ${
                  follows[user.username]
                    ? "text-foreground hover:bg-destructive/15 hover:border-red-900"
                    : "text-background"
                }`}
                disabled={disableFollow}
                variant={follows[user.username] ? "outline" : "default"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  follows[user.username]
                    ? unfollowUser.mutate({ username: user.username })
                    : followUser.mutate({ username: user.username });
                }}
              >
                {follows[user.username] ? (
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
            </div>
            <div className="mt-2">
              <p>{user.bio}</p>
            </div>
          </div>
        </Link>
      ))}
      {loading && <p>Loading...</p>}
      {error && <p>Error loading users.</p>}
      {hasNextPage && !loading && (
        <Button onClick={fetchNextPage} variant="outline" size="sm">
          Load more
        </Button>
      )}
    </div>
  );
}
