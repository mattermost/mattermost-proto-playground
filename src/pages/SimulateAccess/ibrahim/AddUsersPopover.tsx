import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import Icon from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import type { UserSimulationRow } from '../shared/types';
import styles from './IbrahimVariant.module.scss';

export interface AddUsersPopoverProps {
  triggerRect: DOMRect;
  selected: UserSimulationRow[];
  pool: UserSimulationRow[];
  onAdd: (user: UserSimulationRow) => void;
  onClose: () => void;
}

export default function AddUsersPopover({
  triggerRect,
  selected,
  pool,
  onAdd,
  onClose,
}: AddUsersPopoverProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });

  const selectedIds = useMemo(() => new Set(selected.map((u) => u.userId)), [selected]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool
      .filter((u) => !selectedIds.has(u.userId))
      .filter((u) => q === '' || u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q));
  }, [pool, query, selectedIds]);

  // Anchor the popover under the "+ Add users" button, right-aligned with it.
  useLayoutEffect(() => {
    if (!ref.current) return;
    const w = ref.current.offsetWidth;
    const h = ref.current.offsetHeight;
    let top = triggerRect.bottom + 6;
    let left = triggerRect.right - w;
    if (left < 8) left = 8;
    if (top + h > window.innerHeight - 8) top = triggerRect.top - h - 6;
    if (top < 8) top = 8;
    setPos({ top, left });
  }, [triggerRect]);

  // Outside click + escape close
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    document.addEventListener('keydown', key);
    inputRef.current?.focus();
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', key);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={styles['iv-add-popover']}
      style={{ top: pos.top, left: pos.left }}
      role="dialog"
      aria-label="Add users"
    >
      <div className={styles['iv-add-popover__input-wrap']}>
        <div className={styles['iv-add-popover__input']}>
          <Icon glyph={<MagnifyIcon />} size="16" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users"
          />
        </div>
      </div>
      <div className={styles['iv-add-popover__list']}>
        {matches.length === 0 ? (
          <div className={styles['iv-add-popover__empty']}>No matching users</div>
        ) : (
          matches.map((u) => (
            <button
              type="button"
              key={u.userId}
              className={styles['iv-add-popover__item']}
              onClick={() => {
                onAdd(u);
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              <UserAvatar src={u.avatarSrc} alt={u.name} size="24" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles['iv-add-popover__item-name']}>{u.name}</span>
                <span className={styles['iv-add-popover__item-meta']}>
                  @{u.handle} · user-{u.userId.slice(-2)}@sample.mattermost.com
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
