import type { ReactNode } from 'react';
import styles from './StackedModalLayer.module.scss';

export interface StackedModalLayerProps {
  /** Sub-modal content rendered above the base EM modal. */
  children: ReactNode;
}

/**
 * Fixed-positioned overlay (gap G6) that renders above the EM modal's
 * own overlay. Used to stack Add/Edit Configuration sub-modals on top
 * of the Configurations tab. Higher z-index than `EMModalShell`.
 */
export default function StackedModalLayer({
  children,
}: StackedModalLayerProps) {
  return (
    <div className={styles['stacked-modal-layer']}>
      <div className={styles['stacked-modal-layer__dialog']}>{children}</div>
    </div>
  );
}
