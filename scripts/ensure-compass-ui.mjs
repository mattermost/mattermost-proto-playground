import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const packages = [
  {
    name: 'compass-ui',
    workspace: '@mattermost/compass-ui',
    packageRoot: path.join(root, 'packages/compass-ui'),
    distFiles: [
      path.join(root, 'packages/compass-ui/dist/index.js'),
      path.join(root, 'packages/compass-ui/dist/compass-ui.css'),
      path.join(root, 'packages/compass-ui/dist/compass-ui-standalone.css'),
      path.join(root, 'packages/compass-ui/dist/index.css'),
    ],
    buildScript: 'build:ui',
  },
  {
    name: 'compass-proto',
    workspace: '@mattermost/compass-proto',
    packageRoot: path.join(root, 'packages/compass-proto'),
    distFiles: [
      path.join(root, 'packages/compass-proto/dist/index.js'),
      path.join(root, 'packages/compass-proto/dist/index.css'),
    ],
    buildScript: 'build:proto',
  },
];

function distReady(distFiles) {
  return distFiles.every((file) => fs.existsSync(file));
}

function distMtimeMs(distFiles) {
  if (!distReady(distFiles)) return 0;
  return Math.min(...distFiles.map((file) => fs.statSync(file).mtimeMs));
}

function newestSourceMtimeMs(dir) {
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

/** Package-root Vite config / plugins that affect the build but live outside src/. */
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

function distIsStale(pkg) {
  const newestInput = Math.max(
    newestSourceMtimeMs(path.join(pkg.packageRoot, 'src')),
    newestPackageRootBuildInputMtimeMs(pkg.packageRoot),
  );
  return newestInput > distMtimeMs(pkg.distFiles);
}

for (const pkg of packages) {
  if (!fs.existsSync(pkg.packageRoot)) {
    console.error(`[${pkg.name}] packages/${pkg.name} not found.`);
    process.exit(1);
  }

  const workspaceLink = path.join(root, `node_modules/@mattermost/${pkg.name}`);
  if (!fs.existsSync(workspaceLink)) {
    console.error(
      `[${pkg.name}] Workspace link missing.\n` +
        '  Run npm install from the repo root.',
    );
    process.exit(1);
  }

  if (!distReady(pkg.distFiles) || distIsStale(pkg)) {
    console.log(`[${pkg.name}] Building ${pkg.workspace}…`);
    execSync(`npm run ${pkg.buildScript}`, { cwd: root, stdio: 'inherit' });
    if (!distReady(pkg.distFiles)) {
      console.error(
        `[${pkg.name}] Build finished but dist/ is incomplete. Run: npm run ${pkg.buildScript}`,
      );
      process.exit(1);
    }
  }

  console.log(`[${pkg.name}] Ready`);
}
