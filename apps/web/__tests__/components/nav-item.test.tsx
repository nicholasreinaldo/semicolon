import { NavItem } from "@/components/nav-item";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { expect, test, vi } from "vitest";

test("nav-item", () => {
  vi.mock("next/navigation");
  vi.mocked(usePathname).mockReturnValue("/bar");

  const { rerender } = render(<NavItem href="/foo" />);
  const navItem = screen.getByRole("link");
  expect(navItem.classList).not.toContain("font-black");

  vi.mocked(usePathname).mockReturnValue("/foo");
  rerender(<NavItem href="/foo" />);
  expect(navItem.classList).toContain("font-black");
});
