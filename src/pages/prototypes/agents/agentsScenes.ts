export type AgentsSceneId = 'channels' | 'meet-first-agent' | 'new-agent';

export const AGENTS_SCENES: Array<{ id: AgentsSceneId; label: string }> = [
  { id: 'channels', label: 'Channels' },
  { id: 'meet-first-agent', label: 'Meet your first agent' },
  { id: 'new-agent', label: 'New agent' },
];

export const AGENTS_BASE = '/prototypes/agents';
