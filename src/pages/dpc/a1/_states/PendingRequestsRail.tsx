/**
 * DPC A1 — Members RHS with Pending Requests section (US-5, FR-9, FR-17).
 *
 * Visual chrome ported from the canonical Mattermost Figma (file
 * KUFeXCQAefySaR5Wq3GkeU, node 4119:34028): a 400px right rail with a back
 * chevron header, member-count subheader, "Manage" + "Add" buttons, search
 * input, and three sections — PENDING REQUESTS, CHANNEL ADMINS, MEMBERS.
 *
 * Annotated state flow:
 *   user-click Approve → APPROVE_REQUEST → DM emitted + audit `request.approved`
 *   user-click Deny → inline TextArea expands
 *     user-type reason → local `reason` state
 *     user-click Submit denial → DENY_REQUEST(reason?) → DM + audit `request.denied`
 *
 * Per PRD AC-3.1 the prior-membership pill has been removed — `priorMembership`
 * still flows through to the audit-event payload, but there is no visible
 * "Previously a member" affordance.
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
  usePersona,
} from '@/pages/dpc/shared';
import type { A1StoreApi } from '../useA1Store';
import styles from './PendingRequestsRail.module.scss';

export interface PendingRequestsRailProps {
  store: A1StoreApi;
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

export default function PendingRequestsRail({
  store,
}: PendingRequestsRailProps) {
  const { state, focusChannel } = store;
  const { personaInfo } = usePersona();
  const [denyingRequestId, setDenyingRequestId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');
  const [query, setQuery] = useState('');

  const handleApprove = (id: string) => {
    store.approveRequest(personaInfo.username, id);
  };

  const handleOpenDeny = (id: string) => {
    setDenyingRequestId(id);
    setDenyReason('');
  };

  const handleConfirmDeny = () => {
    if (!denyingRequestId) return;
    store.denyRequest(personaInfo.username, denyingRequestId, denyReason);
    setDenyingRequestId(null);
    setDenyReason('');
  };

  const handleCancelDeny = () => {
    setDenyingRequestId(null);
    setDenyReason('');
  };

  const pending = state.pendingRequests;
  const memberCount = CHANNEL_ADMINS.length + MEMBERS.length;

  const matchesQuery = (row: MemberRowData) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      row.displayName.toLowerCase().includes(q) ||
      row.username.toLowerCase().includes(q)
    );
  };

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
            {focusChannel.displayName}
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
                const isDenying = denyingRequestId === req.id;
                return (
                  <li
                    key={req.id}
                    className={styles['members-rail__pending-item']}
                  >
                    <div className={styles['members-rail__row']}>
                      <div className={styles['members-rail__row-left']}>
                        <UserAvatar
                          src={req.requesterAvatarUrl}
                          alt={req.requesterDisplayName}
                          name={req.requesterDisplayName}
                          size="24"
                        />
                        <div className={styles['members-rail__row-text']}>
                          <span className={styles['members-rail__row-name']}>
                            {req.requesterDisplayName}
                          </span>
                          <span className={styles['members-rail__row-handle']}>
                            @{req.requesterUsername}
                          </span>
                        </div>
                      </div>
                      {!isDenying && (
                        <div className={styles['members-rail__row-actions']}>
                          <Button
                            emphasis="Tertiary"
                            size="Small"
                            destructive
                            onClick={() => handleOpenDeny(req.id)}
                          >
                            Deny
                          </Button>
                          <Button
                            emphasis="Primary"
                            size="Small"
                            onClick={() => handleApprove(req.id)}
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
                            onClick={handleCancelDeny}
                          >
                            Cancel
                          </Button>
                          <Button
                            emphasis="Primary"
                            size="Small"
                            destructive
                            onClick={handleConfirmDeny}
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
