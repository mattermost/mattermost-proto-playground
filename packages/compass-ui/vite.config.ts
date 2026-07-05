import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import path from 'path';
import { compassUiGlobalStyles } from './vite-plugin-global-styles';

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    compassUiGlobalStyles(),
    dts({
      include: ['src'],
      exclude: ['**/*.stories.tsx', 'src/styles/entry.scss'],
      rollupTypes: false,
    }),
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
  build: {
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'CompassUI',
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
        if (id === 'simplebar-react') {
          return true;
        }
        // Bundle simplebar CSS into component-styles; externalize JS subpaths only.
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
