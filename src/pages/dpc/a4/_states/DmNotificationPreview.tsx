/**
 * DM notification preview — KNOCK-FRAMED copy per §3.4.9.
 *
 * Renders the complete copy set the system-bot delivers to a knocker after
 * any of: accept / decline-no-reason / decline-with-reason / auto-withdrawn
 * (Allow Knocks disabled, source revoked, channel deleted) / recommendation
 * received.
 *
 * All copy is reframed from A1's "request approved/denied" to A4's
 * "knock accepted/declined" / "withdrawn" / "recommends" per Q8=B
 * divergence requirement.
 */
import LockIcon from '@mattermost/compass-icons/components/lock-outline';
import RobotIcon from '@mattermost/compass-icons/components/robot-happy';
import Icon from '@/components/ui/Icon/Icon';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import { findChannel } from '../useA4Store';
import type { DmNotification } from '../useA4Store';
import styles from './DmNotificationPreview.module.scss';

export interface DmNotificationPreviewProps {
  notifications: DmNotification[];
}

export default function DmNotificationPreview({
  notifications,
}: DmNotificationPreviewProps) {
  if (notifications.length === 0) {
    return (
      <section className={styles['dm-preview']}>
        <header className={styles['dm-preview__header']}>
          <h3 className={styles['dm-preview__title']}>System bot DMs</h3>
          <p className={styles['dm-preview__subtitle']}>
            Knock-framed copy per §3.4.9
          </p>
        </header>
        <p className={styles['dm-preview__empty']}>
          No DMs yet. Knock outcomes and recommendation deliveries render here.
        </p>
      </section>
    );
  }

  return (
    <section className={styles['dm-preview']}>
      <header className={styles['dm-preview__header']}>
        <h3 className={styles['dm-preview__title']}>System bot DMs</h3>
        <p className={styles['dm-preview__subtitle']}>
          Knock-framed copy per §3.4.9
        </p>
      </header>

      <ul className={styles['dm-preview__list']}>
        {notifications.map((dm) => {
          const ch = findChannel(dm.channelId);
          const channelName = ch?.displayName ?? dm.channelId;

          const renderCopy = () => {
            switch (dm.kind) {
              case 'knock-accepted':
                return (
                  <p className={styles['dm-preview__copy']}>
                    Your knock to join{' '}
                    <span className={styles['dm-preview__channel']}>
                      #{channelName}
                    </span>{' '}
                    was accepted by {dm.actorHandle}. You now have access to
                    the channel.
                  </p>
                );
              case 'knock-declined-no-reason':
                return (
                  <p className={styles['dm-preview__copy']}>
                    Your knock to join{' '}
                    <span className={styles['dm-preview__channel']}>
                      #{channelName}
                    </span>{' '}
                    was declined.
                  </p>
                );
              case 'knock-declined-with-reason':
                return (
                  <p className={styles['dm-preview__copy']}>
                    Your knock to join{' '}
                    <span className={styles['dm-preview__channel']}>
                      #{channelName}
                    </span>{' '}
                    was declined. Reason from {dm.actorHandle}:{' '}
                    <em>&ldquo;{dm.reason}&rdquo;</em>
                  </p>
                );
              case 'knock-auto-withdrawn-knocks-disabled':
                return (
                  <p className={styles['dm-preview__copy']}>
                    Your pending knock to join{' '}
                    <span className={styles['dm-preview__channel']}>
                      #{channelName}
                    </span>{' '}
                    was withdrawn — the channel no longer accepts knocks.
                  </p>
                );
              case 'knock-auto-withdrawn-channel-deleted':
                return (
                  <p className={styles['dm-preview__copy']}>
                    Your pending knock to join{' '}
                    <span className={styles['dm-preview__channel']}>
                      #{channelName}
                    </span>{' '}
                    was withdrawn — the channel no longer exists.
                  </p>
                );
              case 'knock-auto-withdrawn-source-revoked':
                return (
                  <p className={styles['dm-preview__copy']}>
                    Your pending knock to join{' '}
                    <span className={styles['dm-preview__channel']}>
                      #{channelName}
                    </span>{' '}
                    was withdrawn — knocks from your reference source (
                    {dm.source}) are no longer accepted.
                  </p>
                );
              case 'recommendation-received':
                return (
                  <p className={styles['dm-preview__copy']}>
                    {dm.actorHandle} recommends{' '}
                    <span className={styles['dm-preview__channel']}>
                      #{channelName}
                    </span>
                    .{' '}
                    {dm.recommendationNote && (
                      <>
                        Purpose: {ch?.purpose}. Note:{' '}
                        <em>&ldquo;{dm.recommendationNote}&rdquo;</em>
                      </>
                    )}{' '}
                    <span className={styles['dm-preview__cta']}>
                      [ Knock to request access ]
                    </span>
                  </p>
                );
            }
          };

          const tag = (() => {
            switch (dm.kind) {
              case 'knock-accepted':
                return (
                  <LabelTag
                    label="Accepted"
                    type="Success"
                    size="X-Small"
                    casing="All Caps"
                  />
                );
              case 'knock-declined-no-reason':
              case 'knock-declined-with-reason':
                return (
                  <LabelTag
                    label="Declined"
                    type="Danger"
                    size="X-Small"
                    casing="All Caps"
                  />
                );
              case 'knock-auto-withdrawn-channel-deleted':
              case 'knock-auto-withdrawn-knocks-disabled':
              case 'knock-auto-withdrawn-source-revoked':
                return (
                  <LabelTag
                    label="Auto-withdrawn"
                    type="Warning"
                    size="X-Small"
                    casing="All Caps"
                  />
                );
              case 'recommendation-received':
                return (
                  <LabelTag
                    label="Recommendation"
                    type="Info"
                    size="X-Small"
                    casing="All Caps"
                  />
                );
            }
          })();

          return (
            <li key={dm.id} className={styles['dm-preview__row']}>
              <header className={styles['dm-preview__row-head']}>
                <span className={styles['dm-preview__bot']}>
                  <Icon size="16" glyph={<RobotIcon />} />
                  <span>system-bot</span>
                </span>
                {tag}
                <span className={styles['dm-preview__time']}>
                  {new Date(dm.ts).toLocaleString()}
                </span>
              </header>
              <div className={styles['dm-preview__row-body']}>
                <Icon size="16" glyph={<LockIcon />} />
                {renderCopy()}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
