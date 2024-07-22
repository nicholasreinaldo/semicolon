import { trpc } from "@/lib/trpc";
import type { PostResolved } from "@semicolon/api/schema";
import { AspectRatio } from "@semicolon/ui/aspect-ratio";
import { Separator } from "@semicolon/ui/separator";
import { cn } from "@semicolon/ui/utils";
import Image from "next/image";
import Link from "next/link";
import { Fragment, MouseEventHandler } from "react";

export function ThumbGrid(
  post: PostResolved & Omit<React.HTMLAttributes<HTMLDivElement>, "content">,
) {
  const { className, id, media, username, name } = post;
  const utils = trpc.useUtils();
  if (media.length === 0) {
    throw new Error(`ThumbGrid must be supplied at least one image URL.`);
  }

  const onClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    utils.post.id.setData({ id }, post);
    e.stopPropagation();
  };

  switch (media.length) {
    case 1:
      return (
        <div
          className={cn("w-full overflow-hidden rounded-lg border", className)}
        >
          {
            <AspectRatio ratio={4 / 3} className="bg-muted w-full">
              <Link
                href={`/${username}/post/${id}/photo/1`}
                onClick={onClick}
                scroll={false}
              >
                <Image
                  src={media[0]!}
                  alt={`${name}'s post media (1)`}
                  fill
                  sizes="(max-width: 768px) 75vw, (max-width: 1024px) 50vw, (max-width: 1280px) 40vw, 35vw"
                  className="rounded-md object-cover"
                />
              </Link>
            </AspectRatio>
          }
        </div>
      );
    case 2:
      return (
        <div
          className={cn(
            "relative z-0 flex w-full flex-row overflow-hidden rounded-lg border",
            className,
          )}
        >
          {media.map((src, i) => (
            <Fragment key={i}>
              <AspectRatio ratio={3 / 2} className="bg-muted w-full" key={i}>
                <Link
                  href={`/${username}/post/${id}/photo/${i + 1}`}
                  onClick={onClick}
                  scroll={false}
                >
                  <Image
                    src={src}
                    alt={`${name}'s post media (${i + 1})`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </Link>
              </AspectRatio>
              {i === 0 && (
                <Separator
                  orientation="vertical"
                  className="bg-background z-10 w-[4px]"
                />
              )}
            </Fragment>
          ))}
        </div>
      );
    case 3:
      return (
        <div
          className={cn(
            "relative z-0 flex w-full flex-row overflow-hidden rounded-lg border",
            className,
          )}
        >
          <AspectRatio ratio={4 / 3} className="bg-muted w-full">
            <Link
              href={`/${username}/post/${id}/photo/1`}
              onClick={onClick}
              scroll={false}
            >
              <Image
                src={media[0]!} // eslint-disable-line @typescript-eslint/no-non-null-assertion
                alt={`${name}'s post media (1)`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </Link>
          </AspectRatio>
          <Separator
            orientation="vertical"
            className="bg-background z-10 w-[4px]"
          />
          <AspectRatio ratio={4 / 3} className="bg-muted w-full">
            <div className="flex flex-col">
              {media.slice(1).map((src, i) => (
                <Fragment key={i}>
                  <AspectRatio
                    ratio={4 / 3}
                    className="bg-muted w-full"
                    key={i}
                  >
                    <Link
                      href={`/${username}/post/${id}/photo/${i + 2}`}
                      onClick={onClick}
                      scroll={false}
                    >
                      <Image
                        src={src}
                        alt={`${name}'s post media (${i + 2})`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </Link>
                  </AspectRatio>
                  {i === 0 && <Separator className="bg-background h-[4px]" />}
                </Fragment>
              ))}
            </div>
          </AspectRatio>
        </div>
      );
    default:
      return (
        <div
          className={cn(
            "relative z-0 flex w-full flex-col overflow-hidden rounded-lg border",
            className,
          )}
        >
          <AspectRatio ratio={2} className="bg-background w-full">
            <div className="flex flex-row">
              {media.slice(0, 2).map((src, i) => (
                <Fragment key={i}>
                  <AspectRatio ratio={1} className="bg-muted h-full" key={i}>
                    <Link
                      href={`/${username}/post/${id}/photo/${i + 1}`}
                      onClick={onClick}
                      scroll={false}
                    >
                      <Image
                        src={src}
                        alt={`${name}'s post media (${i + 1})`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </Link>
                  </AspectRatio>
                  {i === 0 && (
                    <Separator
                      orientation="vertical"
                      className="bg-background w-[4px]"
                    />
                  )}
                </Fragment>
              ))}
            </div>
          </AspectRatio>
          <Separator className="bg-background z-10 h-[4px]" />
          <AspectRatio ratio={2} className="bg-background w-full">
            <div className="flex flex-row">
              {media.slice(2, 4).map((src, i) => (
                <Fragment key={i}>
                  <AspectRatio ratio={1} className="bg-muted h-full" key={i}>
                    <Link
                      href={`/${username}/post/${id}/photo/${i + 3}`}
                      onClick={onClick}
                      scroll={false}
                    >
                      <Image
                        src={src}
                        alt={`${name}'s post media (${i + 3})`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </Link>
                  </AspectRatio>
                  {i === 0 && (
                    <Separator
                      orientation="vertical"
                      className="bg-background w-[4px]"
                    />
                  )}
                </Fragment>
              ))}
            </div>
          </AspectRatio>
        </div>
      );
  }
}
