import type { Edge, Node } from '@xyflow/react';

export type AutomationStatus = 'draft' | 'enabled' | 'disabled';
export type AutomationScope = 'global' | 'team' | 'channel';
export type RunStatus = 'success' | 'failed' | 'running';

export type StepKind = 'trigger' | 'action' | 'flow';
export type ActionVerb = 'get' | 'create' | 'update' | 'delete';

export type WorkflowNodeData = {
  label: string;
  kind: StepKind;
  stepType: string;
  verb?: ActionVerb;
  helpText?: string;
  fields?: Record<string, string>;
};

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export type Automation = {
  id: string;
  name: string;
  status: AutomationStatus;
  scope: AutomationScope;
  tags: string[];
  /** Bot account that performs actions for this automation. */
  botId: string;
  /** Folder (table group) this automation belongs to on Home. */
  folderId: string;
  creator: string;
  lastEditedBy: string;
  lastEditedAt: string;
  lastRunAt: string | null;
  lastRunStatus: RunStatus | null;
  favorite: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type AutomationFolder = {
  id: string;
  name: string;
  description?: string;
};

export type Template = {
  id: string;
  category: string;
  name: string;
  description: string;
  accent: string;
  tags: string[];
  scope: AutomationScope;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type RunStep = {
  id: string;
  label: string;
  status: RunStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
};

export type AutomationRun = {
  id: string;
  automationId: string;
  status: RunStatus;
  startedAt: string;
  durationMs: number;
  triggerPayload: Record<string, unknown>;
  steps: RunStep[];
};

export type ChangeRevision = {
  id: string;
  automationId: string;
  revision: number;
  change: string;
  by: string;
  when: string;
};

export type PaletteItem = {
  id: string;
  label: string;
  kind: StepKind;
  stepType: string;
  verb?: ActionVerb;
  helpText?: string;
  disabled?: boolean;
};
