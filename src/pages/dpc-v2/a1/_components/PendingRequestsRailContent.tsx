/**
 * PendingRequestsRailContent — the right-rail `<aside>` body for the
 * Members + Pending Requests panel. Extracted from
 * `_states/PendingRequestsRail.tsx` (May 2026) so both the standalone
 * Pending Requests screen AND the consolidated PendingRequestIndicators
 * showcase render the SAME rail markup against the SAME SCSS module —
 * no forked styles, no parallel anatomy drift.
 *
 * Uses the existing `_states/PendingRequestsRail.module.scss` so the
 * dot, row, and section treatments stay one source of truth.
 */
import { useState } from 'react';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import CloseIcon from '@mattermost/compass-icons/components/close';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import EmailOutlineIcon from '@mattermost/compass-icons/components/email-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import TextInput from '@/components/ui/TextInput/TextInput';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import {
  PERSONAS,
  SUPPORTING_USERS,
  usePersona,
} from '@/pages/dpc/shared';
import { shellStyles } from './DpcAppShell';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from '../_states/PendingRequestsRail.module.scss';

export interface PendingRequestsRailContentProps {
  store: A1V2StoreApi;
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

export default function PendingRequestsRailContent({
  store,
}: PendingRequestsRailContentProps) {
  const { state, focusChannel } = store;
  const { personaInfo } = usePersona();
  const [query, setQuery] = useState('');

  const handleApprove = (id: string) => {
    store.approveRequest(personaInfo.username, id);
  };

  const handleOpenDeny = (id: string) => {
    store.openDeclineModal(id);
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
      id="dpc-a1-rhs-rail"
      className={[
        shellStyles['channel-shell__right-sidebar'],
        styles['v2-pending-rail'],
      ].join(' ')}
      aria-label="Members and pending requests"
    >
      <header className={styles['v2-pending-rail__header']}>
        <div className={styles['v2-pending-rail__header-left']}>
          <IconButton
            aria-label="Back"
            size="Small"
            icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          />
          <h3 className={styles['v2-pending-rail__title']}>Members</h3>
          <span
            className={styles['v2-pending-rail__title-divider']}
            aria-hidden
          />
          <span className={styles['v2-pending-rail__channel-name']}>
            {focusChannel.displayName}
          </span>
        </div>
        <IconButton
          aria-label="Close"
          size="Small"
          icon={<Icon size="16" glyph={<CloseIcon />} />}
        />
      </header>

      <div className={styles['v2-pending-rail__subheader']}>
        <span className={styles['v2-pending-rail__count']}>
          {memberCount} members
        </span>
        <div className={styles['v2-pending-rail__subheader-actions']}>
          <Button emphasis="Tertiary" size="Small">
            Manage
          </Button>
          <Button
            emphasis="Primary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<AccountPlusOutlineIcon />} />}
          >
            Add
          </Button>
        </div>
      </div>

      <div className={styles['v2-pending-rail__search']}>
        <TextInput
          size="Medium"
          placeholder="Search members"
          leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className={styles['v2-pending-rail__body']}>
        <Scrollbars>
          <section className={styles['v2-pending-rail__section']}>
            <h4 className={styles['v2-pending-rail__section-title']}>
              Pending Requests ({pending.length})
            </h4>
            {pending.length === 0 ? (
              <div className={styles['v2-pending-rail__empty']}>
                <Icon size="20" glyph={<EmailOutlineIcon />} />
                <span className={styles['v2-pending-rail__empty-title']}>
                  No pending requests
                </span>
                <span className={styles['v2-pending-rail__empty-sub']}>
                  When someone requests to join this channel, you'll see it
                  here.
                </span>
              </div>
            ) : (
              <ul className={styles['v2-pending-rail__list']}>
                {pending.map((req) => (
                  <li
                    key={req.id}
                    className={styles['v2-pending-rail__pending-item']}
                  >
                    <div className={styles['v2-pending-rail__row']}>
                      <div className={styles['v2-pending-rail__row-left']}>
                        <UserAvatar
                          src={req.requesterAvatarUrl}
                          alt={req.requesterDisplayName}
                          name={req.requesterDisplayName}
                          size="24"
                        />
                        <div className={styles['v2-pending-rail__row-text']}>
                          <span className={styles['v2-pending-rail__row-name']}>
                            {req.requesterDisplayName}
                          </span>
                          <span className={styles['v2-pending-rail__row-handle']}>
                            @{req.requesterUsername}
                          </span>
                        </div>
                      </div>
                      <div className={styles['v2-pending-rail__row-actions']}>
                        <Button
                          emphasis="Tertiary"
                          size="Small"
                          onClick={() => handleOpenDeny(req.id)}
                          aria-label={`Open decline confirmation for @${req.requesterUsername}'s request to join #${focusChannel.displayName}`}
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
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles['v2-pending-rail__section']}>
            <h4 className={styles['v2-pending-rail__section-title']}>
              Channel Admins
            </h4>
            <ul className={styles['v2-pending-rail__list']}>
              {CHANNEL_ADMINS.filter(matchesQuery).map((m) => (
                <MemberRow key={m.id} row={m} />
              ))}
            </ul>
          </section>

          <section className={styles['v2-pending-rail__section']}>
            <h4 className={styles['v2-pending-rail__section-title']}>
              Members
            </h4>
            <ul className={styles['v2-pending-rail__list']}>
              {MEMBERS.filter(matchesQuery).map((m) => (
                <MemberRow key={m.id} row={m} />
              ))}
            </ul>
          </section>
        </Scrollbars>
      </div>
    </aside>
  );
}

function MemberRow({ row }: { row: MemberRowData }) {
  return (
    <li className={styles['v2-pending-rail__row']}>
      <div className={styles['v2-pending-rail__row-left']}>
        <UserAvatar
          src={row.avatarUrl}
          alt={row.displayName}
          name={row.displayName}
          size="24"
          status
        />
        <div className={styles['v2-pending-rail__row-text']}>
          <span className={styles['v2-pending-rail__row-name']}>
            {row.displayName}
          </span>
          <span className={styles['v2-pending-rail__row-handle']}>
            @{row.username}
          </span>
        </div>
      </div>
    </li>
  );
}
