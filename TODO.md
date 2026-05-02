# TODO.md

## Design decisions (done)

- [x] Homepage: A+B hybrid — dark minimal layout + code-as-art centerpiece
- [x] Color scheme: dark terminal palette (see AGENTS.md)
- [x] Blog: casual notes, `ls -la` listing style, terminal-styled post pages
- [x] No mobile adaptation in initial build
- [x] Chat auth: 8-char PSK login → session token → WebSocket
- [x] Chat UI: IRC terminal style, monospace, colored nicknames
- [x] Chat: no message history, real-time only
- [x] PSK = identity key, no separate `id` field

## Phase 0: Scaffolding (chat config)

- [x] Generate 5 random PSK values (8 chars, alnum + `!@#$`)
- [x] Create `chat/src/config.ts` — PSK → { name, color } mapping

## Phase 1: Project scaffolding

- [x] Create pnpm workspace root (`package.json`, `pnpm-workspace.yaml`, `.npmrc`)
- [x] Initialize `site/` package (Astro, astro.config.mjs, placeholder index.astro)
- [x] Initialize `chat/` package (wrangler.toml, Worker entry, Vite + React frontend scaffold)
- [x] Configure Cloudflare Pages for `site/` (Git integration, domain `www.lkkllk404.top`) — _manual_
- [x] Configure Cloudflare Worker for `chat/` (domain `chat.lkkllk404.top`) — _post-deploy_
- [x] Root domain `lkkllk404.top` → redirect to `www.lkkllk404.top` — _manual DNS_

## Phase 2: Static site (site/)

- [x] Global CSS (`site/src/styles/global.css`) — dark terminal color scheme, typography, spacing
- [x] Base layout (`site/src/layouts/Base.astro`) — shared HTML shell
- [x] Homepage (`site/src/pages/index.astro`)
  - Deep gradient background + CSS dot grid
  - Nav line: `~/home          # blog  chat`
  - Decorative C struct (syntax highlighted, non-interactive)
  - Commands: `> cat /blog`, `> nc chat 1337`
  - Footer blinking cursor
- [x] Blog listing page (`site/src/pages/blog/index.astro`) — `ls -la` style
- [x] Blog slug route (`site/src/pages/blog/[slug].astro`) — post detail
- [x] Astro content collection config for blog posts
- [x] First blog post (`site/src/content/blog/first-post.md`)
- [x] Build and verify static output

## Phase 3: Chat backend (chat/)

- [x] `chat/src/auth.ts` — PSK validation, session token generation (crypto-random hex)
- [x] `chat/src/index.ts` — Worker entry
  - `GET /` — serve React SPA static assets
  - `POST /login { psk }` — validate PSK, return session token + user info
  - `GET /ws?session=xxx` — validate session, upgrade to WebSocket
- [x] `chat/src/chatRoom.do.ts` — Durable Object
  - Map session → user info
  - Broadcast join/leave/message to all connected clients
  - Reject second connection from same PSK
- [x] wrangler.toml migrations for Durable Object
- [x] Test login endpoint locally with wrangler dev

## Phase 4: Chat frontend (chat/)

- [x] `chat/src/frontend/` — Vite + React SPA
- [x] Vite config — build output to `chat/public/`
- [x] **Login page** — prompt asking for password, enter to submit
  - SSH-style `$ ssh chat.lkkllk404.top` header
  - `password: [____]` input
  - Error message on wrong PSK: `Access denied`
- [x] **Chat page** — IRC terminal style
  - Monospace, dark background
  - `<nickname>` in per-user color
  - Messages appear as: `[HH:MM] <name> text`
  - System messages: `*** name joined/left`
  - Input line: `> [________________]`
  - Enter to send
  - Bottom status bar: `connected  users: 2/5`
- [x] `App.tsx` — state machine (login / chat), top-level layout
- [x] `LoginPage.tsx` — password input, auth API call
- [x] `ChatPage.tsx` — message list, input bar, status line, WS connection
- [x] WebSocket client — connect with session token, send/receive JSON, reconnect on drop
- [x] Styling: `app.css` — terminal dark theme, colors matching AGENTS.md

## Phase 5: Test

[x] End-to-end test: login → WebSocket → send/receive messages
