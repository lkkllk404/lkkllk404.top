# AGENTS.md

## Architecture

pnpm monorepo with two independent packages deploying to different Cloudflare services:

| Package | Domain | Cloudflare Service | Tech |
|---------|--------|--------------------|------|
| `site/` | `lkkllk404.top` | Pages | Astro SSG + hand-written CSS |
| `chat/` | `chat.lkkllk404.top` | Worker | React SPA + Workers + Durable Objects |

`site/` and `chat/` share no runtime code. They are in the same repo for convenience only.

## Commands

```sh
# Site (Astro)
pnpm --filter site dev          # dev server with HMR
pnpm --filter site build        # static output to site/dist/

# Chat (Worker + React frontend)
pnpm --filter chat dev          # Worker dev with wrangler, frontend with Vite
pnpm --filter chat build        # bundle frontend + Worker
pnpm --filter chat deploy       # wrangler deploy to chat.lkkllk404.top
```

Always run `build` before `deploy` for the chat package. Astro site deploys via Cloudflare Pages Git integration — no manual deploy needed.

## Conventions

- No comments in code unless explicitly requested
- Blog uses hand-written CSS only (no Tailwind, no component library)
- Chat frontend uses React with minimal dependencies
- Blog posts are Markdown files under `site/src/content/blog/`
- Astro content collections are used for blog — follow Astro's content collection schema conventions

## Gotchas

- Durable Objects require `wrangler.toml` migrations — run `wrangler migrations` after schema changes
- Cloudflare Workers do not support Node.js APIs; use Cloudflare-specific runtime APIs
- WebSocket upgrade in Workers must return a `Response` with `webSocket` property — follow Cloudflare's WebSocket pattern, not standard Node ws library patterns
- Chat frontend builds to `chat/public/` so the Worker can serve static assets directly
- Astro `output: 'static'` mode — no server-side rendering or API routes in the site package

## Style

- Minimalist, content-focused design for blog
- No emoji in code or markdown files unless explicitly requested
- Prefer existing patterns when adding new components