"use client";

import { useSearchFilters } from "@/lib/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@semicolon/ui/button";
import { Calendar } from "@semicolon/ui/calendar";
import { Card, CardContent, CardHeader } from "@semicolon/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@semicolon/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@semicolon/ui/form";
import { Input } from "@semicolon/ui/input";
import { Label } from "@semicolon/ui/label";
import { NumberInput } from "@semicolon/ui/number-input";
import { Popover, PopoverContent, PopoverTrigger } from "@semicolon/ui/popover";
import { RadioGroup, RadioGroupItem } from "@semicolon/ui/radio-group";
import { ScrollArea } from "@semicolon/ui/scroll-area";
import { Separator } from "@semicolon/ui/separator";
import { Switch } from "@semicolon/ui/switch";
import { cn } from "@semicolon/ui/utils";
import { CalendarIcon, X } from "lucide-react";
import React, { useCallback } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const AdvancedSchema = z.object({
  from: z.preprocess((v) => (v === "" ? undefined : v), z.string().optional()),
  to: z.preprocess((v) => (v === "" ? undefined : v), z.string().optional()),
  minReplies: z.preprocess(
    (v) => (typeof v === "number" && isNaN(v) ? undefined : v),
    z.coerce.number().min(1).optional(),
  ),
  minLikes: z.preprocess(
    (v) => (typeof v === "number" && isNaN(v) ? undefined : v),
    z.coerce.number().min(1).optional(),
  ),
  reply: z.boolean(),
  since: z.date().optional(),
  until: z.date().optional(),
});

export function AdvancedFilter({ onDone }: { onDone?: () => unknown }) {
  const [
    updateFilters,
    { from, to, reply, minLikes, minReplies, since, until },
  ] = useSearchFilters();
  const form = useForm<z.infer<typeof AdvancedSchema>>({
    resolver: zodResolver(AdvancedSchema),
    defaultValues: {
      from,
      to,
      reply,
      minLikes,
      minReplies,
      since,
      until,
    },
  });

  const onSubmit = ({
    minLikes,
    minReplies,
    from,
    to,
    reply,
    since,
    until,
  }: z.infer<typeof AdvancedSchema>) => {
    updateFilters((f) => {
      f.minLikes = minLikes;
      f.minReplies = minReplies;
      f.from = from;
      f.to = to;
      f.reply = reply;
      f.since = since;
      f.until = until;
    });
    onDone?.();
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative z-0 flex flex-col gap-0"
        >
          <div className="bg-background/65 sticky top-0 z-10 flex flex-row items-center justify-between p-2 py-2 backdrop-blur-md">
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
              <p className="text-lg font-bold">Advanced search</p>
            </div>
            <Button type="submit" className="h-8 rounded-full font-bold">
              Search
            </Button>
          </div>
          <section className="flex flex-col gap-5 p-5">
            <h3 className="text-xl font-black">Accounts</h3>
            <FormField
              control={form.control}
              name="from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From this account</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To this account</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
          <Separator />
          <section className="flex flex-col gap-5 p-5">
            <h3 className="text-xl font-black">Filters</h3>
            <FormField
              control={form.control}
              name="reply"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <FormLabel className="font-black">Replies</FormLabel>
                  <FormControl>
                    <Switch
                      className="mt-0"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>
          <Separator />
          <section className="flex flex-col gap-5 p-5">
            <h3 className="text-xl font-black">Engagement</h3>
            <FormField
              control={form.control}
              name="minReplies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum replies</FormLabel>
                  <FormControl>
                    <NumberInput {...field} minValue={1} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minLikes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum likes</FormLabel>
                  <FormControl>
                    <NumberInput {...field} minValue={1} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
          <Separator />
          <section className="flex flex-col gap-5 p-5">
            <h3 className="text-xl font-black">Dates</h3>
            <FormField
              control={form.control}
              name="since"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>From</FormLabel>
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
            <FormField
              control={form.control}
              name="until"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>To</FormLabel>
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
          </section>
        </form>
      </Form>
    </>
  );
}

const PeopleEnum = z.enum(["anyone", "following"]);

const SimpleSchema = z.object({
  people: PeopleEnum,
});

export function SimpleFilter() {
  const [updateFilters, { following }] = useSearchFilters();
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof SimpleSchema>>({
    resolver: zodResolver(SimpleSchema),
    defaultValues: {
      people: following ? "following" : "anyone",
    },
  });

  const onSubmit = useCallback(
    ({ people }: z.infer<typeof SimpleSchema>) => {
      updateFilters((f) => {
        f.following = people === "following";
      });
    },
    [updateFilters],
  );

  useEffect(() => {
    const subscription = form.watch(() => form.handleSubmit(onSubmit)());
    return () => subscription.unsubscribe();
  }, [form, onSubmit]);

  return (
    <div className="flex flex-col gap-3">
      <Card className="rounded-2xl">
        <CardHeader className="p-2 px-5 text-lg font-black">
          Search filters
        </CardHeader>
      </Card>
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col gap-7 p-4 pt-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="people"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-3">
                    <h3 className="font-black">People</h3>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormItem className="flex items-center justify-between gap-2">
                          <Label htmlFor="r1">From anyone</Label>
                          <FormControl>
                            <RadioGroupItem
                              value="anyone"
                              id="r1"
                              aria-label="From anyone"
                            />
                          </FormControl>
                        </FormItem>
                        <FormItem className="flex items-center justify-between gap-2">
                          <Label htmlFor="r2">People you follow</Label>
                          <FormControl>
                            <RadioGroupItem
                              value="following"
                              id="r2"
                              aria-label="People you follow"
                            />
                          </FormControl>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="link" className="size-fit p-0 text-sky-400">
                Advanced search
              </Button>
            </DialogTrigger>
            <DialogContent close={false} className="overflow-hidden p-0">
              <ScrollArea className="max-h-[650px]">
                <AdvancedFilter onDone={() => setOpen(false)} />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
