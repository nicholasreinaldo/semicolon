"use client";

import { PostButton } from "@/components/post-button";
import { PostDetail } from "@/components/post-detail";
import { PostFeed } from "@/components/post-feed";
import { PostForm } from "@/components/post-form";
import { myPostsAtom } from "@/lib/atom";
import { trpc } from "@/lib/trpc";
import * as Dialog from "@radix-ui/react-dialog";
import type { PostResolved } from "@semicolon/api/schema";
import { Button } from "@semicolon/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@semicolon/ui/carousel";
import { ScrollArea } from "@semicolon/ui/scroll-area";
import { Separator } from "@semicolon/ui/separator";
import Spinner from "@semicolon/ui/spinner";
import { useAtomValue } from "jotai";
import _ from "lodash";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Repeat2,
  Upload,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Page({
  params: { username, id, num },
}: {
  params: { username: string; id: string; num: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [api, setApi] = React.useState<CarouselApi>();
  const { data: post } = trpc.post.id.useQuery({ id });
  const {
    data: replies,
    fetchNextPage,
    isLoading,
    isLoadingError,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
    hasNextPage,
  } = trpc.post.replies.useInfiniteQuery(
    { id, maxResults: 15 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const [repliesCustom, setRepliesCustom] = useState<PostResolved[]>([]);
  const myPosts = useAtomValue(myPostsAtom);

  useEffect(() => {
    // We need to filter twice because our query result is not necessarily up-to-date
    const myReplies = myPosts.filter((post) => post.parentId === id);

    setRepliesCustom(
      myReplies.concat(
        replies
          ? replies.pages
              .flatMap((page) => page.replies)
              .filter((reply) => !myReplies.find((r) => r.id === reply.id))
          : [],
      ),
    );
  }, [id, myPosts, replies]);

  const [startIndex, setStartIndex] = useState(() => {
    const int = parseInt(num);
    if (isNaN(int)) {
      return 0;
    } else {
      return _.clamp(int - 1, 0, 3);
    }
  });
  const [initialStartIndex] = useState(() => startIndex);

  useEffect(() => {
    if (!api) {
      return;
    }
    api.on("select", () => {
      setStartIndex(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      `/${username}/post/${id}/photo/${startIndex + 1}`,
    );
  }, [username, id, startIndex]);

  if (!post) {
    return (
      <Dialog.Root defaultOpen={true}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
          <Dialog.Content
            className="fixed inset-0 z-50 flex h-screen flex-row items-center justify-center"
            onEscapeKeyDown={() => router.back()}
            onPointerDownOutside={() => router.back()}
          >
            <Spinner />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  const { replyCount, likeCount, name } = post;

  return (
    <Dialog.Root defaultOpen={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex h-screen flex-row items-center justify-stretch"
          onEscapeKeyDown={() => router.back()}
          onPointerDownOutside={() => router.back()}
        >
          <div className="flex h-full flex-grow flex-col justify-between">
            <div className="flex flex-grow flex-col">
              <Carousel
                opts={{ startIndex: initialStartIndex }}
                setApi={setApi}
                className="my-auto h-full [&>*:first-child]:h-full"
              >
                <CarouselContent className="-ml-0 h-full">
                  {post.media.map((media, i) => (
                    <CarouselItem
                      key={i}
                      className="relative h-full pl-0 [&>*]:max-h-full"
                    >
                      <Image
                        src={media}
                        alt={`${name}'s post media (${i + 1})`}
                        sizes="(max-width: 1024px) 100vw, 75vw"
                        className="my-auto min-w-0 object-contain"
                        fill
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-5 top-1/2 h-11 w-11 -translate-y-1/2 [&>*]:h-5 [&>*]:w-5" />
                <CarouselNext className="right-5 top-1/2 h-11 w-11 -translate-y-1/2 [&>*]:h-5 [&>*]:w-5" />
              </Carousel>
            </div>
            <div className="flex h-14 w-full max-w-[600px] flex-none flex-row justify-between self-center px-5 sm:px-16">
              <PostButton
                icon={MessageCircle}
                iconSize="big"
                label={replyCount}
              />
              <PostButton
                icon={Repeat2}
                iconSize="big"
                highlight="green"
                label={15}
              />
              <PostButton
                icon={Heart}
                iconSize="big"
                highlight="pink"
                label={likeCount}
              />
              <PostButton icon={Bookmark} iconSize="big" label={15} />
              <PostButton icon={Upload} />
            </div>
          </div>
          <Separator orientation="vertical" />
          <ScrollArea className="bg-background h-full">
            <div className="hidden h-full w-[350px] flex-none flex-col py-4 lg:flex">
              <PostDetail showMedia={false} {...post} />
              <PostForm
                to={id}
                avatar={session?.user?.image}
                placeholder="Post your reply"
              />
              <Separator />
              <PostFeed
                posts={repliesCustom}
                loading={isLoading || isFetchingNextPage}
                error={isLoadingError || isFetchNextPageError}
                fetchNextPage={fetchNextPage}
                refetch={refetch}
                hasNextPage={hasNextPage}
                indicateReply={false}
              />
            </div>
          </ScrollArea>
          <Button
            className="bg-background/50 hover:bg-background/80 fixed left-5 top-5 rounded-full"
            size="icon"
            variant="ghost"
            onClick={() => router.back()}
          >
            <X />
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
