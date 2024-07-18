import { followsAtom } from "@/lib/atom";
import { PublicUserResolved } from "@semicolon/api/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@semicolon/ui/avatar";
import { Button } from "@semicolon/ui/button";
import { User } from "lucide-react";
import React from "react";

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
  return (
    <div className="flex w-full flex-col items-center">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex w-full max-w-full flex-row items-start p-4"
        >
          <Avatar className="size-11">
            <AvatarImage width={300} height={300} src={user.avatar} />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 flex flex-grow flex-col">
            <div className="flex justify-between">
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
              <Button
                type="submit"
                className="cursor-pointer rounded-full font-bold text-black"
              >
                Follow
              </Button>
            </div>
            <div className="mt-2">
              <p>{user.bio}</p>
            </div>
          </div>
        </div>
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
