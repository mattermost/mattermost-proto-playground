import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = path.join(root, 'packages/compass-ui');
const distEntry = path.join(packageRoot, 'dist/index.js');

if (!fs.existsSync(packageRoot)) {
  console.warn(
    '[compass-ui] packages/compass-ui not found. Checkout the UI extraction branch and run npm install from the repo root.',
  );
  process.exit(0);
}

if (!fs.existsSync(distEntry)) {
  console.log('[compass-ui] Building @mattermost/compass-ui (first run)…');
  execSync('npm run build:ui', { cwd: root, stdio: 'inherit' });
}
