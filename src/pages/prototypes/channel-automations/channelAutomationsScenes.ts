import type { SceneSwitcherScene } from '@/components/navigation/SceneSwitcher/SceneSwitcher';

export type SceneId = 'discover' | 'create' | 'manage' | 'agent';

/** Which container hosts the management list. */
export type ManagePresentation = 'rhs' | 'modal';

/**
 * Which header treatment surfaces automations — two competing possibilities,
 * shown one at a time rather than together:
 * - `agents-menu`: a single Agents (sparkle) button opening the AI menu, with
 *   automations folded in (create + "View automations · N").
 * - `automations-icon`: a dedicated automations count icon in the stat row that
 *   opens the management surface directly.
 */
export type HeaderEntryPoint = 'agents-menu' | 'automations-icon';

export const SCENES: SceneSwitcherScene[] = [
  { id: 'discover', label: 'Discover' },
  { id: 'create', label: 'Create' },
  { id: 'manage', label: 'Manage' },
  { id: 'agent', label: 'Edit agent' },
];
