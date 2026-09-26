# AGENTS.md

Instructions for AI coding agents working in this repository. See [README.md](README.md) for the human-facing overview.

## What this is

A personal portfolio/projects site (karunanidhi.dev) built on Next.js App Router. There's no backend service, database, or test suite — it's static content plus a couple of small client-side effects (particles background, mouse-tracking card glow).

## Commands

```bash
pnpm install
pnpm dev      # start the dev server (auto-picks a port if 3000 is busy, see .claude/launch.json)
pnpm build    # production build — also runs the TypeScript check; treat a failing build as a blocking error
pnpm fmt      # Biome format + auto-fix (tabs, double quotes) — run before finishing any change
pnpm lint     # Biome lint only
```

There is no test suite. `pnpm build` (typecheck + static generation of every project page) is the correctness gate.

## Structure

- `app/` — App Router pages. `app/projects/page.tsx` is the projects grid, `app/projects/[slug]/page.tsx` is the per-project detail page (also exports `generateMetadata` for per-project OG title/description), `app/projects/[slug]/opengraph-image.tsx` renders the per-project share image, `app/sitemap.ts`/`app/robots.ts` are the SEO file-convention routes.
- `app/components/` — shared UI (`nav.tsx` — the top nav on /projects and /contact, highlighting the current page via `usePathname()`; its pill hover/active classes live in `nav-styles.ts` and are reused by the homepage's own nav in `app/page.tsx`, so change them there — `card.tsx`, `mdx.tsx` for MDX rendering, `particles.tsx`, `analytics.tsx`, `theme-provider.tsx`/`theme-toggle.tsx` for dark mode).
- `app/projects/project-grid.tsx` — client component: the tag filter chips + 3-column grid on `/projects`.
- `content/projects/*.mdx` — one file per project, see "Adding a project" below.
- `lib/projects.ts` — reads and validates `content/projects/*.mdx` at build/request time (`getAllProjects`, `getProjectBySlug`). This replaced Contentlayer, which is unmaintained — don't reintroduce it. It imports `node:fs`, so client components may only `import type` from it.
- `lib/metadata.ts` — `siteUrl` plus the shared OpenGraph defaults every page's metadata spreads in (see Conventions).
- `lib/format-date.ts` — `formatDate`, the only way project dates should be rendered (see Conventions).
- `app/contact/` — the contact form: `contact-form.tsx` (client, `useActionState`/`useFormStatus`), `actions.ts` (the Server Action that emails via Resend), with the shared Zod schema and honeypot field name in `lib/contact.ts`. Needs `RESEND_API_KEY`, `OWNER_EMAIL` and `CONTACT_FROM_EMAIL` (documented in `.env.example`); put real values in `.env.local`, which is never tracked.
- `global.css` — Tailwind v4 entry point (`@import "tailwindcss"`), the `@custom-variant dark` line (class-based dark mode, driven by next-themes toggling `.dark` on `<html>`), the `@theme` block for custom fonts, and the small `@layer base` overrides. There is no `tailwind.config.js`; theme changes go in `global.css`.

## Adding a project

Add a file to `content/projects/`, e.g. `content/projects/my-project.mdx`, with frontmatter matching the schema in `lib/projects.ts` (`title`, `description`, `date`, optional `url`, optional `repository`, optional `tags` — a string array, shown as filter chips and pills on `/projects` — `published`). The body is plain MDX. No other file needs to change — the grid, detail route, OG image, and sitemap all pick it up automatically. To feature it in one of the three spotlight cards at the top of `/projects`, update the three hardcoded slugs in `app/projects/page.tsx`.

## Conventions

- Styling is Tailwind CSS v4 utility classes; avoid introducing a `tailwind.config.js` or reaching for `@apply` outside `app/projects/[slug]/mdx.css` (which needs `@reference "tailwindcss";` at the top since it's a secondary stylesheet, not part of the main `global.css` import chain).
- Any element with light-mode colors needs a `dark:` variant too (see `@custom-variant dark` in `global.css`) — this site supports light/dark/system via next-themes, don't add colored UI without checking both themes.
- Formatting/linting is Biome (`biome.json`), not ESLint/Prettier — don't add either.
- Match existing code style: tabs for indentation, double quotes, no unnecessary comments (only for genuinely non-obvious "why", not "what").
- Brand icons (GitHub, X/Twitter, etc.) come from `@icons-pack/react-simple-icons`, not `lucide-react` — recent `lucide-react` versions dropped trademarked brand logos.
- `params` in `app/projects/[slug]/page.tsx` (and `opengraph-image.tsx`) is a `Promise` (Next 15+ convention) — await it, don't destructure it directly.
- Metadata: Next.js replaces a parent segment's `openGraph` (and `twitter`) object wholesale rather than merging it, so a page that sets `openGraph` must spread `openGraphDefaults` back in and set its own `url` and `alternates.canonical`. Add `images: defaultOpenGraphImages` only on routes *without* their own `opengraph-image` — an explicit `images` entry overrides the generated image.
- Dates: render project dates with `formatDate` from `lib/format-date.ts`, never `Intl.DateTimeFormat(undefined, …)`. The default locale/time zone differ between the build machine and the browser, which shifts date-only values by a day and causes hydration mismatches in the client-rendered project grid.
- Zod in client-bundled code (e.g. `lib/contact.ts`): `import * as z from "zod"`, never `import { z } from "zod"` — the named import pulls every Zod locale into the browser bundle (measured 89 KB vs 31 KB gzipped). Server-only modules like `lib/projects.ts` aren't affected.
- Motion: `app/components/particles.tsx` respects `prefers-reduced-motion` (draws one still frame, no animation loop). Any new autoplaying animation needs the same treatment.
- Focus: anything inside `Card` (which is `overflow-hidden`) can't show the browser's default outside focus ring — `Card` draws its own ring via `has-[:focus-visible]`. Keep that in mind for other `overflow-hidden` wrappers around links.
