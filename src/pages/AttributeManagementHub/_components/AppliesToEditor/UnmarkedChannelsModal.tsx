import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import type { UnmarkedChannelRow } from '../../hubData';
import styles from './UnmarkedChannelsModal.module.scss';

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
                  <th scope="col">Channel settings</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((channel) => (
                  <tr key={channel.id}>
                    <td>
                      <span className={styles['unmarked__channel']}>
                        #{channel.name}
                      </span>
                    </td>
                    <td>{channel.adminName}</td>
                    <td>
                      <a
                        className={styles['unmarked__link']}
                        href={channel.settingsHref}
                      >
                        Go to Channel Settings
                      </a>
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
