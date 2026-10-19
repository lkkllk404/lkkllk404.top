# lkkllk404.top

Personal website and blog, deployed on Cloudflare Pages.

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

This is a pnpm workspace containing the static site package:

| Package | Domain | Stack |
|---------|--------|-------|
| `site/` | [www.lkkllk404.top](https://www.lkkllk404.top) | Astro (static site), hand-written CSS |

## Development

```sh
pnpm install --frozen-lockfile
pnpm dev                  # Astro dev server with HMR
# Equivalent: pnpm --filter site dev
```

## Build

```sh
pnpm build                 # output: site/dist/
# Equivalent: pnpm --filter site build
```

The site deploys automatically via Cloudflare Pages Git integration on push to `main`.
Configure the Pages build to use Node.js >=22.12.0 and pnpm 12.11.2
(`NODE_VERSION` / `PNPM_VERSION` in the build environment). Install from the
repository root with `pnpm install --frozen-lockfile`, build with `pnpm build`,
and publish `site/dist/`. This uses the committed lockfile and
`pnpm-workspace.yaml` build-script approvals.
Ensure the build environment installs pnpm directly rather than invoking it
through Corepack; the direct installation command above can be used to bootstrap
pnpm where the platform supports a custom dependency-install step.

## Site

Static homepage with a dark terminal aesthetic, a decorative C struct, and navigation to the blog. Blog posts are Markdown files in `site/src/content/blog/`.

## Design

Dark terminal aesthetic across all pages. No mobile adaptations.
