import { SearchBar } from "@/components/search-bar";
import { FiltersSchema, useSearchFilters } from "@/lib/hooks";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { z } from "zod";

test("search-bar", async () => {
  vi.mock("@/lib/hooks");
  const filters: z.infer<typeof FiltersSchema> = {
    query: null,
    tab: "relevancy",
    following: true,
    reply: true,
  };
  const callback = vi.fn(
    (f: Parameters<ReturnType<typeof useSearchFilters>[0]>[0]) => {
      if (typeof f === "function") {
        f(filters);
      }
    },
  );
  vi.mocked(useSearchFilters).mockReturnValue([callback, filters]);

  render(<SearchBar />);
  fireEvent.input(screen.getByRole("searchbox"), {
    target: {
      value: "foobar",
    },
  });

  fireEvent.submit(screen.getByLabelText("Submit search"));

  await waitFor(() => expect(callback).toBeCalled());
  expect(filters.query).toBe("foobar");
});
