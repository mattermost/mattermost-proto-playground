import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import path from 'path';
import { compassIconsJsExtensions } from './vite-plugin-compass-icons-ext';

const isWatchBuild = process.argv.includes('--watch');

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    compassIconsJsExtensions(),
    dts({
      tsconfigPath: path.resolve(__dirname, 'tsconfig.build.json'),
      include: ['src'],
      exclude: ['**/*.stories.tsx'],
      rollupTypes: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    emptyOutDir: !isWatchBuild,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'CompassProto',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: (id) => {
        if (id === 'react' || id === 'react-dom' || id === 'react/jsx-runtime') {
          return true;
        }
        if (/^@mattermost\/compass-icons/.test(id)) {
          return true;
        }
        if (/^@mattermost\/compass-ui/.test(id)) {
          return true;
        }
        if (id === 'simplebar-react') {
          return true;
        }
        if (/^simplebar-react\//.test(id) && !id.endsWith('.css')) {
          return true;
        }
        return false;
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
});
