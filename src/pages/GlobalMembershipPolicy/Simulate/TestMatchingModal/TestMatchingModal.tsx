/**
 * GMP — "Test matching users" MODAL.
 *
 * The editor's "Test matching users" button opens THIS modal. It hosts a concept
 * switcher (segmented tabs) over FOUR run-and-view panels, re-rendered for the
 * modal context (no console sidebar / page header — just the concept body sized
 * for a modal):
 *
 *   - channel   — Against a channel · Added/Kept/Removed set-diff.
 *   - impact    — Policy impact · aggregate blast-radius across scope.
 *   - person    — Person-first pinpoint · pick a member → verdict + per-channel
 *                 reason trace (uses the FIXED, always-visible picker).
 *   - changeset — the approvable per-channel +/− diff document.
 *
 * Concept B (live cohort preview) is intentionally NOT hosted here — its
 * standalone scene stays parked.
 *
 * All four panels reuse the SHARED set-diff / personVerdict / band primitives in
 * gmpData.ts (imported read-only), so the modal shows the SAME numbers as the
 * standalone scenes. Per-concept over-clearance guardrail is preserved:
 *   - Person    → REFUSE (no bands for N=1).
 *   - Channel / Changeset / Impact → aggregate bands (no names, no rule).
 *
 * The bodies below mirror the rendering of Simulate.tsx, ConceptPersonFirst.tsx,
 * and ConceptChangeset.tsx (referenced, not modified).
 */

import { useMemo, useState } from 'react';
import PoundIcon from '@mattermost/compass-icons/components/pound';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import AccountMinusOutlineIcon from '@mattermost/compass-icons/components/account-minus-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CloseIcon from '@mattermost/compass-icons/components/close';

import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Tags from '@/components/ui/Tags/Tags';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Spinner from '@/components/ui/Spinner/Spinner';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import SearchInput from '@/components/ui/SearchInput/SearchInput';

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
  visibleSimChannels,
  isOverClearance,
  channelDiff,
  failingConditionFor,
  toBand,
  SIM_BATCH_IMPACT,
  SIM_OVER_CLEARANCE_NOTE,
  SIM_BATCH_OVER_CLEARANCE_TITLE,
  SIM_BATCH_OVER_CLEARANCE_DESCRIPTION,
  SIM_PEOPLE,
  personVerdict,
  personSummary,
  personDecidingReason,
  buildChangeset,
  changesetTotals,
  TEST_MATCHING_PANELS,
  type SimChannel,
  type SimMember,
  type SimPerson,
  type PersonChannelRow,
  type ChangesetChannel,
  type TestMatchingPanelId,
} from '@/pages/GlobalMembershipPolicy/gmpData';

import styles from './TestMatchingModal.module.scss';

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

export interface TestMatchingModalProps {
  policyName: string;
  /** Which concept panel to open on. */
  initialPanel?: TestMatchingPanelId;
  onClose: () => void;
}

// ─── Shared bits ──────────────────────────────────────────────────────────────

function classificationTag(channel: SimChannel) {
  const over = isOverClearance(channel);
  return (
    <Tags size="X-Small" type={over ? 'Danger' : 'General'}>
      {channel.classification}
    </Tags>
  );
}

function MemberRow({ member }: { member: SimMember }) {
  return (
    <div className={styles['tmm__member']}>
      <UserAvatar src={AVATARS[member.key]} alt={member.name} name={member.name} size="24" />
      <div className={styles['tmm__member-main']}>
        <span className={styles['tmm__member-name']}>{member.name}</span>
        <span className={styles['tmm__member-role']}>{member.role}</span>
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
    styles['tmm__column'],
    removed ? styles['tmm__column--removed'] : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={colClass}>
      <div className={styles['tmm__column-head']}>
        <span className={styles['tmm__glyph']}>{glyph}</span>
        <span className={styles['tmm__column-label']}>{label}</span>
        <span className={styles['tmm__column-count']}>{members.length}</span>
      </div>
      {removed && destructive && (
        <div className={styles['tmm__column-note']}>
          Removed from a private channel. Not reversible without re-adding.
        </div>
      )}
      {removed && !destructive && publicChannel && members.length > 0 && (
        <div className={styles['tmm__column-note']}>
          Dropped from recommendations only. Members keep their access.
        </div>
      )}
      {members.length === 0 ? (
        <div className={styles['tmm__column-empty']}>No members in this set.</div>
      ) : (
        members.map((m) => <MemberRow key={m.key} member={m} />)
      )}
    </div>
  );
}

// ─── Panel: Against a channel ──────────────────────────────────────────────────

function ChannelPanel() {
  const channels = visibleSimChannels();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SimChannel | null>(null);
  const [computing, setComputing] = useState(false);

  const filteredChannels = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === '') {
      return channels;
    }
    return channels.filter((channel) => {
      const haystack = [
        channel.name,
        channel.team,
        channel.classification,
        channel.private ? 'private' : 'public',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [channels, query]);

  const run = (channel: SimChannel) => {
    setSelected(channel);
    setComputing(true);
    setQuery('');
    window.setTimeout(() => setComputing(false), 700);
  };

  if (selected == null) {
    return (
      <div className={styles['tmm__picker']}>
        <span className={styles['tmm__picker-label']}>
          Choose a channel to simulate against
        </span>
        <div className={styles['tmm__picker-search']}>
          <SearchInput
            size="Medium"
            placeholder="Search channels by name, team, or classification…"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            onClear={() => setQuery('')}
          />
        </div>
        <div className={styles['tmm__picker-note']}>
          <Icon size="16" glyph={<InformationOutlineIcon />} />
          <span>
            Only channels you can fully see are listed. Channels above your clearance render
            aggregate ranges only — no names, no matching rule.
          </span>
        </div>
        <div className={styles['tmm__list']}>
          {filteredChannels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              className={styles['tmm__row']}
              onClick={() => run(channel)}
            >
              <span className={styles['tmm__glyph']}>
                <Icon size="16" glyph={channel.private ? <LockOutlineIcon /> : <PoundIcon />} />
              </span>
              <span className={styles['tmm__row-main']}>
                <span className={styles['tmm__row-name']}>{channel.name}</span>
                <span className={styles['tmm__row-meta']}>
                  {channel.team} · {channel.private ? 'Private' : 'Public'}
                </span>
              </span>
              <span className={styles['tmm__row-trailing']}>
                {classificationTag(channel)}
                <Icon size="16" glyph={<ChevronRightIcon />} />
              </span>
            </button>
          ))}
          {filteredChannels.length === 0 && (
            <div className={styles['tmm__no-match']}>No channels match “{query}”.</div>
          )}
        </div>
      </div>
    );
  }

  const diff = channelDiff(selected);
  const over = isOverClearance(selected);

  return (
    <div className={styles['tmm__result']}>
      <Button
        emphasis="Tertiary"
        size="Small"
        leadingIcon={<Icon size="16" glyph={<CloseIcon />} />}
        onClick={() => {
          setSelected(null);
          setQuery('');
        }}
      >
        Pick a different channel
      </Button>

      {computing ? (
        <div className={styles['tmm__computing']}>
          <Spinner size={20} />
          <span>Computing membership changes for {selected.name}…</span>
        </div>
      ) : over ? (
        <div className={styles['tmm__result-inner']}>
          <SectionNotice
            type="Warning"
            icon={<Icon size="20" glyph={<ShieldOutlineIcon />} />}
            title="Results shown as ranges — above your clearance"
            description={SIM_OVER_CLEARANCE_NOTE}
          />
          <div className={styles['tmm__bands']}>
            <div className={styles['tmm__band']}>
              <span className={styles['tmm__band-label']}>Would be added</span>
              <span className={styles['tmm__band-value']}>{toBand(diff.added)}</span>
            </div>
            <div className={styles['tmm__band']}>
              <span className={styles['tmm__band-label']}>Would be kept</span>
              <span className={styles['tmm__band-value']}>{toBand(diff.kept)}</span>
            </div>
            <div
              className={[styles['tmm__band'], styles['tmm__band--removed']]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles['tmm__band-label']}>Would be removed</span>
              <span className={styles['tmm__band-value']}>{toBand(diff.removed)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles['tmm__result-inner']}>
          <div className={styles['tmm__result-head']}>
            <div>
              <span className={styles['tmm__result-title']}>{selected.name}</span>
              <p className={styles['tmm__result-summary']}>
                {diff.added} added · {diff.kept} kept ·{' '}
                {diff.removed > 0 ? (
                  <span className={styles['tmm__removed']}>{diff.removed} removed</span>
                ) : (
                  <span>0 removed</span>
                )}
              </p>
            </div>
            {classificationTag(selected)}
          </div>

          {diff.destructive && (
            <SectionNotice
              type="Danger"
              icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
              title={`${diff.removed} members would be removed from this private channel`}
              description="Private-channel removals take effect on save and are not reversible without re-adding each member. Review the removed set before applying."
            />
          )}

          <div className={styles['tmm__columns']}>
            <SetColumn
              label="Would be added"
              glyph={<Icon size="16" glyph={<AccountPlusOutlineIcon />} />}
              members={selected.members.added}
            />
            <SetColumn
              label="Would be kept"
              glyph={<Icon size="16" glyph={<CheckCircleOutlineIcon />} />}
              members={selected.members.kept}
            />
            <SetColumn
              label="Would be removed"
              glyph={<Icon size="16" glyph={<AccountMinusOutlineIcon />} />}
              members={selected.members.removed}
              removed
              destructive={diff.destructive}
              publicChannel={!selected.private}
            />
          </div>

          <div className={styles['tmm__audit']}>
            <Icon size="12" glyph={<InformationOutlineIcon />} />
            <span>Matched on {failingConditionFor(selected)}. Recorded in the audit log.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Panel: Policy impact (aggregate) ──────────────────────────────────────────

function ImpactPanel() {
  const impact = SIM_BATCH_IMPACT;
  return (
    <div className={styles['tmm__result-inner']}>
      <div className={styles['tmm__intro']}>
        <span className={styles['tmm__result-title']}>Policy impact across scope</span>
        <p className={styles['tmm__result-summary']}>
          {impact.totalInScope} channels in scope · {impact.skippedMissingAttr} skipped (no
          referenced attribute)
          {impact.overClearanceChannels > 0
            ? ' · Data from some channels may not be included here'
            : ''}
          .
        </p>
      </div>

      <div className={styles['tmm__cards']}>
        <div className={styles['tmm__card']}>
          <span className={styles['tmm__card-value']}>{impact.membersTouched}</span>
          <span className={styles['tmm__card-label']}>Members touched</span>
        </div>
        <div className={styles['tmm__card']}>
          <span className={styles['tmm__card-value']}>{impact.totalAdded}</span>
          <span className={styles['tmm__card-label']}>Would be added</span>
        </div>
        <div className={styles['tmm__card']}>
          <span className={styles['tmm__card-value']}>{impact.totalKept}</span>
          <span className={styles['tmm__card-label']}>Would be kept</span>
        </div>
        <div
          className={[styles['tmm__card'], styles['tmm__card--removed']]
            .filter(Boolean)
            .join(' ')}
        >
          <span className={styles['tmm__card-value']}>{impact.totalRemoved}</span>
          <span className={styles['tmm__card-label']}>Removed (private, destructive)</span>
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

      <span className={styles['tmm__section-label']}>Most affected channels</span>
      <div className={styles['tmm__ranked']}>
        {impact.topAffected.map(({ channel, diff }) => (
          <div key={channel.id} className={styles['tmm__ranked-row']}>
            <span className={styles['tmm__glyph']}>
              <Icon size="16" glyph={channel.private ? <LockOutlineIcon /> : <PoundIcon />} />
            </span>
            <span className={styles['tmm__row-main']}>
              <span className={styles['tmm__row-name']}>{channel.name}</span>
              <span className={styles['tmm__row-meta']}>
                {channel.team} · {channel.private ? 'Private' : 'Public'}
              </span>
            </span>
            <span className={styles['tmm__ranked-metrics']}>
              <span className={styles['tmm__ranked-added']}>+{diff.added} added</span>
              <span className={styles['tmm__ranked-removed']}>−{diff.removed} removed</span>
              {classificationTag(channel)}
            </span>
          </div>
        ))}
      </div>

      <div className={styles['tmm__audit']}>
        <Icon size="12" glyph={<InformationOutlineIcon />} />
        <span>This impact run was recorded with the policy hash. View audit log.</span>
      </div>
    </div>
  );
}

// ─── Panel: Person (the FIXED picker) ──────────────────────────────────────────

const OUTCOME_META = {
  kept: { label: 'Kept', glyph: <CheckCircleOutlineIcon />, tone: 'kept' as const },
  added: { label: 'Would be added', glyph: <AccountPlusOutlineIcon />, tone: 'added' as const },
  removed: {
    label: 'Would be removed',
    glyph: <AccountMinusOutlineIcon />,
    tone: 'removed' as const,
  },
};

function TraceRow({ row, person }: { row: PersonChannelRow; person: SimPerson }) {
  const { channel, outcome, refused, destructive } = row;

  if (refused || outcome === 'not-a-member') {
    return null;
  }

  const meta = OUTCOME_META[outcome];
  return (
    <div
      className={[styles['tmm__trace-row'], styles[`tmm__trace-row--${meta.tone}`]]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles['tmm__glyph']}>
        <Icon size="16" glyph={channel.private ? <LockOutlineIcon /> : <PoundIcon />} />
      </span>
      <span className={styles['tmm__trace-main']}>
        <span className={styles['tmm__trace-name']}>{channel.name}</span>
        <span className={styles['tmm__trace-reason']}>
          {personDecidingReason(person, channel).replace('this member', 'this person')}
        </span>
      </span>
      <span className={styles['tmm__trace-verdict']}>
        {destructive && (
          <span className={styles['tmm__trace-destructive']}>Private · destructive</span>
        )}
        <span
          className={[styles['tmm__verdict-token'], styles[`tmm__verdict-token--${meta.tone}`]]
            .filter(Boolean)
            .join(' ')}
        >
          <Icon size="12" glyph={meta.glyph} />
          {meta.label}
        </span>
      </span>
    </div>
  );
}

function PersonVerdict({ person }: { person: SimPerson }) {
  const rows = personVerdict(person);
  const summary = personSummary(rows);
  const activeRows = rows.filter((r) => !r.refused && r.outcome !== 'not-a-member');

  const headlineTone =
    summary.headline === 'removed'
      ? 'removed'
      : summary.headline === 'added'
        ? 'added'
        : summary.headline === 'kept'
          ? 'kept'
          : 'mixed';

  const headlineLabel =
    summary.headline === 'removed'
      ? 'Would be removed'
      : summary.headline === 'added'
        ? 'Would be added'
        : summary.headline === 'kept'
          ? 'Kept'
          : 'Mixed outcome';

  return (
    <div className={styles['tmm__result-inner']}>
      <div
        className={[styles['tmm__headline'], styles[`tmm__headline--${headlineTone}`]]
          .filter(Boolean)
          .join(' ')}
      >
        <UserAvatar src={AVATARS[person.key]} alt={person.name} name={person.name} size="48" />
        <div className={styles['tmm__headline-main']}>
          <span className={styles['tmm__headline-name']}>{person.name}</span>
          <span className={styles['tmm__headline-role']}>
            {person.role} · Clearance {person.clearance}
          </span>
        </div>
        <span
          className={[
            styles['tmm__headline-token'],
            styles[`tmm__headline-token--${headlineTone}`],
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {headlineLabel}
        </span>
      </div>

      <p className={styles['tmm__result-summary']}>
        {summary.kept} kept · {summary.added} would be added ·{' '}
        <span className={styles['tmm__removed']}>{summary.removed} would be removed</span>
      </p>

      {summary.removed > 0 && (
        <SectionNotice
          type="Danger"
          icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
          title={`${person.name} would be removed from ${summary.removed} private channel${summary.removed === 1 ? '' : 's'}`}
          description="Private-channel removals take effect on save and are not reversible without re-adding this person. Review the trace below before applying."
        />
      )}

      {summary.refusedCount > 0 && (
        <SectionNotice
          type="Warning"
          icon={<Icon size="20" glyph={<ShieldOutlineIcon />} />}
          title={SIM_BATCH_OVER_CLEARANCE_TITLE}
          description={SIM_BATCH_OVER_CLEARANCE_DESCRIPTION}
        />
      )}

      <span className={styles['tmm__section-label']}>Per-channel trace</span>
      <div className={styles['tmm__trace']}>
        {activeRows.map((row) => (
          <TraceRow key={row.channel.id} row={row} person={person} />
        ))}
      </div>

      <div className={styles['tmm__audit']}>
        <Icon size="12" glyph={<InformationOutlineIcon />} />
        <span>This single-person simulation was recorded. View audit log.</span>
      </div>
    </div>
  );
}

function PersonPanel() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SimPerson | null>(null);
  const [computing, setComputing] = useState(false);

  // The FIXED picker: the searchable, clickable member list is visible by
  // default (no EmptyState intercept) and filters as you type; picking a person
  // runs the verdict. Mirrors the goal-1 fix in ConceptPersonFirst.tsx.
  const filteredPeople = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q === '' ? SIM_PEOPLE : SIM_PEOPLE.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  const pick = (person: SimPerson) => {
    setSelected(person);
    setComputing(true);
    setQuery('');
    window.setTimeout(() => setComputing(false), 700);
  };

  const reset = () => {
    setSelected(null);
    setComputing(false);
    setQuery('');
  };

  if (selected != null) {
    return (
      <div className={styles['tmm__result']}>
        <div className={styles['tmm__chosen-bar']}>
          <span className={styles['tmm__chosen']}>
            <UserAvatar
              src={AVATARS[selected.key]}
              alt={selected.name}
              name={selected.name}
              size="24"
            />
            <span className={styles['tmm__chosen-name']}>{selected.name}</span>
          </span>
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<CloseIcon />} />}
            onClick={reset}
          >
            Pick a different person
          </Button>
        </div>
        {computing ? (
          <div className={styles['tmm__computing']}>
            <Spinner size={20} />
            <span>Resolving this policy for {selected.name}…</span>
          </div>
        ) : (
          <PersonVerdict person={selected} />
        )}
      </div>
    );
  }

  return (
    <div className={styles['tmm__picker']}>
      <span className={styles['tmm__picker-label']}>
        <Icon size="16" glyph={<AccountOutlineIcon />} />
        Person to simulate
      </span>
      <div className={styles['tmm__picker-search']}>
        <SearchInput
          size="Medium"
          placeholder="Search a member by name…"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onClear={() => setQuery('')}
        />
      </div>
      <div className={styles['tmm__picker-note']}>
        <Icon size="16" glyph={<InformationOutlineIcon />} />
        <span>
          Search a member, then pick them to see whether this policy would keep, add, or remove
          them from each in-scope channel. Only one person is evaluated at a time — the smallest
          possible data footprint.
        </span>
      </div>
      <div className={styles['tmm__list']}>
        {filteredPeople.map((person) => (
          <button
            key={person.key}
            type="button"
            className={styles['tmm__row']}
            onClick={() => pick(person)}
          >
            <UserAvatar
              src={AVATARS[person.key]}
              alt={person.name}
              name={person.name}
              size="32"
            />
            <span className={styles['tmm__row-main']}>
              <span className={styles['tmm__row-name']}>{person.name}</span>
              <span className={styles['tmm__row-meta']}>{person.role}</span>
            </span>
            <Tags size="X-Small" type="General">
              {person.clearance}
            </Tags>
          </button>
        ))}
        {filteredPeople.length === 0 && (
          <div className={styles['tmm__no-match']}>No members match “{query}”.</div>
        )}
      </div>
    </div>
  );
}

// ─── Panel: Changeset ──────────────────────────────────────────────────────────

function DiffLine({ member, op }: { member: SimMember; op: 'add' | 'remove' }) {
  return (
    <div
      className={[
        styles['tmm__line'],
        op === 'add' ? styles['tmm__line--add'] : styles['tmm__line--remove'],
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles['tmm__line-op']}>{op === 'add' ? '+' : '−'}</span>
      <UserAvatar src={AVATARS[member.key]} alt={member.name} name={member.name} size="24" />
      <span className={styles['tmm__line-name']}>{member.name}</span>
      <span className={styles['tmm__line-role']}>{member.role}</span>
    </div>
  );
}

function ChangesetSection({ row }: { row: ChangesetChannel }) {
  const [open, setOpen] = useState(!row.noChange && row.removed.length > 0);

  if (row.noChange) {
    return (
      <div
        className={[styles['tmm__section'], styles['tmm__section--no-change']]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles['tmm__section-head']}>
          <span className={styles['tmm__glyph']}>
            <Icon size="16" glyph={row.channel.private ? <LockOutlineIcon /> : <PoundIcon />} />
          </span>
          <span className={styles['tmm__row-main']}>
            <span className={styles['tmm__row-name']}>{row.channel.name}</span>
            <span className={styles['tmm__row-meta']}>{row.channel.team} · no change</span>
          </span>
          <span className={styles['tmm__net-none']}>No change</span>
        </div>
      </div>
    );
  }

  const lines: { member: SimMember; op: 'add' | 'remove' }[] = [
    ...row.removed.map((m) => ({ member: m, op: 'remove' as const })),
    ...row.added.map((m) => ({ member: m, op: 'add' as const })),
  ];

  return (
    <div
      className={[
        styles['tmm__section'],
        row.destructive ? styles['tmm__section--destructive'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className={styles['tmm__section-head']}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles['tmm__glyph']}>
          <Icon size="16" glyph={open ? <ChevronDownIcon /> : <ChevronRightIcon />} />
        </span>
        <span className={styles['tmm__glyph']}>
          <Icon size="16" glyph={row.channel.private ? <LockOutlineIcon /> : <PoundIcon />} />
        </span>
        <span className={styles['tmm__row-main']}>
          <span className={styles['tmm__row-name']}>
            {row.channel.name}
            {row.destructive && (
              <span className={styles['tmm__section-flag']}>private · destructive</span>
            )}
          </span>
          <span className={styles['tmm__row-meta']}>
            {row.channel.team} · {row.channel.private ? 'Private' : 'Public'}
          </span>
        </span>
        <span className={styles['tmm__section-net']}>
          <span className={styles['tmm__net-add']}>+{row.added.length}</span>
          <span className={styles['tmm__net-remove']}>−{row.removed.length}</span>
          <Tags size="X-Small" type="General">
            {row.channel.classification}
          </Tags>
        </span>
      </button>
      {open && (
        <div className={styles['tmm__lines']}>
          {lines.map((l) => (
            <DiffLine key={`${l.op}-${l.member.key}`} member={l.member} op={l.op} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChangesetPanel() {
  const rows = useMemo(() => buildChangeset(), []);
  const totals = useMemo(() => changesetTotals(rows), [rows]);
  const orderedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const w = (r: ChangesetChannel) =>
        r.overClearance ? 1 : r.noChange ? 0 : r.destructive ? 3 : 2;
      return w(b) - w(a);
    });
  }, [rows]);

  return (
    <div className={styles['tmm__result-inner']}>
      <div className={styles['tmm__summary']}>
        <span className={styles['tmm__summary-item']}>
          <span className={styles['tmm__net-add']}>+{totals.totalAdded}</span> across{' '}
          {totals.channelsAdding} channels
        </span>
        <span className={styles['tmm__summary-divider']} />
        <span className={styles['tmm__summary-item']}>
          <span className={styles['tmm__net-remove']}>−{totals.totalRemoved}</span> across{' '}
          {totals.channelsRemoving} channels
        </span>
        <span className={styles['tmm__summary-divider']} />
        <span className={styles['tmm__summary-item']}>{totals.skipped} skipped</span>
      </div>

      {totals.overClearanceChannels > 0 && (
        <SectionNotice
          type="Warning"
          icon={<Icon size="20" glyph={<ShieldOutlineIcon />} />}
          title={SIM_BATCH_OVER_CLEARANCE_TITLE}
          description={SIM_BATCH_OVER_CLEARANCE_DESCRIPTION}
        />
      )}

      <div className={styles['tmm__doc']}>
        {orderedRows
          .filter((row) => !row.overClearance)
          .map((row) => (
            <ChangesetSection key={row.channel.id} row={row} />
          ))}
      </div>

      <div className={styles['tmm__audit']}>
        <Icon size="12" glyph={<InformationOutlineIcon />} />
        <span>This changeset was recorded with the policy hash. View audit log.</span>
      </div>
    </div>
  );
}

// ─── Modal shell + switcher ─────────────────────────────────────────────────────

export default function TestMatchingModal({
  policyName,
  initialPanel = 'channel',
  onClose,
}: TestMatchingModalProps) {
  const [panel, setPanel] = useState<TestMatchingPanelId>(initialPanel);

  return (
    <div className={styles['tmm__scrim']} role="presentation">
      <div className={styles['tmm']}>
        <Modal
          size="Large"
          title="Test matching users"
          subtitle={policyName}
          onClose={onClose}
          footer={
            <Button emphasis="Tertiary" onClick={onClose}>
              Close
            </Button>
          }
        >
          <div className={styles['tmm__switcher']} role="tablist" aria-label="Simulation concept">
            {TEST_MATCHING_PANELS.map((p) => {
              const active = p.id === panel;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={[
                    styles['tmm__switcher-btn'],
                    active ? styles['tmm__switcher-btn--active'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setPanel(p.id)}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <p className={styles['tmm__blurb']}>
            {TEST_MATCHING_PANELS.find((p) => p.id === panel)?.blurb}
          </p>

          <div className={styles['tmm__panel']}>
            {panel === 'channel' && <ChannelPanel />}
            {panel === 'impact' && <ImpactPanel />}
            {panel === 'person' && <PersonPanel />}
            {panel === 'changeset' && <ChangesetPanel />}
          </div>
        </Modal>
      </div>
    </div>
  );
}
