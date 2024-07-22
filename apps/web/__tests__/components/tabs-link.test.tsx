import { TabsLink } from "@/components/tabs-link";
import { render, screen } from "@testing-library/react";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { expect, test, vi } from "vitest";

test("tabs-link", () => {
  vi.mock("next/navigation");
  vi.mocked(usePathname).mockReturnValue("/bar");
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams("q=foo") as ReadonlyURLSearchParams,
  );

  const { rerender } = render(<TabsLink href="/foo" query={{ q: "abc" }} />);
  const tabsLink = screen.getByRole("link");
  expect(tabsLink).toBeDefined();
  expect(tabsLink.children).toHaveLength(1);
  expect(tabsLink.children[0]?.children).toHaveLength(2);
  expect(tabsLink.children[0]?.children[1]?.classList).toContain("hidden");

  vi.mocked(usePathname).mockReturnValue("/foo");
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams("q=abc") as ReadonlyURLSearchParams,
  );
  rerender(<TabsLink href="/foo" query={{ q: "abc" }} />);
  expect(tabsLink).toBeDefined();
  expect(tabsLink.children).toHaveLength(1);
  expect(tabsLink.children[0]?.children).toHaveLength(2);
  expect(tabsLink.children[0]?.children[1]?.classList).not.toContain("hidden");
});
