import type { Preview } from '@storybook/react';
import '@fontsource/metropolis/400.css';
import '@fontsource/metropolis/500.css';
import '@fontsource/metropolis/600.css';
import '@fontsource/metropolis/700.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import '../src/styles/entry.scss';

const THEMES = ['denim', 'sapphire', 'quartz', 'indigo', 'onyx'] as const;

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Compass color theme',
      defaultValue: 'denim',
      toolbar: {
        icon: 'paintbrush',
        items: THEMES.map((value) => ({ value, title: value })),
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      document.documentElement.setAttribute('data-theme', context.globals.theme);
      return <Story />;
    },
  ],
};

export default preview;
