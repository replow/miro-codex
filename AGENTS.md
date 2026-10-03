# Repository Guidelines

This is a plain HTML/CSS photo gallery for Cloudflare Pages. Do not add Astro, React, or a client-side framework. The page source is `index.html`, styles are in `styles.css`, and the dependency-free build script is `scripts/build-static.mjs`.

Add gallery images to `public/photos/`. `pnpm build` regenerates the image list in `functions/_shared/photos.ts` and writes the deployable site to `dist/`. The Cloudflare Pages Function is `functions/api.ts`.
