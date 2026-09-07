import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  buildAgentGroupChat,
  buildCreatedAgent,
  cloneAdvancedConfig,
  DEFAULT_ADVANCED_CONFIG,
  SENTINEL_DEFAULT,
  type AgentAdvancedConfig,
  type AgentColor,
  type AgentGroupChat,
  type AgentShape,
  type AgentVisibility,
  type ConnectedMcp,
  type CreatedAgent,
  type ScheduledJob,
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
  knowledgeChannelIds?: string[];
  knowledgeDocIds?: string[];
  scheduledJobs?: ScheduledJob[];
  connectedMcps?: ConnectedMcp[];
  advancedConfig?: AgentAdvancedConfig;
};

export type AgentUpdates = Partial<NewAgentDraft>;

type AgentsContextValue = {
  newAgentOpen: boolean;
  openNewAgent: () => void;
  closeNewAgent: () => void;
  newGroupChatOpen: boolean;
  openNewGroupChat: () => void;
  closeNewGroupChat: () => void;
  customAgents: CreatedAgent[];
  groupChats: AgentGroupChat[];
  openedAgentIds: string[];
  rememberOpenedAgent: (id: string) => void;
  addCreatedAgent: (draft: NewAgentDraft) => CreatedAgent;
  addGroupChat: (memberIds: string[]) => AgentGroupChat;
  updateAgent: (id: string, updates: AgentUpdates) => CreatedAgent;
  ensureSentinel: () => CreatedAgent;
};

const AgentsContext = createContext<AgentsContextValue | null>(null);

export function AgentsProvider({ children }: { children: ReactNode }) {
  const [newAgentOpen, setNewAgentOpen] = useState(false);
  const [newGroupChatOpen, setNewGroupChatOpen] = useState(false);
  const [customAgents, setCustomAgents] = useState<CreatedAgent[]>([]);
  const [groupChats, setGroupChats] = useState<AgentGroupChat[]>([]);
  const [openedAgentIds, setOpenedAgentIds] = useState<string[]>([]);

  const openNewAgent = useCallback(() => setNewAgentOpen(true), []);
  const closeNewAgent = useCallback(() => setNewAgentOpen(false), []);
  const openNewGroupChat = useCallback(() => setNewGroupChatOpen(true), []);
  const closeNewGroupChat = useCallback(() => setNewGroupChatOpen(false), []);

  const rememberOpenedAgent = useCallback((id: string) => {
    if (!id) return;
    setOpenedAgentIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const addCreatedAgent = useCallback((draft: NewAgentDraft) => {
    const agent = buildCreatedAgent(draft);
    setCustomAgents((prev) => {
      const withoutDup = prev.filter((existing) => existing.id !== agent.id);
      return [...withoutDup, agent];
    });
    return agent;
  }, []);

  const addGroupChat = useCallback(
    (memberIds: string[]) => {
      const chat = buildAgentGroupChat(memberIds, customAgents);
      setGroupChats((prev) => [...prev, chat]);
      setOpenedAgentIds((prev) =>
        prev.includes(chat.id) ? prev : [...prev, chat.id],
      );
      return chat;
    },
    [customAgents],
  );

  const ensureSentinel = useCallback(() => {
    const existing = customAgents.find((agent) => agent.id === 'sentinel');
    if (existing) return existing;
    return addCreatedAgent({
      name: SENTINEL_DEFAULT.name,
      shape: SENTINEL_DEFAULT.shape,
      color: SENTINEL_DEFAULT.color,
      purpose: SENTINEL_DEFAULT.purpose,
      description: SENTINEL_DEFAULT.description,
      model: SENTINEL_DEFAULT.model,
      visibility: SENTINEL_DEFAULT.visibility,
    });
  }, [addCreatedAgent, customAgents]);

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
        knowledgeChannelIds: [],
        knowledgeDocIds: [],
        scheduledJobs: [],
        connectedMcps: [],
        advancedConfig: cloneAdvancedConfig(DEFAULT_ADVANCED_CONFIG),
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
        knowledgeChannelIds:
          updates.knowledgeChannelIds ?? base.knowledgeChannelIds,
        knowledgeDocIds: updates.knowledgeDocIds ?? base.knowledgeDocIds,
        scheduledJobs: updates.scheduledJobs ?? base.scheduledJobs,
        connectedMcps: updates.connectedMcps ?? base.connectedMcps,
        advancedConfig: updates.advancedConfig ?? base.advancedConfig,
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
      newGroupChatOpen,
      openNewGroupChat,
      closeNewGroupChat,
      customAgents,
      groupChats,
      openedAgentIds,
      rememberOpenedAgent,
      addCreatedAgent,
      addGroupChat,
      updateAgent,
      ensureSentinel,
    }),
    [
      newAgentOpen,
      openNewAgent,
      closeNewAgent,
      newGroupChatOpen,
      openNewGroupChat,
      closeNewGroupChat,
      customAgents,
      groupChats,
      openedAgentIds,
      rememberOpenedAgent,
      addCreatedAgent,
      addGroupChat,
      updateAgent,
      ensureSentinel,
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
