import type { WorkflowEdge, WorkflowNode } from './types';
import { AI_DEMO_GRAPH, cloneGraph } from './automationsData';

export type AiScriptTurn = {
  role: 'user' | 'assistant';
  text: string;
  /** When set, replace canvas with this many leading nodes/edges from the demo graph. */
  revealThroughNodeIndex?: number;
};

/** Progressive build for the demo happy path. */
export const AI_SUGGESTED_PROMPTS = [
  "When someone posts 'urgent' in a channel, react with 🚨 and DM the channel members.",
  'Every weekday at 9am, post a standup reminder in the Engineering channel.',
  'When a user joins the Sales team, send them a welcome DM with onboarding links.',
];

export const AI_DEMO_SCRIPT: AiScriptTurn[] = [
  {
    role: 'assistant',
    text: 'Describe what you want to happen. I’ll draft a workflow from available triggers and steps.',
  },
];

export function buildAiProgressionScript(userPrompt: string): AiScriptTurn[] {
  return [
    { role: 'user', text: userPrompt },
    {
      role: 'assistant',
      text: 'Starting with a Message posted trigger…',
      revealThroughNodeIndex: 1,
    },
    {
      role: 'assistant',
      text: 'Adding a Condition that checks whether the message contains “urgent”.',
      revealThroughNodeIndex: 2,
    },
    {
      role: 'assistant',
      text: 'On the true path I’ll add a reaction, then notify channel members via DM. False path stops.',
      revealThroughNodeIndex: 7,
    },
    {
      role: 'assistant',
      text: 'Draft ready. Review the nodes on the canvas, adjust properties in the inspector, then Save.',
      revealThroughNodeIndex: 7,
    },
  ];
}

export function graphSlice(throughNodeIndex: number): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} {
  const full = cloneGraph(AI_DEMO_GRAPH.nodes, AI_DEMO_GRAPH.edges);
  const nodes = full.nodes.slice(0, Math.max(0, throughNodeIndex));
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = full.edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
  );
  return { nodes, edges };
}
