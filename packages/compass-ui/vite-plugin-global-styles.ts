import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

function buildGlobalStyles() {
  execSync(
    'sass src/styles/entry.scss dist/compass-ui.css --load-path=src/styles --no-source-map',
    { cwd: packageRoot, stdio: 'inherit' },
  );
}

export function compassUiGlobalStyles(): Plugin {
  return {
    name: 'compass-ui-global-styles',
    buildStart() {
      buildGlobalStyles();
    },
    closeBundle() {
      buildGlobalStyles();
    },
  };
}
