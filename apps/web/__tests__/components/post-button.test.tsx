import { PostButton } from "@/components/post-button";
import { render, screen } from "@testing-library/react";
import { TestTube } from "lucide-react";
import { expect, test, vi } from "vitest";

test("post-button", () => {
  const onClick = vi.fn();
  render(<PostButton icon={TestTube} onClick={onClick} />);

  const postButton = screen.getByRole("button");
  postButton.click();
  expect(onClick).toBeCalled();
});
