import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

function buildGlobalStyles() {
  execSync('npm run build:sass', {
    cwd: packageRoot,
    stdio: 'inherit',
  });
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
