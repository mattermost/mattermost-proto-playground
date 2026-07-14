/**
 * SIMPLIFIED GMP — "Test matching users" modal (Part B, single-mode).
 *
 * Attaches to the Simplified editor's "Test matching users" button. Unlike the
 * 4-concept Simulate/TestMatchingModal (separate, untouched), this modal is ONE
 * flow — "Against a channel" — with two views inside a single Modal:
 *
 *   View 1 (list)    — a search box that opens an AUTOCOMPLETE DROPDOWN of
 *                      matching channels (it does NOT filter the body list), plus
 *                      a rendered list of up to 10 affected channels the admin can
 *                      fully see (+X / −Y summaries). Selecting a channel — from
 *                      the autocomplete OR the list — opens View 2 for it.
 *
 *   View 2 (channel) — a per-channel drill-in matching the reference: back arrow,
 *                      "Channel members" title · channel name, X close; Allowed(N)
 *                      / Removed(N) tabs (Removed active by default per reference);
 *                      a "Search users" input that DOES filter the list shown here;
 *                      a paginated (10/page) member list of avatar + name + dim
 *                      @username (with "(you)" on the acting admin); footer with
 *                      "Showing 1–N of M" and Previous/Next.
 *
 * Over-clearance channels are kept out of View 1 (leakage guardrail); if one is
 * somehow reached in View 2, the modal refuses names and shows bands only.
 *
 * All fixtures/derivations come from gmpData.ts (imported read-only + the new
 * additive Simplified exports). Set-diff numbers stay consistent with the shared
 * SIM_MEMBERS pool and the Secret-cleared SIMULATE_ADMIN.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import PoundIcon from '@mattermost/compass-icons/components/pound';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';

import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Tabs from '@/components/ui/Tabs/Tabs';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import { useOutsideClose } from '@/hooks/useOutsideClose';

import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarDavid from '@/assets/avatars/David Liang.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarLeila from '@/assets/avatars/Leila Haddad.png';
import avatarLukas from '@/assets/avatars/Lukas Meyer.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';

import {
  SIMPLIFIED_ADMIN_ROW,
  SIMPLIFIED_MEMBERS_PER_PAGE,
  SIMPLIFIED_DEFAULT_CHANNEL_ID,
  simplifiedAffectedChannels,
  simplifiedAffectedSummary,
  simplifiedChannelSearch,
  simplifiedChannelById,
  simplifiedChannelOverClearance,
  SIM_OVER_CLEARANCE_NOTE,
  type SimplifiedTestChannel,
  type SimplifiedMemberRow,
} from '@/pages/GlobalMembershipPolicy/gmpData';

import styles from './SimplifiedTestMatchingModal.module.scss';

/** Photo avatars keyed by member stem; extra fill members fall back to initials. */
const AVATARS: Record<string, string> = {
  aiko: avatarAiko,
  marco: avatarMarco,
  emma: avatarEmma,
  david: avatarDavid,
  arjun: avatarArjun,
  danielle: avatarDanielle,
  darius: avatarDarius,
  isabella: avatarIsabella,
  leila: avatarLeila,
  lukas: avatarLukas,
  sofia: avatarSofia,
  ethan: avatarEthan,
  leonard: avatarLeonard,
};

export type SimplifiedTestView = 'list' | 'channel';
export type SimplifiedMemberTab = 'allowed' | 'removed';

export interface SimplifiedTestMatchingModalProps {
  policyName: string;
  /** Which view to open on. Default 'list'. */
  initialView?: SimplifiedTestView;
  /** Channel to drill into when opening on 'channel'. */
  initialChannelId?: string;
  onClose: () => void;
}

// ─── View 1 — channel search (header) + list (body) ───────────────────────────

function ChannelSearchField({
  onPick,
}: {
  onPick: (channel: SimplifiedTestChannel) => void;
}) {
  const [query, setQuery] = useState('');
  const [acOpen, setAcOpen] = useState(false);
  const acRef = useRef<HTMLDivElement>(null);
  useOutsideClose(acRef, acOpen, () => setAcOpen(false));

  const suggestions = useMemo(
    () => (acOpen ? simplifiedChannelSearch(query) : []),
    [acOpen, query],
  );

  return (
    <div className={styles['stm__search']} ref={acOpen ? acRef : undefined}>
      <SearchInput
        size="Medium"
        placeholder="Search a channel to test against…"
        value={query}
        onChange={(e) => {
          setQuery(e.currentTarget.value);
          setAcOpen(true);
        }}
        onFocus={() => setAcOpen(true)}
        onClear={() => {
          setQuery('');
          setAcOpen(false);
        }}
      />
      {acOpen && (
        <div className={styles['stm__ac']} role="listbox" aria-label="Channel suggestions">
          {suggestions.length === 0 ? (
            <div className={styles['stm__ac-empty']}>No channels match “{query}”.</div>
          ) : (
            suggestions.map((c) => (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={false}
                className={styles['stm__ac-item']}
                onClick={() => {
                  setAcOpen(false);
                  setQuery('');
                  onPick(c);
                }}
              >
                <span className={styles['stm__glyph']} aria-hidden>
                  <Icon size="16" glyph={c.private ? <LockOutlineIcon /> : <PoundIcon />} />
                </span>
                <span className={styles['stm__ac-main']}>
                  <span className={styles['stm__ac-name']}>{c.name}</span>
                  <span className={styles['stm__ac-team']}>{c.team}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ChannelListView({
  onPick,
}: {
  onPick: (channel: SimplifiedTestChannel) => void;
}) {
  const channels = useMemo(() => simplifiedAffectedChannels(), []);

  return (
    <div className={styles['stm__list-view']}>
      <div className={styles['stm__body']}>
        <Scrollbars>
          <div className={styles['stm__body-inner']}>
            {channels.map((c) => (
              <button
                key={c.id}
                type="button"
                className={styles['stm__channel-row']}
                onClick={() => onPick(c)}
              >
                <span className={styles['stm__glyph']} aria-hidden>
                  <Icon size="16" glyph={c.private ? <LockOutlineIcon /> : <PoundIcon />} />
                </span>
                <span className={styles['stm__channel-main']}>
                  <span className={styles['stm__channel-name']}>{c.name}</span>
                  <span className={styles['stm__channel-summary']}>
                    {simplifiedAffectedSummary(c)}
                  </span>
                </span>
                <span className={styles['stm__glyph']} aria-hidden>
                  <Icon size="16" glyph={<ChevronRightIcon />} />
                </span>
              </button>
            ))}
          </div>
        </Scrollbars>
      </div>
    </div>
  );
}

// ─── View 2 — per-channel members drill-in ─────────────────────────────────────

function MemberRow({ member }: { member: SimplifiedMemberRow }) {
  const isYou = member.key === SIMPLIFIED_ADMIN_ROW.key;
  return (
    <div className={styles['stm__member']}>
      <UserAvatar
        src={AVATARS[member.key]}
        alt={member.name}
        name={member.name}
        size="32"
      />
      <span className={styles['stm__member-name']}>
        {member.name}
        <span className={styles['stm__member-username']}>@{member.username}</span>
        {isYou && <span className={styles['stm__member-you']}>(you)</span>}
      </span>
    </div>
  );
}

function ChannelMembersView({
  channel,
  tab,
}: {
  channel: SimplifiedTestChannel;
  tab: SimplifiedMemberTab;
}) {
  const over = simplifiedChannelOverClearance(channel);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const source = tab === 'allowed' ? channel.allowed : channel.removed;

  // The "Search users" input DOES filter this sub-view's member list.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === '') return source;
    return source.filter(
      (m) => `${m.name} ${m.username}`.toLowerCase().includes(q),
    );
  }, [source, query]);

  const perPage = SIMPLIFIED_MEMBERS_PER_PAGE;
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const clampedPage = Math.min(page, pageCount - 1);
  const start = clampedPage * perPage;
  const pageRows = filtered.slice(start, start + perPage);
  const rangeStart = total === 0 ? 0 : start + 1;
  const rangeEnd = Math.min(start + perPage, total);

  useEffect(() => {
    setQuery('');
    setPage(0);
  }, [tab]);

  if (over) {
    return (
      <div className={styles['stm__over']}>
        <SectionNotice
          type="Warning"
          icon={<Icon size="20" glyph={<ShieldOutlineIcon />} />}
          title="Members hidden — channel above your clearance"
          description={SIM_OVER_CLEARANCE_NOTE}
        />
        <div className={styles['stm__bands']}>
          <div className={styles['stm__band']}>
            <span className={styles['stm__band-label']}>Allowed</span>
            <span className={styles['stm__band-value']}>6–20</span>
          </div>
          <div className={styles['stm__band']}>
            <span className={styles['stm__band-label']}>Removed</span>
            <span className={styles['stm__band-value']}>1–5</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['stm__channel-view']}>
      <div className={styles['stm__user-search']}>
        <SearchInput
          size="Medium"
          placeholder="Search users"
          value={query}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            setPage(0);
          }}
          onClear={() => {
            setQuery('');
            setPage(0);
          }}
        />
      </div>

      <div className={styles['stm__body']}>
        <Scrollbars>
          <div className={styles['stm__body-inner']}>
            {pageRows.length === 0 ? (
              <div className={styles['stm__no-match']}>
                {source.length === 0
                  ? `No members in the ${tab === 'allowed' ? 'Allowed' : 'Removed'} set.`
                  : `No members match “${query}”.`}
              </div>
            ) : (
              pageRows.map((m) => <MemberRow key={`${m.key}-${m.username}`} member={m} />)
            )}
          </div>
        </Scrollbars>
      </div>

      <div className={styles['stm__pager']}>
        <span className={styles['stm__pager-count']}>
          Showing {rangeStart}–{rangeEnd} of {total}
        </span>
        <div className={styles['stm__pager-controls']}>
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<ChevronLeftIcon />} />}
            disabled={clampedPage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <Button
            emphasis="Tertiary"
            size="Small"
            disabled={clampedPage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal shell ────────────────────────────────────────────────────────────────

export default function SimplifiedTestMatchingModal({
  policyName,
  initialView = 'list',
  initialChannelId,
  onClose,
}: SimplifiedTestMatchingModalProps) {
  const startChannel =
    initialView === 'channel'
      ? simplifiedChannelById(initialChannelId ?? SIMPLIFIED_DEFAULT_CHANNEL_ID)
      : null;

  const [view, setView] = useState<SimplifiedTestView>(
    startChannel ? 'channel' : 'list',
  );
  const [channel, setChannel] = useState<SimplifiedTestChannel | null>(
    startChannel,
  );
  const [memberTab, setMemberTab] = useState<SimplifiedMemberTab>('removed');

  const openChannel = (c: SimplifiedTestChannel) => {
    setChannel(c);
    setView('channel');
    setMemberTab('removed');
  };
  const backToList = () => {
    setView('list');
  };

  const isChannel = view === 'channel' && channel != null;
  const channelOverClearance =
    isChannel && simplifiedChannelOverClearance(channel!);

  const headerAccessory = (() => {
    if (!isChannel) {
      return <ChannelSearchField onPick={openChannel} />;
    }
    if (channelOverClearance) {
      return undefined;
    }
    return (
      <Tabs
        className={styles['stm__header-tabs']}
        tabs={[
          { key: 'allowed', label: 'Allowed', countBadge: channel!.allowed.length },
          { key: 'removed', label: 'Removed', countBadge: channel!.removed.length },
        ]}
        activeKey={memberTab}
        onChange={(k) => setMemberTab(k as SimplifiedMemberTab)}
      />
    );
  })();

  return (
    <div className={styles['stm__scrim']} role="presentation">
      <div className={styles['stm']}>
        <Modal
          size="Medium"
          title={isChannel ? 'Channel members' : 'Test matching users'}
          subtitle={isChannel ? channel!.name : policyName}
          showBackButton={isChannel}
          onBack={backToList}
          onClose={onClose}
          noBodyPadding
          headerClassName={styles['stm__modal-header']}
          headerAccessory={headerAccessory}
        >
          {isChannel ? (
            <ChannelMembersView channel={channel!} tab={memberTab} />
          ) : (
            <ChannelListView onPick={openChannel} />
          )}
        </Modal>
      </div>
    </div>
  );
}
