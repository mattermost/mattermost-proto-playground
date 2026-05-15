import { useEffect, useMemo, useRef, useState } from 'react';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import Icon from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import type { UserSimulationRow } from './types';
import styles from './SimulateAccess.module.scss';

export interface SearchInputProps {
  selected: UserSimulationRow[];
  pool: UserSimulationRow[];
  onAdd: (user: UserSimulationRow) => void;
  maxUsers?: number;
  placeholder?: string;
}

const HARD_CAP = 20;

export default function SearchInput({
  selected,
  pool,
  onAdd,
  maxUsers = HARD_CAP,
  placeholder = 'Search and add users',
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedIds = useMemo(() => new Set(selected.map((u) => u.userId)), [selected]);
  const atCap = selected.length >= maxUsers;

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool
      .filter((u) => !selectedIds.has(u.userId))
      .filter((u) =>
        q === '' || u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [pool, query, selectedIds]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function add(user: UserSimulationRow) {
    if (atCap) return;
    onAdd(user);
    setQuery('');
    inputRef.current?.focus();
    // Stay open so admin can keep adding multiple users without re-clicking.
    setOpen(true);
  }

  return (
    <div className={styles['sa-search']} ref={containerRef}>
      <span className={styles['sa-search__icon']} aria-hidden>
        <Icon glyph={<MagnifyIcon />} size="16" />
      </span>
      <input
        ref={inputRef}
        className={styles['sa-search__input']}
        placeholder={atCap ? `${maxUsers}-user limit reached` : placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
          if (e.key === 'Enter' && suggestions.length > 0) {
            e.preventDefault();
            add(suggestions[0]);
          }
        }}
        disabled={atCap}
        aria-label="Search and add users"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {atCap && <span className={styles['sa-search__cap']}>Max {maxUsers}</span>}
      {open && !atCap && (
        <div className={styles['sa-search__suggestions']} role="listbox">
          {suggestions.length === 0 ? (
            <div className={styles['sa-search__suggestion-empty']}>
              {query.trim() === '' ? 'Start typing to search users' : 'No matching users'}
            </div>
          ) : (
            suggestions.map((u) => (
              <div
                key={u.userId}
                className={styles['sa-search__suggestion']}
                role="option"
                tabIndex={0}
                onMouseDown={(e) => { e.preventDefault(); add(u); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    add(u);
                  }
                }}
              >
                <UserAvatar src={u.avatarSrc} alt={u.name} size="24" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className={styles['sa-search__suggestion-name']}>{u.name}</span>
                  <span className={styles['sa-search__suggestion-handle']}>@{u.handle}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
