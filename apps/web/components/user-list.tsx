import { PublicUserResolved } from "@semicolon/api/schema";
import { Button } from "@semicolon/ui/button";
import { Separator } from "@semicolon/ui/separator";
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
    <div className="flex flex-col items-center">
      {users.map((user) => (
        <div key={user.id} className="flex flex-row items-center gap-4 p-4">
          <img
            src={user.avatar}
            alt={`${user.username}'s profile picture`}
            className="h-12 w-12 rounded-full"
          />
          <div className="flex flex-col">
            <p className="font-bold">{user.username}</p>
            <p className="text-sm text-gray-500">{user.name}</p>
          </div>
          <Button variant="outline" size="sm">
            Follow
          </Button>
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
