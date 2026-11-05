# ViewFinder

# ViewFinder tech stack

## Settled

| Layer | Choice | Notes |
|---|---|---|
| **Framework** | Next.js (App Router) + React | Next.js 16 is the current major version. MapLibre's worker bundling needs Next.js 15 or later. |
| **Language** | TypeScript (strict) | Types generated from the Supabase schema |
| **Styling** | Tailwind CSS v4 | Theme tokens live in CSS, with no `tailwind.config` file |
| **UI components** | shadcn/ui (Radix-based) | Components are copied into the repo, so the team owns the code. Neutral base color for a minimalist look. Initialize with `npx shadcn@latest init` |
| **Database** | Supabase Postgres | Schema changes go through Supabase CLI migrations committed to the repo. RLS enforces who can read and write |
| **Auth** | Supabase Auth | Use `@supabase/supabase-js` and `@supabase/ssr` with cookie-based sessions |
| **Photo storage** | Supabase Storage | One bucket with public read and authenticated-only writes |
| **Map engine** | MapLibre GL JS via react-map-gl | Import from `react-map-gl/maplibre`, which supports maplibre-gl 4 or later. Map components must be client components. |
| **Map tiles and style** | OpenFreeMap | Free OpenStreetMap vector tiles with no API key and no signup. The Liberty style includes 3D buildings by default, while Bright does not. Keep the style URL in config |
| **3D buildings** | `fill-extrusion` layer | Driven by the building height properties in the tile data |
| **Hosting** | Vercel, eventually | Not final (see below) |

## Details to add to your docs

**Supabase keys.**
- The old `anon` key is replaced by a publishable key, and `service_role` by a secret key.
- The legacy keys are documented as working until the end of 2026. That's about two months away, so use the new keys from the start.
- Suggested environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and a server-only `SUPABASE_SECRET_KEY`. The secret key never goes in client code.

**Sessions in Next.js.** Server Components can't write cookies, so a proxy layer refreshes expired auth tokens. I believe Next.js 16 renamed `middleware` to `proxy`, but that's from memory, so check the Supabase docs for the exact setup.

**Architecture change.** The old draft had a separate Express API. Now the browser talks to Supabase through RLS, and any server-only logic goes in Next.js route handlers or server actions. The "API alone touches the database" rule becomes "RLS enforces access on every table."

**Map runtime.** MapLibre needs its CSS imported and runs a web worker. If you add a Content-Security-Policy, it must allow `worker-src 'self'` and `img-src data: blob: 'self'`. Remember to allow the tile host too.

**Optional.** AWS Terrain Tiles are free with no key and natively supported by MapLibre, if you want 3D hills later.

## Not settled yet

- **Hosting.** Vercel's free plan restricts private org repos and team collaboration. Decide between a public repo, a single account owner, a paid plan, or another host.
- **Satellite basemap** (req 35). OpenFreeMap is street maps only, so this needs a separate imagery source.
- **Tile provider fallback.** OpenFreeMap is a free third-party service, so decide whether to configure a backup.
- **Rich-text storage format.** HTML, Markdown, or editor JSON.
- **Free-tier limits.** 500 MB database, 1 GB file storage, and projects pause after one week of inactivity. Plan a check before demos.
