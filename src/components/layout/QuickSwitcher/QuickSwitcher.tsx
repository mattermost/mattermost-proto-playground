import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import {
  Icon,
  MenuItem,
  Scrollbar,
  SearchInput,
  ShortcutTagGroup,
} from '@mattermost/compass-ui';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import {
  buildQuickSwitcherDestinations,
  type QuickSwitcherDestination,
} from './quickSwitcherDestinations';
import styles from './QuickSwitcher.module.scss';

/** Matches `--duration-quick` (150ms) for enter/exit panel animation. */
const EXIT_MS = 150;

export interface QuickSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useIsMac() {
  return useMemo(
    () => typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.platform),
    [],
  );
}

function filterDestinations(
  all: QuickSwitcherDestination[],
  query: string,
): QuickSwitcherDestination[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [...all].sort((a, b) => {
      if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
      return a.title.localeCompare(b.title);
    });
  }
  return all
    .filter((d) => d.searchText.includes(q))
    .sort((a, b) => a.title.localeCompare(b.title));
}

function BreadcrumbSecondary({ crumbs }: { crumbs: string[] }): ReactNode {
  if (crumbs.length === 0) return null;

  return (
    <span className={styles['quick-switcher__breadcrumb']}>
      {crumbs.map((crumb, index) => (
        <Fragment key={`${crumb}-${index}`}>
          {index > 0 && (
            <span className={styles['quick-switcher__breadcrumb-sep']} aria-hidden>
              <Icon size="12" glyph={<ChevronRightIcon />} />
            </span>
          )}
          <span className={styles['quick-switcher__breadcrumb-crumb']}>{crumb}</span>
        </Fragment>
      ))}
    </span>
  );
}

export default function QuickSwitcher({ open, onOpenChange }: QuickSwitcherProps) {
  const navigate = useNavigate();
  const isMac = useIsMac();
  const { rendered, exiting } = useExitAnimation(open, EXIT_MS);
  const [animateIn, setAnimateIn] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const destinations = useMemo(() => buildQuickSwitcherDestinations(), []);
  const filtered = useMemo(
    () => filterDestinations(destinations, query),
    [destinations, query],
  );

  useLayoutEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setAnimateIn(false);
    }
  }, [open]);

  useEffect(() => {
    if (!rendered || exiting) return;
    const id = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(id);
  }, [rendered, exiting]);

  useEffect(() => {
    if (rendered && animateIn && !exiting) {
      inputRef.current?.focus();
    }
  }, [rendered, animateIn, exiting]);

  useEffect(() => {
    setActiveIndex((i) => (filtered.length === 0 ? 0 : Math.min(i, filtered.length - 1)));
  }, [filtered.length, query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isModK = e.key === 'k' && (e.metaKey || e.ctrlKey);
      if (isModK) {
        e.preventDefault();
        onOpenChange(!open);
        return;
      }

      if (!open || !rendered) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, rendered, onOpenChange]);

  useEffect(() => {
    if (!rendered) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [rendered]);

  const goTo = useCallback(
    (dest: QuickSwitcherDestination) => {
      navigate(dest.path);
      onOpenChange(false);
    },
    [navigate, onOpenChange],
  );

  function onListKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (filtered.length === 0 ? 0 : (i + 1) % filtered.length));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) =>
        filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length,
      );
      return;
    }
    if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault();
      goTo(filtered[activeIndex]);
    }
  }

  useEffect(() => {
    if (!listRef.current || filtered.length === 0) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-idx="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, filtered]);

  if (!rendered) return null;

  const shortcutLabels = isMac ? ['⌘', 'K'] : ['Ctrl', 'K'];
  const dialogVisible = animateIn && !exiting;

  return createPortal(
    <div
      className={[
        styles['quick-switcher'],
        dialogVisible ? styles['quick-switcher--visible'] : '',
        exiting ? styles['quick-switcher--exiting'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="presentation"
    >
      <button
        type="button"
        className={styles['quick-switcher__backdrop']}
        aria-label="Close quick switcher"
        onClick={() => onOpenChange(false)}
      />
      <div className={styles['quick-switcher__dialog']}>
        <div
          className={styles['quick-switcher__panel']}
          role="dialog"
          aria-modal="true"
          aria-label="Go to page"
        >
          <div className={styles['quick-switcher__header']}>
            <div className={styles['quick-switcher__search']}>
              <SearchInput
                ref={inputRef}
                className={styles['quick-switcher__search-input']}
                size="Large"
                placeholder="Go to page…"
                aria-autocomplete="list"
                aria-controls="quick-switcher-listbox"
                aria-activedescendant={
                  filtered.length > 0
                    ? `quick-switcher-opt-${activeIndex}`
                    : undefined
                }
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={query}
                onClear={() => {
                  setQuery('');
                  setActiveIndex(0);
                }}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onListKeyDown}
              />
              <ShortcutTagGroup
                className={styles['quick-switcher__shortcut']}
                labels={shortcutLabels}
                size="Small"
              />
            </div>
          </div>

          <div className={styles['quick-switcher__body']}>
            {filtered.length === 0 ? (
              <p className={styles['quick-switcher__empty']}>No matching pages</p>
            ) : (
              <Scrollbar className={styles['quick-switcher__scroll']}>
                <ul
                  ref={listRef}
                  id="quick-switcher-listbox"
                  className={styles['quick-switcher__list']}
                  role="listbox"
                  aria-label="Pages"
                >
                  {filtered.map((dest, idx) => (
                    <li key={dest.id} role="presentation">
                      <MenuItem
                        id={`quick-switcher-opt-${idx}`}
                        data-idx={idx}
                        role="option"
                        aria-selected={idx === activeIndex}
                        label={dest.title}
                        secondaryLabel={
                          dest.breadcrumb.length > 1 ? (
                            <BreadcrumbSecondary crumbs={dest.breadcrumb} />
                          ) : undefined
                        }
                        leadingElement={false}
                        active={idx === activeIndex}
                        onClick={() => goTo(dest)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      />
                    </li>
                  ))}
                </ul>
              </Scrollbar>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
