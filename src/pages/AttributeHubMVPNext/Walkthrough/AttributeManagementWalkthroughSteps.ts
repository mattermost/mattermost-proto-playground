/**
 * Attribute Management (MVP/P0) walkthrough — steps authored from
 * `specs/attribute-system/consolidated-model/07-spec.md` (Tier 2, all
 * [VERIFY WITH PM] items resolved as of this revision). Every "confirmed"
 * claim below traces to that spec; anything the current prototype build
 * (`AttributeHubMVPNext.tsx`) does not yet demonstrate is called out honestly
 * as an implementation gap, matching the spec's own §3.2/§4.1/§4.6 notes.
 */

export type WalkthroughSection =
  | 'intro'
  | 'catalog'
  | 'create'
  | 'applies-to'
  | 'guardrails'
  | 'use-cases'
  | 'licensing'
  | 'mobile'
  | 'appendix';

export type WalkthroughRailGroup =
  | 'Shared mechanics'
  | 'Users'
  | 'Channels'
  | 'Posts';

export type WalkthroughPreview =
  | { kind: 'iframe'; path: string }
  | { kind: 'external'; url: string };

export type WalkthroughBullet =
  | string
  | { text: string; sub?: string[] };

export interface WalkthroughStep {
  id: string;
  section: WalkthroughSection;
  /** Nested label under Applies to in the jump rail. */
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
  intro: 'Why this exists',
  catalog: 'Catalog & list view',
  create: 'Creating an attribute',
  'applies-to': 'Applies to — the core mechanic',
  guardrails: 'Guardrails & governance',
  'use-cases': 'Customer stories',
  licensing: 'Licensing',
  mobile: 'Mobile',
  appendix: 'Wrap-up',
};

export function stepPanelLabel(step: WalkthroughStep): string {
  return step.railGroup ?? WALKTHROUGH_SECTION_LABELS[step.section];
}

function withFocus(path: string, focus: string): string {
  const join = path.includes('?') ? '&' : '?';
  return `${path}${join}focus=${encodeURIComponent(focus)}`;
}

const MVP_ROUTE = '/prototypes/attribute-hub-mvp';

const ATTR = (id: string) => `${MVP_ROUTE}?attr=${id}`;
const CREATE_FLOW = `${MVP_ROUTE}?flow=new`;
const SELF_EDIT_DEMO = `${ATTR('cost-center')}&guardrail=self-edit`;

export const ATTRIBUTE_MANAGEMENT_WALKTHROUGH_STEPS: WalkthroughStep[] = [
  // ── Why this exists ────────────────────────────────────────────────────
  {
    id: 'why-hub',
    section: 'intro',
    title: 'The problem this Hub solves',
    bullets: [
      'Problem (§1.1): admins configuring custom attributes for ABAC and labeling had no single, DGA-respecting place to define an attribute once and choose which resources may use it',
      'Before this Hub, defining the same concept for Users, Channels, and Posts meant separate, duplicate authoring flows with no shared source of truth',
      'This spec covers the mechanism only — definition + per-resource configuration. It does not cover how ABAC policies or membership rules consume these attributes (§8) — that lives in sibling specs (Global Membership Policies, Channel Attributes, Environmental Attributes)',
    ],
    lookFor: ['Attribute catalog — one row per defined attribute'],
    preview: { kind: 'iframe', path: withFocus(MVP_ROUTE, 'attr-table') },
  },
  {
    id: 'mechanism-summary',
    section: 'intro',
    title: 'Define once, apply to many',
    lead: 'An admin authors a display name, type, and option set once, then adds any combination of Users / Channels / Posts as an "Applies to" target (§1.2).',
    bullets: [
      'Each applied resource gets its own independent configuration card — display behavior, visibility, and who is permitted to set the value — layered on the same shared definition',
      'The definition is the single source of truth; applying a resource creates a linked configuration, never an independent copy',
      'P0 resources: Users, Channels, Posts only — Teams is explicitly cut (§1.4, §3.1 Decisions locked)',
    ],
    lookFor: ['Applies to column — resource chips per attribute'],
    preview: { kind: 'iframe', path: withFocus(MVP_ROUTE, 'attr-table') },
  },
  {
    id: 'placement-dga',
    section: 'intro',
    title: 'Where it lives, and why here',
    lead: 'System Console → Attribute System → Manage Attributes, gated by DGA (Delegated Granular Administration) — Mattermost System Roles that grant scoped console access to non-sysadmins (§2, §3.1).',
    bullets: [
      'Sits alongside Attribute-based access control, Membership Policies, and Permission Policies — reaching the page at all requires DGA-scoped access, not necessarily full System Administrator',
      'Why here, not a standalone surface: an earlier direction placed attribute management on the product switcher (alongside Agents/Integrations); reversed 2026-07-07 after engineering/placement review favored System Console for consistency with adjacent admin surfaces (§11 Deprecated Explorations)',
    ],
    lookFor: ['Manage Attributes — System Console sidebar item'],
    preview: { kind: 'iframe', path: withFocus(MVP_ROUTE, 'attr-table') },
  },

  // ── Catalog & list view ─────────────────────────────────────────────────
  {
    id: 'catalog-columns',
    section: 'catalog',
    title: 'The catalog table',
    lead: 'A single table (§3.2): drag handle, Attribute, Type, Applies to (resource chips), Source, Options (count, or "Free text" for Text), and row actions.',
    bullets: [
      'Source distinguishes "Managed here" (manually authored) from synced systems — UAS, AD/LDAP, SAML, SCIM',
      'Options shows a value count for list-bearing types, or "Free text" for Text — Text attributes have no preset values',
    ],
    lookFor: ['Full catalog table with all seven columns'],
    preview: { kind: 'iframe', path: withFocus(MVP_ROUTE, 'attr-table') },
  },
  {
    id: 'catalog-filters',
    section: 'catalog',
    title: 'Search and filters',
    bullets: [
      'Search matches name or type',
      'Resource-type filter — Users / Channels / Posts checkboxes',
      'Source filter — All sources / Managed here / each synced system (UAS, AD/LDAP, SAML, SCIM)',
    ],
    lookFor: ['Search box', 'Resource-type filter', 'Source filter'],
    preview: { kind: 'iframe', path: withFocus(MVP_ROUTE, 'resource-filter') },
  },
  {
    id: 'classification-readonly',
    section: 'catalog',
    title: 'Classification is deliberately different',
    lead: 'The pre-existing Classification attribute (Ranked-hierarchical) always appears in this list but is read-only — clicking it opens a separate markings page, not the standard edit view (§3.2).',
    bullets: [
      'Ranked-hierarchical is not a creatable type in this Hub — Classification surfaces here only for catalog completeness; it is managed in its own dedicated section',
      'The row links to `?markings=classification` — a read-only view of the ranked tiers and their nested handling markings (`MvpMarkingsPage.tsx`)',
      'Deep-linking `?attr=classification` deliberately does not open the standard editor — the app treats this id as excluded from edit',
    ],
    lookFor: ['Classification row — Hierarchical · Classification Markings · open-in-new'],
    preview: {
      kind: 'iframe',
      path: withFocus(MVP_ROUTE, 'classification-row'),
    },
  },
  {
    id: 'drag-reorder',
    section: 'catalog',
    title: 'Drag-to-reorder — display order only',
    lead: 'Confirmed in this revision: drag-to-reorder changes catalog display order only. It has no effect on evaluation order anywhere downstream (§3.2).',
    bullets: [
      'Nothing about the row order changes how ABAC or membership policies evaluate attributes — this is purely a catalog-browsing convenience',
    ],
    lookFor: ['Drag handle — first column of every row'],
    preview: { kind: 'iframe', path: withFocus(MVP_ROUTE, 'attr-table') },
  },
  {
    id: 'delete-type-guards',
    section: 'catalog',
    title: 'Name, type, delete, and deactivate guards',
    lead: 'Confirmed server-side requirements this revision, not just prototype UI (§3.2) — Clearance is shown here because it is both policy-bound and externally synced.',
    bullets: [
      'Type locks once the attribute is used by ≥1 policy — already implemented client-side (`isPolicyLocked`), no gap here',
      {
        text: 'Delete is blocked by two distinct conditions, both required — do not conflate them:',
        sub: [
          'Policy-usage block: not referenced by any access policy (already implemented)',
          'Resource-bindings-cleared block: no remaining Applies-to bindings — all bindings must be removed first',
        ],
      },
      'Deactivating is distinct from deleting: it stops new assignments while existing values remain, and must never sever the attribute from policies that still reference it',
    ],
    callout:
      'Honest build gap (§3.2 implementation notes): the current MVP delete guard checks only policy usage and external-sync ownership, not remaining bindings — that check needs to be added. There is also no separate Deactivate action yet in this catalog\'s row menu (Edit / Duplicate / Delete only) — the broader Simplified Hub already has one; this screen needs the equivalent.',
    lookFor: ['Clearance row — kebab menu, Delete disabled with a tooltip'],
    preview: {
      kind: 'iframe',
      path: withFocus(MVP_ROUTE, 'row-menu-delete-blocked'),
    },
  },

  // ── Creating an attribute ───────────────────────────────────────────────
  {
    id: 'open-create-flow',
    section: 'create',
    title: 'Starting a new attribute',
    lead: 'No wizard (§3.3) — New attribute opens straight into an inline, single-view form.',
    bullets: ['Available from the catalog toolbar, next to the filters'],
    lookFor: ['New attribute button'],
    preview: { kind: 'iframe', path: withFocus(MVP_ROUTE, 'new-attribute-button') },
  },
  {
    id: 'create-display-name',
    section: 'create',
    title: 'Display name and unique name',
    lead: 'Top to bottom, one view: Display name → Type → Options → Applies to (§3.3).',
    bullets: [
      'Display name is what admins and users see; Unique name is the internal identifier used by policies and integrations',
      'Unique name defaults from the display name until manually edited',
      'Save is disabled until a name is present',
    ],
    callout:
      'Honest build gap (§3.2, §3.3): attribute names must be unique across the catalog, but the current MVP has no uniqueness check in its Save-enable logic. The shared GuardrailDialog already has fully-authored copy for a \'duplicate-name\' kind — eng should wire name entry to that existing guardrail rather than build new UI.',
    lookFor: ['Display name field', 'Unique name — Edit link'],
    preview: { kind: 'iframe', path: withFocus(CREATE_FLOW, 'attr-display-name') },
  },
  {
    id: 'create-type-options',
    section: 'create',
    title: 'Type and options',
    bullets: [
      'P0 creatable types: Select, Multiselect, Ranked, Text — Ranked-Hierarchical is cut (Classification is the one pre-existing exception, read-only)',
      'Options is a chip-based value list for Select/Multiselect/Ranked; Text has no preset values — a value is typed in per resource',
      'Individual option values already in use elsewhere (`inUseCount > 0`) cannot be deleted, only disabled — this preserves existing assignments while blocking new ones (§3.4)',
    ],
    lookFor: ['Type selector', 'Options chip editor'],
    preview: { kind: 'iframe', path: withFocus(CREATE_FLOW, 'attr-type') },
  },
  {
    id: 'create-empty-applies-to',
    section: 'create',
    title: '"No resources yet" — Applies to starts empty',
    lead: 'The Applies-to panel starts in a "No resources yet" state with a single Add resource action — there is nothing to configure until at least one resource is added (§3.3).',
    bullets: [
      'This is deliberate, not a loading state: a brand-new attribute has no per-resource configuration to show yet',
    ],
    lookFor: ['"No resources yet" empty state', 'Add resource button'],
    preview: { kind: 'iframe', path: withFocus(CREATE_FLOW, 'applies-empty') },
  },

  // ── Applies to — shared mechanics ──────────────────────────────────────
  {
    id: 'adding-a-resource',
    section: 'applies-to',
    railGroup: 'Shared mechanics',
    title: 'Adding a resource',
    useCase: 'Example attribute: Caveat / Releasability — applies to Channels and Posts today',
    bullets: [
      'The Add resource menu only ever offers resource types not yet applied (§4.1) — Caveat / Releasability is missing Users, so only Users appears here',
      'Once all three of Users / Channels / Posts are added, the menu disables entirely',
      'Adding a resource creates a fresh default configuration for it and auto-expands that resource\'s card, scrolled into view with a brief highlight',
    ],
    lookFor: ['Add resource menu — Users is the only option left'],
    preview: { kind: 'iframe', path: withFocus(ATTR('caveat'), 'add-resource-menu') },
  },
  {
    id: 'shared-required-and-default',
    section: 'applies-to',
    railGroup: 'Shared mechanics',
    title: 'Required and Default value',
    useCase: 'Example attribute: Caveat / Releasability — Channels binding',
    bullets: [
      'Required (toggle) — the resource cannot be created or saved without a value. Not shown for Users: users are actors, not created via a form the way channels/posts are (§4.2–4.3)',
      'Default value shows only when the attribute takes a value list, values are assignable on this binding, and who-can-set is editable (not sync-locked)',
      'When Required is on and a default is available to pick, one must be selected — Save is blocked with an inline error otherwise (already implemented)',
    ],
    callout:
      'This card is live — try switching Required on for Caveat / Releasability\'s Channels binding and watch the Default value field become mandatory.',
    lookFor: ['Required toggle', 'Default value select'],
    preview: { kind: 'iframe', path: withFocus(ATTR('caveat'), 'channels-required') },
  },
  {
    id: 'backfill-on-required',
    section: 'applies-to',
    railGroup: 'Shared mechanics',
    title: 'Backfill on becoming Required',
    lead: 'Confirmed requirement this revision: because a Required binding always resolves to a default value, turning Required on backfills every pre-existing channel or post with that default automatically — there is no separate "unset, needs migration" state (§4.2).',
    bullets: [
      'Applies uniformly whether the channels/posts existed before or after Required was turned on',
      'Scope note: this is defined in terms of a default value-list entry, so it applies to Select/Multiselect/Ranked bindings — Text has no value list and therefore no discrete default to backfill with. A Required Text binding has no confirmed backfill target yet; flagged to PM/Eng',
    ],
    callout:
      'Honest build gap: the prototype has no channel/post list model, so "backfilling N existing channels" cannot be visually demonstrated here — this is a confirmed behavioral requirement to build server-side, not something the current UI shows.',
    lookFor: ['Default value select'],
    preview: {
      kind: 'iframe',
      path: withFocus(ATTR('caveat'), 'channels-default-value'),
    },
  },
  {
    id: 'remove-resource-confirm',
    section: 'applies-to',
    railGroup: 'Shared mechanics',
    title: 'Removing a resource always confirms first',
    useCase: 'Example attribute: Caveat / Releasability — Channels binding',
    bullets: [
      'Removing a resource always prompts a confirmation dialog naming the impact — e.g. "Removing the channel binding stops new assignments and hides the value on existing channels" (§4.2)',
      'If the attribute is policy-bound, the dialog names the affected policies instead of the generic impact copy',
      'Removing the Users binding is disabled outright when the attribute is externally synced — sync systems apply to Users only in practice, so that removal isn\'t offered',
    ],
    lookFor: ['Remove resource button — opens the guardrail dialog'],
    preview: {
      kind: 'iframe',
      path: withFocus(ATTR('caveat'), 'channels-remove-resource'),
    },
  },

  // ── Applies to — Users ──────────────────────────────────────────────────
  {
    id: 'users-profile-display',
    section: 'applies-to',
    railGroup: 'Users',
    title: 'Profile display',
    useCase: 'Example attribute: Department — synced from AD/LDAP',
    bullets: [
      'Always / When set / Hidden — default is When set (§4.3)',
      'Sync only locks who-can-set on the Users binding — Profile display and Value visibility stay editable even for an AD/LDAP-synced attribute like Department',
    ],
    lookFor: ['Profile display segmented control'],
    preview: {
      kind: 'iframe',
      path: withFocus(ATTR('department'), 'users-profile-display'),
    },
  },
  {
    id: 'users-value-visibility',
    section: 'applies-to',
    railGroup: 'Users',
    title: 'Value visibility — need-to-know for end users',
    useCase: 'Example attribute: Program — synced from UAS, restricted values',
    bullets: [
      'Show all values / Users only see values they hold themselves — default is show all (§4.3, §2 Terminology)',
      'Set once on the Users card; Channels/Posts cards show it reflected read-only, not re-configured per resource',
      'Program is UAS-synced, so this collapses to a locked, source-controlled note — contrast with Department (previous step), which is editable because only UAS forces this lock, not AD/LDAP or SAML',
    ],
    lookFor: ['Value visibility radios — locked, "configured by User Attribute Sync"'],
    preview: {
      kind: 'iframe',
      path: withFocus(ATTR('program'), 'users-value-visibility'),
    },
  },
  {
    id: 'users-who-can-set-basic',
    section: 'applies-to',
    railGroup: 'Users',
    title: 'Who can set — Member or System Administrator',
    useCase: 'Example attribute: Cost center — manually managed, Finance-owned',
    bullets: [
      'A two-option radio, not the multi-role picker Channels/Posts use — Member or System Administrator, default System Administrator (§4.3)',
      'When sync-owned, this collapses to the same locked-chip pattern used everywhere else in the Hub',
    ],
    lookFor: ['Member / System Administrator radios'],
    preview: { kind: 'iframe', path: withFocus(ATTR('cost-center'), 'users-who-can-set') },
  },
  {
    id: 'users-self-edit-warning',
    section: 'applies-to',
    railGroup: 'Users',
    title: 'The self-edit warning — new this revision',
    useCase: 'Confirmed requirement, V-002 → §4.3',
    lead: 'Switching "Who can set" to Member — letting a user set their own value — on an attribute used by ≥1 access policy shows a non-blocking warning naming the affected policy count/names before the change takes effect. The admin can still proceed.',
    bullets: [
      'This is a warning, not a hard block — distinct from the hard blocks elsewhere in this Hub (type-lock, delete, deactivate)',
      'No seed attribute in this build is simultaneously Users-applied, manually managed, and already policy-bound, so this preview uses a demo-only `?guardrail=self-edit` deep link on Cost center to force the condition and show the dialog pre-opened',
      'In the shipped product, the real gate is simply "usedByPolicies > 0" — no demo flag needed',
    ],
    callout:
      'Newly built for this walkthrough: `MvpNextUsersWhoCanSetEditor.tsx` previously applied the Member switch immediately with no guardrail. It now routes through a new `self-edit-warning` `GuardrailDialog` kind, matching the pattern already used for remove-resource and delete-blocked.',
    lookFor: ['Self-edit warning dialog — "Members can set their own value"'],
    preview: { kind: 'iframe', path: withFocus(SELF_EDIT_DEMO, 'self-edit-warning-dialog') },
  },

  // ── Applies to — Channels ───────────────────────────────────────────────
  {
    id: 'channels-display-location',
    section: 'applies-to',
    railGroup: 'Channels',
    title: 'Display location',
    useCase: 'Example attribute: Caveat / Releasability — Channels binding',
    bullets: [
      'Header and/or Sidebar checkboxes, default both checked; unchecking all hides the attribute on channels entirely (§4.4)',
      'A third Banner option appears only when the attribute\'s type is Ranked (or the read-only Ranked-hierarchical) — never for Select/Multiselect/Text',
    ],
    callout:
      'The only Ranked-type + Channels attribute in this build is the read-only Classification attribute, so the Banner checkbox itself is not demonstrable live here — Classification\'s own Applies-to configuration cannot be opened via this editor (see "Classification is deliberately different").',
    lookFor: ['Header / Sidebar checkboxes'],
    preview: {
      kind: 'iframe',
      path: withFocus(ATTR('caveat'), 'channels-display-location'),
    },
  },
  {
    id: 'channels-who-can-set',
    section: 'applies-to',
    railGroup: 'Channels',
    title: 'Who can set — multi-role picker',
    useCase: 'Example attribute: Program — Channels binding',
    bullets: [
      'Relational default Channel admin, extensible with Team admin, System admin, Members, or any Other role from the system-configured list (§4.4)',
      'Program\'s Channels binding shows this in practice: Channel admin plus an added Program Security Officers grant',
    ],
    lookFor: ['Role chips — Channel admin + Program Security Officers'],
    preview: { kind: 'iframe', path: withFocus(ATTR('program'), 'channels-who-can-set') },
  },
  {
    id: 'channels-zero-setters-gap',
    section: 'applies-to',
    railGroup: 'Channels',
    title: 'The confirmed validation-gap fix (§4.6)',
    lead: 'Spec intent: Required + zero setters must become a hard Save-blocking gate, matching the treatment already given to missing default values.',
    bullets: [
      'Today, the picker already shows a blocking-styled danger notice ("No one can set this value") when Required is on and no setter is selected on a Channels/Posts binding',
      'But this does not actually block Save yet — only the missing-default-value case does',
      'Try it: toggle Required on for Caveat / Releasability\'s Channels binding, then remove the Channel admin chip — the danger notice appears, but Save is not currently disabled',
    ],
    callout:
      'Design note (§4.6): flagged as a P1 finding in the edge-case pass. Treat as required spec behavior to build, not a "nice to have" fix — a Required resource must always resolve to a real, assignable value.',
    lookFor: ['"No one can set this value" danger notice'],
    preview: { kind: 'iframe', path: withFocus(ATTR('caveat'), 'channels-who-can-set') },
  },

  // ── Applies to — Posts ──────────────────────────────────────────────────
  {
    id: 'posts-display-required',
    section: 'applies-to',
    railGroup: 'Posts',
    title: 'Required and Display location',
    useCase: 'Example attribute: Caveat / Releasability — Posts binding',
    bullets: [
      'Required toggle, default off (§4.5)',
      '"Message input box" and/or "In-channel message view" checkboxes, default Message input box only; unchecking all hides the attribute on posts',
    ],
    callout:
      'Caveat / Releasability\'s Posts binding also carries an inherit-from-channel flag in the underlying data model — the MVP UI intentionally suppresses inheritance controls everywhere (`suppressInheritance` prop), a confirmed exclusion, not a bug. See Wrap-up for the re-activation path.',
    lookFor: ['Required toggle', 'Message input box / In-channel message view checkboxes'],
    preview: {
      kind: 'iframe',
      path: withFocus(ATTR('caveat'), 'posts-display-location'),
    },
  },
  {
    id: 'posts-who-can-set',
    section: 'applies-to',
    railGroup: 'Posts',
    title: 'Who can set — Post author by default',
    useCase: 'Example attribute: Caveat / Releasability — Posts binding',
    bullets: [
      'Relational default Post author, extensible with Channel admin, System admin, or Other roles — the same picker component as Channels (§4.5)',
    ],
    lookFor: ['Post author chip', 'Add-role combobox'],
    preview: { kind: 'iframe', path: withFocus(ATTR('caveat'), 'posts-who-can-set') },
  },

  // ── Guardrails & governance ─────────────────────────────────────────────
  {
    id: 'name-uniqueness',
    section: 'guardrails',
    title: 'Duplicate names are blocked',
    lead: 'Confirmed (§3.2): attribute names must be unique across the catalog, matching how uniqueness already works today.',
    bullets: [
      'The shared GuardrailDialog already has fully-authored copy for a \'duplicate-name\' kind — "An attribute with this name already exists" / "Link to the existing attribute instead of creating a duplicate"',
    ],
    callout:
      'Honest build gap: nothing in the current create/edit screen triggers this guardrail yet. Eng should wire attribute-name entry to the existing dialog rather than build new UI.',
    lookFor: ['Unique name field'],
    preview: { kind: 'iframe', path: withFocus(CREATE_FLOW, 'attr-unique-name') },
  },
  {
    id: 'deactivate-vs-delete',
    section: 'guardrails',
    title: 'Deactivate is distinct from delete',
    bullets: [
      'Deactivating stops new assignments while existing values remain in place — it exists specifically so an admin doesn\'t have to fully delete an attribute just to freeze it',
      'Deactivating an attribute must not remove or unlink it from policies that still reference it — the policy reference persists after deactivation (§3.2)',
      'Delete requires both conditions clear at once: no policy usage AND no remaining resource bindings — deactivate first if you need to stop new assignments while values remain',
    ],
    callout:
      'Honest build gap: the MVP catalog\'s row actions currently expose only Edit / Duplicate / Delete — there is no separate Deactivate action yet. The broader Simplified Hub already wires this action and its guardrail; this screen needs the equivalent.',
    lookFor: ['Kebab menu — Edit / Duplicate / Delete'],
    preview: { kind: 'iframe', path: withFocus(MVP_ROUTE, 'row-menu-delete-blocked') },
  },
  {
    id: 'catalog-masking',
    section: 'guardrails',
    title: 'Need-to-know masking in the catalog',
    lead: 'Confirmed requirement (§3.2, V-004): admins browsing the catalog only see attribute option values they are themselves authorized to access, via the same server-side value-masking mechanism already specified for policy-rule values.',
    bullets: [
      'This is distinct from Value visibility (§4.3) — Value visibility is end-user-facing (do peers see all of your values or only their own); catalog masking is about which values an admin can see in the catalog itself, regardless of Value visibility\'s setting',
      'Program\'s seed values foreshadow this: three of its four options are already generic "Restricted" placeholder labels rather than real program names — a preview of what masked-out values should look like everywhere',
    ],
    callout:
      'Honest build gap: the current MVP catalog and detail views render every option value unmasked to any admin who reaches the Hub. Masking needs to be wired into the catalog and detail value lists to match this confirmed requirement.',
    lookFor: ['Program — Options column showing AURORA + 3× "Restricted"'],
    preview: { kind: 'iframe', path: withFocus(ATTR('program'), 'attr-values') },
  },

  // ── Customer stories ─────────────────────────────────────────────────────
  {
    id: 'story-program-aurora',
    section: 'use-cases',
    title: 'Program Security Officer — AURORA read-in',
    useCase:
      'Customer story: Program Security Officer restricting AURORA-related discussion to read-in personnel',
    bullets: [
      'Attribute: Program (Multiselect, synced from UAS) — applies to Users and Channels',
      'Users binding: Value visibility restricted to values the viewer holds — an officer read into AURORA sees "AURORA" on peers\' profiles; everyone else sees only their own program(s)',
      'Channels binding: Channel admin plus an added Program Security Officers grant can set the value, displayed in the channel header and sidebar',
      'Downstream: this is the same Program attribute Global Membership Policies\' "Dragon Spacecraft" story consumes via a channel-attribute scope rule — this Hub is where Program itself gets defined; GMP is where it gets enforced',
    ],
    lookFor: ['Program — Users and Channels cards'],
    preview: { kind: 'iframe', path: withFocus(ATTR('program'), 'users-value-visibility') },
  },
  {
    id: 'story-noforn-caveat',
    section: 'use-cases',
    title: 'Security officer — NOFORN handling',
    useCase:
      'Customer story: preventing foreign-national access to NOFORN-marked channels and posts',
    bullets: [
      'Attribute: Caveat / Releasability (Multiselect, manually managed) — applies to Channels and Posts, not Users; enforced via Nationality, not Clearance',
      'Channels binding: Channel admin sets the value, displayed in header and sidebar',
      'Posts binding: Post author sets it per-message, shown in the composer and message header',
      'Downstream: Global Membership Policies\' "NOFORN handling caveat" story targets channels where Releasability is NOFORN via a channel-attribute scope rule — this Hub is where the Caveat / Releasability values and their Channels display are configured in the first place',
    ],
    lookFor: ['Caveat / Releasability — Channels and Posts cards'],
    preview: { kind: 'iframe', path: withFocus(ATTR('caveat'), 'channels-who-can-set') },
  },
  {
    id: 'story-clearance-classification',
    section: 'use-cases',
    title: 'Security Administrator — one tier scale, two attributes',
    useCase:
      'Customer story: keeping channel classification ranks aligned 1:1 with personnel clearance tiers',
    bullets: [
      'Clearance (Ranked, synced from UAS, Users only) owns the shared tier scale: Unclassified / Protected A / Protected B',
      'Classification (Ranked-hierarchical, Channels/Posts/Teams) mirrors that same scale via a `valuesLink` — display-only handling markings nest beneath each tier',
      'This is the mechanic that keeps the two scales from drifting apart, which matters because Global Membership Policies\' hero comparison is literally "User:Clearance is at least Channel:Classification" — the two sides need to speak the same tiers',
      'Clearance is sync-locked here (read-only values); Classification is the pre-existing read-only attribute covered earlier in this tour',
    ],
    lookFor: ['Clearance — Definition panel, read-only tier scale'],
    preview: { kind: 'iframe', path: withFocus(ATTR('clearance'), 'attr-values') },
  },
  {
    id: 'story-duty-cost',
    section: 'use-cases',
    title: 'Not everything is classification data',
    useCase:
      'Customer story: day-to-day operational attributes with no security enforcement behind them',
    bullets: [
      'Duty status (Select, manually managed, Users) — Members set their own status (On duty / Off duty / On leave / TDY); self-service by design, and never policy-bound, so it never triggers the self-edit warning',
      'Cost center (Text, manually managed, Users) — Finance-controlled, System-admin-set only; this is the attribute this tour\'s self-edit-warning demo borrows, precisely because switching it to Member is a real, watchable transition',
      'The contrast is the point: self-edit is completely normal for attributes like Duty status. The warning exists only for the narrower case of a Members-settable attribute that is also policy-bound',
    ],
    lookFor: ['Duty status — Who can set radios, already on Member'],
    preview: { kind: 'iframe', path: withFocus(ATTR('duty-status'), 'users-who-can-set') },
  },

  // ── Licensing ────────────────────────────────────────────────────────────
  {
    id: 'licensing-split',
    section: 'licensing',
    title: 'Licensing is split by resource, not one blanket SKU',
    lead: 'Confirmed this revision, superseding the earlier narrow-track blanket-Enterprise-Advanced framing (§7).',
    bullets: [
      'Available on all plans: the core Hub UI — catalog, definitions, and the Users applies-to card. This Hub replaces the existing User Attributes page, which itself ships on all plans, so parity requires the same floor',
      'Enterprise Advanced-gated: applying an attribute to Channels or Posts — and by extension any configuration that targets them',
    ],
    callout:
      'Eng note, not yet built (§4.1, §7): on a lower-tier license, the Add-resource menu\'s Channels/Posts entries should render as gated/upsell rather than plain enabled options. `MvpAddResourceMenu.tsx` in this build has no license-tier concept and always offers all three resource types unconditionally — verify the exact gated-state treatment with design before implementing.',
    lookFor: ['Add resource menu — Channels and Posts both plainly enabled today'],
    preview: { kind: 'iframe', path: withFocus(ATTR('cost-center'), 'add-resource-menu') },
  },

  // ── Mobile ───────────────────────────────────────────────────────────────
  {
    id: 'mobile-split',
    section: 'mobile',
    title: 'A split posture, not one statement',
    bullets: [
      'Admin configuration (the catalog, create flow, and Applies-to cards) is desktop-only, consistent with System Console convention generally — there is no mobile admin surface for this Hub',
      'End-user-facing attribute display (channel header/sidebar chips, in-channel post view, message input box, profile display) follows normal Mattermost mobile parity like any other channel or post metadata — no special-cased mobile behavior, no degraded mobile experience beyond what already applies today (§6)',
    ],
    lookFor: [],
    preview: { kind: 'iframe', path: withFocus(MVP_ROUTE, 'attr-table') },
  },

  // ── Wrap-up ──────────────────────────────────────────────────────────────
  {
    id: 'wrap-up',
    section: 'appendix',
    title: 'Confirmed this revision vs. still open',
    bullets: [
      'Confirmed requirements (this revision) — some already built, some flagged honestly above as build gaps: duplicate-name blocking, type-lock at ≥1 policy use, delete/deactivate bindings-clearing, Required-binding backfill, catalog value masking, the licensing split, and the self-edit warning (built for this walkthrough)',
      'Future Considerations (§10) — deferred, not confirmed for P0:',
      {
        text: 'Hidden Allowed-values panel',
        sub: [
          'A fully-implemented per-resource allowed-value subset panel exists behind `?allowed=on` — off by default, pending a scope decision on whether it ships. Not part of this tour\'s main flow.',
        ],
      },
      {
        text: 'Ceiling-rule / inheritance re-activation',
        sub: [
          'Already built in the shared component library, suppressed for P0 via a single prop — a flag-flip plus reintroducing Teams, not a rebuild, if revisited later.',
        ],
      },
      {
        text: 'Per-resource naming ("Name on {resource}")',
        sub: [
          'A label-generation helper exists in code but is never called — dead code, no current design intent to revive it without a fresh scoping pass.',
        ],
      },
    ],
    lookFor: [],
    preview: { kind: 'iframe', path: withFocus(MVP_ROUTE, 'attr-table') },
  },
];
