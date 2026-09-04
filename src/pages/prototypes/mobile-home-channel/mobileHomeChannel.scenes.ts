import type { MobileTabBarTab } from '@mattermost/compass-proto';

export type TabSceneId = MobileTabBarTab;

export type SceneId = TabSceneId | 'channel' | 'modal';

export type ModalPeek = TabSceneId | 'channel';

export const TAB_SCENES: {id: TabSceneId; label: string}[] = [
  {id: 'home', label: 'Home'},
  {id: 'search', label: 'Search'},
  {id: 'mentions', label: 'Mentions'},
  {id: 'saved', label: 'Saved'},
  {id: 'profile', label: 'Profile'},
];

export const SCENES: {id: SceneId; label: string}[] = [
  ...TAB_SCENES,
  {id: 'channel', label: 'Channel'},
  {id: 'modal', label: 'Modal'},
];

export const DEFAULT_CHANNEL_NAME = 'UX Design';

export function isTabScene(id: SceneId): id is TabSceneId {
  return (
    id === 'home' ||
    id === 'search' ||
    id === 'mentions' ||
    id === 'saved' ||
    id === 'profile'
  );
}
