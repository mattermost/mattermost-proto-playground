import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type TransitionEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import Icon from '@/components/ui/Icon/Icon';
import {
  buildQuickSwitcherDestinations,
  type QuickSwitcherDestination,
} from './quickSwitcherDestinations';
import styles from './QuickSwitcher.module.scss';

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

export default function QuickSwitcher({ open, onOpenChange }: QuickSwitcherProps) {
  const navigate = useNavigate();
  const isMac = useIsMac();
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const destinations = useMemo(() => buildQuickSwitcherDestinations(), []);
  const filtered = useMemo(
    () => filterDestinations(destinations, query),
    [destinations, query],
  );

  const requestClose = useCallback(() => {
    setExiting(true);
  }, []);

  const finishClose = useCallback(() => {
    setMounted(false);
    setExiting(false);
    setAnimateIn(false);
    setQuery('');
    setActiveIndex(0);
    onOpenChange(false);
  }, [onOpenChange]);

  useLayoutEffect(() => {
    if (open) {
      setMounted(true);
      setExiting(false);
      setQuery('');
      setActiveIndex(0);
    } else if (mounted && !exiting) {
      requestClose();
    }
  }, [open, exiting, mounted, requestClose]);

  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  useEffect(() => {
    if (mounted && animateIn && !exiting) {
      inputRef.current?.focus();
    }
  }, [mounted, animateIn, exiting]);

  useEffect(() => {
    setActiveIndex((i) => (filtered.length === 0 ? 0 : Math.min(i, filtered.length - 1)));
  }, [filtered.length, query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isModK = e.key === 'k' && (e.metaKey || e.ctrlKey);
      if (isModK) {
        e.preventDefault();
        if (open) {
          onOpenChange(false);
        } else {
          onOpenChange(true);
        }
        return;
      }

      if (!open || !mounted) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, mounted, onOpenChange]);

  useEffect(() => {
    if (!open && !mounted) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, mounted]);

  function handlePanelTransitionEnd(e: TransitionEvent<HTMLDivElement>) {
    if (e.propertyName !== 'opacity') return;
    if (exiting) {
      finishClose();
    }
  }

  function goTo(dest: QuickSwitcherDestination) {
    navigate(dest.path);
    onOpenChange(false);
  }

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

  if (!mounted) return null;

  const shortcutHint = isMac ? '⌘K' : 'Ctrl K';

  return createPortal(
    <div className={styles['quick-switcher']} role="presentation">
      <button
        type="button"
        className={styles['quick-switcher__backdrop']}
        aria-label="Close quick switcher"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={panelRef}
        className={[
          styles['quick-switcher__panel'],
          !exiting && animateIn ? styles['quick-switcher__panel--visible'] : '',
          exiting ? styles['quick-switcher__panel--exiting'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Quick switcher"
        onTransitionEnd={handlePanelTransitionEnd}
      >
        <div className={styles['quick-switcher__search']}>
          <span className={styles['quick-switcher__search-icon']} aria-hidden>
            <Icon size="20" glyph={<MagnifyIcon />} />
          </span>
          <input
            ref={inputRef}
            type="search"
            className={styles['quick-switcher__input']}
            placeholder="Go to page…"
            aria-autocomplete="list"
            aria-controls="quick-switcher-listbox"
            aria-activedescendant={
              filtered.length > 0 ? `quick-switcher-opt-${activeIndex}` : undefined
            }
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onListKeyDown}
          />
          <span className={styles['quick-switcher__hint']} aria-hidden>
            {shortcutHint}
          </span>
        </div>
        {filtered.length === 0 ? (
          <p className={styles['quick-switcher__empty']}>No matching pages</p>
        ) : (
          <ul
            ref={listRef}
            id="quick-switcher-listbox"
            className={styles['quick-switcher__list']}
            role="listbox"
            aria-label="Pages"
          >
            {filtered.map((dest, idx) => (
              <li key={dest.id} role="presentation">
                <button
                  type="button"
                  id={`quick-switcher-opt-${idx}`}
                  data-idx={idx}
                  role="option"
                  aria-selected={idx === activeIndex}
                  className={[
                    styles['quick-switcher__item'],
                    idx === activeIndex ? styles['quick-switcher__item--active'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => goTo(dest)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <span className={styles['quick-switcher__item-title']}>
                    {dest.title}
                  </span>
                  <span className={styles['quick-switcher__item-subtitle']}>
                    {dest.subtitle} · {dest.path}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body,
  );
}
