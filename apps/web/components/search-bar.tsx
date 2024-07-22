"use client";

import { useSearchFilters } from "@/lib/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@semicolon/ui/form";
import { Input } from "@semicolon/ui/input";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const SearchSchema = z.object({
  query: z.string().min(1),
});

export function SearchBar() {
  const [updateFilters, { query }] = useSearchFilters();

  const form = useForm<z.infer<typeof SearchSchema>>({
    resolver: zodResolver(SearchSchema),
  });

  const onSubmit = ({ query }: z.infer<typeof SearchSchema>) => {
    updateFilters((f) => {
      f.query = query;
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-grow"
        aria-label="search"
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <div className="relative flex flex-grow items-center justify-start">
                <Search className="absolute left-6 block items-center" />
                <FormControl>
                  <Input
                    type="search"
                    placeholder="Search"
                    {...(query && { defaultValue: query })}
                    className="bg-muted h-12 flex-grow rounded-full pl-16 text-base text-white"
                    {...field}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
        <input type="submit" hidden aria-label="Submit search" />
      </form>
    </Form>
  );
}
