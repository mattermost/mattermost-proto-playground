import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const packageRoot = path.join(root, 'packages/compass-ui');
const cssPath = path.join(packageRoot, 'dist/compass-ui.css');
const stylesImport = '@mattermost/compass-ui/styles';

function buildGlobalStyles() {
  execSync('npm run build:sass --workspace=@mattermost/compass-ui', {
    cwd: root,
    stdio: 'inherit',
  });
}

export function ensureCompassUiStyles(): Plugin {
  const ensureCss = () => {
    if (!fs.existsSync(cssPath)) {
      buildGlobalStyles();
    }
  };

  return {
    name: 'ensure-compass-ui-styles',
    enforce: 'pre',
    configureServer() {
      ensureCss();
    },
    buildStart() {
      ensureCss();
    },
    resolveId(source) {
      if (source === stylesImport) {
        ensureCss();
        return cssPath;
      }
    },
    load(id) {
      if (id === cssPath) {
        ensureCss();
        return fs.readFileSync(cssPath, 'utf-8');
      }
    },
  };
}
