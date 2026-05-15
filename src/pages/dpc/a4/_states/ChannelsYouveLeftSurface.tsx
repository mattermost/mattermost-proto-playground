/**
 * Reference channel 4 — Prior-membership lookup per §3.4.2.
 *
 * The "Channels you've left" surface. This is also A4's leave-and-rejoin
 * mechanism (§3.4.6) — there is no separate rejoin surface.
 *
 * Per V-A4-3, the listing is strictly per-user. The prototype enforces this
 * by filtering the state's `channelsLeft` entries by `ownerPersonaId` against
 * the current persona id. The displayed columns are name + purpose + left
 * date + status (per NFR-1; never reveals other members' prior states).
 *
 * Each row carries a "Knock to rejoin" action whose state depends on the
 * channel's current Allow Knocks → prior-members sub-toggle (and whether
 * the channel still exists).
 */
import { useState } from 'react';
import Button from '@/components/ui/Button/Button';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import LockIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import { findChannel } from '../useA4Store';
import type { LeftChannel } from '../useA4Store';
import KnockModal from './KnockModal';
import styles from './ChannelsYouveLeftSurface.module.scss';

export interface ChannelsYouveLeftSurfaceProps {
  /** All channelsLeft from store; this component filters per-persona itself. */
  channelsLeft: LeftChannel[];
  /** Active persona id — for V-A4-3 per-user filtering. */
  personaId: string;
  /** Channel IDs the user currently has pending knocks against. */
  myPendingKnocks: string[];
  /** Whether the active user is a guest (vacuously empty surface). */
  guestEmpty?: boolean;
  /** When true, render a forced empty state (newer-user composite quadrant). */
  forceEmpty?: boolean;
  onKnock(input: {
    channelId: string;
    channelName: string;
    purpose: string;
    message: string | null;
  }): void;
  onWithdraw(channelId: string): void;
}

export default function ChannelsYouveLeftSurface({
  channelsLeft,
  personaId,
  myPendingKnocks,
  guestEmpty = false,
  forceEmpty = false,
  onKnock,
  onWithdraw,
}: ChannelsYouveLeftSurfaceProps) {
  const mine = forceEmpty
    ? []
    : channelsLeft.filter((c) => c.ownerPersonaId === personaId);
  const [openId, setOpenId] = useState<string | null>(null);

  if (guestEmpty) {
    return (
      <section className={styles['channels-left']}>
        <header className={styles['channels-left__header']}>
          <h2 className={styles['channels-left__title']}>
            Channels you&apos;ve left
          </h2>
        </header>
        <p className={styles['channels-left__empty']}>
          Guests cannot have prior membership in non-guest private channels.
          This surface is empty by construction (NFR-2 / FR-12).
        </p>
      </section>
    );
  }

  return (
    <section className={styles['channels-left']}>
      <header className={styles['channels-left__header']}>
        <h2 className={styles['channels-left__title']}>
          Channels you&apos;ve left
        </h2>
        <p className={styles['channels-left__subtitle']}>
          Channels you previously belonged to. You can knock on any channel
          that still accepts knocks from prior members.
        </p>
        <p className={styles['channels-left__privacy']}>
          <Icon size="12" glyph={<LockIcon />} />
          <span>
            Per-user listing — never reveals other members&apos; prior state (V-A4-3).
          </span>
        </p>
      </header>

      {mine.length === 0 ? (
        <p className={styles['channels-left__empty']}>
          You haven&apos;t left any channels yet.
        </p>
      ) : (
        <ul className={styles['channels-left__list']}>
          {mine.map((entry) => {
            const channel = findChannel(entry.channelId);
            const fallbackName = channel?.displayName ?? entry.channelName;
            const fallbackPurpose = channel?.purpose ?? entry.purpose;
            const pending = myPendingKnocks.includes(entry.channelId);

            return (
              <li
                key={entry.channelId}
                className={styles['channels-left__row']}
              >
                <div className={styles['channels-left__row-head']}>
                  <Icon size="20" glyph={<LockIcon />} />
                  <h3 className={styles['channels-left__row-name']}>
                    #{fallbackName}
                  </h3>
                </div>

                <dl className={styles['channels-left__meta']}>
                  <div className={styles['channels-left__meta-row']}>
                    <dt className={styles['channels-left__meta-label']}>
                      Left
                    </dt>
                    <dd className={styles['channels-left__meta-value']}>
                      {entry.leftDate}
                    </dd>
                  </div>
                  <div className={styles['channels-left__meta-row']}>
                    <dt className={styles['channels-left__meta-label']}>
                      Purpose
                    </dt>
                    <dd className={styles['channels-left__meta-value']}>
                      {fallbackPurpose}
                    </dd>
                  </div>
                  <div className={styles['channels-left__meta-row']}>
                    <dt className={styles['channels-left__meta-label']}>
                      Status
                    </dt>
                    <dd className={styles['channels-left__meta-value']}>
                      {entry.status === 'accepts-knocks' && (
                        <LabelTag
                          label="Accepts knocks from prior members"
                          type="Success"
                          size="X-Small"
                          casing="Title Case"
                        />
                      )}
                      {entry.status === 'admin-disabled' && (
                        <LabelTag
                          label="No longer accepts knocks (admin disabled)"
                          type="Warning"
                          size="X-Small"
                          casing="Title Case"
                        />
                      )}
                      {entry.status === 'channel-deleted' && (
                        <LabelTag
                          label="Channel no longer exists"
                          type="Danger"
                          size="X-Small"
                          casing="Title Case"
                        />
                      )}
                    </dd>
                  </div>
                </dl>

                <div className={styles['channels-left__row-actions']}>
                  {pending ? (
                    <Button
                      emphasis="Tertiary"
                      size="Small"
                      onClick={() => setOpenId(entry.channelId)}
                    >
                      Knock pending — withdraw
                    </Button>
                  ) : (
                    <Button
                      emphasis="Primary"
                      size="Small"
                      disabled={entry.status !== 'accepts-knocks'}
                      onClick={() => setOpenId(entry.channelId)}
                    >
                      Knock to rejoin
                    </Button>
                  )}
                </div>

                {openId === entry.channelId && (
                  <KnockModal
                    channel={{
                      id: entry.channelId,
                      displayName: fallbackName,
                      purpose: fallbackPurpose,
                    }}
                    via={`prior member (left ${entry.leftDate})`}
                    source="prior-membership"
                    pending={pending}
                    onSendKnock={(msg) => {
                      onKnock({
                        channelId: entry.channelId,
                        channelName: fallbackName,
                        purpose: fallbackPurpose,
                        message: msg,
                      });
                      setOpenId(null);
                    }}
                    onWithdraw={() => {
                      onWithdraw(entry.channelId);
                      setOpenId(null);
                    }}
                    onClose={() => setOpenId(null)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {mine.length > 0 && (
        <footer className={styles['channels-left__footer']}>
          Showing {mine.length} of {mine.length}.
        </footer>
      )}
    </section>
  );
}
