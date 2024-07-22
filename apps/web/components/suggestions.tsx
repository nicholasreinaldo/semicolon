import UserCard from "./user-card";
import { createCaller } from "@semicolon/api";
import { auth } from "@semicolon/auth";
import { Card, CardContent, CardFooter, CardHeader } from "@semicolon/ui/card";
import Link from "next/link";
import React from "react";

export async function Suggestions() {
  const session = await auth();
  const caller = createCaller({ session });
  const { users } = await caller.feed.user({ maxResults: 3 });

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-1 pt-4 text-lg font-black">
        Who to follow
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col">
          {users.map((user) => (
            <UserCard
              key={user.id}
              displayBio={false}
              variant="tight"
              {...user}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter className="mt-3">
        <Link href="#" className="text-sm text-sky-400 hover:underline">
          Show more
        </Link>
      </CardFooter>
    </Card>
  );
}
