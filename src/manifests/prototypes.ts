import type { ComponentType } from 'react';
import ExampleFlow from '@/pages/example-flow/ExampleFlow';
import ExternalCallParticipants from '@/pages/ExternalCallParticipants/ExternalCallParticipants';
import SimulateAccess from '@/pages/SimulateAccess/SimulateAccess';
import PBEFinalDesignV2 from '@/pages/PBEFinalDesignV2/PBEFinalDesignV2';
import MaskingNoticeOptions from '@/pages/MaskingNoticeOptions/MaskingNoticeOptions';
import A1 from '@/pages/dpc/a1/A1';
import A2 from '@/pages/dpc/a2/A2';
import A3 from '@/pages/dpc/a3/A3';
import A4 from '@/pages/dpc/a4/A4';
import A1V2 from '@/pages/dpc-v2/a1/A1';
import Walkthrough from '@/pages/dpc-v2/walkthrough/Walkthrough';
import DPCComparison from '@/pages/dpc/comparison/Comparison';
import MembershipPoliciesTeams from '@/pages/MembershipPoliciesTeams/MembershipPoliciesTeams';
import ChannelPermissionRules from '@/pages/ChannelPermissionRules/ChannelPermissionRules';
import ChannelPermissionRulesFinal from '@/pages/ChannelPermissionRulesFinal/ChannelPermissionRulesFinal';
import SessionAttributes from '@/pages/SessionAttributes/SessionAttributes';
import AttributeSystem from '@/pages/attribute-system/AttributeSystem';
import AttributeManagementV2 from '@/pages/AttributeManagementV2/AttributeManagementV2';
import AttributeManagementVariationB from '@/pages/AttributeManagementVariationB/AttributeManagementVariationB';
import AttributeManagementVariationC from '@/pages/AttributeManagementVariationC/AttributeManagementVariationC';
import AttributeManagementVariationD from '@/pages/AttributeManagementVariationD/AttributeManagementVariationD';
import AttributeManagementVariationE from '@/pages/AttributeManagementVariationE/AttributeManagementVariationE';
import AttributeManagementVariationF from '@/pages/AttributeManagementVariationF/AttributeManagementVariationF';
import HierarchicalAttributesLanding from '@/pages/hierarchical-attributes/Landing';
import HierarchicalAttributesD1 from '@/pages/hierarchical-attributes/d1/D1';
import HierarchicalAttributesD1ModalOnly from '@/pages/hierarchical-attributes/d1-modal-only/D1ModalOnly';
import HierarchicalAttributesD1PolicyEditor from '@/pages/hierarchical-attributes/d1/PolicyEditorPage';
import HierarchicalAttributesD1UserConfig from '@/pages/hierarchical-attributes/d1/UserConfigPage';
import HierarchicalAttributesD2 from '@/pages/hierarchical-attributes/d2/D2';
import HierarchicalAttributesD3 from '@/pages/hierarchical-attributes/d3/D3';
import HierarchicalAttributesStateMatrix from '@/pages/hierarchical-attributes/StateMatrix';
import N01ProductsTopStrip from '@/pages/nav-concepts/n01-products-top-strip/N01ProductsTopStrip';
import N02ProductsLeftRail from '@/pages/nav-concepts/n02-products-left-rail/N02ProductsLeftRail';
import N03ClassicTeamStrip from '@/pages/nav-concepts/n03-classic-team-strip/N03ClassicTeamStrip';
import N04CompactTeam from '@/pages/nav-concepts/n04-compact-team/N04CompactTeam';
import N05ChannelCentric from '@/pages/nav-concepts/n05-channel-centric/N05ChannelCentric';
import NavConceptsIndex from '@/pages/nav-concepts/NavConceptsIndex';
import DataSpillageSeenBy from '@/pages/DataSpillageSeenBy/DataSpillageSeenBy';
import DeliveredWizardPage from '@/pages/DataSpillageDelivered/DeliveredWizardPage';
import DeliveredInlinePage from '@/pages/DataSpillageDelivered/DeliveredInlinePage';
import DeliveredHybridPage from '@/pages/DataSpillageDelivered/DeliveredHybridPage';
import DeliveredV4Page from '@/pages/DataSpillageDelivered/DeliveredV4Page';
import DataSpillageConsole from '@/pages/DataSpillageConsole/DataSpillageConsole';
import NarrowTrackClassificationOptions from '@/pages/NarrowTrackClassificationOptions/NarrowTrackClassificationOptions';
import AttributeManagementClassificationSetup from '@/pages/AttributeManagementClassificationSetup/AttributeManagementClassificationSetup';
import MembershipPolicyEditorGeneric from '@/pages/MembershipPolicyEditorGeneric/MembershipPolicyEditorGeneric';
import CreateChannelClassificationPicker from '@/pages/CreateChannelClassificationPicker/CreateChannelClassificationPicker';
import AttributeManagementHub from '@/pages/AttributeManagementHub/AttributeManagementHub';
import AttributeHubBasicsAdvanced from '@/pages/AttributeHubBasicsAdvanced/AttributeHubBasicsAdvanced';
import AttributeHubStreamlined from '@/pages/AttributeHubStreamlined/AttributeHubStreamlined';
import AttributeHubSimplified from '@/pages/AttributeHubSimplified/AttributeHubSimplified';
import AttributeHubSimplifiedInlineSummary from '@/pages/AttributeHubSimplifiedInlineSummary/AttributeHubSimplifiedInlineSummary';
import AttributeHubMVP from '@/pages/AttributeHubMVP/AttributeHubMVP';
import WhoCanSetOptions from '@/pages/WhoCanSetOptions/WhoCanSetOptions';

export type PrototypeGroup =
  | 'navigation'
  | 'zero-trust-abac'
  | 'data-policy'
  | 'encryption-privacy'
  | 'calls-platform';

export type GroupMeta = {
  label: string;
  accentColor: string;
};

export const GROUP_META: Record<PrototypeGroup, GroupMeta> = {
  navigation: {
    label: 'Navigation',
    accentColor: 'var(--color-indigo-400)',
  },
  'zero-trust-abac': {
    label: 'Zero Trust ABAC',
    accentColor: 'var(--color-blue-500)',
  },
  'data-policy': {
    label: 'Data Policy',
    accentColor: 'var(--color-orange-500)',
  },
  'encryption-privacy': {
    label: 'Encryption & Privacy',
    accentColor: 'var(--color-green-500)',
  },
  'calls-platform': {
    label: 'Platform & Calls',
    accentColor: 'var(--color-cyan-400)',
  },
};

export type PrototypeCollection = 'attribute-management';

export type PrototypeEntry = {
  id: string;
  label: string;
  path: string;
  component: ComponentType;
  group: PrototypeGroup;
  description?: string;
  addedAt: string; // ISO date YYYY-MM-DD, used for recency sorting
  isPrimary?: boolean; // primary/index entry for a group — shown in the "Recently Updated" strip
  collections?: PrototypeCollection[];
};

export const PROTOTYPES: PrototypeEntry[] = [
  // "Who can set the value" — 3 redesign options for the per-resource setter
  // control, optimized for the 80/10/5 usage curve (2026-07-05)
  {
    id: 'who-can-set-options',
    label: 'Who Can Set the Value — 3 options',
    path: '/prototypes/who-can-set-options',
    component: WhoCanSetOptions,
    group: 'zero-trust-abac',
    description:
      'Three progressive-disclosure redesigns of the per-resource “Who can set the value” control from the Attribute Management Hub, optimized for the real usage curve (~80% keep the default, ~10% pick another quick default, ~5% add a role, fewer combine grants). Option 1 Statement + Change (prose-first), Option 2 Quick-pick pills + Advanced, Option 3 Dropdown + Custom access. Each card is live and shares the CapabilityGrants editor for the complex case.',
    addedAt: '2026-07-05',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  {
    id: 'narrow-track-classification-options',
    label: 'Classification & Clearance — 3 approaches (comparison)',
    path: '/prototypes/narrow-track-classification-options',
    component: NarrowTrackClassificationOptions,
    group: 'zero-trust-abac',
    description:
      'Phase 6a low-fi comparison of three narrow-track approaches — A Constrained Console, B Guided Guardrail (recommended), C Lightweight Native — across all 5 surfaces (link, system-wide scope + static warning, constrained ceiling, delegated roles, continuous re-eval / removal notice). Harness switches approach × surface × state; the product canvas renders pristine System Console UI. Deep-linkable via ?approach=a|b|c&surface=s1-link|s2-scope|s3-ceiling|s4-roles|s5-removal&state=default|populated|posture.',
    addedAt: '2026-07-02',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // create/edit/review all first-class, in the System Console (2026-07-04)
  {
    id: 'attribute-management-hub',
    label: 'Attribute Management · Hub',
    path: '/prototypes/attribute-management-hub',
    component: AttributeManagementHub,
    group: 'zero-trust-abac',
    description:
      'Equal-weight hub for every attribute (define-once): a System Console catalog table with resource-type + source filters, search, and [+ New attribute]; row actions (Edit attribute, Bulk operations…, Deactivate attribute, Delete attribute); a drill-in workspace with Definition (derived eligibility), an adaptive Values editor (hierarchical Classification tree with tier vs display-only rows, drag-reorder, disable-not-delete, delete-blocked-in-use, Import-from-matrix, and Reuse→Linked/Unlink), per-resource Applies-to, a full Access delegation editor, and a Source panel for synced attributes; a 4-step create wizard; and real guardrail states. Deep-linkable via ?attr=<id>, ?flow=new|reuse, ?sheet=bulk, ?guard=duplicate-name|values-locked|deactivate-blocked|delete-blocked|unlink-gated|source-stale.',
    addedAt: '2026-07-04',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // Global Attributes MVP (P0) — ruthlessly-scoped cut for dev handoff (2026-07-08)
  {
    id: 'attribute-hub-mvp',
    label: 'Attribute Management · MVP (P0)',
    path: '/prototypes/attribute-hub-mvp',
    component: AttributeHubMVP,
    group: 'zero-trust-abac',
    description:
      'P0 scope cut of Global Attributes (epic MM-69673) for the dev handoff / scope session. Define an attribute once + choose which of Users/Channels/Posts can use it — no assignment/enforcement. Trims the Simplified design: no Ranked-Hierarchical/tree, no reuse/shared-scale, no per-attribute who-can-edit (delegated via DGA), no inheritance, no Teams. Per-resource: Required, Default value, Who-can-set; Users add Profile display + Value visibility; Channels add Display location. Externally-synced attrs show managed-by-source + locked fields. Classification appears read-only. Deep-links: ?attr=<id>, ?flow=new, ?allowed=on (reveals the open allowed-values control).',
    addedAt: '2026-07-08',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // Section-by-section simplification of the Hub, built with the user (2026-07-06)
  {
    id: 'attribute-hub-simplified',
    label: 'Attribute Management · Simplified',
    path: '/prototypes/attribute-hub-simplified',
    component: AttributeHubSimplified,
    group: 'zero-trust-abac',
    description:
      'Section-by-section simplification of the Hub detail page: Definition panel absorbs the adaptive Values editor (chip row for flat types, tree only for hierarchical; no Description field, no separate Values/Source panels); first-class Applies-to with summary rows (plain-language line per resource, expand in place) and a single Who-can-set dropdown; a single "Who can edit this attribute" roles+people picker; and create-as-detail-page blank/guided mode (?flow=new, no wizard). Deep-links: ?attr=<id>, ?flow=new.',
    addedAt: '2026-07-06',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // Simplified hub — inline applies-to row summary (chip alternative) (2026-07-08)
  {
    id: 'attribute-hub-simplified-inline-summary',
    label: 'Attribute Management · Simplified (inline summary)',
    path: '/prototypes/attribute-hub-simplified-inline-summary',
    component: AttributeHubSimplifiedInlineSummary,
    group: 'zero-trust-abac',
    description:
      'Copy of the Simplified hub with an alternate Applies-to row display: collapsed resources show a single-line secondary summary (key–value segments joined with middle dots, truncated on overflow) under the resource title instead of summary chips. Compare side-by-side with the chip variant. Deep-links: ?attr=<id>, ?flow=new.',
    addedAt: '2026-07-08',
    collections: ['attribute-management'],
  },
  // Drill-in re-ideation after "kitchen sink" feedback — A/B comparison (2026-07-06)
  {
    id: 'attribute-hub-basics-advanced',
    label: 'Attribute Management · Basics + Advanced (B)',
    path: '/prototypes/attribute-hub-basics-advanced',
    component: AttributeHubBasicsAdvanced,
    group: 'zero-trust-abac',
    description:
      'Approach B (recommended) for the attribute drill-in: a Basics form for the 90% case (name, type, values, applies-to, per-resource who-can-set dropdown) with one Advanced door for the 10% case (edit/manage access split, per-resource value subsets, read-into filtering, inheritance, attribute-rule setters). Inline add-a-row create with opt-in guided wizard; unified "Shared value scale"; access-layer meta-recursion cut. Compliance guardrails stay visible in Basics as locked pills.',
    addedAt: '2026-07-06',
    collections: ['attribute-management'],
  },
  {
    id: 'attribute-hub-streamlined',
    label: 'Attribute Management · Streamlined (A)',
    path: '/prototypes/attribute-hub-streamlined',
    component: AttributeHubStreamlined,
    group: 'zero-trust-abac',
    description:
      'Approach A (the aggressive-cut pole) for the attribute drill-in: a single flat page with one setter per attribute (no per-resource grant editors), one "who can edit" owner list, no per-resource value subsets, and read-into as a read-only status only. Deliberately reverses locked per-resource-type ownership — built for side-by-side comparison against Approach B. Inline add-a-row create; unified "Shared value scale".',
    addedAt: '2026-07-06',
    collections: ['attribute-management'],
  },
  // generic attribute-requirement policy editor, cascading channel picker (2026-07-03)
  {
    id: 'attribute-management-classification-setup',
    label: 'Attribute Management · Classification setup (E)',
    path: '/prototypes/attribute-management-classification-setup',
    component: AttributeManagementClassificationSetup,
    group: 'zero-trust-abac',
    description:
      'Classification modeled as ONE ranked-hierarchical attribute: ranked tiers form the spine compared against Clearance, with display-only sub-markings (Official use only; TLP branch) nested beneath. Releasability is a separate Select attribute (compared against Nationality). Detail view renders the hierarchy as a tree with rank badges, a "Display only" tag on nested rows, and a "Linked to Clearance" scale indicator. Deep-linkable via ?attr=classification|releasability|clearance.',
    addedAt: '2026-07-03',
    collections: ['attribute-management'],
  },
  {
    id: 'membership-policy-editor-generic',
    label: 'Membership Policy editor · attribute requirements',
    path: '/prototypes/membership-policy-editor-generic',
    component: MembershipPolicyEditorGeneric,
    group: 'zero-trust-abac',
    description:
      'System Console membership policy editor authored as attribute-requirement rows ([User attribute] [operator] [value or variable]) across multiple attribute types — ranked clearance-vs-classification variable, multiselect program variable, select nationality literal. Type-aware operators; variables render distinctly from literals. Simplified scope: "All channels it can evaluate" with a coverage preview (covered / skipped) plus optional limit-to-specific-channels. Deep-linkable via ?state=default|populated|loading|error|disabled|empty.',
    addedAt: '2026-07-03',
    collections: ['attribute-management'],
  },
  {
    id: 'create-channel-classification-picker',
    label: 'Create channel · classification picker',
    path: '/prototypes/create-channel-classification-picker',
    component: CreateChannelClassificationPicker,
    group: 'zero-trust-abac',
    description:
      'Create-a-new-channel modal with a cascading hierarchical Classification picker matching the ranked-hierarchical tree (Unclassified / Unclassified — Official use only / Unclassified — TLP ▸ / Protected A / Protected B), filtered to the user\'s own attributes, no free text. Releasability/Caveat stays a separate multiselect field. Deep-linkable via ?state=default|populated|loading|error|disabled|empty.',
    addedAt: '2026-07-03',
    collections: ['attribute-management'],
  },
  // ── Data Policy ───────────────────────────────────────────────────────────────
  // Data Spillage Handling — "Seen by" confidence-tiered exposure roster (2026-06-18)
  {
    id: 'data-spillage-seen-by',
    label: 'Data Spillage · Seen By (v1 · confidence-tiered)',
    path: '/prototypes/data-spillage-seen-by',
    component: DataSpillageSeenBy,
    group: 'data-policy',
    description:
      'V1 for comparison: Content Reviewer "Seen by" lookup with confidence-tiered roster (Confirmed / May have / Reached beyond), filter + search, collapsible sections.',
    addedAt: '2026-06-18',
    isPrimary: true,
  },
  // Data Spillage Handling — "Delivered to" model, removal wizard (2026-06-19)
  {
    id: 'data-spillage-delivered-wizard',
    label: 'Data Spillage · Delivered To (v2 · remove wizard)',
    path: '/prototypes/data-spillage-delivered-wizard',
    component: DeliveredWizardPage,
    group: 'data-policy',
    description:
      'V2: flat "Delivered to" recipient list (equal confidence) + integrations/webhooks section. Removal is a multi-step wizard that captures the recipient list before deletion; disabled state once removed.',
    addedAt: '2026-06-19',
    isPrimary: true,
  },
  // Data Spillage Handling — "Delivered to" model, inline remove + disabled state (2026-06-19)
  {
    id: 'data-spillage-delivered-inline',
    label: 'Data Spillage · Delivered To (v2 · inline remove)',
    path: '/prototypes/data-spillage-delivered-inline',
    component: DeliveredInlinePage,
    group: 'data-policy',
    description:
      'V2 alternative: same flat "Delivered to" model, but removal is a single confirmation with a capture-first warning instead of a wizard; disabled state once removed.',
    addedAt: '2026-06-19',
  },
  // Data Spillage Handling — "Delivered to" model, CSV-download hybrid (2026-06-19)
  {
    id: 'data-spillage-delivered-hybrid',
    label: 'Data Spillage · Delivered To (v3 · CSV download, no modal)',
    path: '/prototypes/data-spillage-delivered-hybrid',
    component: DeliveredHybridPage,
    group: 'data-policy',
    description:
      'V3 hybrid: no in-app recipient modal — inline summary (count + integration-leak flag) plus a CSV download for full detail. Removal uses the existing download-report confirm with a "generate the Delivered to list first" notice; disabled state once removed.',
    addedAt: '2026-06-19',
  },
  // Data Spillage Handling — "Delivered to" v4 (design variation + vetted copy) (2026-06-22)
  {
    id: 'data-spillage-delivered-v4',
    label: 'Data Spillage · Delivered To (v4 · latest)',
    path: '/prototypes/data-spillage-delivered-v4',
    component: DeliveredV4Page,
    group: 'data-policy',
    description:
      'V4 (current): refined hybrid from the latest design variation — ready summary reads "N users · N integrations", "Download recipient list", "Finding recipients…" fetch, and the remove confirm carries the "Delivered to list not generated" warning. All copy run through the ux-copy-reviewer skill.',
    addedAt: '2026-06-22',
    isPrimary: true,
  },

  // Data Spillage Handling — System Console config + "Delivered to" controls (2026-06-24)
  {
    id: 'data-spillage-console',
    label: 'Data Spillage · System Console config',
    path: '/prototypes/data-spillage-console',
    component: DataSpillageConsole,
    group: 'data-policy',
    description:
      'System Console "Data Spillage Handling" settings page recreated, plus the new "Delivered to" controls: enable/disable, and scope to All channels or a selected set (progressive disclosure + channel chip picker).',
    addedAt: '2026-06-24',
    isPrimary: true,
  },

  // ── Navigation ──────────────────────────────────────────────────────────────
  // Global Navigation Redesign — 5 concepts on locked architecture (2026-05-26)
  {
    id: 'nav-concepts-index',
    label: 'Nav Concepts · Index (all 5)',
    path: '/prototypes/nav-concepts',
    component: NavConceptsIndex,
    group: 'navigation',
    description:
      'Five competing global navigation architectures. Compare product-first and team-first layouts side by side.',
    addedAt: '2026-05-26',
    isPrimary: true,
  },
  {
    id: 'nav-n01-products-top-strip',
    label: 'Nav N01 · Products Top Strip (PF)',
    path: '/prototypes/nav-concepts/n01-products-top-strip',
    component: N01ProductsTopStrip,
    group: 'navigation',
    description:
      'Horizontal product bar across the top with standard left channel sidebar.',
    addedAt: '2026-05-26',
  },
  {
    id: 'nav-n02-products-left-rail',
    label: 'Nav N02 · Products Left Rail (PF)',
    path: '/prototypes/nav-concepts/n02-products-left-rail',
    component: N02ProductsLeftRail,
    group: 'navigation',
    description:
      'Dedicated left rail for product switching, pushing the team list inward.',
    addedAt: '2026-05-26',
  },
  {
    id: 'nav-n03-classic-team-strip',
    label: 'Nav N03 · Classic Team Strip (TF)',
    path: '/prototypes/nav-concepts/n03-classic-team-strip',
    component: N03ClassicTeamStrip,
    group: 'navigation',
    description:
      'Preserves the familiar vertical team strip in a team-first layout.',
    addedAt: '2026-05-26',
  },
  {
    id: 'nav-n04-compact-team',
    label: 'Nav N04 · Compact Team (TF)',
    path: '/prototypes/nav-concepts/n04-compact-team',
    component: N04CompactTeam,
    group: 'navigation',
    description:
      'Minimal team-first layout optimized for single-workspace operators.',
    addedAt: '2026-05-26',
  },
  {
    id: 'nav-n05-channel-centric',
    label: 'Nav N05 · Channel-Centric Hybrid',
    path: '/prototypes/nav-concepts/n05-channel-centric',
    component: N05ChannelCentric,
    group: 'navigation',
    description:
      'De-emphasizes teams; channels are the primary navigation surface.',
    addedAt: '2026-05-26',
  },

  // ── Zero Trust ABAC ─────────────────────────────────────────────────────────
  // Attribute Management — Variation A (single list + resource filter) on the
  // Agents-style product-switcher pattern. Replaces the rejected B/C-hybrid build.
  {
    id: 'attribute-management',
    label: 'Attribute Management',
    path: '/prototypes/attribute-management',
    component: AttributeManagementV2,
    group: 'zero-trust-abac',
    description:
      'Variation A: single list of all attributes (users + channels + posts + teams) on the Agents-style product-switcher shell. Fully interactive: restricted-value masking, manage values & order (locked vs editable), reuse-values linking + unlink, per-resource applies-to config with the post inheritance ceiling, self-edit→eligibility, disabled-state tooltips, new-attribute flow, and guardrail dry-runs. Every state is deep-linkable (?attr, ?sheet=order, ?flow=new, ?guard=).',
    addedAt: '2026-07-01',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // Attribute Management — Variation C (table catalog + resource dropdown)
  {
    id: 'attribute-management-table',
    label: 'Attribute Management · Table catalog (C)',
    path: '/prototypes/attribute-management-table',
    component: AttributeManagementVariationC,
    group: 'zero-trust-abac',
    description:
      'Variation C: same full-page shell and detail drill-in as A, but the catalog uses the shipped User Attributes table (Property · Type · Values · Actions). Built-in profile fields appear when filtered to Users. Resource scope is a dropdown ("Applies to: …") instead of pills. Eligibility audit, guardrails, and deep-links match A.',
    addedAt: '2026-07-01',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  {
    id: 'attribute-management-resource-values',
    label: 'Attribute Management · Per-resource values (D)',
    path: '/prototypes/attribute-management-resource-values',
    component: AttributeManagementVariationD,
    group: 'zero-trust-abac',
    description:
      'Variation D: extends the table catalog (C) with per-resource value overlays. Global catalog stays canonical — values are never deleted. Admins disable base values for new assignments on a specific resource (existing assignments preserved). Configure under Applies to → Allowed values on {resource}.',
    addedAt: '2026-07-01',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  {
    id: 'attribute-management-console',
    label: 'Attribute Management · System Console (E)',
    path: '/prototypes/attribute-management-console',
    component: AttributeManagementVariationE,
    group: 'zero-trust-abac',
    description:
      'Variation E: same per-resource value model as D, hosted inside the System Console. Attribute System → Manage Attributes is the active nav item; Membership and Permission Policies are consolidated under the same section. Responds to feedback that attribute admin should stay in-console with delegated access rather than a separate product shell.',
    addedAt: '2026-07-04',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  {
    id: 'attribute-management-console-counts',
    label: 'Attribute Management · Console value counts (F)',
    path: '/prototypes/attribute-management-console-counts',
    component: AttributeManagementVariationF,
    group: 'zero-trust-abac',
    description:
      'Variation F: System Console variant (same as E) where the catalog table shows value counts only (e.g. "4 values") instead of inline chips. Full value lists and per-resource enable/disable live on the attribute detail page. Externally synced attributes still show Managed by UAS/LDAP sync indicators in the table.',
    addedAt: '2026-07-04',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // Attribute Management — Variation B (two areas: Attributes + User Attributes)
  // on the same Agents-style shell. Reuses Variation A's shared components.
  {
    id: 'attribute-management-b',
    label: 'Attribute Management · Two-area (B)',
    path: '/prototypes/attribute-management-b',
    component: AttributeManagementVariationB,
    group: 'zero-trust-abac',
    description:
      'Variation B: two top-level areas — Resource Attributes (Channels/Posts/Teams, with the drill-in detail) and User Attributes (the shipped Property·Type·Values·Actions table — minus Promote-to-Global). Identical interactive detail, applies-to config, reuse linking, guardrails, and deep-links as A; the only divergence is catalog scope and the two-tab chrome. Cross-cutting attributes appear in both areas with cross-area links.',
    addedAt: '2026-07-01',
    collections: ['attribute-management'],
  },
  // Attribute System — global vs resource-level config, sysadmin vs team/channel admin (2026-06-23)
  {
    id: 'attribute-system',
    label: 'Attribute System · Config model (4 surfaces)',
    path: '/prototypes/attribute-system',
    component: AttributeSystem,
    group: 'zero-trust-abac',
    description:
      'Three-layer attribute config (Definition / Binding / Assignment) mapped onto the Property Permissions Proposal. Switch across 4 surfaces: System Console Global + Channel attributes (system admin), Team Settings (team admin define_scoped), and channel-admin value assignment. Demonstrates required, header display, closed vocabulary, locked-after-set, owners/masking, and delegation.',
    addedAt: '2026-06-23',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  {
    id: 'hierarchical-attributes-landing',
    label: 'Hierarchical Attributes (dual-direction)',
    path: '/hierarchical-attributes',
    component: HierarchicalAttributesLanding,
    group: 'zero-trust-abac',
    description:
      'Ranked attribute inheritance — dual-direction flow where leaders push values down and challengers propose up.',
    addedAt: '2026-05-22',
    isPrimary: true,
  },
  {
    id: 'hierarchical-attributes-d1',
    label: 'Hierarchical Attributes · D1 (leader)',
    path: '/hierarchical-attributes/d1',
    component: HierarchicalAttributesD1,
    group: 'zero-trust-abac',
    description:
      'Admin assigns ranked values that cascade to subordinate channels.',
    addedAt: '2026-05-22',
  },
  {
    id: 'hierarchical-attributes-d1-modal-only',
    label: 'Hierarchical Attributes · D1 (modal-only variant)',
    path: '/hierarchical-attributes/d1-modal-only',
    component: HierarchicalAttributesD1ModalOnly,
    group: 'zero-trust-abac',
    description:
      'Isolates the attribute assignment dialog for focused stakeholder review.',
    addedAt: '2026-05-22',
  },
  {
    id: 'hierarchical-attributes-d1-policy-editor',
    label: 'Hierarchical Attributes · D1 · Membership Policy Editor',
    path: '/hierarchical-attributes/d1/policy-editor',
    component: HierarchicalAttributesD1PolicyEditor,
    group: 'zero-trust-abac',
    description:
      'Configure attribute-linked membership access rules per channel.',
    addedAt: '2026-05-22',
  },
  {
    id: 'hierarchical-attributes-d1-user-config',
    label: 'Hierarchical Attributes · D1 · User Configuration',
    path: '/hierarchical-attributes/d1/user-config',
    component: HierarchicalAttributesD1UserConfig,
    group: 'zero-trust-abac',
    description:
      'Configure a single user’s attributes, including a Ranked clearance picker that applies the proposed visibility rule.',
    addedAt: '2026-06-03',
  },
  {
    id: 'hierarchical-attributes-d2',
    label: 'Hierarchical Attributes · D2 (challenger)',
    path: '/hierarchical-attributes/d2',
    component: HierarchicalAttributesD2,
    group: 'zero-trust-abac',
    description:
      'User-initiated attribute proposals that bubble up for admin approval.',
    addedAt: '2026-05-22',
  },
  {
    id: 'hierarchical-attributes-d3',
    label: 'Hierarchical Attributes · D3 (inline + per-attribute popover)',
    path: '/hierarchical-attributes/d3',
    component: HierarchicalAttributesD3,
    group: 'zero-trust-abac',
    description:
      'Inline editing with per-attribute popover controls for rapid adjustment.',
    addedAt: '2026-05-22',
  },
  {
    id: 'hierarchical-attributes-state-matrix',
    label: 'Hierarchical Attributes · State Matrix',
    path: '/hierarchical-attributes/state-matrix',
    component: HierarchicalAttributesStateMatrix,
    group: 'zero-trust-abac',
    description:
      'Complete state matrix mapping all attribute value combinations and valid transitions.',
    addedAt: '2026-05-22',
  },
  {
    id: 'membership-policies-teams',
    label: 'Team Membership Policies',
    path: '/prototypes/membership-policies-teams',
    component: MembershipPoliciesTeams,
    group: 'zero-trust-abac',
    description:
      'Team-level membership policies extending ABAC enforcement to team join/leave flows.',
    addedAt: '2026-03-19',
  },
  {
    id: 'channel-permission-rules',
    label: 'Channel Permission Rules — Options Explorer',
    path: '/prototypes/channel-permission-rules',
    component: ChannelPermissionRules,
    group: 'zero-trust-abac',
    description:
      'Channel-level permission authoring with the clarity updates. Toggle Noun (rule/policy) × Container (slide-in/accordion/shipped) to compare all options; shared Conditions + Match mode + visible ceiling + blocked/self-lockout states.',
    addedAt: '2026-06-12',
  },
  {
    id: 'channel-permission-rules-final',
    label: 'Channel Permission Rules — Final (rule · slide-in)',
    path: '/prototypes/channel-permission-rules-final',
    component: ChannelPermissionRulesFinal,
    group: 'zero-trust-abac',
    description:
      'Locked direction from the persona panel: "rule" noun, slide-in editor, Match mode default-All. Adds a "How access is decided" explainer and an Effective Access summary so rule combination (any-of per action, capped by the system ceiling) is legible.',
    addedAt: '2026-06-12',
  },
  {
    id: 'session-attributes',
    label: 'Session Attributes (Zero Trust ABAC)',
    path: '/prototypes/session-attributes',
    component: SessionAttributes,
    group: 'zero-trust-abac',
    description:
      'Environmental attribute controls for session-scoped Zero Trust access decisions.',
    addedAt: '2026-02-10',
  },
  {
    id: 'simulate-access',
    label: 'Simulate access',
    path: '/prototypes/simulate-access',
    component: SimulateAccess,
    group: 'zero-trust-abac',
    description:
      'Interactive simulation of ABAC policy outcomes under different attribute configurations.',
    addedAt: '2025-09-01',
  },

  // ── Data Policy ─────────────────────────────────────────────────────────────
  {
    id: 'dpc-comparison',
    label: 'DPC: Comparison',
    path: '/prototypes/dpc/comparison',
    component: DPCComparison,
    group: 'data-policy',
    description:
      'Side-by-side comparison of four Data Policy Confirmation design approaches.',
    addedAt: '2025-12-15',
    isPrimary: true,
  },
  {
    id: 'dpc-v2-a1',
    label: 'DPC V2 A1: Revised (Phase 2-6 re-run)',
    path: '/prototypes/dpc-v2/a1',
    component: A1V2,
    group: 'data-policy',
    description:
      'Updated Confirm-and-Commit approach from the Phase 2-6 re-run with revised constraints.',
    addedAt: '2025-12-10',
  },
  {
    id: 'dpc-v2-walkthrough',
    label: 'DPC V2 A1: Click-through walkthrough',
    path: '/prototypes/dpc-v2/walkthrough',
    component: Walkthrough,
    group: 'data-policy',
    description:
      'End-to-end click-through walkthrough of the revised A1 flow.',
    addedAt: '2025-12-10',
  },
  {
    id: 'dpc-a1',
    label: 'DPC A1: Confirm-and-Commit',
    path: '/prototypes/dpc/a1',
    component: A1,
    group: 'data-policy',
    description:
      'Direct acknowledgment gate before policy-controlled actions.',
    addedAt: '2025-10-15',
  },
  {
    id: 'dpc-a2',
    label: 'DPC A2: Intent-Wizard',
    path: '/prototypes/dpc/a2',
    component: A2,
    group: 'data-policy',
    description:
      'Guided step wizard to declare intent before policy enforcement.',
    addedAt: '2025-10-15',
  },
  {
    id: 'dpc-a3',
    label: 'DPC A3: Curated Directory',
    path: '/prototypes/dpc/a3',
    component: A3,
    group: 'data-policy',
    description:
      'Pre-approved recipient list for policy-compliant sharing.',
    addedAt: '2025-10-15',
  },
  {
    id: 'dpc-a4',
    label: 'DPC A4: Knock-by-Reference',
    path: '/prototypes/dpc/a4',
    component: A4,
    group: 'data-policy',
    description:
      'Async approval request flow for policy overrides.',
    addedAt: '2025-10-15',
  },

  // ── Encryption & Privacy ────────────────────────────────────────────────────
  {
    id: 'pbe-final-v2',
    label: 'PBE Final Design V2',
    path: '/prototypes/pbe-final-v2',
    component: PBEFinalDesignV2,
    group: 'encryption-privacy',
    description:
      'Final design for Program-Based Encryption — SAP channel key isolation and content masking.',
    addedAt: '2026-01-20',
    isPrimary: true,
  },
  {
    id: 'masking-notice-options',
    label: 'PR 36517: Masked-policy notice options',
    path: '/prototypes/masking-notice-options',
    component: MaskingNoticeOptions,
    group: 'encryption-privacy',
    description:
      'Disclosure notice pattern options for masked-policy channels.',
    addedAt: '2026-01-20',
  },

  // ── Platform & Calls ────────────────────────────────────────────────────────
  {
    id: 'external-call-participants',
    label: 'External Call Participants',
    path: '/prototypes/external-call-participants',
    component: ExternalCallParticipants,
    group: 'calls-platform',
    description:
      'External participant management for Mattermost Calls — invite, join, and participant status flows.',
    addedAt: '2025-08-15',
    isPrimary: true,
  },
  {
    id: 'example-flow',
    label: 'Example Flow',
    path: '/prototypes/example-flow',
    component: ExampleFlow,
    group: 'calls-platform',
    description:
      'Template prototype demonstrating the standard screen-by-scene structure.',
    addedAt: '2024-01-01',
  },
];

export function getPrototypeByPath(pathname: string): PrototypeEntry | undefined {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return PROTOTYPES.find((p) => p.path === normalized);
}

export function getCollectionPrototypes(
  collection: PrototypeCollection,
): PrototypeEntry[] {
  return PROTOTYPES.filter((p) => p.collections?.includes(collection)).sort(
    (a, b) => b.addedAt.localeCompare(a.addedAt),
  );
}
