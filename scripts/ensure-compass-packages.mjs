import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
      '  or into ./compass-design, or set COMPASS_DESIGN_PATH.',
  );
  process.exit(1);
}

const packages = [
  {
    name: 'compass-ui',
    packageRoot: (designRoot) =>
      path.join(designRoot, 'packages/compass-ui'),
    distFiles: (packageRoot) => [
      path.join(packageRoot, 'dist/index.js'),
      path.join(packageRoot, 'dist/compass-ui.css'),
      path.join(packageRoot, 'dist/compass-ui-standalone.css'),
      path.join(packageRoot, 'dist/index.css'),
    ],
  },
  {
    name: 'compass-proto',
    packageRoot: (designRoot) =>
      path.join(designRoot, 'packages/compass-proto'),
    distFiles: (packageRoot) => [
      path.join(packageRoot, 'dist/index.js'),
      path.join(packageRoot, 'dist/index.css'),
    ],
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

function distIsStale(pkg, packageRoot, distFiles) {
  const newestInput = Math.max(
    newestSourceMtimeMs(path.join(packageRoot, 'src')),
    newestPackageRootBuildInputMtimeMs(packageRoot),
  );
  return newestInput > distMtimeMs(distFiles);
}

const designRoot = resolveCompassDesignRoot();
console.log(`[compass-design] Using ${designRoot}`);

for (const pkg of packages) {
  const packageRoot = pkg.packageRoot(designRoot);
  const distFiles = pkg.distFiles(packageRoot);

  if (!fs.existsSync(packageRoot)) {
    console.error(`[${pkg.name}] ${packageRoot} not found.`);
    process.exit(1);
  }

  const workspaceLink = path.join(root, `node_modules/@mattermost/${pkg.name}`);
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
      `../compass-design/packages/${pkg.name}`,
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
      `[${pkg.name}] ${broken ? 'node_modules link is broken' : 'node_modules link missing'}.\n` +
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

  if (!distReady(distFiles) || distIsStale(pkg, packageRoot, distFiles)) {
    console.log(`[${pkg.name}] Building in compass-design…`);
    execSync('npm run build:ui && npm run build:proto', {
      cwd: designRoot,
      stdio: 'inherit',
    });
    if (!distReady(distFiles)) {
      console.error(
        `[${pkg.name}] Build finished but dist/ is incomplete in ${packageRoot}`,
      );
      process.exit(1);
    }
  }

  console.log(`[${pkg.name}] Ready`);
}
