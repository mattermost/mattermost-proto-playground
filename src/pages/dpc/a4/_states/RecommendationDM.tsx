/**
 * Reference channel 3 — Member recommendation per §3.4.2.
 *
 * Two surfaces in this file:
 *   - RecipientCard: the DM card the recipient receives, with the knock
 *     affordance. Same three-state shape as PermalinkUnfurl
 *     (not-knocked / knocked-pending / channel-revoked).
 *   - SenderForm: the "Recommend channel to a colleague…" form, surfaced
 *     under the channel-header overflow menu (only visible if the channel's
 *     "Allow member recommendations" sub-toggle is ON and the active user
 *     matches the recommendation-permission radio per OQ-5.4).
 *
 * Includes the V-A4-4 rate-limit demonstration: a "Send recommendation"
 * action with an explicit "Simulate rate limit" affordance that emits the
 * Recommendation_rate_limited audit event.
 */
import { useState } from 'react';
import Button from '@/components/ui/Button/Button';
import TextArea from '@/components/ui/TextArea/TextArea';
import TextInput from '@/components/ui/TextInput/TextInput';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import LockIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { findChannel } from '../useA4Store';
import type { Reference, RecommendationPermission } from '../useA4Store';
import KnockModal from './KnockModal';
import styles from './RecommendationDM.module.scss';

// ── Recipient view ──────────────────────────────────────────────────────

export interface RecipientCardProps {
  reference: Reference;
  pending: boolean;
  onSendKnock(message: string | null): void;
  onWithdraw(): void;
}

export function RecipientCard({
  reference,
  pending,
  onSendKnock,
  onWithdraw,
}: RecipientCardProps) {
  const channel = findChannel(reference.channelId);
  const [modalOpen, setModalOpen] = useState(false);

  if (!channel) return null;

  return (
    <div className={styles['recommendation-dm']}>
      <header className={styles['recommendation-dm__header']}>
        <UserAvatar
          alt="Comms Specialist"
          name="Comms Specialist"
          size="32"
        />
        <div className={styles['recommendation-dm__header-meta']}>
          <span className={styles['recommendation-dm__author']}>
            {reference.fromUser ?? '@comms.spec'}
          </span>
          <span className={styles['recommendation-dm__time']}>
            recommends a private channel · 14:31
          </span>
        </div>
      </header>

      <div className={styles['recommendation-dm__card']}>
        <div className={styles['recommendation-dm__card-header']}>
          <Icon size="20" glyph={<LockIcon />} />
          <span className={styles['recommendation-dm__card-eyebrow']}>
            Private channel recommendation
          </span>
        </div>

        <h3 className={styles['recommendation-dm__channel-name']}>
          #{channel.displayName}
        </h3>
        <p className={styles['recommendation-dm__purpose']}>
          <span className={styles['recommendation-dm__purpose-label']}>
            Purpose:
          </span>{' '}
          {channel.purpose}
        </p>

        {reference.note && (
          <blockquote className={styles['recommendation-dm__note']}>
            <span className={styles['recommendation-dm__note-label']}>
              Note from {reference.fromUser ?? '@comms.spec'}:
            </span>
            <span className={styles['recommendation-dm__note-body']}>
              {reference.note}
            </span>
          </blockquote>
        )}

        <div className={styles['recommendation-dm__actions']}>
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
        </div>
      </div>

      {modalOpen && (
        <KnockModal
          channel={channel}
          via={`recommendation from ${reference.fromUser ?? '@comms.spec'}`}
          source="recommendation"
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

// ── Sender form ─────────────────────────────────────────────────────────

export interface SenderFormProps {
  channelId: string;
  /** Channel's recommendation-permission radio value (drives gating). */
  permission: RecommendationPermission;
  /** Active user role for permission gating. */
  isChannelAdmin: boolean;
  onSendRecommendation(input: {
    recipientHandle: string;
    note: string;
  }): void;
  onSimulateRateLimit(input: { recipientHandle: string }): void;
}

export function SenderForm({
  channelId,
  permission,
  isChannelAdmin,
  onSendRecommendation,
  onSimulateRateLimit,
}: SenderFormProps) {
  const channel = findChannel(channelId);
  const [recipient, setRecipient] = useState('@new.analyst');
  const [note, setNote] = useState(
    'I think this would be relevant to your work on the comms sync.',
  );

  if (!channel) return null;

  const blockedByPermission =
    permission === 'disabled' ||
    (permission === 'channel-admins-only' && !isChannelAdmin);

  return (
    <div className={styles['recommendation-sender']}>
      <header className={styles['recommendation-sender__header']}>
        <h3 className={styles['recommendation-sender__title']}>
          Recommend #{channel.displayName} to a colleague
        </h3>
        <LabelTag
          label={
            permission === 'all-members'
              ? 'All members can recommend'
              : permission === 'channel-admins-only'
                ? 'Channel admins only'
                : 'Recommendations disabled'
          }
          type={permission === 'disabled' ? 'Danger' : 'Info'}
          size="X-Small"
          casing="All Caps"
        />
      </header>

      {blockedByPermission ? (
        <p className={styles['recommendation-sender__blocked']}>
          You can&apos;t recommend this channel — the channel admin has set
          permission to{' '}
          <strong>
            {permission === 'disabled'
              ? '"Disabled"'
              : '"Channel admins only"'}
          </strong>
          . Switch to the Channel Admin persona to send a recommendation.
        </p>
      ) : (
        <div className={styles['recommendation-sender__form']}>
          <div className={styles['recommendation-sender__field']}>
            <label
              htmlFor="rec-recipient"
              className={styles['recommendation-sender__field-label']}
            >
              Send a recommendation to
            </label>
            <TextInput
              id="rec-recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="@colleague handle"
            />
            <p className={styles['recommendation-sender__field-help']}>
              Type to search team members. Guests are not listed (NFR-2 server-side filter).
            </p>
          </div>

          <div className={styles['recommendation-sender__field']}>
            <label
              htmlFor="rec-note"
              className={styles['recommendation-sender__field-label']}
            >
              Optional note (shared with recipient, max 500 chars)
            </label>
            <TextArea
              id="rec-note"
              maxLength={500}
              showCharacterCount
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <p className={styles['recommendation-sender__rec-explainer']}>
            Recipient will receive a DM with the channel name, purpose, and a
            knock affordance. They are not added to the channel by this action.
          </p>

          <div className={styles['recommendation-sender__actions']}>
            <Button
              emphasis="Primary"
              onClick={() =>
                onSendRecommendation({
                  recipientHandle: recipient,
                  note,
                })
              }
            >
              Send recommendation
            </Button>
            <Button
              emphasis="Quaternary"
              onClick={() =>
                onSimulateRateLimit({ recipientHandle: recipient })
              }
              title="Simulate V-A4-4 rate-limit response"
            >
              Simulate rate-limit (V-A4-4)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
