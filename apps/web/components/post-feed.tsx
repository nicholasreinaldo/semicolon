"use client";

import { Post } from "@/components/post";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import type { PostResolved } from "@semicolon/api/schema";
import { Alert, AlertDescription, AlertTitle } from "@semicolon/ui/alert";
import { AspectRatio } from "@semicolon/ui/aspect-ratio";
import { Button } from "@semicolon/ui/button";
import { Separator } from "@semicolon/ui/separator";
import Spinner from "@semicolon/ui/spinner";
import _ from "lodash";
import { RotateCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment } from "react";
import { InView } from "react-intersection-observer";

export function PostFeed({
  posts,
  loading,
  error,
  fetchNextPage,
  refetch,
  hasNextPage,
  indicateReply = true,
  media = false,
}: {
  posts: PostResolved[];
  indicateReply?: boolean;
  loading: boolean;
  error: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
  refetch: () => Promise<unknown>;
  media?: boolean;
}) {
  return (
    <>
      {!media ? (
        <div className="flex flex-col">
          {posts.map((post) => (
            <Fragment key={post.id}>
              <Post {...post} indicateReply={indicateReply} />
              <Separator />
            </Fragment>
          ))}
        </div>
      ) : (
        posts.length > 0 && (
          <div className="grid grid-cols-1 gap-1 p-1 sm:grid-cols-2 md:grid-cols-3">
            {posts.map(({ id, media, username }, i) => (
              <Link
                key={id}
                href={`/${username}/post/${id}/photo/1`}
                scroll={false}
              >
                <AspectRatio ratio={1} className="bg-muted">
                  <Image
                    src={media[0]!}
                    alt={`${username}'s image (${i})`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 45vw, 15vw"
                    className="object-cover"
                  />
                </AspectRatio>
              </Link>
            ))}
          </div>
        )
      )}
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
              There was a problem fetching your posts.
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
    </>
  );
}
