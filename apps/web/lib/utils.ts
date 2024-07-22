import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }

  if (process.env.DEPLOYMENT_URL) {
    return `https://${process.env.DEPLOYMENT_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.RENDER_INTERNAL_HOSTNAME) {
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function formatShortDate(date: Date) {
  const now = dayjs();

  if (now.startOf("day").isBefore(date)) {
    return now.to(date);
  } else if (now.startOf("year").isBefore(date)) {
    return Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
    }).format(date);
  } else {
    return Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }
}

export function formatLongDate(date: Date) {
  return `${Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  }).format(date)} · ${Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)}`;
}
