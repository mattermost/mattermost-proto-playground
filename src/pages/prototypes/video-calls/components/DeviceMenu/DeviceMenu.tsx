import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
  PopoverMenuTitle,
} from '@mattermost/compass-ui/components/popover-menu';
import styles from './DeviceMenu.module.scss';

export interface DeviceMenuDevice {
  id: string;
  label: string;
}

export interface DeviceMenuSection {
  id: string;
  /** Group heading, e.g. "Microphone" / "Speakers". */
  title: string;
  devices: DeviceMenuDevice[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export interface DeviceMenuLabels {
  /** Shown when a list has no devices. */
  empty?: string;
}

export interface DeviceMenuProps {
  /** Host-owned visibility. The surface animates in/out and unmounts itself after the exit. */
  open: boolean;
  /** Menu title; also its accessible name. */
  title: string;
  /** Single device list (ignored when `sections` is given). */
  devices?: DeviceMenuDevice[];
  /** Selected device id; falls back to the first device. */
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Grouped lists, e.g. input + output devices. */
  sections?: DeviceMenuSection[];
  /**
   * Called on outside pointerdown or Escape. Pointerdowns inside the nearest
   * `[data-menu-anchor]` ancestor (else the menu's parent element) count as inside,
   * so the trigger's own toggle is not fought by this handler.
   */
  onClose: () => void;
  /** Called after the exit transition finishes. */
  onExited?: () => void;
  labels?: DeviceMenuLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<DeviceMenuLabels> = {
  empty: 'No devices found',
};

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

/**
 * Device picker on a `PopoverMenu` surface (microphone, camera, speakers). Theming is
 * scoped here so the menu stays legible whatever surface it is anchored to. Host owns
 * open state and positioning; this component owns dismissal (outside pointerdown,
 * Escape), initial focus and arrow-key navigation.
 */
export function DeviceMenu({
  open,
  title,
  devices = [],
  selectedId,
  onSelect,
  sections,
  onClose,
  onExited,
  labels,
  className,
}: DeviceMenuProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  // PopoverMenu takes no ref: a `display: contents` wrapper locates its DOM.
  const menuRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Dismissal + initial focus while open.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const menu = menuRef.current;
      const target = e.target as Node | null;
      if (!menu || !target) return;
      // A host can mark a wider anchor (trigger + menu wrapper) as inside.
      const region =
        menu.closest('[data-menu-anchor]') ?? menu.parentElement ?? menu;
      if (region.contains(target)) return;
      onCloseRef.current();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    // PopoverMenu mounts its rows a frame or two after `open` flips: retry briefly.
    let raf = 0;
    let tries = 0;
    const focusFirst = () => {
      const first = menuRef.current?.querySelector<HTMLElement>(
        '[role^="menuitem"]:not(:disabled)',
      );
      if (first) first.focus({ preventScroll: true });
      else if (tries++ < 10) raf = requestAnimationFrame(focusFirst);
    };
    raf = requestAnimationFrame(focusFirst);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(raf);
    };
  }, [open]);

  const onMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>(
        '[role^="menuitem"]:not(:disabled)',
      ),
    );
    if (!items.length) return;
    e.preventDefault();
    const i = items.indexOf(document.activeElement as HTMLElement);
    let next = i;
    if (e.key === 'ArrowDown') next = (i + 1) % items.length;
    else if (e.key === 'ArrowUp') next = (i - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else next = items.length - 1;
    items[next].focus();
  };

  const renderItems = (
    list: DeviceMenuDevice[],
    selected: string | undefined,
    pick: ((id: string) => void) | undefined,
  ) =>
    list.length === 0 ? (
      <p className={styles['device-menu__empty']}>{l.empty}</p>
    ) : (
      list.map((d, i) => {
        const isSelected = selected ? selected === d.id : i === 0;
        return (
          <MenuItem
            key={d.id}
            role="menuitemradio"
            aria-checked={isSelected}
            label={d.label}
            leadingElement={false}
            trailingElement={isSelected}
            trailingVisual={<Icon size="16" glyph={<CheckIcon />} />}
            onClick={() => pick?.(d.id)}
          />
        );
      })
    );

  return (
    <div ref={menuRef} className={styles['device-menu__anchor']}>
      <PopoverMenu
        open={open}
        onExited={onExited}
        role="menu"
        aria-label={title}
        onKeyDown={onMenuKeyDown}
        className={cx(styles['device-menu'], className)}
      >
        <PopoverMenuTitle>{title}</PopoverMenuTitle>
        {sections
          ? sections.map((s, i) => (
              <div key={s.id} role="group" aria-label={s.title}>
                {i > 0 && <PopoverMenuDivider />}
                <PopoverMenuGroup>
                  <PopoverMenuGroupTitle>{s.title}</PopoverMenuGroupTitle>
                  {renderItems(s.devices, s.selectedId, s.onSelect)}
                </PopoverMenuGroup>
              </div>
            ))
          : renderItems(devices, selectedId, onSelect)}
      </PopoverMenu>
    </div>
  );
}
