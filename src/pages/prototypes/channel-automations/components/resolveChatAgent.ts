import {
  agentById,
  defaultOwnedAgent,
  type Agent,
} from '../channelAutomationsData';
import type { EditorKind, FormValues } from './automationFormTypes';

export function resolveChatAgent(
  values: FormValues,
  options: {
    editorKind?: EditorKind;
    contextAgentId?: string;
  } = {},
): Agent {
  const { editorKind = 'assignment', contextAgentId } = options;

  if (editorKind === 'entity') {
    return defaultOwnedAgent();
  }

  const agentId = values.agentId || contextAgentId || defaultOwnedAgent().id;
  return agentById(agentId) ?? defaultOwnedAgent();
}
