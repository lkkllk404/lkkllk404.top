# AGENTS.md

## Architecture

pnpm monorepo with two independent packages deploying to different Cloudflare services:

| Package | Domain | Cloudflare Service | Tech |
|---------|--------|--------------------|------|
| `site/` | `www.lkkllk404.top` | Pages | Astro SSG + hand-written CSS |
| `chat/` | `chat.lkkllk404.top` | Worker | React SPA + Workers + Durable Objects |

`site/` and `chat/` share no runtime code. They are in the same repo for convenience only.

Root domain `lkkllk404.top` should redirect to `www.lkkllk404.top`.

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

## Design

Dark terminal aesthetic across all pages.

### Color scheme

| Use | Value |
|-----|-------|
| Page background | `#0a0a12` (deep blue-black) |
| Body text | `#c9d1d9` (light gray-white) |
| Keywords | `#c792ea` (purple, VSCode type color) |
| Strings | `#ecc48d` (amber) |
| Comments | `#54546d` (muted purple-gray) |
| Prompt | `#7ee787` (terminal green) |
| Link hover | `#58a6ff` (blue) |
| Decor / separators | `#30363d` (subtle border gray) |

### Homepage (`www.lkkllk404.top/`)

Code-as-art + dark minimal hybrid:
- Deep blue-black gradient background with subtle CSS dot grid overlay
- Top-left nav as terminal path: `~/home          # blog  chat`
- Center: decorative C-style struct describing the site (syntax-highlighted, non-interactive)
- Below: two clickable shell commands: `> cat /blog` and `> nc chat 1337`
- Footer: `[user@www ~]$ _` with blinking cursor
- Monospace font throughout

### Blog

- Listing page: `ls -la` style output (date + title per line)
- Post page: clean readable text, terminal-styled header/decor

### Chat (`chat.lkkllk404.top/`)

IRC terminal-style interface:
- PSK (8-char password) login → session token → WebSocket upgrade
- Monospace dark layout: `[time] <nickname> message`
- Per-user colored nicknames, green prompt prefix
- Login page mimics `ssh chat.lkkllk404.top` prompt
- No message history in first build
- 5 hardcoded users in `chat/src/config.ts`

### No mobile-first

No responsive/mobile adaptations needed in the initial build.

## Gotchas

- Durable Objects require `wrangler.toml` migrations — run `wrangler migrations` after schema changes
- Cloudflare Workers do not support Node.js APIs; use Cloudflare-specific runtime APIs
- WebSocket upgrade in Workers must return a `Response` with `webSocket` property — follow Cloudflare's WebSocket pattern, not standard Node ws library patterns
- Chat frontend builds to `chat/public/` so the Worker can serve static assets directly
- Astro `output: 'static'` mode — no server-side rendering or API routes in the site package

## User context

The repo owner has a C/Python background and is new to web development. When asking design or implementation questions, briefly explain unfamiliar web concepts (CSS, SSG, WebSocket, DNS records, etc.) in terms of their existing knowledge. Do not assume familiarity with frontend/backend terminology.

## Style

- No emoji in code or markdown files unless explicitly requested
- Prefer existing patterns when adding new components
