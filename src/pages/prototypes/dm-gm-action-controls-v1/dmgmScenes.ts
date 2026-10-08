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
  'authoring' | 'start' | 'readonly' | 'hidden';

export const DEFAULT_SCENE: SceneId = 'authoring';

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'authoring', label: '1 · Authoring' },
  { id: 'start', label: '2 · Blocked start' },
  { id: 'readonly', label: '3 · Read-only' },
  { id: 'hidden', label: '4 · Hidden' },
];

export function sceneFromParam(value: string | null): SceneId | null {
  return SCENES.some((s) => s.id === value) ? (value as SceneId) : null;
}

export interface ScreenDef {
  id: string;
  label: string;
}

/** Authoring differs per direction; both variations share the same screens. */
export function authoringScreens(
  direction: DirectionId,
  _variant: VariantId,
): ScreenDef[] {
  void _variant;
  return direction === 'b'
    ? [
        { id: 'gallery', label: 'Start from a rule' },
        { id: 'editor', label: 'Editor with summary' },
        { id: 'one-way', label: 'One-way rule' },
        { id: 'blocked', label: 'Add permission blocked' },
      ]
    : [
        { id: 'picker', label: 'Add permission' },
        { id: 'configured', label: 'Policy configured' },
        { id: 'one-way', label: 'One-way rule' },
        { id: 'blocked', label: 'Add permission blocked' },
      ];
}

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
