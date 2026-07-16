import type { SceneSwitcherScene } from '@/components/navigation/SceneSwitcher/SceneSwitcher';

export type ExtendedSceneId =
  | 'discover'
  | 'manage'
  | 'agents'
  | 'agent'
  | 'automations'
  | 'automation';

export const EXTENDED_SCENES: SceneSwitcherScene[] = [
  { id: 'discover', label: 'Discover' },
  { id: 'manage', label: 'Automations RHS' },
  { id: 'agents', label: 'Agents' },
  { id: 'agent', label: 'Edit agent' },
  { id: 'automations', label: 'Automations' },
  { id: 'automation', label: 'Edit automation' },
];

/** Agent edit is reached from the agents list, not the scene switcher. */
export const STANDALONE_SCENES = EXTENDED_SCENES.filter((scene) => scene.id !== 'agent');
