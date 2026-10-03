# Miro Gallery

A small, static HTML photo gallery with a Cloudflare Pages random image endpoint.

## Build and preview

Requires Node.js 22 or later and pnpm 10.

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

The build writes plain HTML, CSS, and photos to `dist/`. It does not run Astro or a client-side framework.

## Add photos

Put `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, or `.avif` files in `public/photos/`. The next build adds them to the gallery and updates the `GET /api` Cloudflare Pages Function so it redirects to a random image. With an empty photo directory, the page shows its empty state and `/api` returns 404.

## Cloudflare Pages

Connect this GitHub repository and set:

- Root directory: `/`
- Build command: `pnpm build`
- Build output directory: `dist`

The Pages Function lives in `functions/api.ts` and is published with the static files.
