"use client";

import { uploadMedia } from "@/lib/actions";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublicUserResolved } from "@semicolon/api/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@semicolon/ui/avatar";
import { Button } from "@semicolon/ui/button";
import { Calendar } from "@semicolon/ui/calendar";
import { DialogClose } from "@semicolon/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@semicolon/ui/form";
import { Input } from "@semicolon/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@semicolon/ui/popover";
import Spinner from "@semicolon/ui/spinner";
import { Textarea } from "@semicolon/ui/textarea";
import { cn } from "@semicolon/ui/utils";
import { CalendarIcon, ImagePlus, RotateCw, User, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useImmer } from "use-immer";
import { z } from "zod";

const FormSchema = z.object({
  name: z.string().min(2).max(50),
  bio: z.preprocess(
    (value) =>
      typeof value === "string" && value.length === 0 ? undefined : value,
    z.string().optional(),
  ),
  location: z.preprocess(
    (value) =>
      typeof value === "string" && value.length === 0 ? undefined : value,
    z.string().optional(),
  ),
  website: z.preprocess(
    (value) =>
      typeof value === "string" && value.length === 0 ? undefined : value,
    z.string().url().optional(),
  ),
  birthday: z.date(),
});

export function ProfileEdit({
  username,
  name,
  bio,
  location,
  website,
  birthday,
  image: initialAvatar,
  header: initialHeaderArg,
}: PublicUserResolved) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name,
      ...(bio && { bio }),
      ...(location && { location }),
      ...(website && { website }),
      ...(birthday && { birthday }),
    },
  });
  const { update } = useSession();
  const utils = trpc.useUtils();
  const [initialHeader, setInitialHeader] = useState<string | null>(
    initialHeaderArg,
  );
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(true);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatar, updateAvatar] = useImmer<{
    blob: string;
    file: File;
    status: "uploading" | "success" | "failed";
    url?: string;
  } | null>(null);

  const headerInputRef = useRef<HTMLInputElement | null>(null);
  const [header, updateHeader] = useImmer<{
    blob: string;
    file: File;
    status: "uploading" | "success" | "failed";
    url?: string;
  } | null>(null);

  useEffect(() => {
    if (
      (!avatar && !header) ||
      [avatar?.status, header?.status]
        .filter((v) => v)
        .every((v) => v === "success")
    ) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [avatar, header]);

  const userUpdate = trpc.user.update.useMutation({
    onMutate: () => setSubmitDisabled(true),
    onError: () => setSubmitDisabled(false),
    onSuccess: async () => {
      await utils.user.username.invalidate({ username });
      await update();
      window.location.reload();
    },
  });

  const onSubmit = ({
    name,
    birthday,
    bio,
    location,
    website,
  }: z.infer<typeof FormSchema>) => {
    userUpdate.mutate({
      name: name,
      birthday: birthday,
      bio: bio ?? null,
      location: location ?? null,
      website: website ?? null,
      avatar: avatar?.url,
      header: header?.url ?? (initialHeader ? undefined : null),
    });
  };

  return (
    <>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        multiple={false}
        onChange={async (e) => {
          const file = e.currentTarget.files?.[0];
          if (!file) {
            return;
          }

          const blobUrl = URL.createObjectURL(file);

          updateAvatar(() => ({
            blob: blobUrl,
            status: "uploading",
            file,
          }));

          const form = new FormData();
          form.set("media", file);
          const result = await uploadMedia(form);

          updateAvatar((avatar) => {
            if (avatar) {
              avatar.status = result ? "success" : "failed";
              avatar.url = result ? result.url : undefined;
            }
          });
        }}
      />

      <input
        ref={headerInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        multiple={false}
        onChange={async (e) => {
          const file = e.currentTarget.files?.[0];
          if (!file) {
            return;
          }

          const blobUrl = URL.createObjectURL(file);

          updateHeader(() => ({
            blob: blobUrl,
            status: "uploading",
            file,
          }));

          const form = new FormData();
          form.set("media", file);
          const result = await uploadMedia(form);

          updateHeader((header) => {
            if (header) {
              header.status = result ? "success" : "failed";
              header.url = result ? result.url : undefined;
            }
          });
        }}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative flex flex-col gap-0"
        >
          <div className="flex flex-col gap-0">
            <div className="bg-background/65 sticky top-0 z-50 flex flex-row items-center justify-between p-2 py-2 backdrop-blur-md">
              <div className="flex flex-row items-center gap-3">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <X />
                  </Button>
                </DialogClose>
                <p className="text-lg font-bold">Edit profile</p>
              </div>
              <Button
                type="submit"
                className="h-8 rounded-full font-bold"
                disabled={submitDisabled}
              >
                Save
              </Button>
            </div>
            <div className="flex flex-col">
              <div className="bg-muted relative h-[200px] w-full">
                {(header?.blob ?? initialHeader) && (
                  <Image
                    className="object-cover"
                    alt={`${username}'s header image`}
                    fill
                    src={header?.blob ?? initialHeader!}
                  />
                )}
                {header?.status === "uploading" ? (
                  <Spinner className="absolute inset-0 mx-auto my-auto block" />
                ) : header?.status === "failed" ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-background/50 hover:bg-background/80 absolute inset-0 mx-auto my-auto block rounded-full"
                    onClick={async (e) => {
                      e.preventDefault();
                      updateHeader((header) => {
                        if (header) {
                          header.status = "uploading";
                        }
                      });

                      const form = new FormData();
                      form.set("media", header.file);
                      const result = await uploadMedia(form);

                      updateHeader((header) => {
                        if (header) {
                          header.status = result ? "success" : "failed";
                          header.url = result ? result.url : undefined;
                        }
                      });
                    }}
                  >
                    <RotateCw className="stroke-foreground mx-auto" />
                  </Button>
                ) : (
                  <div className="absolute inset-0 mx-auto my-auto flex size-fit flex-row gap-4">
                    <Button
                      className="hover:bg-background/40 bg-background/50 rounded-full"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        headerInputRef.current?.click();
                      }}
                    >
                      <ImagePlus
                        className="stroke-foreground mx-auto"
                        size={20}
                      />
                    </Button>
                    {(initialHeader ?? header) && (
                      <Button
                        className="hover:bg-background/40 bg-background/50 rounded-full"
                        size="icon"
                      >
                        <X
                          className="stroke-foreground mx-auto"
                          size={20}
                          onClick={() => {
                            setInitialHeader(null);
                            updateHeader(() => null);
                          }}
                        />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Avatar className="bg-background -mt-16 ml-4 h-[120px] w-[120px] rounded-full border-4 border-black object-cover">
              {(avatar?.blob ?? initialAvatar) && (
                <AvatarImage
                  src={avatar?.blob ?? initialAvatar!}
                  alt="Profile Photo"
                />
              )}
              <AvatarFallback>
                <User size={65} />
              </AvatarFallback>
              {avatar?.status === "uploading" ? (
                <Spinner className="absolute inset-0 mx-auto my-auto block" />
              ) : avatar?.status === "failed" ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/50 hover:bg-background/80 absolute inset-0 mx-auto my-auto block rounded-full"
                  onClick={async (e) => {
                    e.preventDefault();
                    updateAvatar((avatar) => {
                      if (avatar) {
                        avatar.status = "uploading";
                      }
                    });

                    const form = new FormData();
                    form.set("media", avatar.file);
                    const result = await uploadMedia(form);

                    updateAvatar((avatar) => {
                      if (avatar) {
                        avatar.status = result ? "success" : "failed";
                        avatar.url = result ? result.url : undefined;
                      }
                    });
                  }}
                >
                  <RotateCw className="stroke-foreground mx-auto" />
                </Button>
              ) : (
                <Button
                  className="hover:bg-background/40 bg-background/50 absolute inset-0 mx-auto my-auto block rounded-full"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    avatarInputRef.current?.click();
                  }}
                >
                  <ImagePlus className="stroke-foreground mx-auto" size={20} />
                </Button>
              )}
            </Avatar>
          </div>
          <div className="flex flex-col gap-5 p-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea className="h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground", // eslint-disable-line @typescript-eslint/no-unnecessary-condition
                          )}
                        >
                          {field.value ? ( // eslint-disable-line @typescript-eslint/no-unnecessary-condition
                            Intl.DateTimeFormat("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }).format(field.value)
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      side="top"
                    >
                      <Calendar
                        captionLayout="dropdown"
                        fromDate={new Date("1970-01-01")}
                        toDate={new Date()}
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </>
  );
}
