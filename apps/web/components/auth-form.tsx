"use client";

import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { UsernameSchema } from "@semicolon/api/schema";
import { Button } from "@semicolon/ui/button";
import { Calendar } from "@semicolon/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@semicolon/ui/form";
import { Input } from "@semicolon/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@semicolon/ui/popover";
import { cn } from "@semicolon/ui/utils";
import { CalendarIcon } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaDiscord } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { IoLogoGithub } from "react-icons/io";
import { z } from "zod";

const EmailSchema = z.object({
  email: z
    .string({ required_error: "E-mail address is required" })
    .email("Not a valid e-mail address"),
});

const RegisterSchema = z.object({
  username: UsernameSchema,
  name: z.string({ required_error: "Name is required" }),
  birthday: z.date({ required_error: "Date of birth is required" }),
});

function SuggestionMessage({
  variant = "signup",
}: {
  variant?: "signup" | "login";
}) {
  const { message, action, href } = (() => {
    switch (variant) {
      case "login":
        return {
          message: "Already have an account? ",
          action: "Sign in",
          href: "/flow/login",
        };
      case "signup":
        return {
          message: "Don't have an account? ",
          action: "Sign up",
          href: "/flow/signup",
        };
    }
  })();

  return (
    <p className="my-5 text-center text-zinc-400">
      {message}
      <Link
        href={href}
        className="cursor-pointer font-bold text-sky-400 hover:underline"
      >
        {action}
      </Link>
    </p>
  );
}

export function PreAuthForm({
  variant = "signup",
}: {
  variant?: "signup" | "login";
}) {
  const form = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
  });

  const [verb, setVerb] = useState(variant === "login" ? "Log in" : "Sign up");

  useEffect(() => {
    setVerb(variant === "login" ? "Log in" : "Sign up");
  }, [variant]);

  const onSubmit = async (data: z.infer<typeof EmailSchema>) => {
    await signIn("resend", data);
  };

  const flavorText = (() => {
    switch (variant) {
      case "signup":
        return "Come and build the next social phenomenon with us.";
      case "login":
        return "Catch up on everything you've missed.";
    }
  })();

  return (
    <>
      <h1 className="text-3xl font-bold">{verb}</h1>
      <p className="mb-12 mt-5 text-zinc-400">{flavorText}</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="john.smith@semicolon.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            <span className="font-2xl ml-2">{verb}</span>
          </Button>
        </form>
      </Form>

      <SuggestionMessage variant={variant} />

      <div className="my-5 flex items-center gap-2">
        <div className="h-1 w-full border-b-2"></div>
        <span className="font-bold">Or</span>
        <div className="h-1 w-full border-b-2"></div>
      </div>

      <div className="my-2">
        <Button
          variant="outline"
          className="flex w-full items-center gap-3 text-zinc-700 dark:text-zinc-300"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          <FcGoogle className="size-6" />
          <span>{verb} with Google</span>
        </Button>
      </div>
      <div className="my-2">
        <Button
          variant="outline"
          className="flex w-full items-center gap-3 text-zinc-700 dark:text-zinc-300"
          onClick={() => signIn("discord", { callbackUrl: "/" })}
        >
          <FaDiscord className="size-6 fill-[#536dfe]" />
          <span>{verb} with Discord</span>
        </Button>
      </div>
      <div className="my-2">
        <Button
          variant="outline"
          className="flex w-full items-center gap-3 text-zinc-700 dark:text-zinc-300"
          onClick={() => signIn("github", { callbackUrl: "/" })}
        >
          <IoLogoGithub className="size-6" />
          <span>{verb} with GitHub</span>
        </Button>
      </div>
    </>
  );
}

export function PostAuthForm({ defaultName }: { defaultName?: string | null }) {
  const { update } = useSession();
  const router = useRouter();
  const [disabled, setDisabled] = useState<{ disabled?: boolean }>({});

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: defaultName
      ? {
          name: defaultName,
        }
      : undefined,
  });

  const { mutate } = trpc.user.register.useMutation({
    onSuccess: async () => {
      await update();
      router.push("/home");
    },
    onMutate: () => {
      setDisabled((d) => {
        d.disabled = true;
        return d;
      });
    },
    onError: (error) => {
      setDisabled((d) => {
        delete d.disabled;
        return d;
      });

      switch (error.data?.code) {
        case "CONFLICT":
          form.setError("username", {
            message: "The username is already taken",
          });
          break;
        default:
          break;
      }
    },
  });

  const onSubmit = (data: z.infer<typeof RegisterSchema>) => mutate(data);

  return (
    <>
      <h1 className="text-nowrap text-xl font-bold sm:text-2xl md:text-3xl">
        Complete registration
      </h1>
      <p className="mb-12 mt-5 text-zinc-400">
        Just one more thing before we{"'"}re done.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-8"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="john.smith" {...field} {...disabled} />
                </FormControl>
                <FormDescription className={error ? "hidden" : ""}>
                  Your username should be unique.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} {...disabled} />
                </FormControl>
                <FormDescription className={error ? "hidden" : ""}>
                  However you want yourself to be called.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthday"
            render={({ field, fieldState: { error } }) => (
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
                        {...disabled}
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className={error ? "hidden" : ""}>
                  Your date of birth is used to determine your age.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-10 w-full" {...disabled}>
            <span className="font-2xl ml-2">Confirm</span>
          </Button>
        </form>
      </Form>
    </>
  );
}
