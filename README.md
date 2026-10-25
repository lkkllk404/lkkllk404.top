# lkkllk404.top

Personal website and blog, deployed on Cloudflare Pages.

Requires Node.js >=22.12.0 (required by Astro) and pnpm 12.11.2. The pnpm version is pinned in `package.json`.

## Pages and design

- `/`: profile, public links, and experience in one document.
- `/blog/`: pinned writing followed by year groups, newest first. Both local posts and external links are supported. Pinned entries appear once, in the pinned section.

The site uses system fonts, plain CSS, a responsive single-column document layout, and automatic light/dark colors based on the visitor's system preference.

## Edit content

- Profile and experience: edit `src/content/profile.json`.
- External article index: edit `src/content/external.json`.
- Local articles: add or edit Markdown files in `src/content/blog/`.

Article fields:

| Field           | Required      | Purpose                                                                          |
| --------------- | ------------- | -------------------------------------------------------------------------------- |
| `title`       | Yes           | Article title.                                                                   |
| `date`        | Yes           | Publication date (`YYYY-MM-DD`), used for display, sorting, and year grouping. |
| `description` | No            | Short summary displayed below the title in the Blog index.                       |
| `pinned`      | No            | `true` places the article in the pinned section only; defaults to `false`.   |
| `source`      | External only | Source platform label, such as GitHub or Zhihu. Required for external articles.  |
| `url`         | External only | Original HTTP/HTTPS article URL. Required for external articles.                 |

## Structure

A single Astro static site at the repository root, serving [www.lkkllk404.top](https://www.lkkllk404.top), with hand-written CSS.

```text
src/
  content/           # Profile, external article index, and local Markdown posts
  pages/
    index.astro      # Home
    blog.astro       # Blog index, including sorting, grouping, and list markup
    blog/[slug].astro # Shared local article route
  Layout.astro       # Shared document structure and navigation
  global.css         # All site styles
  content.config.js  # Local Markdown collection and field validation
public/              # Static assets, including avater.png
astro.config.mjs     # Astro configuration
package.json         # Commands and dependencies
pnpm-lock.yaml       # Locked dependency versions
pnpm-workspace.yaml  # pnpm settings and dependency build approvals
```

## Development

```sh
pnpm install
pnpm dev
```

## Build

```sh
pnpm build # output: dist/
pnpm preview
```

This uses the committed lockfile and `pnpm-workspace.yaml` build-script approvals.
