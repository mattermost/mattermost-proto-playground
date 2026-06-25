import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import path from 'path';

const compassUiRoot = path.resolve(__dirname, 'packages/compass-ui');
const compassUiSrc = path.join(compassUiRoot, 'src');

/** Resolve `@/` imports inside the workspace UI package when consuming source in dev. */
function compassUiInternalAlias(): Plugin {
  return {
    name: 'compass-ui-internal-alias',
    resolveId(source, importer) {
      if (!source.startsWith('@/') || !importer?.includes('packages/compass-ui')) {
        return null;
      }
      return path.join(compassUiSrc, source.slice(2));
    },
  };
}

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    base: '/mattermost-proto-playground/',
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
      ...(isDev ? [compassUiInternalAlias()] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        ...(isDev
          ? {
              '@mattermost/compass-ui/styles': path.join(
                compassUiSrc,
                'styles/entry.scss',
              ),
              '@mattermost/compass-ui/component-styles': path.join(
                compassUiSrc,
                'styles/component-styles-dev.css',
              ),
              '@mattermost/compass-ui': path.join(compassUiSrc, 'index.ts'),
            }
          : {}),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/breakpoints" as *;\n@use "@/styles/mixins" as *;\n`,
        },
      },
    },
  };
});
