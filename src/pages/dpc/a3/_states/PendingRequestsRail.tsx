/**
 * A3 — Members RHS with Pending Requests section (§3.3.5 / FR-9 / FR-17).
 *
 * Visual chrome ported from the canonical Mattermost Figma (file
 * KUFeXCQAefySaR5Wq3GkeU, node 4119:34028): a 400px right rail with a back
 * chevron header, member-count subheader, "Manage" + "Add" buttons, search
 * input, and three sections — PENDING REQUESTS, CHANNEL ADMINS, MEMBERS.
 *
 * Identical pattern to A1 (referenced, not rebuilt per §3.3.13#4). The queue
 * spans the channels the active channel admin owns directory entries for —
 * the per-channel right-rail queue remains the authoritative surface for
 * FR-9 / audit emission.
 *
 * Inline Approve / Deny actions; Deny opens an inline Reason field
 * (FR-17 plain text, max 500 chars). The optional reason is forwarded to
 * the DENY_REQUEST dispatch.
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
import {
  PERSONAS,
  SUPPORTING_USERS,
} from '@/pages/dpc/shared';
import { useA3Channel } from '../A3.context';
import type { A3Store, PendingRequest } from '../useA3Store';
import styles from './PendingRequestsRail.module.scss';

interface PendingRequestsRailProps {
  store: A3Store;
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

function resolveRequester(username: string): MemberRowData {
  const persona = Object.values(PERSONAS).find((p) => p.username === username);
  if (persona) {
    return {
      id: persona.id,
      displayName: persona.displayName,
      username: persona.username,
      avatarUrl: persona.avatarUrl,
    };
  }
  const sup = SUPPORTING_USERS.find((u) => u.username === username);
  if (sup) {
    return {
      id: sup.id,
      displayName: sup.displayName,
      username: sup.username,
      avatarUrl: sup.avatarUrl,
    };
  }
  return {
    id: username,
    displayName: username,
    username,
    avatarUrl: undefined,
  };
}

export default function PendingRequestsRail({ store }: PendingRequestsRailProps) {
  const { channel } = useA3Channel();
  const adminUsername = PERSONAS['channel-admin'].username;
  const pending = store
    .pendingForAdmin(adminUsername)
    .filter((r) => r.channelId === channel.id);
  const [denyingKey, setDenyingKey] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');
  const [query, setQuery] = useState('');

  const onApprove = (req: PendingRequest) => {
    store.dispatch({
      type: 'APPROVE_REQUEST',
      channelId: req.channelId,
      requesterUsername: req.requesterUsername,
      adminUsername,
    });
  };

  const onStartDeny = (req: PendingRequest) => {
    setDenyingKey(`${req.channelId}::${req.requesterUsername}`);
    setDenyReason('');
  };

  const onConfirmDeny = (req: PendingRequest) => {
    store.dispatch({
      type: 'DENY_REQUEST',
      channelId: req.channelId,
      requesterUsername: req.requesterUsername,
      adminUsername,
      reason: denyReason.trim(),
    });
    setDenyingKey(null);
    setDenyReason('');
  };

  const onCancelDeny = () => {
    setDenyingKey(null);
    setDenyReason('');
  };

  const matchesQuery = (row: MemberRowData) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      row.displayName.toLowerCase().includes(q) ||
      row.username.toLowerCase().includes(q)
    );
  };

  const memberCount = CHANNEL_ADMINS.length + MEMBERS.length;

  return (
    <aside
      className={styles['members-rail']}
      aria-label="Members and pending requests"
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
            {channel.displayName}
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
        {pending.length > 0 && (
          <section className={styles['members-rail__section']}>
            <h4 className={styles['members-rail__section-title']}>
              Pending Requests ({pending.length})
            </h4>
            <ul className={styles['members-rail__list']}>
              {pending.map((req) => {
                const key = `${req.channelId}::${req.requesterUsername}`;
                const isDenying = denyingKey === key;
                const requester = resolveRequester(req.requesterUsername);
                return (
                  <li
                    key={key}
                    className={styles['members-rail__pending-item']}
                  >
                    <div className={styles['members-rail__row']}>
                      <div className={styles['members-rail__row-left']}>
                        <UserAvatar
                          src={requester.avatarUrl}
                          alt={requester.displayName}
                          name={requester.displayName}
                          size="24"
                        />
                        <div className={styles['members-rail__row-text']}>
                          <span className={styles['members-rail__row-name']}>
                            {requester.displayName}
                          </span>
                          <span className={styles['members-rail__row-handle']}>
                            @{requester.username}
                          </span>
                        </div>
                      </div>
                      {!isDenying && (
                        <div className={styles['members-rail__row-actions']}>
                          <Button
                            emphasis="Tertiary"
                            size="Small"
                            destructive
                            onClick={() => onStartDeny(req)}
                          >
                            Deny
                          </Button>
                          <Button
                            emphasis="Primary"
                            size="Small"
                            onClick={() => onApprove(req)}
                          >
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                    {isDenying && (
                      <div
                        className={styles['members-rail__deny-form']}
                        role="region"
                        aria-label="Deny request"
                      >
                        <TextArea
                          rows={2}
                          maxLength={500}
                          showCharacterCount
                          placeholder="Reason (optional, shared with requester)"
                          value={denyReason}
                          onChange={(e) => setDenyReason(e.target.value)}
                        />
                        <div className={styles['members-rail__deny-actions']}>
                          <Button
                            emphasis="Tertiary"
                            size="Small"
                            onClick={onCancelDeny}
                          >
                            Cancel
                          </Button>
                          <Button
                            emphasis="Primary"
                            size="Small"
                            destructive
                            onClick={() => onConfirmDeny(req)}
                          >
                            Submit denial
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
