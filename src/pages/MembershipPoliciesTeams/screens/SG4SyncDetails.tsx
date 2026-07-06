// SG4 — Membership sync jobs + Sync Job Details modal.
//
// History view (System Console section, no Figma ref): sync history table
// with Run sync job button. Renamed from "Channel access control sync jobs"
// to "Membership sync jobs" per spec §3.5.
//
// Details view: Sync Job Details modal — matches Figma node 5850:424531
// (ABAC file). Compact list pattern with both Channels and Teams tabs.
// User chose "Both tabs — Channels as faithful stub, Teams as the focus."
//
// Interactive:
//   1. History view -> click "View details" -> opens Details modal
//   2. Details modal: toggle Channels / Teams tabs
//   3. Click a Teams row -> drill into per-team detail (SG5 reference)
import { useState } from 'react';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal/Modal';
import Tabs from '@/components/ui/Tabs/Tabs';
import TextInput from '@/components/ui/TextInput/TextInput';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import styles from '../MembershipPoliciesTeams.module.scss';

interface SyncJob {
  id: string;
  status: 'Pending' | 'Success' | 'Failure';
  finished: string;
  runtime: string;
}

const SYNC_HISTORY: SyncJob[] = [
  { id: 'j-pending', status: 'Pending', finished: '—', runtime: '—' },
  { id: 'j-1', status: 'Success', finished: '09:14 May 21, 2026', runtime: '34 seconds' },
  { id: 'j-2', status: 'Success', finished: '06:00 May 21, 2026', runtime: '28 seconds' },
  { id: 'j-3', status: 'Failure', finished: '22:14 May 20, 2026', runtime: '6 seconds' },
  { id: 'j-4', status: 'Success', finished: '12:00 May 20, 2026', runtime: '31 seconds' },
];

interface TeamSyncRow {
  team: string;
  handle: string;
  added: number;
  removed: number;
}

interface ChannelSyncRow {
  channel: string;
  handle: string;
  added: number;
  removed: number;
}

// Mirror Figma row count for credibility — Channels (16), Teams (3)
const TEAM_ROWS: TeamSyncRow[] = [
  { team: 'Program ALPHA', handle: 'program-alpha', added: 2, removed: 3 },
  { team: 'Engineering Leadership', handle: 'engineering-leadership', added: 0, removed: 1 },
  { team: 'Field Operations', handle: 'field-operations', added: 4, removed: 0 },
];

interface SyncUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isMe?: boolean;
}

const TEAM_DRILL_ADDED: Record<string, SyncUser[]> = {
  'Program ALPHA': [
    { id: 'u1', name: 'Aiko Tan', handle: 'aiko.tan', avatar: avatarAiko },
    { id: 'u2', name: 'Arjun Patel', handle: 'arjun.patel', avatar: avatarArjun },
  ],
  'Engineering Leadership': [],
  'Field Operations': [
    { id: 'u3', name: 'Sofia Bauer', handle: 'sofia.bauer', avatar: avatarSofia },
    { id: 'u4', name: 'Darius Cole', handle: 'darius.cole', avatar: avatarDarius },
    { id: 'u5', name: 'Ethan Brooks', handle: 'ethan.brooks', avatar: avatarEthan },
    { id: 'u6', name: 'Emma Novak', handle: 'emma.novak', avatar: avatarEmma },
  ],
};

const TEAM_DRILL_REMOVED: Record<string, SyncUser[]> = {
  'Program ALPHA': [
    { id: 'r1', name: 'Danielle Okoro', handle: 'danielle.okoro', avatar: avatarDanielle },
    { id: 'r2', name: 'Emma Novak', handle: 'emma.novak', avatar: avatarEmma },
    { id: 'r3', name: 'Ethan Brooks', handle: 'ethan.brooks', avatar: avatarEthan },
  ],
  'Engineering Leadership': [
    { id: 'r4', name: 'Darius Cole', handle: 'darius.cole', avatar: avatarDarius, isMe: true },
  ],
  'Field Operations': [],
};

const CHANNEL_ROWS: ChannelSyncRow[] = [
  { channel: 'Product Development Team', handle: 'product-development-team', added: 35, removed: 10 },
  { channel: 'Feedback Loop Team', handle: 'feedback-loop-team', added: 34, removed: 14 },
  { channel: 'Innovation Initiatives', handle: 'innovation-initiatives', added: 16, removed: 30 },
  { channel: 'User Experience Squad', handle: 'user-experience-squad', added: 28, removed: 50 },
  { channel: 'Tech Advancement Group', handle: 'tech-advancement-group', added: 52, removed: 25 },
  { channel: 'Creative Solutions Team', handle: 'creative-solutions-team', added: 14, removed: 18 },
  { channel: 'Strategic Planning Crew', handle: 'strategic-planning-crew', added: 30, removed: 32 },
  { channel: 'Data Insights Collective', handle: 'data-insights-collective', added: 41, removed: 26 },
  { channel: 'Marketing Innovations Team', handle: 'marketing-innovations-team', added: 22, removed: 36 },
  { channel: 'Collaboration Hub', handle: 'collaboration-hub', added: 19, removed: 20 },
];

export default function SG4SyncDetails() {
  const [view, setView] = useState<'history' | 'details'>('history');
  const [activeTab, setActiveTab] = useState<'channels' | 'teams'>('channels');
  const [search, setSearch] = useState('');
  const [drilledTeam, setDrilledTeam] = useState<string | null>(null);
  const [drillTab, setDrillTab] = useState<'added' | 'removed'>('removed');
  const [drillSearch, setDrillSearch] = useState('');

  return (
    <div>
      <div className={styles['mpt__step-nav']}>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${view === 'history' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setView('history')}
        >
          1. Sync history (System Console section)
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${view === 'details' && activeTab === 'channels' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => {
            setView('details');
            setActiveTab('channels');
          }}
        >
          2. Details modal — Channels (existing)
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${view === 'details' && activeTab === 'teams' && !drilledTeam ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => {
            setView('details');
            setActiveTab('teams');
            setDrilledTeam(null);
          }}
        >
          3. Details modal — Teams (new)
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${drilledTeam ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => {
            setView('details');
            setActiveTab('teams');
            setDrilledTeam('Program ALPHA');
            setDrillTab('removed');
          }}
        >
          4. Per-team drill-down (Removed users)
        </button>
      </div>

      {view === 'history' && (
        <div className={styles['mpt__surface']}>
          <div className={styles['mpt__surface-header']}>
            <div>
              <div className={styles['mpt__surface-title']}>
                Membership sync jobs
              </div>
              <div className={styles['mpt__surface-subtitle']}>
                Synchronize membership policies to apply them to system
                resources and permissions. Runs both team and channel
                membership in a single batch.
              </div>
            </div>
            <Button
              emphasis="Primary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<SyncIcon />} />}
            >
              Run sync job
            </Button>
          </div>
          <div className={styles['mpt__surface-body']}>
            <div className={styles['mpt__member-table']}>
              <div className={styles['mpt__member-table-header']}>
                <div
                  className={styles['mpt__member-table-header-cell']}
                  style={{ flex: 1 }}
                >
                  Status
                </div>
                <div
                  className={styles['mpt__member-table-header-cell']}
                  style={{ flex: 1.5 }}
                >
                  Finished at
                </div>
                <div
                  className={styles['mpt__member-table-header-cell']}
                  style={{ flex: 1 }}
                >
                  Run time
                </div>
                <div
                  className={styles['mpt__member-table-header-cell']}
                  style={{ flex: 1 }}
                >
                  Actions
                </div>
              </div>
              {SYNC_HISTORY.map((j) => (
                <div key={j.id} className={styles['mpt__member-table-row']}>
                  <div
                    className={styles['mpt__member-table-cell']}
                    style={{ flex: 1 }}
                  >
                    <span
                      className={`${styles['mpt__sync-status']} ${
                        j.status === 'Success'
                          ? styles['mpt__sync-status--success']
                          : j.status === 'Pending'
                            ? styles['mpt__sync-status--pending']
                            : styles['mpt__sync-status--failure']
                      }`}
                    >
                      {j.status}
                    </span>
                  </div>
                  <div
                    className={styles['mpt__member-table-cell']}
                    style={{ flex: 1.5 }}
                  >
                    {j.finished}
                  </div>
                  <div
                    className={styles['mpt__member-table-cell']}
                    style={{ flex: 1 }}
                  >
                    {j.runtime}
                  </div>
                  <div
                    className={styles['mpt__member-table-cell']}
                    style={{ flex: 1 }}
                  >
                    {j.status === 'Pending' ? (
                      <span
                        className={`${styles['mpt__action-link']} ${styles['mpt__action-link--danger']}`}
                      >
                        Cancel
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={styles['mpt__action-link']}
                        onClick={() => setView('details')}
                      >
                        View details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'details' && !drilledTeam && (
        <div className={`${styles['mpt__modal-frame']}`}>
          <Modal
            size="Medium"
            onClose={() => setView('history')}
            noBodyPadding
            title="Sync job details"
            subtitle="Finished at 5/22/2026, 3:56:46 AM"
            headerAction={
              <div className={styles['mpt__sjd-search']}>
                <TextInput
                  size="Small"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
                />
              </div>
            }
          >
            <div className={styles['mpt__sjd-tabs']}>
              <Tabs
                tabs={[
                  {
                    key: 'channels',
                    label: 'Channels',
                    countBadge: CHANNEL_ROWS.length,
                  },
                  {
                    key: 'teams',
                    label: 'Teams',
                    countBadge: TEAM_ROWS.length,
                  },
                ]}
                activeKey={activeTab}
                onChange={(k) => setActiveTab(k as 'channels' | 'teams')}
              />
            </div>

            <div className={styles['mpt__sjd-listhead']}>
              <span className={styles['mpt__sjd-listhead-label']}>
                {activeTab === 'channels' ? 'CHANNELS' : 'TEAMS'}
              </span>
              <span className={styles['mpt__sjd-listhead-label']}>
                CHANGES
              </span>
            </div>

            <div className={styles['mpt__sjd-list']} role="list">
              {(activeTab === 'channels' ? CHANNEL_ROWS : TEAM_ROWS)
                .filter((r) => {
                  if (!search) return true;
                  const q = search.toLowerCase();
                  const name =
                    'channel' in r
                      ? (r as ChannelSyncRow).channel
                      : (r as TeamSyncRow).team;
                  return (
                    name.toLowerCase().includes(q) ||
                    r.handle.toLowerCase().includes(q)
                  );
                })
                .map((r) => {
                  const isChannel = 'channel' in r;
                  const name = isChannel
                    ? (r as ChannelSyncRow).channel
                    : (r as TeamSyncRow).team;
                  const initials = name
                    .split(' ')
                    .slice(0, 2)
                    .map((w) => w.charAt(0))
                    .join('');
                  return (
                    <button
                      key={r.handle}
                      type="button"
                      className={styles['mpt__sjd-row']}
                      role="listitem"
                      onClick={() => {
                        if (!isChannel) {
                          setDrilledTeam((r as TeamSyncRow).team);
                          setDrillTab('removed');
                          setDrillSearch('');
                        }
                      }}
                    >
                      <span className={styles['mpt__sjd-row-icon']}>
                        {isChannel ? (
                          <Icon size="16" glyph={<LockOutlineIcon />} />
                        ) : (
                          <span className={styles['mpt__sjd-team-icon']}>
                            {initials}
                          </span>
                        )}
                      </span>
                      <span className={styles['mpt__sjd-row-name']}>
                        <strong>{name}</strong>
                        <span className={styles['mpt__sjd-row-handle']}>
                          {' '}
                          ~{r.handle}
                        </span>
                      </span>
                      <span className={styles['mpt__sjd-row-changes']}>
                        <span className={styles['mpt__sjd-row-add']}>
                          +{r.added}
                        </span>
                        <span className={styles['mpt__sjd-row-sep']}>/</span>
                        <span className={styles['mpt__sjd-row-rem']}>
                          -{r.removed}
                        </span>
                        <Icon size="16" glyph={<ChevronRightIcon />} />
                      </span>
                    </button>
                  );
                })}
            </div>

            <div className={styles['mpt__sjd-footer']}>
              <span className={styles['mpt__sjd-page-text']}>
                Showing 1-
                {(activeTab === 'channels' ? CHANNEL_ROWS : TEAM_ROWS).length}{' '}
                of {activeTab === 'channels' ? 14 : TEAM_ROWS.length}
              </span>
              <div className={styles['mpt__sjd-page-actions']}>
                <Button
                  emphasis="Tertiary"
                  size="Small"
                  leadingIcon={
                    <Icon size="12" glyph={<ChevronLeftIcon />} />
                  }
                  disabled
                >
                  Previous
                </Button>
                <Button
                  emphasis="Secondary"
                  size="Small"
                  trailingIcon={
                    <Icon size="12" glyph={<ChevronRightIcon />} />
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {view === 'details' && drilledTeam && (() => {
        const added = TEAM_DRILL_ADDED[drilledTeam] ?? [];
        const removed = TEAM_DRILL_REMOVED[drilledTeam] ?? [];
        const list = drillTab === 'added' ? added : removed;
        const filtered = list.filter((u) => {
          if (!drillSearch) return true;
          const q = drillSearch.toLowerCase();
          return (
            u.name.toLowerCase().includes(q) ||
            u.handle.toLowerCase().includes(q)
          );
        });
        return (
          <div className={`${styles['mpt__modal-frame']}`}>
            <Modal
              size="Medium"
              showBackButton
              onBack={() => setDrilledTeam(null)}
              onClose={() => {
                setDrilledTeam(null);
                setView('history');
              }}
              noBodyPadding
              title={
                <span className={styles['mpt__sjd-drill-title']}>
                  Team members
                  <span className={styles['mpt__sjd-drill-divider']} />
                  <span className={styles['mpt__sjd-drill-name']}>
                    {drilledTeam}
                  </span>
                </span>
              }
            >
              <div className={styles['mpt__sjd-tabs']}>
                <Tabs
                  tabs={[
                    {
                      key: 'added',
                      label: 'Added',
                      countBadge: added.length,
                    },
                    {
                      key: 'removed',
                      label: 'Removed',
                      countBadge: removed.length,
                    },
                  ]}
                  activeKey={drillTab}
                  onChange={(k) => setDrillTab(k as 'added' | 'removed')}
                />
              </div>

              <div className={styles['mpt__sjd-drill-search']}>
                <TextInput
                  size="Medium"
                  placeholder="Search users"
                  value={drillSearch}
                  onChange={(e) => setDrillSearch(e.target.value)}
                  leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
                />
              </div>

              <div className={styles['mpt__sjd-list']} role="list">
                {filtered.length === 0 ? (
                  <div className={styles['mpt__diag-empty']}>
                    {drillTab === 'added'
                      ? 'No users were added to this team in this sync.'
                      : 'No users were removed from this team in this sync.'}
                  </div>
                ) : (
                  filtered.map((u) => (
                    <div
                      key={u.id}
                      className={styles['mpt__sjd-drill-row']}
                      role="listitem"
                    >
                      <UserAvatar src={u.avatar} alt={u.name} size="24" />
                      <span className={styles['mpt__sjd-drill-name-text']}>
                        {u.name}
                      </span>
                      <span className={styles['mpt__sjd-drill-handle']}>
                        @{u.handle}
                        {u.isMe ? ' (you)' : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className={styles['mpt__sjd-footer']}>
                <span className={styles['mpt__sjd-page-text']}>
                  Showing 1-{filtered.length} of {list.length}
                </span>
                <div className={styles['mpt__sjd-page-actions']}>
                  <Button
                    emphasis="Tertiary"
                    size="Small"
                    leadingIcon={
                      <Icon size="12" glyph={<ChevronLeftIcon />} />
                    }
                    disabled
                  >
                    Previous
                  </Button>
                  <Button
                    emphasis="Secondary"
                    size="Small"
                    trailingIcon={
                      <Icon size="12" glyph={<ChevronRightIcon />} />
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        );
      })()}

      <div className={styles['mpt__anno']} style={{ marginTop: 24 }}>
        <span className={styles['mpt__anno-icon']}>
          <Icon size="16" glyph={<InformationOutlineIcon />} />
        </span>
        <span>
          <strong>Pattern:</strong> Sync Job Details modal matches Figma{' '}
          <LabelTag label="ABAC" type="Info Dim" size="X-Small" /> node
          5850:424531. The <strong>Channels</strong> tab is a faithful stub of
          the existing product; the <strong>Teams</strong> tab is the new MVF
          surface.
          <br />
          <strong>Per-team drill-down</strong> (step 4) matches Figma node
          5850:425244 — click any Teams row to drill in. Header shows{' '}
          <em>Team members</em> + the team name; Added / Removed tabs; user
          list with avatar + name + @handle.
        </span>
      </div>
    </div>
  );
}
