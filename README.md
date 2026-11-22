# ViewFinder

# ViewFinder tech stack

## Settled

| Layer                   | Choice                          | Notes                                                                                                                                                                  |
| ----------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**           | Next.js (App Router) + React    | Next.js 16 is the current major version. MapLibre's worker bundling needs Next.js 15 or later.                                                                         |
| **Language**            | TypeScript (strict)             | Local database types track the `public.viewpoints` schema                                                                                                               |
| **Styling**             | Tailwind CSS v4                 | Theme tokens live in CSS, with no `tailwind.config` file                                                                                                               |
| **UI components**       | shadcn/ui (Radix-based)         | Components are copied into the repo, so the team owns the code. Neutral base color for a minimalist look. Initialize with `npx shadcn@latest init`                     |
| **Database**            | Supabase Postgres               | Schema changes go through Supabase CLI migrations committed to the repo. RLS enforces who can read and write                                                           |
| **Auth**                | Supabase Auth                   | Use `@supabase/supabase-js` and `@supabase/ssr` with cookie-based sessions                                                                                             |
| **Photo storage**       | Supabase Storage                | One bucket with public read and authenticated-only writes                                                                                                              |
| **Map engine**          | MapLibre GL JS via react-map-gl | Import from `react-map-gl/maplibre`, which supports maplibre-gl 4 or later. Map components must be client components.                                                  |
| **Map tiles and style** | OpenFreeMap                     | Free OpenStreetMap vector tiles with no API key and no signup. The Liberty style includes 3D buildings by default, while Bright does not. Keep the style URL in config |
| **3D buildings**        | `fill-extrusion` layer          | Driven by the building height properties in the tile data                                                                                                              |
| **Hosting**             | Vercel, eventually              | Not final (see below)                                                                                                                                                  |

## Details to add to your docs

**Supabase keys.**

- The old `anon` key is replaced by a publishable key, and `service_role` by a secret key.
- The legacy keys are documented as working until the end of 2026. That's about two months away, so use the new keys from the start.
- Suggested environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and a server-only `SUPABASE_SECRET_KEY`. The secret key never goes in client code.

**Sessions in Next.js.** `src/proxy.ts` refreshes Supabase Auth cookies with `auth.getClaims()`. Browser and server clients use the cookie-based session from `@supabase/ssr`.

**Architecture change.** The old draft had a separate Express API. Now the browser talks to Supabase through RLS, and any server-only logic goes in Next.js route handlers or server actions. The "API alone touches the database" rule becomes "RLS enforces access on every table."

**Map runtime.** MapLibre needs its CSS imported and runs a web worker. If you add a Content-Security-Policy, it must allow `worker-src 'self'` and `img-src data: blob: 'self'`. Remember to allow the tile host too.

**Optional.** AWS Terrain Tiles are free with no key and natively supported by MapLibre, if you want 3D hills later.

## Not settled yet

- **Hosting.** Vercel's free plan restricts private org repos and team collaboration. Decide between a public repo, a single account owner, a paid plan, or another host.
- **Satellite basemap** (req 35). OpenFreeMap is street maps only, so this needs a separate imagery source.
- **Tile provider fallback.** OpenFreeMap is a free third-party service, so decide whether to configure a backup.
- **Rich-text storage format.** HTML, Markdown, or editor JSON.
- **Free-tier limits.** 500 MB database, 1 GB file storage, and projects pause after one week of inactivity. Plan a check before demos.

## Run locally

1. Install Node.js 20.9 or newer.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase project’s Connect dialog.
4. Start the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

In Supabase Authentication settings, allow the app’s callback URL (for local development, `http://localhost:3000/auth/callback`) in the redirect URL list. Account creation uses email/password; when email confirmation is enabled, users must confirm their email before signing in. The public map combines the sample Lawrence viewpoints with records saved in `public.viewpoints`.

The `viewpoints` Storage bucket is public for photo viewing. Its insert policy limits authenticated uploads to each user’s own user-ID folder. The `viewpoints` table permits public reads and authenticated inserts for the signed-in owner. RLS remains the access-control boundary; do not expose a Supabase secret key in client code or commit `.env.local`.

Run `npm run lint`, `npm run typecheck`, and `npm run build` before opening a pull request. Never commit credentials.

## Continuous integration

The **Pull request checks** GitHub Actions workflow runs `npm run lint`, `npm run typecheck`, and `npm run build` for every pull request. The workflow installs dependencies from `package-lock.json` with `npm ci`; a failure in any check fails the workflow.

To require these checks before merging, configure a branch ruleset or branch protection rule for `main` and select **Lint, type-check, and build** as a required status check. Availability and settings can vary by repository plan.

## Project workflow

- Start a branch from the latest `main` for each ticket or focused feature slice.
- Keep each pull request focused, reference the issue(s) it addresses, and avoid closing an issue until its acceptance criteria are met.
- Run lint, type-check, and build locally before opening a pull request; the same checks run automatically in CI.
- Request a teammate review; merge only after approval and passing checks.
- Coordinate Supabase access through the project owner; do not add secrets to the repository.

## MVP wireframe scope

- Email/password sign-in and account creation through Supabase Auth
- Public, responsive discovery map with sample Lawrence viewpoints, searchable list, selected-place card, and 3D buildings
- Supabase-backed shared viewpoint metadata and photos, with public browsing

See [`docs/style-guide.md`](./docs/style-guide.md) for UI palette and component conventions.
