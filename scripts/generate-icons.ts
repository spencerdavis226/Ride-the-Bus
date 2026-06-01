import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceIcon = resolve(root, 'assets/brand/ride-the-bus-icon.png');

async function writePng(path: string, size: number) {
  await sharp(sourceIcon)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(root, path));
}

await mkdir(resolve(root, 'public/icons'), { recursive: true });
await writePng('public/icon.png', 512);
await writePng('public/favicon.png', 64);
await writePng('public/icons/icon-192.png', 192);
await writePng('public/icons/icon-512.png', 512);
await writePng('public/apple-touch-icon.png', 180);

console.log('Generated PWA icons from assets/brand/ride-the-bus-icon.png');
