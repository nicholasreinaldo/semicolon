import { getBaseUrl } from "@/lib/utils";
import { ApiReference } from "@scalar/nextjs-api-reference";
import { appRouter } from "@semicolon/api";
import { generateOpenApiDocument } from "trpc-openapi";

export const GET = ApiReference({
  spec: {
    content: generateOpenApiDocument(appRouter, {
      title: "Semicolon API",
      version: "0.1.0",
      baseUrl: `${getBaseUrl()}/api`,
    }),
  },
});
