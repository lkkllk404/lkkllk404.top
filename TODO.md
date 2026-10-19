# TODO.md

## Design decisions (done)

- [x] Homepage: A+B hybrid — dark minimal layout + code-as-art centerpiece
- [x] Color scheme: dark terminal palette (see AGENTS.md)
- [x] Blog: casual notes, `ls -la` listing style, terminal-styled post pages
- [x] No mobile adaptation in initial build

## Phase 1: Project scaffolding

- [x] Create pnpm workspace root (`package.json`, `pnpm-workspace.yaml`)
- [x] Initialize `site/` package (Astro, astro.config.mjs, placeholder index.astro)
- [x] Configure Cloudflare Pages for `site/` (Git integration, domain `www.lkkllk404.top`) — _manual_
- [x] Root domain `lkkllk404.top` → redirect to `www.lkkllk404.top` — _manual DNS_

## Phase 2: Static site (site/)

- [x] Global CSS (`site/src/styles/global.css`) — dark terminal color scheme, typography, spacing
- [x] Base layout (`site/src/layouts/Base.astro`) — shared HTML shell
- [x] Homepage (`site/src/pages/index.astro`)
  - Deep gradient background + CSS dot grid
  - Nav line: `~/home          # blog`
  - Decorative C struct (syntax highlighted, non-interactive)
  - Command: `> cat /blog`
  - Footer blinking cursor
- [x] Blog listing page (`site/src/pages/blog/index.astro`) — `ls -la` style
- [x] Blog slug route (`site/src/pages/blog/[slug].astro`) — post detail
- [x] Astro content collection config for blog posts
- [x] First blog post (`site/src/content/blog/first-post.md`)
- [x] Build and verify static output

## Tooling

- [x] Move pnpm build-script approvals to `pnpm-workspace.yaml`
- [x] Migrate to pnpm 12.11.2 and verify frozen-lockfile install, builds, and local dev startup
- [x] Remove the Corepack requirement and verify direct pnpm installation, builds, and local dev startup
- [ ] Verify Node.js / direct pnpm installation in the Cloudflare Pages build environment — _manual_

## Chat retirement

- [x] Remove the chat package, workspace entry, scripts, and unused dependencies
- [x] Remove chat links and the homepage's decorative chat field
- [x] Update documentation and verify site-only install, build, and local navigation
- [ ] Disable the former chat Worker's Git auto-deployment and remove its custom domain / DNS records — _manual_
- [ ] Decide whether to back up retained chat data before deleting the former Worker, Durable Objects, and D1 database — _manual; do not delete data automatically_

## Issues & future features

- [ ] Add favicon to site
