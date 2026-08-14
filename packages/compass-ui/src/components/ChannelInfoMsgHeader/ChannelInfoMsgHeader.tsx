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
  /**
   * Channel (or section) label — primary API for Mentions / Saved message
   * indicators. Prefer this over `tabs` for a single channel chip.
   */
  channelName?: string;
  /** Called when the channel label is pressed (`channelName` mode). */
  onChannelClick?: () => void;
  /**
   * Multi-section tabs for channel info panels. Used when `channelName` is
   * omitted.
   */
  tabs?: ChannelInfoMsgHeaderTab[];
  /**
   * Team name after the channel divider. Omit when the workspace has only one
   * team or the team is already clear from context.
   */
  teamName?: string;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Channel + optional team label bar. Used above messages in Mentions / Saved
 * lists and as section tabs in the channel info panel.
 *
 * @see Figma Components — Channel Info Message Header
 * @see https://www.figma.com/design/VLpUbaoHEh2GR3XekSqmI6/Components---Channel-Info-Message-Header?node-id=1215-615
 */
export default function ChannelInfoMsgHeader({
  channelName,
  onChannelClick,
  tabs,
  teamName,
  className = '',
}: ChannelInfoMsgHeaderProps) {
  const resolvedTabs: ChannelInfoMsgHeaderTab[] =
    channelName != null && channelName !== ''
      ? [{label: channelName, onClick: onChannelClick}]
      : (tabs ?? [{label: 'Spec Reviews', active: true}]);

  const rootClass = [styles['channel-info-msg-header'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['channel-info-msg-header__container']}>
        {resolvedTabs.map((tab, index) => (
          <div
            key={`${tab.label}-${index}`}
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
              type='button'
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
        {teamName != null && teamName !== '' && (
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
