# Semicolon

A simple Twitter/X clone built with Next.js.

## What's inside?

This monorepo includes the following packages/apps:

### Apps and Packages

- `web`: a [Next.js](https://nextjs.org) app
- `@semicolon/ui`: a collection of primitive UI components based on [shadcn/ui](https://ui.shadcn.com)
- `@semicolon/db`: a PostgreSQL database client powered by [Prisma](https://prisma.io) and [Kysely](https://kysely.dev)
- `@semicolon/auth`: Authentication logic implemented using [Auth.js](https://authjs.dev)
- `@semicolon/api`: [tRPC](https://trpc.io) API routes with OpenAPI support thanks to [trpc-openapi](https://github.com/jlalmes/trpc-openapi) and [Scalar](https://scalar.com)
- `@semicolon/eslint-config`: `eslint` configurations
- `@semicolon/typescript-config`: `tsconfig.json`s used throughout the monorepo
- `@semicolon/tailwind-config`: shared `tailwind` configuration

Each package/app is 100% [TypeScript](https://www.typescriptlang.org).

### Utilities

This monorepo has some additional tools already set up for you:

- [TypeScript](https://typescriptlang.org) for static type checking
- [ESLint](https://eslint.org) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Vitest](https://vitest.dev) for unit testing

## Develop

1. Set up your database environment

   To get started, you can use the provided Docker Compose file to quickly set up a PostgreSQL server:

   ```bash
   docker compose up -d
   echo "POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5432/semicolon" >.env
   for p in apps/web packages/db packages/api; do ln -s ../../.env $p; done
   ```

   If you want to run your own custom server, make sure you adjust the environment variable above.

2. Migrate the database

   Run the following command to migrate and synchronize your database with the schema:

   ```bash
   npx prisma migrate dev
   ```

   Optionally, you can also seed the database for testing purposes:

   ```bash
   npx prisma db seed
   ```

3. Set up authentication secrets

   This project supports the following Auth.js providers:

   - [Google](https://authjs.dev/getting-started/providers/google)
   - [Discord](https://authjs.dev/getting-started/providers/discord)
   - [GitHub](https://authjs.dev/getting-started/providers/github)
   - [Resend](https://authjs.dev/getting-started/providers/resend)

   Refer to each of the documentation above for setup instructions. Your `.env.local` file should be located in `apps/web`.

4. Launch

   ```bash
   npm run dev
   ```

   And that's it. Everything should be set up now.

   By default, the dev environment will launch these apps in the following ports:

   - `3000`: The main Next.js web app
     - `/api/trpc/*`: tRPC routes
     - `/api/*`: OpenAPI routes
       - `/api/docs`: OpenAPI documentation
   - `5555`: IDE for interacting with the PostgreSQL database
