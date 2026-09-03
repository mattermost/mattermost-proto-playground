import type { ComponentType } from 'react';
import ExampleFlow from '@/pages/prototypes/example-flow/ExampleFlow';
import ExternalCallParticipants from '@/pages/prototypes/external-call-participants/ExternalCallParticipants';
import MobileHomeChannel from '@/pages/prototypes/mobile-home-channel/MobileHomeChannel';
import OutboundCalls from '@/pages/prototypes/outbound-calls/OutboundCalls';
import PostAttributesChannelSettings from '@/pages/PostAttributesChannelSettings/PostAttributesChannelSettings';
import ChannelAttributesChannelView from '@/pages/ChannelAttributesChannelView/ChannelAttributesChannelView';
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
import HierarchicalAttributeAuthoring from '@/pages/HierarchicalAttributeAuthoring/HierarchicalAttributeAuthoring';
import HierarchicalAttributeAuthoringV2 from '@/pages/HierarchicalAttributeAuthoringV2/HierarchicalAttributeAuthoringV2';
import HierarchicalAttributeAuthoringRefined from '@/pages/HierarchicalAttributeAuthoringRefined/HierarchicalAttributeAuthoringRefined';
import HierarchicalAttributeAuthoringV3 from '@/pages/HierarchicalAttributeAuthoringV3/HierarchicalAttributeAuthoringV3';
import HierarchicalAttributeAuthoringV3EqualParents from '@/pages/HierarchicalAttributeAuthoringV3EqualParents/HierarchicalAttributeAuthoringV3EqualParents';
import HierarchicalAttributeValuePicker from '@/pages/HierarchicalAttributeValuePicker/HierarchicalAttributeValuePicker';
import HierarchicalAttributeValueMenu from '@/pages/HierarchicalAttributeValueMenu/HierarchicalAttributeValueMenu';
import HierarchicalAttributeValueMenuDrilldown from '@/pages/HierarchicalAttributeValueMenuDrilldown/HierarchicalAttributeValueMenuDrilldown';
import ValueMenuUserPage from '@/pages/HierarchicalAttributeValueMenu/ValueMenuUserPage';
import ValueMenuChannelPage from '@/pages/HierarchicalAttributeValueMenu/ValueMenuChannelPage';
import HierarchicalAttributeAccessView from '@/pages/HierarchicalAttributeAccessView/HierarchicalAttributeAccessView';
import HierarchicalAttributeBoundedValue from '@/pages/HierarchicalAttributeBoundedValue/HierarchicalAttributeBoundedValue';
import HierarchicalAttributeNonTree from '@/pages/HierarchicalAttributeNonTree/HierarchicalAttributeNonTree';
import HierarchicalAttributeDiagramHub from '@/pages/HierarchicalAttributeDiagramHub/HierarchicalAttributeDiagramHub';
import HierarchicalAttributeExternalReadonly from '@/pages/HierarchicalAttributeExternalReadonly/HierarchicalAttributeExternalReadonly';
import HierarchicalAttributeImport from '@/pages/HierarchicalAttributeImport/HierarchicalAttributeImport';
import HierarchicalAttributeImportMvp from '@/pages/HierarchicalAttributeImportMvp/HierarchicalAttributeImportMvp';
import AttributeHubBasicsAdvanced from '@/pages/AttributeHubBasicsAdvanced/AttributeHubBasicsAdvanced';
import AttributeHubStreamlined from '@/pages/AttributeHubStreamlined/AttributeHubStreamlined';
import AttributeHubSimplified from '@/pages/AttributeHubSimplified/AttributeHubSimplified';
import AttributeHubSimplifiedInlineSummary from '@/pages/AttributeHubSimplifiedInlineSummary/AttributeHubSimplifiedInlineSummary';
import AttributeHubChannelAligned from '@/pages/AttributeHubChannelAligned/AttributeHubChannelAligned';
import AttributeHubChannelAlignedPerResource from '@/pages/AttributeHubChannelAlignedPerResource/AttributeHubChannelAlignedPerResource';
import AttributeDeletionRenameDecisions from '@/pages/AttributeDeletionRenameDecisions/AttributeDeletionRenameDecisions';
import AttributeHubMVP from '@/pages/AttributeHubMVP/AttributeHubMVP';
import AttributeHubMVPNext from '@/pages/AttributeHubMVPNext/AttributeHubMVPNext';
import AttributeManagementWalkthrough from '@/pages/AttributeHubMVPNext/Walkthrough/AttributeManagementWalkthrough';
import WhoCanSetOptions from '@/pages/WhoCanSetOptions/WhoCanSetOptions';
import GlobalMembershipPolicyList from '@/pages/GlobalMembershipPolicy/List/GlobalMembershipPolicyList';
import GlobalMembershipPolicyWalkthrough from '@/pages/GlobalMembershipPolicy/Walkthrough/GlobalMembershipPolicyWalkthrough';
import GlobalMembershipPolicyLongForm from '@/pages/GlobalMembershipPolicy/LongForm/GlobalMembershipPolicyLongForm';
import GlobalMembershipPolicyGuided from '@/pages/GlobalMembershipPolicy/Guided/GlobalMembershipPolicyGuided';
import GlobalMembershipPolicySimplified from '@/pages/GlobalMembershipPolicy/Simplified/GlobalMembershipPolicySimplified';
import GlobalMembershipPolicySimplifiedWalkthrough from '@/pages/GlobalMembershipPolicy/SimplifiedWalkthrough/GlobalMembershipPolicySimplifiedWalkthrough';
import GlobalMembershipPolicySimulate from '@/pages/GlobalMembershipPolicy/Simulate/Simulate';
import GlobalMembershipPolicySimulateChips from '@/pages/GlobalMembershipPolicy/Simulate/OptionChips/OptionChips';
import GlobalMembershipPolicySimulateInlineStrip from '@/pages/GlobalMembershipPolicy/Simulate/OptionInlineStrip/OptionInlineStrip';
import GmpSimulateConceptPersonFirst from '@/pages/GlobalMembershipPolicy/Simulate/ConceptPersonFirst/ConceptPersonFirst';
import GmpSimulateConceptChangeset from '@/pages/GlobalMembershipPolicy/Simulate/ConceptChangeset/ConceptChangeset';
import GmpSimulateConceptCohortPreview from '@/pages/GlobalMembershipPolicy/Simulate/ConceptCohortPreview/ConceptCohortPreview';
import GmpOptionRoleFraming from '@/pages/GlobalMembershipPolicy/Disambiguation/OptionRoleFraming/OptionRoleFraming';
import GmpOptionSplitCard from '@/pages/GlobalMembershipPolicy/Disambiguation/OptionSplitCard/OptionSplitCard';
import GmpOptionTabbedRevamp from '@/pages/GlobalMembershipPolicy/Disambiguation/OptionTabbedRevamp/OptionTabbedRevamp';
import ChannelAttributesIndex from '@/pages/ChannelAttributes/ChannelAttributesIndex';
import ChannelAttributesPrimary from '@/pages/ChannelAttributes/ChannelAttributesPrimary';
import ChannelAttributesVariantA from '@/pages/ChannelAttributes/variants/VariantAHeaderDensity';
import ChannelAttributesVariantB from '@/pages/ChannelAttributes/variants/VariantBBannerComposition';
import ChannelAttributesPropagation from '@/pages/ChannelAttributes/propagation/PropagationHarness';
import ClassificationClearanceQuestions from '@/pages/ClassificationClearanceQuestions/ClassificationClearanceQuestions';

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

// ── Initiatives ──────────────────────────────────────────────────────────────
// A finer-grained axis than PrototypeGroup: the actual project/initiative a
// prototype belongs to. PrototypeGroup stays the broad category (drives card
// accent color + the "Recently Updated" tag); Initiative drives the accordion
// grouping on the index page. `group` on InitiativeMeta is the category the
// initiative rolls up into.

export type Initiative =
  | 'global-navigation'
  | 'attribute-management'
  | 'global-membership-policies'
  | 'channel-attributes'
  | 'hierarchical-attributes'
  | 'channel-permission-rules'
  | 'team-membership-policies'
  | 'session-attributes'
  | 'data-spillage'
  | 'discoverable-private-channels'
  | 'program-based-encryption'
  | 'platform-calls'
  | 'other';

export type InitiativeMeta = {
  label: string;
  group: PrototypeGroup;
  blurb?: string;
};

export const INITIATIVE_META: Record<Initiative, InitiativeMeta> = {
  'attribute-management': {
    label: 'Attribute Management',
    group: 'zero-trust-abac',
    blurb:
      'Define-once attribute catalog — hub, System Console variations, and the ruthlessly-scoped MVP.',
  },
  'global-membership-policies': {
    label: 'Global Membership Policies',
    group: 'zero-trust-abac',
    blurb:
      'System-level membership policies: editors, simulate surfaces, and two-uses disambiguation.',
  },
  'channel-attributes': {
    label: 'Channel Attributes & Smart Labeling',
    group: 'zero-trust-abac',
    blurb: 'Attribute identity on channels with server-side need-to-know masking.',
  },
  'hierarchical-attributes': {
    label: 'Hierarchical Attributes',
    group: 'zero-trust-abac',
    blurb: 'Ranked attribute inheritance — dual-direction leader / challenger flows.',
  },
  'channel-permission-rules': {
    label: 'Channel Permission Rules',
    group: 'zero-trust-abac',
    blurb: 'Channel-level permission authoring and the rule-vs-policy clarity direction.',
  },
  'team-membership-policies': {
    label: 'Team Membership Policies',
    group: 'zero-trust-abac',
    blurb: 'ABAC enforcement extended to team join / leave flows.',
  },
  'session-attributes': {
    label: 'Session & Environmental Attributes',
    group: 'zero-trust-abac',
    blurb: 'Session-scoped Zero Trust access decisions and policy-outcome simulation.',
  },
  'global-navigation': {
    label: 'Global Navigation Redesign',
    group: 'navigation',
    blurb: 'Competing global navigation architectures on a locked information architecture.',
  },
  'data-spillage': {
    label: 'Data Spillage Handling',
    group: 'data-policy',
    blurb: '“Seen by” / “Delivered to” exposure rosters, removal flows, and console config.',
  },
  'discoverable-private-channels': {
    label: 'Discoverable Private Channels (DPC)',
    group: 'data-policy',
    blurb:
      'Per-channel discoverability for private channels — Browse, switcher, request-to-join, and four design approaches.',
  },
  'program-based-encryption': {
    label: 'Program-Based Encryption',
    group: 'encryption-privacy',
    blurb: 'SAP channel key isolation, content masking, and masked-policy notices.',
  },
  'platform-calls': {
    label: 'Platform & Calls',
    group: 'calls-platform',
    blurb: 'Calls participant flows and template / reference prototypes.',
  },
  other: {
    label: 'Other',
    group: 'calls-platform',
    blurb: 'Prototypes not yet assigned to an initiative — add a mapping in INITIATIVE_OF.',
  },
};

// Prototype id → initiative. Centralized here (rather than a field on every
// entry) so the entry list stays untouched; a prototype with no mapping falls
// back to 'other', a visible cue on the index page to tag it here.
const INITIATIVE_OF: Record<string, Initiative> = {
  // Global Navigation Redesign
  'nav-concepts-index': 'global-navigation',
  'nav-n01-products-top-strip': 'global-navigation',
  'nav-n02-products-left-rail': 'global-navigation',
  'nav-n03-classic-team-strip': 'global-navigation',
  'nav-n04-compact-team': 'global-navigation',
  'nav-n05-channel-centric': 'global-navigation',

  // Attribute Management
  'who-can-set-options': 'attribute-management',
  'narrow-track-classification-options': 'attribute-management',
  'attribute-management-hub': 'attribute-management',
  'classification-clearance-questions': 'attribute-management',
  'attribute-hub-mvp': 'attribute-management',
  'attribute-management-walkthrough': 'attribute-management',
  'attribute-hub-mvp-next': 'attribute-management',
  'attribute-hub-simplified': 'attribute-management',
  'attribute-hub-simplified-inline-summary': 'attribute-management',
  'post-attributes-channel-settings': 'attribute-management',
  'channel-attributes-channel-view': 'attribute-management',
  'attribute-hub-channel-aligned': 'attribute-management',
  'attribute-hub-channel-aligned-per-resource': 'attribute-management',
  'attribute-deletion-rename-decisions': 'attribute-management',
  'attribute-hub-basics-advanced': 'attribute-management',
  'attribute-hub-streamlined': 'attribute-management',
  'attribute-management-classification-setup': 'attribute-management',
  'create-channel-classification-picker': 'attribute-management',
  'attribute-management': 'attribute-management',
  'attribute-management-table': 'attribute-management',
  'attribute-management-resource-values': 'attribute-management',
  'attribute-management-console': 'attribute-management',
  'attribute-management-console-counts': 'attribute-management',
  'attribute-management-b': 'attribute-management',
  'attribute-system': 'attribute-management',

  // Global Membership Policies
  'membership-policy-editor-generic': 'global-membership-policies',
  'global-membership-policy-walkthrough': 'global-membership-policies',
  'global-membership-policies': 'global-membership-policies',
  'global-membership-policy-long-form': 'global-membership-policies',
  'global-membership-policy-simplified': 'global-membership-policies',
  'global-membership-policy-simplified-walkthrough': 'global-membership-policies',
  'global-membership-policy-guided': 'global-membership-policies',
  'global-membership-policy-simulate': 'global-membership-policies',
  'global-membership-policy-simulate-chips': 'global-membership-policies',
  'global-membership-policy-simulate-inline-strip': 'global-membership-policies',
  'global-membership-policy-simulate-pinpoint': 'global-membership-policies',
  'global-membership-policy-simulate-changeset': 'global-membership-policies',
  'global-membership-policy-cohort-preview': 'global-membership-policies',
  'gmp-disambiguation-role-framing': 'global-membership-policies',
  'gmp-disambiguation-split-card': 'global-membership-policies',
  'gmp-disambiguation-tabbed-revamp': 'global-membership-policies',

  // Hierarchical Attributes
  'hierarchical-attributes-landing': 'hierarchical-attributes',
  'hierarchical-attributes-d1': 'hierarchical-attributes',
  'hierarchical-attributes-d1-modal-only': 'hierarchical-attributes',
  'hierarchical-attributes-d1-policy-editor': 'hierarchical-attributes',
  'hierarchical-attributes-d1-user-config': 'hierarchical-attributes',
  'hierarchical-attributes-d2': 'hierarchical-attributes',
  'hierarchical-attributes-d3': 'hierarchical-attributes',
  'hierarchical-attributes-state-matrix': 'hierarchical-attributes',
  'hierarchical-attribute-type-authoring': 'hierarchical-attributes',
  'hierarchical-attribute-authoring-v2': 'hierarchical-attributes',
  'hierarchical-attribute-authoring-refined': 'hierarchical-attributes',
  'hierarchical-attribute-nontree': 'hierarchical-attributes',
  'hierarchical-attribute-diagram-hub': 'hierarchical-attributes',
  'hierarchical-attribute-external-readonly': 'hierarchical-attributes',
  'hierarchical-attribute-import': 'hierarchical-attributes',
  'hierarchical-attribute-import-mvp': 'hierarchical-attributes',
  'hierarchical-attribute-authoring-v3': 'hierarchical-attributes',
  'hierarchical-attribute-authoring-v3-equal-parents': 'hierarchical-attributes',
  'hierarchical-attribute-value-picker': 'hierarchical-attributes',
  'hierarchical-attribute-value-menu': 'hierarchical-attributes',
  'hierarchical-attribute-value-menu-drilldown': 'hierarchical-attributes',
  'hierarchical-attribute-value-menu-user': 'hierarchical-attributes',
  'hierarchical-attribute-value-menu-channel': 'hierarchical-attributes',
  'hierarchical-attribute-access-view': 'hierarchical-attributes',
  'hierarchical-attribute-bounded-value': 'hierarchical-attributes',

  // Channel Attributes & Smart Labeling
  'channel-attributes': 'channel-attributes',
  'channel-attributes-primary': 'channel-attributes',
  'channel-attributes-variant-a': 'channel-attributes',
  'channel-attributes-variant-b': 'channel-attributes',
  'channel-attributes-propagation': 'channel-attributes',

  // Channel Permission Rules
  'channel-permission-rules': 'channel-permission-rules',
  'channel-permission-rules-final': 'channel-permission-rules',

  // Team Membership Policies
  'membership-policies-teams': 'team-membership-policies',

  // Session & Environmental Attributes
  'session-attributes': 'session-attributes',
  'simulate-access': 'session-attributes',

  // Data Spillage Handling
  'data-spillage-seen-by': 'data-spillage',
  'data-spillage-delivered-wizard': 'data-spillage',
  'data-spillage-delivered-inline': 'data-spillage',
  'data-spillage-delivered-hybrid': 'data-spillage',
  'data-spillage-delivered-v4': 'data-spillage',
  'data-spillage-console': 'data-spillage',

  // Discoverable Private Channels (DPC)
  'dpc-comparison': 'discoverable-private-channels',
  'dpc-v2-a1': 'discoverable-private-channels',
  'dpc-v2-walkthrough': 'discoverable-private-channels',
  'dpc-a1': 'discoverable-private-channels',
  'dpc-a2': 'discoverable-private-channels',
  'dpc-a3': 'discoverable-private-channels',
  'dpc-a4': 'discoverable-private-channels',

  // Program-Based Encryption
  'pbe-final-v2': 'program-based-encryption',
  'masking-notice-options': 'program-based-encryption',

  // Platform & Calls
  'external-call-participants': 'platform-calls',
  'example-flow': 'platform-calls',
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
  /**
   * Superseded — keep the route alive so shared links don't 404, but hide the
   * card from /prototypes so it can't be mistaken for current work.
   */
  unlisted?: boolean;
};

/**
 * Branch focus — only these ids appear on /prototypes. Empty set = show all
 * (except entries already marked `unlisted`). Routes stay registered so deep
 * links still work; clear this when the branch merges or you need the full index.
 */
export const BRANCH_FOCUS_PROTOTYPE_IDS = new Set<string>([
  'attribute-hub-channel-aligned-per-resource',
  'post-attributes-channel-settings',
  'attribute-deletion-rename-decisions',
  'channel-attributes-channel-view',
]);

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
  // Graph (Hierarchical) attribute type — Phase 6a authoring surface. Toggleable
  // read-only hierarchy view = SD-1 Roster (off) vs SD-3 Ledger + Map (on). (2026-07-17)
  {
    id: 'hierarchical-attribute-type-authoring',
    label: 'Hierarchical Attribute Type · Authoring',
    path: '/prototypes/hierarchical-attribute-type-authoring',
    component: HierarchicalAttributeAuthoring,
    group: 'zero-trust-abac',
    description:
      'Phase 6a authoring surface for the Graph (Hierarchical) attribute type, built inside System Console → Attribute Management. A single field-detail page with a toggleable read-only hierarchy view: toggle OFF = SD-1 "Roster" (parent-picker Options table only); toggle ON = SD-3 "Ledger + Map" (table + read-only multi-appears DAG tree + cross-highlight). Real edge/parent DAG model (dozens-scale programs; genuine multi-parent nodes Mission Casper + JTF Sentinel) with inline cycle / depth-100 / limit rejection, two-reason delete gate (distinct tooltips), pre-commit-blocking rename→policy-impact warning with cross-owner blast radius, reachability "Test coverage" preview, batch import/verify showing the full edge list, shared-Option-pool applies-to, read-only inherited rows, and a simulated live-update indicator. Deep-linkable via ?sd=roster|ledger and ?state=empty|populated|validation-rejected|delete-blocked|read-only-inherited|import-validating|import-summary|loading|error. Masking / policy editor are a later pass.',
    addedAt: '2026-07-17',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // Graph (Hierarchical) attribute type — Phase 6b authoring surface, RD-C
  // "Anchor + Reference Stubs". Extends the DECIDED AttributeHubSimplified detail
  // shell (does not mutate it). One editable anchor per option + read-only stub
  // rows under extra parents; multi-parent authoring via a new Parents pane in
  // the value-editor popover. (2026-07-23)
  {
    id: 'hierarchical-attribute-authoring-v2',
    label: 'Hierarchical Attribute · Authoring',
    path: '/prototypes/hierarchical-attribute-authoring-v2',
    component: HierarchicalAttributeAuthoringV2,
    group: 'zero-trust-abac',
    description:
      'Phase 6b authoring surface for the Graph (Hierarchical) attribute type, built as an extension of the DECIDED Attribute Management → Simplified detail shell (Definition: Name/Type/Options/Who-can-edit + Applies-to). Implements RD-C "Anchor + Reference Stubs": a multi-parent option is fully editable in ONE place (the anchor, under its first-declared parent, reusing the base tree row), and shows as a read-only, dimmed reference stub (↳ "also appears here · edit under {parent}", activatable to jump to the anchor) under every additional parent. Second+ parents are added from a new Parents pane in the chip popover (mirrors the base Rank pane); the picker excludes self + descendants so cycles are unselectable and commit re-checks fail-closed. A "Make this the primary location" re-anchors; a quiet "Collapse cross-references" toggle degrades to RD-A for dense graphs. Adjacency-list store, tree is a projection. Per-value policy usage cut (VP-1); delete gate is structural only. Programs seed, code-names only (Mission Casper, JTF Sentinel). A bake-off ?ui= dimension selects how a 2nd+ parent is represented — stubs (read-only reference rows, the control), chips (extra parents as removable chips on the node’s own row, no stub rows), or hybrid (chips by default plus an on-demand spatial peek that transiently materializes one node’s stubs). All three share the same adjacency model, popover (now with a read-only Children list), progressive-disclosure toggle, cycle safety and structural delete gate. Deep-links: ?ui=stubs|chips|hybrid (default stubs) × ?state=populated|empty|cycle-rejected|delete-blocked|loading|error.',
    addedAt: '2026-07-23',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // Graph (Hierarchical) attribute type — refined tree authoring surface. Starts
  // FROM the GA-4 hybrid (chips + peek) design and applies a senior-UX polish
  // pass. NEW, self-contained; imports the v2 adjacency model read-only, does not
  // modify any existing prototype. (2026-07-24)
  {
    id: 'hierarchical-attribute-authoring-refined',
    label: 'Hierarchical Attribute · Authoring (refined tree)',
    path: '/prototypes/hierarchical-attribute-authoring-refined',
    component: HierarchicalAttributeAuthoringRefined,
    group: 'zero-trust-abac',
    description:
      'Refined tree authoring surface for the Graph (Hierarchical) attribute type, built inside System Console → Attribute Management. Starts from the GA-4 “Chips + peek (hybrid)” design and applies a senior-UX polish pass (authoring surface only). Refinements over hybrid: (1) a single global “Show cross-references in place” toggle above the tree replaces the per-node peek — on = every multi-parent node materializes its read-only stubs in place, off = extra parents ride as chips on the node’s own row (chips keep activate-to-jump); (2) the left gutter is a chevron + a grip drag handle — the up/down reorder arrows are gone (sibling order is cosmetic in a DAG); (3) drag a row by its grip onto another row to re-parent it (or onto the root drop zone to make it top-level), cycle-safe and fail-closed, with a keyboard-operable “Move under…” equivalent in the popover Parents pane; (4) a right-side action cluster (add child · parents · rename · delete) revealed on hover/focus and kept in the tab order so it is keyboard-reachable; (5) inline “Add option under” from the cluster; (6) the two toggles grouped into one compact toolbar with a one-line explainer and tightened row height. Same functionality/guardrails as hybrid: adjacency-list store with a projected tree, one editable home (anchor = first parent, re-anchorable), cycle safety (descendant exclusion + fail-closed re-check), structural-only delete gate (VP-1, no per-value policy), single-column role=tree. Programs seed (SEED_V2), code-names only (Mission Casper, JTF Sentinel). Deep-links: ?state=populated|empty|cycle-rejected|delete-blocked|loading|error · ?seed=classification (swaps the graph for classification tiers with handling markings as children — NOFORN hangs under Confidential/Secret/Top Secret at once; used by the classification-vs-clearance customer deck) · ?demo=off (hides the prototype-demo band for customer embeds) · ?focus=options (scrolls straight to the option tree).',
    addedAt: '2026-07-24',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // Graph (Hierarchical) attribute type — Phase 6 NON-TREE re-pass. Three
  // genuinely non-tree representations of the same multi-parent DAG on one
  // ?viz= switcher; NO indented tree in any of them. Authoring surface only.
  // Shares the v2 adjacency model (read-only import). (2026-07-23)
  {
    id: 'hierarchical-attribute-nontree',
    label: 'Hierarchical Attribute · Non-tree representations',
    path: '/prototypes/hierarchical-attribute-nontree',
    component: HierarchicalAttributeNonTree,
    group: 'zero-trust-abac',
    description:
      'Phase 6 non-tree re-pass for the Graph (Hierarchical) attribute type, built inside System Console → Attribute Management. Explores THREE genuinely non-tree representations of the same multi-parent DAG value structure on one ?viz= switcher — no indented tree in any of them. viz=table: NT-1 lineage / two-column relationships table (one row per value; Parents and Children as removable chips; symmetric edge editing) with NT-2 path-list folded in as an expandable per-row reachability layer (primary path + N more → all full root→node paths as text). viz=matrix: NT-3 adjacency matrix (rows = potential parents, columns = potential children; toggle a cell to set/remove one edge — the most direct edge editor; diagonal + would-loop cells disabled with reasons; family-clustered ordering). viz=graph: NT-4 read-only depth-layered node-link diagram (solid line = primary/anchor parent, dotted = additional parents — the org-chart multi-parent idiom) PAIRED with an authoritative keyboard/SR editable node/edge list; the diagram is aria-hidden decorative and the list is the source of truth. All three share the SAME imported v2 adjacency model, the SAME demo band, the SAME data (SEED_V2 populated; empty create-from-scratch), and the SAME functionality: add value, add/remove a parent edge (cycle-safe — picker/cells exclude descendants, commit re-checks fail-closed), and a structural-only delete gate (VP-1, no per-value policy). Programs seed, code-names only (Mission Casper 2 parents, JTF Sentinel 3 parents). Deep-links: ?viz=table|matrix|graph (default table) × ?state=populated|empty|cycle-rejected|delete-blocked|loading|error.',
    addedAt: '2026-07-23',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // Graph (Hierarchical) attribute type — NT-4b interactive node-link diagram
  // dropped into the FULL attribute detail page (Definition + Applies-to), with
  // an improved add-value UX (on-node ghost create-and-connect) and a redesigned
  // parent/child popover (single creatable combobox per direction). NEW and
  // self-contained; imports the shared adjacency model read-only, forks the NT-4b
  // diagram + popover, and reuses the AttributeHubSimplified panel layout without
  // modifying any existing prototype. (2026-07-24)
  {
    id: 'hierarchical-attribute-diagram-hub',
    label: 'Hierarchical Attribute · Diagram (hub page)',
    path: '/prototypes/hierarchical-attribute-diagram-hub',
    component: HierarchicalAttributeDiagramHub,
    group: 'zero-trust-abac',
    description:
      'NT-4b interactive node-link diagram embedded in the full attribute-management detail page, built inside System Console → Attribute Management. Mirrors the AttributeHubSimplified detail layout: a Definition ConsolePanel (Name · Type=Hierarchical · Options=the interactive diagram · Who-can-edit) plus an Applies-to ConsolePanel — the diagram is the Options content inside the panel, not a bare full-screen canvas. Two authoring improvements over NT-4b: (1) on-node ghost "+" affordances — hovering or keyboard-focusing a node reveals a ghost add-parent (upstream/left) and ghost add-child (downstream/right) that create a new value AND auto-connect it in one gesture (cycle-safe/fail-closed), then open the new node for rename, with the standalone "Add value" control kept for dropping an independent top-level node; (2) a redesigned per-node popover whose Parents and Children sub-panes each collapse the old Select+Add plus TextInput+Create double-mechanism into ONE creatable combobox ("Add or create a parent/child…") — type to filter eligible existing values, or create-and-link a brand-new one from the same input, keyboard-operable (type, arrow, Enter). Removable parent/child chips and a lighter exclusion note are kept, as are rename, color swatches, deactivate, and the structural-only delete gate (VP-1). Shares the v2 adjacency model (read-only import); cycle-safe both directions; no per-value policy. Ghosts are the sighted fast path, the combobox is the accessible equivalent; connector lines are aria-hidden and nodes are focusable buttons carrying their local edges in the aria-label. Programs seed, code-names only. Deep-links: ?state=populated|empty|cycle-rejected|delete-blocked|loading|error.',
    addedAt: '2026-07-24',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // Graph (Hierarchical) attribute type — EXTERNAL read-only VIEW. A separate
  // surface for an attribute whose values are owned/synced by an external source
  // (a UAS): view + filter the hierarchy, with non-accessible values masked or
  // hidden. All editing affordances removed. NEW and self-contained; imports the
  // v2 adjacency model + refined projection read-only; modifies no existing
  // prototype. (2026-07-28)
  {
    id: 'hierarchical-attribute-external-readonly',
    label: 'Hierarchical Attribute · External (read-only)',
    path: '/prototypes/hierarchical-attribute-external-readonly',
    component: HierarchicalAttributeExternalReadonly,
    group: 'zero-trust-abac',
    description:
      'Read-only viewer for a Graph (Hierarchical) attribute whose values are managed OUTSIDE Mattermost (a Unified Attribute Service / external source) and synced in. Built inside System Console → Attribute Management on the same detail shell as the authoring surfaces, but every edit affordance is stripped: no Add value / Add child, no drag / reparent grip, no right-side action cluster, no create controls, no editable popover, no "Allow cross-references" authoring toggle. A managed-source banner states values are owned by the external source and read-only here. Clicking a value opens a READ-ONLY detail popover (parents + children as non-interactive chips, color, source — no controls). Kept as pure view aids: the expand/collapse chevron and the "Show cross-references in place" viewing toggle (anchor spine + read-only reference stubs). Adds a filter box that narrows to matching values while keeping their ANCESTORS for path context, plus a "Show only values I can access" toggle. Non-accessible values are handled two ways via ?mask=: masked (identity suppressed but hierarchy POSITION kept — a lock/"Restricted" placeholder, AC-16(5) marking without color-alone) or hidden (omitted entirely, most count-leak-safe). Count-leak defense (threat T1): contiguous restricted siblings collapse into ONE non-enumerated "Restricted" affordance — never N numbered placeholders, never a "+N" count. Single-column role=tree, no canvas, reasonable 508/keyboard/SR. Shares the SEED_V2 adjacency graph (Mission Casper, JTF Sentinel), code-names only. Deep-links: ?state=populated|empty|filtered-no-results|loading|error (default populated) × ?mask=masked|hidden (default masked, orthogonal to state).',
    addedAt: '2026-07-28',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // Import a hierarchical (multi-parent DAG) value structure — the plan/apply
  // commit flow (04d Direction B, hybridized with C's diff surface). NEW and
  // self-contained; imports the read-only tree + v2 model + graph math read-only.
  // Adds only a backward-compatible, default-off diff-badge prop to the shared
  // ReadonlyTreeRow — existing prototypes behave unchanged. (2026-07-29)
  {
    id: 'hierarchical-attribute-import',
    label: 'Hierarchical Attribute · Import',
    path: '/prototypes/hierarchical-attribute-import',
    component: HierarchicalAttributeImport,
    group: 'zero-trust-abac',
    description:
      'Full-page import flow for a Graph (Hierarchical) attribute whose values are authored OUTSIDE Mattermost and uploaded from local media (air-gapped IL5 — file upload, never a live pull). Implements the fail-closed “plan/apply” commit spine: upload → validate-ALL (all-or-nothing, read-only) → human-verifiable PREVIEW → explicit acknowledgement (never one-click) → re-validate + atomic commit with a stale-guard → result. The PREVIEW renders the parsed graph into the SAME read-only role=tree the values will live in (verify the DAG shape, not a flat list). On RE-IMPORT it renders added/changed/removed diff badges on the tree PLUS a companion screen-reader-primary lineage-table diff (changed subset by default, show-all toggle) — the AC-3 surface where a single re-parented edge is obvious. Violations list EVERY problem (cycle + duplicate + orphan) and block commit; there is no “commit anyway” and no skip-bad-rows. Idempotent “No changes” result on a matching re-import; fail-closed “nothing was committed” rollback on error; stale-guard blocks a commit if the graph drifted since preview. Notes where the AU-2/AU-3 audit before/after edge diff fires. Shares SEED_V2 (Mission Casper, JTF Sentinel), code-names only. Deep-links: ?step=upload|validating|violations|preview-first|preview-reimport|ack|committing|committed|no-changes|error|stale × ?payload=clean|reimport|violations × ?drift=1 (simulate concurrent re-sync).',
    addedAt: '2026-07-29',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // Hierarchical value import — the LIGHTWEIGHT P0 counterpart to the full
  // plan/apply flow. Built inside the Attribute Management MVP edit screen: the
  // whole import collapses to one inline action in the Definition Options row.
  // NEW and self-contained; imports the MVP screen styles + read-only tree
  // projection + graph math read-only; modifies no existing prototype. (2026-07-29)
  {
    id: 'hierarchical-attribute-import-mvp',
    label: 'Hierarchical Attribute · Import (MVP, lightweight)',
    path: '/prototypes/hierarchical-attribute-import-mvp',
    component: HierarchicalAttributeImportMvp,
    group: 'zero-trust-abac',
    description:
      'Lightweight P0 inline import of a hierarchical (graph/DAG) value set, built INSIDE the Attribute Management MVP edit-attribute screen — the lightweight counterpart to the heavyweight full-page plan/apply flow at /prototypes/hierarchical-attribute-import. The entire import collapses to a SINGLE action inside the Definition panel’s Options row (this is a Hierarchical attribute, which the MVP type list otherwise excludes): pick a canned file → click Import → the whole payload is parsed + validated inline (all-or-nothing). Valid applies IMMEDIATELY — the hierarchy renders in place as a compact read-only indented tree with a light inline confirmation (“Imported 14 options from programs.json”) and an Undo — with NO preview page, NO acknowledge checkbox, and NO separate commit button anywhere. Invalid applies nothing and shows a compact inline error listing every problem (“Couldn’t import — 1 loop, 1 duplicate name, 1 unknown parent”) with a “Choose another file” affordance. Re-import over existing options just replaces them with a one-line caution (“This replaced the previous N options”) + Undo — no diff, no multi-step. Undo is the safety net in place of an acknowledge gate. No backend: the file pick is backed by two canned edge-list payloads (clean 14-node Programs seed; a draft with a planted cycle + duplicate label + orphan parent) selectable in the demo band. Reuses the MVP console shell + Definition/Applies-to layout, the RD-C read-only tree projection, and the shared graph math (wouldCreateCycle / depthOf / SEED_V2) read-only. Code-names only. Deep-links: ?state=empty|imported|import-error|replace (default empty) × ?payload=clean|violations (default clean).',
    addedAt: '2026-07-29',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  // Global Attributes MVP (P0) — ruthlessly-scoped cut for dev handoff (2026-07-08)
  {
    id: 'attribute-hub-mvp',
    label: 'Attribute Management · MVP (P0)',
    path: '/prototypes/attribute-hub-mvp',
    component: AttributeHubMVPNext,
    group: 'zero-trust-abac',
    description:
      'P0 scope cut of Global Attributes (epic MM-69673) — active working iteration. Define an attribute once + choose which of Users/Channels/Posts can use it — no assignment/enforcement. System Console Save pattern, Display name field, Users profile display (Always/When set/Hidden), Member/System Administrator who-can-set, no Usage column. Deep-links: ?attr=<id>, ?flow=new, ?allowed=on, ?resource=Channels|Users|Posts (comma-separated).',
    addedAt: '2026-07-08',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  {
    id: 'attribute-management-walkthrough',
    label: 'Attribute Management · Walkthrough',
    path: '/prototypes/attribute-management-walkthrough',
    component: AttributeManagementWalkthrough,
    group: 'zero-trust-abac',
    description:
      'Interactive click-through tour of the shipped Attribute Management (MVP/P0) prototype: why the Hub exists and where it lives, the catalog and its confirmed name/type/delete/deactivate guards, the no-wizard create flow, the Applies-to mechanic across Users/Channels/Posts (including the new self-edit warning for policy-bound attributes), governance and catalog masking, four defense-context customer stories built on the seeded attributes, the Users-vs-Channels/Posts licensing split, mobile posture, and a confirmed-vs-future-considerations wrap-up. Live iframe previews deep-link into `/prototypes/attribute-hub-mvp` via `?attr=`, `?flow=new`, and `?focus=`.',
    addedAt: '2026-07-30',
    collections: ['attribute-management'],
  },
  {
    id: 'attribute-hub-mvp-next',
    label: 'Attribute Management · MVP (P0) · Snapshot',
    path: '/prototypes/attribute-hub-mvp-next',
    component: AttributeHubMVP,
    group: 'zero-trust-abac',
    description:
      'Frozen MVP (P0) handoff snapshot preserved at the secondary route after the working iteration moved to `/prototypes/attribute-hub-mvp`. Same deep-links as the original: ?attr=<id>, ?flow=new, ?allowed=on, ?resource=Channels|Users|Posts (comma-separated).',
    addedAt: '2026-07-14',
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
  // Focused post-attributes MVP: Channel settings + thread
  {
    id: 'post-attributes-channel-settings',
    label: 'Post Attributes · Channel settings',
    path: '/prototypes/post-attributes-channel-settings',
    component: PostAttributesChannelSettings,
    group: 'zero-trust-abac',
    description:
      'Focused post-attributes MVP: Channel settings catalog to create attributes for this channel and posts; Channel · thread with RHS post attributes (inherited, overridden, locked) and + Add attribute / composer Create new opening Channel settings on the new-attribute flow with Posts pre-selected. Deep-links: ?view=channel|channel-thread|attrs-modal, ?tab=attributes, ?attr=<id>, ?flow=new, ?applies=Posts|Channels|Posts,Channels.',
    addedAt: '2026-08-04',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  {
    id: 'channel-attributes-channel-view',
    label: 'Channel Attributes · Channel view',
    path: '/prototypes/channel-attributes-channel-view',
    component: ChannelAttributesChannelView,
    group: 'zero-trust-abac',
    description:
      'Channel view with system attribute chips in the header (Classification, Program, Caveat, Engagement tempo) and configurable banners — global (workspace), channel, and reply (thread RHS). Prototype tabs: Channel view, Bot message (admin notify DM listing channels missing Classification), and Unarchive modal (required attributes before restore). Display settings toggle banners and Info/Thread RHS. Matches Figma Channel Attributes — System Attributes (4863:33132). Deep-links: ?view=channel-view|bot-message|unarchive-modal.',
    addedAt: '2026-08-26',
    collections: ['attribute-management'],
  },
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
  // Channel Attributes walkthrough alignment (2026-08-06)
  {
    id: 'attribute-hub-channel-aligned',
    label: 'Attribute Management · Channel-attributes aligned',
    path: '/prototypes/attribute-hub-channel-aligned',
    component: AttributeHubChannelAligned,
    group: 'zero-trust-abac',
    description:
      'Inline-summary hub carrying the decisions from the Channel Attributes walkthrough (2026-08-06). Five changes: (1) the channel banner is no longer classification-only — any attribute type can be banner-eligible, and the hint states that banner attributes concatenate into one strip a channel admin can override; (2) "Display location" becomes "Default display location" with a "Channel admins can change this per channel" opt-in, replacing the hard-coded display logic; (3) a new attribute-level "Changing the value after it\'s set" rule whose options derive from the attribute type — Ranked/Ranked-hierarchical offer raise-only (the default, since raising can only shrink who qualifies), Hierarchical offers narrow-only (descendants of the current option, well-defined on a multi-parent DAG), Multiselect offers add-only/remove-only with an operator caveat because neither direction is unambiguously safe, and Select/Text offer editable or locked; the rule scopes to Channels/Posts/Teams and reflects out to the source system for Users; (4) Required states its consequence — channels created without a value stay locked and an admin is notified — and optional bindings say the attribute can still be added after creation; (5) Classification defers to the Classification Markings page for presets and colors instead of duplicating them. Deep-links: ?attr=<id>, ?flow=new.',
    addedAt: '2026-08-10',
    unlisted: true, // superseded by attribute-hub-channel-aligned-per-resource
    collections: ['attribute-management'],
  },
  // Channel-attributes alignment — editability per resource (2026-08-06)
  {
    id: 'attribute-hub-channel-aligned-per-resource',
    label: 'Attribute Management \u00b7 Channel-attributes aligned (per-resource rule)',
    path: '/prototypes/attribute-hub-channel-aligned-per-resource',
    component: AttributeHubChannelAlignedPerResource,
    group: 'zero-trust-abac',
    description:
      'Same channel-attributes alignment, with the "Changing the value" rule moved out of Definition and onto each resource inside Applies to \u2014 it sits directly under "Who can set the value", so who sets it and whether they can change it later read as one thought. Because the rule is scoped to the binding, the attribute-level version\u0027s "Applies to Channels, Posts, Teams" explainer and its Users reflection line both disappear; Users simply has no such control, since its values come from the source system. Copy is shortened to a self-describing option list \u2014 Can be changed / Can only be raised / Can only be narrowed / Values can be added, not removed / Values can be removed, not added / Cannot be changed \u2014 with a supporting line only where the label needs one (raise-only shows the concrete allowed direction, locked says to create a new channel instead). Options still derive from attribute type, and each resource can now carry a different rule. Deep-links: ?attr=<id>, ?flow=new.',
    addedAt: '2026-08-10',
    collections: ['attribute-management'],
  },
  {
    id: 'attribute-deletion-rename-decisions',
    label: 'Attribute Management \u00b7 Deletion & rename decisions',
    path: '/prototypes/attribute-deletion-rename-decisions',
    component: AttributeDeletionRenameDecisions,
    group: 'zero-trust-abac',
    description:
      'Decision table for deleting and renaming global attributes, changing type when unused, managing individual Select/Multiselect values, and deleting resource-level attributes \u2014 Classification values are controlled separately.',
    addedAt: '2026-08-25',
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
    id: 'global-membership-policy-walkthrough',
    label: 'Global Membership Policies · Walkthrough',
    path: '/prototypes/global-membership-policy-walkthrough',
    component: GlobalMembershipPolicyWalkthrough,
    group: 'zero-trust-abac',
    description:
      'Interactive click-through tour of the Global Membership Policies proposal: problem statement, channel-attribute primer, list → editor flow, relative comparison + scope targeting (two examples), teams note, combine/timing strip, impact gate, out-of-scope appendix, and open eng/PM items. Live iframe previews deep-link to list and Direction A editor states.',
    addedAt: '2026-07-10',
    collections: ['attribute-management'],
  },
  {
    id: 'global-membership-policies',
    label: 'Global Membership Policies · List',
    path: '/prototypes/global-membership-policies',
    component: GlobalMembershipPolicyList,
    group: 'zero-trust-abac',
    description:
      'System Console Membership Policies list — policy table (Name / Applies to / Actions), search, Add policy CTA, and Membership sync jobs section. Links to the Direction A editor; back button on the editor returns here.',
    addedAt: '2026-07-09',
    collections: ['attribute-management'],
  },
  {
    id: 'global-membership-policy-long-form',
    label: 'Global Membership Policy · A · Long-Form',
    path: '/prototypes/global-membership-policy-long-form',
    component: GlobalMembershipPolicyLongForm,
    group: 'zero-trust-abac',
    description:
      'Global Membership Policies editor — Direction A (Linear Long-Form, the literal mockup). One scrolling page: "Who this policy applies to" (relative user↔channel-attribute requirement rows, Simple/Advanced, match-mode, Test matching users) + "Where this policy applies" (three scope radios; All/Public/Private channel-type filter shown only under the all-channels radio). Always-confirm impact gate (async three-state) on Save. Deep-linkable via ?state=populated|empty|error and ?scope=all|manual|rules.',
    addedAt: '2026-07-09',
    collections: ['attribute-management'],
  },
  {
    id: 'global-membership-policy-simplified',
    label: 'GMP · Simplified editor',
    path: '/prototypes/global-membership-policy-simplified',
    component: GlobalMembershipPolicySimplified,
    group: 'zero-trust-abac',
    description:
      'Simplified copy of the GMP Direction A editor with four scope simplifications: (2.1) requirement value picker offers only the ONE schema-paired channel attribute per user attribute (Clearance→Classification, Program→Program, department→department; Nationality/COI are literals only); (2.2) "Where this policy applies" is TWO radios — "All channels" (fail-secure: a channel missing a referenced attribute value removes everyone) and "Select channels manually"; (2.4) no channel-type segmented control; (2.3) an inline scope guardrail disables "All channels" when the policy references a channel attribute NOT marked required-for-channels (Classification=required, Program=NOT required), with an explanation under the disabled radio. Deep-links: ?policy=<id>, ?scope=all|manual, ?state=populated|empty|error.',
    addedAt: '2026-07-14',
    collections: ['attribute-management'],
  },
  {
    id: 'global-membership-policy-simplified-walkthrough',
    label: 'GMP · Simplified walkthrough',
    path: '/prototypes/global-membership-policy-simplified-walkthrough',
    component: GlobalMembershipPolicySimplifiedWalkthrough,
    group: 'zero-trust-abac',
    description:
      'Guided click-through tour of the SIMPLIFIED Global Membership Policies variation (Parts A + B). A copy of the original GMP walkthrough re-pointed at the Simplified editor route: requirements offer one schema-paired channel attribute per user attribute (Nationality/COI literal-only); "Where this policy applies" is two choices — All channels (fail-secure) and Select channels manually; a hard-error save guardrail blocks an "All channels" policy that references a channel attribute not required-for-channels; and Test matching users uses the new single-mode modal (affected-channels list + autocomplete, per-channel Allowed/Removed drill-in). Customer stories adapted to the two scope modes (NOFORN = All channels floor; DS Program / Dragon / Northern = manual). Editor iframes deep-link via ?policy, ?scope=all|manual, ?state, ?test=list|channel.',
    addedAt: '2026-07-14',
    collections: ['attribute-management'],
  },
  {
    id: 'global-membership-policy-guided',
    label: 'Global Membership Policy · B · Guided Steps',
    path: '/prototypes/global-membership-policy-guided',
    component: GlobalMembershipPolicyGuided,
    group: 'zero-trust-abac',
    description:
      'Global Membership Policies editor — Direction B (Guided Steps + Review-as-gate). Same content sequenced Identity → Requirements → Scope + Type → Review; the channel-type filter gets its own framed step with destructive-private-removal framing, and the always-confirm impact gate IS the terminal Review step (async three-state). Deep-linkable via ?state=populated|empty|error and ?step=1..4.',
    addedAt: '2026-07-09',
    collections: ['attribute-management'],
  },
  {
    id: 'global-membership-policy-simulate',
    label: 'Global Membership Policy · Simulate',
    path: '/prototypes/global-membership-policy-simulate',
    component: GlobalMembershipPolicySimulate,
    group: 'zero-trust-abac',
    description:
      'GMP "Simulate" surface (WORKSTREAM 3) — previews membership changes before save, using an Added / Kept / Removed set-diff (not an access verdict). Against a channel: a picker filtered to channels the admin can fully see → set-diff with destructive-removal danger emphasis; channels above the admin\'s clearance render aggregate bands only (no names, no matching rule). Policy impact: an aggregate across the policy\'s whole scope (members touched, added, kept, destructive removed) with a ranked most-affected list and drill-in; over-clearance channels contribute a bucketed removal band only. Deep-links: ?mode=channel|batch, ?state=default|computing|populated|over-clearance|empty|error, ?policy=<id>.',
    addedAt: '2026-07-13',
    collections: ['attribute-management'],
  },
  // GMP Simulate — two ALTERNATIVE design options for the selection round,
  // to compare against the recommended Simulate scene above. Both reuse the
  // SAME gmpData.ts set-diff fixtures / over-clearance guard / bands so the
  // numbers stay consistent across all three. (2026-07-13)
  {
    id: 'global-membership-policy-simulate-chips',
    label: 'GMP Simulate · Option 1 · Chips-adapted',
    path: '/prototypes/global-membership-policy-simulate-chips',
    component: GlobalMembershipPolicySimulateChips,
    group: 'zero-trust-abac',
    description:
      'ALTERNATIVE Option 1 for the GMP "Simulate" experience (selection round). Reuses the Simulate-Access CHIP visual, but each chip is a CHANNEL context — click a chip to open a read-only popover with that channel\'s Added / Kept / Removed set-diff (not an access verdict). Chip tone encodes destructive weight (danger = private removals, warning = over-clearance). Channels above the admin\'s Secret clearance render aggregate bands only (no names, no matching rule). Same set-diff fixtures as the recommended Simulate scene. Deep-links: ?state=default|populated|over-clearance|empty|error, ?policy=<id>.',
    addedAt: '2026-07-13',
    collections: ['attribute-management'],
  },
  {
    id: 'global-membership-policy-simulate-inline-strip',
    label: 'GMP Simulate · Option 2 · Inline per-channel strip',
    path: '/prototypes/global-membership-policy-simulate-inline-strip',
    component: GlobalMembershipPolicySimulateInlineStrip,
    group: 'zero-trust-abac',
    description:
      'ALTERNATIVE Option 2 for the GMP "Simulate" experience (selection round). A persistent strip inside the policy editor where the admin pins up to 3 channels and sees each one\'s Added / Kept / Removed set-diff side-by-side, always visible while editing — no separate Simulate surface. An over-clearance pinned column shows aggregate bands only (no names, no rule); an inline note flags that the strip is per-channel and points to the full Simulate surface for the aggregate. Same set-diff fixtures as the recommended Simulate scene. Deep-links: ?state=default|populated|over-clearance|empty|error, ?policy=<id>.',
    addedAt: '2026-07-13',
    collections: ['attribute-management'],
  },
  // GMP Simulate — three CONCEPTUALLY DISTINCT approaches for the selection
  // round (05-ideation-concepts.md §6). Each moves off the channel subject the
  // committed Simulate scene uses: A = one person, C = the edit-delta as a diff
  // document, B = the attribute expression previewed live while authoring. All
  // three reuse the SAME gmpData.ts set-diff fixtures / over-clearance guard so
  // the numbers stay comparable. (2026-07-13)
  {
    id: 'global-membership-policy-simulate-pinpoint',
    label: 'GMP Simulate · Concept A · Person-First Pinpoint',
    path: '/prototypes/global-membership-policy-simulate-pinpoint',
    component: GmpSimulateConceptPersonFirst,
    group: 'zero-trust-abac',
    description:
      'Concept A (Person-First Pinpoint) for the GMP "Simulate" experience. Subject = a specific USER, not a channel: name one member and get a single verdict-trace — Kept / Would-be-added / Would-be-removed per in-scope channel, with the deciding requirement row for each. Smallest data footprint of the three concepts. Channels above the admin\'s clearance are REFUSED (no result, no range) because an N=1 result would be an oracle — never downgraded to bands. Same set-diff fixtures as the committed Simulate scene. Deep-links: ?state=empty|needs-channel|computing|kept|added|removed|over-clearance|literal|error, ?policy=<id>.',
    addedAt: '2026-07-13',
    collections: ['attribute-management'],
  },
  {
    id: 'global-membership-policy-simulate-changeset',
    label: 'GMP Simulate · Concept C · Delta / Changeset',
    path: '/prototypes/global-membership-policy-simulate-changeset',
    component: GmpSimulateConceptChangeset,
    group: 'zero-trust-abac',
    description:
      'Concept C (Delta / Changeset) for the GMP "Simulate" experience. Subject = the EDIT ITSELF (delta vs current live membership). Output = an approvable, scrollable per-channel DIFF DOCUMENT (grouped +added / −removed lines per channel, collapsible, filterable to removals) that the admin reviews and approves before Save — a "Terraform plan for membership," deliberately NOT a totals dashboard. Channels above the admin\'s clearance appear as a single banded row inline in the diff (counts only, no names) so totals stay honest. Route-to-ISSO second-approver hand-off present (persistence pending PM/Security, OD-3). Same set-diff fixtures as the committed Simulate scene. Deep-links: ?state=idle|computing|populated|filtered-removals|empty|stale|approved|isso-pending|error, ?policy=<id>.',
    addedAt: '2026-07-13',
    collections: ['attribute-management'],
  },
  {
    id: 'global-membership-policy-cohort-preview',
    label: 'GMP Simulate · Concept B · Live Cohort Preview',
    path: '/prototypes/global-membership-policy-cohort-preview',
    component: GmpSimulateConceptCohortPreview,
    group: 'zero-trust-abac',
    description:
      'Concept B (Live Inline Cohort Preview) for the GMP "Simulate" experience. Subject = the ATTRIBUTE EXPRESSION / cohort it defines. Output = a live, bucketed count shown inline in the requirement-authoring row ("~20–50 users match") that updates as the admin edits the expression — no modal, no picker, no explicit "Run"; the earliest signal in the funnel. Built as a small mock requirement-builder (NOT the real LongForm editor) to isolate the interaction. Over-clearance handling: user-attribute side only, coarse buckets, entitlement-scoped (unentitled attribute → "count unavailable"); channel-variable rows preview the user side only. OD-1 [VERIFY WITH SECURITY]: bucketed workspace cohort counts in an IL5 tenant gate whether this ships. Deep-links: ?state=idle|debouncing|populated|suppressed|broad|narrow|variable|error, ?policy=<id>.',
    addedAt: '2026-07-13',
    collections: ['attribute-management'],
  },
  // Two-uses disambiguation options — resolving the confusion where channel
  // attributes appear in both "Membership requirements" (compared to a member)
  // and "Where this policy applies" (used to select channels). (2026-07-13)
  {
    id: 'gmp-disambiguation-role-framing',
    label: 'GMP Disambiguation · O2 · Role framing',
    path: '/prototypes/global-membership-policy-disambiguation-role-framing',
    component: GmpOptionRoleFraming,
    group: 'zero-trust-abac',
    description:
      'O2 (semantic role framing + iconography/color): the committed single-page GMP editor refined so the two independent uses of channel attributes read as different questions. Membership requirements carries a person glyph + info-tinted accent; Where this policy applies carries a channels glyph + success-tinted accent; every row shows its axis marker and a one-line role framing loads the correct mental model before the rows. Folds in O1 (copy) via section framings and O5 (the "Channel:" prefix stays anchored on RHS variables). Populated with DS Program seed data. Deep-links: ?policy=<id>, ?state=populated|empty|error, ?scope=all|manual|rules.',
    addedAt: '2026-07-13',
    collections: ['attribute-management'],
  },
  {
    id: 'gmp-disambiguation-split-card',
    label: 'GMP Disambiguation · O4 · Split card + sentence',
    path: '/prototypes/global-membership-policy-disambiguation-split-card',
    component: GmpOptionSplitCard,
    group: 'zero-trust-abac',
    description:
      'O4 (axis-per-side split card + sentence recap): Membership requirements (member axis) and Where this policy applies (channel axis) sit side-by-side in one card at ≥1280px, stacking on narrower viewports. A persistent generated-only policy sentence spans the top — "Members of [channels] must satisfy [requirements]" — with the two axes tinted distinctly. Spatial separation is the strongest independence signal; the recap fuses them into one readable line. Populated with DS Program seed data. Deep-links: ?policy=<id>, ?state=populated|empty|error, ?scope=all|manual|rules.',
    addedAt: '2026-07-13',
    collections: ['attribute-management'],
  },
  {
    id: 'gmp-disambiguation-tabbed-revamp',
    label: 'GMP Disambiguation · O6 · Members/Channels tabs',
    path: '/prototypes/global-membership-policy-disambiguation-tabbed-revamp',
    component: GmpOptionTabbedRevamp,
    group: 'zero-trust-abac',
    description:
      'O6 (full-page revamp): the two axes become the top-level IA — page-level Members and Channels tabs, so the reader literally cannot conflate them. Members tab = requirements (Simple/Advanced, match-mode, Test matching users). Channels tab = the three scope modes + type filter. A persistent header banner carries the auto-generated policy sentence; the combine/timing strip + Save live in a sticky footer that belongs to the whole policy. The vision-setting candidate. Populated with DS Program seed data. Deep-links: ?policy=<id>, ?state=populated|empty|error, ?page=members|channels, ?scope=all|manual|rules, ?gate=open|results.',
    addedAt: '2026-07-13',
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
      'Side-by-side comparison of four Discoverable Private Channels design approaches.',
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
      'Confirm-and-Commit gate before enabling the Discoverable toggle on a private channel.',
    addedAt: '2025-10-15',
  },
  {
    id: 'dpc-a2',
    label: 'DPC A2: Intent-Wizard',
    path: '/prototypes/dpc/a2',
    component: A2,
    group: 'data-policy',
    description:
      'Multi-step intent wizard before marking a channel as Discoverable.',
    addedAt: '2025-10-15',
  },
  {
    id: 'dpc-a3',
    label: 'DPC A3: Curated Directory',
    path: '/prototypes/dpc/a3',
    component: A3,
    group: 'data-policy',
    description:
      'Curated directory of discoverable private channels with filter chips.',
    addedAt: '2025-10-15',
  },
  {
    id: 'dpc-a4',
    label: 'DPC A4: Knock-by-Reference',
    path: '/prototypes/dpc/a4',
    component: A4,
    group: 'data-policy',
    description:
      'Knock-by-reference async approval flow for join requests.',
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

  // ── Channel Attributes & Smart Labeling (Smart Markings Themes 1–2) ──────────
  // Phase 6a: 1 primary (mockup-faithful) + 2 focused variants, desktop + mobile.
  // Server-pre-filtered masking payloads drive all masking (FR-27/FR-28). (2026-07-09)
  {
    id: 'channel-attributes',
    label: 'Channel Attributes & Smart Labeling · Index',
    path: '/prototypes/channel-attributes',
    component: ChannelAttributesIndex,
    group: 'zero-trust-abac',
    description:
      'Smart Markings Themes 1–2: attribute identity on channels with server-side need-to-know masking, across create modal, info sidebar, header pills, and classification banner (desktop + mobile). Index of the primary direction plus the two comparison variants.',
    addedAt: '2026-07-09',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  {
    id: 'channel-attributes-primary',
    label: 'Channel Attributes · Primary (all states)',
    path: '/prototypes/channel-attributes/primary',
    component: ChannelAttributesPrimary,
    group: 'zero-trust-abac',
    description:
      'Mockup-faithful primary (Bundle-R): A2 header overflow, B1 banner, quiet advisory tooltip. Scene picker switches across create-modal (ON/OFF/picker/error/loading), header+banner (cleared/overflow/B1/B3/dual-band/elevated-warning), info sidebar (admin edit/config/member/partial/empty), reclassification modal (idle/loading/error), and mobile (label/banner/info member+admin/create). Masking derives only from the server-filtered payload.',
    addedAt: '2026-07-09',
    collections: ['attribute-management'],
  },
  {
    id: 'channel-attributes-variant-a',
    label: 'Channel Attributes · Variant A (header density)',
    path: '/prototypes/channel-attributes/variant-a',
    component: ChannelAttributesVariantA,
    group: 'zero-trust-abac',
    description:
      'Header overflow density comparison: A2 (recommended, fixed-priority truncation + masking-aware +N popover) beside A3 (classification-only header, rest in sidebar). Both count from the cleared payload only.',
    addedAt: '2026-07-09',
    collections: ['attribute-management'],
  },
  {
    id: 'channel-attributes-variant-b',
    label: 'Channel Attributes · Variant B (banner / V7)',
    path: '/prototypes/channel-attributes/variant-b',
    component: ChannelAttributesVariantB,
    group: 'zero-trust-abac',
    description:
      'Banner composition for the uncleared viewer (V7 decision axis): B1 (generic “additional handling restrictions apply” indicator, no count/value) beside B3 (full omission). Program values fully omitted in both. Desktop + mobile, for the security-officer review.',
    addedAt: '2026-07-09',
    collections: ['attribute-management'],
  },
  // Propagation surfaces — echoing channel classification markings across the
  // product (surface 1 of ~14: quick switcher) + the shared list-data substrate
  // the other 13 reuse. Server-side masking modeled in the data (no-trace).
  {
    id: 'channel-attributes-propagation',
    label: 'Channel Attributes · Propagation surfaces',
    path: '/prototypes/channel-attributes/propagation',
    component: ChannelAttributesPropagation,
    group: 'zero-trust-abac',
    description:
      'Where channel classification markings show up across the product. Surface #1: the "Find channels" quick switcher, with the compact classification pill after each channel name (before the ~handle). No-trace server-side masking is modeled in the shared multi-channel dataset — masked and unmarked channels are indistinguishable (both render no pill), DMs never carry a pill. Scene harness scaffolded for surfaces #2–#14. Deep-linkable via ?scene=switcher.',
    addedAt: '2026-07-09',
    collections: ['attribute-management'],
  },
  // Running order for the four classification-vs-clearance customer questions.
  // Frames the EXISTING prototypes rather than adding screens: every stage is
  // attribute-hub-mvp or global-membership-policy-long-form at a deep-linked
  // state, or the classification-markings mockup.
  {
    id: 'classification-clearance-questions',
    label: 'Classification vs Clearance · Customer Questions',
    path: '/prototypes/classification-clearance-questions',
    component: ClassificationClearanceQuestions,
    group: 'zero-trust-abac',
    description:
      'Sales-runnable running order for the four open classification-vs-clearance questions: one shared value list or two, handling paired with the level or separate, whether clearance is ever actually compared or every user is cleared to system high, and whether the server global classification is enforced as a limit (PRFAQ Theme 3.5). Ask-first by construction: while asking, the question fills the view and the presenter notes are open; the screens stay hidden until an explicit reveal, which collapses the ask to a strip and hands the screen to the prototype (with a Hide-the-visuals return). Alternatives are segregated into labelled APPROACH groups picked before the screen inside them, so three ways of modelling something never read as one three-step flow. No new screens: every stage is `attribute-hub-mvp`, `hierarchical-attribute-authoring-refined` (?seed=classification, handling nested under each tier with NOFORN multi-parent), or `global-membership-policy-long-form`, each deep-linked to the right state (?attr=clearance, ?attr=caveat, ?sim=channel, ?policy=static-values for literal-only rules), or a scrolled region of `classification-markings-concept.png`. Deep link: ?q=1..4.',
    addedAt: '2026-07-31',
    collections: ['attribute-management'],
  },
  // ── Hierarchical attributes: post-guild-meeting rebuild (2026-08-01) ────────
  // Four NEW surfaces answering the 2026-07-30 Attributes Guild meeting and a
  // re-read of the Graph Property Fields + Property Permissions tech specs. All
  // additive: every earlier hierarchical-attribute prototype is untouched, and
  // these import the existing DAG math (graphModel.ts) read-only rather than
  // forking it. See specs/graph-attributes/CHANGE-REQUEST-2026-07-30-guild-alignment.md.
  {
    id: 'hierarchical-attribute-authoring-v3',
    label: 'Hierarchical Attribute · Authoring (v3, corrected)',
    path: '/prototypes/hierarchical-attribute-authoring-v3',
    component: HierarchicalAttributeAuthoringV3,
    group: 'zero-trust-abac',
    description:
      'Authoring surface for the Hierarchical (graph) attribute type, rebuilt to fix defects the refined-tree surface shipped with. (1) A display toggle can no longer hide a relationship: every parent edge is always rendered in place, the chips-vs-stubs mode is gone, and the remaining cross-reference setting is authoring-only (it gates CREATING a second parent, never display) — the old toggle silently removed four real parent links from the render, and chips mode made two parents read as childless leaves while their own editor panes listed a child. (2) "Primary parent" is retired: the anchor is derived from parent createAt rather than parentIds[0] (the backend stores parents as an unordered set with no order column), the tag reads "Shown here", the action reads "Show under this parent", and helper text states that all parents grant access equally. (3) The delete gate is DAG-aware — it blocks only on children that would genuinely be orphaned, and names them. (4) Direction-explicit language throughout, because an edge is a privilege grant and not containment: every row carries a persistent "grants access to N values" metric, multi-parent shows a visible "also under X" (the old chip read backwards), adding a parent raises a consequence confirm naming the population that gains access, and a parent with 2+ children carries an inline incomparability note plus a "Link in order…" action that chains them most-privileged-first — the fix for the live TLP ambiguity where the same rendered picture means either unordered facets or a ranked ladder. (5) A real create state intercepts the known-bad merged model: the type chooser leads with the discriminating question and routes "Both — levels AND groups?" to two attributes, states irreversibility on the chooser itself, and detects a single unbranched chain to print the direction sentence. (6) Ownership is read-only in core — three five-rung human ladders plus a machine-owner badge, no add/remove control. Programs seed only; the old classification preset is deliberately NOT carried forward (five unrelated tier roots both over-deny on the level axis and over-grant on the caveat axis). Deep-links: ?state=populated|empty|create|cycle-rejected|delete-blocked|delete-safe|grant-confirm|chain-detected|loading|error · ?demo=off.',
    addedAt: '2026-08-01',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  {
    id: 'hierarchical-attribute-authoring-v3-equal-parents',
    label: 'Hierarchical Attribute · Authoring (v3, equal parents)',
    path: '/prototypes/hierarchical-attribute-authoring-v3-equal-parents',
    component: HierarchicalAttributeAuthoringV3EqualParents,
    group: 'zero-trust-abac',
    description:
      'V3 authoring variant with no home/editing occurrence. Every parent edge renders the same full row — rename, add-child, delete, expand/collapse, and per-parent reordering — instead of pointer rows with "Edit under…". Multi-parent values show a link-icon "N parents" tag on every occurrence; all parents grant equally and the Parents pane lists them without a "Shown here" pin. Same Programs seed, DAG math, grant confirms, and list settings as hierarchical-attribute-authoring-v3. Deep-links: ?state=populated|empty|create|cycle-rejected|delete-blocked|delete-safe|grant-confirm|ordering|single-chain|loading|error · ?ranking=ranked · ?demo=off.',
    addedAt: '2026-08-05',
    collections: ['attribute-management'],
  },
  {
    id: 'hierarchical-attribute-value-picker',
    label: 'Hierarchical Attribute · Value picker (multi-tree)',
    path: '/prototypes/hierarchical-attribute-value-picker',
    component: HierarchicalAttributeValuePicker,
    group: 'zero-trust-abac',
    description:
      'The value-SELECTION surface for a Hierarchical (graph) attribute whose option pool is a forest — the case an engineer explicitly deferred to design ("how do we present the UX for that when it is different trees?"). Not an authoring surface. Built twice over, because the semantics invert: on the SUBJECT side (assigning programs to a user) selecting a higher value grants more and multiple values are disjunctive; on the RESOURCE side (marking a channel) selecting a higher value makes the channel more accessible and multiple values are CONJUNCTIVE, so adding one narrows who can enter — the opposite of how tags and labels behave. The consequence is a live sentence, not an icon. Redundancy is handled asymmetrically: subject-side {Air Operations, Raptor Flight} is harmless and only flagged, but resource-side the same pair collapses to "Air Operations or above" and leaves the tighter Raptor marking visible yet INERT, so that hard-warns. Cross-tree selection is allowed with an incomparability notice and a live qualifying-user count; zero qualifying users requires an explicit confirm and gates the Create button. One row per value always — never duplicate rows for a multi-parent value — with a breadcrumb path and an "also under" line. Primary control is a search-first flat list with root filter chips (scale-free, one row per value, near-free 508 behaviour as a listbox); secondary is "Browse hierarchy" scoped to a single root. Option pool is masked to the viewer down-set with absolute count suppression: no "+N more", no totals of anything withheld, and out-of-scope typeahead returns plain "No results". Deep-links: ?side=subject|resource · ?state=empty|selected|redundant|inert-marking|cross-tree|zero-qualifying|browse|loading|error · ?viewer=admin|restricted · ?demo=off.',
    addedAt: '2026-08-01',
    collections: ['attribute-management'],
  },
  {
    id: 'hierarchical-attribute-access-view',
    label: 'Hierarchical Attribute · Access view (coverage)',
    path: '/prototypes/hierarchical-attribute-access-view',
    component: HierarchicalAttributeAccessView,
    group: 'zero-trust-abac',
    description:
      'Read-only access/coverage explainer — the "click a value, see what access you have" surface two stakeholders asked to have in the product after a 3D Three.js visualization was demoed at the 2026-07-30 guild meeting (specs/graph-attributes/graph-attributes-visualization.html, titled "covers() on a classification lattice"). This re-houses that interaction rather than porting it: select a value and everything it covers stays lit while the rest dims, edges carry explicit arrowheads (the existing diagram hub has none, so direction was inferred from left-to-right position — which breaks for exactly the cross-branch edges that matter). The renderer is deliberately NOT 3D: a WebGL canvas has no DOM, keyboard path or screen-reader semantics, which is not shippable in a multi-classification interface; the reference also builds the whole lattice client-side, and value names plus relationships are a compartmentation map. So the diagram is 2D and keyboard-operable (arrow keys follow edges and columns, Enter selects, Escape resets, live region announces each result) with a lineage TABLE as a peer surface usable as the only view — the 508 answer, and the idiom already used for the import preview. Two scopings: admin sees the whole graph, what a value grants, who can already reach it, and the inUseCount/policyRefCount the model has always carried but no prototype rendered; member sees only their own down-set plus their own path. The member variant closes a real leak path — explaining "you can enter because Falcon Wing is above you" discloses an ancestor outside the viewer down-set — by scoping the graph before it reaches the component and re-filtering surviving parent pointers, so no out-of-scope name can surface in a path, a count or a sentence. Deep-links: ?viewer=admin|member · ?select=<value-id> · ?compare=<value-id> · ?view=diagram|table|both · ?state=populated|empty|loading|error · ?demo=off.',
    addedAt: '2026-08-01',
    collections: ['attribute-management'],
  },
  {
    id: 'hierarchical-attribute-bounded-value',
    label: 'Hierarchical Attribute · Bounded + inherited values',
    path: '/prototypes/hierarchical-attribute-bounded-value',
    component: HierarchicalAttributeBoundedValue,
    group: 'zero-trust-abac',
    description:
      'UX for two backend behaviours from the Property Permissions Proposal that had no design: BOUNDS (a value capped by another entity value — write.value.bounds:[linked] is the server-side guard that rejects a save above the cap on every write including later edits, read.option.bounds:[linked] is only the convenience that narrows the picker) and DERIVATION (a post inheriting its channel value, where there is NO per-value provenance marker at all — a stored value is explicit, absence means derived, so reverting to inherited is literally clearing the value). Caps chain: post <= channel <= system. Fail-closed is absolute: an unresolvable reference offers NOTHING and rejects the save, and the copy says so without ever implying "no limit" — a genuinely new empty state meaning fail-closed rather than unconfigured. Three surfaces: post composer (inherited default, capped picker, clear-to-re-inherit, rejected write with no bypass, cap-unresolvable), channel settings (raise-but-never-lower, the visible cap chain, and the still-open question of what happens when a parent value later drops below already-set child values), and System Console setup (derivation mode, which bound leaf is the guard vs the convenience, the linked-field relationship that makes comparison meaningful, and the second-field escape hatch since derivation cannot vary per value). On the open parent-drops-below-child question this prototype takes a position to argue against: BLOCK the change, name the conflicting posts, resolve each explicitly — because flagging leaves content mismarked indefinitely, re-checking silently rewrites other authors markings, and a read-side clamp is already ruled out as under-marking. Marked as a proposal, not settled backend behaviour. Ordered levels are modelled as the rank reading AND as a strict parent chain so the "graph generalises rank to within" claim is checkable; a Programs example exercises true within semantics with a multi-parent node. Deep-links: ?surface=post|channel|setup · ?state=inherited|explicit|rejected|cap-unresolved|conflict|graph-cap · ?scheme=levels|programs · ?demo=off.',
    addedAt: '2026-08-01',
    collections: ['attribute-management'],
  },
  // Hierarchical attribute VALUE MENU — the lightweight value picker on the three
  // real host surfaces. Rebuilt 2026-08-05 from role=menu + flyout submenus to
  // role=tree + inline expansion: a selectable branch value is unimplementable in
  // a menu (ARIA defines activating a parent menuitem as "open the submenu", so
  // there is no keyboard path to selecting it), Compass forbids submenu-of-submenu,
  // and shipping Mattermost makes a submenu parent non-activatable on desktop.
  // hierarchical-attribute-value-picker stays as the flat-list alternative.
  {
    id: 'hierarchical-attribute-value-menu',
    label: 'Hierarchical Attribute · Value menu (all surfaces)',
    path: '/prototypes/hierarchical-attribute-value-menu',
    component: HierarchicalAttributeValueMenu,
    group: 'zero-trust-abac',
    description:
      'Lightweight value picker for a Hierarchical (graph) attribute, built to the three real host surfaces rather than a full-page panel. A combobox trigger discloses a role=tree popup with aria-multiselectable, and children expand INLINE and indented — no flyouts, which is what lets a ~300px popover live inside a 400px sidebar. Every row is a treeitem: a 24x32 chevron button (its own accessible name, "Expand Air Operations") expands, and the rest of the row toggles selection, so a branch value is selectable without ambiguity — Carbon states this row rule directly, and it is the whole reason to use a tree instead of a menu. Keyboard is the APG treeview contract: arrows move, Right/Left expand and collapse, Space toggles selection, and expansion and selection share no key. Selection is STRICT — selecting a parent selects only that parent, because implicit descendant selection would silently widen an access grant — but a collapsed parent surfaces what it hides as "2 selected inside" rather than by checking its own box, which would misstate what is assigned. A multi-parent value renders ONCE, at its canonical parent, with "Also under Dragon Spacecraft" on its row; it does not repeat under its other parents, so there is one value, one control, one state, and no aria-owns question for a DAG node. No position numerals anywhere in the picker: the shipping [2] Captain / [4] TS badge works because rank is one flat global ladder, whereas a graph ordinal is per-parent, so two chips both reading 2 would imply a comparability the data lacks — numerals stay in the authoring surface. Typing flips the body to a flat one-row-per-value result list with breadcrumb paths. Consequence copy stays tiny: one aria-live footer line, plus inline notices under the field only for the two dangerous resource-side cases (an ancestor making a tighter marking inert, and nothing qualifying). Deep-links: ?surface=user|create-channel|channel-info · ?ranking=ranked|unranked (order only) · ?state=empty|selected|redundant|inert-marking|nothing-qualifies|search|expanded · ?demo=off.',

    addedAt: '2026-08-04',
    isPrimary: true,
    collections: ['attribute-management'],
  },
  {
    id: 'hierarchical-attribute-value-menu-user',
    label: 'Hierarchical Attribute · Value menu (user attributes)',
    path: '/prototypes/hierarchical-attribute-value-menu-user',
    component: ValueMenuUserPage,
    group: 'zero-trust-abac',
    description:
      'The subject side on its own: System Console → User Configuration, with the two-column USER ATTRIBUTES grid rendered for context (Device_Type as chips, Department, Rank as "2 Captain", Clearance as "4 TS", Resource) and Program as the live hierarchical multiselect. Selected values sit as chips with a remove affordance inside the control, matching Device_Type — no position numerals on them, since a per-parent ordinal shown without its parent means nothing. Subject-side redundancy — holding both a value and its own ancestor — is a quiet hint with a one-click fix, never a block, because recording a specific read-on has audit value. Deep-links: ?ranking=unranked|ranked · ?state=empty|selected|redundant|search|submenu · ?demo=off.',
    addedAt: '2026-08-04',
    collections: ['attribute-management'],
  },
  {
    id: 'hierarchical-attribute-value-menu-channel',
    label: 'Hierarchical Attribute · Value menu (channel)',
    path: '/prototypes/hierarchical-attribute-value-menu-channel',
    component: ValueMenuChannelPage,
    group: 'zero-trust-abac',
    description:
      'The resource side: the Channel Info right-hand sidebar by default, and the create-channel modal via ?surface=create-channel. The RHS is the tightest space of the three surfaces, and it is why the picker expands inline rather than in flyouts — a 300px menu with side flyouts does not fit a 400px sidebar. Both hosts show CHANNEL ATTRIBUTES rows with a value chip as the menu trigger; create-channel also exercises a flat single-select Classification with coloured chips (UNCLASSIFIED / CUI / CONFIDENTIAL / SECRET / TOP SECRET) alongside the hierarchical Program, so the flat and hierarchical cases appear in one host. Resource-side semantics are conjunctive: every marking must be held, so adding a value NARROWS who can enter — the opposite of a tag. Two inline warnings, only when they apply: an ancestor that makes a tighter marking inert, and a marking nobody qualifies for. Deep-links: ?surface=channel-info|create-channel · ?ranking=unranked|ranked · ?state=empty|selected|inert-marking|nothing-qualifies|search|submenu · ?demo=off.',
    addedAt: '2026-08-04',
    collections: ['attribute-management'],
  },
  // Drill-in submenu variation of the value menu — the standard-submenu answer,
  // for side-by-side comparison with the inline-tree version. (2026-08-05)
  {
    id: 'hierarchical-attribute-value-menu-drilldown',
    label: 'Hierarchical Attribute · Value menu (drill-in submenus)',
    path: '/prototypes/hierarchical-attribute-value-menu-drilldown',
    component: HierarchicalAttributeValueMenuDrilldown,
    group: 'zero-trust-abac',
    description:
      'The same value picker as hierarchical-attribute-value-menu, using DRILL-IN SUBMENUS instead of an inline tree — built to compare the two, since the spec can only specify one. Drilling into a parent replaces the panel body with that parent level rather than opening a flyout: no flyout means no ~300px panel beside a ~300px menu inside a 400px sidebar, no depth cap, and no conflict with Compass forbidding submenu-triggering-submenu. Mattermost already ships this shape — sub_menu.tsx converts submenus to a full drill-in on mobile and renders its header above and OUTSIDE role=menu, which is where this puts the back button and level name. Two rules make a selectable branch conformant here: a navigation row is navigation ONLY (plain menuitem with aria-haspopup, no checkmark, no aria-checked — ARIA defines activating a parent menuitem as opening its submenu, so such a row has no keyboard path to selection), and the parent value lives as the FIRST menuitemcheckbox of its own level above a separator, so selection state exists in exactly one place. This is the inverse of the earlier flyout build, which made the root row selectable AND duplicated the parent inside the submenu — one value, two roles, state in two places. The self row is distinguished from the header three ways: the header names a location with a back arrow, the row states its grant ("and everything under it"), and an "Inside Falcon Wing" heading separates it from the children. Because every root value is a navigation row, selection is disclosed as TEXT on those rows ("Selected", "2 selected inside") — a statement rather than a state, so nothing announces a state the row cannot change. Typing exits the drill-in entirely to a flat one-row-per-value result list with breadcrumb paths, flush with no reserved chevron column — the escape hatch from N round trips, which is this pattern main cost versus the tree. Multi-parent values render once at their canonical parent with "Also under Dragon Spacecraft". No position numerals anywhere. Trade-off against the tree: more familiar and more compact, but one level at a time, so what is selected across branches is not visible at a glance and siblings cannot be compared laterally. Deep-links: ?surface=user|create-channel|channel-info · ?ranking=ranked|unranked · ?state=empty|selected|redundant|inert-marking|nothing-qualifies|search|drilled · ?demo=off.',
    addedAt: '2026-08-05',
    collections: ['attribute-management'],
  },

  {
    id: 'mobile-home-channel',
    label: 'Mobile sample',
    path: '/prototypes/mobile-home-channel',
    component: MobileHomeChannel,
    group: 'calls-platform',
    description: 'Mobile home and channel sample surfaces.',
    addedAt: '2026-08-14',
  },
  {
    id: 'outbound-calls',
    label: 'Outbound Calls',
    path: '/prototypes/outbound-calls',
    component: OutboundCalls,
    group: 'calls-platform',
    description: 'Outbound calling flows and dialer.',
    addedAt: '2026-08-14',
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

export function getInitiativeOf(id: string): Initiative {
  return INITIATIVE_OF[id] ?? 'other';
}

export type InitiativeGroup = {
  initiative: Initiative;
  entries: PrototypeEntry[];
};

// Group entries by initiative. Each initiative's entries are sorted newest-first,
// and the initiatives themselves are ordered by their most-recent entry.
export function getInitiativeGroups(
  entries: PrototypeEntry[] = PROTOTYPES,
): InitiativeGroup[] {
  const byInitiative = new Map<Initiative, PrototypeEntry[]>();
  for (const p of entries) {
    const initiative = getInitiativeOf(p.id);
    if (!byInitiative.has(initiative)) byInitiative.set(initiative, []);
    byInitiative.get(initiative)!.push(p);
  }
  for (const arr of byInitiative.values()) {
    arr.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  }
  return [...byInitiative.entries()]
    .map(([initiative, es]) => ({ initiative, entries: es }))
    .sort((a, b) => b.entries[0].addedAt.localeCompare(a.entries[0].addedAt));
}
