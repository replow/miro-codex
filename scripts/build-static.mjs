import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const photoDirectory = path.join(root, 'public', 'photos');
const supportedExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']);

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return entities[character];
  });
}

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
await fs.copyFile(path.join(root, 'styles.css'), path.join(output, 'styles.css'));
await fs.copyFile(path.join(root, 'api-docs.html'), path.join(output, 'api-docs.html'));
await fs.copyFile(path.join(root, 'photo-viewer.html'), path.join(output, 'photo-viewer.html'));
await fs.copyFile(path.join(root, 'photo-viewer.js'), path.join(output, 'photo-viewer.js'));

let photoNames = [];
try {
  photoNames = (await fs.readdir(photoDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' }));
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
}

const gallery = photoNames
  .map((name, index) => {
    const src = `/photos/${encodeURIComponent(name)}`;
    const alt = escapeHtml(name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
    const loading = index < 3 ? 'eager' : 'lazy';
    const viewerUrl = `/photo-viewer?src=${encodeURIComponent(src)}`;
    return `            <a class="photo-link" href="${viewerUrl}" aria-label="查看图片：${alt}"><img src="${src}" alt="${alt}" loading="${loading}" decoding="async"></a>`;
  })
  .join('\n');

let html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
html = html
  .replace(/<span data-photo-count>\d+<\/span>/, `<span data-photo-count>${photoNames.length}</span>`)
  .replace('<!-- PHOTO_GALLERY -->', gallery)
  .replace('class="no-photos"', `class="${photoNames.length > 0 ? 'has-photos' : 'no-photos'}"`);
await fs.writeFile(path.join(output, 'index.html'), html);

if (photoNames.length > 0) {
  await fs.mkdir(path.join(output, 'photos'), { recursive: true });
  await Promise.all(photoNames.map((name) => fs.copyFile(path.join(photoDirectory, name), path.join(output, 'photos', name))));
}

console.log(`Built standalone HTML gallery with ${photoNames.length} image(s) in dist/.`);
