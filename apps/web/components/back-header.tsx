"use client";

import { Button } from "@semicolon/ui/button";
import { cn } from "@semicolon/ui/utils";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  return (
    <div
      className={cn(
        "bg-background/65 sticky top-0 z-50 flex flex-row items-center gap-7 p-2",
        className,
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full p-2"
        aria-label="Go back"
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push("/home");
          }
        }}
      >
        <ArrowLeft className="size-6" />
      </Button>
      {children}
    </div>
  );
}
