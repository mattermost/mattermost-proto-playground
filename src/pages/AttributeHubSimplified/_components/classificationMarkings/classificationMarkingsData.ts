import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';

export interface Level {
  id: string;
  text: string;
  color: string | null;
}

export type SourceKind = 'preset' | 'custom' | 'attribute';

export interface SourceValue {
  kind: SourceKind;
  id: string | null;
}

export interface Preset {
  id: string;
  label: string;
  levels: Level[];
}

export interface RankedAttribute {
  id: string;
  label: string;
  values: string[];
}

export const PRESETS: Preset[] = [
  {
    id: 'us',
    label: 'United States',
    levels: [
      { id: 'us-1', text: 'UNCLASSIFIED', color: '#007A33' },
      { id: 'us-2', text: 'CUI', color: '#502B85' },
      { id: 'us-3', text: 'CONFIDENTIAL', color: '#0033A0' },
      { id: 'us-4', text: 'SECRET', color: '#C8102E' },
      { id: 'us-5', text: 'TOP SECRET', color: '#FF8C00' },
      { id: 'us-6', text: 'TOP SECRET//SCI', color: '#FCE83A' },
    ],
  },
  {
    id: 'uk',
    label: 'UK (GSP)',
    levels: [
      { id: 'uk-1', text: 'OFFICIAL', color: '#007A33' },
      { id: 'uk-2', text: 'OFFICIAL-SENSITIVE', color: '#502B85' },
      { id: 'uk-3', text: 'SECRET', color: '#C8102E' },
      { id: 'uk-4', text: 'TOP SECRET', color: '#FF8C00' },
    ],
  },
  {
    id: 'ca',
    label: 'Canada',
    levels: [
      { id: 'ca-1', text: 'UNCLASSIFIED', color: '#007A33' },
      { id: 'ca-2', text: 'PROTECTED A', color: '#502B85' },
      { id: 'ca-3', text: 'PROTECTED B', color: '#0033A0' },
      { id: 'ca-4', text: 'PROTECTED C', color: '#C8102E' },
      { id: 'ca-5', text: 'CONFIDENTIAL', color: '#FF8C00' },
      { id: 'ca-6', text: 'SECRET', color: '#FCE83A' },
      { id: 'ca-7', text: 'TOP SECRET', color: '#7C2855' },
    ],
  },
  {
    id: 'au',
    label: 'Australia (PSPF)',
    levels: [
      { id: 'au-1', text: 'OFFICIAL', color: '#007A33' },
      { id: 'au-2', text: 'OFFICIAL: SENSITIVE', color: '#502B85' },
      { id: 'au-3', text: 'PROTECTED', color: '#0033A0' },
      { id: 'au-4', text: 'SECRET', color: '#C8102E' },
      { id: 'au-5', text: 'TOP SECRET', color: '#FF8C00' },
    ],
  },
  {
    id: 'nato',
    label: 'NATO',
    levels: [
      { id: 'nato-1', text: 'NATO UNCLASSIFIED', color: '#007A33' },
      { id: 'nato-2', text: 'NATO RESTRICTED', color: '#502B85' },
      { id: 'nato-3', text: 'NATO CONFIDENTIAL', color: '#0033A0' },
      { id: 'nato-4', text: 'NATO SECRET', color: '#C8102E' },
      { id: 'nato-5', text: 'COSMIC TOP SECRET', color: '#FF8C00' },
    ],
  },
];

export const COLOR_MEMORY: Record<string, string> = {
  UNCLASSIFIED: '#007A33',
  CUI: '#502B85',
  CONFIDENTIAL: '#0033A0',
  SECRET: '#C8102E',
  'TOP SECRET': '#FF8C00',
  'TOP SECRET//SCI': '#FCE83A',
  'NATO UNCLASSIFIED': '#007A33',
  'NATO RESTRICTED': '#502B85',
  'NATO CONFIDENTIAL': '#0033A0',
  'NATO SECRET': '#C8102E',
  'COSMIC TOP SECRET': '#FF8C00',
  OFFICIAL: '#007A33',
  'OFFICIAL-SENSITIVE': '#502B85',
};

export const COPY = {
  enableLabel: 'Enable classification markings',
  enableHelp:
    'Use this to enable classification markings as banners at the system and channel level. You can select text and colors for your banner, as well as set a default option for consistency.',
  sourceLabel: 'Classification levels source',
  sourceHelp:
    'Choose where your classification levels come from. Presets and custom lists are managed on this page. Linking a user attribute pulls its values in and keeps them in sync.',
  sourceGroupPresets: 'Presets',
  sourceGroupAttributes: 'User attributes',
  sourceOptionCustom: 'Custom',
  sourceEmptyTitle: 'No ranked user attributes available',
  clearanceLabel: 'Use these levels as user clearances',
  clearanceHelp:
    'Creates a ranked “Clearance” user attribute synced to these levels. Assign clearances to users and compare them with channel classification in membership policies to restrict access.',
  clearanceHelpLink: 'Set up a membership policy',
  clearanceLinkedHelp:
    'User attributes can be used in a membership policy to gate access by clearance.',
  levelsTitle: 'Classification levels',
  levelsHelp:
    'Rank 1 is the least sensitive level. Access rules treat a higher rank as more sensitive.',
  levelsColText: 'Text',
  levelsColColor: 'Color',
  levelsColRank: 'Rank',
  levelsAdd: 'Add level',
  levelsNoticeLinkedPrefix: 'Level names and order are managed by the user attribute',
  levelsNoticeLinkedTail: 'Colors are set here.',
  levelsNoticeLinkedLink: 'Edit attribute',
  lockTooltip: 'Managed by a linked attribute template.',
  lockAria: 'Order managed by linked attribute',
  rowNeedsColor: 'Needs color',
  setColor: 'Set color',
  levelsEmptyCustom:
    'No classification levels yet. Add a level, or choose a preset or user attribute above.',
  dialogChangeTitlePreset: 'Change classification preset?',
  dialogChangeTitleLevels: 'Change classification levels?',
  dialogChangeTitleCustom: 'Switch to custom levels?',
  dialogChangeBodyPreset:
    'Changing the classification preset will affect all existing classifications across the system. Any channels, files, or other resources marked with the current classification levels may lose their markings.',
  dialogChangeBodyAttr:
    'will replace your classification levels with its values. Any channels, files, or other resources marked with the current classification levels may lose their markings.',
  dialogChangeBodyCustom:
    'Your current levels stay in the table and become editable. Nothing is removed, and no existing markings change.',
  dialogChangeConfirmPreset: 'Change preset',
  dialogChangeConfirmLevels: 'Change levels',
  dialogChangeConfirmCustom: 'Switch to custom',
  dialogCancel: 'Cancel',
  globalTitle: 'Global classification',
  globalSubtitle:
    'Set a system-wide classification ceiling and configure the global banner shown in the Mattermost application.',
  globalEnabledLabel: 'Global classification',
  globalEnabledHelp:
    'When enabled, sets a global classification ceiling. Every channel, post, and other classified resource must be at or below this level.',
  globalLevelLabel: 'Global classification level',
  globalLevelHelp:
    'The maximum classification level permitted anywhere on this system. Choose from the levels defined above.',
  globalBannerPositionLabel: 'Global classification banner position',
  globalBannerPositionTopOnly: 'Top only',
  globalBannerPositionTopBottom: 'Top and bottom',
  globalBannerPositionHelp:
    'Where the global classification banner appears in the Mattermost application.',
} as const;

export function presetById(id: string | null): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}

export function rememberedColor(text: string): string | null {
  return COLOR_MEMORY[text.trim().toUpperCase()] ?? COLOR_MEMORY[text.trim()] ?? null;
}

export function hubAttributesToRanked(attributes: HubAttribute[]): RankedAttribute[] {
  return attributes.map((attr) => ({
    id: attr.id,
    label: attr.name,
    values: (attr.values ?? []).map((value) => value.label),
  }));
}

export function attributeById(
  attributes: RankedAttribute[],
  id: string | null,
): RankedAttribute | undefined {
  return attributes.find((attr) => attr.id === id);
}

export function levelsFromAttribute(attr: RankedAttribute): Level[] {
  return attr.values.map((value, index) => ({
    id: `${attr.id}-${index}`,
    text: value,
    color: rememberedColor(value),
  }));
}

export function encodeSource(source: SourceValue): string {
  return source.kind === 'custom' ? 'custom' : `${source.kind}:${source.id}`;
}

export function decodeSource(raw: string): SourceValue {
  if (raw === 'custom') return { kind: 'custom', id: null };
  const [kind, id] = raw.split(':');
  return { kind: kind as SourceKind, id: id ?? null };
}

export function sourceLabel(
  source: SourceValue,
  rankedAttributes: RankedAttribute[],
): string {
  if (source.kind === 'custom') return COPY.sourceOptionCustom;
  if (source.kind === 'preset') return presetById(source.id)?.label ?? '';
  return attributeById(rankedAttributes, source.id)?.label ?? '';
}
