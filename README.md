# lkkllk404.top

Personal website and chat application, deployed on Cloudflare.

Requires Node.js >=22.12.0 (required by Astro) and pnpm 12.11.2. The pnpm version is pinned in `package.json`.

Install pnpm directly; Corepack is not required:

```sh
npm install --global pnpm@12.11.2
pnpm --version             # should print 12.11.2
```

pnpm manages its own project-specific version using the `packageManager` field.
The workspace explicitly sets `pmOnFail: download`, so a compatible pnpm
installation downloads and runs the pinned version when its version differs.
Node.js must still be installed separately.

## Structure

This is a pnpm monorepo with two independent packages:

| Package | Domain | Stack |
|---------|--------|-------|
| `site/` | [www.lkkllk404.top](https://www.lkkllk404.top) | Astro (static site), hand-written CSS |
| `chat/` | [chat.lkkllk404.top](https://chat.lkkllk404.top) | Cloudflare Workers, React SPA, Durable Objects |

## Development

```sh
pnpm install --frozen-lockfile
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
Configure both Cloudflare builds to use Node.js >=22.12.0 and pnpm 12.11.2
(`NODE_VERSION` / `PNPM_VERSION` in the build environment), and install from the
repository root with `pnpm install --frozen-lockfile` so both workspace packages
use the committed lockfile and `pnpm-workspace.yaml` build-script approvals.
Ensure the build environment installs pnpm directly rather than invoking it
through Corepack; the direct installation command above can be used to bootstrap
pnpm where the platform supports a custom dependency-install step.

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
