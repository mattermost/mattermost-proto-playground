import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import ServerVariantIcon from '@mattermost/compass-icons/components/server-variant';

import type { ConsoleSidebarCategoryData } from '@/components/ui/ConsoleSidebar/ConsoleSidebar';

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

/** A single classification level row. `color` is null when no color is set yet. */
export interface Level {
  /** Stable identity — colors and ranks follow the id, not the text, so a rename keeps its color. */
  id: string;
  text: string;
  color: string | null;
}

/** Where the level list comes from. Exactly one source is declared at a time. */
export type SourceKind = 'preset' | 'custom' | 'attribute';

export interface SourceValue {
  kind: SourceKind;
  /** Preset id when kind === 'preset', attribute id when kind === 'attribute'. */
  id: string | null;
}

export interface Preset {
  id: string;
  label: string;
  levels: Level[];
}

/** A ranked user attribute eligible to supply classification levels. */
export interface RankedAttribute {
  id: string;
  label: string;
  /** Ordered least → most sensitive. */
  values: string[];
}

/* ------------------------------------------------------------------ *
 * Console chrome
 * ------------------------------------------------------------------ */

export const CM_SIDEBAR_CATEGORIES: ConsoleSidebarCategoryData[] = [
  {
    id: 'user-management',
    label: 'User Management',
    icon: <AccountMultipleOutlineIcon />,
    items: [
      { id: 'users', label: 'Users' },
      { id: 'groups', label: 'Groups' },
      { id: 'teams', label: 'Teams' },
      { id: 'channels', label: 'Channels' },
      { id: 'permissions', label: 'Permissions' },
    ],
  },
  {
    id: 'attribute-management',
    label: 'Attribute Management',
    icon: <FormatListBulletedIcon />,
    items: [
      { id: 'global-attributes', label: 'Global Attributes' },
      { id: 'user-attributes', label: 'User Attributes' },
      { id: 'channel-attributes', label: 'Channel Attributes' },
    ],
  },
  {
    id: 'attribute-based-policies',
    label: 'Attribute-Based Policies',
    icon: <ShieldOutlineIcon />,
    items: [
      { id: 'membership-policies', label: 'Membership Policies' },
      { id: 'permission-policies', label: 'Permission Policies' },
    ],
  },
  {
    id: 'site-configuration',
    label: 'Site Configuration',
    icon: <CogOutlineIcon />,
    items: [
      { id: 'customization', label: 'Customization' },
      { id: 'localization', label: 'Localization' },
      { id: 'users-and-teams', label: 'Users and Teams' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'classification-markings', label: 'Classification Markings' },
      { id: 'announcement-banner', label: 'Announcement Banner' },
    ],
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: <ServerVariantIcon />,
    items: [
      { id: 'web-server', label: 'Web Server' },
      { id: 'database', label: 'Database' },
      { id: 'elasticsearch', label: 'Elasticsearch' },
      { id: 'file-storage', label: 'File Storage' },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Presets — picking one SEEDS an editable list (copy semantics)
 * ------------------------------------------------------------------ */

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

export function presetById(id: string | null): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}

/* ------------------------------------------------------------------ *
 * Ranked user attributes — picking one LINKS it (reference semantics)
 * ------------------------------------------------------------------ */

export const RANKED_ATTRIBUTES: RankedAttribute[] = [
  {
    id: 'clearance-level',
    label: 'Clearance',
    values: [
      'UNCLASSIFIED',
      'CONFIDENTIAL',
      'SECRET',
      'TOP SECRET',
      'TOP SECRET//SCI',
    ],
  },
  {
    id: 'handling',
    label: 'Handling',
    values: ['RELIDO', 'NOFORN', 'ORCON'],
  },
];

export function attributeById(id: string | null): RankedAttribute | undefined {
  return RANKED_ATTRIBUTES.find((a) => a.id === id);
}

/**
 * The drift variant of `clearance-level`: upstream added CONFIDENTIAL//NOFORN
 * and moved it above CONFIDENTIAL. Used by the "drift" scene.
 */
export const CLEARANCE_LEVEL_DRIFTED: RankedAttribute = {
  id: 'clearance-level',
  label: 'Clearance',
  values: [
    'UNCLASSIFIED',
    'CONFIDENTIAL//NOFORN',
    'CONFIDENTIAL',
    'SECRET',
    'TOP SECRET',
    'TOP SECRET//SCI',
  ],
};

/* ------------------------------------------------------------------ *
 * Color memory
 *
 * A ranked attribute carries text and order only — never colors. Colors are
 * the one thing that has no source but this page, so they are cached by level
 * text and reapplied whenever a level with that text arrives from any source.
 * ------------------------------------------------------------------ */

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

export function rememberedColor(text: string): string | null {
  return COLOR_MEMORY[text.trim().toUpperCase()] ?? COLOR_MEMORY[text.trim()] ?? null;
}

/** Build the level list a linked attribute produces, restoring known colors. */
export function levelsFromAttribute(attr: RankedAttribute): Level[] {
  return attr.values.map((v, i) => ({
    id: `${attr.id}-${i}`,
    text: v,
    color: rememberedColor(v),
  }));
}

/* ------------------------------------------------------------------ *
 * Demo constants
 * ------------------------------------------------------------------ */

export const MEMBERSHIP_POLICY_ROUTE =
  '/prototypes/global-membership-policy-simplified';
export const USER_ATTRIBUTES_ROUTE = '/prototypes/attribute-hub-mvp?resource=Users';

/* ------------------------------------------------------------------ *
 * Copy deck — every user-facing string, sentence case
 * ------------------------------------------------------------------ */

export const COPY = {
  pageTitle: 'Classification Markings',

  enableLabel: 'Enable classification markings',
  enableHelp:
    'Use this to enable classification markings as banners at the system and channel level. You can select text and colors for your banner, as well as set a default option for consistency.',

  sourceLabel: 'Classification levels source',
  sourceHelp:
    'Choose where your classification levels come from. Presets and custom lists are managed on this page. Linking a user attribute pulls its values in and keeps them in sync.',
  sourceGroupPresets: 'Presets',
  sourceGroupCustom: 'Custom',
  sourceGroupAttributes: 'User attributes',
  sourceOptionCustom: 'Custom',
  sourceEmptyTitle: 'No ranked user attributes available',

  clearanceLabel: 'Use these levels as user clearances',
  clearanceHelp:
    'Creates a ranked “Clearance” user attribute that stays in sync with the levels below. Required before a membership policy can gate access by clearance.',
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

  errorAttrDeletedTitle: 'Linked attribute no longer available',
  errorAttrDeletedBody:
    'was deleted. Classification levels are frozen at their last known values and banners still display. You cannot edit level names or order until you choose a new source.',
  errorActionConvert: 'Convert to custom levels',

  dialogChangeTitlePreset: 'Change classification preset?',
  dialogChangeTitleLevels: 'Change classification levels?',
  dialogChangeTitleCustom: 'Switch to custom levels?',

  /* The consequence carries the warning — no separate warning box. */
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

  globalTitle: 'Global classification indicators',
  globalSubtitle:
    'Configure the global classification banner to be displayed at the very top of the Mattermost application.',
  globalBannerLabel: 'Global classification banner',
  globalBannerHelp: 'Displays a global banner for the system-wide classification.',
  globalVisibilityLabel: 'Banner visibility',
  globalVisibilityTopOnly: 'Top only',
  globalVisibilityTopBottom: 'Top and bottom',
  globalLevelLabel: 'Global classification level',
  globalLevelHelp:
    'Applies to every user on the system. Choose from the levels defined above.',
} as const;
