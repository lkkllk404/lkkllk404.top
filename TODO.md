# TODO.md

## Phase 1: Project scaffolding

- [ ] Create pnpm workspace root (`package.json`, `pnpm-workspace.yaml`)
- [ ] Initialize `site/` package (Astro, astro.config.mjs, base layout)
- [ ] Initialize `chat/` package (wrangler.toml, Worker entry, React frontend scaffold)
- [ ] Configure Cloudflare Pages for `site/` (Git integration)
- [ ] Configure Cloudflare Worker for `chat/` (wrangler.toml, custom domain chat.lkkllk404.top)

## Phase 2: Static site (site/)

- [ ] Welcome page (`site/src/pages/index.astro`) — minimalist landing
- [ ] Hand-written global CSS (`site/src/styles/global.css`) — typography, spacing, color
- [ ] Base layout (`site/src/layouts/Base.astro`)
- [ ] Blog page and slug route (`site/src/pages/blog/[slug].astro`)
- [ ] Astro content collection config for blog posts
- [ ] First blog post (`site/src/content/blog/first-post.md`)
- [ ] Build and verify static output

## Phase 3: Chat backend (chat/)

- [ ] Worker entry (`chat/src/index.ts`) — HTTP routing + WebSocket upgrade
- [ ] ChatRoom Durable Object (`chat/src/chatRoom.do.ts`) — room state, message broadcast, user join/leave
- [ ] wrangler.toml migrations for Durable Object
- [ ] Test WebSocket connection locally with wrangler dev

## Phase 4: Chat frontend (chat/)

- [ ] React SPA entry (`chat/src/frontend/index.html`, `app.tsx`)
- [ ] Vite config to build frontend into `chat/public/`
- [ ] MessageList component
- [ ] ChatInput component
- [ ] UserList component
- [ ] WebSocket client logic (connect, send, receive, reconnect)
- [ ] Chat room styling (`app.css`)

## Phase 5: Integration and deploy

- [ ] End-to-end test: chat frontend → Worker WebSocket
- [ ] Deploy chat Worker (`pnpm --filter chat build && pnpm --filter chat deploy`)
- [ ] Verify Cloudflare Pages auto-deploy for site
- [ ] DNS records: `lkkllk404.top` → Pages, `chat.lkkllk404.top` → Worker