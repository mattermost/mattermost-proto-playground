export type SearchTab =
  | 'all'
  | 'channels'
  | 'messages'
  | 'files'
  | 'people'
  | 'copilot';

export type SceneId =
  | 'all'
  | 'all-typing'
  | 'channels'
  | 'channels-typing'
  | 'messages'
  | 'messages-modifiers'
  | 'messages-results'
  | 'files'
  | 'people'
  | 'people-typing'
  | 'copilot';

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'all-typing', label: 'All · Typing' },
  { id: 'channels', label: 'Channels' },
  { id: 'channels-typing', label: 'Channels · Typing' },
  { id: 'messages', label: 'Messages' },
  { id: 'messages-modifiers', label: 'Messages · Filters' },
  { id: 'messages-results', label: 'Messages · Results' },
  { id: 'files', label: 'Files' },
  { id: 'people', label: 'People' },
  { id: 'people-typing', label: 'People · Typing' },
  { id: 'copilot', label: 'Agents' },
];

export function tabForScene(scene: SceneId): SearchTab {
  if (scene === 'all' || scene === 'all-typing') return 'all';
  if (scene.startsWith('messages')) return 'messages';
  if (scene.startsWith('files')) return 'files';
  if (scene.startsWith('people')) return 'people';
  if (scene === 'copilot') return 'copilot';
  return 'channels';
}

export function isModalOpen(scene: SceneId): boolean {
  return scene !== 'messages-results';
}
