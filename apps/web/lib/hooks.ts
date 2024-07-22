import { current } from "immer";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useImmer } from "use-immer";
import { z } from "zod";

export const ParamsSchema = z.object({
  q: z.string().nullable().catch(null),
  f: z
    .union([z.literal("latest"), z.literal("people")])
    .nullable()
    .catch(null),
  pf: z.literal("on").nullable().catch(null),
  ml: z.coerce.number().nullable().catch(null),
  mr: z.coerce.number().nullable().catch(null),
  fr: z.string().nullable().catch(null),
  to: z.string().nullable().catch(null),
  r: z.literal("off").nullable().catch(null),
  s: z.string().nullable().catch(null),
  u: z.string().nullable().catch(null),
});

export const FiltersSchema = z.object({
  query: z.string().nullable(),
  tab: z.union([
    z.literal("relevancy"),
    z.literal("recency"),
    z.literal("people"),
  ]),
  following: z.boolean(),
  from: z.string().optional(),
  to: z.string().optional(),
  minLikes: z.number().optional(),
  minReplies: z.number().optional(),
  reply: z.boolean(),
  since: z.coerce.date().optional(),
  until: z.coerce.date().optional(),
});

export const ParseParams = z.preprocess(
  (val) => {
    if (val instanceof ReadonlyURLSearchParams) {
      const obj: Record<string, string | null> = {};
      for (const key of Object.keys(ParamsSchema.shape)) {
        obj[key] = val.get(key);
      }
      return obj;
    } else {
      return val;
    }
  },
  ParamsSchema.transform(({ q, f, pf, r, ml, mr, fr, to, s, u }) => ({
    query: q,
    tab: f === null ? "relevancy" : f === "latest" ? "recency" : f,
    following: !!pf,
    minLikes: ml ?? undefined,
    minReplies: mr ?? undefined,
    from: fr ?? undefined,
    to: to ?? undefined,
    reply: !r,
    since: s ?? undefined,
    until: u ?? undefined,
  })).pipe(FiltersSchema),
);

export const makeUpdateParams = FiltersSchema.transform(
  ({
    query,
    tab,
    following,
    minLikes,
    minReplies,
    from,
    to,
    reply,
    since,
    until,
  }) => ({
    q: query,
    f: tab === "relevancy" ? null : tab === "recency" ? "latest" : tab,
    pf: following ? "on" : null,
    ml: minLikes,
    mr: minReplies,
    r: reply ? null : "off",
    fr: from,
    to,
    s: since?.toISOString(),
    u: until?.toISOString(),
  }),
)
  .pipe(ParamsSchema)
  .transform((params) => {
    return (oldParams: ReadonlyURLSearchParams) => {
      const updated = new URLSearchParams(oldParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          updated.delete(key);
        } else {
          updated.set(key, value.toString());
        }
      }
      return updated;
    };
  });

export function useSearchFilters() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [filters, updateFilters] = useImmer(() =>
    ParseParams.parse(pathname === "/search" ? params : {}),
  );

  useEffect(() => {
    if (pathname === "/search") {
      updateFilters(ParseParams.parse(params));
    }
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateWrapper = useCallback(
    (f: Parameters<typeof updateFilters>[0]) => {
      updateFilters((g) => {
        if (typeof f === "function") {
          f(g);
        } else {
          g = f;
        }

        const newFilters = current(g);
        const updateParams = makeUpdateParams.parse(newFilters);
        const newParams = updateParams(params).toString();

        if (pathname === "/search") {
          window.history.pushState(null, "", `?${newParams}`);
        } else if (newFilters.query) {
          router.push(`/search?${newParams}`);
        }

        if (typeof f !== "function") {
          return g;
        }
      });
    },
    [params, pathname, router, updateFilters],
  );

  const v: [typeof updateWrapper, typeof filters] = [updateWrapper, filters];
  return v;
}
