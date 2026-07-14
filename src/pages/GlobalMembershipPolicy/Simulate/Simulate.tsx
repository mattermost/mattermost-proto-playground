/**
 * GMP Simulate — the "Test / Simulate" experience for Global Membership Policies
 * (WORKSTREAM 3). Membership add/remove is the primitive; this is NOT
 * access-simulation, so there is no verdict chip.
 *
 * Route A — Simulate against a channel (Ideation Option 3 + 6):
 *   channel picker (filtered to channels the admin can fully see) → results as
 *   Added / Kept / Removed columns with destructive-removal danger emphasis and
 *   a per-channel summary line. Over-clearance channels render aggregate BANDS
 *   only — no names, no failing condition (Option 6 / security guard 2).
 *
 * Route B — Simulate policy impact (Ideation Option 5):
 *   no picker; an aggregate impact across the policy's whole scope with total
 *   added/removed and a ranked most-affected list with drill-in. Over-clearance
 *   channels contribute to a bucketed removal band only, never precise totals.
 *
 * Both routes read `?mode=channel|batch` and `?state=default|computing|
 * populated|over-clearance|empty|error` deep-links.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PoundIcon from '@mattermost/compass-icons/components/pound';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import AccountMinusOutlineIcon from '@mattermost/compass-icons/components/account-minus-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';

import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Tabs from '@/components/ui/Tabs/Tabs';
import Tags from '@/components/ui/Tags/Tags';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Spinner from '@/components/ui/Spinner/Spinner';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';

import LockedIllustration from '@/assets/illustrations/locked-messages.svg?react';

import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
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

import {
  SIMULATE_ADMIN,
  visibleSimChannels,
  isOverClearance,
  channelDiff,
  failingConditionFor,
  toBand,
  SIM_BATCH_IMPACT,
  SIM_HIDDEN_CHANNEL_COUNT,
  SIM_PICKER_FILTER_NOTE,
  SIM_OVER_CLEARANCE_NOTE,
  SIM_BATCH_OVER_CLEARANCE_TITLE,
  SIM_BATCH_OVER_CLEARANCE_DESCRIPTION,
  policyById,
  type SimChannel,
  type SimMember,
} from '@/pages/GlobalMembershipPolicy/gmpData';
import { GMP_ROUTES, GMP_SIDEBAR_CATEGORIES } from '@/pages/GlobalMembershipPolicy/gmpConsole';

import styles from './Simulate.module.scss';

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
};

type SimMode = 'channel' | 'batch';
type ScreenState =
  | 'default'
  | 'computing'
  | 'populated'
  | 'over-clearance'
  | 'empty'
  | 'error';

const VALID_STATES: ScreenState[] = [
  'default',
  'computing',
  'populated',
  'over-clearance',
  'empty',
  'error',
];

function readParams() {
  return typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
}

function classificationTag(channel: SimChannel) {
  const over = isOverClearance(channel);
  return (
    <Tags size="X-Small" type={over ? 'Danger' : 'General'}>
      {channel.classification}
    </Tags>
  );
}

/** One member row (named). Only rendered for channels the admin can fully see. */
function MemberRow({ member }: { member: SimMember }) {
  return (
    <div className={styles['simulate__member']}>
      <UserAvatar src={AVATARS[member.key]} alt={member.name} name={member.name} size="24" />
      <div className={styles['simulate__member-main']}>
        <span className={styles['simulate__member-name']}>{member.name}</span>
        <span className={styles['simulate__member-role']}>{member.role}</span>
      </div>
    </div>
  );
}

function SetColumn({
  label,
  glyph,
  members,
  removed,
  destructive,
  publicChannel,
}: {
  label: string;
  glyph: React.ReactNode;
  members: SimMember[];
  removed?: boolean;
  destructive?: boolean;
  publicChannel?: boolean;
}) {
  const colClass = [
    styles['simulate__column'],
    removed ? styles['simulate__column--removed'] : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={colClass}>
      <div className={styles['simulate__column-head']}>
        <span className={styles['simulate__channel-glyph']}>{glyph}</span>
        <span className={styles['simulate__column-label']}>{label}</span>
        <span className={styles['simulate__column-count']}>{members.length}</span>
      </div>
      {removed && destructive && (
        <div className={styles['simulate__column-note']}>
          Removed from a private channel. Not reversible without re-adding.
        </div>
      )}
      {removed && !destructive && publicChannel && members.length > 0 && (
        <div className={styles['simulate__column-note']}>
          Dropped from recommendations only. Members keep their access.
        </div>
      )}
      {members.length === 0 ? (
        <div className={styles['simulate__column-empty']}>No members in this set.</div>
      ) : (
        members.map((m) => <MemberRow key={m.key} member={m} />)
      )}
    </div>
  );
}

/** Aggregate-bands result for an over-clearance channel — no names, no rule. */
function BandsResult({ channel }: { channel: SimChannel }) {
  const diff = channelDiff(channel);
  return (
    <div className={styles['simulate__result']}>
      <SectionNotice
        type="Warning"
        icon={<Icon size="20" glyph={<ShieldOutlineIcon />} />}
        title="Results shown as ranges — above your clearance"
        description={SIM_OVER_CLEARANCE_NOTE}
      />
      <div className={styles['simulate__bands']}>
        <div className={styles['simulate__band']}>
          <span className={styles['simulate__band-label']}>Would be added</span>
          <span className={styles['simulate__band-value']}>{toBand(diff.added)}</span>
        </div>
        <div className={styles['simulate__band']}>
          <span className={styles['simulate__band-label']}>Would be kept</span>
          <span className={styles['simulate__band-value']}>{toBand(diff.kept)}</span>
        </div>
        <div
          className={[styles['simulate__band'], styles['simulate__band--removed']]
            .filter(Boolean)
            .join(' ')}
        >
          <span className={styles['simulate__band-label']}>Would be removed</span>
          <span className={styles['simulate__band-value']}>{toBand(diff.removed)}</span>
        </div>
      </div>
      <div className={styles['simulate__audit']}>
        <Icon size="12" glyph={<InformationOutlineIcon />} />
        <span>This simulation was recorded as a range-only result. View audit log.</span>
      </div>
    </div>
  );
}

/** Full named set-diff result for a channel the admin can fully see. */
function NamedResult({ channel }: { channel: SimChannel }) {
  const diff = channelDiff(channel);
  return (
    <div className={styles['simulate__result']}>
      <div className={styles['simulate__result-head']}>
        <div>
          <h2 className={styles['simulate__result-title']}>{channel.name}</h2>
          <p className={styles['simulate__result-summary']}>
            <strong>{diff.added}</strong> added · <strong>{diff.kept}</strong> kept ·{' '}
            {diff.removed > 0 ? (
              <span className={styles['simulate__summary-removed']}>
                {diff.removed} removed
              </span>
            ) : (
              <span>0 removed</span>
            )}
          </p>
        </div>
        {classificationTag(channel)}
      </div>

      {diff.destructive && (
        <SectionNotice
          type="Danger"
          icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
          title={`${diff.removed} members would be removed from this private channel`}
          description="Private-channel removals take effect on save and are not reversible without re-adding each member. Review the removed set before applying."
        />
      )}

      <div className={styles['simulate__columns']}>
        <SetColumn
          label="Would be added"
          glyph={<Icon size="16" glyph={<AccountPlusOutlineIcon />} />}
          members={channel.members.added}
        />
        <SetColumn
          label="Would be kept"
          glyph={<Icon size="16" glyph={<CheckCircleOutlineIcon />} />}
          members={channel.members.kept}
        />
        <SetColumn
          label="Would be removed"
          glyph={<Icon size="16" glyph={<AccountMinusOutlineIcon />} />}
          members={channel.members.removed}
          removed
          destructive={diff.destructive}
          publicChannel={!channel.private}
        />
      </div>

      <div className={styles['simulate__audit']}>
        <Icon size="12" glyph={<InformationOutlineIcon />} />
        <span>
          Matched on {failingConditionFor(channel)}. This simulation was recorded. View audit
          log.
        </span>
      </div>
    </div>
  );
}

export default function Simulate() {
  const navigate = useNavigate();
  const params = readParams();

  const modeParam = params.get('mode');
  const initialMode: SimMode = modeParam === 'batch' ? 'batch' : 'channel';

  const stateParam = params.get('state') as ScreenState | null;
  const initialState: ScreenState =
    stateParam && VALID_STATES.includes(stateParam) ? stateParam : 'default';

  const policyParam = params.get('policy');
  const policyName = policyById(policyParam ?? '')?.name ?? 'DS Program';

  const channels = visibleSimChannels();

  // For deep-linked populated/over-clearance states, pick a representative channel
  // (Q3=B auto-suggest — highest-blast-radius fully-visible one, or the TS enclave
  // for the over-clearance state).
  const overClearanceSeed = channels.find((c) => isOverClearance(c)) ?? null;
  const fullySeeSeed =
    channels
      .filter((c) => !isOverClearance(c))
      .sort((a, b) => channelDiff(b).removed - channelDiff(a).removed)[0] ?? null;

  // A drill-in from the batch summary deep-links a specific channel to open.
  const channelParam = params.get('channel');
  const deepLinkedChannel =
    channelParam != null ? (channels.find((c) => c.id === channelParam) ?? null) : null;

  const [mode, setMode] = useState<SimMode>(initialMode);
  const [screen, setScreen] = useState<ScreenState>(initialState);
  const [selected, setSelected] = useState<SimChannel | null>(
    deepLinkedChannel ??
      (initialState === 'over-clearance'
        ? overClearanceSeed
        : initialState === 'populated'
          ? fullySeeSeed
          : null),
  );

  const [active, setActive] = useState('membership-policies');
  const handleSidebarClick = (itemId: string) => {
    setActive(itemId);
    if (itemId === 'membership-policies') navigate(GMP_ROUTES.list);
  };

  const runSimulation = (channel: SimChannel) => {
    setSelected(channel);
    setScreen('computing');
    window.setTimeout(() => {
      setScreen(isOverClearance(channel) ? 'over-clearance' : 'populated');
    }, 900);
  };

  const resetPicker = () => {
    setSelected(null);
    setScreen('default');
  };

  const isError = screen === 'error';
  const isEmpty = screen === 'empty';

  const tabs = [
    { key: 'channel', label: 'Against a channel' },
    { key: 'batch', label: 'Policy impact' },
  ];

  return (
    <div className={styles['simulate']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt={SIMULATE_ADMIN.name}
        username={SIMULATE_ADMIN.username}
        categories={GMP_SIDEBAR_CATEGORIES}
        activeItemId={active}
        onItemClick={handleSidebarClick}
      />

      <div className={styles['simulate__center']}>
        <ConsolePageHeader
          title={`Simulate — ${policyName}`}
          subtitle="Preview who would be added, kept, or removed before you save"
          backButton
          onBack={() => navigate(GMP_ROUTES.editor)}
        />

        <div className={styles['simulate__scroll']}>
          <div className={styles['simulate__page']}>
            <Tabs
              className={styles['simulate__tabs']}
              tabs={tabs}
              activeKey={mode}
              onChange={(key) => {
                setMode(key as SimMode);
                if (key === 'channel') {
                  setScreen(isError ? 'error' : 'default');
                }
              }}
            />

            {mode === 'channel' ? (
              <ChannelMode
                channels={channels}
                selected={selected}
                screen={screen}
                isError={isError}
                isEmpty={isEmpty}
                onPick={runSimulation}
                onReset={resetPicker}
                onRetry={() => selected && runSimulation(selected)}
              />
            ) : (
              <BatchMode isError={isError} navigate={navigate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Route A — Against a channel ──────────────────────────────────────────────

function ChannelMode({
  channels,
  selected,
  screen,
  isError,
  isEmpty,
  onPick,
  onReset,
  onRetry,
}: {
  channels: SimChannel[];
  selected: SimChannel | null;
  screen: ScreenState;
  isError: boolean;
  isEmpty: boolean;
  onPick: (c: SimChannel) => void;
  onReset: () => void;
  onRetry: () => void;
}) {
  if (isError) {
    return (
      <SectionNotice
        type="Danger"
        icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
        title="Simulation couldn’t be computed"
        description="The membership engine didn’t return a result for this channel. No changes were made. Try again."
        primaryButtonLabel="Retry"
        onPrimaryAction={onRetry}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        illustration={{ children: <LockedIllustration /> }}
        title="No channels available to simulate"
        description="You don’t have visibility into any channels in this policy’s scope. Ask an administrator with the right clearance to run this simulation."
      />
    );
  }

  // Result surface
  if (selected != null && (screen === 'populated' || screen === 'over-clearance' || screen === 'computing')) {
    return (
      <div className={styles['simulate__result']}>
        <div>
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
            onClick={onReset}
          >
            Pick a different channel
          </Button>
        </div>
        {screen === 'computing' ? (
          <div className={styles['simulate__computing']}>
            <Spinner size={20} />
            <span>Computing membership changes for {selected.name}…</span>
          </div>
        ) : screen === 'over-clearance' ? (
          <BandsResult channel={selected} />
        ) : (
          <NamedResult channel={selected} />
        )}
      </div>
    );
  }

  // Picker (default)
  return (
    <div className={styles['simulate__picker']}>
      <span className={styles['simulate__picker-label']}>Choose a channel to simulate against</span>
      <div className={styles['simulate__picker-note']}>
        <Icon size="16" glyph={<InformationOutlineIcon />} />
        <span>
          {SIM_PICKER_FILTER_NOTE} {SIM_HIDDEN_CHANNEL_COUNT} in-scope channels are hidden.
        </span>
      </div>
      <div className={styles['simulate__channel-list']}>
        <Scrollbars style={{ maxHeight: 420 }}>
          {channels.map((channel) => {
            const isSel = selected?.id === channel.id;
            const rowClass = [
              styles['simulate__channel-row'],
              isSel ? styles['simulate__channel-row--selected'] : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button
                key={channel.id}
                type="button"
                className={rowClass}
                onClick={() => onPick(channel)}
              >
                <span className={styles['simulate__channel-glyph']}>
                  <Icon
                    size="16"
                    glyph={channel.private ? <LockOutlineIcon /> : <PoundIcon />}
                  />
                </span>
                <span className={styles['simulate__channel-main']}>
                  <span className={styles['simulate__channel-name']}>{channel.name}</span>
                  <span className={styles['simulate__channel-meta']}>
                    {channel.team} · {channel.private ? 'Private' : 'Public'}
                  </span>
                </span>
                <span className={styles['simulate__channel-tags']}>
                  {classificationTag(channel)}
                  <Icon size="16" glyph={<ChevronRightIcon />} />
                </span>
              </button>
            );
          })}
        </Scrollbars>
      </div>
    </div>
  );
}

// ─── Route B — Policy impact (batch) ──────────────────────────────────────────

function BatchMode({
  isError,
  navigate,
}: {
  isError: boolean;
  navigate: ReturnType<typeof useNavigate>;
}) {
  if (isError) {
    return (
      <SectionNotice
        type="Danger"
        icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
        title="Impact summary couldn’t be computed"
        description="The membership engine didn’t return an aggregate for this policy’s scope. No changes were made. Try again."
        primaryButtonLabel="Retry"
        onPrimaryAction={() => navigate(0)}
      />
    );
  }

  const impact = SIM_BATCH_IMPACT;
  return (
    <div className={styles['simulate__result']}>
      <div className={styles['simulate__intro']}>
        <h2 className={styles['simulate__title']}>Policy impact across scope</h2>
        <p className={styles['simulate__subtitle']}>
          {impact.totalInScope} channels in scope · {impact.skippedMissingAttr} skipped (no
          referenced attribute)
          {impact.overClearanceChannels > 0
            ? ' · Data from some channels may not be included here'
            : ''}
          .
        </p>
      </div>

      <div className={styles['simulate__batch-cards']}>
        <div className={styles['simulate__card']}>
          <span className={styles['simulate__card-value']}>{impact.membersTouched}</span>
          <span className={styles['simulate__card-label']}>Members touched</span>
        </div>
        <div className={styles['simulate__card']}>
          <span className={styles['simulate__card-value']}>{impact.totalAdded}</span>
          <span className={styles['simulate__card-label']}>Would be added</span>
        </div>
        <div className={styles['simulate__card']}>
          <span className={styles['simulate__card-value']}>{impact.totalKept}</span>
          <span className={styles['simulate__card-label']}>Would be kept</span>
        </div>
        <div
          className={[styles['simulate__card'], styles['simulate__card--removed']]
            .filter(Boolean)
            .join(' ')}
        >
          <span className={styles['simulate__card-value']}>{impact.totalRemoved}</span>
          <span className={styles['simulate__card-label']}>Removed (private, destructive)</span>
        </div>
      </div>

      {impact.overClearanceChannels > 0 && (
        <SectionNotice
          type="Warning"
          icon={<Icon size="20" glyph={<ShieldOutlineIcon />} />}
          title={SIM_BATCH_OVER_CLEARANCE_TITLE}
          description={SIM_BATCH_OVER_CLEARANCE_DESCRIPTION}
        />
      )}

      <span className={styles['simulate__section-label']}>Most affected channels</span>
      <div className={styles['simulate__ranked']}>
        {impact.topAffected.map(({ channel, diff }) => (
          <button
            key={channel.id}
            type="button"
            className={styles['simulate__ranked-row']}
            onClick={() =>
              navigate(
                `${GMP_ROUTES.simulate}?mode=channel&state=populated&channel=${channel.id}`,
              )
            }
          >
            <span className={styles['simulate__channel-glyph']}>
              <Icon size="16" glyph={channel.private ? <LockOutlineIcon /> : <PoundIcon />} />
            </span>
            <span className={styles['simulate__ranked-main']}>
              <span className={styles['simulate__channel-name']}>{channel.name}</span>
              <span className={styles['simulate__channel-meta']}>
                {channel.team} · {channel.private ? 'Private' : 'Public'}
              </span>
            </span>
            <span className={styles['simulate__ranked-metrics']}>
              <span className={styles['simulate__ranked-added']}>+{diff.added} added</span>
              <span className={styles['simulate__ranked-removed']}>−{diff.removed} removed</span>
              {classificationTag(channel)}
              <Icon size="16" glyph={<ChevronRightIcon />} />
            </span>
          </button>
        ))}
      </div>

      <div className={styles['simulate__audit']}>
        <Icon size="12" glyph={<InformationOutlineIcon />} />
        <span>This impact run was recorded with the policy hash. View audit log.</span>
      </div>
    </div>
  );
}
