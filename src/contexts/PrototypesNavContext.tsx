import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type PrototypesNavContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const PrototypesNavContext = createContext<PrototypesNavContextValue | null>(
  null,
);

const STORAGE_KEY = 'proto-playground-nav-open';

function readStoredOpen(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === '0') return false;
    if (raw === '1') return true;
  } catch {
    /* ignore */
  }
  return true;
}

export function PrototypesNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(readStoredOpen);

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setOpenState((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, toggle }),
    [open, setOpen, toggle],
  );

  return (
    <PrototypesNavContext.Provider value={value}>
      {children}
    </PrototypesNavContext.Provider>
  );
}

export function usePrototypesNav() {
  const ctx = useContext(PrototypesNavContext);
  if (!ctx) {
    throw new Error('usePrototypesNav must be used within PrototypesNavProvider');
  }
  return ctx;
}
