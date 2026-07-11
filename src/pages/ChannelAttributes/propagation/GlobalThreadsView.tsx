import { useState } from 'react';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PlaylistCheckIcon from '@mattermost/compass-icons/components/playlist-check';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Tabs from '@/components/ui/Tabs/Tabs';
import UnreadBadge from '@/components/ui/UnreadBadge/UnreadBadge';
import UserAvatarGroup, {
  type UserAvatarGroupItem,
} from '@/components/ui/UserAvatarGroup/UserAvatarGroup';
import MessageInput from '@/components/ui/MessageInput';
import RightSidebar, {
  RightSidebarHeader,
  RightSidebarThread,
} from '@/components/ui/RightSidebar';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import ChannelRowPill from '../shared/ChannelRowPill';
import type { MarkingStyle } from '../shared/SceneHarness';
import { CHANNEL_LIST, type ChannelListItem } from '../shared/channelListData';
import styles from './threads.module.scss';

// ─────────────────────────────────────────────────────────────────────────────
// Surface #4 — Global Threads view.
//
// The global Threads list aggregates followed threads from EVERY channel into one
// pane, then lets you reply inline from the reading pane on the right. That reply
// path bypasses the in-channel classification banner entirely — a reviewer can
// answer a SECRET thread without ever seeing the SECRET channel header. The
// mitigation carried by this surface is the classification pill on each thread's
// channel/team label, right after the channel name.
//
// Masking: a thread whose SOURCE channel carries `classification: undefined`
// (masked or unmarked) shows NO pill on its label — no-trace, exactly as in the
// switcher/search. CHANNEL_LIST is the shared source-channel registry.
//
// The DS `ThreadListItem` types `channelLabel` as a plain string, so it cannot
// carry an inline pill after the channel name without editing the shared
// component. Per the brief we do a FAITHFUL LOCAL RECREATION of the row —
// reusing the same sub-components it uses (LabelTag, UserAvatarGroup, UnreadBadge,
// IconButton) — and leave the shared component untouched. The reading pane reuses
// RightSidebar + RightSidebarHeader + RightSidebarThread + MessageInput as-is.
// ─────────────────────────────────────────────────────────────────────────────

type ThreadsTab = 'all' | 'unreads';

function byId(id: string): ChannelListItem {
  const found = CHANNEL_LIST.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown channel id: ${id}`);
  return found;
}

interface ThreadRow {
  key: string;
  /** Source channel id in CHANNEL_LIST — drives the label pill (incl. masking). */
  sourceChannelId: string;
  badge: 'None' | 'Unread';
  authorName: string;
  previewText: string;
  timestamp: string;
  replyCount: number;
  participants: UserAvatarGroupItem[];
  /** Whether the thread appears only in the "All" tab (read thread). */
  allOnly?: boolean;
}

// Threads span UNCLASSIFIED → CONFIDENTIAL → SECRET → TOP SECRET, plus one masked
// source (Bugs → undefined → no pill) and one unmarked source (Quick Wins → no
// pill), so a single list mixes levels and proves the marking + no-trace masking.
const THREADS: ThreadRow[] = [
  {
    key: 'th1',
    sourceChannelId: 'town-square', // UNCLASSIFIED → "U"
    badge: 'None',
    authorName: 'Leonard Riley',
    previewText:
      'Posting the all-hands recap here so it is easy to find. Slides and the recording link are pinned in the channel header.',
    timestamp: '5 mins ago',
    replyCount: 3,
    participants: [
      { key: 'a', name: 'Leonard Riley', src: avatarLeonard },
      { key: 'b', name: 'Aiko Tan', src: avatarAikoTan },
      { key: 'c', name: 'Marco Rinaldi', src: avatarMarco },
    ],
  },
  {
    key: 'th2',
    sourceChannelId: 'ask-r-and-d', // CONFIDENTIAL → "C"
    badge: 'Unread',
    authorName: 'Aiko Tan',
    previewText:
      'Can someone confirm the assumptions in the ingest design before I circulate it? Want to make sure the boundary is drawn correctly.',
    timestamp: '18 mins ago',
    replyCount: 5,
    participants: [
      { key: 'a', name: 'Aiko Tan', src: avatarAikoTan },
      { key: 'b', name: 'Arjun Patel', src: avatarArjun },
    ],
  },
  {
    key: 'th3',
    sourceChannelId: 'operation-aurora', // SECRET → "S"
    badge: 'Unread',
    authorName: 'Sofia Bauer',
    previewText:
      'Reply here rather than in the channel — I need eyes on the relay path change before the window closes tonight.',
    timestamp: '42 mins ago',
    replyCount: 2,
    participants: [
      { key: 'a', name: 'Sofia Bauer', src: avatarSofia },
      { key: 'b', name: 'Danielle Okoro', src: avatarDanielle },
    ],
  },
  {
    key: 'th4',
    sourceChannelId: 'bugs', // MASKED (undefined) → NO pill (no-trace)
    badge: 'Unread',
    authorName: 'Marco Rinaldi',
    previewText:
      'Follow-up on the guardrail regression — added repro steps and a proposed fix in the thread above.',
    timestamp: '1 hour ago',
    replyCount: 4,
    participants: [{ key: 'a', name: 'Marco Rinaldi', src: avatarMarco }],
  },
  {
    key: 'th5',
    sourceChannelId: 'orion-launch-ops', // TOP SECRET → "TS" (black-on-orange)
    badge: 'None',
    authorName: 'Danielle Okoro',
    previewText:
      'Readiness checklist is blocked on the comms annex. I will ping here the moment it is signed so we can close out.',
    timestamp: 'Yesterday',
    replyCount: 1,
    participants: [{ key: 'a', name: 'Danielle Okoro', src: avatarDanielle }],
    allOnly: true,
  },
  {
    key: 'th6',
    sourceChannelId: 'quick-wins-design-sprint', // unmarked → NO pill
    badge: 'None',
    authorName: 'Arjun Patel',
    previewText:
      'Sprint retro notes are in the doc. No blockers carried over — nice work everyone.',
    timestamp: 'Mon',
    replyCount: 8,
    participants: [
      { key: 'a', name: 'Arjun Patel', src: avatarArjun },
      { key: 'b', name: 'Leonard Riley', src: avatarLeonard },
    ],
    allOnly: true,
  },
];

function ThreadRowItem({
  row,
  active,
  variant,
  onClick,
}: {
  row: ThreadRow;
  active: boolean;
  variant: MarkingStyle;
  onClick: () => void;
}) {
  const source = byId(row.sourceChannelId);
  const showGutterBadge = !active && row.badge === 'Unread';
  const replyLabel = row.replyCount === 1 ? '1 reply' : `${row.replyCount} replies`;

  return (
    <div
      className={[styles['thread-row'], active ? styles['thread-row--active'] : '']
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles['thread-row__gutter']}>
        {showGutterBadge && (
          <UnreadBadge className={styles['thread-row__unread-badge']} context="Icon Button" />
        )}
      </div>
      <div className={styles['thread-row__body']}>
        <div className={styles['thread-row__name-row']}>
          <div className={styles['thread-row__name-group']}>
            <span className={styles['thread-row__author']}>{row.authorName}</span>
            <LabelTag casing="All Caps" label={source.name} />
            {/* Classification pill: right after the channel/team label. Masked and
                unmarked sources render nothing (no-trace masking). */}
            <ChannelRowPill item={source} variant={variant} />
          </div>
          <span className={styles['thread-row__timestamp']}>{row.timestamp}</span>
        </div>
        <p className={styles['thread-row__preview']}>{row.previewText}</p>
        <div className={styles['thread-row__replies']}>
          {row.participants.length > 0 && (
            <UserAvatarGroup avatars={row.participants} max={3} size="20" />
          )}
          <span className={styles['thread-row__reply-count']}>{replyLabel}</span>
        </div>
      </div>
      <div className={styles['thread-row__actions']}>
        <IconButton
          aria-label="Thread actions"
          icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
          padding="Compact"
          size="Small"
          style="Default"
          type="button"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

/**
 * Surface #4 — Global Threads view. Left = the aggregated thread list (faithful
 * local recreation of the DS thread row so the classification pill can sit on the
 * channel label); right = the reading pane reusing the DS RightSidebar +
 * RightSidebarThread + reply composer. Honors the `?style=` marking-style toggle.
 */
export default function GlobalThreadsView({ variant = 'abbrev' }: { variant?: MarkingStyle }) {
  const [tab, setTab] = useState<ThreadsTab>('unreads');
  const [selected, setSelected] = useState(0);

  const visible = THREADS.filter((t) => (tab === 'all' ? true : !t.allOnly));
  const selectedRow = visible[selected] ?? visible[0];
  const selectedSource = selectedRow ? byId(selectedRow.sourceChannelId) : undefined;

  return (
    <div className={styles['threads__frame']}>
      <div className={styles['threads__inbox']}>
        <header className={styles['threads__tabs']}>
          <Tabs
            className={styles['threads__tabs-strip']}
            tabs={[
              { key: 'all', label: 'All your threads' },
              { key: 'unreads', label: 'Unreads' },
            ]}
            activeKey={tab}
            onChange={(key) => {
              if (key === 'all' || key === 'unreads') {
                setTab(key);
                setSelected(0);
              }
            }}
            controls={
              <IconButton
                aria-label="Mark all as read"
                size="Small"
                style="Default"
                padding="Compact"
                icon={<Icon size="16" glyph={<PlaylistCheckIcon />} />}
              />
            }
          />
        </header>
        <div className={styles['threads__list']}>
          {visible.map((row, i) => (
            <ThreadRowItem
              key={row.key}
              row={row}
              active={i === selected}
              variant={variant}
              onClick={() => setSelected(i)}
            />
          ))}
        </div>
      </div>

      <div className={styles['threads__reader']}>
        <RightSidebar
          fill
          alignBody="end"
          header={
            <RightSidebarHeader
              title="Thread"
              // The reading pane header carries the same parent channel + pill so
              // the marking is not lost when replying away from the channel banner.
              secondaryTitle={selectedSource?.name ?? 'Thread'}
              actionLabel="Following"
              actionActive
            />
          }
          footer={
            <div className={styles['threads__composer']}>
              <MessageInput placeholder="Reply to thread…" width="narrow" />
            </div>
          }
        >
          <RightSidebarThread />
        </RightSidebar>
      </div>
    </div>
  );
}
