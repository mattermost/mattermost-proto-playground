import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  buildCreatedAgent,
  type AgentColor,
  type AgentShape,
  type AgentVisibility,
  type CreatedAgent,
} from '../agentsData';

export type AgentsProduct = 'channels' | 'agents';

export type NewAgentDraft = {
  name: string;
  shape: AgentShape;
  color: AgentColor;
  purpose: string;
  description?: string;
  model?: string;
  visibility?: AgentVisibility;
  customImageSrc?: string;
};

export type AgentUpdates = Partial<NewAgentDraft>;

type AgentsContextValue = {
  newAgentOpen: boolean;
  openNewAgent: () => void;
  closeNewAgent: () => void;
  customAgents: CreatedAgent[];
  addCreatedAgent: (draft: NewAgentDraft) => CreatedAgent;
  updateAgent: (id: string, updates: AgentUpdates) => CreatedAgent;
};

const AgentsContext = createContext<AgentsContextValue | null>(null);

export function AgentsProvider({ children }: { children: ReactNode }) {
  const [newAgentOpen, setNewAgentOpen] = useState(false);
  const [customAgents, setCustomAgents] = useState<CreatedAgent[]>([]);

  const openNewAgent = useCallback(() => setNewAgentOpen(true), []);
  const closeNewAgent = useCallback(() => setNewAgentOpen(false), []);

  const addCreatedAgent = useCallback((draft: NewAgentDraft) => {
    const agent = buildCreatedAgent(draft);
    setCustomAgents((prev) => {
      const withoutDup = prev.filter((existing) => existing.id !== agent.id);
      return [...withoutDup, agent];
    });
    return agent;
  }, []);

  const updateAgent = useCallback(
    (id: string, updates: AgentUpdates) => {
      const existing = customAgents.find((agent) => agent.id === id);
      const base: CreatedAgent = existing ?? {
        id,
        name: updates.name?.trim() || id,
        shape: updates.shape ?? 'sphere',
        color: updates.color ?? 'blue',
        description: '',
        purpose: '',
        model: updates.model ?? 'claude-3-7-sonnet',
        visibility: updates.visibility ?? 'private',
      };
      const next = buildCreatedAgent({
        id,
        name: updates.name ?? base.name,
        shape: updates.shape ?? base.shape,
        color: updates.color ?? base.color,
        purpose: updates.purpose ?? base.purpose,
        description:
          updates.description !== undefined
            ? updates.description
            : base.description,
        model: updates.model ?? base.model,
        visibility: updates.visibility ?? base.visibility,
        customImageSrc:
          updates.customImageSrc !== undefined
            ? updates.customImageSrc
            : base.customImageSrc,
      });
      setCustomAgents((prev) => {
        const without = prev.filter((agent) => agent.id !== id);
        return [...without, next];
      });
      return next;
    },
    [customAgents],
  );

  const value = useMemo(
    () => ({
      newAgentOpen,
      openNewAgent,
      closeNewAgent,
      customAgents,
      addCreatedAgent,
      updateAgent,
    }),
    [
      newAgentOpen,
      openNewAgent,
      closeNewAgent,
      customAgents,
      addCreatedAgent,
      updateAgent,
    ],
  );

  return (
    <AgentsContext.Provider value={value}>{children}</AgentsContext.Provider>
  );
}

export function useAgents() {
  const ctx = useContext(AgentsContext);
  if (!ctx) {
    throw new Error('useAgents must be used within AgentsProvider');
  }
  return ctx;
}
