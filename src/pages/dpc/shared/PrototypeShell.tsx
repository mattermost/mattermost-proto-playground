/**
 * DPC PrototypeShell — the wrapper every DPC approach prototype renders.
 *
 * Provides the PersonaContext and ViewportContext, renders the
 * ScenarioHeader, and constrains the prototype canvas to the chosen
 * viewport width (1280px desktop / 360px mobile per intake Q6).
 *
 * Stage 2 agents render their approach content as `children` and pass
 * any approach-specific control (e.g. A1's ABAC policy picker) via
 * `trailingControl`.
 */
import { type CSSProperties, type ReactNode } from 'react';
import { PersonaProvider, type PersonaProviderProps } from './PersonaContext';
import { ViewportProvider } from './ViewportContext';
import { useViewport } from './ViewportContext';
import ScenarioHeader from './ScenarioHeader';
import styles from './PrototypeShell.module.scss';

export interface PrototypeShellProps {
  /** Prototype display label, e.g. "DPC — A1: Confirm-and-Commit". */
  label: string;
  /** Optional starting persona; defaults to channel-admin. */
  initialPersona?: PersonaProviderProps['initialPersona'];
  /** Optional approach-specific header control (e.g. A1 policy picker). */
  trailingControl?: ReactNode;
  /** Prototype body. */
  children: ReactNode;
}

interface ShellFrameProps {
  label: string;
  trailingControl?: ReactNode;
  children: ReactNode;
}

function ShellFrame({ label, trailingControl, children }: ShellFrameProps) {
  const { widthPx, viewport } = useViewport();

  const frameStyle: CSSProperties = {
    ['--dpc-viewport-width' as string]: widthPx,
  };

  return (
    <div className={styles['dpc-shell']}>
      <ScenarioHeader label={label} trailingControl={trailingControl} />
      <div className={styles['dpc-shell__viewport']} style={frameStyle}>
        <div
          className={`${styles['dpc-shell__canvas']} ${
            styles[`dpc-shell__canvas--${viewport}`]
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function PrototypeShell({
  label,
  initialPersona = 'channel-admin',
  trailingControl,
  children,
}: PrototypeShellProps) {
  return (
    <PersonaProvider initialPersona={initialPersona}>
      <ViewportProvider>
        <ShellFrame label={label} trailingControl={trailingControl}>
          {children}
        </ShellFrame>
      </ViewportProvider>
    </PersonaProvider>
  );
}
