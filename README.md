# lkkllk404.top

Personal website and chat application, deployed on Cloudflare.

## Structure

This is a pnpm monorepo with two independent packages:

| Package | Domain | Stack |
|---------|--------|-------|
| `site/` | [www.lkkllk404.top](https://www.lkkllk404.top) | Astro (static site), hand-written CSS |
| `chat/` | [chat.lkkllk404.top](https://chat.lkkllk404.top) | Cloudflare Workers, React SPA, Durable Objects |

## Development

```sh
pnpm install

# Static site (Astro with HMR)
pnpm --filter site dev

# Chat app (Worker + Vite frontend)
pnpm --filter chat dev
```

## Build

```sh
pnpm --filter site build   # output: site/dist/
pnpm --filter chat build   # output: chat/public/ + worker bundle
```

Both packages deploy automatically via Cloudflare Git integration on push to `main`.

## Site

Static homepage with a dark terminal aesthetic, a decorative C struct, and navigation to the blog and chat. Blog posts are Markdown files in `site/src/content/blog/`.

## Chat

A real-time IRC-style chat room. Users authenticate with a pre-shared key (PSK), receive a session token, and connect via WebSocket. The chat has no message history -- it is real-time only. The backend runs on Cloudflare Workers with a Durable Object managing WebSocket connections and message broadcast.

## Design

Dark terminal aesthetic across all pages. No mobile adaptations.
