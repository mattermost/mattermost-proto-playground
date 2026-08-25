import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { Plugin } from 'vite';

const require = createRequire(import.meta.url);

const stylesImport = '@mattermost/compass-ui/styles';
const standaloneStylesImport = '@mattermost/compass-ui/styles/standalone';

function resolveCssPaths() {
  const entryPath = require.resolve('@mattermost/compass-ui');
  const distDir = path.dirname(entryPath);
  return {
    cssPath: path.join(distDir, 'compass-ui.css'),
    standaloneCssPath: path.join(distDir, 'compass-ui-standalone.css'),
  };
}

function assertCssExists(cssPath: string, standaloneCssPath: string) {
  if (!fs.existsSync(cssPath) || !fs.existsSync(standaloneCssPath)) {
    throw new Error(
      'Missing @mattermost/compass-ui global styles in dist/. ' +
        'Run node scripts/ensure-compass-packages.mjs (or npm run predev / prebuild).',
    );
  }
}

export function ensureCompassUiStyles(): Plugin {
  let cssPath = '';
  let standaloneCssPath = '';

  const refreshPaths = () => {
    const paths = resolveCssPaths();
    cssPath = paths.cssPath;
    standaloneCssPath = paths.standaloneCssPath;
    assertCssExists(cssPath, standaloneCssPath);
  };

  return {
    name: 'ensure-compass-ui-styles',
    enforce: 'pre',
    configureServer() {
      refreshPaths();
    },
    buildStart() {
      refreshPaths();
    },
    resolveId(source) {
      if (source === stylesImport) {
        refreshPaths();
        return cssPath;
      }
      if (source === standaloneStylesImport) {
        refreshPaths();
        return standaloneCssPath;
      }
    },
    load(id) {
      if (id === cssPath || id === standaloneCssPath) {
        refreshPaths();
        return fs.readFileSync(id, 'utf-8');
      }
    },
  };
}
