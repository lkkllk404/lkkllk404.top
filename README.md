# lkkllk404.top

Personal website and blog, deployed on Cloudflare Pages.

Requires Node.js >=22.12.0 (required by Astro) and pnpm 12.11.2. The pnpm version is pinned in `package.json`.

Install pnpm directly; Corepack is not required:

```sh
npm install --global pnpm@12.11.2
pnpm --version             # should print 12.11.2
```

pnpm manages its own project-specific version using the `packageManager` field.
The pnpm configuration explicitly sets `pmOnFail: download`, so a compatible pnpm
installation downloads and runs the pinned version when its version differs.
Node.js must still be installed separately.

## Structure

A single Astro static site at the repository root, serving
[www.lkkllk404.top](https://www.lkkllk404.top), with hand-written CSS.

```text
src/                 # Pages, layouts, styles, and blog content
public/              # Static assets, including avater.png
astro.config.mjs     # Astro configuration
tsconfig.json        # TypeScript configuration
package.json         # Commands and dependencies
pnpm-lock.yaml       # Locked dependency versions
pnpm-workspace.yaml  # pnpm settings and dependency build approvals
```

`pnpm-workspace.yaml` only holds pnpm configuration; there are no workspace subpackages.

## Development

```sh
pnpm install --frozen-lockfile
pnpm dev                  # Astro dev server with HMR
```

## Build

```sh
pnpm build                 # output: dist/
pnpm preview               # preview the built site locally
```

The site deploys automatically via Cloudflare Pages Git integration on push to `main`.
Configure the Pages build to use Node.js >=22.12.0 and pnpm 12.11.2
(`NODE_VERSION` / `PNPM_VERSION` in the build environment). Install from the
repository root with `pnpm install --frozen-lockfile`, build with `pnpm build`,
and publish `dist/`. Leave the Pages root directory unset (repository root).
When migrating from the old `site/` layout, update the Pages build output directory
from `site/dist` to `dist` before the next deployment.
This uses the committed lockfile and
`pnpm-workspace.yaml` build-script approvals.
Ensure the build environment installs pnpm directly rather than invoking it
through Corepack; the direct installation command above can be used to bootstrap
pnpm where the platform supports a custom dependency-install step.

## Site

Static homepage with a dark terminal aesthetic, a decorative C struct, and navigation to the blog. Blog posts are Markdown files in `src/content/blog/`.

## Design

Dark terminal aesthetic across all pages. No mobile adaptations.
