import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type AnchoredPopoverMenuProps = {
  open: boolean;
  onClose: () => void;
  /** Element to position against (typically the ••• button wrapper). */
  anchor: HTMLElement | null;
  /** Horizontal alignment relative to the anchor. Default: end (right). */
  align?: 'start' | 'end';
  children: ReactNode;
};

const MENU_GAP_PX = 4;

/**
 * Renders a popover menu in a portal with fixed positioning so it is not
 * clipped by overflow ancestors. Opens above the anchor when there is not
 * enough room below.
 */
export default function AnchoredPopoverMenu({
  open,
  onClose,
  anchor,
  align = 'end',
  children,
}: AnchoredPopoverMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
  });

  useLayoutEffect(() => {
    if (!open || !anchor) return;

    const update = () => {
      const menu = menuRef.current;
      if (!menu) return;

      const trigger = anchor.getBoundingClientRect();
      const { height, width } = menu.getBoundingClientRect();
      const spaceBelow = window.innerHeight - trigger.bottom;
      const openAbove =
        spaceBelow < height + MENU_GAP_PX &&
        trigger.top > height + MENU_GAP_PX;

      const top = openAbove
        ? trigger.top - MENU_GAP_PX - height
        : trigger.bottom + MENU_GAP_PX;
      const preferredLeft =
        align === 'start' ? trigger.left : trigger.right - width;
      const left = Math.min(
        Math.max(8, preferredLeft),
        window.innerWidth - width - 8,
      );

      setStyle({
        position: 'fixed',
        top,
        left,
        zIndex: 1000,
        transformOrigin: openAbove
          ? align === 'start'
            ? 'bottom left'
            : 'bottom right'
          : align === 'start'
            ? 'top left'
            : 'top right',
      });
    };

    update();
    // Second pass after layout settles (fonts / elevation).
    const raf = requestAnimationFrame(update);

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, anchor, align]);

  useEffect(() => {
    if (!open) return;

    function handle(e: MouseEvent) {
      const target = e.target as Node;
      if (anchor?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      onClose();
    }

    // Defer so the opening click cannot immediately dismiss the menu.
    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', handle);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handle);
    };
  }, [open, onClose, anchor]);

  if (!open || !anchor) return null;

  return createPortal(
    <div ref={menuRef} style={style}>
      {children}
    </div>,
    document.body,
  );
}
