export type SearchTab =
  | 'all'
  | 'channels'
  | 'messages'
  | 'files'
  | 'people'
  | 'copilot';

export type SceneId =
  | 'all'
  | 'channels'
  | 'messages'
  | 'messages-modifiers'
  | 'messages-results'
  | 'files'
  | 'people'
  | 'copilot';

export function tabForScene(scene: SceneId): SearchTab {
  if (scene === 'all') return 'all';
  if (scene.startsWith('messages')) return 'messages';
  if (scene.startsWith('files')) return 'files';
  if (scene.startsWith('people')) return 'people';
  if (scene === 'copilot') return 'copilot';
  return 'channels';
}

export function isModalOpen(scene: SceneId): boolean {
  return scene !== 'messages-results';
}
