import type { Preview } from '@storybook/react';
import { FoundationLayout } from '../src/foundations/_components/FoundationLayout';
import '@fontsource/metropolis/400.css';
import '@fontsource/metropolis/500.css';
import '@fontsource/metropolis/600.css';
import '@fontsource/metropolis/700.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import '../src/styles/entry.scss';
import '../src/styles/standalone.scss';
import './docs-theme.css';

const THEMES = ['denim', 'sapphire', 'quartz', 'indigo', 'onyx'] as const;

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: {
        order: [
          'Foundations',
          ['Style'],
          'Components',
          'Patterns',
          '*',
        ],
      },
    },
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
      document.documentElement.setAttribute(
        'data-theme',
        context.globals.theme,
      );
      document.documentElement.style.backgroundColor =
        'var(--center-channel-bg)';
      document.body.style.backgroundColor = 'var(--center-channel-bg)';

      const isFoundation = context.title?.startsWith('Foundations/') ?? false;
      if (isFoundation) {
        return (
          <FoundationLayout>
            <Story />
          </FoundationLayout>
        );
      }

      return <Story />;
    },
  ],
};

export default preview;
