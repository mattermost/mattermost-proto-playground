import styles from '@/styles/library-demo/foundations.module.scss';
import { THEME_IDS, type ThemeId } from '@/contexts/ThemeContext';
import Swatch, { SwatchGrid } from '@/guidelines/_components/Swatch';

const THEME_GROUPS = [
  {
    name: 'Sidebar',
    description: 'Navigation chrome, team strip, and channel list states.',
    tokens: [
      'sidebar-bg',
      'sidebar-header-bg',
      'sidebar-team-bg',
      'sidebar-text',
      'sidebar-text-hover-bg',
      'sidebar-text-active-border',
    ],
  },
  {
    name: 'Center Channel',
    description: 'The main message surface and default text color.',
    tokens: ['center-channel-bg', 'center-channel-color'],
  },
  {
    name: 'Buttons',
    description: 'Primary call-to-action fill and text color.',
    tokens: ['button-bg', 'button-color'],
  },
  {
    name: 'Interactions',
    description: 'Inline states, mentions, separators, and validation color.',
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
    description: 'Presence indicators that remain recognizable across themes.',
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

export default function ThemeColorsLibrary() {
  return (
    <div className={styles['foundations__theme-library']}>
      <section className={styles['foundations__theme-groups']}>
        <div className={styles['foundations__theme-section-heading']}>
          <h2>Theme Tokens</h2>
          <p>
            Role-based tokens are shown across every built-in theme. Use the
            token name in component code and let the active theme supply the
            value.
          </p>
        </div>

        {THEME_IDS.map((theme) => (
          <section
            key={theme}
            className={styles['foundations__theme']}
            data-theme={theme}
          >
            <h3>{THEME_NAMES[theme]}</h3>

            {THEME_GROUPS.map(({ name, description, tokens }) => (
              <div key={name} className={styles['foundations__theme-group']}>
                <div className={styles['foundations__theme-group-heading']}>
                  <h4>{name}</h4>
                  <p>{description}</p>
                </div>

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
