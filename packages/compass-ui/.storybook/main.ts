import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(viteConfig) {
    viteConfig.resolve ??= {};
    viteConfig.resolve.alias = {
      ...viteConfig.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
    };
    viteConfig.css ??= {};
    viteConfig.css.preprocessorOptions = {
      scss: {
        additionalData: `@use "@/styles/breakpoints" as *;\n@use "@/styles/mixins" as *;\n`,
      },
    };
    return viteConfig;
  },
};

export default config;
