import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type AgentsProduct = 'channels' | 'agents';

type AgentsContextValue = {
  newAgentOpen: boolean;
  openNewAgent: () => void;
  closeNewAgent: () => void;
};

const AgentsContext = createContext<AgentsContextValue | null>(null);

export function AgentsProvider({ children }: { children: ReactNode }) {
  const [newAgentOpen, setNewAgentOpen] = useState(false);

  const openNewAgent = useCallback(() => setNewAgentOpen(true), []);
  const closeNewAgent = useCallback(() => setNewAgentOpen(false), []);

  const value = useMemo(
    () => ({
      newAgentOpen,
      openNewAgent,
      closeNewAgent,
    }),
    [newAgentOpen, openNewAgent, closeNewAgent],
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
