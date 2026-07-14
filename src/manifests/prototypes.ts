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
import AttributeHubMVPNext from '@/pages/AttributeHubMVPNext/AttributeHubMVPNext';
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
    component: AttributeHubMVPNext,
    group: 'zero-trust-abac',
    description:
      'P0 scope cut of Global Attributes (epic MM-69673) — active working iteration. Define an attribute once + choose which of Users/Channels/Posts can use it — no assignment/enforcement. System Console Save pattern, Display name field, Users profile display (Always/When set/Hidden), Member/Sysadmin who-can-set, no Usage column. Deep-links: ?attr=<id>, ?flow=new, ?allowed=on, ?resource=Channels|Users|Posts (comma-separated).',
    addedAt: '2026-07-08',
    isPrimary: true,
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
