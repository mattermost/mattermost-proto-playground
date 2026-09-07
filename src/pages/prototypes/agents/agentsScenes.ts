export type AgentsSceneId =
  | 'channels'
  | 'meet-first-agent'
  | 'matty-chat'
  | 'new-agent'
  | 'agent-settings';

export const AGENTS_SCENES: Array<{ id: AgentsSceneId; label: string }> = [
  { id: 'channels', label: 'Channels' },
  { id: 'meet-first-agent', label: 'Meet your first agent' },
  { id: 'matty-chat', label: 'Chat with Matty' },
  { id: 'new-agent', label: 'New agent' },
  { id: 'agent-settings', label: 'Agent settings' },
];

export const AGENTS_BASE = '/prototypes/agents';
