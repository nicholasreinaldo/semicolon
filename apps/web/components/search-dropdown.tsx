"use client";

import { AdvancedFilter } from "./search-filter";
import { Button } from "@semicolon/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@semicolon/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@semicolon/ui/dropdown-menu";
import { ScrollArea } from "@semicolon/ui/scroll-area";
import { toast } from "@semicolon/ui/use-toast";
import { Copy, Paperclip, Search } from "lucide-react";
import { Ellipsis } from "lucide-react";
import { useEffect, useState } from "react";

export function SearchDropdown() {
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    setOpenDropdown(openAdvanced);
  }, [openAdvanced, setOpenDropdown]);

  return (
    <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="aspect-square size-fit rounded-full p-2"
          aria-label="Search dropdown"
        >
          <Ellipsis className="flex-none" size={19} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="flex flex-col gap-0 rounded-3xl px-0 py-2 [&>*]:min-w-44 [&>*]:text-sm [&>*]:font-black"
        onClick={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
      >
        <Dialog open={openAdvanced} onOpenChange={setOpenAdvanced}>
          <DialogTrigger asChild>
            <DropdownMenuItem
              className="cursor-pointer justify-start gap-4 rounded-none px-4 py-4"
              onSelect={(e) => e.preventDefault()}
            >
              <Search size={20} />
              <div>Advanced search</div>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent
            close={false}
            className="overflow-hidden p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <ScrollArea className="max-h-[650px]">
              <AdvancedFilter onDone={() => setOpenAdvanced(false)} />
            </ScrollArea>
          </DialogContent>
        </Dialog>
        <DropdownMenuItem
          className="cursor-pointer justify-start gap-4 rounded-none px-4 py-4"
          onSelect={async () => {
            await navigator.clipboard.writeText(window.location.href);
            toast({
              description: (
                <div className="flex items-center justify-start gap-4">
                  <Paperclip size={35} />
                  <article className="flex flex-col gap-2">
                    <h3 className="text-base font-black">Copied</h3>
                    <p>The link is now in your clipboard.</p>
                  </article>
                </div>
              ),
            });
          }}
        >
          <Copy size={20} />
          <div>Copy search link</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
