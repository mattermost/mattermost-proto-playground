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
  { id: 'manage', label: 'Manage' },
  { id: 'agents', label: 'Agents' },
  { id: 'agent', label: 'Edit agent' },
  { id: 'automations', label: 'Automations' },
  { id: 'automation', label: 'Edit automation' },
];
