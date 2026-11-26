export type SceneId =
  'permissions' | 'shared' | 'group-attributes' | 'group-members';

export const SCENES: { id: SceneId; label: string }[] = [
  { id: 'permissions', label: 'Permissions' },
  { id: 'shared', label: 'Shared steps' },
  { id: 'group-attributes', label: 'Group: attributes' },
  { id: 'group-members', label: 'Group: users' },
];
