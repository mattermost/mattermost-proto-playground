import styles from './ChannelInfoMsgHeader.module.scss';

export interface ChannelInfoMsgHeaderTab {
  /** Label text for this tab. */
  label: string;
  /** Whether this tab is currently active/selected. */
  active?: boolean;
  /** Click handler. */
  onClick?: () => void;
}

export interface ChannelInfoMsgHeaderProps {
  /** Tab entries to display. */
  tabs?: ChannelInfoMsgHeaderTab[];
  /** Team name shown after the tab divider. Omit to hide. */
  teamName?: string;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Tab-style header bar within the channel info panel. Shows section labels
 * (e.g. "Spec Reviews") and an optional team name. Corresponds to Figma
 * Channel Info Message Header v1.0.1.
 */
export default function ChannelInfoMsgHeader({
  tabs = [{ label: 'Spec Reviews', active: true }],
  teamName = 'Contributors',
  className = '',
}: ChannelInfoMsgHeaderProps) {
  const rootClass = [styles['channel-info-msg-header'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['channel-info-msg-header__container']}>
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={[
              styles['channel-info-msg-header__tab-area'],
              tab.active
                ? styles['channel-info-msg-header__tab-area--active']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <button
              type="button"
              className={[
                styles['channel-info-msg-header__tab'],
                tab.active
                  ? styles['channel-info-msg-header__tab--active']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={tab.onClick}
            >
              {tab.label}
            </button>
          </div>
        ))}
        {teamName != null && (
          <div className={styles['channel-info-msg-header__team']}>
            <span className={styles['channel-info-msg-header__team-name']}>
              {teamName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
