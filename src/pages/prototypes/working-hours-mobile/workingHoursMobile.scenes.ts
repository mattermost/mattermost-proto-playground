export type SceneId = 'settings' | 'in-action' | 'dm';

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'settings', label: 'Settings' },
  { id: 'in-action', label: 'Off hours' },
  { id: 'dm', label: 'Direct message' },
];
