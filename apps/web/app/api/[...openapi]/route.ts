import { createOpenApiFetchHandler } from "@/lib/openapi";
import { appRouter, createContext } from "@semicolon/api";

const handler = (req: Request) => {
  return createOpenApiFetchHandler({
    endpoint: "/api",
    router: appRouter,
    createContext,
    req,
  });
};

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
};
