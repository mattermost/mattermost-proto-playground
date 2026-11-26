/*
 * Borderless table-cell trigger that opens a Compass menu, ported from the
 * permission policy rule builder (branch `abhijit/dm-gm-action-controls`,
 * `policy-rule-builder/components/MenuCell.tsx`), which follows the shipped
 * ABAC table editor: no input border, a neutral wash on hover, a deeper wash
 * while open. Narrowed for one party (user attributes): no nested steps or
 * "Not available" tail. Unlike the source, the menu is portaled and fixed
 * under the trigger, per this repo's overlay rule.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import CheckIcon from '@mattermost/compass-icons/components/check';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
} from '@mattermost/compass-ui/components/popover-menu';
import { SearchInput } from '@mattermost/compass-ui/components/search-input';
import { useOutsideClose } from '@mattermost/compass-ui/hooks/use-outside-close';
import styles from './MenuCell.module.scss';

export interface MenuOption {
  value: string;
  label: string;
  description?: string;
}

export interface MenuGroup {
  heading?: string;
  options: MenuOption[];
}

interface MenuCellProps {
  ariaLabel: string;
  groups: MenuGroup[];
  selected: string[];
  onSelect: (value: string) => void;
  /** Keep the menu open after a pick and show checks (multi-select). */
  multi?: boolean;
  children?: ReactNode;
  chevron?: boolean;
  /** Replace the borderless cell trigger (header control, "Add attribute"). */
  renderTrigger?: (props: { open: boolean; toggle: () => void }) => ReactNode;
  /** A search at the top of the menu. */
  searchable?: boolean;
  /** Which edge of the trigger the menu lines up with. */
  align?: 'start' | 'end';
}

const ITEM = '[data-menu-item]';

export default function MenuCell({
  ariaLabel,
  groups,
  selected,
  onSelect,
  multi = false,
  children,
  chevron = false,
  renderTrigger,
  searchable = false,
  align = 'start',
}: MenuCellProps) {
  const [open, setOpen] = useState(false);
  // Stays set through the exit transition; cleared by PopoverMenu `onExited`.
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    setQuery('');
    if (returnFocus) ref.current?.querySelector<HTMLElement>('button')?.focus();
  }, []);
  useOutsideClose(ref, open, () => close(false), menuRef);

  const toggle = () => {
    if (open) {
      close(true);
      return;
    }
    if (ref.current) setAnchor(ref.current.getBoundingClientRect());
    setOpen(true);
  };

  // Focus the search, or the first option, when the menu opens.
  useEffect(() => {
    if (!open) return undefined;
    const id = requestAnimationFrame(() => {
      if (searchable) searchRef.current?.focus();
      else menuRef.current?.querySelector<HTMLElement>(ITEM)?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open, searchable]);

  // Keep the menu on its trigger while the page scrolls or resizes.
  useEffect(() => {
    if (!open) return undefined;
    const update = () =>
      ref.current && setAnchor(ref.current.getBoundingClientRect());
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(ITEM) ?? [],
    );
    const i = items.indexOf(document.activeElement as HTMLElement);
    const inSearch = document.activeElement === searchRef.current;
    if (inSearch && e.key === 'Escape' && query) {
      e.preventDefault();
      setQuery('');
      return;
    }
    if (inSearch && !['ArrowDown', 'ArrowUp', 'Escape', 'Tab'].includes(e.key))
      return;
    const move = (n: number) => {
      e.preventDefault();
      items[(n + items.length) % items.length]?.focus();
    };
    if (e.key === 'ArrowDown') move(i + 1);
    else if (e.key === 'ArrowUp') move(i - 1);
    else if (e.key === 'Home') move(0);
    else if (e.key === 'End') move(items.length - 1);
    else if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
    } else if (e.key === 'Tab') close(false);
  };

  const q = query.trim().toLowerCase();
  const shown = q
    ? groups
        .map((g) => ({
          ...g,
          options: g.options.filter((o) => o.label.toLowerCase().includes(q)),
        }))
        .filter((g) => g.options.length > 0)
    : groups;

  return (
    <div className={styles['menu-cell']} ref={ref}>
      {renderTrigger ? (
        renderTrigger({ open, toggle })
      ) : (
        <button
          type="button"
          className={styles['menu-cell__trigger']}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={ariaLabel}
          onClick={toggle}
        >
          <span className={styles['menu-cell__value']}>{children}</span>
          {chevron ? <Icon glyph={<ChevronDownIcon />} size="16" /> : null}
        </button>
      )}
      {anchor
        ? createPortal(
            // The menu layer owns arrow keys and Escape, like the source's menu wrapper.
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              ref={menuRef}
              className={[
                styles['menu-cell__layer'],
                align === 'end' ? styles['menu-cell__layer--end'] : '',
              ].join(' ')}
              style={{
                top: anchor.bottom + 4,
                left: align === 'end' ? anchor.right : anchor.left,
              }}
              onKeyDown={onKeyDown}
            >
              <PopoverMenu
                open={open}
                onExited={() => setAnchor(null)}
                role="menu"
                aria-label={ariaLabel}
                className={styles['menu-cell__menu']}
              >
                {searchable ? (
                  <div className={styles['menu-cell__search']}>
                    <SearchInput
                      ref={searchRef}
                      size="small"
                      placeholder="Search attributes"
                      aria-label="Search attributes"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onClear={() => setQuery('')}
                    />
                  </div>
                ) : null}
                {shown.length === 0 ? (
                  <p className={styles['menu-cell__empty']}>
                    No matches for “{query.trim()}”
                  </p>
                ) : null}
                {shown.map((g, gi) => (
                  <div
                    key={`${g.heading ?? ''}-${gi}`}
                    role="group"
                    aria-label={g.heading}
                  >
                    {gi > 0 ? <PopoverMenuDivider /> : null}
                    {g.heading ? <MenuGroupHeading label={g.heading} /> : null}
                    {g.options.map((o) => {
                      const checked = selected.includes(o.value);
                      return (
                        <MenuItem
                          key={o.value}
                          label={o.label}
                          secondaryLabel={o.description}
                          secondaryLabelPosition="below"
                          leadingElement={false}
                          trailingElement={checked}
                          trailingVisual={<Icon glyph={<CheckIcon />} />}
                          data-menu-item
                          role={multi ? 'menuitemcheckbox' : 'menuitemradio'}
                          aria-checked={checked}
                          onClick={() => {
                            onSelect(o.value);
                            if (!multi) close(true);
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </PopoverMenu>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
