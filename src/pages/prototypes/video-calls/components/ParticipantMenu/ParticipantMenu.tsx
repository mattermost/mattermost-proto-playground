import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import styles from './ParticipantMenu.module.scss';

export interface ParticipantMenuItem {
  id: string;
  label: string;
  destructive?: boolean;
  disabled?: boolean;
}

/** Viewport point (pointer) or rect (trigger button) the menu is placed against. */
export interface ParticipantMenuAnchor {
  x: number;
  y: number;
  /** Anchor size; 0 for a pointer position. */
  width?: number;
  height?: number;
}

export interface ParticipantMenuProps {
  items: ParticipantMenuItem[];
  anchor: ParticipantMenuAnchor;
  /** Accessible name of the menu. */
  label?: string;
  /** Called with the chosen item id; the menu then closes itself. */
  onSelect: (id: string) => void;
  /** Called once the close motion finished and the menu should unmount. */
  onClose: () => void;
  /** Element that opened the menu: pointerdown on it is not an "outside" click. */
  triggerEl?: HTMLElement | null;
  /** Move focus into the menu on open (keyboard / button). */
  focusOnOpen?: boolean;
}

const VIEWPORT_PAD = 8;

/**
 * Context menu for a participant. Visual chrome is Compass `PopoverMenu` +
 * `MenuItem`; this wrapper owns the portal, fixed positioning (flip + clamp to
 * the viewport) and dismissal (outside pointerdown, Escape, scroll, resize).
 */
export function ParticipantMenu({
  items,
  anchor,
  label = 'Participant actions',
  onSelect,
  onClose,
  triggerEl,
  focusOnOpen = false,
}: ParticipantMenuProps) {
  const [open, setOpen] = useState(true);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Measure before paint, then flip / clamp inside the viewport.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const { offsetWidth: w, offsetHeight: h } = el;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const aw = anchor.width ?? 0;
    const ah = anchor.height ?? 0;

    let left = anchor.x;
    if (left + w > vw - VIEWPORT_PAD) left = anchor.x + aw - w;
    left = Math.max(VIEWPORT_PAD, Math.min(left, vw - w - VIEWPORT_PAD));

    let top = anchor.y + ah;
    if (top + h > vh - VIEWPORT_PAD) top = anchor.y - h;
    top = Math.max(VIEWPORT_PAD, Math.min(top, vh - h - VIEWPORT_PAD));
    setPos({ left, top });
  }, [anchor.x, anchor.y, anchor.width, anchor.height]);

  useEffect(() => {
    const inside = (t: EventTarget | null) =>
      t instanceof Node && !!rootRef.current?.contains(t);
    const onPointerDown = (e: PointerEvent) => {
      if (inside(e.target)) return;
      if (triggerEl && e.target instanceof Node && triggerEl.contains(e.target))
        return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
        triggerEl?.focus();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const rows = Array.from(
          rootRef.current?.querySelectorAll<HTMLButtonElement>(
            'button:not(:disabled)',
          ) ?? [],
        );
        if (!rows.length) return;
        e.preventDefault();
        const i = rows.indexOf(document.activeElement as HTMLButtonElement);
        const step = e.key === 'ArrowDown' ? 1 : -1;
        rows[(i + step + rows.length) % rows.length].focus();
      }
    };
    const onScroll = (e: Event) => {
      if (!inside(e.target)) close();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', close);
    };
  }, [close, triggerEl]);

  useEffect(() => {
    if (!focusOnOpen || !pos) return;
    rootRef.current
      ?.querySelector<HTMLButtonElement>('button:not(:disabled)')
      ?.focus();
    // Focus once, when first positioned.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos === null]);

  return createPortal(
    <div
      ref={rootRef}
      className={styles['participant-menu']}
      style={{
        left: pos?.left ?? anchor.x,
        top: pos?.top ?? anchor.y,
        visibility: pos ? 'visible' : 'hidden',
      }}
      // Portal events bubble through the React tree to the tile: keep them here.
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <PopoverMenu
        open={open}
        onExited={onClose}
        role="menu"
        aria-label={label}
      >
        {items.map((item) => (
          <MenuItem
            key={item.id}
            role="menuitem"
            label={item.label}
            leadingElement={false}
            destructive={item.destructive}
            disabled={item.disabled}
            onClick={() => {
              onSelect(item.id);
              close();
            }}
          />
        ))}
      </PopoverMenu>
    </div>,
    document.body,
  );
}
