import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createBlankAutomation,
  createFromTemplate,
  INITIAL_AUTOMATIONS,
  INITIAL_HISTORY,
  INITIAL_RUNS,
  TEMPLATES,
} from '../data/automationsData';
import {
  loadFavoriteIds,
  loadRecentIds,
  pushRecentId,
  saveFavoriteIds,
} from '../data/storage';
import type {
  Automation,
  AutomationRun,
  AutomationScope,
  AutomationStatus,
  ChangeRevision,
  Template,
  WorkflowEdge,
  WorkflowNode,
} from '../data/types';

type ToastState = { message: string; type: 'Success' | 'Info' | 'Danger' } | null;

type AutomationsContextValue = {
  automations: Automation[];
  runs: AutomationRun[];
  history: ChangeRevision[];
  templates: Template[];
  favoriteIds: string[];
  recentIds: string[];
  toast: ToastState;
  dismissToast: () => void;
  showToast: (message: string, type?: ToastState extends null ? never : NonNullable<ToastState>['type']) => void;
  getAutomation: (id: string) => Automation | undefined;
  updateAutomation: (id: string, patch: Partial<Automation>) => void;
  setAutomationGraph: (id: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  toggleFavorite: (id: string) => void;
  recordRecent: (id: string) => void;
  setStatus: (id: string, status: AutomationStatus) => void;
  createBlank: () => string;
  createFromTemplateId: (templateId: string) => string | null;
  createAiDraft: () => string;
  appendHistory: (automationId: string, change: string) => void;
  getRunsFor: (automationId: string) => AutomationRun[];
  getRun: (runId: string) => AutomationRun | undefined;
  getHistoryFor: (automationId: string) => ChangeRevision[];
  scopes: AutomationScope[];
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
};

const AutomationsContext = createContext<AutomationsContextValue | null>(null);

function mergeFavorites(automations: Automation[], favoriteIds: string[]): Automation[] {
  const set = new Set(favoriteIds);
  return automations.map((a) => ({ ...a, favorite: set.has(a.id) }));
}

export function AutomationsProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    const stored = loadFavoriteIds();
    if (stored.length > 0) return stored;
    const defaults = INITIAL_AUTOMATIONS.filter((a) => a.favorite).map((a) => a.id);
    saveFavoriteIds(defaults);
    return defaults;
  });
  const [automations, setAutomations] = useState<Automation[]>(() => {
    const stored = loadFavoriteIds();
    const favs =
      stored.length > 0
        ? stored
        : INITIAL_AUTOMATIONS.filter((a) => a.favorite).map((a) => a.id);
    return mergeFavorites(INITIAL_AUTOMATIONS, favs);
  });
  const [runs] = useState(INITIAL_RUNS);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [recentIds, setRecentIds] = useState(() => loadRecentIds());
  const [toast, setToast] = useState<ToastState>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const showToast = useCallback(
    (message: string, type: NonNullable<ToastState>['type'] = 'Info') => {
      setToast({ message, type });
      window.setTimeout(() => setToast(null), 3200);
    },
    [],
  );

  const dismissToast = useCallback(() => setToast(null), []);

  const getAutomation = useCallback(
    (id: string) => automations.find((a) => a.id === id),
    [automations],
  );

  const updateAutomation = useCallback((id: string, patch: Partial<Automation>) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              ...patch,
              lastEditedAt: patch.lastEditedAt ?? new Date().toISOString(),
              lastEditedBy: patch.lastEditedBy ?? '@dev',
            }
          : a,
      ),
    );
  }, []);

  const setAutomationGraph = useCallback(
    (id: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
      updateAutomation(id, { nodes, edges });
    },
    [updateAutomation],
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveFavoriteIds(next);
      setAutomations((autos) => mergeFavorites(autos, next));
      return next;
    });
  }, []);

  const recordRecent = useCallback((id: string) => {
    setRecentIds((prev) => pushRecentId(id, prev));
  }, []);

  const setStatus = useCallback(
    (id: string, status: AutomationStatus) => {
      updateAutomation(id, { status });
    },
    [updateAutomation],
  );

  const appendHistory = useCallback((automationId: string, change: string) => {
    setHistory((prev) => {
      const existing = prev.filter((h) => h.automationId === automationId);
      const revision = (existing[0]?.revision ?? 0) + 1;
      const entry: ChangeRevision = {
        id: `rev-${automationId}-${revision}-${Date.now()}`,
        automationId,
        revision,
        change,
        by: '@dev',
        when: new Date().toISOString(),
      };
      return [entry, ...prev];
    });
  }, []);

  const createBlank = useCallback(() => {
    const id = `auto-${Date.now()}`;
    const automation = createBlankAutomation(id);
    setAutomations((prev) => [automation, ...prev]);
    appendHistory(id, 'Created');
    setRecentIds((prev) => pushRecentId(id, prev));
    return id;
  }, [appendHistory]);

  const createFromTemplateId = useCallback(
    (templateId: string) => {
      const template = TEMPLATES.find((t) => t.id === templateId);
      if (!template) return null;
      const id = `auto-${Date.now()}`;
      const automation = createFromTemplate(template, id);
      setAutomations((prev) => [automation, ...prev]);
      appendHistory(id, 'Created from template');
      setRecentIds((prev) => pushRecentId(id, prev));
      return id;
    },
    [appendHistory],
  );

  const createAiDraft = useCallback(() => {
    const id = `auto-ai-${Date.now()}`;
    const automation = createBlankAutomation(id);
    automation.name = 'AI draft automation';
    setAutomations((prev) => [automation, ...prev]);
    appendHistory(id, 'Created with AI');
    setRecentIds((prev) => pushRecentId(id, prev));
    return id;
  }, [appendHistory]);

  const getRunsFor = useCallback(
    (automationId: string) =>
      runs
        .filter((r) => r.automationId === automationId)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [runs],
  );

  const getRun = useCallback((runId: string) => runs.find((r) => r.id === runId), [runs]);

  const getHistoryFor = useCallback(
    (automationId: string) =>
      history
        .filter((h) => h.automationId === automationId)
        .sort((a, b) => b.revision - a.revision),
    [history],
  );

  const value = useMemo<AutomationsContextValue>(
    () => ({
      automations,
      runs,
      history,
      templates: TEMPLATES,
      favoriteIds,
      recentIds,
      toast,
      dismissToast,
      showToast,
      getAutomation,
      updateAutomation,
      setAutomationGraph,
      toggleFavorite,
      recordRecent,
      setStatus,
      createBlank,
      createFromTemplateId,
      createAiDraft,
      appendHistory,
      getRunsFor,
      getRun,
      getHistoryFor,
      scopes: ['global', 'team', 'channel'],
      assistantOpen,
      setAssistantOpen,
    }),
    [
      automations,
      runs,
      history,
      favoriteIds,
      recentIds,
      toast,
      dismissToast,
      showToast,
      getAutomation,
      updateAutomation,
      setAutomationGraph,
      toggleFavorite,
      recordRecent,
      setStatus,
      createBlank,
      createFromTemplateId,
      createAiDraft,
      appendHistory,
      getRunsFor,
      getRun,
      getHistoryFor,
      assistantOpen,
    ],
  );

  return (
    <AutomationsContext.Provider value={value}>{children}</AutomationsContext.Provider>
  );
}

/* eslint-disable react-refresh/only-export-components -- provider + hook pair */
export function useAutomations() {
  const ctx = useContext(AutomationsContext);
  if (!ctx) {
    throw new Error('useAutomations must be used within AutomationsProvider');
  }
  return ctx;
}
