"use client";

import { NavItem } from "./nav-item";
import { cn } from "@semicolon/ui/utils";
import { Bell, CalendarPlus, Home, Mail, Search, User } from "lucide-react";
import React from "react";

export function BottomBar({
  className,
  username,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { username: string }) {
  return (
    <div
      className={cn(
        "bg-background/65 sticky bottom-0 z-10 flex w-full flex-row justify-around gap-2 border py-1 backdrop-blur-md min-[500px]:hidden",
        className,
      )}
      {...props}
    >
      <NavItem href="/home" icon={Home} size="small" className="p-2" />
      <NavItem href="#" icon={Search} size="small" className="p-2" />
      <NavItem href="#" icon={Bell} size="small" className="p-2" />
      <NavItem href="#" icon={Mail} size="small" className="p-2" />
      <NavItem href="#" icon={CalendarPlus} size="small" className="p-2" />
      <NavItem href={`/${username}`} icon={User} size="small" className="p-2" />
    </div>
  );
}
