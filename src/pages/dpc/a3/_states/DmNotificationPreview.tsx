/**
 * DmNotificationPreview — end-user DM previews (§3.3.9).
 *
 * Renders four canonical DM variants:
 *   - Approved (FR-7)
 *   - Denied (FR-7) — with optional Reason verbatim (FR-17, plain text,
 *     max 500 chars; HTML-sanitised at the audit boundary)
 *   - Channel-deleted withdraw (FR-11) — A1/A2/A4 parity, included so the
 *     side-by-side comparison at gate review is honest
 *   - Directory-entry-removed withdraw (FR-10 analog) — A3-specific
 *
 * Live state pipes through store.state.lastDm so reviewers can drive the
 * preview by acting in the right rail or by toggling the dialog. Static
 * variants stay visible underneath as gallery refs.
 */
import { useEffect } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import CloseCircleOutlineIcon from '@mattermost/compass-icons/components/close-circle-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import MinusCircleOutlineIcon from '@mattermost/compass-icons/components/minus-circle-outline';
import Icon from '@/components/ui/Icon/Icon';
import type { A3Store } from '../useA3Store';
import styles from './DmNotificationPreview.module.scss';

interface DmNotificationPreviewProps {
  store: A3Store;
}

interface DmCardProps {
  glyph: React.ReactNode;
  tone: 'success' | 'danger' | 'warning' | 'info';
  title: string;
  body: React.ReactNode;
  caption: string;
  live?: boolean;
}

function DmCard({ glyph, tone, title, body, caption, live }: DmCardProps) {
  return (
    <article
      className={[
        styles['dpc-dm__card'],
        styles[`dpc-dm__card--${tone}`],
        live ? styles['dpc-dm__card--live'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className={styles['dpc-dm__card-header']}>
        <span className={styles['dpc-dm__card-glyph']}>{glyph}</span>
        <span className={styles['dpc-dm__card-title']}>{title}</span>
        {live && (
          <span className={styles['dpc-dm__card-live-pill']}>Live</span>
        )}
      </header>
      <p className={styles['dpc-dm__card-body']}>{body}</p>
      <footer className={styles['dpc-dm__card-caption']}>{caption}</footer>
    </article>
  );
}

export default function DmNotificationPreview({
  store,
}: DmNotificationPreviewProps) {
  const lastDm = store.state.lastDm;

  // Auto-clear after a short while so reviewers can re-trigger.
  useEffect(() => {
    if (!lastDm) return;
    const t = window.setTimeout(
      () => store.dispatch({ type: 'CLEAR_DM_PREVIEW' }),
      10_000,
    );
    return () => window.clearTimeout(t);
  }, [lastDm, store]);

  const liveChannel = lastDm ? store.channelById(lastDm.channelId) : null;

  return (
    <section
      className={styles['dpc-dm']}
      aria-label="DM notification previews"
    >
      <header className={styles['dpc-dm__header']}>
        <h3 className={styles['dpc-dm__title']}>DM Notifications</h3>
        <p className={styles['dpc-dm__subtitle']}>
          §3.3.9 copy · A3-specific directory-removed variant is the
          right-most card.
        </p>
      </header>

      {lastDm && liveChannel && (
        <div className={styles['dpc-dm__live-slot']}>
          <p className={styles['dpc-dm__live-eyebrow']}>
            Just delivered to{' '}
            <code>@{store.state.lastDm?.actorUsername ?? 'recipient'}</code>
          </p>
          {lastDm.kind === 'approved' && (
            <DmCard
              tone="success"
              glyph={<Icon size="20" glyph={<CheckCircleOutlineIcon />} />}
              title="Request approved"
              body={
                <>
                  Your request to join #<strong>{liveChannel.displayName}</strong>{' '}
                  was approved by @{lastDm.actorUsername}.
                </>
              }
              caption="FR-7 standard approval copy"
              live
            />
          )}
          {lastDm.kind === 'denied' && (
            <DmCard
              tone="danger"
              glyph={<Icon size="20" glyph={<CloseCircleOutlineIcon />} />}
              title="Request declined"
              body={
                <>
                  Your request to join #<strong>{liveChannel.displayName}</strong>{' '}
                  was declined by @{lastDm.actorUsername}.
                  {lastDm.reason && (
                    <span className={styles['dpc-dm__reason']}>
                      Reason: {lastDm.reason}
                    </span>
                  )}
                </>
              }
              caption="FR-7 / FR-17 (Reason verbatim, sanitised at audit boundary)"
              live
            />
          )}
          {lastDm.kind === 'directory_removed' && (
            <DmCard
              tone="warning"
              glyph={<Icon size="20" glyph={<MinusCircleOutlineIcon />} />}
              title="Request auto-withdrawn"
              body={
                <>
                  Your pending request to join #
                  <strong>{liveChannel.displayName}</strong> was withdrawn —
                  the channel is no longer in the Channel Directory.
                </>
              }
              caption="FR-10 analog · A3-specific variant"
              live
            />
          )}
          {lastDm.kind === 'channel_deleted' && (
            <DmCard
              tone="danger"
              glyph={<Icon size="20" glyph={<AlertCircleOutlineIcon />} />}
              title="Request auto-withdrawn"
              body={
                <>
                  Your pending request to join #
                  <strong>{liveChannel.displayName}</strong> was withdrawn —
                  the channel no longer exists.
                </>
              }
              caption="FR-11 · channel-deleted withdraw"
              live
            />
          )}
        </div>
      )}

      <div className={styles['dpc-dm__gallery']}>
        <DmCard
          tone="success"
          glyph={<Icon size="20" glyph={<CheckCircleOutlineIcon />} />}
          title="Approval"
          body={
            <>
              Your request to join #<strong>ops-incident-review</strong> was
              approved by @sysadmin.
            </>
          }
          caption="FR-7 standard"
        />
        <DmCard
          tone="danger"
          glyph={<Icon size="20" glyph={<CloseCircleOutlineIcon />} />}
          title="Denial"
          body={
            <>
              Your request to join #<strong>ops-incident-review</strong> was
              declined by @sysadmin.
              <span className={styles['dpc-dm__reason']}>
                Reason: clearance attribute not on file; please update
                profile and re-submit.
              </span>
            </>
          }
          caption="FR-7 / FR-17"
        />
        <DmCard
          tone="warning"
          glyph={<Icon size="20" glyph={<MinusCircleOutlineIcon />} />}
          title="Directory entry removed"
          body={
            <>
              Your pending request to join #
              <strong>mission-coord-alpha</strong> was withdrawn — the
              channel is no longer in the Channel Directory.
            </>
          }
          caption="FR-10 analog · A3-specific"
        />
        <DmCard
          tone="danger"
          glyph={<Icon size="20" glyph={<AlertCircleOutlineIcon />} />}
          title="Channel deleted"
          body={
            <>
              Your pending request to join #
              <strong>archived-program-rho</strong> was withdrawn — the
              channel no longer exists.
            </>
          }
          caption="FR-11"
        />
      </div>

      <footer className={styles['dpc-dm__footer']}>
        <Icon size="16" glyph={<LockOutlineIcon />} />
        <span>
          Per §3.3.9 the directory-removed and channel-deleted variants are
          kept distinct because the requester's recovery path differs.
        </span>
      </footer>
    </section>
  );
}
