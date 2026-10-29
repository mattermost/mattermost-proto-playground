import {
  createContext,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

type PrototypeChromeContextValue = {
  setCenterSlot: Dispatch<SetStateAction<ReactNode>>;
  setStartSlot: Dispatch<SetStateAction<ReactNode>>;
};

const PrototypeChromeContext = createContext<PrototypeChromeContextValue | null>(
  null,
);

export function PrototypeChromeProvider({
  children,
  setCenterSlot,
  setStartSlot,
}: {
  children: React.ReactNode;
  setCenterSlot: Dispatch<SetStateAction<ReactNode>>;
  setStartSlot: Dispatch<SetStateAction<ReactNode>>;
}) {
  const value = useMemo(() => ({ setCenterSlot, setStartSlot }), [setCenterSlot, setStartSlot]);

  return (
    <PrototypeChromeContext.Provider value={value}>
      {children}
    </PrototypeChromeContext.Provider>
  );
}

export function usePrototypeChrome() {
  const ctx = useContext(PrototypeChromeContext);
  if (!ctx) {
    throw new Error('usePrototypeChrome must be used within PrototypeChromeProvider');
  }
  return ctx;
}
