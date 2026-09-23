export type AgentsDocsSceneId =
  | 'channels'
  | 'grounding'
  | 'review'
  | 'approval'
  | 'later-that-week'
  | 'docs-outage'
  | 'matty-chat'
  | 'all-agents'
  | 'all-agents-list'
  | 'new-agent'
  | 'group-chat'
  | 'dm';

export const AGENTS_DOCS_SCENES: Array<{ id: AgentsDocsSceneId; label: string }> = [
  { id: 'channels', label: 'Docs Site Channel — Trigger & Ask' },
  { id: 'grounding', label: 'Grounding & Informed Rewrite' },
  { id: 'review', label: 'Review & Component Build' },
  { id: 'approval', label: 'Approval & Publish' },
  { id: 'later-that-week', label: 'Later That Week' },
  { id: 'docs-outage', label: 'Docs Site Outage' },
  { id: 'matty-chat', label: 'Matty DM' },
  { id: 'all-agents', label: 'All agents — FTE' },
  { id: 'all-agents-list', label: 'All agents — list' },
  { id: 'new-agent', label: 'New agent' },
  { id: 'group-chat', label: 'Group chat' },
];

export const AGENTS_DOCS_BASE = '/prototypes/agents-docs';
