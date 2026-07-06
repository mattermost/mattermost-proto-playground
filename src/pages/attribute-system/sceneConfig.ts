export type SceneId =
  | 'global'
  | 'globalTable'
  | 'globalTableVisibility'
  | 'globalV2'
  | 'user'
  | 'userV2'
  | 'channel'
  | 'channelHybrid'
  | 'channelV2'
  | 'post'
  | 'postV2'
  | 'team'
  | 'teamV2'
  | 'assign'
  | 'assignV2'
  | 'postCreate'
  | 'postCreateCompact';

export interface SceneMeta {
  id: SceneId;
  label: string;
  persona: string;
  /** Primary strip vs. overflow menu for legacy / alternate surfaces. */
  tier: 'primary' | 'more';
  tooltip?: string;
}

export const SCENE_CONFIG: SceneMeta[] = [
  {
    id: 'global',
    label: 'SC · Global attributes',
    persona: 'System Admin',
    tier: 'more',
  },
  {
    id: 'globalTable',
    label: 'SC · Global · Inline edit',
    persona: 'System Admin',
    tier: 'more',
    tooltip:
      'Global attributes listing for high-level configuration and resource applicability. Manages Read and Write access separately at the global level.',
  },
  {
    id: 'globalTableVisibility',
    label: 'SC · Global · Value visibility',
    persona: 'System Admin',
    tier: 'primary',
    tooltip:
      'Global attributes listing for high-level configuration and resource applicability. Most up-to-date option — earlier global variants are under More surfaces.',
  },
  {
    id: 'globalV2',
    label: 'SC · Global attributes',
    persona: 'System Admin',
    tier: 'primary',
    tooltip:
      'Simplified definition surface — no write floor; editability and open vocabulary configured once here.',
  },
  {
    id: 'user',
    label: 'SC · User attributes',
    persona: 'System Admin',
    tier: 'primary',
    tooltip:
      'Based on the current User Attributes UI, with promote-to-global and add-from-global flows.',
  },
  {
    id: 'userV2',
    label: 'SC · User attributes',
    persona: 'System Admin',
    tier: 'primary',
    tooltip:
      'Simplified user attributes — visibility hardcoded; optional self-edit toggle only.',
  },
  {
    id: 'channel',
    label: 'SC · Channel attributes',
    persona: 'System Admin',
    tier: 'primary',
    tooltip:
      'New UI for channel-level options on applicable attributes. Important configuration is surfaced in the table columns.',
  },
  {
    id: 'channelHybrid',
    label: 'SC · Channel attributes (hybrid)',
    persona: 'System Admin',
    tier: 'primary',
    tooltip:
      'New UI for channel-level options on applicable attributes. All configuration lives in a per-attribute Configure modal.',
  },
  {
    id: 'channelV2',
    label: 'SC · Channel attributes',
    persona: 'System Admin',
    tier: 'primary',
    tooltip:
      'Simplified channel bindings — Required, default display, inheritance only. No Configure modal.',
  },
  {
    id: 'post',
    label: 'SC · Post attributes',
    persona: 'System Admin',
    tier: 'primary',
  },
  {
    id: 'postV2',
    label: 'SC · Post attributes',
    persona: 'System Admin',
    tier: 'primary',
    tooltip:
      'Minimal post bindings — Required only; channel inheritance read-only from Channel Attributes.',
  },
  {
    id: 'team',
    label: 'Team Settings · Attributes',
    persona: 'Team Admin',
    tier: 'more',
    tooltip: 'Legacy team-settings surface — uses older UI patterns.',
  },
  {
    id: 'teamV2',
    label: 'Team Settings · Attributes',
    persona: 'Team Admin',
    tier: 'primary',
    tooltip: 'Simplified team attributes — derived defaults, no Configure modal.',
  },
  {
    id: 'assign',
    label: 'Channel · Assign values',
    persona: 'Channel Admin',
    tier: 'primary',
    tooltip:
      'Channel admin assign flow inside Channel Settings on the live channel layout. Set values, display locations, and inherited-to-posts behavior.',
  },
  {
    id: 'assignV2',
    label: 'Channel · Assign values',
    persona: 'Channel Admin',
    tier: 'primary',
    tooltip:
      'Display locations seeded from system defaults set on Channel Attributes.',
  },
  {
    id: 'postCreate',
    label: 'Composer · Rail (A)',
    persona: 'End User',
    tier: 'primary',
  },
  {
    id: 'postCreateCompact',
    label: 'Composer · Dropdown (B)',
    persona: 'End User',
    tier: 'primary',
  },
];

export type PrototypeVariant = 'current' | 'simplified';

/** Scenes in the simplified (v2) prototype pass. */
export const V2_SCENE_IDS: SceneId[] = [
  'globalV2',
  'userV2',
  'channelV2',
  'postV2',
  'teamV2',
  'assignV2',
];

const V2_SCENE_SET = new Set<SceneId>(V2_SCENE_IDS);

export function isV2Scene(id: SceneId): boolean {
  return V2_SCENE_SET.has(id);
}

/** Primary strip for the current (v1) configuration surfaces. */
export const PRIMARY_SCENE_GROUPS_V1: SceneId[][] = [
  ['globalTableVisibility', 'user', 'channel', 'channelHybrid', 'post'],
  ['assign'],
  ['postCreate', 'postCreateCompact'],
];

/** Primary strip for the simplified (v2) configuration surfaces. */
export const PRIMARY_SCENE_GROUPS_V2: SceneId[][] = [
  ['globalV2', 'userV2', 'channelV2', 'postV2', 'teamV2'],
  ['assignV2'],
];

/** @deprecated Use PRIMARY_SCENE_GROUPS_V1 or _V2. */
export const PRIMARY_SCENE_GROUPS = PRIMARY_SCENE_GROUPS_V1;

const V1_TO_V2: Partial<Record<SceneId, SceneId>> = {
  global: 'globalV2',
  globalTable: 'globalV2',
  globalTableVisibility: 'globalV2',
  user: 'userV2',
  channel: 'channelV2',
  channelHybrid: 'channelV2',
  post: 'postV2',
  team: 'teamV2',
  assign: 'assignV2',
};

const V2_TO_V1: Partial<Record<SceneId, SceneId>> = {
  globalV2: 'globalTableVisibility',
  userV2: 'user',
  channelV2: 'channel',
  postV2: 'post',
  teamV2: 'team',
  assignV2: 'assign',
};

export function sceneVariant(id: SceneId): PrototypeVariant {
  return isV2Scene(id) ? 'simplified' : 'current';
}

/** Map a scene to its closest counterpart when switching prototype variant. */
export function counterpartScene(
  id: SceneId,
  target: PrototypeVariant,
): SceneId {
  if (target === 'simplified') {
    return V1_TO_V2[id] ?? 'globalV2';
  }
  return V2_TO_V1[id] ?? 'globalTableVisibility';
}

export const MORE_SCENES_V1 = SCENE_CONFIG.filter(
  (s) => s.tier === 'more' && !isV2Scene(s.id),
);

export function sceneMeta(id: SceneId): SceneMeta {
  return SCENE_CONFIG.find((s) => s.id === id) ?? SCENE_CONFIG[0];
}

export function isSceneId(value: string): value is SceneId {
  return SCENE_CONFIG.some((s) => s.id === value);
}
