import type { SceneSwitcherScene } from '@/components/navigation/SceneSwitcher/SceneSwitcher';

export type SceneId = 'discover' | 'manage' | 'agents' | 'agent';

export const SCENES: SceneSwitcherScene[] = [
  { id: 'discover', label: 'Discover' },
  { id: 'manage', label: 'Automations RHS' },
  { id: 'agents', label: 'Agents' },
  { id: 'agent', label: 'Edit agent' },
];
