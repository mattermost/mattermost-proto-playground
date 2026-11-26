// [AI DRAFT] The Permission Policy page.
//
// Layout and shipped strings follow the v1 handoff editor
// (admin.permission_policies.edit.*). The Simple-mode rules editor is passed
// in (A′ "Extend in place"; B′ is archived).
//
// Round 1 designer feedback (2026-10-29):
//   F3  rules first: any attribute at any time; the rules limit permissions,
//       and rules no permission fits are an error in the rules section
//   F6  warnings sit behind one "N warnings" button beside "Explain this
//       policy" (round 1.2); only blocking errors show up front
//   F7  "What this policy does" is behind "Explain this policy" (no hint, round 1.2)
//   F8  unavailable options are gathered at the end of menus (MenuCell)
//
// Round 2 (design sync, 2026-10-29):
//   M1  three sections: Who this applies to (the role) · Policy expression
//       (the rules) · Permissions. The role says who; the rules say when.
//
// Designer mock (2026-10-31): a Policy details card (name and description)
// replaces the inline name and the info banner; Simple | Advanced replaces
// "Switch to … Mode"; and the Sections rail holds "What this policy does".
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import CodeTagsIcon from '@mattermost/compass-icons/components/code-tags';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TableLargeIcon from '@mattermost/compass-icons/components/table-large';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { AdminConsoleHeader } from '@mattermost/compass-ui/components/admin-console-header';
import { AdminPanel } from '@mattermost/compass-ui/components/admin-panel';
import { AdminPanelFooter } from '@mattermost/compass-ui/components/admin-panel-footer';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { SectionNotice } from '@mattermost/compass-ui/components/section-notice';
import { Select } from '@mattermost/compass-ui/components/select';
import { Tabs, type TabItem } from '@mattermost/compass-ui/components/tabs';
import { Tooltip } from '@mattermost/compass-ui/components/tooltip';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import { Toast } from '@mattermost/compass-ui/components/toast';
import type { PartyId } from '../model/catalog';
import { parseCel, type GroupingMode, type ParseResult } from '../model/celParse';
import { newlyAllowedPairs, noOnePasses, type NewlyAllowed, type NoOnePasses } from '../model/behaviourDiff';
import {
  PERMISSIONS,
  PERMISSION_GROUPS,
  availableParties,
  combinationSupported,
  conflictsFor,
  placeOf,
  worksWith,
  type PermissionId,
  type ResourceMode,
} from '../model/permissions';
import {
  allRules,
  isIncomplete,
  partiesInUse,
  prune,
  toCel,
  wideningReasons,
  type Group,
  type Policy,
  type RoleId,
} from '../model/rules';
import type { CoachPatch, PolicyBuild } from '../model/policyCoach';
import type { Vocabulary } from '../model/vocabulary';
import {
  ADVANCED,
  AI,
  CANONICAL,
  COACH,
  IMPACT,
  NO_ONE,
  PAGE,
  PICKER,
  RAIL,
  READBACK,
  RULES_ERROR,
  SAVE_BLOCK,
  VIEWS,
  WARNINGS,
  WIDENING,
} from '../copy';
import AdvancedEditor from './AdvancedEditor';
import CreateWithAi from './CreateWithAi';
import PolicyCoach from './PolicyCoach';
import { ExplainBox, ExplainPanel, ExplainSummary } from './Explain';
import { explain as explainOf, type ExplainPlacement } from './explanation';
import MenuCell, { type MenuGroup } from './MenuCell';
import { impactLines, noOneLines, provenLooser, vocabForRole, wideningText } from './pageHelpers';
import SectionsRail, { type RailSection } from './SectionsRail';
import editor from './RuleEditor.module.scss';
import styles from './PolicyPage.module.scss';

export type { ResourceMode };

export interface SimpleEditorProps {
  policy: Policy;
  onRootChange: (root: Group) => void;
  vocab: Vocabulary;
  grouping: GroupingMode;
  resourceMode: ResourceMode;
  /** Parties rules may use right now (rules first). */
  parties: PartyId[];
  /** Scene support: open "+ Add attribute" on load. */
  addMenuOpen?: boolean;
  /** Scene support: start that menu with a search (M6). */
  addMenuQuery?: string;
  /** Scene support: open the first row's value menu on load. */
  valueMenuOpen?: boolean;
  /** Scene support: open the first rule's row menu, or show "Ungrouped · Undo". */
  rowMenuOpen?: boolean;
  initialUndo?: Group;
}

export interface PolicyPageProps {
  policy: Policy;
  onChange: (next: Policy) => void;
  vocab: Vocabulary;
  grouping: GroupingMode;
  renderSimple: (props: SimpleEditorProps) => ReactNode;
  initialAdvanced?: boolean;
  initialCel?: string;
  initialPickerOpen?: boolean;
  onSimulate?: (root: Group) => void;
  /** Save, when there is something to confirm (D5-6). `cel` is set when the expression has no tree. */
  /** Returns true when it opened a confirmation; otherwise the page confirms the save itself. */
  onSave?: (widening: string[], root: Group, cel?: string, pairs?: NewlyAllowed) => boolean | void;
  allowWhen?: boolean;
  initialAddMenuOpen?: boolean;
  initialAddMenuQuery?: string;
  initialValueMenuOpen?: boolean;
  /** The saved version; "less strict" is judged against it (D5-1). */
  saved?: Policy;
  initialCanonicalNote?: boolean;
  /** Scene support: open the warnings bar or the explanation on load. */
  initialWarningsOpen?: boolean;
  initialExplainOpen?: boolean;
  initialRowMenuOpen?: boolean;
  initialUndo?: Group;
  /** Where "What this policy does" lives (round 2, M7 exploration). */
  explainPlacement?: ExplainPlacement;
  /**
   * Authoring layout only. Keeps the sections rail, policy details, the
   * Simple | Advanced switch, the rules table, and the permissions card.
   * Leaves out the policy description, Create with AI, the "What this policy
   * does" card, and the save, advanced-editor, and simulate updates.
   */
  authoringOnly?: boolean;
}

const ROLES: RoleId[] = ['Members', 'Guests', 'Bot accounts'];
const RULES_FIRST: ResourceMode = 'per-rule';

function listJoin(items: string[]): string {
  if (items.length <= 2) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/* ------------------------------------------------------------------ */
/* Chrome                                                              */
/* ------------------------------------------------------------------ */

/** The workspace scrolls inside a Compass Scrollbar; scenes and the rail find it by this marker. */
function markScroller(el: HTMLDivElement | null) {
  el?.setAttribute('data-prb-scroll', '');
}

/**
 * One section of the page: a Compass Admin Panel (the System Console header
 * rail, its spacing, and a working collapse). The wrapper is the anchor the
 * Sections rail scrolls to.
 */
function Panel({
  section,
  title,
  subtitle,
  writing,
  children,
}: {
  section: string;
  title: string;
  subtitle?: string;
  /** A prompt is writing this card. */
  writing?: boolean;
  children: ReactNode;
}) {
  return (
    <div id={`prb-${section}`} data-prb-section={section} className={styles['policy-page__section']}>
      <AdminPanel
        title={title}
        subtitle={subtitle}
        expandable
        defaultExpandedState="expanded"
        className={styles['policy-page__panel']}
      >
        {children}
      </AdminPanel>
      {writing ? <div className={styles['policy-page__sheen']} data-sheen={section} aria-hidden /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Warnings bar (F6)                                                   */
/* ------------------------------------------------------------------ */

/** One per edit: the sample-pairs line is evidence, not another warning (CUX1-7, QA1-8). */
function warningCount(widening: string[], impact: string[], noOne: NoOnePasses): number {
  return widening.filter((w) => w !== 'pairs').length + impact.length + (noOne.permissions.length ? 1 : 0);
}

/**
 * What the Warnings button opens (round 1.2: a button beside Simulate, not a
 * full-width bar): one Compass Section Notice per kind, warning tone for what
 * Save will ask about, info for missing values. Kept mounted so open and
 * close animate.
 */
function WarningsPanel({
  open,
  widening,
  impact,
  pairs,
  noOne,
  unfinished,
  role,
  vocab,
}: {
  open: boolean;
  widening: string[];
  impact: string[];
  pairs: NewlyAllowed;
  noOne: NoOnePasses;
  /** Unfinished rules the admin has left behind. */
  unfinished: number;
  role: RoleId;
  vocab: Vocabulary;
}) {
  const proven = provenLooser(widening);
  return (
    <div
      id="prb-warnings"
      className={[styles['policy-page__collapse'], open ? styles['policy-page__collapse--open'] : ''].join(' ')}
      aria-hidden={!open}
    >
      <div className={styles['policy-page__collapse-inner']}>
        <div className={styles['policy-page__warnings']}>
          {unfinished > 0 ? (
            <SectionNotice
              type="warning"
              icon={<Icon glyph={<AlertOutlineIcon />} />}
              title={WARNINGS.unfinished(unfinished)}
              description={WARNINGS.unfinishedBody}
            />
          ) : null}
          {/* First: no one gets these permissions at all (M4, M8). */}
          {noOne.permissions.length ? (
            <SectionNotice
              type="warning"
              icon={<Icon glyph={<AlertOutlineIcon />} />}
              title={noOne.all ? NO_ONE.title : NO_ONE.titleSome}
              description={
                <>
                  <ul className={styles['policy-page__list']}>
                    {noOneLines(noOne, role, vocab).map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                  <p className={styles['policy-page__warnings-note']}>{NO_ONE.body}</p>
                </>
              }
            />
          ) : null}
          {widening.length ? (
            <SectionNotice
              type="warning"
              icon={<Icon glyph={<AlertOutlineIcon />} />}
              title={proven ? WIDENING.title : WIDENING.titleChanged}
              description={
                <ul className={styles['policy-page__list']}>
                  {widening.map((w) => (
                    <li key={w}>{wideningText(w, pairs, vocab)}</li>
                  ))}
                </ul>
              }
            />
          ) : null}
          {impact.length ? (
            <SectionNotice
              type="warning"
              icon={<Icon glyph={<AlertOutlineIcon />} />}
              title={IMPACT.title}
              description={
                <>
                  <ul className={styles['policy-page__list']}>
                    {impact.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                  <p className={styles['policy-page__warnings-note']}>{IMPACT.body}</p>
                </>
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Permissions card                                                    */
/* ------------------------------------------------------------------ */

/** Why a permission doesn't fit: what the first party it lacks works with (M5). */
function notFit(missing: PartyId[], vocab: Vocabulary): string {
  return PICKER.worksWith(vocab.party[missing[0]], worksWith(missing[0]));
}

function permissionMenu(policy: Policy, vocab: Vocabulary, inUse: PartyId[]): MenuGroup[] {
  return PERMISSION_GROUPS.map((g) => ({
    heading: g.label,
    options: PERMISSIONS.filter((p) => p.group === g.id && !policy.permissions.includes(p.id)).map(
      (p) => {
        const missing = conflictsFor(p.id, inUse);
        return {
          value: p.id,
          label: p.label,
          description: p.description,
          // A permission that can't hold the rules is unavailable (F3); MenuCell
          // gathers it under "Not available" (F8), saying what the rules need (M5).
          disabledReason: missing.length ? notFit(missing, vocab) : undefined,
        };
      },
    ),
  })).filter((g) => g.options.length > 0);
}

function PermissionsCard({
  policy,
  onChange,
  vocab,
  inUse,
  initialPickerOpen,
  explainFor,
  writing,
}: {
  policy: Policy;
  onChange: (next: Policy) => void;
  vocab: Vocabulary;
  inUse: PartyId[];
  initialPickerOpen: boolean;
  /** M7 "In Permissions": each row says when it's allowed. */
  explainFor?: (p: PermissionId) => string | null;
  writing?: boolean;
}) {
  const [open, setOpen] = useState(initialPickerOpen);
  const rows = PERMISSIONS.filter((p) => policy.permissions.includes(p.id));
  return (
    <>
      <Panel section="permissions" title={PAGE.permissionsTitle} subtitle={PAGE.permissionsSubtitle} writing={writing}>
        <div className={editor['policy-editor__table-wrap']}>
          <table className={[editor['policy-editor__table'], styles['policy-page__permissions-table']].join(' ')}>
            <thead>
              <tr>
                <th className={rows.length ? styles['policy-page__col-permission'] : undefined}>Permission</th>
                {rows.length ? <th>Description</th> : null}
                {rows.length ? (
                  <th className={[editor['policy-editor__table-right'], styles['policy-page__col-action']].join(' ')} />
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className={editor['policy-editor__empty-cell']}>
                    {inUse.length > 0 && !combinationSupported(inUse) ? PAGE.noPermissionsRulesError : PAGE.noPermissions}
                  </td>
                </tr>
              ) : (
                rows.map((p) => {
                  const missing = conflictsFor(p.id, inUse);
                  return (
                    <tr
                      key={p.id}
                      className={missing.length ? styles['policy-page__row--flagged'] : undefined}
                    >
                      <td>
                        <span className={editor['policy-editor__permission-name']}>{p.label}</span>
                        {missing.length ? (
                          <span className={styles['policy-page__row-flag']} role="note">
                            <Icon glyph={<AlertCircleOutlineIcon />} size="12" />
                            <span>{PICKER.rowMissing(listJoin(missing.map((x) => vocab.party[x])))}</span>
                          </span>
                        ) : null}
                      </td>
                      <td className={editor['policy-editor__muted']}>
                        {p.description}
                        {explainFor && !missing.length && explainFor(p.id) ? (
                          <span className={styles['policy-page__row-explain']}>
                            <Icon glyph={<LightbulbOutlineIcon />} size="12" />
                            {explainFor(p.id)}
                          </span>
                        ) : null}
                      </td>
                      <td className={editor['policy-editor__table-right']}>
                        <IconButton
                          size="small"
                          destructive
                          icon={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
                          aria-label={`Remove ${p.label}`}
                          onClick={() =>
                            onChange({
                              ...policy,
                              permissions: policy.permissions.filter((x) => x !== p.id),
                            })
                          }
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className={editor['policy-editor__table-footer']}>
            <MenuCell
              ariaLabel="Add permission menu"
              groups={permissionMenu(policy, vocab, inUse)}
              selected={[]}
              defaultOpen={initialPickerOpen}
              onOpenChange={setOpen}
              menuClassName={styles['policy-page__picker']}
              onSelect={(id) =>
                onChange({ ...policy, permissions: [...policy.permissions, id as PermissionId] })
              }
              renderTrigger={({ open: isOpen, toggle }) => (
                <Button
                  emphasis="tertiary"
                  size="small"
                  leadingIcon={<Icon glyph={<PlusIcon />} />}
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  onClick={toggle}
                >
                  {PAGE.addPermission}
                </Button>
              )}
            >
              {null}
            </MenuCell>
          </div>
        </div>
      </Panel>
      {open ? <div className={styles['policy-page__runway']} aria-hidden /> : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

export default function PolicyPage({
  policy,
  onChange,
  vocab: baseVocab,
  grouping,
  renderSimple,
  initialAdvanced = false,
  initialCel,
  initialPickerOpen = false,
  onSimulate,
  onSave,
  allowWhen = false,
  initialAddMenuOpen = false,
  initialAddMenuQuery,
  initialValueMenuOpen = false,
  saved: savedProp,
  initialCanonicalNote = false,
  initialWarningsOpen = false,
  initialExplainOpen = false,
  initialRowMenuOpen = false,
  initialUndo,
  explainPlacement: explainPlacementProp = 'summary',
  authoringOnly = false,
}: PolicyPageProps) {
  // The authoring variation always uses the sections rail, never an
  // explanation placement.
  const explainPlacement = authoringOnly ? 'rail' : explainPlacementProp;
  // Memoised: a new object each render fed the effect below and looped (QA1-1).
  const vocab = useMemo(
    () => vocabForRole(baseVocab, policy.role),
    [baseVocab, policy.role],
  );
  // Channel and Direct or group message are both `resource.` in CEL (M3,
  // [VERIFY WITH Eng] E-8): read it as the one this policy is about.
  const usedParties = partiesInUse(policy.root);
  const aboutMessages =
    policy.permissions.some((p) => placeOf(p) === 'dm') ||
    usedParties.includes('recipient') ||
    usedParties.includes('dm');
  const parseOpts = useMemo(
    () => ({ allowWhen, prefer: aboutMessages ? (['dm'] as PartyId[]) : [] }),
    [allowWhen, aboutMessages],
  );
  const [advanced, setAdvanced] = useState(initialAdvanced);
  const [cel, setCel] = useState(initialCel ?? toCel(policy.root, vocab));
  const [parsed, setParsed] = useState<ParseResult>(() =>
    parseCel(initialCel ?? toCel(policy.root, vocab), vocab, grouping, parseOpts),
  );
  const [savedInitial] = useState(() => savedProp ?? policy);
  const saved = savedProp ?? savedInitial;
  const [canonicalNote, setCanonicalNote] = useState(initialCanonicalNote);
  // null until the admin toggles it. When the table can't show the
  // expression, the explanation is the only plain view, so it starts open (CUX1-3).
  const [explainPref, setExplain] = useState<boolean | null>(initialExplainOpen ? true : null);
  const authored = useRef<string | null>(initialCel ?? null);
  const [savedToast, setSavedToast] = useState(false);
  const [warningsOpen, setWarningsOpen] = useState(initialWarningsOpen);
  // Warnings about an unfinished rule wait until the admin leaves it: another
  // section, or a new rule while this one still has no value.
  const sawRules = useRef(false);
  const [awayFromRules, setAwayFromRules] = useState(false);
  // M7 "Three views": Plain language is a read-only view of the same expression.
  const [plain, setPlain] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  // Set while a prompt is writing one or more section cards.
  const [building, setBuilding] = useState<PolicyBuild | null>(null);
  // The last rule tree any parse produced, for the out-of-date summary (UX2-2).
  const [lastGood, setLastGood] = useState<Group | null>(null);
  // Not part of what the policy does, so it stays on the page (designer mock).
  const [description, setDescription] = useState('');
  useEffect(() => {
    if (!savedToast) return undefined;
    const t = window.setTimeout(() => setSavedToast(false), 4000);
    return () => window.clearTimeout(t);
  }, [savedToast]);

  useEffect(() => {
    if (advanced) return;
    const next = toCel(policy.root, vocab);
    setCel(next);
    setParsed(parseCel(next, vocab, grouping, parseOpts));
  }, [policy.root, vocab, grouping, advanced, parseOpts]);

  // Latched: once opened for a complex expression it stays open while the
  // admin types, even through keystrokes that briefly break it (CUX2-5).
  const [autoOpened, setAutoOpened] = useState(false);
  if (!autoOpened && explainPref === null && advanced && parsed.kind === 'complex') setAutoOpened(true);
  const explain = explainPref ?? autoOpened;
  const liveRoot: Group | null = advanced
    ? parsed.kind === 'simple'
      ? parsed.root
      : parsed.kind === 'complex'
        ? (parsed.root ?? null)
        : null
    : policy.root;
  const live = { ...policy, root: liveRoot ?? policy.root };
  useEffect(() => {
    if (liveRoot) setLastGood(liveRoot);
  }, [liveRoot]);
  const inUse = partiesInUse(live.root);
  const inUseKey = inUse.join(',');
  const permKey = policy.permissions.join(',');
  // Rules first in an empty policy; chosen permissions narrow it (M3).
  const parties = useMemo(
    () => availableParties(inUse, policy.permissions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inUseKey, permKey],
  );

  // Blocking error, shown up front (F3, F6): rules no permission can hold together.
  const rulesError = inUse.length > 0 && !combinationSupported(inUse);
  const mismatched = rulesError
    ? []
    : policy.permissions.filter((p) => conflictsFor(p, inUse).length > 0);

  const unverifiable = advanced && parsed.kind === 'complex' && !parsed.root;
  // No complete rule: Save is blocked, so there's no "less strict" to show (designer, round 1.1).
  const hasRules = allRules(prune(live.root)).length > 0;
  const pairs = useMemo(
    () =>
      liveRoot && !unverifiable && !rulesError && hasRules
        ? newlyAllowedPairs(saved, live)
        : { count: 0, unit: 'pairs' as const },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [liveRoot, policy.permissions, policy.role, saved, unverifiable, rulesError, hasRules],
  );
  // Rows with no value yet aren't part of the policy (QA1-7).
  // Saving needs a permission, so a saved version with none was never saved:
  // nothing to be less strict than (QA2-3). Kept here, so the table's
  // edit-to-edit warnings still work before a permission is added (QA3-2).
  const structural = unverifiable
    ? ['unverifiable']
    : liveRoot && saved.permissions.length > 0 && hasRules
      ? wideningReasons(saved, { ...live, root: prune(live.root) })
      : [];
  const widening = pairs.count > 0 ? [...structural, 'pairs'] : structural;
  // Complete rules only. A row still being filled in is not part of the policy yet.
  const impact = liveRoot ? impactLines(prune(live.root), vocab) : [];
  // Live as the admin edits, like the other warnings (M4).
  const noOne = useMemo(
    () =>
      liveRoot && !unverifiable && !rulesError && hasRules
        ? noOnePasses(live)
        : { permissions: [], all: false, values: [] },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [liveRoot, policy.permissions, policy.role, unverifiable, rulesError, hasRules],
  );
  const warnCount = rulesError ? 0 : warningCount(widening, impact, noOne);

  const issues: string[] = [];
  if (advanced && parsed.kind === 'error') issues.push(SAVE_BLOCK.celError);
  if (rulesError) issues.push(SAVE_BLOCK.rulesError);
  // A permission policy needs at least one rule (designer, round 1.1).
  if (allRules(live.root).length === 0 && !(advanced && parsed.kind === 'error')) issues.push(SAVE_BLOCK.noRules);
  const incompleteRules = allRules(live.root).filter(isIncomplete);
  const incomplete = incompleteRules.length;
  if (incomplete) issues.push(SAVE_BLOCK.incomplete(incomplete));
  // The rule being edited stays quiet. The ones left behind — by leaving the
  // section, or by starting another rule — are the warning.
  const unfinished = awayFromRules ? incomplete : Math.max(0, incomplete - (incomplete > 0 ? 1 : 0));
  const visibleWarnings = warnCount + (unfinished > 0 ? 1 : 0);
  // The button unmounts while a warning is quiet. Don't reopen the panel
  // when the warning comes back; the admin opens it.
  useEffect(() => {
    if (visibleWarnings === 0) setWarningsOpen(false);
  }, [visibleWarnings]);
  if (mismatched.length) issues.push(SAVE_BLOCK.mismatched(mismatched.length));
  // A policy with no permissions saves, as in v1 (designer, round 1.3). It
  // changes nothing until a permission is added.

  // Simulate needs an action, and an expression it can run (QA1-6).
  const simulateBlock = !liveRoot
    ? parsed.kind === 'error'
      ? ADVANCED.simulateHint
      : ADVANCED.simulateComplexHint
    : rulesError
      ? ADVANCED.simulateRulesError
      : policy.permissions.length === 0
        ? ADVANCED.simulateNoPermission
        : !hasRules
          ? ADVANCED.simulateNoRule
          : null;
  const resourceLabels = inUse
    .filter((p) => p !== 'user' && p !== 'session')
    .map((p) => vocab.party[p]);

  // The same explanation, built from the rules, in whichever placement (M7).
  const celError = advanced && parsed.kind === 'error';
  const explanation = explainOf(policy, vocab, liveRoot, { error: celError, rulesError });
  const expressionHelp = PAGE.expressionSubtitle(vocab.noun.user, vocab.noun.recipient);
  // Live summary: while the expression doesn't parse, keep the last reading
  // that did, from any parse that gave rules (UX1-1, UX2-2), marked out of date.
  const summary = celError ? explainOf(policy, vocab, lastGood ?? policy.root) : explanation;
  const explainFor = (p: PermissionId) =>
    explanation.pending || rulesError ? null : explainOf({ ...policy, permissions: [p] }, vocab, liveRoot).sentence;
  const toAdvanced = () => {
    const canonical = toCel(policy.root, vocab);
    if (authored.current !== null && norm(authored.current) !== norm(canonical)) {
      setCanonicalNote(true);
    }
    authored.current = null;
    setAdvanced(true);
  };
  const toSimple = () => {
    if (parsed.kind !== 'simple') return;
    authored.current = cel;
    onChange({ ...policy, root: parsed.root });
    setAdvanced(false);
    setCanonicalNote(false);
  };
  const applyAiRoot = (root: Group) => {
    onChange({ ...policy, root });
    const next = toCel(root, vocab);
    setCel(next);
    setParsed(parseCel(next, vocab, grouping, parseOpts));
    authored.current = null;
    setCanonicalNote(false);
  };
  const applyCoach = (patch: CoachPatch) => {
    const nextPolicy = {
      ...policy,
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.role ? { role: patch.role } : {}),
      ...(patch.permissions ? { permissions: patch.permissions } : {}),
      ...(patch.root ? { root: patch.root } : {}),
    };
    onChange(nextPolicy);
    if (patch.description !== undefined) setDescription(patch.description);
    if (patch.root) {
      const nextVocab = vocabForRole(baseVocab, nextPolicy.role);
      const next = toCel(patch.root, nextVocab);
      setCel(next);
      setParsed(parseCel(next, nextVocab, grouping, parseOpts));
      authored.current = null;
      setCanonicalNote(false);
    }
  };

  // The Sections rail (designer mock): a section says when it has an error.
  // Warnings stay on the rules card. The coach overlays this column, so the
  // rail stays when it opens.
  const rail = explainPlacement === 'rail';
  const showRail = rail;
  const railSections: RailSection[] = [
    { id: 'details', label: PAGE.detailsTitle },
    { id: 'who', label: PAGE.whoTitle },
    {
      id: 'rules',
      label: PAGE.expressionTitle,
      status: rulesError || celError ? { tone: 'danger', label: RAIL.error } : undefined,
    },
    {
      id: 'permissions',
      label: PAGE.permissionsTitle,
      status: mismatched.length ? { tone: 'danger', label: RAIL.error } : undefined,
    },
  ];

  // Save lives in the Compass footer. Its status lane names what blocks Save
  // (error), or what the confirmation will ask about (warning, M4, M8).
  // A form nothing has been written in just has Save disabled; the status
  // appears once there's something half-done to name (Compass: "No status").
  const untouched = issues.length === 1 && issues[0] === SAVE_BLOCK.noRules && policy.permissions.length === 0;
  // Those warnings preview the updated save confirmation. The authoring
  // variation keeps the existing footer: errors that block Save, nothing else.
  const savePreview = !authoringOnly && (noOne.permissions.length > 0 || provenLooser(widening));
  const footerStatus: 'none' | 'warning' | 'error' = untouched
    ? 'none'
    : issues.length
      ? 'error'
      : savePreview
        ? 'warning'
        : 'none';
  const footerMessage = issues.length
    ? issues.join(' ')
    : !authoringOnly && noOne.permissions.length
      ? `${noOne.all ? NO_ONE.title : NO_ONE.titleSome}.`
      : !authoringOnly && provenLooser(widening)
        ? WIDENING.title
        : undefined;
  const writing = (section: PolicyBuild['sections'][number]) => Boolean(building?.sections.includes(section));
  const save = () => {
    if (building || issues.length > 0) return;
    const confirming = onSave?.(widening, live.root, liveRoot ? undefined : cel, pairs);
    // Nothing to confirm: say it saved, rather than nothing at all (QA1-15).
    if (!confirming) setSavedToast(true);
  };
  // Three views keep Compass Tabs. Every other placement is the labelled
  // switch: Advanced (code) | Simple (table). Simple waits while the
  // expression can't be a table; the status under the editor says why.
  const modeTabs: TabItem[] = [
    { key: 'simple', label: VIEWS.simple, id: 'prb-view-simple', panelId: 'prb-rules-view' },
    { key: 'plain', label: VIEWS.plain, id: 'prb-view-plain', panelId: 'prb-rules-view' },
    { key: 'advanced', label: VIEWS.advanced, id: 'prb-view-advanced', panelId: 'prb-rules-view' },
  ];
  const activeView = explainPlacement === 'views' && plain ? 'plain' : advanced ? 'advanced' : 'simple';
  // Compass Tabs has no disabled state, so mark Simple on the tab itself while
  // the expression can't be a table, pointing at the reason under the editor.
  const simpleBlocked = advanced && parsed.kind !== 'simple';
  // Leaving Policy expression, after having been on it, is what makes an
  // unfinished rule worth a warning. The first measurement can be another
  // section before the page scrolls to the rules.
  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>('[data-prb-scroll]');
    if (!scroller) return undefined;
    const update = () => {
      const view = scroller.getBoundingClientRect();
      const seen = (id: string) => {
        const box = scroller.querySelector(`[data-prb-section="${id}"]`)?.getBoundingClientRect();
        if (!box) return 0;
        return Math.max(0, Math.min(box.bottom, view.bottom) - Math.max(box.top, view.top));
      };
      const rulesSeen = seen('rules');
      const other = Math.max(seen('details'), seen('who'), seen('permissions'));
      if (rulesSeen > 40) sawRules.current = true;
      if (!sawRules.current) return;
      // Another section sharing the view is leaving the rule, even when the
      // rules card is still the taller of the two.
      if (other > view.height * 0.2 && rulesSeen < view.height * 0.5) setAwayFromRules(true);
      else if (rulesSeen >= view.height * 0.5) setAwayFromRules(false);
    };
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    return () => scroller.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    const tab = document.getElementById('prb-view-simple');
    if (!tab) return;
    if (simpleBlocked) {
      tab.setAttribute('aria-disabled', 'true');
      tab.setAttribute('aria-describedby', 'prb-cel-status');
    } else {
      tab.removeAttribute('aria-disabled');
      tab.removeAttribute('aria-describedby');
    }
  }, [simpleBlocked]);

  return (
    // policy-editor scopes the shared editor styles (e.g. a blocked button).
    <div
      className={[styles['policy-page'], editor['policy-editor'], coachOpen ? styles['policy-page--coach'] : ''].join(' ')}
    >
      <div className={styles['policy-page__column']}>
      <AdminConsoleHeader
        title={PAGE.title}
        showBack
        ariaLabelBack={PAGE.back}
        trailing={
          authoringOnly ? undefined : (
            <Button
              emphasis="tertiary"
              size="small"
              aria-expanded={coachOpen}
              aria-controls="prb-coach"
              leadingIcon={<Icon glyph={<CreationOutlineIcon />} />}
              onClick={() => setCoachOpen((open) => !open)}
            >
              {COACH.title}
            </Button>
          )
        }
      />
      <div className={styles['policy-page__body']}>
      <Scrollbar className={styles['policy-page__scroll']} ref={markScroller}>
        {/* The Sections rail (designer) and M7 "Side panel" each put a column
            beside the panels; every other placement is the single column. */}
        <div
          className={[
            styles['policy-page__workspace'],
            showRail ? styles['policy-page__workspace--rail'] : '',
            explainPlacement === 'panel' ? styles['policy-page__workspace--panel'] : '',
          ].join(' ')}
          aria-busy={building ? true : undefined}
          inert={building ? true : undefined}
        >
          {showRail ? (
            <SectionsRail sections={railSections}>
              {/* While the expression doesn't parse, the last reading that did,
                  marked out of date (UX1-1); under a rules error, what to fix. */}
              {authoringOnly ? null : (
                <ExplainPanel
                  e={celError ? summary : explanation}
                  vocab={vocab}
                  stale={celError}
                  blocked={rulesError}
                  muted={explanation.pending && policy.permissions.length === 0}
                />
              )}
            </SectionsRail>
          ) : null}

          <div className={styles['policy-page__panels']}>
            <Panel section="details" title={PAGE.detailsTitle} subtitle={PAGE.detailsSubtitle} writing={writing('details')}>
              <div className={styles['policy-page__field']}>
                <label className={editor['policy-editor__field-label']} htmlFor="prb-name">
                  {PAGE.nameLabel}
                </label>
                <TextInput
                  id="prb-name"
                  value={policy.name}
                  placeholder={PAGE.namePlaceholder}
                  onChange={(e) => onChange({ ...policy, name: e.target.value })}
                />
              </div>
              {authoringOnly ? null : (
                <div className={styles['policy-page__field']}>
                  <label className={editor['policy-editor__field-label']} htmlFor="prb-description">
                    {PAGE.descriptionLabel}
                  </label>
                  <TextArea
                    id="prb-description"
                    rows={3}
                    value={description}
                    placeholder={PAGE.descriptionPlaceholder}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              )}
            </Panel>

            <Panel section="who" title={PAGE.whoTitle} subtitle={PAGE.whoSubtitle} writing={writing('who')}>
              <div className={styles['policy-page__field']}>
                <label className={editor['policy-editor__field-label']} htmlFor="prb-role">
                  {PAGE.roleLabel}
                </label>
                <Select
                  id="prb-role"
                  aria-label={PAGE.roleLabel}
                  value={policy.role}
                  onChange={(v) => onChange({ ...policy, role: v as RoleId })}
                  // Shipped role label: admin.permission_policies.role.system_guest.label (CON8).
                  options={ROLES.map((r) => ({ value: r, label: r === 'Guests' ? 'Guest users' : r }))}
                />
              </div>
            </Panel>

            <Panel section="rules" title={PAGE.expressionTitle} subtitle={expressionHelp} writing={writing('rules')}>
              {explainPlacement === 'summary' && !rulesError ? (
                // M7 Live summary: the reading leads the section. Under a rules
                // error the red notice says what to do instead (VIS1-5).
                <div className={styles['policy-page__summary']}>
                  <ExplainSummary e={summary} vocab={vocab} stale={celError} />
                </div>
              ) : null}

              <div className={styles['policy-page__mode']}>
                {explainPlacement === 'views' ? (
                  <div className={styles['policy-page__mode-bar']}>
                    <IconButton
                      size="small"
                      icon={<Icon glyph={<CreationOutlineIcon />} />}
                      aria-label={AI.title}
                      title={AI.title}
                      aria-expanded={aiOpen}
                      aria-controls="prb-ai"
                      toggled={aiOpen}
                      onClick={() => setAiOpen(!aiOpen)}
                    />
                    <Tabs
                      tabs={modeTabs}
                      activeKey={activeView}
                      onChange={(k) => {
                        if (k === 'plain') {
                          setPlain(true);
                          return;
                        }
                        setPlain(false);
                        if (k === 'advanced' && !advanced) toAdvanced();
                        if (k === 'simple' && advanced) toSimple();
                      }}
                    />
                  </div>
                ) : (
                  <div className={styles['policy-page__mode-bar']}>
                    <span className={styles['policy-page__mode-label']}>{PAGE.rulesLabel}</span>
                    <div className={styles['policy-page__mode-tools']}>
                      {authoringOnly ? null : (
                        <IconButton
                          className={styles['policy-page__ai-toggle']}
                          size="small"
                          icon={<Icon glyph={<CreationOutlineIcon />} />}
                          aria-label={AI.title}
                          title={AI.title}
                          aria-expanded={aiOpen}
                          aria-controls="prb-ai"
                          toggled={aiOpen}
                          onClick={() => setAiOpen(!aiOpen)}
                        />
                      )}
                      <div
                        className={styles['policy-page__mode-switch']}
                        role="tablist"
                        aria-label={PAGE.modeSwitch}
                      >
                      <button
                        type="button"
                        role="tab"
                        id="prb-view-advanced"
                        aria-selected={advanced}
                        aria-controls="prb-rules-view"
                        className={[
                          styles['policy-page__mode-option'],
                          advanced ? styles['policy-page__mode-option--active'] : '',
                        ].join(' ')}
                        onClick={() => {
                          setPlain(false);
                          if (!advanced) toAdvanced();
                        }}
                      >
                        <Icon glyph={<CodeTagsIcon />} size="16" />
                        {PAGE.modeAdvanced}
                      </button>
                      <button
                        type="button"
                        role="tab"
                        id="prb-view-simple"
                        aria-selected={!advanced}
                        aria-controls="prb-rules-view"
                        aria-disabled={simpleBlocked || undefined}
                        aria-describedby={simpleBlocked ? 'prb-cel-status' : undefined}
                        className={[
                          styles['policy-page__mode-option'],
                          !advanced ? styles['policy-page__mode-option--active'] : '',
                        ].join(' ')}
                        onClick={() => {
                          if (simpleBlocked) return;
                          setPlain(false);
                          if (advanced) toSimple();
                        }}
                      >
                        <Icon glyph={<TableLargeIcon />} size="16" />
                        {PAGE.modeSimple}
                      </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {aiOpen ? (
                <div id="prb-ai">
                  <CreateWithAi policy={policy} vocab={vocab} onApply={applyAiRoot} />
                </div>
              ) : null}

              <div
                id="prb-rules-view"
                role="tabpanel"
                aria-labelledby={`prb-view-${activeView}`}
                className={styles['policy-page__view']}
              >
                {explainPlacement === 'views' && plain ? (
                  <div className={styles['policy-page__plain']}>
                    <ExplainBox e={explanation} vocab={vocab} live />
                    <p className={styles['policy-page__hint-line']}>{VIEWS.readOnly}</p>
                  </div>
                ) : advanced ? (
                  <div className={styles['policy-page__advanced']}>
                    {!authoringOnly && canonicalNote ? (
                      <div className={styles['policy-page__inline-note']} role="status">
                        <Icon glyph={<InformationOutlineIcon />} size="16" />
                        {CANONICAL.note}
                      </div>
                    ) : null}
                    <AdvancedEditor
                      plain={authoringOnly}
                      value={cel}
                      vocab={vocab}
                      grouping={grouping}
                      parties={parties}
                      parseOptions={parseOpts}
                      statusId="prb-cel-status"
                      onChange={(text, result) => {
                        setCel(text);
                        setParsed(result);
                        if (result.kind === 'simple') onChange({ ...policy, root: result.root });
                      }}
                    />
                  </div>
                ) : (
                  renderSimple({
                    policy,
                    onRootChange: (root) => onChange({ ...policy, root }),
                    vocab,
                    grouping,
                    resourceMode: RULES_FIRST,
                    parties,
                    addMenuOpen: initialAddMenuOpen,
                    addMenuQuery: initialAddMenuQuery,
                    valueMenuOpen: initialValueMenuOpen,
                    rowMenuOpen: initialRowMenuOpen,
                    initialUndo,
                  })
                )}
              </div>

              {rulesError ? (
                // The one thing shown up front: a blocking error (F6).
                <div className={styles['policy-page__error']} role="alert">
                  <SectionNotice
                    type="danger"
                    icon={<Icon glyph={<AlertCircleOutlineIcon />} />}
                    title={RULES_ERROR.title}
                    description={RULES_ERROR.body(listJoin(resourceLabels), resourceLabels.length)}
                  />
                </div>
              ) : null}

              {/* Always mounted, so a change that loosens the policy is announced (QA1-5). */}
              <span role="status" className={styles['policy-page__visually-hidden']}>
                {rulesError
                  ? ''
                  : unfinished > 0
                    ? WARNINGS.announce(WARNINGS.unfinished(unfinished))
                    : noOne.permissions.length > 0
                      ? WARNINGS.announce(
                          noOne.all ? NO_ONE.title : NO_ONE.titleSome,
                          visibleWarnings > 1 ? WARNINGS.count(visibleWarnings) : undefined,
                        )
                      : widening.length > 0
                        ? WARNINGS.announce(
                            provenLooser(widening) ? WARNINGS.lessStrict : WARNINGS.changed,
                            visibleWarnings > 1 ? WARNINGS.count(visibleWarnings) : undefined,
                          )
                        : impact.length
                          ? WARNINGS.announce(impact[0], impact.length > 1 ? WARNINGS.more(impact.length - 1) : undefined)
                          : ''}
              </span>

              <div className={styles['policy-page__actions']}>
                {/* One thing at a time: under the blocking error there's no
                    Warnings button (CUX1-4). Warning colours, not link blue. */}
                {visibleWarnings > 0 ? (
                  <Button
                    emphasis="tertiary"
                    size="small"
                    className={styles['policy-page__warnings-button']}
                    leadingIcon={<Icon glyph={<AlertOutlineIcon />} />}
                    aria-expanded={warningsOpen}
                    aria-controls="prb-warnings"
                    onClick={() => setWarningsOpen(!warningsOpen)}
                  >
                    {WARNINGS.count(visibleWarnings)}
                  </Button>
                ) : null}
                {explainPlacement === 'button' ? (
                  <Button
                    emphasis="tertiary"
                    size="small"
                    aria-expanded={explain}
                    aria-controls="prb-explain"
                    leadingIcon={<Icon glyph={<LightbulbOutlineIcon />} />}
                    onClick={() => setExplain(!explain)}
                  >
                    {explain ? READBACK.hide : READBACK.show}
                  </Button>
                ) : null}
                <span className={styles['policy-page__simulate']}>
                  <Button
                    emphasis="tertiary"
                    size="small"
                    aria-disabled={simulateBlock ? true : undefined}
                    aria-describedby={simulateBlock ? 'prb-simulate-hint' : undefined}
                    className={simulateBlock ? editor['policy-editor__button--blocked'] : undefined}
                    onClick={() => {
                      if (liveRoot && !simulateBlock) onSimulate?.(liveRoot);
                    }}
                  >
                    {PAGE.simulate}
                  </Button>
                  {simulateBlock ? (
                    <span id="prb-simulate-hint" role="tooltip" className={styles['policy-page__simulate-tip']}>
                      <Tooltip label={simulateBlock} arrow="bottom" />
                    </span>
                  ) : null}
                </span>
              </div>

              <WarningsPanel
                open={warningsOpen && visibleWarnings > 0}
                widening={widening}
                impact={impact}
                pairs={pairs}
                noOne={noOne}
                unfinished={unfinished}
                role={policy.role}
                vocab={vocab}
              />

              {/* Below its trigger, so opening it doesn't move the button (CUX1-8,
                  CVIS1-3). Animated open and closed, never snapped. */}
              {explainPlacement === 'button' ? (
                <div
                  className={[styles['policy-page__collapse'], explain ? styles['policy-page__collapse--open'] : ''].join(' ')}
                  aria-hidden={!explain}
                >
                  <div className={styles['policy-page__collapse-inner']}>
                    {/* Kept mounted so the close animates; silent while hidden. */}
                    <ExplainBox
                      e={explanation}
                      vocab={vocab}
                      id="prb-explain"
                      live={!advanced && explain}
                      className={styles['policy-page__readback']}
                    />
                  </div>
                </div>
              ) : null}
            </Panel>

            <PermissionsCard
              policy={policy}
              onChange={onChange}
              vocab={vocab}
              inUse={inUse}
              initialPickerOpen={initialPickerOpen}
              explainFor={explainPlacement === 'permissions' ? explainFor : undefined}
              writing={writing('permissions')}
            />

            {/* One always-mounted announcement; the Toast's own status role is
                hidden so it isn't read twice (QA1-15). */}
            <span role="status" className={styles['policy-page__visually-hidden']}>
              {savedToast ? PAGE.saved : ''}
            </span>
            <div className={styles['policy-page__toast']} aria-hidden>
              {savedToast ? (
                <Toast message={PAGE.saved} type="success" onDismiss={() => setSavedToast(false)} />
              ) : null}
            </div>
          </div>

          {explainPlacement === 'panel' ? (
            <aside className={styles['policy-page__aside']} aria-label={READBACK.heading}>
              <ExplainBox e={explanation} vocab={vocab} live={!advanced} />
            </aside>
          ) : null}
        </div>
      </Scrollbar>
      </div>

      {explainPlacement === 'savebar' ? (
        // M7 Save bar: the summary pinned above Save.
        <div className={styles['policy-page__savebar']}>
          <ExplainSummary e={explanation} vocab={vocab} fallback={READBACK.pending} />
        </div>
      ) : null}
      <AdminPanelFooter
        saveLabel={PAGE.save}
        cancelLabel={PAGE.cancel}
        onSave={save}
        saveDisabled={issues.length > 0 || Boolean(building)}
        status={footerStatus}
        statusMessage={footerMessage}
      />
      <span role="status" className={styles['policy-page__visually-hidden']}>
        {building ? `${COACH.building}. ${building.line}` : ''}
      </span>
      </div>
      {!authoringOnly && coachOpen ? (
        <>
          <div className={styles['policy-page__coach-scrim']} aria-hidden onClick={() => setCoachOpen(false)} />
          <PolicyCoach
            policy={policy}
            description={description}
            vocab={vocab}
            onApply={applyCoach}
            onBuilding={setBuilding}
            onClose={() => setCoachOpen(false)}
          />
        </>
      ) : null}
    </div>
  );
}
