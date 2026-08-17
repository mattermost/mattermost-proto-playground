// Shared types for the Classification Enforcement — linking options mockup.
// Discussion prototype only (not a Phase 6 gate deliverable) — see the four
// scenes registered in ClassificationEnforcementLinkingOptions.tsx.

export type PresetId = 'united-states' | 'nato' | 'custom';

export interface ClassificationLevel {
  id: string;
  label: string;
  rank: number; // 0 = lowest
}

export interface ClassificationPreset {
  id: PresetId;
  label: string;
  description: string;
  levels: ClassificationLevel[];
}

/** An already-existing ranked user attribute in the org's attribute catalog,
 * modeled independently of the Classification Markings page's own preset. */
export interface ExistingRankedAttribute {
  id: string;
  name: string;
  values: { id: string; label: string; rank: number }[];
}

/** How the "require clearance" control creates/links its backing attribute. */
export type ClearanceSourceMode = 'create-new' | 'use-existing';
