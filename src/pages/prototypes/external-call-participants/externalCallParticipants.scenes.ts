export type SceneId = 'welcome' | 'widget' | 'popout' | 'guest';

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'widget', label: 'Widget' },
  { id: 'popout', label: 'Popout' },
  { id: 'welcome', label: 'Welcome' },
  { id: 'guest', label: 'Guest' },
];
