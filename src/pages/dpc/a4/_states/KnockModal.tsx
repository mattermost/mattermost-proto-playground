/**
 * KnockModal — two-step knock modal (preview → pending) per §3.4.3.
 *
 * Step 1 (preview):
 *   - Channel name + purpose only (NFR-1 — no member count, no body, no
 *     activity timestamp).
 *   - Optional message field, 500-char cap with live counter (FR-17).
 *   - "Reference: arrived via <source>" indicator visible to user (per
 *     §3.4.3 step 1 mock).
 *   - Cancel + Send knock buttons (FR-8 step 1 — primary not auto-focused
 *     per A1 anti-fatigue rationale; we mark primary "Send knock" but the
 *     dialog focuses Cancel-equivalent first).
 *
 * Step 2 (pending):
 *   - Subdued, non-destructive "Withdraw knock" (FR-8 step 2).
 *
 * Renders inline (not as a portal) inside the reference card / surface so
 * the prototype reads as a single composed flow rather than a hovering
 * overlay; this matches the way the rest of the DPC prototypes embed
 * modals at canvas scale.
 */
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button/Button';
import TextArea from '@/components/ui/TextArea/TextArea';
import Modal from '@/components/ui/Modal/Modal';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Icon from '@/components/ui/Icon/Icon';
import LockIcon from '@mattermost/compass-icons/components/lock-outline';
import type { ChannelFixture } from '@/pages/dpc/shared';
import type { ReferenceSource } from '../useA4Store';
import styles from './KnockModal.module.scss';

export interface KnockModalProps {
  channel: Pick<ChannelFixture, 'id' | 'displayName' | 'purpose'>;
  /** Provenance label, e.g. "permalink from @log.lead". */
  via: string;
  /** Reference source for the source tag. */
  source: ReferenceSource;
  /** Whether the user has a pending knock for this channel. Drives Step 2. */
  pending: boolean;
  /** Whether the trigger surface is mobile (sheet-style padding). */
  compact?: boolean;
  onSendKnock(message: string | null): void;
  onWithdraw(): void;
  onClose(): void;
}

const SOURCE_LABEL: Record<ReferenceSource, string> = {
  permalink: 'Permalink',
  mention: '@mention',
  recommendation: 'Recommendation',
  'prior-membership': 'Prior member',
};

export default function KnockModal({
  channel,
  via,
  source,
  pending,
  compact = false,
  onSendKnock,
  onWithdraw,
  onClose,
}: KnockModalProps) {
  const [message, setMessage] = useState('');

  // Focus first interactive element (Cancel) on open — primary "Send knock"
  // is NOT auto-focused per §3.4.3 anti-fatigue rationale. We achieve this
  // simply by ordering Cancel before Send in the footer; the modal's native
  // tab order makes Cancel the first stop.
  useEffect(() => {
    /* see comment above — focus management is structural, not imperative. */
  }, []);

  if (pending) {
    return (
      <div
        className={[
          styles['knock-modal-shell'],
          compact ? styles['knock-modal-shell--compact'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Modal
          size="Small"
          title={
            <span className={styles['knock-modal__title-row']}>
              <Icon size="20" glyph={<LockIcon />} />
              <span>Knock sent</span>
            </span>
          }
          subtitle={`#${channel.displayName}`}
          onClose={onClose}
          footer={
            <Button emphasis="Tertiary" onClick={onWithdraw}>
              Withdraw knock
            </Button>
          }
        >
          <div className={styles['knock-modal__body']}>
            <p className={styles['knock-modal__purpose']}>
              Purpose: {channel.purpose}
            </p>
            <p className={styles['knock-modal__copy']}>
              Your knock is pending review by a channel admin. You&apos;ll
              receive a DM when it&apos;s accepted or declined.
            </p>
            <p className={styles['knock-modal__reference']}>
              <span className={styles['knock-modal__reference-label']}>
                Reference recorded:
              </span>{' '}
              {via}
            </p>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div
      className={[
        styles['knock-modal-shell'],
        compact ? styles['knock-modal-shell--compact'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Modal
        size="Small"
        title={
          <span className={styles['knock-modal__title-row']}>
            <Icon size="20" glyph={<LockIcon />} />
            <span>Knock on #{channel.displayName}</span>
          </span>
        }
        subtitle="Private channel"
        onClose={onClose}
        footer={
          <div className={styles['knock-modal__footer']}>
            <Button emphasis="Tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              emphasis="Primary"
              onClick={() =>
                onSendKnock(message.trim() === '' ? null : message.trim())
              }
            >
              Send knock
            </Button>
          </div>
        }
      >
        <div className={styles['knock-modal__body']}>
          <p className={styles['knock-modal__purpose']}>
            Purpose: {channel.purpose}
          </p>
          <p className={styles['knock-modal__copy']}>
            Sending a knock asks a channel admin to grant you access. Channel
            content remains hidden until your knock is accepted.
          </p>

          <div className={styles['knock-modal__field']}>
            <label
              htmlFor="knock-modal-message"
              className={styles['knock-modal__field-label']}
            >
              Optional message to the channel admin
            </label>
            <TextArea
              id="knock-modal-message"
              maxLength={500}
              showCharacterCount
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="(none)"
            />
          </div>

          <div className={styles['knock-modal__reference-block']}>
            <LabelTag
              label={SOURCE_LABEL[source]}
              type="Info Dim"
              size="X-Small"
              casing="All Caps"
            />
            <p className={styles['knock-modal__reference']}>
              <span className={styles['knock-modal__reference-label']}>
                Reference:
              </span>{' '}
              arrived via {via}
            </p>
            <p className={styles['knock-modal__reference-note']}>
              This is recorded with your knock and visible to channel admins.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
