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
  type CreatedAgent,
} from '../agentsData';

export type AgentsProduct = 'channels' | 'agents';

export type NewAgentDraft = {
  name: string;
  shape: AgentShape;
  color: AgentColor;
  purpose: string;
};

type AgentsContextValue = {
  newAgentOpen: boolean;
  openNewAgent: () => void;
  closeNewAgent: () => void;
  customAgents: CreatedAgent[];
  addCreatedAgent: (draft: NewAgentDraft) => CreatedAgent;
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

  const value = useMemo(
    () => ({
      newAgentOpen,
      openNewAgent,
      closeNewAgent,
      customAgents,
      addCreatedAgent,
    }),
    [
      newAgentOpen,
      openNewAgent,
      closeNewAgent,
      customAgents,
      addCreatedAgent,
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
