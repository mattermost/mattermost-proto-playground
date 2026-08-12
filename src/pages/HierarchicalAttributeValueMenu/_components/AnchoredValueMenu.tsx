import { useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useFixedMenuPosition } from '@/hooks/useFixedMenuPosition';
import { usePopoverDismiss } from '@/hooks/usePopoverDismiss';
import styles from './AnchoredValueMenu.module.scss';

export interface AnchoredValueMenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  /** `end` pins the menu's right edge to the anchor's — used in the narrow sidebar. */
  align?: 'start' | 'end';
  children: ReactNode;
}

/**
 * Anchors the menu to its field control, like a dropdown.
 *
 * Placement is deliberately a separate concern from the menu itself: the menu
 * renders in a document-level portal with fixed coordinates so neither the
 * modal, the console scroll container, nor the sidebar's overflow can clip it.
 * `useFixedMenuPosition` supplies the vertical flip; the menu keeps its own
 * width rather than stretching to the anchor, because a dropdown of values wants
 * ~300px whatever the field happens to measure.
 */
export default function AnchoredValueMenu({
  open,
  onClose,
  anchorRef,
  align = 'start',
  children,
}: AnchoredValueMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const position = useFixedMenuPosition(open, anchorRef, {
    gap: 4,
    align,
    menuRef,
  });

  usePopoverDismiss(open, onClose, [anchorRef, menuRef]);

  if (!open || position == null) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={styles['anchored-value-menu']}
      style={
        position.left != null
          ? { top: position.top, left: position.left }
          : { top: position.top, right: position.right }
      }
    >
      {children}
    </div>,
    document.body,
  );
}
