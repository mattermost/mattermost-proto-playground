import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = path.join(root, 'packages/compass-ui');
const distFiles = [
  path.join(packageRoot, 'dist/index.js'),
  path.join(packageRoot, 'dist/compass-ui.css'),
  path.join(packageRoot, 'dist/index.css'),
];

function distReady() {
  return distFiles.every((file) => fs.existsSync(file));
}

if (!fs.existsSync(packageRoot)) {
  console.error(
    '[compass-ui] packages/compass-ui not found.\n' +
      '  Checkout branch cursor/ui-library-extraction-plan and run npm install from the repo root.',
  );
  process.exit(1);
}

const workspaceLink = path.join(root, 'node_modules/@mattermost/compass-ui');
if (!fs.existsSync(workspaceLink)) {
  console.error(
    '[compass-ui] Workspace link missing.\n' +
      '  Run npm install from the repo root (not inside packages/compass-ui).',
  );
  process.exit(1);
}

if (!distReady()) {
  console.log('[compass-ui] Building @mattermost/compass-ui…');
  execSync('npm run build:ui', { cwd: root, stdio: 'inherit' });
  if (!distReady()) {
    console.error('[compass-ui] Build finished but dist/ is incomplete. Run: npm run build:ui');
    process.exit(1);
  }
}

console.log('[compass-ui] Ready (dist/index.js + CSS)');
