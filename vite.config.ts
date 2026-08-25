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
  // Vercel serves at the domain root; GitHub Pages serves under the repo path.
  base: process.env.VERCEL ? '/' : '/mattermost-proto-playground/',
  plugins: [react(), svgr(), ensureCompassUiStyles(), compassPackageDistReload()],
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
  optimizeDeps: {
    exclude: ['@mattermost/compass-ui', '@mattermost/compass-proto'],
  },
});
