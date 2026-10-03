import type { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const supportedExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']);

export interface Photo {
  src: string;
  alt: string;
}

export async function getPhotoPaths(): Promise<Photo[]> {
  const directory = path.join(process.cwd(), 'public', 'photos');
  let entries: Dirent[];

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  }

  return entries
    .filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => {
      const name = entry.name.replace(/\.[^.]+$/, '');
      return {
        src: `/photos/${encodeURIComponent(entry.name)}`,
        alt: name.replace(/[-_]+/g, ' '),
      };
    })
    .sort((a, b) => a.src.localeCompare(b.src, 'zh-CN', { numeric: true, sensitivity: 'base' }));
}
