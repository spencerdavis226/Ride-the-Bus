import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const root = resolve(import.meta.dirname, '..');
const svg = await readFile(resolve(root, 'public/icon.svg'));

async function writePng(path: string, size: number) {
  const renderer = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: '#0b2f25'
  });
  await writeFile(resolve(root, path), renderer.render().asPng());
}

await mkdir(resolve(root, 'public/icons'), { recursive: true });
await writePng('public/icons/icon-192.png', 192);
await writePng('public/icons/icon-512.png', 512);
await writePng('public/apple-touch-icon.png', 180);

console.log('Generated PWA icons from public/icon.svg');
