export type AgentsSceneId =
  | 'channels'
  | 'meet-first-agent'
  | 'all-agents'
  | 'matty-chat'
  | 'new-agent'
  | 'agent-settings'
  | 'scheduled-work'
  | 'artifact';

export const AGENTS_SCENES: Array<{ id: AgentsSceneId; label: string }> = [
  { id: 'channels', label: 'Channels' },
  { id: 'meet-first-agent', label: 'Meet your first agent' },
  { id: 'all-agents', label: 'All agents' },
  { id: 'matty-chat', label: 'Chat with Matty' },
  { id: 'new-agent', label: 'New agent' },
  { id: 'agent-settings', label: 'Agent settings' },
  { id: 'scheduled-work', label: 'Scheduled work' },
  { id: 'artifact', label: 'Artifact' },
];

export const AGENTS_BASE = '/prototypes/agents';
