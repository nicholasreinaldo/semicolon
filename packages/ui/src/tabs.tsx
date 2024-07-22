import { Button } from "./button";
import { Separator } from "./separator";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@semicolon/ui/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ResizeObserver from "rc-resize-observer";
import { useRef, useState } from "react";

export const Tabs = TabsPrimitive.Root;

export function TabsTrigger({
  children,
  className,
  ...props
}: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "hover:bg-accent/40 hover:text-accent-foreground group flex h-14 flex-auto snap-start justify-center px-8 text-base font-bold transition-colors",
        className,
      )}
      {...props}
    >
      <div className="relative flex h-full w-fit flex-col items-center justify-center">
        <p>{children}</p>
        <div className="absolute bottom-0 hidden h-1 w-full min-w-14 rounded-full bg-sky-400 group-data-[state=active]:block" />
      </div>
    </TabsPrimitive.Trigger>
  );
}

export function TabsList({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  return (
    <div
      className={cn(
        "bg-background/65 sticky top-0 z-50 backdrop-blur-md",
        className,
      )}
      {...props}
    >
      <ResizeObserver
        onResize={(_info, elem) => {
          setCanScrollLeft(elem.scrollLeft > 0);
          setCanScrollRight(
            elem.scrollWidth - elem.offsetWidth !== elem.scrollLeft,
          );
        }}
      >
        <TabsPrimitive.List
          className={cn(
            "no-scrollbar flex snap-x justify-stretch overflow-x-auto",
            className,
          )}
          onScroll={(e) => {
            setCanScrollLeft(e.currentTarget.scrollLeft > 0);
            setCanScrollRight(
              e.currentTarget.scrollWidth - e.currentTarget.offsetWidth !==
                e.currentTarget.scrollLeft,
            );
          }}
          ref={tabListRef}
          {...props}
        >
          {children}
        </TabsPrimitive.List>
      </ResizeObserver>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full opacity-50 hover:opacity-90",
          canScrollLeft ? "flex" : "hidden",
        )}
        onClick={() =>
          tabListRef.current?.scrollBy({
            left: -tabListRef.current.offsetWidth / 2,
            behavior: "smooth",
          })
        }
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full opacity-50 hover:opacity-90",
          canScrollRight ? "flex" : "hidden",
        )}
        onClick={() =>
          tabListRef.current?.scrollBy({
            left: tabListRef.current.offsetWidth / 2,
            behavior: "smooth",
          })
        }
      >
        <ArrowRight className="h-5 w-5" />
      </Button>
      <Separator />
    </div>
  );
}

export const TabsContent = TabsPrimitive.Content;
