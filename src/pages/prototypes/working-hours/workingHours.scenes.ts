export type SceneId = 'settings' | 'menu' | 'in-action' | 'dm';

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'settings', label: 'Settings' },
  { id: 'menu', label: 'Profile menu' },
  { id: 'in-action', label: 'In action' },
  { id: 'dm', label: 'Direct message' },
];
