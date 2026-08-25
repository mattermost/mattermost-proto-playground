import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import {
  unmarkedChannelAdminCount,
  unmarkedChannelsWithoutAdmin,
  type UnmarkedChannelRow,
} from '../../hubData';
import styles from './NotifyChannelAdminsModal.module.scss';

export interface NotifyChannelAdminsModalProps {
  attributeName: string;
  channels: UnmarkedChannelRow[];
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirms notifying channel admins before Required can be turned on.
 */
export default function NotifyChannelAdminsModal({
  attributeName,
  channels,
  onClose,
  onConfirm,
}: NotifyChannelAdminsModalProps) {
  const channelCount = channels.length;
  const adminCount = unmarkedChannelAdminCount(channels);
  const withoutAdmin = unmarkedChannelsWithoutAdmin(channels);
  const archivedCount = channels.filter((channel) => channel.archived).length;
  const notifiableChannels = channelCount - withoutAdmin.length;

  const channelLabel =
    notifiableChannels === 1
      ? '1 channel'
      : `${notifiableChannels.toLocaleString()} channels`;
  const adminLabel =
    adminCount === 1 ? '1 admin' : `${adminCount.toLocaleString()} admins`;

  const message = `Please set a ${attributeName} value on your channel. A system administrator needs every channel to have this attribute before it can be marked Required.`;

  return (
    <div className={styles['notify']} role="presentation">
      <button
        type="button"
        className={styles['notify__scrim']}
        aria-label="Close"
        onClick={onClose}
      />
      <div className={styles['notify__dialog']}>
        <Modal
          size="Medium"
          title="Notify all channel admins?"
          onClose={onClose}
          headerDivider={false}
          footerDivider={false}
          footer={
            <div className={styles['notify__footer']}>
              <Button emphasis="Tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                emphasis="Primary"
                disabled={adminCount === 0}
                onClick={onConfirm}
              >
                Send notification
              </Button>
            </div>
          }
        >
          <div className={styles['notify__body']}>
            <p className={styles['notify__lead']}>
              {channelCount.toLocaleString()}{' '}
              {channelCount === 1 ? 'channel needs' : 'channels need'} a{' '}
              {attributeName} value.
            </p>
            <ul className={styles['notify__summary']}>
              <li>
                Notifications go to each unique channel admin — not one message
                per channel — so {adminLabel} will be contacted for{' '}
                {channelLabel}.
              </li>
              {archivedCount > 0 && (
                <li>
                  Includes {archivedCount.toLocaleString()} archived{' '}
                  {archivedCount === 1 ? 'channel' : 'channels'}. Required also
                  applies to archived channels.
                </li>
              )}
              {withoutAdmin.length > 0 && (
                <li>
                  {withoutAdmin.length.toLocaleString()}{' '}
                  {withoutAdmin.length === 1 ? 'channel has' : 'channels have'}{' '}
                  no channel admin and won’t be notified.
                </li>
              )}
            </ul>

            <div className={styles['notify__message']}>
              <span className={styles['notify__message-label']}>
                Message to be sent
              </span>
              <blockquote className={styles['notify__message-body']}>
                {message}
              </blockquote>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
