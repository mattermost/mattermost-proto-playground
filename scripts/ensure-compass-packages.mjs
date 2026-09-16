import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

function resolveCompassDesignRoot() {
  if (process.env.COMPASS_DESIGN_PATH) {
    return path.resolve(process.env.COMPASS_DESIGN_PATH);
  }

  const candidates = [
    path.resolve(root, '../compass-design'),
    path.resolve(root, 'compass-design'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
  }

  console.error(
    'compass-design not found.\n' +
      '  Clone https://github.com/mattermost/compass-design next to this repo as ../compass-design,\n' +
      '  or into ./compass-design, or set COMPASS_DESIGN_PATH.\n' +
      '  Required for unpublished @mattermost/compass-proto (file: link).',
  );
  process.exit(1);
}

function assertNpmCompassUi() {
  let entryPath;
  try {
    entryPath = require.resolve('@mattermost/compass-ui');
  } catch {
    console.error(
      '[@mattermost/compass-ui] not installed.\n' +
        '  Run: npm install @mattermost/compass-ui',
    );
    process.exit(1);
  }

  const distDir = path.dirname(entryPath);
  const required = [
    path.join(distDir, 'index.js'),
    path.join(distDir, 'compass-ui.css'),
    path.join(distDir, 'compass-ui-standalone.css'),
    path.join(distDir, 'index.css'),
    // Subpath layout (0.1.0-alpha.3+) — consumers import components/* not the root barrel
    path.join(distDir, 'components/button/index.js'),
  ];
  const missing = required.filter((file) => !fs.existsSync(file));
  if (missing.length > 0) {
    console.error(
      '[@mattermost/compass-ui] package is incomplete (missing dist files):\n' +
        missing.map((file) => `  - ${file}`).join('\n') +
        '\n  Need 0.1.0-alpha.3+ with subpath exports. Run: npm install @mattermost/compass-ui@0.1.0-alpha.6',
    );
    process.exit(1);
  }

  const pkgJson = JSON.parse(
    fs.readFileSync(path.join(distDir, '..', 'package.json'), 'utf8'),
  );
  console.log(`[@mattermost/compass-ui] Ready (npm ${pkgJson.version})`);
}

function distReady(distFiles) {
  return distFiles.every((file) => fs.existsSync(file));
}

function distMtimeMs(distFiles) {
  if (!distReady(distFiles)) return 0;
  return Math.min(...distFiles.map((file) => fs.statSync(file).mtimeMs));
}

function newestSourceMtimeMs(dir) {
  if (!fs.existsSync(dir)) return 0;

  let newest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      newest = Math.max(newest, newestSourceMtimeMs(full));
      continue;
    }
    if (/\.(tsx?|scss)$/.test(entry.name)) {
      newest = Math.max(newest, fs.statSync(full).mtimeMs);
    }
  }
  return newest;
}

function newestPackageRootBuildInputMtimeMs(packageRoot) {
  let newest = 0;
  for (const entry of fs.readdirSync(packageRoot, { withFileTypes: true })) {
    if (entry.isFile() && /^vite.*\.ts$/.test(entry.name)) {
      newest = Math.max(
        newest,
        fs.statSync(path.join(packageRoot, entry.name)).mtimeMs,
      );
    }
  }
  return newest;
}

function distIsStale(packageRoot, distFiles) {
  const newestInput = Math.max(
    newestSourceMtimeMs(path.join(packageRoot, 'src')),
    newestPackageRootBuildInputMtimeMs(packageRoot),
  );
  return newestInput > distMtimeMs(distFiles);
}

assertNpmCompassUi();

const designRoot = resolveCompassDesignRoot();
console.log(`[compass-design] Using ${designRoot}`);

const protoRoot = path.join(designRoot, 'packages/compass-proto');
const protoDistFiles = [
  path.join(protoRoot, 'dist/index.js'),
  path.join(protoRoot, 'dist/index.css'),
];

if (!fs.existsSync(protoRoot)) {
  console.error(`[compass-proto] ${protoRoot} not found.`);
  process.exit(1);
}

const workspaceLink = path.join(root, 'node_modules/@mattermost/compass-proto');
let linkExists = false;
try {
  fs.statSync(workspaceLink);
  linkExists = true;
} catch {
  linkExists = false;
}

if (!linkExists) {
  const expectedFileDep = path.resolve(
    root,
    '../compass-design/packages/compass-proto',
  );
  const broken =
    fs.existsSync(workspaceLink) ||
    (() => {
      try {
        fs.lstatSync(workspaceLink);
        return true;
      } catch {
        return false;
      }
    })();

  console.error(
    `[compass-proto] ${broken ? 'node_modules link is broken' : 'node_modules link missing'}.\n` +
      '  Expected sibling layout:\n' +
      '    parent/\n' +
      '      compass-design/\n' +
      '      mattermost-proto-playground/   ← run npm install here\n' +
      `  Package path: ${expectedFileDep}\n` +
      (fs.existsSync(expectedFileDep) ? '' : '  (that path does not exist yet)\n') +
      '  Then: rm -rf node_modules && npm install && npm run dev',
  );
  process.exit(1);
}

const linkedProtoRoot = fs.realpathSync(workspaceLink);
const expectedProtoRoot = fs.realpathSync(protoRoot);
if (linkedProtoRoot !== expectedProtoRoot) {
  console.error(
    '[compass-proto] node_modules link does not match the ensure-script source.\n' +
      `  Linked:  ${linkedProtoRoot}\n` +
      `  Expected: ${expectedProtoRoot}\n` +
      '  COMPASS_DESIGN_PATH only affects which tree this script builds.\n' +
      '  npm still resolves the package.json `file:` dependency from ../compass-design.\n' +
      '  Symlink that sibling path (or align COMPASS_DESIGN_PATH), then reinstall.',
  );
  process.exit(1);
}

if (!distReady(protoDistFiles) || distIsStale(protoRoot, protoDistFiles)) {
  console.log('[compass-proto] Building in compass-design…');
  execSync('npm run build:proto', {
    cwd: designRoot,
    stdio: 'inherit',
  });
  if (!distReady(protoDistFiles)) {
    console.error(
      `[compass-proto] Build finished but dist/ is incomplete in ${protoRoot}`,
    );
    process.exit(1);
  }
}

console.log('[compass-proto] Ready');
