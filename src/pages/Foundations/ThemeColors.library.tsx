import styles from './Foundations.module.scss';

const THEME_GROUPS = [
  {
    name: 'Sidebar',
    tokens: [
      { name: 'BG', token: '--sidebar-bg' },
      { name: 'Header BG', token: '--sidebar-header-bg' },
      { name: 'Team BG', token: '--sidebar-team-bg' },
      { name: 'Text', token: '--sidebar-text' },
      { name: 'Hover BG', token: '--sidebar-text-hover-bg' },
      { name: 'Active Border', token: '--sidebar-text-active-border' },
    ],
  },
  {
    name: 'Center Channel',
    tokens: [
      { name: 'BG', token: '--center-channel-bg' },
      { name: 'Color', token: '--center-channel-color' },
    ],
  },
  {
    name: 'Buttons',
    tokens: [
      { name: 'BG', token: '--button-bg' },
      { name: 'Color', token: '--button-color' },
    ],
  },
  {
    name: 'Interactions',
    tokens: [
      { name: 'Link', token: '--link-color' },
      { name: 'Error', token: '--error-text' },
      { name: 'Mention BG', token: '--mention-bg' },
      { name: 'Mention Color', token: '--mention-color' },
      { name: 'Highlight BG', token: '--mention-highlight-bg' },
      { name: 'New Message', token: '--new-message-separator' },
    ],
  },
  {
    name: 'Status',
    tokens: [
      { name: 'Online', token: '--online-indicator' },
      { name: 'Away', token: '--away-indicator' },
      { name: 'Do Not Disturb', token: '--dnd-indicator' },
    ],
  },
];

export default function ThemeColorsLibrary() {
  return (
    <>
      <p className={styles['foundations__section-desc']}>
        Semantic tokens — values adapt to the active theme.
      </p>
      <div className={styles['foundations__theme-groups']}>
        {THEME_GROUPS.map(({ name, tokens }) => (
          <div key={name} className={styles['foundations__theme-group']}>
            <h3 className={styles['foundations__theme-group-name']}>{name}</h3>
            <div className={styles['foundations__theme-swatches']}>
              {tokens.map(({ name: tokenName, token }) => (
                <div
                  key={token}
                  className={styles['foundations__theme-swatch']}
                >
                  <div
                    className={styles['foundations__theme-swatch-color']}
                    style={{ background: `var(${token})` }}
                  />
                  <span className={styles['foundations__theme-swatch-name']}>
                    {tokenName}
                  </span>
                  <code className={styles['foundations__theme-swatch-token']}>
                    {token}
                  </code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
