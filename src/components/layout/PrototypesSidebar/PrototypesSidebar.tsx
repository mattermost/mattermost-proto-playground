import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import StarIcon from '@mattermost/compass-icons/components/star';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import {
  BRANCH_FOCUS_PROTOTYPE_IDS,
  PROTOTYPES,
  isPrototypePageActive,
  prototypePageHref,
  type PrototypeEntry,
} from '@/manifests/prototypes';
import Icon from '@/components/ui/Icon/Icon';
import {
  ORG_CHANGE_EVENT,
  buildOrganizedInitiativeGroups,
  resolveInitiativeId,
  resolveInitiativeMeta,
} from '@/pages/prototypes/initiativeOrganization';
import styles from './PrototypesSidebar.module.scss';

const ORDER_STORAGE_KEY = 'proto-playground-nav-order';
const FAVORITES_STORAGE_KEY = 'proto-playground-nav-favorites';
const DRAG_THRESHOLD_PX = 4;

function listedPrototypes(): PrototypeEntry[] {
  return PROTOTYPES.filter((entry) => {
    if (entry.unlisted) return false;
    if (BRANCH_FOCUS_PROTOTYPE_IDS.size === 0) return true;
    return BRANCH_FOCUS_PROTOTYPE_IDS.has(entry.id);
  });
}

function navLabel(entry: PrototypeEntry): string {
  return entry.navLabel ?? entry.label;
}

function navPages(entry: PrototypeEntry) {
  if (entry.pages?.length) return entry.pages;
  return [{ id: 'main', label: 'Overview' }];
}

function readStoredOrder(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

function writeStoredOrder(order: string[]) {
  try {
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    /* ignore */
  }
}

function readStoredFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

function writeStoredFavorites(ids: string[]) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function applyOrder(
  entries: PrototypeEntry[],
  order: string[],
): PrototypeEntry[] {
  if (order.length === 0) return entries;
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const result: PrototypeEntry[] = [];
  for (const id of order) {
    const entry = byId.get(id);
    if (!entry) continue;
    result.push(entry);
    byId.delete(id);
  }
  for (const entry of entries) {
    if (byId.has(entry.id)) result.push(entry);
  }
  return result;
}

function moveIdToIndex(order: string[], dragId: string, toIndex: number): string[] {
  const from = order.indexOf(dragId);
  if (from < 0 || toIndex < 0 || from === toIndex) return order;
  const next = [...order];
  next.splice(from, 1);
  next.splice(toIndex, 0, dragId);
  return next;
}

type DragSession = {
  id: string;
  pointerId: number;
  groupIds: string[];
  grabOffsetY: number;
  width: number;
  height: number;
  left: number;
  label: string;
};

type PendingPointer = {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  groupIds: string[];
  label: string;
};

/**
 * Tree sidebar: Initiative → Prototype → pages.
 * Pointer-based reorder with a floating ghost and FLIP sibling motion.
 */
export default function PrototypesSidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
} = {}) {
  const location = useLocation();
  const entries = useMemo(() => listedPrototypes(), []);
  const [order, setOrder] = useState<string[]>(readStoredOrder);
  const [favorites, setFavorites] = useState<string[]>(readStoredFavorites);
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [drag, setDrag] = useState<DragSession | null>(null);
  const [floatTop, setFloatTop] = useState(0);
  const [orgTick, setOrgTick] = useState(0);

  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const flipFromTops = useRef(new Map<string, number>());
  const shouldFlip = useRef(false);
  const pendingRef = useRef<PendingPointer | null>(null);
  const dragRef = useRef<DragSession | null>(null);
  const orderRef = useRef(order);
  const entriesRef = useRef(entries);
  const suppressClickRef = useRef(false);
  const listeningRef = useRef(false);

  // Latest handler bodies — stable window listeners call through these.
  const moveBodyRef = useRef<(event: PointerEvent) => void>(() => {});
  const upBodyRef = useRef<(event: PointerEvent) => void>(() => {});
  const stableMove = useRef((event: PointerEvent) => {
    moveBodyRef.current(event);
  }).current;
  const stableUp = useRef((event: PointerEvent) => {
    upBodyRef.current(event);
  }).current;

  orderRef.current = order;
  dragRef.current = drag;
  entriesRef.current = entries;

  const groups = useMemo(() => {
    const base = buildOrganizedInitiativeGroups(entries);
    const favoriteIds = new Set(favorites);
    return base
      .map((group) => ({
        ...group,
        entries: applyOrder(
          group.entries.filter((entry) => !favoriteIds.has(entry.id)),
          order,
        ),
      }))
      .filter(
        (group) =>
          group.entries.length > 0 ||
          resolveInitiativeMeta(group.initiative).custom,
      );
  }, [entries, favorites, order, orgTick]);

  useEffect(() => {
    const refresh = () => setOrgTick((n) => n + 1);
    window.addEventListener(ORG_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(ORG_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const favoriteEntries = useMemo(() => {
    const byId = new Map(entries.map((entry) => [entry.id, entry]));
    return favorites
      .map((id) => byId.get(id))
      .filter((entry): entry is PrototypeEntry => entry != null);
  }, [entries, favorites]);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const activeEntry = useMemo(() => {
    const normalized =
      location.pathname.length > 1 && location.pathname.endsWith('/')
        ? location.pathname.slice(0, -1)
        : location.pathname;
    return entries.find((entry) => entry.path === normalized);
  }, [entries, location.pathname]);

  const [openInitiatives, setOpenInitiatives] = useState<Set<string>>(
    () =>
      new Set(
        activeEntry
          ? [resolveInitiativeId(activeEntry.id)]
          : groups[0]
            ? [groups[0].initiative]
            : [],
      ),
  );
  const [openPrototypes, setOpenPrototypes] = useState<Set<string>>(
    () => new Set(activeEntry ? [activeEntry.id] : []),
  );

  useEffect(() => {
    if (!activeEntry) return;
    const initiative = resolveInitiativeId(activeEntry.id);
    setOpenInitiatives((prev) => {
      if (prev.has(initiative)) return prev;
      const next = new Set(prev);
      next.add(initiative);
      return next;
    });
    setOpenPrototypes((prev) => {
      if (prev.has(activeEntry.id)) return prev;
      const next = new Set(prev);
      next.add(activeEntry.id);
      return next;
    });
  }, [activeEntry]);

  // Drop favorites that are no longer in the listed set.
  useEffect(() => {
    const valid = new Set(entries.map((entry) => entry.id));
    setFavorites((prev) => {
      const next = prev.filter((id) => valid.has(id));
      if (next.length === prev.length) return prev;
      writeStoredFavorites(next);
      return next;
    });
  }, [entries]);

  useLayoutEffect(() => {
    if (!shouldFlip.current) return;
    shouldFlip.current = false;

    const moving: HTMLLIElement[] = [];
    for (const [id, el] of itemRefs.current) {
      if (dragRef.current?.id === id) continue;
      const prevTop = flipFromTops.current.get(id);
      if (prevTop == null) continue;
      const nextTop = el.getBoundingClientRect().top;
      const dy = prevTop - nextTop;
      if (Math.abs(dy) < 0.5) continue;
      el.style.transition = 'none';
      el.style.transform = `translateY(${dy}px)`;
      moving.push(el);
    }

    void document.body.offsetHeight;

    requestAnimationFrame(() => {
      for (const el of moving) {
        el.style.transition =
          'transform var(--duration-moderate) var(--ease-transition)';
        el.style.transform = '';
      }
    });
  }, [order]);

  const stopListening = () => {
    if (!listeningRef.current) return;
    window.removeEventListener('pointermove', stableMove);
    window.removeEventListener('pointerup', stableUp);
    window.removeEventListener('pointercancel', stableUp);
    listeningRef.current = false;
  };

  const endDrag = () => {
    writeStoredOrder(orderRef.current);
    setDrag(null);
    pendingRef.current = null;
    dragRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    for (const el of itemRefs.current.values()) {
      el.style.transition = '';
      el.style.transform = '';
    }
    stopListening();
  };

  moveBodyRef.current = (event: PointerEvent) => {
    const pending = pendingRef.current;
    const active = dragRef.current;

    if (pending && !active) {
      if (event.pointerId !== pending.pointerId) return;
      const dx = event.clientX - pending.startX;
      const dy = event.clientY - pending.startY;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

      const el = itemRefs.current.get(pending.id);
      if (!el) {
        pendingRef.current = null;
        return;
      }
      const row = el.querySelector(
        `.${styles['proto-tree__proto-row']}`,
      ) as HTMLElement | null;
      const rect = (row ?? el).getBoundingClientRect();
      const session: DragSession = {
        id: pending.id,
        pointerId: pending.pointerId,
        groupIds: pending.groupIds,
        grabOffsetY: pending.startY - rect.top,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        label: pending.label,
      };
      pendingRef.current = null;
      suppressClickRef.current = true;
      dragRef.current = session;
      setDrag(session);
      setFloatTop(event.clientY - session.grabOffsetY);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      return;
    }

    if (!active || event.pointerId !== active.pointerId) return;
    event.preventDefault();
    setFloatTop(event.clientY - active.grabOffsetY);

    const mids: { mid: number; index: number }[] = [];
    active.groupIds.forEach((id, index) => {
      const node = itemRefs.current.get(id);
      if (!node) return;
      const rect = node.getBoundingClientRect();
      mids.push({ mid: rect.top + rect.height / 2, index });
    });
    if (mids.length === 0) return;

    let targetIndex = mids.length - 1;
    for (const item of mids) {
      if (event.clientY < item.mid) {
        targetIndex = item.index;
        break;
      }
    }

    const liveGroup = applyOrder(
      entriesRef.current.filter((entry) => active.groupIds.includes(entry.id)),
      orderRef.current,
    ).map((entry) => entry.id);
    const currentIndex = liveGroup.indexOf(active.id);
    if (currentIndex < 0 || currentIndex === targetIndex) return;

    const nextGroup = moveIdToIndex(liveGroup, active.id, targetIndex);
    if (nextGroup.join() === liveGroup.join()) return;

    flipFromTops.current.clear();
    for (const [id, node] of itemRefs.current) {
      flipFromTops.current.set(id, node.getBoundingClientRect().top);
    }
    shouldFlip.current = true;

    const other = orderRef.current.filter((id) => !active.groupIds.includes(id));
    const next = [...other, ...nextGroup];
    for (const entry of entriesRef.current) {
      if (!next.includes(entry.id)) next.push(entry.id);
    }
    setOrder(next);
  };

  upBodyRef.current = (event: PointerEvent) => {
    const pending = pendingRef.current;
    const active = dragRef.current;

    if (pending && event.pointerId === pending.pointerId) {
      pendingRef.current = null;
      stopListening();
      return;
    }
    if (active && event.pointerId === active.pointerId) {
      endDrag();
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount only
  }, []);

  const toggleInitiative = (initiative: string) => {
    setOpenInitiatives((prev) => {
      const next = new Set(prev);
      if (next.has(initiative)) next.delete(initiative);
      else next.add(initiative);
      return next;
    });
  };

  const togglePrototype = (id: string) => {
    if (dragRef.current) return;
    setOpenPrototypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [id, ...prev];
      writeStoredFavorites(next);
      return next;
    });
    setFavoritesOpen(true);
  };

  const onRowPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    entry: PrototypeEntry,
    groupIds: string[],
  ) => {
    if (event.button !== 0) return;

    pendingRef.current = {
      id: entry.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      groupIds,
      label: navLabel(entry),
    };

    if (!listeningRef.current) {
      window.addEventListener('pointermove', stableMove, { passive: false });
      window.addEventListener('pointerup', stableUp);
      window.addEventListener('pointercancel', stableUp);
      listeningRef.current = true;
    }
  };

  const setItemRef = (id: string, node: HTMLLIElement | null) => {
    if (node) itemRefs.current.set(id, node);
    else itemRefs.current.delete(id);
  };

  const renderPrototypeItem = (
    entry: PrototypeEntry,
    groupIds: string[],
    options: { draggable: boolean; refKey?: string } = { draggable: true },
  ) => {
    const pages = navPages(entry);
    const isDragging = options.draggable && drag?.id === entry.id;
    const protoOpen = openPrototypes.has(entry.id) && !isDragging;
    const protoActive = activeEntry?.id === entry.id;
    const isFavorite = favoriteSet.has(entry.id);
    const refKey = options.refKey ?? entry.id;

    return (
      <li
        key={refKey}
        ref={
          options.draggable
            ? (node) => setItemRef(entry.id, node)
            : undefined
        }
        className={[
          styles['proto-tree__proto'],
          isDragging ? styles['proto-tree__proto--placeholder'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={isDragging && drag ? { height: drag.height } : undefined}
      >
        <div className={styles['proto-tree__proto-shell']}>
          <button
            type="button"
            className={[
              styles['proto-tree__proto-row'],
              protoActive ? styles['proto-tree__proto-row--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-expanded={protoOpen}
            onPointerDown={
              options.draggable
                ? (event) => onRowPointerDown(event, entry, groupIds)
                : undefined
            }
            onClick={() => {
              if (suppressClickRef.current) {
                suppressClickRef.current = false;
                return;
              }
              togglePrototype(entry.id);
            }}
          >
            <span
              className={[
                styles['proto-tree__chevron'],
                styles['proto-tree__chevron--nested'],
                protoOpen ? styles['proto-tree__chevron--open'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden
            >
              <Icon size="12" glyph={<ChevronDownIcon />} />
            </span>
            <span className={styles['proto-tree__proto-label']}>
              {navLabel(entry)}
            </span>
          </button>
          <button
            type="button"
            className={[
              styles['proto-tree__favorite'],
              isFavorite ? styles['proto-tree__favorite--on'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={
              isFavorite
                ? `Remove ${navLabel(entry)} from favorites`
                : `Add ${navLabel(entry)} to favorites`
            }
            aria-pressed={isFavorite}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              toggleFavorite(entry.id);
            }}
          >
            <Icon
              size="14"
              glyph={isFavorite ? <StarIcon /> : <StarOutlineIcon />}
            />
          </button>
        </div>
        {protoOpen && (
          <ul className={styles['proto-tree__pages']}>
            {pages.map((page) => {
              const pageActive = isPrototypePageActive(
                entry,
                page,
                location.pathname,
                location.search,
              );
              return (
                <li key={page.id}>
                  <NavLink
                    to={prototypePageHref(entry, page)}
                    onClick={onNavigate}
                    className={() =>
                      [
                        styles['proto-tree__link'],
                        styles['proto-tree__link--page'],
                        pageActive ? styles['proto-tree__link--active'] : '',
                      ]
                        .filter(Boolean)
                        .join(' ')
                    }
                  >
                    {page.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav
      className={[
        styles['proto-tree'],
        drag ? styles['proto-tree--dragging'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Prototypes"
    >
      <ul className={styles['proto-tree__list']}>
        {favoriteEntries.length > 0 && (
          <li className={styles['proto-tree__initiative']}>
            <button
              type="button"
              className={styles['proto-tree__branch']}
              aria-expanded={favoritesOpen}
              onClick={() => setFavoritesOpen((open) => !open)}
            >
              <span
                className={[
                  styles['proto-tree__chevron'],
                  favoritesOpen ? styles['proto-tree__chevron--open'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden
              >
                <Icon size="12" glyph={<ChevronDownIcon />} />
              </span>
              <span className={styles['proto-tree__branch-label']}>
                Favorites
              </span>
              <span className={styles['proto-tree__count']}>
                {favoriteEntries.length}
              </span>
            </button>
            {favoritesOpen && (
              <ul className={styles['proto-tree__children']}>
                {favoriteEntries.map((entry) =>
                  renderPrototypeItem(entry, favorites, {
                    draggable: false,
                    refKey: `fav:${entry.id}`,
                  }),
                )}
              </ul>
            )}
          </li>
        )}

        {groups.map(({ initiative, entries: groupEntries }) => {
          const meta = resolveInitiativeMeta(initiative);
          const initiativeOpen = openInitiatives.has(initiative);
          const groupIds = groupEntries.map((entry) => entry.id);

          return (
            <li key={initiative} className={styles['proto-tree__initiative']}>
              <button
                type="button"
                className={styles['proto-tree__branch']}
                aria-expanded={initiativeOpen}
                onClick={() => toggleInitiative(initiative)}
              >
                <span
                  className={[
                    styles['proto-tree__chevron'],
                    initiativeOpen ? styles['proto-tree__chevron--open'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden
                >
                  <Icon size="12" glyph={<ChevronDownIcon />} />
                </span>
                <span className={styles['proto-tree__branch-label']}>
                  {meta.label}
                </span>
                <span className={styles['proto-tree__count']}>
                  {groupEntries.length}
                </span>
              </button>

              {initiativeOpen && (
                <ul className={styles['proto-tree__children']}>
                  {groupEntries.length === 0 ? (
                    <li className={styles['proto-tree__empty']}>
                      No prototypes yet
                    </li>
                  ) : (
                    groupEntries.map((entry) =>
                      renderPrototypeItem(entry, groupIds, { draggable: true }),
                    )
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {drag &&
        createPortal(
          <div
            className={styles['proto-tree__ghost']}
            style={{
              top: floatTop,
              left: drag.left,
              width: drag.width,
              height: drag.height,
            }}
          >
            <div className={styles['proto-tree__ghost-row']}>
              <span className={styles['proto-tree__ghost-chevron']} aria-hidden>
                <Icon size="12" glyph={<ChevronDownIcon />} />
              </span>
              <span className={styles['proto-tree__ghost-label']}>
                {drag.label}
              </span>
            </div>
          </div>,
          document.body,
        )}
    </nav>
  );
}
