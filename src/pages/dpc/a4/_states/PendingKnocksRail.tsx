/**
 * A4 — Members RHS with Pending Knocks section (§3.4.5 / FR-9 / FR-17).
 *
 * Visual chrome ported from the canonical Mattermost Figma (file
 * KUFeXCQAefySaR5Wq3GkeU, node 4119:34028): a 400px right rail with a back
 * chevron header, member-count subheader, "Manage" + "Add" buttons, search
 * input, and three sections — PENDING KNOCKS, CHANNEL ADMINS, MEMBERS.
 *
 * A4 framing: this rail uses "knock" language throughout — "Pending Knocks",
 * "Accept knock", "Decline knock". Per §3.4.5 the reference source still
 * carries trust semantics (permalink / mention / recommendation / prior-
 * membership) but is not rendered visually in the Members RHS — that detail
 * remains in the knock detail flyout. Decline opens an inline Reason field
 * (FR-17 plain text, max 500 chars).
 */
import { useState } from 'react';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import CloseIcon from '@mattermost/compass-icons/components/close';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import TextArea from '@/components/ui/TextArea/TextArea';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { PERSONAS, SUPPORTING_USERS } from '@/pages/dpc/shared';
import { findChannel } from '../useA4Store';
import type { PendingKnock } from '../useA4Store';
import styles from './PendingKnocksRail.module.scss';

export interface PendingKnocksRailProps {
  channelId: string;
  pendingKnocks: PendingKnock[];
  /** Whether the device viewport is mobile — KD-8 web-only at launch. */
  isMobile?: boolean;
  onAccept(knockId: string): void;
  onDecline(knockId: string, reason: string | null): void;
}

interface MemberRowData {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
}

const CHANNEL_ADMINS: MemberRowData[] = [
  {
    id: PERSONAS['channel-admin'].id,
    displayName: PERSONAS['channel-admin'].displayName,
    username: PERSONAS['channel-admin'].username,
    avatarUrl: PERSONAS['channel-admin'].avatarUrl,
  },
];

const MEMBERS: MemberRowData[] = SUPPORTING_USERS.slice(0, 6).map((u) => ({
  id: u.id,
  displayName: u.displayName,
  username: u.username,
  avatarUrl: u.avatarUrl,
}));

export default function PendingKnocksRail({
  channelId,
  pendingKnocks,
  isMobile = false,
  onAccept,
  onDecline,
}: PendingKnocksRailProps) {
  const channel = findChannel(channelId);
  const knocks = pendingKnocks.filter((k) => k.channelId === channelId);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [query, setQuery] = useState('');

  if (isMobile) {
    return (
      <aside className={styles['members-rail']}>
        <p className={styles['members-rail__mobile-notice']}>
          Pending Knocks queue is web-only at launch (KD-8). Open on desktop
          to review.
        </p>
      </aside>
    );
  }

  const handleStartDecline = (id: string) => {
    setDecliningId(id);
    setReason('');
  };

  const handleConfirmDecline = (id: string) => {
    onDecline(id, reason.trim() === '' ? null : reason.trim());
    setDecliningId(null);
    setReason('');
  };

  const handleCancelDecline = () => {
    setDecliningId(null);
    setReason('');
  };

  const matchesQuery = (row: MemberRowData) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      row.displayName.toLowerCase().includes(q) ||
      row.username.toLowerCase().includes(q)
    );
  };

  const memberCount = (channel?.memberCount ?? 0) || CHANNEL_ADMINS.length + MEMBERS.length;

  return (
    <aside
      className={styles['members-rail']}
      aria-label={`Members and pending knocks for ${channel?.displayName ?? channelId}`}
    >
      <header className={styles['members-rail__header']}>
        <div className={styles['members-rail__header-left']}>
          <IconButton
            aria-label="Back"
            size="Small"
            icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          />
          <h3 className={styles['members-rail__title']}>Members</h3>
          <span
            className={styles['members-rail__title-divider']}
            aria-hidden
          />
          <span className={styles['members-rail__channel-name']}>
            {channel?.displayName ?? channelId}
          </span>
        </div>
        <IconButton
          aria-label="Close"
          size="Small"
          icon={<Icon size="16" glyph={<CloseIcon />} />}
        />
      </header>

      <div className={styles['members-rail__subheader']}>
        <span className={styles['members-rail__count']}>
          {memberCount} members
        </span>
        <div className={styles['members-rail__subheader-actions']}>
          <Button emphasis="Tertiary" size="Small">
            Manage
          </Button>
          <Button
            emphasis="Primary"
            size="Small"
            leadingIcon={
              <Icon size="16" glyph={<AccountPlusOutlineIcon />} />
            }
          >
            Add
          </Button>
        </div>
      </div>

      <div className={styles['members-rail__search']}>
        <TextInput
          size="Medium"
          placeholder="Search members"
          leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className={styles['members-rail__body']}>
        {knocks.length > 0 && (
          <section className={styles['members-rail__section']}>
            <h4 className={styles['members-rail__section-title']}>
              Pending Knocks ({knocks.length})
            </h4>
            <ul className={styles['members-rail__list']}>
              {knocks.map((knock) => {
                const isDeclining = decliningId === knock.id;
                return (
                  <li
                    key={knock.id}
                    className={styles['members-rail__pending-item']}
                  >
                    <div className={styles['members-rail__row']}>
                      <div className={styles['members-rail__row-left']}>
                        <UserAvatar
                          alt={knock.knockerDisplay}
                          name={knock.knockerDisplay}
                          size="24"
                        />
                        <div className={styles['members-rail__row-text']}>
                          <span className={styles['members-rail__row-name']}>
                            {knock.knockerDisplay}
                          </span>
                          <span className={styles['members-rail__row-handle']}>
                            {knock.knockerHandle}
                          </span>
                        </div>
                      </div>
                      {!isDeclining && (
                        <div className={styles['members-rail__row-actions']}>
                          <Button
                            emphasis="Tertiary"
                            size="Small"
                            destructive
                            onClick={() => handleStartDecline(knock.id)}
                          >
                            Decline knock
                          </Button>
                          <Button
                            emphasis="Primary"
                            size="Small"
                            onClick={() => onAccept(knock.id)}
                          >
                            Accept knock
                          </Button>
                        </div>
                      )}
                    </div>
                    {isDeclining && (
                      <div
                        className={styles['members-rail__deny-form']}
                        role="region"
                        aria-label="Decline knock"
                      >
                        <TextArea
                          rows={2}
                          maxLength={500}
                          showCharacterCount
                          placeholder={`Reason (optional, shared with ${knock.knockerHandle})`}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                        <div className={styles['members-rail__deny-actions']}>
                          <Button
                            emphasis="Tertiary"
                            size="Small"
                            onClick={handleCancelDecline}
                          >
                            Cancel
                          </Button>
                          <Button
                            emphasis="Primary"
                            size="Small"
                            destructive
                            onClick={() => handleConfirmDecline(knock.id)}
                          >
                            Submit decline
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className={styles['members-rail__section']}>
          <h4 className={styles['members-rail__section-title']}>
            Channel Admins
          </h4>
          <ul className={styles['members-rail__list']}>
            {CHANNEL_ADMINS.filter(matchesQuery).map((m) => (
              <MemberRow key={m.id} row={m} />
            ))}
          </ul>
        </section>

        <section className={styles['members-rail__section']}>
          <h4 className={styles['members-rail__section-title']}>Members</h4>
          <ul className={styles['members-rail__list']}>
            {MEMBERS.filter(matchesQuery).map((m) => (
              <MemberRow key={m.id} row={m} />
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}

function MemberRow({ row }: { row: MemberRowData }) {
  return (
    <li className={styles['members-rail__row']}>
      <div className={styles['members-rail__row-left']}>
        <UserAvatar
          src={row.avatarUrl}
          alt={row.displayName}
          name={row.displayName}
          size="24"
          status
        />
        <div className={styles['members-rail__row-text']}>
          <span className={styles['members-rail__row-name']}>
            {row.displayName}
          </span>
          <span className={styles['members-rail__row-handle']}>
            @{row.username}
          </span>
        </div>
      </div>
    </li>
  );
}
