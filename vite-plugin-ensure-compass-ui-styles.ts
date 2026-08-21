import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const packageRoot = path.join(root, 'packages/compass-ui');
const cssPath = path.join(packageRoot, 'dist/compass-ui.css');
const standaloneCssPath = path.join(
  packageRoot,
  'dist/compass-ui-standalone.css',
);
const stylesImport = '@mattermost/compass-ui/styles';
const standaloneStylesImport = '@mattermost/compass-ui/styles/standalone';

function buildGlobalStyles() {
  execSync('npm run build:sass --workspace=@mattermost/compass-ui', {
    cwd: root,
    stdio: 'inherit',
  });
}

export function ensureCompassUiStyles(): Plugin {
  const ensureCss = () => {
    if (!fs.existsSync(cssPath) || !fs.existsSync(standaloneCssPath)) {
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
      if (source === standaloneStylesImport) {
        ensureCss();
        return standaloneCssPath;
      }
    },
    load(id) {
      if (id === cssPath || id === standaloneCssPath) {
        ensureCss();
        return fs.readFileSync(id, 'utf-8');
      }
    },
  };
}
