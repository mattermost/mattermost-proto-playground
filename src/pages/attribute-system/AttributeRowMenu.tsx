import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import Switch from '@/components/ui/Switch/Switch';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import styles from './AttributeSystem.module.scss';

/**
 * Config-driven row overflow menu shared across attribute surfaces (Users,
 * Channels, Global). Plan §4.2 / §12.1 — ARIA contract:
 *
 *  - Trigger: rendered by the caller; we expose `menuId` via the wrapper so the
 *    caller can wire `aria-controls`. Container has `role="menu"` +
 *    `aria-label="More actions for {triggerLabel}"`.
 *  - `kind: 'toggle'` items use `role="menuitemcheckbox"` + `aria-checked`.
 *    Space toggles WITHOUT closing the menu (handled here in `onKeyDown`).
 *  - `kind: 'submenu'` parents use `aria-haspopup="menu"` + `aria-expanded`.
 *    Right Arrow opens, Left Arrow closes; Escape closes the whole tree to the
 *    trigger.
 *  - Outside-click closes (mousedown + ancestor check).
 */

export type MenuItemKind = 'item' | 'toggle' | 'submenu' | 'divider';

export interface AttributeMenuItem {
  /** Discriminator. Default 'item'. */
  kind?: MenuItemKind;
  /** Primary label. Required for non-divider rows. */
  label?: string;
  /** Optional inline secondary value (right of label). */
  secondaryLabel?: string;
  /** Leading icon node — usually an icon glyph element. */
  icon?: ReactNode;
  /** Click handler for 'item' rows. */
  onClick?: () => void;
  /** Toggle state for 'toggle' rows. */
  checked?: boolean;
  /** Toggle handler for 'toggle' rows. */
  onToggle?: (next: boolean) => void;
  /** Submenu items for 'submenu' rows. */
  submenu?: AttributeMenuItem[];
  /** Destructive (red) styling for 'item' rows. */
  destructive?: boolean;
  /** Disable the row. */
  disabled?: boolean;
  /** Tooltip rendered to the left of a disabled row on hover/focus. */
  disabledTooltip?: string;
  /** Stable id (used to key the row); auto-generated when absent. */
  id?: string;
}

export interface AttributeRowMenuProps {
  /** Whether the menu is currently open. */
  open: boolean;
  /** Close the menu (Escape, outside-click, item activation). */
  onClose: () => void;
  /** Used to compose the `aria-label="More actions for {triggerLabel}"`. */
  triggerLabel: string;
  /** Item descriptors, top to bottom. */
  items: AttributeMenuItem[];
}

export default function AttributeRowMenu({
  open,
  onClose,
  triggerLabel,
  items,
}: AttributeRowMenuProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Outside-click + Escape (whole tree → trigger). Submenu Escape is handled in
  // the submenu component itself which closes its own state first.
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (wrapRef.current?.contains(e.target as Node)) return;
      onClose();
    }
    function onKey(e: KeyboardEvent | KeyboardEvent | globalThis.KeyboardEvent) {
      if ((e as globalThis.KeyboardEvent).key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey as EventListener);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey as EventListener);
    };
  }, [open, onClose]);

  return (
    <div className={styles.overflow} ref={wrapRef}>
      {open && (
        <div
          className={styles.overflowMenu}
          id={menuId}
          role="menu"
          aria-label={`More actions for ${triggerLabel}`}
        >
          <PopoverMenu>
            {items.map((item, i) => (
              <RowMenuRow
                key={item.id ?? `${item.kind ?? 'item'}-${i}`}
                item={item}
                onClose={onClose}
              />
            ))}
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}

function RowMenuRow({
  item,
  onClose,
}: {
  item: AttributeMenuItem;
  onClose: () => void;
}) {
  const kind = item.kind ?? 'item';

  if (kind === 'divider') {
    return <div className={styles.menuDivider} role="separator" />;
  }

  if (kind === 'toggle') {
    return <ToggleRow item={item} />;
  }

  if (kind === 'submenu') {
    return <SubmenuRow item={item} onClose={onClose} />;
  }

  // Plain item — may be disabled with a tooltip.
  if (item.disabled && item.disabledTooltip) {
    return (
      <div className={styles.subWrap}>
        <MenuItem
          label={item.label ?? ''}
          leadingVisual={item.icon}
          secondaryLabel={item.secondaryLabel}
          secondaryLabelPosition="Inline"
          destructive={item.destructive}
          disabled
          role="menuitem"
        />
        <div
          style={{ position: 'absolute', right: '100%', top: 4 }}
          aria-hidden
        >
          <Tooltip label={item.disabledTooltip} arrow="Right" />
        </div>
      </div>
    );
  }

  return (
    <MenuItem
      label={item.label ?? ''}
      leadingVisual={item.icon}
      secondaryLabel={item.secondaryLabel}
      secondaryLabelPosition="Inline"
      destructive={item.destructive}
      disabled={item.disabled}
      role="menuitem"
      onClick={() => {
        if (item.disabled) return;
        item.onClick?.();
        onClose();
      }}
    />
  );
}

/**
 * Toggle row — role="menuitemcheckbox" + aria-checked.
 * Space toggles WITHOUT closing the menu; Enter behaves the same way.
 * Clicking the Switch directly bypasses the row button and toggles via the
 * native checkbox onChange.
 */
function ToggleRow({ item }: { item: AttributeMenuItem }) {
  const checked = Boolean(item.checked);
  const handleToggle = () => {
    if (item.disabled) return;
    item.onToggle?.(!checked);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleToggle();
    }
  };

  return (
    <div
      role="menuitemcheckbox"
      aria-checked={checked}
      aria-disabled={item.disabled || undefined}
      tabIndex={-1}
      className={styles.menuRow}
      onKeyDown={onKey}
      onClick={(e) => {
        // Clicking outside the Switch itself toggles via the row.
        const target = e.target as HTMLElement;
        if (target.closest('input,label,.switch')) return;
        handleToggle();
      }}
    >
      <span className={styles.menuRow__leading}>
        {item.icon && (
          <span className={styles.menuRow__icon}>{item.icon}</span>
        )}
        <span className={styles.menuRow__label}>{item.label}</span>
      </span>
      <Switch
        size="Small"
        checked={checked}
        disabled={item.disabled}
        aria-label={item.label}
        onChange={(e) =>
          item.onToggle?.((e.target as HTMLInputElement).checked)
        }
      />
    </div>
  );
}

/**
 * Submenu row — aria-haspopup + aria-expanded. Right Arrow opens, Left Arrow
 * closes; mouse hover open/close mirrors the existing GlobalAttributeRowMenu
 * pattern.
 */
function SubmenuRow({
  item,
  onClose,
}: {
  item: AttributeMenuItem;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const subId = useId();

  const subItems = useMemo(() => item.submenu ?? [], [item.submenu]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === 'ArrowLeft' || e.key === 'Escape') {
      // Submenu eats Escape locally first — the parent listener still fires
      // for the outer menu on the next Escape.
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((c) => !c);
    }
  };

  return (
    <div
      className={styles.subWrap}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <MenuItem
        label={item.label ?? ''}
        leadingVisual={item.icon}
        secondaryLabel={item.secondaryLabel}
        secondaryLabelPosition="Inline"
        trailingElement
        trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={subId}
        role="menuitem"
        onClick={() => setOpen((c) => !c)}
        onKeyDown={onKey}
      />
      {open && (
        <div
          className={styles.submenu}
          id={subId}
          role="menu"
          aria-label={`${item.label ?? 'Submenu'}`}
        >
          <PopoverMenu variant="child">
            {subItems.map((sub, i) => (
              <Fragment key={sub.id ?? `${sub.kind ?? 'item'}-${i}`}>
                <RowMenuRow item={sub} onClose={onClose} />
              </Fragment>
            ))}
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}
