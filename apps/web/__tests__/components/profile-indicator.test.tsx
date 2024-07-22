import { ProfileIndicator } from "@/components/profile-indicator";
import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

test("profile-indicator", async () => {
  vi.mock("next-auth/react");

  render(<ProfileIndicator username="john.smith" name="John Smith" />);

  await expect(screen.findByText("John Smith")).resolves.not.toThrowError();
  await expect(screen.findByText("@john.smith")).resolves.not.toThrowError();
});
