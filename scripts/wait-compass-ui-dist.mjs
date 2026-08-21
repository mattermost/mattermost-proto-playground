import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distFiles = [
  path.join(root, 'packages/compass-ui/dist/index.js'),
  path.join(root, 'packages/compass-ui/dist/compass-ui.css'),
  path.join(root, 'packages/compass-ui/dist/compass-ui-standalone.css'),
  path.join(root, 'packages/compass-ui/dist/index.css'),
  path.join(root, 'packages/compass-proto/dist/index.js'),
  path.join(root, 'packages/compass-proto/dist/index.css'),
];

function distReady() {
  return distFiles.every((file) => fs.existsSync(file));
}

const timeoutMs = 180_000;
const intervalMs = 100;
const started = Date.now();

while (!distReady()) {
  if (Date.now() - started > timeoutMs) {
    console.error(
      '[compass] Timed out waiting for dist/. Run: npm run build:ui && npm run build:proto',
    );
    process.exit(1);
  }
  await new Promise((resolve) => setTimeout(resolve, intervalMs));
}
