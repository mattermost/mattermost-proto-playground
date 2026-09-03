import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { createRequire } from 'node:module';
import { ensureCompassUiStyles } from './vite-plugin-ensure-compass-ui-styles';

const require = createRequire(import.meta.url);

function resolvePackageDist(packageName: string): string {
  const entryPath = require.resolve(packageName);
  return path.dirname(entryPath);
}

const compassUiDist = resolvePackageDist('@mattermost/compass-ui');
const compassProtoDist = resolvePackageDist('@mattermost/compass-proto');
const compassUiPackageRoot = path.resolve(
  __dirname,
  'node_modules/@mattermost/compass-ui',
);

/** Prefer npm compass-ui over sibling workspace when resolving from file:-linked proto. */
function resolveCompassUiFromNpm(): Plugin {
  return {
    name: 'resolve-compass-ui-from-npm',
    enforce: 'pre',
    resolveId(source) {
      if (
        source === '@mattermost/compass-ui' ||
        source.startsWith('@mattermost/compass-ui/')
      ) {
        return this.resolve(source, path.join(compassUiPackageRoot, 'package.json'), {
          skipSelf: true,
        });
      }
    },
  };
}

/**
 * compass-ui ESM appends `.js` for webpack fullySpecified. Vite must resolve the bare
 * CJS specifier so it can synthesize a default export (native ESM cannot import CJS).
 */
function rewriteCompassIconsJsExtension(): Plugin {
  return {
    name: 'rewrite-compass-icons-js-extension',
    enforce: 'pre',
    resolveId(source, importer) {
      if (
        source.startsWith('@mattermost/compass-icons/') &&
        source.endsWith('.js')
      ) {
        return this.resolve(source.slice(0, -3), importer, { skipSelf: true });
      }
    },
  };
}

function compassPackageDistReload(): Plugin {
  let reloadTimer: ReturnType<typeof setTimeout> | undefined;

  const scheduleReload = (server: ViteDevServer) => {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      server.ws.send({ type: 'full-reload', path: '*' });
    }, 500);
  };

  return {
    name: 'compass-package-dist-reload',
    configureServer(server) {
      server.watcher.add(compassUiDist);
      server.watcher.add(compassProtoDist);
      server.watcher.on('change', (file) => {
        if (
          (file.startsWith(compassUiDist) &&
            /\/(index\.(js|css)|compass-ui\.css)$/.test(file)) ||
          (file.startsWith(compassProtoDist) &&
            /\/index\.(js|css)$/.test(file))
        ) {
          scheduleReload(server);
        }
      });
    },
  };
}

export default defineConfig({
  // Project Pages live at /mattermost-proto-playground/, not the org root.
  // Keep `/` for local `npm run dev` / `vite preview`.
  base: process.env.GITHUB_ACTIONS ? '/mattermost-proto-playground/' : '/',
  plugins: [
    react(),
    svgr(),
    ensureCompassUiStyles(),
    resolveCompassUiFromNpm(),
    rewriteCompassIconsJsExtension(),
    compassPackageDistReload(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/breakpoints" as *;\n@use "@/styles/mixins" as *;\n`,
      },
    },
  },
  // Prebundle npm compass-ui so nested CJS compass-icons get interop. Proto stays
  // excluded — it is a file: link rebuilt by the ensure script.
  optimizeDeps: {
    exclude: ['@mattermost/compass-proto'],
  },
});
