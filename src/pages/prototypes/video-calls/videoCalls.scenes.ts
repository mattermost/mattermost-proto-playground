export type SceneId =
  | 'dm'
  | 'channel'
  | 'pre-join'
  | 'ringing-out'
  | 'ringing-in'
  | 'call'
  | 'minimized'
  | 'screen-share'
  | 'ended';

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'dm', label: 'DM' },
  { id: 'channel', label: 'Channel' },
  { id: 'pre-join', label: 'Pre-join' },
  { id: 'ringing-out', label: 'Calling' },
  { id: 'ringing-in', label: 'Incoming' },
  { id: 'call', label: 'Call' },
  { id: 'minimized', label: 'Minimized' },
  { id: 'screen-share', label: 'Screen share' },
  { id: 'ended', label: 'Ended' },
];

export const SCENE_IDS: SceneId[] = SCENES.map((s) => s.id);

export function isSceneId(value: string): value is SceneId {
  return (SCENE_IDS as string[]).includes(value);
}
