# karunanidhi.dev

My personal portfolio and projects site.

**Live:** https://karunanidhi.dev

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/), with class-based dark mode via [next-themes](https://github.com/pacocoursey/next-themes)
- [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) + [gray-matter](https://github.com/jonschlinkert/gray-matter) + [zod](https://zod.dev/) for the project write-ups (`content/projects/*.mdx`)
- Dynamic per-project Open Graph images ([next/og](https://nextjs.org/docs/app/api-reference/functions/image-response)) and a generated `sitemap.xml`/`robots.txt`
- [Biome](https://biomejs.dev/) for formatting and linting
- [Framer Motion](https://www.framer.com/motion/) for animation, [Three.js](https://threejs.org/) / react-three-fiber where noted in individual projects

## Development

```bash
pnpm install
pnpm dev
```

Other scripts:

```bash
pnpm build   # production build
pnpm start   # run the production build
pnpm fmt     # format + auto-fix with Biome
pnpm lint    # lint only
```

## Adding a project

Drop a new `.mdx` file into `content/projects/`, e.g. `content/projects/my-project.mdx`:

```mdx
---
title: My Project
description: One or two sentences describing what it is and why it's interesting.
date: "2026-01-01"
url: https://example.com          # optional — live link
repository: yourname/repo         # optional — shown as a GitHub link
tags: ["Next.js", "SaaS"]         # optional — filterable on /projects, shown as pills
published: true
---

The body is regular MDX — write-up, code blocks, links, images.
```

`lib/projects.ts` reads every file in that directory at build time, validates the frontmatter, and the project shows up on `/projects` automatically (sorted by `date`), with its own page at `/projects/<filename-without-extension>`, a dynamic Open Graph image, and an entry in `sitemap.xml`.

The three featured/spotlight cards at the top of `/projects` are picked by slug in [app/projects/page.tsx](app/projects/page.tsx) — update the three slugs there if you want to feature something else.
