import type { SceneId } from './matrixInteropTypes';

export type { SceneId };

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'connections', label: 'Connections' },
  { id: 'connection', label: 'Connection' },
  { id: 'channel-settings', label: 'Channel settings' },
];
