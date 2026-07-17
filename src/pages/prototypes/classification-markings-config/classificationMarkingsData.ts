export type ClassificationSource = 'preset' | 'existing';

export type ClassificationLevel = {
  id: string;
  text: string;
  /** Hex color, matching production Classification Markings presets. */
  color: string;
  rank: number;
};

export type ClassificationPreset = {
  id: string;
  label: string;
  levels: ClassificationLevel[];
};

export type EnforceResource = {
  id: string;
  name: string;
  summary: string;
};

export type ColorOption = {
  id: string;
  label: string;
  value: string;
};

export type RankedAttributeValue = {
  id: string;
  label: string;
  rank: number;
};

export type RankedUserAttribute = {
  id: string;
  name: string;
  values: RankedAttributeValue[];
};

export type EnforceResourceKind = 'Channels' | 'Posts' | 'Teams';

export type DisplayLocation =
  | 'Header'
  | 'Sidebar'
  | 'Banner'
  | 'Composer'
  | 'Message';

export type ResourceSpecificConfig = {
  required: boolean;
  display: DisplayLocation[];
};

/** classificationLevelId → clearanceValueId */
export type RankMap = Record<string, string>;

/**
 * Production presets from Mattermost System Console Classification Markings
 * (`webapp/channels/src/components/admin_console/classification_markings/utils/presets.ts`).
 */
export const CLASSIFICATION_PRESETS: ClassificationPreset[] = [
  {
    id: 'us',
    label: 'United States',
    levels: [
      { id: 'us-1', text: 'UNCLASSIFIED', color: '#007A33', rank: 1 },
      { id: 'us-2', text: 'CUI', color: '#502B85', rank: 2 },
      { id: 'us-3', text: 'CONFIDENTIAL', color: '#0033A0', rank: 3 },
      { id: 'us-4', text: 'SECRET', color: '#C8102E', rank: 4 },
      { id: 'us-5', text: 'TOP SECRET', color: '#FF8C00', rank: 5 },
      { id: 'us-6', text: 'TOP SECRET//SCI', color: '#FCE83A', rank: 6 },
    ],
  },
  {
    id: 'uk',
    label: 'UK (GSCP)',
    levels: [
      { id: 'uk-1', text: 'OFFICIAL', color: '#2B71C7', rank: 1 },
      { id: 'uk-2', text: 'OFFICIAL-SENSITIVE', color: '#2B71C7', rank: 2 },
      { id: 'uk-3', text: 'SECRET', color: '#F39C2C', rank: 3 },
      { id: 'uk-4', text: 'TOP SECRET', color: '#AA0000', rank: 4 },
    ],
  },
  {
    id: 'canada',
    label: 'Canada',
    levels: [
      { id: 'ca-1', text: 'PROTECTED A', color: '#227ABC', rank: 1 },
      { id: 'ca-2', text: 'PROTECTED B', color: '#900FB5', rank: 2 },
      { id: 'ca-3', text: 'PROTECTED C', color: '#460FB5', rank: 3 },
      { id: 'ca-4', text: 'CONFIDENTIAL', color: '#0033A0', rank: 4 },
      { id: 'ca-5', text: 'SECRET', color: '#C8102E', rank: 5 },
      { id: 'ca-6', text: 'TOP SECRET', color: '#FF671F', rank: 6 },
    ],
  },
  {
    id: 'australia',
    label: 'Australia (PSPF)',
    levels: [
      { id: 'au-1', text: 'UNOFFICIAL', color: '#FFFFFF', rank: 1 },
      { id: 'au-2', text: 'OFFICIAL', color: '#D5D7D8', rank: 2 },
      { id: 'au-3', text: 'OFFICIAL:Sensitive', color: '#FFEA00', rank: 3 },
      { id: 'au-4', text: 'PROTECTED', color: '#4676B6', rank: 4 },
      { id: 'au-5', text: 'SECRET', color: '#E2AFAE', rank: 5 },
      { id: 'au-6', text: 'TOP SECRET', color: '#E1211D', rank: 6 },
    ],
  },
  {
    id: 'nato',
    label: 'NATO',
    levels: [
      { id: 'nato-1', text: 'NATO UNCLASSIFIED', color: '#007A33', rank: 1 },
      { id: 'nato-2', text: 'NATO RESTRICTED', color: '#FF671F', rank: 2 },
      { id: 'nato-3', text: 'NATO CONFIDENTIAL', color: '#0033A0', rank: 3 },
      { id: 'nato-4', text: 'NATO SECRET', color: '#C8102E', rank: 4 },
      { id: 'nato-5', text: 'COSMIC TOP SECRET', color: '#F7EA48', rank: 5 },
    ],
  },
];

export const PRESET_CUSTOM_ID = 'custom';

export const PRESET_OPTIONS = [
  ...CLASSIFICATION_PRESETS.map((preset) => ({
    value: preset.id,
    label: preset.label,
  })),
  { value: PRESET_CUSTOM_ID, label: 'Custom' },
];

/** Default levels — United States production preset. */
export const US_PRESET_LEVELS: ClassificationLevel[] = CLASSIFICATION_PRESETS[0].levels.map(
  (level) => ({ ...level }),
);

/** Unique colors from production presets for the levels color select. */
export const COLOR_OPTIONS: ColorOption[] = Array.from(
  new Map(
    CLASSIFICATION_PRESETS.flatMap((preset) =>
      preset.levels.map((level) => [
        level.color.toUpperCase(),
        {
          id: level.color.toUpperCase(),
          label: level.color.toUpperCase(),
          value: level.color,
        } satisfies ColorOption,
      ]),
    ),
  ).values(),
);

export const DEFAULT_LEVEL_COLOR = '#007A33';

export const EXISTING_ATTRIBUTE_OPTIONS = [
  { value: 'classification', label: 'Classification' },
  { value: 'clearance', label: 'Clearance' },
  { value: 'sensitivity', label: 'Sensitivity' },
] as const;

export const DEFAULT_ENFORCE_RESOURCES: EnforceResource[] = [
  {
    id: 'channels',
    name: 'Channels',
    summary:
      'Required · Display: Header + Banner · Set by: Admins + Owners of channel',
  },
  {
    id: 'users',
    name: 'Users',
    summary:
      'Optional · Profile · Hide when empty · Visibility: shared with System admin · Options: all allowed',
  },
];

/** Sentinel mapping: classification level does not require a clearance value. */
export const CLEARANCE_NOT_REQUIRED_ID = 'clearance-not-required';

export const RANKED_USER_ATTRIBUTES: RankedUserAttribute[] = [
  {
    id: 'clearance',
    name: 'Clearance',
    values: [
      { id: 'clr-3', label: 'CONFIDENTIAL', rank: 3 },
      { id: 'clr-4', label: 'SECRET', rank: 4 },
      { id: 'clr-5', label: 'TOP SECRET', rank: 5 },
      { id: 'clr-6', label: 'TOP SECRET//SCI', rank: 6 },
    ],
  },
  {
    id: 'sensitivity',
    name: 'Sensitivity',
    values: [
      { id: 'sens-1', label: 'Public', rank: 1 },
      { id: 'sens-2', label: 'Internal', rank: 2 },
      { id: 'sens-3', label: 'Confidential', rank: 3 },
      { id: 'sens-4', label: 'Restricted', rank: 4 },
    ],
  },
];

export const ENFORCE_RESOURCE_OPTIONS: {
  id: EnforceResourceKind;
  label: string;
}[] = [
  { id: 'Channels', label: 'Channels' },
  { id: 'Posts', label: 'Posts' },
  { id: 'Teams', label: 'Teams' },
];

export const DISPLAY_OPTIONS_BY_RESOURCE: Record<
  EnforceResourceKind,
  DisplayLocation[]
> = {
  Channels: ['Header', 'Sidebar', 'Banner'],
  Teams: ['Header', 'Sidebar', 'Banner'],
  Posts: ['Composer', 'Message'],
};

export const DEFAULT_RESOURCE_SETTINGS: Record<
  EnforceResourceKind,
  ResourceSpecificConfig
> = {
  Channels: { required: true, display: ['Header', 'Banner'] },
  Posts: { required: true, display: ['Composer', 'Message'] },
  Teams: { required: false, display: ['Header'] },
};

export const DEFAULT_ENFORCE_CHECKED: EnforceResourceKind[] = ['Channels'];

/** Resources that have classification applied by default (Required / Display settings). */
export const DEFAULT_APPLIED_RESOURCES: EnforceResourceKind[] = ['Channels'];

export const APPLY_RESOURCE_ORDER: EnforceResourceKind[] = [
  'Channels',
  'Posts',
  'Teams',
];

let levelSeq = 100;

export function nextLevelId(): string {
  levelSeq += 1;
  return `lvl-${levelSeq}`;
}

export function reRankLevels(
  levels: ClassificationLevel[],
): ClassificationLevel[] {
  return levels.map((level, index) => ({ ...level, rank: index + 1 }));
}

export function getPresetLevels(presetId: string): ClassificationLevel[] | null {
  const preset = CLASSIFICATION_PRESETS.find((item) => item.id === presetId);
  if (!preset) return null;
  return preset.levels.map((level) => ({ ...level }));
}

export function autoMapByRank(
  levels: ClassificationLevel[],
  clearanceValues: RankedAttributeValue[],
): RankMap {
  const byRank = new Map(clearanceValues.map((v) => [v.rank, v.id]));
  const map: RankMap = {};
  for (const level of levels) {
    map[level.id] = byRank.get(level.rank) ?? CLEARANCE_NOT_REQUIRED_ID;
  }
  return map;
}
