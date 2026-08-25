import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import type { UnmarkedChannelRow } from '../../hubData';
import styles from './UnmarkedChannelsModal.module.scss';

const SETTINGS_LINK_TOOLTIP = 'Open channel settings in new tab';
const SETTINGS_LINK_TOOLTIP_GAP = 4;
const SETTINGS_LINK_TOOLTIP_Z_INDEX = 1100;

function ChannelSettingsLink({
  href,
  name,
}: {
  href: string;
  name: string;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const updateCoords = () => {
    const link = linkRef.current;
    if (!link) return;

    const rect = link.getBoundingClientRect();
    setCoords({
      top: rect.bottom + SETTINGS_LINK_TOOLTIP_GAP,
      left: rect.left + rect.width / 2,
    });
  };

  useLayoutEffect(() => {
    if (!visible) {
      setCoords(null);
      return;
    }

    updateCoords();
    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords);

    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [visible]);

  const showTooltip = () => {
    setVisible(true);
    updateCoords();
  };

  const hideTooltip = () => {
    setVisible(false);
  };

  return (
    <>
      <a
        ref={linkRef}
        className={styles['unmarked__channel-link']}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={SETTINGS_LINK_TOOLTIP}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {name}
        <Icon
          size="12"
          glyph={<OpenInNewIcon />}
          className={styles['unmarked__channel-link-icon']}
        />
      </a>
      {visible &&
        coords &&
        createPortal(
          <span
            className={styles['unmarked__channel-link-tooltip']}
            style={{
              top: coords.top,
              left: coords.left,
              zIndex: SETTINGS_LINK_TOOLTIP_Z_INDEX,
            }}
            aria-hidden
          >
            <Tooltip label={SETTINGS_LINK_TOOLTIP} arrow="Top" />
          </span>,
          document.body,
        )}
    </>
  );
}

export interface UnmarkedChannelsModalProps {
  attributeName: string;
  channels: UnmarkedChannelRow[];
  onClose: () => void;
}

/**
 * Lists channels that still need a value before Required can be turned on.
 */
export default function UnmarkedChannelsModal({
  attributeName,
  channels,
  onClose,
}: UnmarkedChannelsModalProps) {
  const countLabel =
    channels.length === 1
      ? '1 channel'
      : `${channels.length.toLocaleString()} channels`;

  return (
    <div className={styles['unmarked']} role="presentation">
      <button
        type="button"
        className={styles['unmarked__scrim']}
        aria-label="Close"
        onClick={onClose}
      />
      <div className={styles['unmarked__dialog']}>
        <Modal
          size="Medium"
          title="Channels without a value"
          subtitle={`${countLabel} still need a ${attributeName} value`}
          onClose={onClose}
          footer={
            <div className={styles['unmarked__footer']}>
              <Button emphasis="Primary" onClick={onClose}>
                Close
              </Button>
            </div>
          }
        >
          <div className={styles['unmarked__table-wrap']}>
            <table className={styles['unmarked__table']}>
              <thead>
                <tr>
                  <th scope="col">Channel</th>
                  <th scope="col">Channel admin</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((channel) => (
                  <tr key={channel.id}>
                    <td>
                      <span className={styles['unmarked__channel']}>
                        <ChannelSettingsLink
                          href={channel.settingsHref}
                          name={channel.name}
                        />
                        {channel.archived && (
                          <span className={styles['unmarked__badge']}>
                            Archived
                          </span>
                        )}
                      </span>
                    </td>
                    <td>
                      {channel.adminNames.length > 0 ? (
                        channel.adminNames.join(', ')
                      ) : (
                        <span className={styles['unmarked__empty']}>
                          No channel admin
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      </div>
    </div>
  );
}
