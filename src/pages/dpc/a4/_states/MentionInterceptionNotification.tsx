/**
 * Reference channel 2 — @mention interception per §3.4.2.
 *
 * Renders an @mention card in the user's at-mentions activity surface for a
 * private channel they are not in. Card shows **name + purpose + mentioned-by
 * + when** only (NFR-1). Post content is redacted server-side; the card
 * explicitly says so. Knock affordance opens KnockModal with source=mention.
 *
 * Anti-pattern: the card never previews the post body. Anti-pattern: guest
 * users would never see this card — the mention is blocked at the
 * notification-generation layer (NFR-2), demonstrated here by rendering a
 * "filtered" placeholder for the guest persona.
 */
import { useState } from 'react';
import Button from '@/components/ui/Button/Button';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import LockIcon from '@mattermost/compass-icons/components/lock-outline';
import AtIcon from '@mattermost/compass-icons/components/at';
import Icon from '@/components/ui/Icon/Icon';
import { findChannel } from '../useA4Store';
import type { Reference } from '../useA4Store';
import KnockModal from './KnockModal';
import styles from './MentionInterceptionNotification.module.scss';

export interface MentionInterceptionNotificationProps {
  reference: Reference;
  pending: boolean;
  guestFiltered?: boolean;
  onSendKnock(message: string | null): void;
  onWithdraw(): void;
  onDismiss(): void;
}

export default function MentionInterceptionNotification({
  reference,
  pending,
  guestFiltered = false,
  onSendKnock,
  onWithdraw,
  onDismiss,
}: MentionInterceptionNotificationProps) {
  const channel = findChannel(reference.channelId);
  const [modalOpen, setModalOpen] = useState(false);

  if (!channel) return null;

  if (guestFiltered) {
    return (
      <div className={styles['mention-card']}>
        <LabelTag
          label="Guest filter active"
          type="Danger"
          size="X-Small"
          casing="All Caps"
        />
        <p className={styles['mention-card__guest']}>
          Mentions from private channels you are not in are blocked at the
          notification-generation layer (NFR-2). Guest users never see this
          card by construction.
        </p>
      </div>
    );
  }

  return (
    <article
      className={styles['mention-card']}
      aria-label={`Knock to request access to ${channel.displayName}`}
    >
      <header className={styles['mention-card__header']}>
        <span className={styles['mention-card__eyebrow-icon']}>
          <Icon size="20" glyph={<LockIcon />} />
        </span>
        <div className={styles['mention-card__eyebrow-stack']}>
          <span className={styles['mention-card__eyebrow']}>
            You were mentioned in a private channel you&apos;re not in
          </span>
          <span className={styles['mention-card__source']}>
            <Icon size="12" glyph={<AtIcon />} />
            <span>Mention</span>
          </span>
        </div>
      </header>

      <h3 className={styles['mention-card__channel-name']}>
        #{channel.displayName}
      </h3>
      <p className={styles['mention-card__purpose']}>
        <span className={styles['mention-card__purpose-label']}>Purpose:</span>{' '}
        {channel.purpose}
      </p>

      <dl className={styles['mention-card__meta']}>
        <div className={styles['mention-card__meta-row']}>
          <dt className={styles['mention-card__meta-label']}>Mentioned by</dt>
          <dd className={styles['mention-card__meta-value']}>
            {reference.fromUser ?? '@mission.plan'}
          </dd>
        </div>
        <div className={styles['mention-card__meta-row']}>
          <dt className={styles['mention-card__meta-label']}>When</dt>
          <dd className={styles['mention-card__meta-value']}>
            today, 13:47
          </dd>
        </div>
      </dl>

      <p className={styles['mention-card__hidden-note']}>
        Post content is hidden until your knock is accepted.
      </p>

      <div className={styles['mention-card__actions']}>
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
        <Button emphasis="Tertiary" size="Small" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>

      {modalOpen && (
        <KnockModal
          channel={channel}
          via={`@mention from ${reference.fromUser ?? '@mission.plan'}`}
          source="mention"
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
    </article>
  );
}
