import styles from '@/styles/library-demo/foundations.module.scss';
import { THEME_IDS, type ThemeId } from '@/contexts/ThemeContext';
import Swatch, { SwatchGrid } from '@/guidelines/_components/Swatch';

const THEME_GROUPS = [
  {
    name: 'Sidebar',
    tokens: [
      'sidebar-bg',
      'sidebar-header-bg',
      'sidebar-teambar-bg',
      'sidebar-text',
      'sidebar-text-hover-bg',
      'sidebar-text-active-border',
    ],
  },
  {
    name: 'Center Channel',
    tokens: ['center-channel-bg', 'center-channel-color'],
  },
  {
    name: 'Buttons',
    tokens: ['button-bg', 'button-color'],
  },
  {
    name: 'Interactions',
    tokens: [
      'link-color',
      'error-text',
      'mention-bg',
      'mention-color',
      'mention-highlight-bg',
      'new-message-separator',
    ],
  },
  {
    name: 'Status',
    tokens: ['online-indicator', 'away-indicator', 'dnd-indicator'],
  },
];

const THEME_NAMES: Record<ThemeId, string> = {
  denim: 'Denim',
  sapphire: 'Sapphire',
  quartz: 'Quartz',
  indigo: 'Indigo',
  onyx: 'Onyx',
};

export function ThemeTokensContent() {
  return (
    <div className={styles['foundations__theme-library']}>
      <section className={styles['foundations__theme-groups']}>
        {THEME_IDS.map((theme) => (
          <section
            key={theme}
            className={styles['foundations__theme']}
            data-theme={theme}
          >
            <h3>{THEME_NAMES[theme]}</h3>

            {THEME_GROUPS.map(({ name, tokens }) => (
              <div key={name} className={styles['foundations__theme-group']}>
                <h4>{name}</h4>

                <SwatchGrid size="medium">
                  {tokens.map((token) => (
                    <Swatch
                      key={`${theme}-${token}`}
                      token={token}
                      label={`--${token}`}
                      size="medium"
                    />
                  ))}
                </SwatchGrid>
              </div>
            ))}
          </section>
        ))}
      </section>
    </div>
  );
}

export default function ThemeColorsLibrary() {
  return <ThemeTokensContent />;
}
