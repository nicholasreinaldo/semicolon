"use client";

import { uploadMedia } from "@/lib/actions";
import { myPostsAtom } from "@/lib/atom";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PostResolved } from "@semicolon/api/schema";
import { AspectRatio } from "@semicolon/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@semicolon/ui/avatar";
import { Button } from "@semicolon/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@semicolon/ui/carousel";
import { FormField, FormItem, FormControl, Form } from "@semicolon/ui/form";
import Spinner from "@semicolon/ui/spinner";
import { Textarea } from "@semicolon/ui/textarea";
import { cn } from "@semicolon/ui/utils";
import { useAtom } from "jotai";
import _ from "lodash";
import { Smile, User, Image as ImageIcon, RotateCw, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useImmer } from "use-immer";
import { z } from "zod";

const PostSchema = z.object({
  content: z.string().optional(),
});

export function PostForm({
  className,
  avatar,
  placeholder = "What is happening?!",
  to,
  onPost,
  editData,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  to?: string;
  avatar?: string | null;
  placeholder?: string;
  editData?: { id: string; content?: string; media?: string[] };
  onPost?: (post: PostResolved) => unknown;
}) {
  const utils = trpc.useUtils();

  const postEdit = trpc.post.update.useMutation({
    onMutate: () => setSubmitDisabled(true),
    onError: () => setSubmitDisabled(false),
    onSuccess: async (data) => {
      setMyPosts((myPosts) => {
        const i = myPosts.findIndex(({ id }) => id === data.id);
        if (i !== -1) {
          myPosts[i] = data;
        }
      });
      utils.post.id.setData({ id: data.id }, data);
      await onPost?.(data);
    },
  });

  const postNew = trpc.post.new.useMutation({
    onMutate: () => setSubmitDisabled(true),
    onError: () => setSubmitDisabled(false),
    onSuccess: async (data) => {
      form.reset();
      if (mediaInputRef.current) {
        mediaInputRef.current.value = "";
      }
      updateMedia({});
      setMyPosts([data, ...myPosts]);
      await utils.user.posts.invalidate({ username: data.username });
      await utils.user.replies.invalidate({ username: data.username });
      await onPost?.(data);
    },
  });

  const form = useForm<z.infer<typeof PostSchema>>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      content: editData?.content ?? "",
    },
  });

  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const [media, updateMedia] = useImmer<
    Record<
      string,
      { file: File; status: "uploading" | "success" | "failed"; url?: string }
    >
  >(
    editData?.media
      ? editData.media.reduce(
          (o, m) => ({
            ...o,
            [m]: {
              file: new File([""], ""), // A fake File object should be fine for now, because a retry will never be triggered
              status: "success",
              url: m,
            },
          }),
          {},
        )
      : {},
  );
  const [content, setContent] = useState<string | undefined>();
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(true);
  const [mediaDisabled, setMediaDisabled] = useState<boolean>(true);
  const [myPosts, setMyPosts] = useAtom(myPostsAtom);

  useEffect(() => {
    const subscription = form.watch(({ content }) => {
      setContent(content);
    });
    return () => subscription.unsubscribe();
  }, [form, form.watch]);

  useEffect(() => {
    if (editData?.content) {
      setContent(editData.content);
    }
  }, [editData]);

  useEffect(() => {
    if (Object.keys(media).length > 0) {
      setSubmitDisabled(
        Object.entries(media).some(([_, { status }]) => status !== "success"),
      );
    } else {
      setSubmitDisabled(!!!content);
    }
  }, [content, media]);

  useEffect(() => {
    setMediaDisabled(Object.keys(media).length > 3);
  }, [media]);

  const handleSubmit = !editData
    ? ({ content }: z.infer<typeof PostSchema>) => {
        postNew.mutate({
          to,
          content,
          media: Object.entries(media)
            .map(([_, { url }]) => url)
            .filter((v): v is string => v !== undefined),
        });
      }
    : ({ content }: z.infer<typeof PostSchema>) => {
        postEdit.mutate({
          id: editData.id,
          content,
          media: Object.entries(media)
            .map(([_, { url }]) => url)
            .filter((v): v is string => v !== undefined),
        });
      };

  return (
    <div
      className={cn("flex w-full flex-row gap-3 p-3 pr-5", className)}
      {...props}
    >
      <div className="pt-2">
        <Avatar className="size-11">
          <AvatarImage src={avatar ?? undefined} alt="User's avatar" />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      </div>

      <input
        ref={mediaInputRef}
        disabled={mediaDisabled}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        multiple
        onChange={async (e) => {
          await Promise.allSettled(
            [...(e.currentTarget.files ?? [])].map(async (file) => {
              const blobUrl = URL.createObjectURL(file);

              updateMedia((media) => {
                media[blobUrl] = {
                  file,
                  status: "uploading",
                };
              });

              const form = new FormData();
              form.set("media", file);
              const result = await uploadMedia(form);

              updateMedia((media) => {
                const target = media[blobUrl];
                if (target) {
                  target.status = result ? "success" : "failed";
                  target.url = result ? result.url : undefined;
                }
              });
            }),
          );
        }}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex w-full flex-col justify-between gap-3"
        >
          <FormField
            name="content"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full flex-grow">
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={placeholder}
                    className="max-h-[350px] min-h-[80px] w-full resize-none border-none p-2 text-lg text-white placeholder:text-lg focus-visible:outline-none focus-visible:ring-0"
                    maxLength={200}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {Object.keys(media).length > 0 && (
            <Carousel
              opts={{ align: "end", startIndex: Object.keys(media).length }}
            >
              <CarouselContent>
                {Object.entries(media).map(([blobUrl, { status, file }], i) => (
                  <CarouselItem
                    className={Object.keys(media).length > 1 ? "basis-1/2" : ""}
                    key={i}
                  >
                    <div className="relative">
                      <AspectRatio
                        ratio={Object.keys(media).length > 1 ? 4 / 5 : 1}
                      >
                        <Image
                          src={blobUrl}
                          alt={`Media upload preview (${i})`}
                          className={`rounded-lg ${status !== "success" ? "brightness-50" : ""} object-cover`}
                          fill
                        />
                      </AspectRatio>

                      {status === "uploading" && (
                        <Spinner className="absolute inset-0 m-auto block" />
                      )}
                      {status === "failed" && (
                        <div className="absolute inset-0 m-auto flex size-fit flex-col items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-background/50 hover:bg-background/80 rounded-full"
                            aria-label="Retry media upload"
                            onClick={async (e) => {
                              e.preventDefault();
                              updateMedia((media) => {
                                const target = media[blobUrl];
                                if (target) {
                                  target.status = "uploading";
                                }
                              });

                              const form = new FormData();
                              form.set("media", file);
                              const result = await uploadMedia(form);

                              updateMedia((media) => {
                                const target = media[blobUrl];
                                if (target) {
                                  target.status = result ? "success" : "failed";
                                  target.url = result ? result.url : undefined;
                                }
                              });
                            }}
                          >
                            <RotateCw />
                          </Button>
                          <p className="font-black text-red-400">Error</p>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete media"
                        className="bg-background/50 hover:bg-background/80 absolute right-3 top-3 rounded-full"
                        onClick={(e) => {
                          e.preventDefault();
                          updateMedia(_.omit(media, blobUrl));
                        }}
                      >
                        <X />
                      </Button>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {Object.keys(media).length > 2 && (
                <>
                  <CarouselPrevious className="hover:bg-background left-3 top-1/2 -translate-y-1/2 opacity-45 transition-opacity hover:opacity-85 disabled:opacity-10" />
                  <CarouselNext className="hover:bg-background right-3 top-1/2 -translate-y-1/2 opacity-45 transition-opacity hover:opacity-85 disabled:opacity-10" />
                </>
              )}
            </Carousel>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center justify-center gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-sky-400/10"
                aria-label="Add emoji"
                onClick={(e) => e.preventDefault()}
              >
                <Smile className="stroke-sky-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="m-0 rounded-full hover:bg-sky-400/10"
                disabled={mediaDisabled}
                aria-label="Upload media"
                onClick={(e) => {
                  e.preventDefault();
                  mediaInputRef.current?.click();
                }}
              >
                <ImageIcon className="stroke-sky-400" />
              </Button>
            </div>

            <Button
              type="submit"
              className="text-foreground w-fit max-w-36 cursor-pointer rounded-full bg-sky-500 px-6 font-bold hover:bg-sky-600"
              disabled={submitDisabled}
            >
              <p className="text-base font-bold">
                {editData ? "Update" : "Post"}
              </p>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
