import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AUTOMATION_FOLDERS,
  createBlankAutomation,
  createFromTemplate,
  DEFAULT_AUTOMATION_FOLDER_ID,
  INITIAL_AUTOMATIONS,
  INITIAL_HISTORY,
  INITIAL_RUNS,
  INITIAL_SYSTEM_VARIABLES,
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
  AutomationFolder,
  AutomationRun,
  AutomationScope,
  AutomationStatus,
  ChangeRevision,
  FolderAdmin,
  FolderScope,
  FolderVariable,
  Template,
  WorkflowEdge,
  WorkflowNode,
} from '../data/types';

type ToastState = { message: string; type: 'Success' | 'Info' | 'Danger' } | null;

type AutomationsContextValue = {
  automations: Automation[];
  folders: AutomationFolder[];
  systemVariables: FolderVariable[];
  runs: AutomationRun[];
  history: ChangeRevision[];
  templates: Template[];
  favoriteIds: string[];
  recentIds: string[];
  toast: ToastState;
  dismissToast: () => void;
  showToast: (
    message: string,
    type?: ToastState extends null ? never : NonNullable<ToastState>['type'],
  ) => void;
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
  createFolder: (input: { name: string; scope: FolderScope }) => string;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  addFolderAdmin: (folderId: string, username: string) => boolean;
  removeFolderAdmin: (folderId: string, userId: string) => void;
  addFolderVariable: (
    folderId: string,
    input: { kind: FolderVariable['kind']; name: string; value: string },
  ) => boolean;
  removeFolderVariable: (folderId: string, name: string) => void;
  addSystemVariable: (input: {
    kind: FolderVariable['kind'];
    name: string;
    value: string;
  }) => boolean;
  removeSystemVariable: (name: string) => void;
  scopes: AutomationScope[];
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  /** Prototype chrome: force Home / nav / metrics into the empty state. */
  demoEmpty: boolean;
  setDemoEmpty: (empty: boolean) => void;
  /** Bumps when the floating assistant writes a graph so the editor can sync. */
  aiCanvasEpoch: number;
  applyAiGraph: (id: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
};

const AutomationsContext = createContext<AutomationsContextValue | null>(null);

function mergeFavorites(automations: Automation[], favoriteIds: string[]): Automation[] {
  const set = new Set(favoriteIds);
  return automations.map((a) => ({ ...a, favorite: set.has(a.id) }));
}

const DEMO_ADMIN_BY_USERNAME: Record<string, FolderAdmin> = {
  danielle: {
    userId: 'u-danielle',
    username: 'danielle',
    displayName: 'Danielle Okoro',
    avatarSrc: avatarDanielle,
  },
  ethan: {
    userId: 'u-ethan',
    username: 'ethan',
    displayName: 'Ethan Brooks',
    avatarSrc: avatarEthan,
  },
  sofia: {
    userId: 'u-sofia',
    username: 'sofia',
    displayName: 'Sofia Bauer',
    avatarSrc: avatarSofia,
  },
  emma: {
    userId: 'u-emma',
    username: 'emma',
    displayName: 'Emma Novak',
    avatarSrc: avatarEmma,
  },
  arjun: {
    userId: 'u-arjun',
    username: 'arjun',
    displayName: 'Arjun Patel',
    avatarSrc: avatarArjun,
  },
  marco: {
    userId: 'u-marco',
    username: 'marco',
    displayName: 'Marco Rinaldi',
    avatarSrc: avatarMarco,
  },
};

/** Directory used by the Folders “Add admin” picker. */
export const FOLDER_ADMIN_DIRECTORY: FolderAdmin[] = Object.values(
  DEMO_ADMIN_BY_USERNAME,
);

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
  const [folders, setFolders] = useState<AutomationFolder[]>(() =>
    AUTOMATION_FOLDERS.map((f) => ({
      ...f,
      admins: [...f.admins],
      variables: [...f.variables],
    })),
  );
  const [systemVariables, setSystemVariables] = useState<FolderVariable[]>(() =>
    INITIAL_SYSTEM_VARIABLES.map((v) => ({ ...v })),
  );
  const [runs] = useState(INITIAL_RUNS);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [recentIds, setRecentIds] = useState(() => loadRecentIds());
  const [toast, setToast] = useState<ToastState>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [demoEmpty, setDemoEmpty] = useState(false);
  const [aiCanvasEpoch, setAiCanvasEpoch] = useState(0);

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

  const applyAiGraph = useCallback(
    (id: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
      setAutomations((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                nodes,
                edges,
                lastEditedAt: new Date().toISOString(),
                lastEditedBy: '@dev',
              }
            : a,
        ),
      );
      setAiCanvasEpoch((n) => n + 1);
    },
    [],
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

  const createFolder = useCallback((input: { name: string; scope: FolderScope }) => {
    const id = `folder-${Date.now()}`;
    const folder: AutomationFolder = {
      id,
      name: input.name.trim(),
      scope: input.scope,
      createdAt: new Date().toISOString(),
      admins: [],
      variables: [],
    };
    setFolders((prev) => [...prev, folder]);
    return id;
  }, []);

  const renameFolder = useCallback((id: string, name: string) => {
    const next = name.trim();
    if (!next) return;
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name: next } : f)));
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders((prev) => {
      const remaining = prev.filter((f) => f.id !== id);
      const fallbackId =
        remaining.find((f) => f.id === DEFAULT_AUTOMATION_FOLDER_ID)?.id ??
        remaining[0]?.id ??
        '';
      setAutomations((autos) =>
        autos.map((a) =>
          a.folderId === id
            ? {
                ...a,
                folderId: fallbackId,
                lastEditedAt: new Date().toISOString(),
              }
            : a,
        ),
      );
      return remaining;
    });
  }, []);

  const addFolderAdmin = useCallback((folderId: string, username: string) => {
    const handle = username.trim().replace(/^@/, '').toLowerCase();
    if (!handle) return false;

    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return false;
    if (folder.admins.some((a) => a.username.toLowerCase() === handle)) {
      return true;
    }

    const known = DEMO_ADMIN_BY_USERNAME[handle];
    const admin: FolderAdmin = known ?? {
      userId: `u-${handle}`,
      username: handle,
      displayName: handle,
    };

    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, admins: [...f.admins, admin] } : f,
      ),
    );
    return true;
  }, [folders]);

  const removeFolderAdmin = useCallback((folderId: string, userId: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? { ...f, admins: f.admins.filter((a) => a.userId !== userId) }
          : f,
      ),
    );
  }, []);

  const addFolderVariable = useCallback(
    (
      folderId: string,
      input: { kind: FolderVariable['kind']; name: string; value: string },
    ) => {
      const name = input.name.trim().toUpperCase().replace(/\s+/g, '_');
      if (!name) return false;
      if (input.kind === 'secret' && !input.value.trim()) return false;

      setFolders((prev) =>
        prev.map((f) => {
          if (f.id !== folderId) return f;
          const without = f.variables.filter((v) => v.name !== name);
          const next: FolderVariable =
            input.kind === 'secret'
              ? { kind: 'secret', name, updatedAt: new Date().toISOString() }
              : {
                  kind: 'var',
                  name,
                  value: input.value,
                  updatedAt: new Date().toISOString(),
                };
          return { ...f, variables: [...without, next] };
        }),
      );
      return true;
    },
    [],
  );

  const removeFolderVariable = useCallback((folderId: string, name: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? { ...f, variables: f.variables.filter((v) => v.name !== name) }
          : f,
      ),
    );
  }, []);

  const addSystemVariable = useCallback(
    (input: { kind: FolderVariable['kind']; name: string; value: string }) => {
      const name = input.name.trim().toUpperCase().replace(/\s+/g, '_');
      if (!name) return false;
      if (input.kind === 'secret' && !input.value.trim()) return false;

      setSystemVariables((prev) => {
        const without = prev.filter((v) => v.name !== name);
        const next: FolderVariable =
          input.kind === 'secret'
            ? { kind: 'secret', name, updatedAt: new Date().toISOString() }
            : {
                kind: 'var',
                name,
                value: input.value,
                updatedAt: new Date().toISOString(),
              };
        return [...without, next];
      });
      return true;
    },
    [],
  );

  const removeSystemVariable = useCallback((name: string) => {
    setSystemVariables((prev) => prev.filter((v) => v.name !== name));
  }, []);

  const value = useMemo<AutomationsContextValue>(
    () => ({
      automations,
      folders,
      systemVariables,
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
      createFolder,
      renameFolder,
      deleteFolder,
      addFolderAdmin,
      removeFolderAdmin,
      addFolderVariable,
      removeFolderVariable,
      addSystemVariable,
      removeSystemVariable,
      scopes: ['global', 'team', 'channel'],
      assistantOpen,
      setAssistantOpen,
      demoEmpty,
      setDemoEmpty,
      aiCanvasEpoch,
      applyAiGraph,
    }),
    [
      automations,
      folders,
      systemVariables,
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
      createFolder,
      renameFolder,
      deleteFolder,
      addFolderAdmin,
      removeFolderAdmin,
      addFolderVariable,
      removeFolderVariable,
      addSystemVariable,
      removeSystemVariable,
      assistantOpen,
      demoEmpty,
      aiCanvasEpoch,
      applyAiGraph,
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
