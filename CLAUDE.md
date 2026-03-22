# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
- Build production app: `npm run build`
- Start production build locally: `npm run start`
- Run lint: `npm run lint`
- Lint a single file: `npx eslint src/app/page.tsx`
- Generate Prisma client: `npm run db:generate`
- Push Prisma schema to local SQLite DB: `npm run db:push`
- Create a Prisma migration during development: `npm run db:migrate`
- Reset the local Prisma database: `npm run db:reset`

## Development setup

- Node.js 20.x is required (`package.json`).
- Local env file should define:
  - `DATABASE_URL="file:./db/custom.db"`
  - `NEXT_PUBLIC_API_URL="http://localhost:3000"`
- Prisma uses SQLite for local development (`prisma/schema.prisma`).
- There is currently no dedicated test script or test framework configured in `package.json`.

## High-level architecture

- This is a Next.js App Router application with a single large client page at `src/app/page.tsx` that acts as the main product UI.
- The landing page is data-driven: it fetches catalog data from `/api/aws-services` and CLI metadata from `/api/cli`, then renders service browsing, project templates, command simulation, and generated output views.
- Most of the business/domain data lives in `src/lib/aws-catalog.ts`, which is the canonical AWS catalog dataset used by the app and the `/api/aws-services` route. It exports:
  - `awsServices` for the service catalog
  - `realWorldProjects` for project templates
  - `categories` and `catalogSummary` for UI filters and counts
  - `getServiceById` / `getProjectById` helpers
- `src/lib/aws-types.ts` defines the shared TypeScript interfaces consumed by both the UI and catalog-backed routes.
- `src/lib/aws-catalog-source.ts` is an older parallel catalog data file that is currently not imported by the app routes; prefer `src/lib/aws-catalog.ts` unless you verify a new use case.

## API surface

All backend behavior is implemented as App Router route handlers under `src/app/api/*/route.ts`.

- `api/aws-services`: serves catalog data and generates infrastructure model/deployment JSON from selected services.
- `api/cli`: exposes command metadata and simulates a custom infrastructure CLI against the catalog API.
- `api/convert`: contains the largest parser/transformer logic in the repo; it parses Terraform/HCL-like input and converts it into structured model/deployment data.
- `api/architecture`: generates Terraform file sets for predefined architecture patterns like 3-tier, microservices, serverless, and hybrid.
- `api/migration`: builds mock migration analyses/plans and step execution for Terraform-to-platform workflows.
- `api/private-cloud`: maps Terraform-style resources into a private-cloud deployment model.

These routes are mostly generator/simulation endpoints, not thin wrappers over external services.

## UI structure

- `src/app/layout.tsx` sets global metadata, fonts, global CSS, and mounts the toast system.
- `src/app/page.tsx` is the main orchestration layer. It owns fetching, filtering, selected service/project state, CLI execution requests, and generator outputs.
- `src/components/ui/*` contains mostly shadcn/ui-style primitives. Treat these as reusable presentation building blocks rather than business-logic files.

## Data and persistence

- Prisma is configured in `prisma/schema.prisma` with a SQLite datasource.
- `src/lib/db.ts` exports a singleton Prisma client with query logging enabled.
- The current UI and API routes are primarily catalog/generator driven; Prisma is configured but not deeply integrated into the main app flow yet.

## Important implementation notes

- `next.config.ts` sets `output: "standalone"` for deployment packaging.
- `next.config.ts` also has `typescript.ignoreBuildErrors = true`, so a production build may succeed even when TypeScript errors exist. Do not treat `npm run build` alone as proof of type safety.
- `reactStrictMode` is disabled.
- ESLint is intentionally permissive in `eslint.config.mjs`; many TypeScript, React, and general JS rules are turned off.
- The repository currently centers on one-page UX plus route handlers, not a deeply componentized frontend. Before refactoring, check whether a change really needs broader structure changes.
- Do not commit or push to git unless the user explicitly asks for it.