import UserCard from "./user-card";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { PublicUserResolved } from "@semicolon/api/schema";
import { Alert, AlertDescription, AlertTitle } from "@semicolon/ui/alert";
import { Button } from "@semicolon/ui/button";
import Spinner from "@semicolon/ui/spinner";
import _ from "lodash";
import { RotateCw } from "lucide-react";
import React from "react";
import { InView } from "react-intersection-observer";

export function UserList({
  users,
  loading,
  error,
  fetchNextPage,
  refetch,
  hasNextPage,
}: {
  users: PublicUserResolved[];
  loading: boolean;
  error: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
  refetch: () => Promise<unknown>;
}) {
  return (
    <div className="flex w-full flex-col items-center">
      {users.map((user) => (
        <UserCard key={user.id} {...user} />
      ))}
      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <Spinner size={30} />
        </div>
      ) : error ? (
        <div className="border-destructive m-5 flex flex-grow flex-row items-center justify-between rounded-lg border p-0">
          <Alert variant="destructive" className="border-none">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There was a problem fetching users.
            </AlertDescription>
          </Alert>
          <Button
            size={"icon"}
            variant={"ghost"}
            className="hover:bg-destructive/30 mr-4 aspect-square rounded-full"
            onClick={async () => refetch()}
          >
            <RotateCw className="stroke-destructive" />
          </Button>
        </div>
      ) : hasNextPage ? (
        <InView
          as="div"
          threshold={0.9}
          onChange={async (inView, _) => {
            if (inView) {
              await fetchNextPage();
            }
          }}
        >
          <div className="flex h-20 flex-row items-center justify-center" />
        </InView>
      ) : undefined}
    </div>
  );
}
