import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const photosDirectory = path.join(root, 'public', 'photos');
const manifestPath = path.join(root, 'functions', '_shared', 'photos.ts');
const supportedExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']);

await fs.mkdir(path.dirname(manifestPath), { recursive: true });

let entries = [];
try {
  entries = await fs.readdir(photosDirectory, { withFileTypes: true });
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
}

const photoPaths = entries
  .filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
  .map((entry) => `/photos/${encodeURIComponent(entry.name)}`)
  .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' }));

await fs.writeFile(manifestPath, `export const photoPaths = ${JSON.stringify(photoPaths, null, 2)} as const;\n`);
console.log(`Generated photo manifest with ${photoPaths.length} image(s).`);
