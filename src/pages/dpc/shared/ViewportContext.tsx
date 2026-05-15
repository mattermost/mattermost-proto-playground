/**
 * DPC ViewportContext — desktop (1280px) / mobile (360px) toggle per intake Q6.
 *
 * The viewport width is applied via a CSS custom property
 * (`--dpc-viewport-width`) on the PrototypeShell root so component styles
 * can opt into a constrained width without prop drilling.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Viewport = 'desktop' | 'mobile';

export const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: '1600px',
  mobile: '360px',
};

interface ViewportContextValue {
  viewport: Viewport;
  widthPx: string;
  setViewport: (v: Viewport) => void;
  toggle: () => void;
}

const ViewportContext = createContext<ViewportContextValue | null>(null);

export interface ViewportProviderProps {
  initialViewport?: Viewport;
  children: ReactNode;
}

export function ViewportProvider({
  initialViewport = 'desktop',
  children,
}: ViewportProviderProps) {
  const [viewport, setViewportState] = useState<Viewport>(initialViewport);

  const setViewport = useCallback((next: Viewport) => {
    setViewportState(next);
  }, []);

  const toggle = useCallback(() => {
    setViewportState((prev) => (prev === 'desktop' ? 'mobile' : 'desktop'));
  }, []);

  const value = useMemo<ViewportContextValue>(
    () => ({
      viewport,
      widthPx: VIEWPORT_WIDTHS[viewport],
      setViewport,
      toggle,
    }),
    [viewport, setViewport, toggle],
  );

  return (
    <ViewportContext.Provider value={value}>
      {children}
    </ViewportContext.Provider>
  );
}

export function useViewport(): ViewportContextValue {
  const ctx = useContext(ViewportContext);
  if (!ctx) {
    throw new Error('useViewport must be used within a ViewportProvider');
  }
  return ctx;
}
