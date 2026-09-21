export type AgentsDocsSceneId =
  | 'channels'
  | 'grounding'
  | 'review'
  | 'approval'
  | 'later-that-week'
  | 'matty-chat'
  | 'all-agents'
  | 'new-agent'
  | 'group-chat';

export const AGENTS_DOCS_SCENES: Array<{ id: AgentsDocsSceneId; label: string }> = [
  { id: 'channels', label: '#docs-site — Trigger & Ask' },
  { id: 'grounding', label: 'Grounding & Informed Rewrite' },
  { id: 'review', label: 'Review & Component Build' },
  { id: 'approval', label: 'Approval & Publish' },
  { id: 'later-that-week', label: 'Later That Week' },
  { id: 'matty-chat', label: 'Matty (floating panel)' },
  { id: 'all-agents', label: 'All agents' },
  { id: 'new-agent', label: 'New agent' },
  { id: 'group-chat', label: 'Group chat' },
];

export const AGENTS_DOCS_BASE = '/prototypes/agents-docs';
