import { Card, CardContent, CardHeader } from "@semicolon/ui/card";
import Link from "next/link";
import React from "react";

const trends = [
  {
    header: "Travel · Trending",
    topic: "America Airlines",
    footer: "32K posts",
  },
  {
    header: "Trending in United States",
    topic: "Only 22",
    footer: "11.8K posts",
  },
  { header: "Travel · Trending", topic: "Southwest", footer: "9,783 posts" },
  {
    header: "Trending in United States",
    topic: "Leave the World Behind",
    footer: "2,980 posts",
  },
  { header: "Wrestling · Trending", topic: "Hulk Hogan", footer: "263K posts" },
  {
    header: "Trending in United States",
    topic: "Wyndham Clark",
    footer: "12K posts",
  },
  {
    header: "Trending in United States",
    topic: "Biggest IT",
    footer: "102K posts",
  },
];

export function Trends() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-5 pt-4 text-lg font-black">
        What{"'"}s happening
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {trends.map(({ header, topic, footer }, i) => (
          <Link key={i} href="#" className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground align-bottom text-sm">
                {header}
              </p>
              <p className="font-bold">{topic}</p>
              <p className="text-muted-foreground text-sm">{footer}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
