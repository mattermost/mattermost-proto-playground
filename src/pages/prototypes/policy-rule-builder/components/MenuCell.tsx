// [AI DRAFT] Borderless, clickable table cell that opens a Compass menu,
// following the shipped ABAC table editor (no input border, a neutral wash on
// hover, a deeper wash while open). Extends v1's CellMenu with:
//   - disabled options that stay visible, readable and focusable, and say why
//     (04 §6; cycle 1 VIS-3, QA-10)
//   - multi-select for "in" / "has any of" / "has all of"
//   - a nested step, for resource selection (b): Resource → type → attribute
//   - keyboard: focus moves into the menu, ↑/↓/Home/End move, Escape closes
//     and returns focus to the trigger (cycle 1, QA-11)
//   - an optional search at the top that searches every option, steps
//     included, and lists matches flat with their party (round 2, M6)
// Compass has no table-cell trigger, so the trigger is composed from tokens;
// the menu is PopoverMenu + MenuItem + MenuGroupHeading.
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CodeBracketsIcon from '@mattermost/compass-icons/components/code-brackets';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { PopoverMenu, PopoverMenuDivider } from '@mattermost/compass-ui/components/popover-menu';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { SearchInput } from '@mattermost/compass-ui/components/search-input';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { MENU } from '../copy';
import editor from './RuleEditor.module.scss';
import styles from './MenuCell.module.scss';

export interface MenuOption {
  value: string;
  label: string;
  /** Visible and focusable but not selectable; the reason shows under the label. */
  disabledReason?: string;
  /** Opens a nested step instead of selecting. */
  next?: { title: string; groups: MenuGroup[] };
  /** Secondary line for an enabled option. */
  description?: string;
  /** The group's notice already gives the reason (M5). */
  reasonInNotice?: boolean;
  /** Its own line, with the warning icon: e.g. the action loosens the policy. */
  warning?: string;
}

export interface MenuGroup {
  heading?: string;
  /** A line under the heading, for example why the group's options are blocked. */
  notice?: string;
  options: MenuOption[];
}

export interface MenuCellProps {
  ariaLabel: string;
  groups: MenuGroup[];
  /** Selected value(s); multi-select shows a check on each. */
  selected: string[];
  onSelect: (value: string) => void;
  /** Keep the menu open after a pick (multi-select). */
  multi?: boolean;
  children: ReactNode;
  chevron?: boolean;
  /** Scene support: open on load. */
  defaultOpen?: boolean;
  /** Replace the borderless cell trigger (for "+ Add attribute"). */
  renderTrigger?: (props: { open: boolean; toggle: () => void }) => ReactNode;
  /** Extra class on the menu surface (width, placement). */
  menuClassName?: string;
  onOpenChange?: (open: boolean) => void;
  /** A search at the top that searches every option, steps included (M6). */
  searchable?: boolean;
  /** Scene support: start with this search. */
  defaultQuery?: string;
}

export function AttributeChip({ label }: { label: string }) {
  return (
    <span className={editor['policy-editor__attr-chip']}>
      <Icon glyph={<CodeBracketsIcon />} size="12" />
      <span className={editor['policy-editor__attr-chip-text']}>{label}</span>
    </span>
  );
}

const ITEM = '[data-menu-item]';

/**
 * Unavailable options leave the main list (feedback F8): they're gathered,
 * with their reasons, under one trailing "Not available (n) ›" step so they
 * don't crowd what can be picked.
 */
function withUnavailableTail(groups: MenuGroup[]): MenuGroup[] {
  // Inside the step, unavailable options keep their section heading once,
  // rather than repeating it in every label (round 1.3).
  const unavailable: MenuGroup[] = [];
  const main = groups
    .map((g) => {
      const off = g.options.filter((o) => o.disabledReason);
      // One shared reason is said once, under the heading (round 2, M5).
      const shared = off.length > 1 && off.every((o) => o.disabledReason === off[0].disabledReason);
      if (off.length) {
        unavailable.push(
          shared
            ? { heading: g.heading, notice: off[0].disabledReason, options: off.map((o) => ({ ...o, reasonInNotice: true })) }
            : { heading: g.heading, options: off },
        );
      }
      return { ...g, options: g.options.filter((o) => !o.disabledReason) };
    })
    .filter((g) => g.options.length > 0 || g.notice);
  const count = unavailable.reduce((n, g) => n + g.options.length, 0);
  if (count === 0) return main;
  return [
    ...main,
    {
      options: [
        {
          value: '__not-available',
          label: `${MENU.notAvailable} (${count})`,
          next: { title: MENU.notAvailable, groups: unavailable },
        },
      ],
    },
  ];
}

/**
 * Every option that matches, flat, named with its group or step ("Recipient:
 * Program"), so a match can't be mistaken for another party's (M6). Options
 * under an unavailable step inherit its reason and come last.
 */
function searchResults(groups: MenuGroup[], query: string): MenuGroup[] {
  const q = query.trim().toLowerCase();
  const found: MenuOption[] = [];
  const walk = (gs: MenuGroup[], prefix: string | undefined, reason: string | undefined) => {
    for (const g of gs) {
      for (const o of g.options) {
        if (o.next && o.value !== '__not-available') {
          walk(o.next.groups, o.label, o.disabledReason ?? reason);
          continue;
        }
        const named = prefix ?? g.heading;
        const label = named ? `${named}: ${o.label}` : o.label;
        if (label.toLowerCase().includes(q)) {
          found.push({ ...o, label, description: undefined, disabledReason: o.disabledReason ?? reason });
        }
      }
    }
  };
  walk(groups, undefined, undefined);
  const on = found.filter((o) => !o.disabledReason);
  const off = found.filter((o) => o.disabledReason);
  if (found.length === 0) return [{ notice: MENU.noMatch(query.trim()), options: [] }];
  return [
    ...(on.length ? [{ options: on }] : []),
    ...(off.length ? [{ heading: MENU.notAvailable, options: off }] : []),
  ];
}

export default function MenuCell({
  ariaLabel,
  groups,
  selected,
  onSelect,
  multi = false,
  children,
  chevron = false,
  defaultOpen = false,
  renderTrigger,
  menuClassName,
  onOpenChange,
  searchable = false,
  defaultQuery = '',
}: MenuCellProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState(defaultQuery);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => onOpenChange?.(open), [open, onOpenChange]);
  const [stack, setStack] = useState<{ title: string; groups: MenuGroup[] }[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Only move focus for menus the user opened, not ones a scene opens on load.
  const userOpened = useRef(false);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    setStack([]);
    setQuery('');
    if (returnFocus) {
      ref.current?.querySelector<HTMLElement>('button')?.focus();
    }
  }, []);
  const outside = useCallback(() => close(false), [close]);
  useOutsideClose(ref, open, outside);

  const toggle = () => {
    if (open) {
      close(true);
    } else {
      userOpened.current = true;
      setOpen(true);
    }
  };

  // Focus the search (or the first option) when opened by the user, or when a
  // step changes.
  useEffect(() => {
    if (!open || !userOpened.current) return;
    const id = requestAnimationFrame(() => {
      if (searchable && stack.length === 0) searchRef.current?.focus();
      else menuRef.current?.querySelector<HTMLElement>(ITEM)?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open, stack.length, searchable]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Keyboard use means focus should follow into steps and back (QA1-11).
    userOpened.current = true;
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>(ITEM) ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    const inSearch = document.activeElement === searchRef.current;
    // In the search field, letters type; ↓ moves into the results; Escape
    // clears a search before it closes the menu.
    if (inSearch && e.key === 'Escape' && query) {
      e.preventDefault();
      setQuery('');
      return;
    }
    if (inSearch && !['ArrowDown', 'ArrowUp', 'Escape', 'Tab'].includes(e.key)) return;
    const move = (n: number) => {
      e.preventDefault();
      items[(n + items.length) % items.length]?.focus();
    };
    if (e.key === 'ArrowDown') move(i + 1);
    else if (e.key === 'ArrowUp') move(i - 1);
    // Into and out of a step, like any submenu (QA1-11).
    else if (e.key === 'ArrowRight' && items[i]?.getAttribute('aria-haspopup') === 'menu') {
      e.preventDefault();
      items[i].click();
    } else if (e.key === 'ArrowLeft' && stack.length) {
      e.preventDefault();
      setStack((st) => st.slice(0, -1));
    }
    else if (e.key === 'Home') move(0);
    else if (e.key === 'End') move(items.length - 1);
    else if (e.key === 'Escape') {
      e.preventDefault();
      if (stack.length) setStack((s) => s.slice(0, -1));
      else close(true);
    } else if (e.key === 'Tab') close(false);
  };

  // The overlay scrollbar positions its content absolutely, so the menu can't
  // size to it. Measure the content's natural width; Compass's PopoverMenu
  // min and max widths still clamp it (round 1.3).
  const [menuWidth, setMenuWidth] = useState<number | undefined>();
  useLayoutEffect(() => {
    if (!open) return;
    const content = menuRef.current?.querySelector<HTMLElement>('.simplebar-content');
    if (!content) return;
    const prev = content.style.width;
    content.style.width = 'max-content';
    const natural = Math.ceil(content.getBoundingClientRect().width) + 2; // + borders
    content.style.width = prev;
    setMenuWidth(natural);
  }, [open, stack, groups, query]);

  const level = stack[stack.length - 1];
  const searching = searchable && !level && query.trim() !== '';
  // Inside the "Not available" step the reasons are the point, so keep them.
  const shown = level ? level.groups : searching ? searchResults(groups, query) : withUnavailableTail(groups);

  return (
    <div className={editor['policy-editor__cell-anchor']} ref={ref}>
      {renderTrigger ? (
        renderTrigger({ open, toggle })
      ) : (
        <button
          type="button"
          className={editor['policy-editor__cell-trigger']}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={ariaLabel}
          onClick={toggle}
        >
          <span className={editor['policy-editor__cell-trigger-value']}>{children}</span>
          {chevron ? <Icon glyph={<ChevronDownIcon />} size="16" /> : null}
        </button>
      )}
      {open ? (
        <div ref={menuRef} onKeyDown={onKeyDown} role="menu" aria-label={ariaLabel} tabIndex={-1}>
          <PopoverMenu
            className={[editor['policy-editor__cell-menu'], styles['menu-cell__menu'], menuClassName ?? ''].join(' ')}
            style={menuWidth ? { width: menuWidth } : undefined}
          >
            {searchable && !level ? (
              // One search for the whole menu, steps included (M6).
              <div className={styles['menu-cell__search']}>
                <SearchInput
                  ref={searchRef}
                  size="small"
                  placeholder={MENU.searchPlaceholder}
                  aria-label={MENU.searchLabel}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onClear={() => setQuery('')}
                />
              </div>
            ) : null}
            {/* Compass overlay scrollbar: shows on scroll, takes no width (round 1.3). */}
            <Scrollbar className={styles['menu-cell__scroll']}>
            {level ? (
              <MenuItem
                label={level.title}
                leadingVisual={<Icon glyph={<ChevronLeftIcon />} size="16" />}
                aria-label={`Back from ${level.title}`}
                data-menu-item
                role="menuitem"
                onClick={() => setStack((s) => s.slice(0, -1))}
                className={styles['menu-cell__back']}
              />
            ) : null}
            {level ? <PopoverMenuDivider /> : null}
            {shown.map((g, gi) => (
              <div key={`${g.heading ?? ''}-${gi}`} role="group" aria-label={g.heading}>
                {/* A Compass divider between groups (User, Recipient, Resource,
                    Not available…), so each reads as its own set (round 1.3). */}
                {gi > 0 ? <PopoverMenuDivider /> : null}
                {g.heading ? <MenuGroupHeading label={g.heading} /> : null}
                {g.notice ? (
                  <p className={editor['policy-editor__menu-notice']}>
                    <Icon glyph={<InformationOutlineIcon />} size="16" />
                    {g.notice}
                  </p>
                ) : null}
                {g.options.map((o) => {
                  const disabled = Boolean(o.disabledReason);
                  // A step that can't be used doesn't open (M5: the reason says why).
                  const step = Boolean(o.next) && !disabled;
                  const checked = !o.next && selected.includes(o.value);
                  return (
                    <MenuItem
                      key={o.value}
                      label={o.label}
                      secondaryLabel={
                        (o.reasonInNotice ? undefined : o.disabledReason) ??
                        (o.warning ? (
                          <span className={styles['menu-cell__stack']}>
                            {o.description ? <span>{o.description}</span> : null}
                            <span className={styles['menu-cell__warning']}>
                              <Icon glyph={<AlertCircleOutlineIcon />} size="12" />
                              {o.warning}
                            </span>
                          </span>
                        ) : (
                          o.description
                        ))
                      }
                      secondaryLabelPosition="below"
                      leadingElement={false}
                      aria-disabled={disabled || undefined}
                      className={
                        disabled
                          ? styles['menu-cell__option--disabled']
                          : o.warning
                            ? styles['menu-cell__option--warns']
                            : undefined
                      }
                      trailingVisual={
                        step ? <Icon glyph={<ChevronRightIcon />} size="16" /> : undefined
                      }
                      trailingElement={checked || step}
                      data-menu-item
                      aria-haspopup={step ? 'menu' : undefined}
                      role={multi ? 'menuitemcheckbox' : 'menuitem'}
                      aria-checked={multi ? checked : undefined}
                      onClick={() => {
                        if (disabled) return;
                        if (step && o.next) {
                          const nextLevel = o.next as { title: string; groups: MenuGroup[] };
                          // Nested steps hide their own unavailable options too.
                          setStack((s) => [
                            ...s,
                            o.value === '__not-available'
                              ? nextLevel
                              : { ...nextLevel, groups: withUnavailableTail(nextLevel.groups) },
                          ]);
                          return;
                        }
                        onSelect(o.value);
                        if (!multi) close(true);
                      }}
                    />
                  );
                })}
              </div>
            ))}
            </Scrollbar>
          </PopoverMenu>
        </div>
      ) : null}
    </div>
  );
}
