import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import path from 'path';
import { ensureCompassUiStyles } from './vite-plugin-ensure-compass-ui-styles';

const compassUiDist = path.resolve(__dirname, 'packages/compass-ui/dist');
const compassProtoDist = path.resolve(__dirname, 'packages/compass-proto/dist');

function compassUiDistReload(): Plugin {
  let reloadTimer: ReturnType<typeof setTimeout> | undefined;

  const scheduleReload = (server: ViteDevServer) => {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      server.ws.send({ type: 'full-reload', path: '*' });
    }, 500);
  };

  return {
    name: 'compass-ui-dist-reload',
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
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ],
      }),
    },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    svgr(),
    ensureCompassUiStyles(),
    compassUiDistReload(),
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
  optimizeDeps: {
    exclude: ['@mattermost/compass-ui', '@mattermost/compass-proto'],
  },
  server: {
    watch: {
      // Rebuilds land in dist/; ignore source saves so the app reloads after the library build finishes.
      ignored: [
        '**/packages/compass-ui/src/**',
        '**/packages/compass-proto/src/**',
      ],
    },
  },
});
