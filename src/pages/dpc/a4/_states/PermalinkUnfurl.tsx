/**
 * Reference channel 1 — Permalink unfurl `[REFERENCE: permalink]` per §3.4.2.
 *
 * Renders a permalink-bearing DM in a mock chat surface. The unfurl card
 * exposes channel **name + purpose only** (NFR-1) and the knock affordance.
 * Post content is NOT previewed; the card explicitly says so.
 *
 * Card has three states per §3.4.2:
 *   - not-knocked   → "Knock to request access" button visible
 *   - knocked-pending → button replaced with subdued "Knock pending —
 *                       withdraw"
 *   - channel-revoked → body replaced with "This channel no longer exists"
 *                       + Dismiss (V-A4-2 demonstration affordance)
 */
import { useState } from 'react';
import Button from '@/components/ui/Button/Button';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import LockIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import { findChannel } from '../useA4Store';
import type { Reference } from '../useA4Store';
import KnockModal from './KnockModal';
import styles from './PermalinkUnfurl.module.scss';

export interface PermalinkUnfurlProps {
  reference: Reference;
  pending: boolean;
  /** When true, the originator has lost membership — V-A4-2 stale-permalink. */
  revoked?: boolean;
  /** Whether the active user is a guest (NFR-2 / FR-12). */
  guestFiltered?: boolean;
  onSendKnock(message: string | null): void;
  onWithdraw(): void;
  onSimulateRevoked(): void;
}

export default function PermalinkUnfurl({
  reference,
  pending,
  revoked = false,
  guestFiltered = false,
  onSendKnock,
  onWithdraw,
  onSimulateRevoked,
}: PermalinkUnfurlProps) {
  const channel = findChannel(reference.channelId);
  const [modalOpen, setModalOpen] = useState(false);

  if (!channel) return null;

  return (
    <div
      className={styles['permalink-unfurl']}
      role="region"
      aria-label="Private channel reference"
    >
      <header className={styles['permalink-unfurl__chat-header']}>
        <UserAvatar
          alt="Logistics Lead"
          name="Logistics Lead"
          size="32"
        />
        <div className={styles['permalink-unfurl__chat-meta']}>
          <span className={styles['permalink-unfurl__chat-author']}>
            {reference.fromUser ?? '@log.lead'}
          </span>
          <span className={styles['permalink-unfurl__chat-time']}>
            Direct Message · 14:22
          </span>
        </div>
      </header>

      <p className={styles['permalink-unfurl__chat-body']}>
        here&apos;s the thread we were talking about earlier ↓
      </p>

      <p className={styles['permalink-unfurl__permalink-text']}>
        https://mm.example/team-a/pl/8x4j2q…
      </p>

      {guestFiltered ? (
        <div
          className={[
            styles['permalink-unfurl__card'],
            styles['permalink-unfurl__card--guest'],
          ].join(' ')}
        >
          <LabelTag
            label="Access denied"
            type="Danger"
            size="X-Small"
            casing="All Caps"
          />
          <p className={styles['permalink-unfurl__guest-body']}>
            Access denied.
          </p>
          <p className={styles['permalink-unfurl__guest-note']}>
            (NFR-2: name + purpose intentionally suppressed for guest users —
            response normalized to T-1 enumeration-resistant shape.)
          </p>
        </div>
      ) : revoked ? (
        <div
          className={[
            styles['permalink-unfurl__card'],
            styles['permalink-unfurl__card--revoked'],
          ].join(' ')}
        >
          <LabelTag
            label="Stale permalink"
            type="Warning"
            size="X-Small"
            casing="All Caps"
          />
          <p className={styles['permalink-unfurl__revoked-body']}>
            This channel no longer exists.
          </p>
          <p className={styles['permalink-unfurl__revoked-note']}>
            Permalink_reference_invalidated — originator lost channel access
            (V-A4-2 mitigation: server-side originator-membership re-validation
            on every knock submission).
          </p>
        </div>
      ) : (
        <div className={styles['permalink-unfurl__card']}>
          <div className={styles['permalink-unfurl__card-header']}>
            <Icon size="20" glyph={<LockIcon />} />
            <span className={styles['permalink-unfurl__card-eyebrow']}>
              Private channel — you&apos;re not a member
            </span>
          </div>

          <h3 className={styles['permalink-unfurl__channel-name']}>
            #{channel.displayName}
          </h3>
          <p className={styles['permalink-unfurl__channel-purpose']}>
            <span className={styles['permalink-unfurl__purpose-label']}>
              Purpose:
            </span>{' '}
            {channel.purpose}
          </p>

          <p className={styles['permalink-unfurl__hidden-note']}>
            Post content is hidden until your knock is accepted.
          </p>

          <div className={styles['permalink-unfurl__card-actions']}>
            {pending ? (
              <Button
                emphasis="Tertiary"
                size="Small"
                onClick={() => setModalOpen(true)}
              >
                Knock pending — withdraw
              </Button>
            ) : (
              <Button
                emphasis="Primary"
                size="Small"
                onClick={() => setModalOpen(true)}
              >
                Knock to request access
              </Button>
            )}
            <Button
              emphasis="Link"
              size="Small"
              onClick={onSimulateRevoked}
              title="Simulate the originator losing channel access (V-A4-2)"
            >
              Simulate stale permalink
            </Button>
          </div>
        </div>
      )}

      {modalOpen && (
        <KnockModal
          channel={channel}
          via={`permalink from ${reference.fromUser ?? '@log.lead'}`}
          source="permalink"
          pending={pending}
          onSendKnock={(msg) => {
            onSendKnock(msg);
            setModalOpen(false);
          }}
          onWithdraw={() => {
            onWithdraw();
            setModalOpen(false);
          }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
