/**
 * Smoke test: build @mattermost/compass-proto (+ peer compass-ui), pack both
 * tarballs, install in a minimal Vite consumer, and verify the app builds.
 * Proto stays unpublished (private: true); npm pack still works for file: consumers.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const protoRoot = path.join(root, 'packages/compass-proto');
const uiRoot = path.join(root, 'packages/compass-ui');

const requiredProtoDist = [
  'dist/index.js',
  'dist/index.cjs',
  'dist/index.d.ts',
  'dist/index.css',
];

const requiredUiDist = [
  'dist/index.js',
  'dist/compass-ui.css',
  'dist/index.css',
];

function run(cmd, cwd = root) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function assertNoSourceOrStories(listing, label) {
  if (listing.includes('package/src/')) {
    throw new Error(`${label} tarball must not include package/src/`);
  }
  if (listing.includes('.stories.')) {
    throw new Error(`${label} tarball must not include Storybook stories`);
  }
}

function assertTarballContents(tarballPath, required, label) {
  const listing = execSync(`tar -tzf "${tarballPath}"`, { encoding: 'utf8' });
  for (const entry of required) {
    if (!listing.includes(`${entry}\n`) && !listing.endsWith(entry)) {
      throw new Error(`${label} tarball missing required entry: ${entry}`);
    }
  }
  assertNoSourceOrStories(listing, label);
}

function writeConsumer(tempDir, uiTarballPath, protoTarballPath) {
  const uiTgz = path.basename(uiTarballPath);
  const protoTgz = path.basename(protoTarballPath);
  fs.copyFileSync(uiTarballPath, path.join(tempDir, uiTgz));
  fs.copyFileSync(protoTarballPath, path.join(tempDir, protoTgz));

  fs.writeFileSync(
    path.join(tempDir, 'package.json'),
    JSON.stringify(
      {
        name: 'compass-proto-smoke-consumer',
        private: true,
        type: 'module',
        scripts: { build: 'vite build' },
        dependencies: {
          '@mattermost/compass-icons': '^0.1.63',
          '@mattermost/compass-ui': `file:./${uiTgz}`,
          '@mattermost/compass-proto': `file:./${protoTgz}`,
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          'simplebar-react': '^3.3.2',
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.3.4',
          vite: '^6.0.5',
        },
      },
      null,
      2,
    ),
  );

  fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(tempDir, 'index.html'),
    `<!doctype html>
<html lang="en" data-theme="denim">
  <head><meta charset="UTF-8" /><title>compass-proto smoke</title></head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>`,
  );

  fs.writeFileSync(
    path.join(tempDir, 'src', 'main.tsx'),
    `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@mattermost/compass-ui';
import { RecordingPill } from '@mattermost/compass-proto';
import '@mattermost/compass-ui/styles';
import '@mattermost/compass-ui/component-styles';
import '@mattermost/compass-proto/component-styles';

function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui', display: 'flex', gap: 16, alignItems: 'center' }}>
      <Button emphasis="Primary">Core</Button>
      <RecordingPill state="Recording" />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
);`,
  );

  fs.writeFileSync(
    path.join(tempDir, 'vite.config.ts'),
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
});`,
  );
}

function hasJsOutput(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && hasJsOutput(fullPath)) return true;
    if (entry.isFile() && entry.name.endsWith('.js')) return true;
  }
  return false;
}

console.log('[smoke-proto] Building @mattermost/compass-ui…');
run('npm run build --workspace=@mattermost/compass-ui');
console.log('[smoke-proto] Building @mattermost/compass-proto…');
run('npm run build --workspace=@mattermost/compass-proto');

for (const file of requiredUiDist) {
  const fullPath = path.join(uiRoot, file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing UI built file: ${file}`);
  }
}
for (const file of requiredProtoDist) {
  const fullPath = path.join(protoRoot, file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing proto built file: ${file}`);
  }
}

const packDir = mkdtempSync(path.join(tmpdir(), 'compass-proto-pack-'));

function packWorkspace(workspace) {
  const out = execSync(
    `npm pack --workspace=${workspace} --pack-destination "${packDir}"`,
    { cwd: root, encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] },
  );
  const tarballName = out
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .at(-1);
  if (!tarballName?.endsWith('.tgz')) {
    throw new Error(
      `npm pack (${workspace}) did not print a tarball name; got: ${JSON.stringify(out)}`,
    );
  }
  return path.join(packDir, tarballName);
}

console.log('[smoke-proto] Packing tarballs…');
const uiTarballPath = packWorkspace('@mattermost/compass-ui');
const protoTarballPath = packWorkspace('@mattermost/compass-proto');

assertTarballContents(
  uiTarballPath,
  [
    'package/package.json',
    'package/dist/index.js',
    'package/dist/compass-ui.css',
  ],
  'compass-ui',
);
assertTarballContents(
  protoTarballPath,
  [
    'package/package.json',
    'package/dist/index.js',
    'package/dist/index.cjs',
    'package/dist/index.css',
    'package/dist/index.d.ts',
  ],
  'compass-proto',
);
console.log('[smoke-proto] Tarball contents OK');

const pkgJson = JSON.parse(
  fs.readFileSync(path.join(protoRoot, 'package.json'), 'utf8'),
);
if (pkgJson.private !== true) {
  throw new Error('compass-proto must remain private: true (unpublished)');
}
console.log('[smoke-proto] private: true confirmed');

const consumerDir = mkdtempSync(path.join(tmpdir(), 'compass-proto-consumer-'));
try {
  writeConsumer(consumerDir, uiTarballPath, protoTarballPath);
  console.log('[smoke-proto] Installing tarballs in minimal Vite consumer…');
  run('npm install', consumerDir);
  console.log('[smoke-proto] Building consumer…');
  run('npm run build', consumerDir);

  if (!hasJsOutput(path.join(consumerDir, 'dist'))) {
    throw new Error('Consumer build produced no JS output');
  }
  console.log('[smoke-proto] Consumer build OK');
} finally {
  rmSync(consumerDir, { recursive: true, force: true });
  rmSync(packDir, { recursive: true, force: true });
}

console.log('[smoke-proto] All checks passed');
