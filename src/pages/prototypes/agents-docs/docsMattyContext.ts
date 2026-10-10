import type { MattyContextChip } from '../agents/components/mattyContext';
import { DOCS_CHANNEL_MESSAGES, DOCS_HISTORY_ENTRIES, DOCS_THREADS } from './agentsDocsData';

export const DOCS_SITE_CONTEXT: MattyContextChip = {
  id: 'channel:docs-site',
  kind: 'channel',
  label: 'docs-site',
};

export const DOCS_INCIDENT_CONTEXT: MattyContextChip = {
  id: 'channel:INC-4472',
  kind: 'channel',
  label: 'INC-4472',
};

const MAX_LABEL = 32;

function findRootPost(postId: string) {
  const entry =
    DOCS_CHANNEL_MESSAGES.find((message) => message.id === postId) ??
    DOCS_HISTORY_ENTRIES.find((item) => item.id === postId);
  return entry && 'body' in entry ? entry : null;
}

export function docsThreadContext(postId: string): MattyContextChip | null {
  const root = findRootPost(postId);
  if (!root) return null;
  const text = root.body.replace(/\s+/g, ' ').trim();
  const snippet = text.length > MAX_LABEL ? `${text.slice(0, MAX_LABEL).trimEnd()}…` : text;
  return { id: `thread:${postId}`, kind: 'thread', label: `${root.username}: ${snippet}` };
}

export const DOCS_CONTEXT_OPTIONS: MattyContextChip[] = [
  DOCS_SITE_CONTEXT,
  DOCS_INCIDENT_CONTEXT,
  ...Object.keys(DOCS_THREADS).flatMap((postId) => docsThreadContext(postId) ?? []),
];
