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

// ── Simplified editor route (Parts A + B) ─────────────────────────────────────
// This walkthrough points every editor iframe at the SIMPLIFIED editor route
// (Parts A + B), not the Long-Form route. Deep-link params on that route:
// ?policy, ?scope=all|manual, ?state, ?test=list|channel. The Simplified editor
// does not consume a ?focus param, so editor previews omit withFocus(); List and
// Attribute Hub previews keep it because those surfaces wrap
// WalkthroughFocusProvider.
const SIMPLIFIED_EDITOR = '/prototypes/global-membership-policy-simplified';

// DS Program spine — references Channel:Program (NOT required-for-channels), so
// it is the BLOCKED example under "All channels" and the manual-scope spine.
const DS_MANUAL = `${SIMPLIFIED_EDITOR}?policy=ds-program&scope=manual`;
const DS_ALL_BLOCKED = `${SIMPLIFIED_EDITOR}?policy=ds-program&scope=all`;
// NOFORN references only Channel:Classification (required) → saveable under All.
const NOFORN_ALL_SAVEABLE = `${SIMPLIFIED_EDITOR}?policy=noforn-handling&scope=all`;
const DRAGON_MANUAL = `${SIMPLIFIED_EDITOR}?policy=dragon-spacecraft&scope=manual`;
const NORTHERN_MANUAL = `${SIMPLIFIED_EDITOR}?policy=northern-command&scope=manual`;
// Literal-only preset — Confidential floor, manual scope (existing behavior).
const LITERAL_DEMO = `${SIMPLIFIED_EDITOR}?policy=literal-demo&scope=manual`;
// Test-matching modal deep-links (Part B): View 1 list, View 2 per-channel.
const DS_TEST_LIST = `${SIMPLIFIED_EDITOR}?policy=ds-program&scope=manual&test=list`;
const DS_TEST_CHANNEL = `${SIMPLIFIED_EDITOR}?policy=ds-program&scope=manual&test=channel`;

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
      'What’s new: channel attributes in membership requirements — metadata on the channel (Classification, Program) that a requirement can compare against',
      'Use 1 — requirements: compare a user attribute to its paired channel attribute (e.g. Clearance ≥ Channel:Classification)',
      'Use 2 — where it applies: two choices only — All channels (a fail-secure workspace floor) or a channel set you select manually',
    ],
    lookFor: [
      'Membership policy table',
      'Add policy — opens the simplified editor in later steps',
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
      'In requirements, each user attribute pairs with the ONE channel attribute that shares its schema — Clearance pairs with Channel:Classification, Program with Channel:Program, department with Channel:department',
      'Hero example — requirements: User:Clearance is at least Channel:Classification (Secret channels require Secret; Unclassified require Unclassified)',
      {
        text: 'Required-for-channels matters here — an attribute marked required is guaranteed on every channel, so an "All channels" policy can safely reference it',
        sub: [
          'Channel:Classification is required for channels — every channel carries a value',
          'Channel:Program is not required — some channels won’t have it, which is why an "All channels" policy referencing Program is blocked on save (covered later)',
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
      'Applies to summarizes each policy’s channel scope',
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
    title: 'Open the simplified editor',
    useCase:
      'Walkthrough policy: DS Program — IL5 mixed-classification workspace (200+ channels)',
    bullets: [
      'Open DS Program from the list — the editor steps model this customer story',
      'Back in the header returns to the list; Cancel in the footer does the same',
      'Other list policies are revisited in Customer stories after this editor tour',
      'This is the simplified editor: one paired channel attribute per requirement, and two scope choices',
    ],
    lookFor: ['Full editor canvas — requirements at top, scope below'],
    preview: { kind: 'iframe', path: DS_MANUAL },
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
    preview: { kind: 'iframe', path: DS_MANUAL },
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
      'Each row: user attribute → operator → value (a literal, or the paired channel attribute)',
      'Operators change with attribute type (ranked, select, multiselect)',
      'The value field is filtered to that attribute type — and to a single paired channel attribute where one exists',
      'All required (default) means every row must match; Any match means at least one',
    ],
    lookFor: ['Membership requirements panel — row builder and match-mode menu'],
    preview: { kind: 'iframe', path: DS_MANUAL },
  },
  {
    id: 'hero-relative',
    section: 'list',
    railGroup: 'Membership requirements',
    title: 'Hero story: relative comparison',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'Set User:Clearance is at least Channel:Classification',
      'The user attribute on the left decides what the value field offers — its type filters the options',
      'In the simplified model each user attribute offers only its ONE schema-paired channel attribute, not a list of channel variables',
      'Clearance pairs with Channel:Classification; Program pairs with Channel:Program; department with Channel:department',
      'The paired channel attribute renders as a distinct token so you can tell a per-channel variable from a fixed value',
      'One policy, and each channel enforces its own bar from its own classification',
    ],
    lookFor: [
      'First requirement row — value field showing the Channel:Classification token',
      'Value field offers fixed Values plus the single paired Channel attribute',
    ],
    preview: { kind: 'iframe', path: DS_MANUAL },
  },
  {
    id: 'literal-example',
    section: 'list',
    railGroup: 'Membership requirements',
    title: 'Literal-only requirements',
    useCase:
      'Already in the product: Confidential minimum for a selected set of channels',
    bullets: [
      'Membership policies already support literal values — and so do these requirements',
      'Example: User:Clearance is at least Confidential for every channel in scope',
      'Some user attributes are literal-only — Nationality and Community of interest have no paired channel attribute, so their value field offers fixed values only',
      'Comparing a user attribute to its paired channel attribute is the new part; literal rules work the same as before',
    ],
    lookFor: [
      'Requirement row with a Confidential literal — fixed for all scoped channels',
      'Literal-only attributes (e.g. Nationality) show no Channel attribute option',
    ],
    preview: { kind: 'iframe', path: LITERAL_DEMO },
  },
  {
    id: 'test-users-list',
    section: 'list',
    railGroup: 'Membership requirements',
    title: 'Test matching users — affected channels',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'Run Test matching users before save to preview which channels and members this policy touches',
      'View 1 opens on a list of up to 10 affected channels — each row shows a "+X allowed · −Y removed" summary and a chevron',
      'A search box at the top is an autocomplete: type a name and pick a channel from the dropdown to jump straight to its members',
      'Channels above your own clearance are kept out of this list — you can’t preview names you aren’t cleared to see',
    ],
    lookFor: [
      'Test matching users control opens the modal on the channel list',
      'Up to 10 affected channels, each with an allowed/removed summary',
      'Autocomplete search dropdown under the search field',
    ],
    preview: { kind: 'iframe', path: DS_TEST_LIST },
  },
  {
    id: 'test-users-channel',
    section: 'list',
    railGroup: 'Membership requirements',
    title: 'Test matching users — channel members',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'Click a channel (or pick one from the autocomplete) to drill into its members',
      'A back arrow returns to the affected-channels list; the X closes the whole modal',
      'Two tabs — Allowed (N) and Removed (N) — split members who keep access from members who would be removed',
      'Opens on Removed by default so the destructive set is front and center',
      'A Search users box filters the member list in this view; the list paginates at 10 per page',
      '[VERIFY] What member detail is technically feasible to show here beyond name and @username?',
    ],
    lookFor: [
      'Channel members header with back arrow and channel name subtitle',
      'Allowed / Removed tabs with counts; Removed active',
      'Paginated member list — "Showing 1–N of M"',
    ],
    preview: { kind: 'iframe', path: DS_TEST_CHANNEL },
  },
  {
    id: 'where-intro',
    section: 'list',
    railGroup: 'Where it applies',
    title: 'Where this policy applies',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'Second main section: pick which channels the policy covers',
      'In the simplified model there are exactly TWO choices — no attribute-based scope, no channel-type segmented control',
      'All channels — a fail-secure workspace floor',
      'Select channels manually — a specific set you choose',
    ],
    lookFor: ['Where this policy applies section — two scope radios'],
    preview: { kind: 'iframe', path: DS_MANUAL },
  },
  {
    id: 'scope-all',
    section: 'list',
    railGroup: 'Where it applies',
    title: 'Scope option 1: all channels (fail-secure)',
    useCase: 'Example policy: DS Program — adaptive clearance per channel classification',
    bullets: [
      'Applies to every channel, whether or not a referenced attribute is set',
      'Fail-secure: a channel missing a referenced attribute value removes everyone from that channel — there is no silent skip',
      'Use it for a true workspace-wide floor — every channel must meet the requirements',
      'Because it’s fail-secure, referencing a channel attribute that isn’t guaranteed on every channel disables All channels (next step)',
    ],
    lookFor: [
      'All channels — selected radio',
      'Fail-secure helper copy under the radio',
    ],
    preview: { kind: 'iframe', path: NOFORN_ALL_SAVEABLE },
  },
  {
    id: 'save-guardrail',
    section: 'list',
    railGroup: 'Where it applies',
    title: 'Guardrail: All channels disabled when a non-required attribute is referenced',
    useCase: 'Example policy: DS Program — Clearance ≥ Channel:Classification and Program = Channel:Program',
    bullets: [
      'When a requirement references a channel attribute that isn’t required for channels, the All channels scope option is disabled — not a post-save warning',
      'Why: under All channels the policy is fail-secure — any channel missing that attribute value removes all of its members. A non-required attribute isn’t guaranteed on every channel, so this could mass-remove members',
      'Blocked example: DS Program references Channel:Program, which is not required for channels → All channels is disabled with an inline explanation naming Program',
      'Saveable example: NOFORN handling references only Channel:Classification (required for channels) → All channels remains selectable',
      'To resolve: mark the attribute required for channels, or use Select channels manually',
    ],
    lookFor: [
      'All channels radio disabled with a Danger SectionNotice under the option',
      'Select channels manually selected for the blocked DS Program example',
      'Compare to the saveable NOFORN policy where All channels is enabled',
    ],
    callout:
      'Blocked: ?policy=ds-program (references Channel:Program). Saveable: ?policy=noforn-handling&scope=all (references only the required Channel:Classification).',
    preview: { kind: 'iframe', path: DS_ALL_BLOCKED },
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
      'Manual scope never triggers the fail-secure guardrail — it only touches the channels you chose',
    ],
    lookFor: [
      'Select channels manually — selected radio',
      'Manual channel table with per-row Auto-add',
    ],
    preview: { kind: 'iframe', path: DS_MANUAL },
  },
  {
    id: 'story-ds-program',
    section: 'use-cases',
    title: 'DS Program — mixed-classification workspace',
    useCase:
      'Customer story: IL5 program office — 200+ channels from Unclassified to TS/SCI, with program read-in',
    bullets: [
      'List policy: DS Program',
      'Problem: repeating clearance and program rules on every channel; policies drift when labels change',
      'Requirements: User:Clearance is at least Channel:Classification and User:Program is Channel:Program',
      'Scope: Select channels manually — the DS-labeled channel set. Because Program isn’t required for channels, All channels is disabled for this policy',
      'If the program later marks Channel:Program required for channels, it could move to All channels for a true workspace floor',
    ],
    lookFor: [
      'DS Program row on the list',
      'Two requirement rows — clearance (paired) + program (paired)',
      'Select channels manually — selected radio',
    ],
    preview: { kind: 'iframe', path: DS_MANUAL },
  },
  {
    id: 'story-noforn-handling',
    section: 'use-cases',
    title: 'NOFORN handling — workspace-wide US-persons floor',
    useCase:
      'Customer story: Security officer — US-persons-only access enforced as a workspace floor',
    bullets: [
      'List policy: NOFORN handling',
      'Problem: foreign nationals must not remain in channels that carry the NOFORN releasability caveat, and the floor should hold everywhere',
      'Requirements: User:Clearance is at least Channel:Classification and User:Nationality is USA (literal)',
      'Scope: All channels — this is the fail-secure workspace-floor story. It references only Channel:Classification (required for channels), so it saves cleanly',
      'Nationality is literal-only (no paired channel attribute), so the requirement compares against the fixed value USA',
    ],
    lookFor: [
      'NOFORN handling row on the list',
      'Requirement row — User:Nationality is USA (literal)',
      'All channels — selected radio, Save enabled',
    ],
    preview: { kind: 'iframe', path: NOFORN_ALL_SAVEABLE },
  },
  {
    id: 'story-dragon',
    section: 'use-cases',
    title: 'Dragon Spacecraft — a selected program channel set',
    useCase:
      'Customer story: Program security officer — one rule bundle for the DS-labeled channels',
    bullets: [
      'List policy: Dragon Spacecraft',
      'Problem: coalition partners and clearance vary across the program’s channels; the rule bundle should stay in one place',
      'Requirements: User:Clearance is at least Channel:Classification and User:Nationality is USA or GBR (literal)',
      'Scope: Select channels manually — the DS-labeled channel set. Attribute-based auto-targeting is not part of the simplified model, so this set is picked manually',
      '[VERIFY] Without attribute-based scope, newly created DS channels must be added to this policy by hand — confirm this manual-attach tradeoff is acceptable for the simplified model',
    ],
    lookFor: [
      'Dragon Spacecraft row on the list',
      'Select channels manually — selected radio',
      'Clearance (paired) + Nationality USA/GBR (literal) requirement rows',
    ],
    preview: { kind: 'iframe', path: DRAGON_MANUAL },
  },
  {
    id: 'story-northern-command',
    section: 'use-cases',
    title: 'Northern Command — joint task force enclave',
    useCase:
      'Customer story: Northern Command — coalition exercise channels, not the whole workspace',
    bullets: [
      'List policy: Northern Command',
      'Problem: JTF channels spin up under Operations; the coalition clearance + nationality gate should cover just those channels',
      'Requirements: User:Clearance is at least Channel:Classification and User:Nationality is USA, GBR, CAN, or AUS (literal)',
      'Scope: Select channels manually — the 18 JTF channels. This is intentionally NOT a workspace floor, so All channels would be wrong here',
      '[VERIFY] Same manual-attach tradeoff as Dragon — new Operations channels are added by hand, not auto-included',
    ],
    lookFor: [
      'Northern Command row on the list',
      'Select channels manually — selected radio',
      'Clearance (paired) + Nationality USA/GBR/CAN/AUS (literal) requirement rows',
    ],
    preview: { kind: 'iframe', path: NORTHERN_MANUAL },
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
    preview: { kind: 'iframe', path: DS_MANUAL },
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
      'Note: the guardrail blocks unsafe "All channels" saves before you ever reach this gate',
    ],
    lookFor: [
      'Impact gate modal with scope summary',
      'Destructive private-channel removal count',
    ],
    callout:
      'Click Save on the manual DS Program editor to open the gate; ?state=error then Save shows the error/retry path.',
    preview: { kind: 'iframe', path: DS_MANUAL },
  },
  {
    id: 'wrap-up',
    section: 'appendix',
    title: 'Out of scope and open questions',
    bullets: [
      'Not in this simplified variation:',
      'Attribute-based channel scope (auto-targeting by channel conditions)',
      'Channel-type segmented control (All / Public / Private)',
      'More than one paired channel attribute per user attribute',
      'Attribute-based team targeting; end-user removal messaging; auto-remove on attribute loss',
      'Open for engineering / PM:',
      'Manual-attach tradeoff for program/enclave stories now that attribute-based scope is gone',
      'Technical feasibility of the test-matching member detail',
      'VP-3: Re-evaluation cadence (~15 min) is configurable',
    ],
    lookFor: [],
    preview: { kind: 'iframe', path: withFocus(GMP_ROUTES.list, 'sync-jobs') },
  },
];
