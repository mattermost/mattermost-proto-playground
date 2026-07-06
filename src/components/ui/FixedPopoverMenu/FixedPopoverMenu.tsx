import { useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useFixedMenuPosition } from '@/hooks/useFixedMenuPosition';
import { usePopoverDismiss } from '@/hooks/usePopoverDismiss';
import styles from './FixedPopoverMenu.module.scss';

export type FixedPopoverAlign = 'start' | 'end';

export interface FixedPopoverMenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  align?: FixedPopoverAlign;
  gap?: number;
  className?: string;
  menuRef?: RefObject<HTMLDivElement | null>;
  /** Minimum menu width regardless of anchor size. */
  minWidthFloor?: number;
}

/**
 * Renders menu content in a document-level portal with fixed positioning so
 * overflow-hidden scroll ancestors cannot clip it.
 */
export default function FixedPopoverMenu({
  open,
  onClose,
  anchorRef,
  children,
  align = 'start',
  gap = 4,
  className = '',
  menuRef: menuRefProp,
  minWidthFloor,
}: FixedPopoverMenuProps) {
  const internalMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = menuRefProp ?? internalMenuRef;
  const position = useFixedMenuPosition(open, anchorRef, { gap, align, minWidthFloor });

  usePopoverDismiss(open, onClose, [anchorRef, menuRef]);

  if (!open || position == null) {
    return null;
  }

  const style: CSSProperties = {
    position: 'fixed',
    top: position.top,
    width: position.minWidth,
    minWidth: position.minWidth,
    ...(position.left != null
      ? { left: position.left }
      : { right: position.right }),
  };

  return createPortal(
    <div
      ref={menuRef}
      className={[styles.menu, className].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </div>,
    document.body,
  );
}
