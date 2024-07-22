import { BackHeader } from "@/components/back-header";
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { expect, test, vi } from "vitest";
import { mock } from "vitest-mock-extended";

test("back-header", () => {
  vi.mock("next/navigation");
  const routerMocked = mock<ReturnType<typeof useRouter>>();
  vi.mocked(useRouter).mockReturnValue(routerMocked);

  render(<BackHeader />);

  const backButton = screen.getByLabelText("Go back");

  vi.spyOn(window.history, "length", "get").mockReturnValue(0);
  backButton.click();
  expect(routerMocked.push).toBeCalledWith("/home");

  vi.spyOn(window.history, "length", "get").mockReturnValue(3);
  backButton.click();
  expect(routerMocked.back).toBeCalled();
});
