import type {
  ClassificationPreset,
  ExistingRankedAttribute,
  PresetId,
} from './types';

export const PRESETS: ClassificationPreset[] = [
  {
    id: 'united-states',
    label: 'United States',
    description: 'US classification and control markings, low to high.',
    levels: [
      { id: 'u', label: 'UNCLASSIFIED', rank: 0 },
      { id: 'cui', label: 'CUI', rank: 1 },
      { id: 'c', label: 'CONFIDENTIAL', rank: 2 },
      { id: 's', label: 'SECRET', rank: 3 },
      { id: 'ts', label: 'TOP SECRET', rank: 4 },
      { id: 'ts-sci', label: 'TOP SECRET//SCI', rank: 5 },
    ],
  },
  {
    id: 'nato',
    label: 'NATO',
    description: 'NATO classification markings, low to high.',
    levels: [
      { id: 'nu', label: 'NATO UNCLASSIFIED', rank: 0 },
      { id: 'nr', label: 'NATO RESTRICTED', rank: 1 },
      { id: 'nc', label: 'NATO CONFIDENTIAL', rank: 2 },
      { id: 'ns', label: 'NATO SECRET', rank: 3 },
      { id: 'cts', label: 'COSMIC TOP SECRET', rank: 4 },
    ],
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Build your own set of ranked levels.',
    levels: [],
  },
];

export function presetById(id: PresetId): ClassificationPreset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

/** Org's existing ranked user attributes — modeled independently of the
 * Classification Markings page. Neither one's values are guaranteed to line
 * up with a classification preset 1:1, which is the point of Mockup A. */
export const EXISTING_RANKED_ATTRIBUTES: ExistingRankedAttribute[] = [
  {
    id: 'clearance-existing',
    name: 'Clearance',
    values: [
      { id: 'pub', label: 'Public', rank: 0 },
      { id: 'conf', label: 'Confidential', rank: 1 },
      { id: 'secret', label: 'Secret', rank: 2 },
      { id: 'ts', label: 'Top Secret', rank: 3 },
    ],
  },
  {
    id: 'sensitivity',
    name: 'Sensitivity',
    values: [
      { id: 'low', label: 'Low', rank: 0 },
      { id: 'med', label: 'Medium', rank: 1 },
      { id: 'high', label: 'High', rank: 2 },
      { id: 'crit', label: 'Critical', rank: 3 },
      { id: 'sev', label: 'Severe', rank: 4 },
    ],
  },
];

export function existingAttrById(id: string): ExistingRankedAttribute {
  return (
    EXISTING_RANKED_ATTRIBUTES.find((a) => a.id === id) ??
    EXISTING_RANKED_ATTRIBUTES[0]
  );
}
