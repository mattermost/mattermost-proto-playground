import { TARGET_NOUN } from './copy';
// [AI DRAFT] Scene and direction configuration for the DM/GM prototype.

export type DirectionId = 'b' | 'a';

export const DEFAULT_DIRECTION: DirectionId = 'b';

export const DIRECTIONS: { id: DirectionId; label: string }[] = [
  { id: 'b', label: 'B · Start from a rule' },
  { id: 'a', label: 'A · Extend in place' },
];

export function directionFromParam(value: string | null): DirectionId | null {
  return value === 'a' || value === 'b' ? value : null;
}

/** How other-person conditions are authored. Independent of direction. */
export type VariantId = 'inline' | 'card';

export const DEFAULT_VARIANT: VariantId = 'inline';

export const VARIANTS: { value: VariantId; label: string }[] = [
  { value: 'inline', label: 'Inline conditions (primary)' },
  { value: 'card', label: 'Separate card (secondary)' },
];

export function variantFromParam(value: string | null): VariantId | null {
  return value === 'inline' || value === 'card' ? value : null;
}

export type SceneId =
  'authoring' | 'simulate' | 'start' | 'readonly' | 'hidden';

export const DEFAULT_SCENE: SceneId = 'authoring';

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'authoring', label: '1 · Authoring' },
  { id: 'simulate', label: '2 · Simulate' },
  { id: 'start', label: '3 · Blocked start' },
  { id: 'readonly', label: '4 · Read-only' },
  { id: 'hidden', label: '5 · Hidden' },
];

export function sceneFromParam(value: string | null): SceneId | null {
  return SCENES.some((s) => s.id === value) ? (value as SceneId) : null;
}

export interface ScreenDef {
  id: string;
  label: string;
}

/** Authoring differs per direction and variation; every other scene is shared. */
export function authoringScreens(
  direction: DirectionId,
  variant: VariantId,
): ScreenDef[] {
  if (direction === 'b') {
    return [
      { id: 'gallery', label: 'Start from a rule' },
      { id: 'mapping', label: 'Map attributes' },
      { id: 'editor', label: 'Editor with summary' },
      ...(variant === 'inline'
        ? [{ id: 'advanced', label: 'One-way rule (Advanced)' }]
        : []),
      { id: 'blocked', label: 'Add permission blocked' },
    ];
  }
  return [
    { id: 'picker', label: 'Add permission' },
    { id: 'configured', label: 'Policy configured' },
    ...(variant === 'inline'
      ? [{ id: 'advanced', label: 'One-way rule (Advanced)' }]
      : []),
    { id: 'blocked', label: 'Add permission blocked' },
  ];
}

export const SIMULATE_SCREENS: Record<DirectionId, ScreenDef[]> = {
  b: [
    { id: 'pair', label: 'One-way pair' },
    { id: 'group', label: 'Third person (group)' },
    { id: 'bot', label: `Bot as ${TARGET_NOUN}` },
  ],
  a: [
    { id: 'pair', label: 'One-way pair' },
    { id: 'bot', label: `Bot as ${TARGET_NOUN}` },
  ],
};

export const START_SCREENS: ScreenDef[] = [
  { id: 'dm-modal', label: 'Direct Messages modal' },
  { id: 'gm-modal', label: 'Group message' },
  { id: 'profile', label: 'Profile popover' },
  { id: 'slash', label: '/msg command' },
];

export const READONLY_SCREENS: ScreenDef[] = [
  { id: 'dm', label: 'Read-only DM' },
  { id: 'gm', label: 'Read-only GM' },
  { id: 'session', label: 'Denied mid-typing' },
];

export const HIDDEN_SCREENS: ScreenDef[] = [
  { id: 'active', label: 'Open DM is hidden' },
  { id: 'after', label: 'After navigating away' },
];

export function screensFor(
  scene: SceneId,
  direction: DirectionId,
  variant: VariantId,
): ScreenDef[] {
  switch (scene) {
    case 'authoring':
      return authoringScreens(direction, variant);
    case 'simulate':
      return SIMULATE_SCREENS[direction];
    case 'start':
      return START_SCREENS;
    case 'readonly':
      return READONLY_SCREENS;
    case 'hidden':
      return HIDDEN_SCREENS;
    default: {
      const exhaustive: never = scene;
      return exhaustive;
    }
  }
}
