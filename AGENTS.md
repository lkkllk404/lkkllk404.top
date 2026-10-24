## Architecture

Single Astro static site at the repository root, managed with pnpm and deployed to Cloudflare Pages:

| Package | Domain | Cloudflare Service | Tech |
|---------|--------|--------------------|------|
| `./` | `www.lkkllk404.top` | Pages | Astro SSG + hand-written CSS |

Root domain `lkkllk404.top` should redirect to `www.lkkllk404.top`.

## Commands

```sh
pnpm install --frozen-lockfile  # install locked dependencies
pnpm dev                       # Astro dev server with HMR
pnpm build                     # static output to dist/
pnpm preview                   # preview the built site
```

The site deploys via Cloudflare Pages Git integration — push to `main` triggers auto-deploy.

## Git workflow

- `main` is the production branch — never commit directly to `main` for fixes or features
- Bug fixes: create a `fix/<description>` branch, commit there, test, then merge to `main`
- New features/experiments: create a `feat/<description>` branch
- Bug fix workflow:
  1. Create `fix/<description>` branch from `main`
  2. Fix the bug, build, and test locally
  3. Commit the fix
  4. Wait for review and confirmation before merging to `main`
- Trivial fixes (typo, formatting) don't need a branch — commit directly to `main`

## Conventions

- External component libraries are allowed but use cautiously — prefer hand-written CSS and minimal deps
- Blog posts are Markdown files under `src/content/blog/`
- Astro content collections are used for blog — follow Astro's content collection schema conventions

## Design

Dark terminal aesthetic across all pages. No mobile adaptations needed.
The existing CSS file (`src/styles/global.css`) defines the current color scheme — use it as a reference, not as a rule. New pages should feel consistent with the overall terminal vibe but don't need to copy the same layout or exact color values.

## Gotchas

- Astro `output: 'static'` mode — no server-side rendering or API routes
- Run installation and scripts from the repository root; Cloudflare Pages publishes `dist/`
- `pnpm-workspace.yaml` holds pnpm settings and dependency build approvals, with no workspace subpackages

## User context

The repo owner has a C/Python background and is new to web development. When asking design or implementation questions, briefly explain unfamiliar web concepts (CSS, SSG, DNS records, etc.) in terms of their existing knowledge. Do not assume familiarity with frontend/backend terminology.

## Style

- No emoji in code or markdown files unless explicitly requested
- Prefer existing patterns when adding new components

## Behavior

- Always pause and wait for my confirmation after completing a major phase or feature, before running any git commit.
- After completing a task, run a quick smoke test (e.g. start `pnpm dev` and verify the dev server starts without errors) before marking it as done.
