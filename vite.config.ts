import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import fs from 'fs';
import path from 'path';
import { ensureCompassUiStyles } from './vite-plugin-ensure-compass-ui-styles';

const compassUiDist = path.resolve(__dirname, 'packages/compass-ui/dist');
const uiScssRoot = path.resolve(__dirname, 'src/components/ui');
const compassUiScssRoot = path.resolve(
  __dirname,
  'packages/compass-ui/src/components',
);

/** Map renamed style modules after the compass-ui extraction. */
const UI_SCSS_RENAMES: Record<string, string> = {
  'LabelTag/LabelTag.module.scss': 'Tag/Tag.module.scss',
  'Scrollbars/Scrollbars.module.scss': 'Scrollbar/Scrollbar.module.scss',
  'ToastBanner/ToastBanner.module.scss': 'Toast/Toast.module.scss',
  'Tags/Tags.module.scss': 'Tag/Tag.module.scss',
  'ChannelSidebar/ChannelSidebar.module.scss':
    'ChannelsSidebar/ChannelsSidebar.module.scss',
};

/**
 * Resolve missing src/components/ui *.module.scss imports to compass-ui
 * source styles (components moved out of src/components/ui).
 */
function compassUiScssShim(): Plugin {
  return {
    name: 'compass-ui-scss-shim',
    enforce: 'pre',
    resolveId(id) {
      let rel: string | undefined;
      if (id.startsWith('@/components/ui/') && id.endsWith('.module.scss')) {
        rel = id.slice('@/components/ui/'.length);
      } else if (
        path.isAbsolute(id) &&
        id.startsWith(uiScssRoot + path.sep) &&
        id.endsWith('.module.scss')
      ) {
        rel = path.relative(uiScssRoot, id);
      }
      if (!rel) return null;

      const normalized = rel.split(path.sep).join('/');
      const local = path.join(uiScssRoot, normalized);
      if (fs.existsSync(local)) return local;

      const mapped = UI_SCSS_RENAMES[normalized] ?? normalized;
      const pkg = path.join(compassUiScssRoot, mapped);
      if (fs.existsSync(pkg)) return pkg;

      return null;
    },
  };
}

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
      server.watcher.on('change', (file) => {
        if (
          file.startsWith(compassUiDist) &&
          /\/(index\.(js|css)|compass-ui\.css)$/.test(file)
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
    compassUiScssShim(),
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
    exclude: ['@mattermost/compass-ui'],
  },
  server: {
    watch: {
      // Rebuilds land in dist/; ignore source saves so the app reloads after the library build finishes.
      ignored: ['**/packages/compass-ui/src/**'],
    },
  },
});
