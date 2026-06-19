# lkkllk404.top

Personal website and chat application, deployed on Cloudflare.

Requires pnpm 11.7.0. Corepack will use the pinned version from `package.json`.

## Structure

This is a pnpm monorepo with two independent packages:

| Package | Domain | Stack |
|---------|--------|-------|
| `site/` | [www.lkkllk404.top](https://www.lkkllk404.top) | Astro (static site), hand-written CSS |
| `chat/` | [chat.lkkllk404.top](https://chat.lkkllk404.top) | Cloudflare Workers, React SPA, Durable Objects |

## Development

```sh
pnpm install
pnpm typecheck

# Static site (Astro with HMR)
pnpm --filter site dev

# Chat app (Worker + Vite frontend)
pnpm --filter chat dev
```

## Build

```sh
pnpm build                 # build both packages
pnpm --filter site build   # output: site/dist/
pnpm --filter chat build   # typecheck + output: chat/public/ + worker dry-run bundle
```

Both packages deploy automatically via Cloudflare Git integration on push to `main`.

## Site

Static homepage with a dark terminal aesthetic, a decorative C struct, and navigation to the blog and chat. Blog posts are Markdown files in `site/src/content/blog/`.

## Chat

A real-time IRC-style chat room. Users authenticate with a pre-shared key (PSK), receive a session token, and connect via WebSocket. The backend runs on Cloudflare Workers with a Durable Object managing WebSocket connections, message broadcast, and recent message history. Recent messages are stored in Durable Object SQLite; older messages are archived to D1.

D1 migrations can be applied manually when needed:

```sh
pnpm --filter chat db:migrate:local
pnpm --filter chat db:migrate:remote
```

The Worker also creates the D1 archive table defensively before archiving, so a missed migration should not break chat traffic.

## Design

Dark terminal aesthetic across all pages. No mobile adaptations.
