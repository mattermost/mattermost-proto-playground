export type SearchTab = 'channels' | 'messages' | 'files' | 'people';

export type SceneId =
  | 'channels'
  | 'channels-typing'
  | 'messages'
  | 'messages-modifiers'
  | 'messages-results'
  | 'files'
  | 'people'
  | 'people-typing';

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'channels', label: 'Channels' },
  { id: 'channels-typing', label: 'Channels · Typing' },
  { id: 'messages', label: 'Messages' },
  { id: 'messages-modifiers', label: 'Messages · Filters' },
  { id: 'messages-results', label: 'Messages · Results' },
  { id: 'files', label: 'Files' },
  { id: 'people', label: 'People' },
  { id: 'people-typing', label: 'People · Typing' },
];

export function tabForScene(scene: SceneId): SearchTab {
  if (scene.startsWith('messages')) return 'messages';
  if (scene.startsWith('files')) return 'files';
  if (scene.startsWith('people')) return 'people';
  return 'channels';
}

export function isModalOpen(scene: SceneId): boolean {
  return scene !== 'messages-results';
}
