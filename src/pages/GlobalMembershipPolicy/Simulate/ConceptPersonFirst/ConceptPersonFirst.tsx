/**
 * GMP Simulate — CONCEPT A · Person-First Pinpoint.
 *
 * Distinct mental model: the subject is a specific USER, not a channel. The
 * admin names one person; the answer is a single verdict-trace — whether that
 * person would be Kept / Would-be-added / Would-be-removed per in-scope channel,
 * with the deciding requirement row shown. Smallest data footprint of the three.
 *
 * Over-clearance handling: a single-person query against a channel above the
 * admin's clearance is an oracle (N=1 can't be safely banded), so it is REFUSED
 * — no result, no range — never downgraded to bands.
 *
 * Reuses the SAME set-diff data as Simulate.tsx (SIM_CHANNELS / SIM_MEMBERS)
 * via the additive personVerdict / personSummary helpers in gmpData.ts.
 *
 * Deep-links: ?state=empty|needs-channel|computing|kept|added|removed|
 * over-clearance|literal|error, ?policy=<id>.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PoundIcon from '@mattermost/compass-icons/components/pound';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import AccountMinusOutlineIcon from '@mattermost/compass-icons/components/account-minus-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';

import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Icon from '@/components/ui/Icon/Icon';
import Tags from '@/components/ui/Tags/Tags';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Spinner from '@/components/ui/Spinner/Spinner';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
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
  SIM_PEOPLE,
  personByKey,
  personVerdict,
  personSummary,
  personDecidingReason,
  PERSON_OVER_CLEARANCE_REFUSAL,
  policyById,
  type SimPerson,
  type PersonChannelRow,
} from '@/pages/GlobalMembershipPolicy/gmpData';
import { GMP_ROUTES, GMP_SIDEBAR_CATEGORIES } from '@/pages/GlobalMembershipPolicy/gmpConsole';

import styles from './ConceptPersonFirst.module.scss';

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

type ScreenState =
  | 'empty'
  | 'needs-channel'
  | 'computing'
  | 'kept'
  | 'added'
  | 'removed'
  | 'over-clearance'
  | 'literal'
  | 'error';

const VALID_STATES: ScreenState[] = [
  'empty',
  'needs-channel',
  'computing',
  'kept',
  'added',
  'removed',
  'over-clearance',
  'literal',
  'error',
];

function readParams() {
  return typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
}

/** Seed a representative person for a deep-linked headline state. */
function seedPersonFor(state: ScreenState): SimPerson | null {
  switch (state) {
    case 'kept':
    case 'over-clearance':
    case 'literal':
      return personByKey('aiko'); // TS-cleared → kept across Secret channels
    case 'added':
      return personByKey('arjun'); // newly matches → would be added
    case 'removed':
      return personByKey('sofia'); // under-cleared → would be removed
    default:
      return null;
  }
}

const OUTCOME_META = {
  kept: {
    label: 'Kept',
    glyph: <CheckCircleOutlineIcon />,
    tone: 'kept' as const,
  },
  added: {
    label: 'Would be added',
    glyph: <AccountPlusOutlineIcon />,
    tone: 'added' as const,
  },
  removed: {
    label: 'Would be removed',
    glyph: <AccountMinusOutlineIcon />,
    tone: 'removed' as const,
  },
};

/** One channel row in the verdict trace for the picked person. */
function TraceRow({ row, person }: { row: PersonChannelRow; person: SimPerson }) {
  const { channel, outcome, refused, destructive } = row;

  if (refused) {
    return (
      <div
        className={[styles['pinpoint__trace-row'], styles['pinpoint__trace-row--refused']]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={styles['pinpoint__trace-glyph']}>
          <Icon size="16" glyph={<ShieldOutlineIcon />} />
        </span>
        <span className={styles['pinpoint__trace-main']}>
          <span className={styles['pinpoint__trace-name']}>{channel.name}</span>
          <span className={styles['pinpoint__trace-reason']}>
            Above your clearance — this person’s result can’t be shown.
          </span>
        </span>
        <Tags size="X-Small" type="Warning">
          Refused
        </Tags>
      </div>
    );
  }

  if (outcome === 'not-a-member') return null;

  const meta = OUTCOME_META[outcome];
  const rowClass = [
    styles['pinpoint__trace-row'],
    styles[`pinpoint__trace-row--${meta.tone}`],
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rowClass}>
      <span className={styles['pinpoint__trace-glyph']}>
        <Icon size="16" glyph={channel.private ? <LockOutlineIcon /> : <PoundIcon />} />
      </span>
      <span className={styles['pinpoint__trace-main']}>
        <span className={styles['pinpoint__trace-name']}>{channel.name}</span>
        <span className={styles['pinpoint__trace-reason']}>
          {personDecidingReason(person, channel).replace('this member', 'this person')}
        </span>
      </span>
      <span className={styles['pinpoint__trace-verdict']}>
        {destructive && (
          <span className={styles['pinpoint__trace-destructive']}>Private · destructive</span>
        )}
        <span
          className={[
            styles['pinpoint__verdict-token'],
            styles[`pinpoint__verdict-token--${meta.tone}`],
          ]
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

/** The single big outcome card + per-channel trace for one person. */
function VerdictCard({
  person,
  rows,
  literalMode,
}: {
  person: SimPerson;
  rows: PersonChannelRow[];
  literalMode: boolean;
}) {
  const summary = personSummary(rows);
  const activeRows = rows.filter((r) => r.refused || r.outcome !== 'not-a-member');

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
    <div className={styles['pinpoint__result']}>
      <div
        className={[
          styles['pinpoint__headline'],
          styles[`pinpoint__headline--${headlineTone}`],
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <UserAvatar
          src={AVATARS[person.key]}
          alt={person.name}
          name={person.name}
          size="48"
        />
        <div className={styles['pinpoint__headline-main']}>
          <span className={styles['pinpoint__headline-name']}>{person.name}</span>
          <span className={styles['pinpoint__headline-role']}>
            {person.role} · Clearance {person.clearance}
          </span>
        </div>
        <span
          className={[
            styles['pinpoint__headline-token'],
            styles[`pinpoint__headline-token--${headlineTone}`],
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {headlineLabel}
        </span>
      </div>

      <p className={styles['pinpoint__result-summary']}>
        {literalMode
          ? 'Literal-only policy — this verdict is workspace-scoped and does not depend on a channel.'
          : `${summary.kept} kept · ${summary.added} would be added · `}
        {!literalMode && (
          <span className={styles['pinpoint__summary-removed']}>
            {summary.removed} would be removed
          </span>
        )}
        {summary.refusedCount > 0 && (
          <span className={styles['pinpoint__summary-refused']}>
            {' '}
            · {summary.refusedCount} above your clearance (refused)
          </span>
        )}
      </p>

      {summary.removed > 0 && (
        <SectionNotice
          type="Danger"
          icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
          title={`${person.name} would be removed from ${summary.removed} private channel${summary.removed === 1 ? '' : 's'}`}
          description="Private-channel removals take effect on save and are not reversible without re-adding this person. Review the trace below before applying."
        />
      )}

      <span className={styles['pinpoint__section-label']}>
        {literalMode ? 'Verdict' : 'Per-channel trace'}
      </span>
      <div className={styles['pinpoint__trace']}>
        {activeRows.map((row) => (
          <TraceRow key={row.channel.id} row={row} person={person} />
        ))}
      </div>

      <div className={styles['pinpoint__audit']}>
        <Icon size="12" glyph={<InformationOutlineIcon />} />
        <span>
          This single-person simulation was recorded. Refused channels are logged as
          range-suppressed. View audit log.
        </span>
      </div>
    </div>
  );
}

export default function ConceptPersonFirst() {
  const navigate = useNavigate();
  const params = readParams();

  const stateParam = params.get('state') as ScreenState | null;
  const initialState: ScreenState =
    stateParam && VALID_STATES.includes(stateParam) ? stateParam : 'empty';

  const policyParam = params.get('policy');
  const policyName = policyById(policyParam ?? '')?.name ?? 'DS Program';

  const [screen, setScreen] = useState<ScreenState>(initialState);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SimPerson | null>(seedPersonFor(initialState));
  const [active, setActive] = useState('membership-policies');

  const literalMode = screen === 'literal';

  const rows = useMemo(
    () => (selected ? personVerdict(selected) : []),
    [selected],
  );

  // For the deep-linked over-clearance state, surface a person whose result is
  // dominated by a refused (TS) channel.
  const overClearanceRows = useMemo<PersonChannelRow[]>(() => {
    if (!selected) return [];
    return rows.map((r) =>
      r.channel.classification === 'Top Secret'
        ? { ...r, refused: true, outcome: 'not-a-member' }
        : r,
    );
  }, [rows, selected]);

  const handleSidebarClick = (itemId: string) => {
    setActive(itemId);
    if (itemId === 'membership-policies') navigate(GMP_ROUTES.list);
  };

  const pickPerson = (person: SimPerson) => {
    setSelected(person);
    setScreen('computing');
    setQuery('');
    window.setTimeout(() => {
      const summary = personSummary(personVerdict(person));
      const next: ScreenState =
        summary.headline === 'removed'
          ? 'removed'
          : summary.headline === 'added'
            ? 'added'
            : 'kept';
      setScreen(next);
    }, 700);
  };

  const resetPicker = () => {
    setSelected(null);
    setScreen('empty');
    setQuery('');
  };

  const filteredPeople =
    query.trim() === ''
      ? SIM_PEOPLE
      : SIM_PEOPLE.filter((p) =>
          p.name.toLowerCase().includes(query.trim().toLowerCase()),
        );

  const showResult =
    selected != null &&
    ['computing', 'kept', 'added', 'removed', 'over-clearance', 'literal'].includes(screen);

  return (
    <div className={styles['pinpoint']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt={SIMULATE_ADMIN.name}
        username={SIMULATE_ADMIN.username}
        categories={GMP_SIDEBAR_CATEGORIES}
        activeItemId={active}
        onItemClick={handleSidebarClick}
      />

      <div className={styles['pinpoint__center']}>
        <ConsolePageHeader
          title={`Simulate for a person — ${policyName}`}
          subtitle="Name one member; see whether they’d be kept, added, or removed"
          backButton
          onBack={() => navigate(GMP_ROUTES.editor)}
        />

        <div className={styles['pinpoint__scroll']}>
          <div className={styles['pinpoint__page']}>
            {/* Person field — the subject of this concept */}
            <div className={styles['pinpoint__subject']}>
              <span className={styles['pinpoint__subject-label']}>
                <Icon size="16" glyph={<AccountOutlineIcon />} />
                Person to simulate
              </span>
              {selected && showResult ? (
                <div className={styles['pinpoint__chosen']}>
                  <UserAvatar
                    src={AVATARS[selected.key]}
                    alt={selected.name}
                    name={selected.name}
                    size="24"
                  />
                  <span className={styles['pinpoint__chosen-name']}>{selected.name}</span>
                  <button
                    type="button"
                    className={styles['pinpoint__chosen-clear']}
                    onClick={resetPicker}
                    aria-label="Pick a different person"
                  >
                    <Icon size="12" glyph={<CloseIcon />} />
                  </button>
                </div>
              ) : (
                <SearchInput
                  size="Medium"
                  placeholder="Search a member by name…"
                  value={query}
                  onChange={(e) => setQuery(e.currentTarget.value)}
                  onClear={() => setQuery('')}
                />
              )}
            </div>

            {screen === 'error' ? (
              <SectionNotice
                type="Danger"
                icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                title="Couldn’t simulate for this person"
                description="The membership engine didn’t return a result. No changes were made. Try again."
                primaryButtonLabel="Retry"
                onPrimaryAction={() => selected && pickPerson(selected)}
              />
            ) : screen === 'needs-channel' ? (
              <SectionNotice
                type="Info"
                icon={<Icon size="20" glyph={<InformationOutlineIcon />} />}
                title="Pick a channel for this variable-mode requirement"
                description="This policy compares the member’s attribute to a channel attribute, so a channel is needed to resolve the comparison. Choose a channel to see the verdict."
              />
            ) : showResult && screen === 'computing' ? (
              <div className={styles['pinpoint__computing']}>
                <Spinner size={20} />
                <span>Resolving this policy for {selected?.name}…</span>
              </div>
            ) : showResult && selected ? (
              <VerdictCard
                person={selected}
                rows={screen === 'over-clearance' ? overClearanceRows : rows}
                literalMode={literalMode}
              />
            ) : SIM_PEOPLE.length === 0 ? (
              <EmptyState
                illustration={{ children: <LockedIllustration /> }}
                title="No members available to simulate"
                description="You don’t have visibility into any members in this policy’s scope. Ask an administrator with the right clearance to run this simulation."
              />
            ) : (
              <div className={styles['pinpoint__picker']}>
                <div className={styles['pinpoint__picker-note']}>
                  <Icon size="16" glyph={<InformationOutlineIcon />} />
                  <span>
                    Search a member above, then pick them to see whether this policy would keep,
                    add, or remove them from each in-scope channel — with the deciding requirement
                    for each. Only one person is evaluated at a time — the smallest possible data
                    footprint for a simulation.
                  </span>
                </div>
                <div className={styles['pinpoint__people']}>
                  <Scrollbars style={{ maxHeight: 420 }}>
                    {filteredPeople.map((person) => (
                      <button
                        key={person.key}
                        type="button"
                        className={styles['pinpoint__person-row']}
                        onClick={() => pickPerson(person)}
                      >
                        <UserAvatar
                          src={AVATARS[person.key]}
                          alt={person.name}
                          name={person.name}
                          size="32"
                        />
                        <span className={styles['pinpoint__person-main']}>
                          <span className={styles['pinpoint__person-name']}>{person.name}</span>
                          <span className={styles['pinpoint__person-meta']}>{person.role}</span>
                        </span>
                        <Tags size="X-Small" type="General">
                          {person.clearance}
                        </Tags>
                      </button>
                    ))}
                    {filteredPeople.length === 0 && (
                      <div className={styles['pinpoint__no-match']}>
                        No members match “{query}”.
                      </div>
                    )}
                  </Scrollbars>
                </div>
              </div>
            )}

            {/* Over-clearance refusal — surfaced as its own block for the deep-link */}
            {screen === 'over-clearance' && selected && (
              <SectionNotice
                type="Warning"
                icon={<Icon size="20" glyph={<ShieldOutlineIcon />} />}
                title="Some channels are above your clearance"
                description={PERSON_OVER_CLEARANCE_REFUSAL}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
