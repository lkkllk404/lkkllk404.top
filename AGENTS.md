## Architecture

Single Astro static site at the repository root, managed with pnpm and deployed to Cloudflare Pages:

| Package | Domain                | Cloudflare Service | Tech                         |
| ------- | --------------------- | ------------------ | ---------------------------- |
| `./`  | `www.lkkllk404.top` | Pages              | Astro SSG + hand-written CSS |

Root domain `lkkllk404.top` should redirect to `www.lkkllk404.top`.

## Commands

```sh
pnpm install --frozen-lockfile  # install locked dependencies
pnpm dev                       # Astro dev server with HMR
pnpm build                     # static output to dist/
pnpm preview                   # preview the built site
```

The site deploys via Cloudflare Pages Git integration — push to `main` triggers auto-deploy.

## Conventions

- External component libraries are allowed but use cautiously — prefer hand-written CSS and minimal deps
- Blog posts are Markdown files under `src/content/blog/`
- Astro content collections are used for blog — follow Astro's content collection schema conventions
- Keep `src/` shallow: `content/` for authored content, `pages/` for routes, and shared `Layout.astro`, `global.css`, and `content.config.js` at its root. Keep Blog-only sorting and list markup in `pages/blog.astro`; Make sure the directory structure is simple.

## Design

Use plain document-style layouts with system fonts, clear navigation, and minimal decoration.
The two main pages are Home and Blog. Home contains profile information, contact links, and experience, with no projects section. Blog combines local Markdown posts and an index of writing on external platforms. All pages omit footers. Tab titles use only the page title, with no domain suffix.
Support mobile widths down to 320px and respect the system light/dark preference. Do not add animations, external fonts, or client-side data fetching for the core content.
Personal details currently use explicit placeholders at the owner's request. Maintain them in `src/content/profile.json`; external article metadata lives in `src/content/external.json`. Keep all authored content under `src/content/`.

## Gotchas

- Astro `output: 'static'` mode — no server-side rendering or API routes
- Run installation and scripts from the repository root; Cloudflare Pages publishes `dist/`
- `pnpm-workspace.yaml` holds pnpm settings and dependency build approvals, with no workspace subpackages
- Application code uses JavaScript and relative imports. The owner requested removal of `tsconfig.json` and `src/env.d.ts`; do not add them back for editor tooling alone.

## User context

The repo owner has a C/Python background and is new to web development. When asking design or implementation questions, briefly explain unfamiliar web concepts (CSS, SSG, DNS records, etc.) in terms of their existing knowledge. Do not assume familiarity with frontend/backend terminology.

## Style

- No emoji in code or markdown files unless explicitly requested
- Prefer existing patterns when adding new components

## Behavior

- Always pause and wait for confirmation after completing a major phase or feature, before running any git commit.
- After completing a task, run a quick smoke test (e.g. start `pnpm dev` and verify the dev server starts without errors) before marking it as done.
