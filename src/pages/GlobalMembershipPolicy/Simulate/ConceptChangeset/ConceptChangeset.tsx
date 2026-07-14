/**
 * GMP Simulate — CONCEPT C · Delta / Changeset Simulation.
 *
 * Distinct mental model: the subject is the EDIT ITSELF — the delta between the
 * proposed policy and current live membership. The output is an approvable,
 * scrollable per-channel DIFF DOCUMENT (grouped +added / −removed lines per
 * channel, collapsible, filterable) that the admin reviews and approves before
 * Save. A "Terraform plan for membership." This is deliberately NOT a totals
 * dashboard — the diff lines ARE the artifact; the summary bar only tallies them.
 *
 * Over-clearance handling: over-clearance channels appear as a single BANDED row
 * inline in the diff (counts only, no names) so the changeset totals stay honest.
 *
 * Reuses the SAME set-diff data as Simulate.tsx via buildChangeset /
 * changesetTotals in gmpData.ts, so numbers match the other concepts.
 *
 * Deep-links: ?state=idle|computing|populated|filtered-removals|empty|stale|
 * approved|isso-pending|error, ?policy=<id>.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PoundIcon from '@mattermost/compass-icons/components/pound';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CheckAllIcon from '@mattermost/compass-icons/components/check-all';
import RefreshIcon from '@mattermost/compass-icons/components/refresh';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';

import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
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
  buildChangeset,
  changesetTotals,
  CHANGESET_OVER_CLEARANCE_NOTE,
  CHANGESET_ISSO_NOTE,
  policyById,
  type ChangesetChannel,
  type SimMember,
} from '@/pages/GlobalMembershipPolicy/gmpData';
import { GMP_ROUTES, GMP_SIDEBAR_CATEGORIES } from '@/pages/GlobalMembershipPolicy/gmpConsole';

import styles from './ConceptChangeset.module.scss';

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
  | 'idle'
  | 'computing'
  | 'populated'
  | 'filtered-removals'
  | 'empty'
  | 'stale'
  | 'approved'
  | 'isso-pending'
  | 'error';

const VALID_STATES: ScreenState[] = [
  'idle',
  'computing',
  'populated',
  'filtered-removals',
  'empty',
  'stale',
  'approved',
  'isso-pending',
  'error',
];

function readParams() {
  return typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
}

/** One +added or −removed diff line within an expanded channel section. */
function DiffLine({ member, op }: { member: SimMember; op: 'add' | 'remove' }) {
  const lineClass = [
    styles['changeset__line'],
    op === 'add' ? styles['changeset__line--add'] : styles['changeset__line--remove'],
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={lineClass}>
      <span className={styles['changeset__line-op']}>{op === 'add' ? '+' : '−'}</span>
      <UserAvatar src={AVATARS[member.key]} alt={member.name} name={member.name} size="24" />
      <span className={styles['changeset__line-name']}>{member.name}</span>
      <span className={styles['changeset__line-role']}>{member.role}</span>
      <span className={styles['changeset__line-tag']}>{op === 'add' ? 'added' : 'removed'}</span>
    </div>
  );
}

/** One collapsible per-channel section of the diff document. */
function ChannelSection({
  row,
  removalsOnly,
  defaultOpen,
}: {
  row: ChangesetChannel;
  removalsOnly: boolean;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Over-clearance → a single banded row, no per-member lines (security guard).
  if (row.overClearance) {
    return (
      <div
        className={[styles['changeset__section'], styles['changeset__section--banded']]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles['changeset__section-head']}>
          <span className={styles['changeset__section-glyph']}>
            <Icon size="16" glyph={<ShieldOutlineIcon />} />
          </span>
          <span className={styles['changeset__section-main']}>
            <span className={styles['changeset__section-name']}>{row.channel.name}</span>
            <span className={styles['changeset__section-meta']}>
              {row.channel.team} · Above your clearance · members not shown
            </span>
          </span>
          <span className={styles['changeset__section-net']}>
            <span className={styles['changeset__net-add']}>+{row.band?.added}</span>
            <span className={styles['changeset__net-remove']}>−{row.band?.removed}</span>
            <Tags size="X-Small" type="Warning">
              {row.channel.classification}
            </Tags>
          </span>
        </div>
        <div className={styles['changeset__banded-note']}>
          <Icon size="12" glyph={<InformationOutlineIcon />} />
          <span>{CHANGESET_OVER_CLEARANCE_NOTE}</span>
        </div>
      </div>
    );
  }

  if (row.noChange) {
    return (
      <div
        className={[styles['changeset__section'], styles['changeset__section--no-change']]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles['changeset__section-head']}>
          <span className={styles['changeset__section-glyph']}>
            <Icon
              size="16"
              glyph={row.channel.private ? <LockOutlineIcon /> : <PoundIcon />}
            />
          </span>
          <span className={styles['changeset__section-main']}>
            <span className={styles['changeset__section-name']}>{row.channel.name}</span>
            <span className={styles['changeset__section-meta']}>
              {row.channel.team} · no change
            </span>
          </span>
          <span className={styles['changeset__section-net']}>
            <span className={styles['changeset__net-none']}>No change</span>
          </span>
        </div>
      </div>
    );
  }

  const lines: { member: SimMember; op: 'add' | 'remove' }[] = [
    ...row.removed.map((m) => ({ member: m, op: 'remove' as const })),
    ...(removalsOnly ? [] : row.added.map((m) => ({ member: m, op: 'add' as const }))),
  ];

  return (
    <div
      className={[
        styles['changeset__section'],
        row.destructive ? styles['changeset__section--destructive'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className={styles['changeset__section-head']}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles['changeset__section-caret']}>
          <Icon size="16" glyph={open ? <ChevronDownIcon /> : <ChevronRightIcon />} />
        </span>
        <span className={styles['changeset__section-glyph']}>
          <Icon size="16" glyph={row.channel.private ? <LockOutlineIcon /> : <PoundIcon />} />
        </span>
        <span className={styles['changeset__section-main']}>
          <span className={styles['changeset__section-name']}>
            {row.channel.name}
            {row.destructive && (
              <span className={styles['changeset__section-flag']}>private · destructive</span>
            )}
          </span>
          <span className={styles['changeset__section-meta']}>
            {row.channel.team} · {row.channel.private ? 'Private' : 'Public'}
          </span>
        </span>
        <span className={styles['changeset__section-net']}>
          <span className={styles['changeset__net-add']}>+{row.added.length}</span>
          <span className={styles['changeset__net-remove']}>−{row.removed.length}</span>
          <Tags size="X-Small" type="General">
            {row.channel.classification}
          </Tags>
        </span>
      </button>

      {open && (
        <div className={styles['changeset__lines']}>
          {lines.map((l) => (
            <DiffLine key={`${l.op}-${l.member.key}`} member={l.member} op={l.op} />
          ))}
          {!removalsOnly && row.channel.private === false && row.removed.length === 0 && (
            <div className={styles['changeset__line-note']}>
              Public channel — non-matching members keep access; they’re only dropped from
              recommendations.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConceptChangeset() {
  const navigate = useNavigate();
  const params = readParams();

  const stateParam = params.get('state') as ScreenState | null;
  const initialState: ScreenState =
    stateParam && VALID_STATES.includes(stateParam) ? stateParam : 'idle';

  const policyParam = params.get('policy');
  const policyName = policyById(policyParam ?? '')?.name ?? 'DS Program';

  const [screen, setScreen] = useState<ScreenState>(initialState);
  const [removalsOnly, setRemovalsOnly] = useState(initialState === 'filtered-removals');
  const [active, setActive] = useState('membership-policies');

  const rows = useMemo(() => buildChangeset(), []);
  const totals = useMemo(() => changesetTotals(rows), [rows]);

  const handleSidebarClick = (itemId: string) => {
    setActive(itemId);
    if (itemId === 'membership-policies') navigate(GMP_ROUTES.list);
  };

  const compute = () => {
    setScreen('computing');
    window.setTimeout(() => setScreen('populated'), 900);
  };

  const isDiffVisible =
    screen === 'populated' ||
    screen === 'filtered-removals' ||
    screen === 'stale' ||
    screen === 'approved' ||
    screen === 'isso-pending';

  // Sections with changes expanded by default; routine channels collapsed.
  const orderedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aWeight = a.overClearance ? 1 : a.noChange ? 0 : a.destructive ? 3 : 2;
      const bWeight = b.overClearance ? 1 : b.noChange ? 0 : b.destructive ? 3 : 2;
      return bWeight - aWeight;
    });
  }, [rows]);

  const approved = screen === 'approved' || screen === 'isso-pending';

  return (
    <div className={styles['changeset']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt={SIMULATE_ADMIN.name}
        username={SIMULATE_ADMIN.username}
        categories={GMP_SIDEBAR_CATEGORIES}
        activeItemId={active}
        onItemClick={handleSidebarClick}
      />

      <div className={styles['changeset__center']}>
        <ConsolePageHeader
          title={`Review changeset — ${policyName}`}
          subtitle="The exact membership changes this policy would apply, as an approvable diff"
          backButton
          onBack={() => navigate(GMP_ROUTES.editor)}
        />

        <div className={styles['changeset__scroll']}>
          <div className={styles['changeset__page']}>
            {screen === 'error' ? (
              <SectionNotice
                type="Danger"
                icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                title="Changeset couldn’t be computed"
                description="The membership engine didn’t return a diff for this policy. No changes were made. Recompute to try again."
                primaryButtonLabel="Recompute"
                onPrimaryAction={compute}
              />
            ) : screen === 'idle' ? (
              <div className={styles['changeset__idle']}>
                <div className={styles['changeset__idle-icon']}>
                  <Icon size="32" glyph={<SourceBranchIcon />} />
                </div>
                <span className={styles['changeset__idle-title']}>
                  No changeset computed yet
                </span>
                <span className={styles['changeset__idle-body']}>
                  Compute the changeset to review every membership change this policy would apply
                  — grouped by channel, line by line — before you save.
                </span>
                <Button
                  emphasis="Primary"
                  leadingIcon={<Icon size="16" glyph={<SourceBranchIcon />} />}
                  onClick={compute}
                >
                  Compute changeset
                </Button>
              </div>
            ) : screen === 'computing' ? (
              <div className={styles['changeset__computing']}>
                <Spinner size={20} />
                <span>Computing the membership diff across this policy’s scope…</span>
                <div className={styles['changeset__skeleton']}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={styles['changeset__skeleton-row']} />
                  ))}
                </div>
              </div>
            ) : screen === 'empty' ? (
              <EmptyState
                illustration={{ children: <LockedIllustration /> }}
                title="This policy changes nothing"
                description="Compared with current live membership, saving this policy would add or remove no one across its scope. There’s nothing to approve."
              />
            ) : isDiffVisible ? (
              <>
                {screen === 'stale' && (
                  <SectionNotice
                    type="Warning"
                    icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                    title="This changeset is out of date"
                    description="The policy was edited after this changeset was computed. Recompute to review the current diff before approving."
                    primaryButtonLabel="Recompute"
                    onPrimaryAction={compute}
                  />
                )}

                {approved && (
                  <SectionNotice
                    type={screen === 'isso-pending' ? 'Info' : 'Success'}
                    icon={
                      <Icon
                        size="20"
                        glyph={screen === 'isso-pending' ? <SendOutlineIcon /> : <CheckAllIcon />}
                      />
                    }
                    title={
                      screen === 'isso-pending'
                        ? 'Changeset routed to a second approver (ISSO)'
                        : 'Changeset approved — ready to save'
                    }
                    description={
                      screen === 'isso-pending'
                        ? CHANGESET_ISSO_NOTE
                        : 'This exact diff is locked. Continue to Save to apply it; the always-confirm gate will run next.'
                    }
                  />
                )}

                {/* Sticky summary bar — tallies the diff, does not replace it */}
                <div className={styles['changeset__summary']}>
                  <span className={styles['changeset__summary-item']}>
                    <span className={styles['changeset__summary-add']}>
                      +{totals.totalAdded}
                    </span>{' '}
                    across {totals.channelsAdding} channels
                  </span>
                  <span className={styles['changeset__summary-divider']} />
                  <span className={styles['changeset__summary-item']}>
                    <span className={styles['changeset__summary-remove']}>
                      −{totals.totalRemoved}
                    </span>{' '}
                    across {totals.channelsRemoving} channels
                  </span>
                  <span className={styles['changeset__summary-divider']} />
                  <span className={styles['changeset__summary-item']}>
                    {totals.skipped} skipped
                  </span>
                  <span className={styles['changeset__summary-divider']} />
                  <span className={styles['changeset__summary-item']}>
                    {totals.overClearanceChannels} above clearance (±
                    {totals.overClearanceRemovalBand} banded)
                  </span>
                  <span className={styles['changeset__summary-spacer']} />
                  <button
                    type="button"
                    className={[
                      styles['changeset__filter'],
                      removalsOnly ? styles['changeset__filter--on'] : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setRemovalsOnly((v) => !v)}
                  >
                    {removalsOnly ? 'Showing removals only' : 'Show removals only'}
                  </button>
                </div>

                {/* The diff document itself — the artifact */}
                <div className={styles['changeset__doc']}>
                  <Scrollbars style={{ maxHeight: 460 }}>
                    <div className={styles['changeset__doc-inner']}>
                      {orderedRows
                        .filter((r) =>
                          removalsOnly
                            ? r.overClearance || r.removed.length > 0
                            : true,
                        )
                        .map((row) => (
                          <ChannelSection
                            key={row.channel.id}
                            row={row}
                            removalsOnly={removalsOnly}
                            defaultOpen={
                              !row.noChange && !row.overClearance && row.removed.length > 0
                            }
                          />
                        ))}
                    </div>
                  </Scrollbars>
                </div>

                {/* Approve / reject actions */}
                {!approved && (
                  <div className={styles['changeset__actions']}>
                    <div className={styles['changeset__audit']}>
                      <Icon size="12" glyph={<InformationOutlineIcon />} />
                      <span>
                        This changeset was recorded with the policy hash. View audit log.
                      </span>
                    </div>
                    <div className={styles['changeset__action-buttons']}>
                      <Button
                        emphasis="Tertiary"
                        leadingIcon={<Icon size="16" glyph={<RefreshIcon />} />}
                        onClick={compute}
                      >
                        Recompute
                      </Button>
                      <Button
                        emphasis="Secondary"
                        leadingIcon={<Icon size="16" glyph={<SendOutlineIcon />} />}
                        onClick={() => setScreen('isso-pending')}
                      >
                        Route to ISSO
                      </Button>
                      <Button
                        emphasis="Primary"
                        leadingIcon={<Icon size="16" glyph={<CheckAllIcon />} />}
                        onClick={() => setScreen('approved')}
                      >
                        Approve changeset → continue to Save
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
