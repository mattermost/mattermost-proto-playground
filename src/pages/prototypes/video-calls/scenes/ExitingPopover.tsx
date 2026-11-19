import type { ReactNode } from 'react';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import styles from './ExitingPopover.module.scss';

const EXIT_MS = 150;

export interface ExitingPopoverProps {
  open: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Keeps a popover's content mounted through its exit animation (the shared
 * `useExitAnimation` pattern the other call prototypes use). For content that
 * has no enter/exit motion of its own, e.g. the participants list and the
 * call info panel.
 */
export default function ExitingPopover({
  open,
  children,
  className,
}: ExitingPopoverProps) {
  const { rendered, exiting } = useExitAnimation(open, EXIT_MS);
  if (!rendered) return null;
  return (
    <div
      className={[
        styles['exiting-popover'],
        exiting && styles['exiting-popover--exiting'],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
