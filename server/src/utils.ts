import fs from 'fs-extra';
import path from 'path';

export async function cleanupUploads(filePaths: string[]) {
  for (const filePath of filePaths) {
    if (filePath && await fs.exists(filePath)) {
      await fs.remove(filePath);
    }
  }
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
