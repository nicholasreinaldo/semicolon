"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@semicolon/ui/form";
import { Input } from "@semicolon/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const SearchSchema = z.object({
  query: z.string().min(1),
});

export function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState<string | null>(null);

  useEffect(() => {
    setQuery(searchParams.get("q"));
  }, [searchParams]);

  const form = useForm<z.infer<typeof SearchSchema>>({
    resolver: zodResolver(SearchSchema),
  });

  const onSubmit = (data: z.infer<typeof SearchSchema>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", data.query);
    if (pathname === "/search") {
      window.history.pushState(null, "", `?${params.toString()}`);
    } else {
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <div className="relative flex flex-grow items-center justify-start">
                <Search className="absolute left-6 block items-center" />
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Search"
                    {...(query && { defaultValue: query })}
                    className="h-12 flex-grow rounded-full bg-transparent pl-16 text-base text-white"
                    {...field}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
        <input type="submit" hidden />
      </form>
    </Form>
  );
}
