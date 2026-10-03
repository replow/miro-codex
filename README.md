# miro-codex

一个中文 ACG 与代码主题站，使用 [Astro Koharu](https://github.com/cosZone/astro-koharu) 构建。站点默认静态输出，适合部署到 Cloudflare Pages。

## 本地开发

需要 Node.js 22.20.0 或更新版本，以及 pnpm 10.28.2。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

本地预览地址为 `http://localhost:4321`。修改站点名称、描述、导航和功能开关，请编辑 `config/site.yaml`；文章位于 `src/content/blog/`。

## Cloudflare Pages

在 Cloudflare Pages 中连接此 GitHub 仓库，并设置：

- Root directory：`/`
- Build command：`pnpm build`
- Build output directory：`dist`
- Node.js：`22.20.0`（仓库通过 `.nvmrc` 固定版本；pnpm 版本固定在 `package.json`）

`config/site.yaml` 中的 `site.url` 当前设置为 `https://miro-codex.pages.dev`。如 Pages 项目使用其他名称或绑定了自定义域名，请一并更新该值。

## 图片图库与随机图片 API

把 `.jpg`、`.jpeg`、`.png`、`.webp`、`.gif` 或 `.avif` 图片放入 `public/photos/`，首页会在构建时自动列出它们，浏览器访问路径为 `/photos/文件名`。Cloudflare Pages Function 提供 `GET /api`，每次请求会随机重定向到一张图片；目录没有图片时返回 404。此 API 需要部署在 Cloudflare Pages 上运行。

## 主题与许可

主题使用上游 Astro Koharu `v7.0.1`，对应源代码和许可证见 [上游说明](./ASTRO-KOHARU-README.md) 与 [Astro Koharu 许可证](./LICENSE-ASTRO-KOHARU)。本仓库原有的 [MIT 许可证](./LICENSE) 已保留。
