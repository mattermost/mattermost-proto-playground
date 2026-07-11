import {
  CHANNEL_ATTRIBUTES_PREVIEW,
  GMP_ROUTES,
} from '@/pages/GlobalMembershipPolicy/gmpConsole';

export type WalkthroughSection =
  | 'intro'
  | 'use-cases'
  | 'channel-attributes'
  | 'list'
  | 'save'
  | 'appendix';

export type WalkthroughRailGroup =
  | 'Membership requirements'
  | 'Where it applies';

export type WalkthroughPreview =
  | { kind: 'iframe'; path: string }
  | { kind: 'external'; url: string };

export type WalkthroughBullet =
  | string
  | { text: string; sub?: string[] };

export interface WalkthroughStep {
  id: string;
  section: WalkthroughSection;
  /** Nested label under List and editor in the jump rail. */
  railGroup?: WalkthroughRailGroup;
  title: string;
  useCase?: string;
  lead?: string;
  bullets: WalkthroughBullet[];
  lookFor: string[];
  callout?: string;
  preview: WalkthroughPreview;
}

export const WALKTHROUGH_SECTION_LABELS: Record<WalkthroughSection, string> = {
  intro: 'Why we need this',
  'use-cases': 'Customer stories',
  'channel-attributes': 'Channel attributes',
  list: 'List and editor',
  save: 'Save and impact',
  appendix: 'Scope and open items',
};

export function stepPanelLabel(step: WalkthroughStep): string {
  return step.railGroup ?? WALKTHROUGH_SECTION_LABELS[step.section];
}

function withFocus(path: string, focus: string): string {
  const join = path.includes('?') ? '&' : '?';
  return `${path}${join}focus=${encodeURIComponent(focus)}`;
}

const DS_EDITOR = `${GMP_ROUTES.editor}?policy=ds-program&state=populated`;
const DRAGON_EDITOR = `${GMP_ROUTES.editor}?policy=dragon-spacecraft&state=populated`;
const NORTHERN_EDITOR = `${GMP_ROUTES.editor}?policy=northern-command&state=populated`;
const NOFORN_EDITOR = `${GMP_ROUTES.editor}?policy=noforn-handling&state=populated`;
const LITERAL_DEMO_EDITOR = `${GMP_ROUTES.editor}?policy=literal-demo&state=populated`;

export const GMP_WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'why-gmp',
    section: 'intro',
    title: 'Why global membership policies',
    bullets: [
      'Current behavior: membership policies already exist in System Console (and as channel-local / team-scoped rules)',
      'Current behavior: requirements compare user attributes to literal values only — e.g. Clearance is at least Secret',
      'Current behavior: you assign each policy to channels by hand — no automatic coverage when channels are created or labeled',
      'Pain point: mixed-classification or program-scoped workspaces force duplicated rules, or constant re-attachment as channels grow',
      'What’s new: channel attributes in membership policies — metadata on the channel (Classification, Program, etc.) that policies can use',
      'Use 1 — requirements: compare a user attribute to a channel attribute (e.g. Clearance ≥ Channel:Classification)',
      'Use 2 — where it applies: target channels by attribute conditions, or all channels where referenced attributes are set — not only a manual list',
    ],
    lookFor: [
      'Membership policy table',
      'Add policy — opens the editor in later steps',
    ],
    preview: { kind: 'iframe', path: withFocus(GMP_ROUTES.list, 'policy-table') },
  },
  {
    id: 'ch-attr-what',
    section: 'channel-attributes',
    title: 'What are channel attributes?',
    bullets: [
      'Metadata stored on a channel — Classification, Program, Releasability, and more',
      'Configured in System Console → Manage Attributes; filter by Channels to see what channels can carry',
      'Values are assigned on each channel — by channel admins or other roles per the attribute’s who-can-set permission model',
      'Instead of manually picking channels in policies or authoring per-channel rules, use channel attributes so one policy applies smartly across matching channels',
      'Hero example — requirements: User:Clearance is at least Channel:Classification (Secret channels require Secret; Unclassified require Unclassified)',
      {
        text: 'Dragon Spacecraft example — program security officer covering every DS-labeled channel',
        sub: [
          'Requirements: User:Clearance is at least Channel:Classification and User:Program is Channel:Program',
          'Applies only where Program is Dragon Spacecraft — existing and new DS-labeled channels inherit the policy automatically; system admins attach nothing by hand',
        ],
      },
    ],
    lookFor: [
      'Attribute list with all details',
      'Resource filtered to Channels',
      'Click a row to edit an attribute, or New attribute to create one',
    ],
    preview: {
      kind: 'iframe',
      path: withFocus(CHANNEL_ATTRIBUTES_PREVIEW, 'attr-table'),
    },
  },
  {
    id: 'list-page',
    section: 'list',
    title: 'Membership Policies list',
    bullets: [
      'Four seed policies on the list mirror the customer stories later in this tour',
      'DS Program, Dragon Spacecraft, Northern Command, and NOFORN handling',
      'Applies to summarizes each policy’s channel/team scope',
      'Membership sync jobs show evaluation history below',
    ],
    lookFor: [
      'Sidebar — Membership Policies nav item',
      'Policy table — name, scope summary, row actions',
    ],
    preview: { kind: 'iframe', path: withFocus(GMP_ROUTES.list, 'sidebar-nav') },
  },
  {
    id: 'open-editor',
    section: 'list',
    title: 'Open the editor',
    useCase:
      'Walkthrough policy: DS Program — IL5 mixed-classification workspace (200+ channels)',
    bullets: [
      'Open DS Program from the list — the editor steps model this customer story',
      'Back in the header returns to the list; Cancel in the footer does the same',
      'Other list policies are revisited in Customer stories after this editor tour',
    ],
    lookFor: ['Full editor canvas — requirements at top, scope below'],
    preview: { kind: 'iframe', path: withFocus(DS_EDITOR, 'editor-overview') },
  },
  {
    id: 'policy-name',
    section: 'list',
    title: 'Name the policy',
    useCase:
      'Walkthrough policy: DS Program — IL5 mixed-classification workspace (200+ channels)',
    bullets: [
      'Name appears in the list and in save confirmations',
      'DS Program — program office running channels from Unclassified to TS/SCI',
    ],
    lookFor: ['Policy name text field'],
    preview: { kind: 'iframe', path: withFocus(DS_EDITOR, 'policy-name') },
  },
  {
    id: 'requirements-intro',
    section: 'list',
    railGroup: 'Membership requirements',
    title: 'Membership requirements',
    useCase:
      'Walkthrough policy: DS Program — clearance + program compartment requirements',
    bullets: [
      'Define who must qualify to stay in (or be recommended to) scoped channels',
      'Each row: user attribute → operator → value (literal or channel attribute)',
      'Operators change with attribute type (ranked, select, multiselect)',
      'Simple mode: row builder (default)',
      'Advanced mode: raw CEL for complex boolean logic',
    ],
    lookFor: ['Membership requirements panel — row builder and mode toggle'],
    preview: { kind: 'iframe', path: withFocus(DS_EDITOR, 'requirements') },
  },
  {
    id: 'hero-relative',
    section: 'list',
    railGroup: 'Membership requirements',
    title: 'Hero story: relative comparison',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'Set User:Clearance is at least Channel:Classification',
      'Each channel enforces its own bar from one policy',
      'Channel attributes in the value column render as distinct tokens (not literals)',
      'Main reason to reference channel attributes instead of one fixed clearance',
    ],
    lookFor: ['First requirement row — Channel:Classification token in the value column'],
    preview: { kind: 'iframe', path: withFocus(DS_EDITOR, 'hero-row') },
  },
  {
    id: 'literal-example',
    section: 'list',
    railGroup: 'Membership requirements',
    title: 'Literal rules (existing behavior)',
    useCase:
      'Already in the product: Confidential minimum for manually selected channels',
    bullets: [
      'Membership policies already support this — user attributes compared to literal values, not channel attributes',
      'Example: User:Clearance is at least Confidential for every channel in scope',
      'Scope is a manual channel list — the pattern system admins use in System Console today',
      'Channel attributes in requirement values are new in this release; literal rules work the same as before',
    ],
    lookFor: ['Requirement row with Confidential literal — fixed for all scoped channels'],
    preview: { kind: 'iframe', path: withFocus(LITERAL_DEMO_EDITOR, 'literal-row') },
  },
  {
    id: 'test-users',
    section: 'list',
    railGroup: 'Membership requirements',
    title: 'Test matching users',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'Run Test matching users before save to preview channel coverage and member match',
      'Summary: channels in scope, then how many members match requirements',
      'Channels missing a referenced attribute appear as excluded below the count',
      '[VERIFY] What details are technically feasible to show here beyond channel count and member match?',
    ],
    lookFor: [
      'Test matching users control',
      'Applies to N channels · X of Y members match requirements',
      'Excluded-channel message when a referenced attribute is not set',
    ],
    preview: {
      kind: 'iframe',
      path: withFocus(`${DS_EDITOR}&test=done`, 'test-users'),
    },
  },
  {
    id: 'where-tabs',
    section: 'list',
    railGroup: 'Where it applies',
    title: 'Where this policy applies',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'Second main section: pick which channels (and optionally teams) the policy covers',
      'Channels tab: full scope model in this release',
      'Teams tab: manual pick only — attribute-based team targeting is planned separately',
    ],
    lookFor: ['Where this policy applies section — Channels tab active'],
    preview: {
      kind: 'iframe',
      path: withFocus(`${DS_EDITOR}&tab=channels`, 'where-applies'),
    },
  },
  {
    id: 'scope-all',
    section: 'list',
    railGroup: 'Where it applies',
    title: 'Scope option 1: all channels (adaptive)',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'When a requirement references a channel attribute: All channels where referenced attributes are set',
      'Channels missing those attributes are skipped silently',
      'Filter to All, Public only, or Private only channel types',
      'Public: de-recommend non-matching members',
      'Private: remove non-matching members',
    ],
    lookFor: [
      'All channels where referenced attributes are set — selected radio',
      'Channel type filter — All / Public / Private',
      'Enforcement help text derived by channel type',
    ],
    preview: {
      kind: 'iframe',
      path: withFocus(`${DS_EDITOR}&scope=all`, 'scope-all'),
    },
  },
  {
    id: 'scope-manual',
    section: 'list',
    railGroup: 'Where it applies',
    title: 'Scope option 2: select channels manually',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'Pick specific channels in a table: Name, Team, Auto-add toggle, Remove',
      'Search and add channels like the shipping membership policy editor',
      'Auto-add stays per-channel, not policy-wide',
    ],
    lookFor: [
      'Select channels manually — selected radio',
      'Manual channel table with per-row Auto-add',
    ],
    preview: {
      kind: 'iframe',
      path: withFocus(`${DS_EDITOR}&scope=manual`, 'scope-manual'),
    },
  },
  {
    id: 'scope-rules',
    section: 'list',
    railGroup: 'Where it applies',
    title: 'Scope option 3: channel-attribute rules',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'Target channels matching conditions — e.g. Program is Dragon Spacecraft',
      'Same row pattern as requirements, but left column is a channel attribute',
      'Combine with relative requirements for program + clearance stories',
    ],
    lookFor: [
      'Channels matching attribute conditions — selected radio',
      'Channel-attribute condition rows below',
    ],
    preview: {
      kind: 'iframe',
      path: withFocus(`${DS_EDITOR}&scope=rules`, 'scope-rules'),
    },
  },
  {
    id: 'teams-tab',
    section: 'list',
    railGroup: 'Where it applies',
    title: 'Teams tab (disabled for channel-attribute policies)',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'Team assignment gates team join — not channel membership within a team',
      'Disabled when requirements reference channel attributes — those rules need per-channel context',
      'Use the Channels tab to scope channel-attribute policies; team assignment needs literal requirements',
    ],
    lookFor: [
      'Teams tab — disabled styling',
      'Explanation — team assignment isn’t available for this policy',
    ],
    preview: {
      kind: 'iframe',
      path: withFocus(`${DS_EDITOR}&tab=teams`, 'teams-tab'),
    },
  },
  {
    id: 'story-ds-program',
    section: 'use-cases',
    title: 'DS Program — mixed-classification workspace',
    useCase:
      'Customer story: IL5 program office — 200+ channels from Unclassified to TS/SCI, with program read-in',
    bullets: [
      'List policy: DS Program — Applies to: All channels',
      'Problem: repeating clearance and program rules on every channel; policies drift when labels change',
      'Requirements: User:Clearance is at least Channel:Classification and User:Program is Channel:Program',
      'Scope: all channels where Classification is set — each channel enforces its own clearance and program bar',
    ],
    lookFor: [
      'DS Program row on the list',
      'Two requirement rows — clearance (relative) + program (relative)',
      'All attributes required — both must match',
    ],
    preview: { kind: 'iframe', path: withFocus(DS_EDITOR, 'requirements') },
  },
  {
    id: 'story-dragon-scope',
    section: 'use-cases',
    title: 'All Dragon Spacecraft channels',
    useCase:
      'Customer story: Program security officer — one rule bundle for every DS-labeled channel',
    bullets: [
      'List policy: Dragon Spacecraft — Applies to: 42 channels',
      'Problem: new DS channels created weekly; manual attachment leaves coverage gaps',
      'Requirements: User:Clearance is at least Channel:Classification and User:Nationality is USA or GBR',
      'Scope: channels where Program is Dragon Spacecraft — new labeled channels inherit automatically',
    ],
    lookFor: [
      'Dragon Spacecraft row on the list',
      'Channels matching attribute conditions — selected radio',
      'Condition row: Program is Dragon Spacecraft',
    ],
    preview: {
      kind: 'iframe',
      path: withFocus(DRAGON_EDITOR, 'scope-rules'),
    },
  },
  {
    id: 'story-command-enclave',
    section: 'use-cases',
    title: 'Joint task force enclave',
    useCase:
      'Customer story: Northern Command — coalition exercise channels, not the whole workspace',
    bullets: [
      'List policy: Northern Command — Applies to: 18 channels',
      'Problem: JTF channels spin up under Operations; manual lists fall behind',
      'Requirements: User:Clearance is at least Channel:Classification and User:Nationality is USA, GBR, CAN, or AUS',
      'Scope: channels where department is Operations — attribute-based rules, not a hand-picked list',
    ],
    lookFor: [
      'Northern Command row on the list',
      'Channels matching attribute conditions — selected radio',
      'Condition row: department is Operations',
    ],
    preview: {
      kind: 'iframe',
      path: withFocus(NORTHERN_EDITOR, 'scope-rules'),
    },
  },
  {
    id: 'story-noforn-handling',
    section: 'use-cases',
    title: 'NOFORN handling caveat',
    useCase:
      'Customer story: Security officer — US-persons-only access on NOFORN-labeled channels',
    bullets: [
      'List policy: NOFORN handling — Applies to: 8 channels',
      'Problem: foreign nationals must not remain in channels marked with the NOFORN releasability caveat',
      'Requirements: User:Clearance is at least Channel:Classification and User:Nationality is USA',
      'Scope: channels where Releasability is NOFORN — attribute-based rules cover new labeled channels',
    ],
    lookFor: [
      'NOFORN handling row on the list',
      'Requirement row — User:Nationality is USA (literal)',
      'Condition row: Releasability is NOFORN',
    ],
    preview: {
      kind: 'iframe',
      path: withFocus(NOFORN_EDITOR, 'scope-rules'),
    },
  },
  {
    id: 'combine-timing',
    section: 'save',
    title: 'How policies combine and when they run',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'How this combines: members must meet every policy that applies',
      'Channel rules can only tighten access, never loosen it',
      'When it takes effect: next policy evaluation cycle (~15 minutes in prototype copy)',
      'Info strip sits above Save — always visible before you commit',
    ],
    lookFor: ['Composition + timing info strip above the footer'],
    preview: { kind: 'iframe', path: withFocus(DS_EDITOR, 'timing-strip') },
  },
  {
    id: 'impact-gate',
    section: 'save',
    title: 'Always confirm on save',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'Every save opens an impact gate — you never apply blind',
      'Step 1: Computing impact (async)',
      'Step 2: Public de-recommends vs private removals + skipped channels',
      'Step 3: Confirm names the action — e.g. Apply policy — remove N members',
      'Error state with Retry; large blast-radius threshold still TBD with PM',
    ],
    lookFor: [
      'Impact gate modal with scope summary',
      'Destructive private-channel removal count',
    ],
    preview: {
      kind: 'iframe',
      path: withFocus(`${DS_EDITOR}&gate=results`, 'impact-gate'),
    },
  },
  {
    id: 'wrap-up',
    section: 'appendix',
    title: 'Out of scope and open questions',
    bullets: [
      'Not in this release:',
      'Attribute-based team targeting',
      'Separate channel coverage widget',
      'End-user removal messaging',
      'Auto-remove on attribute loss',
      'Open for engineering / PM:',
      'Technical feasibility of impact summary',
      'VP-3: Re-evaluation cadence (~15 min) is configurable',
    ],
    lookFor: [],
    preview: { kind: 'iframe', path: withFocus(GMP_ROUTES.list, 'sync-jobs') },
  },
];
