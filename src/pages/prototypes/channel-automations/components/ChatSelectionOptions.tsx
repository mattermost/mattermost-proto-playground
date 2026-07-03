import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import type { AutomationChannelType } from '../channelAutomationsData';
import type { ChatScriptOption } from './automationChatScript';
import styles from './ChatSelectionOptions.module.scss';

function channelLeadingVisual(channelType: AutomationChannelType) {
  return (
    <Icon
      size="16"
      glyph={
        channelType === 'private' ? <LockOutlineIcon /> : <GlobeIcon />
      }
    />
  );
}

export interface ChatSelectionOptionsProps {
  title: string;
  options: ChatScriptOption[];
  onAccept: (option: ChatScriptOption) => void;
  onSkip?: () => void;
  ariaLabel?: string;
  className?: string;
  variant?: 'list' | 'autocomplete';
  selectLabel?: string;
}

export default function ChatSelectionOptions({
  title,
  options,
  onAccept,
  onSkip,
  ariaLabel = 'Choose an option',
  className = '',
  variant = 'list',
  selectLabel = 'Choose',
}: ChatSelectionOptionsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectableOptions = useMemo(
    () => options.filter((option) => !option.muted),
    [options],
  );

  const selected = selectableOptions.find((o) => o.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return selectableOptions;
    return selectableOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(normalized) ||
        option.id.toLowerCase().includes(normalized),
    );
  }, [query, selectableOptions]);

  const updateMenuPosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!open || variant !== 'autocomplete') return;

    updateMenuPosition();

    const handleReposition = () => updateMenuPosition();
    window.addEventListener('resize', handleReposition);
    document.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      document.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, variant, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClose(event: MouseEvent) {
      const target = event.target as Node;
      if (
        anchorRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener('mousedown', handleOutsideClose);
    return () => document.removeEventListener('mousedown', handleOutsideClose);
  }, [open]);

  const canAccept = selected != null;

  const statusLabel = selected ? 'Answer selected' : '\u00a0';

  const handleAccept = () => {
    if (!selected) return;
    onAccept(selected);
  };

  const pickOption = (option: ChatScriptOption) => {
    setSelectedId(option.id);
    setQuery(option.label);
    setOpen(false);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setOpen(true);

    const normalized = value.trim().toLowerCase();
    const exact = selectableOptions.find(
      (option) =>
        option.label.toLowerCase() === normalized ||
        option.id.toLowerCase() === normalized,
    );
    setSelectedId(exact?.id ?? null);
  };

  const rootClass = [
    styles['selection'],
    open && variant === 'autocomplete' ? styles['selection--menu-open'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const autocompleteMenu =
    open && variant === 'autocomplete' ? (
      <div
        ref={menuRef}
        className={styles['selection__autocomplete-portal']}
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
          width: menuPosition.width,
        }}
      >
        <PopoverMenu
          id={listboxId}
          className={styles['selection__autocomplete-menu']}
          role="listbox"
          aria-label={ariaLabel}
        >
          {filtered.length === 0 ? (
            <p className={styles['selection__autocomplete-empty']}>
              No channels found
            </p>
          ) : (
            filtered.map((option) => (
              <MenuItem
                key={option.id}
                label={option.label}
                active={option.id === selectedId}
                trailingElement={option.id === selectedId}
                leadingVisual={
                  option.channelType
                    ? channelLeadingVisual(option.channelType)
                    : undefined
                }
                onClick={() => pickOption(option)}
              />
            ))
          )}
        </PopoverMenu>
      </div>
    ) : null;

  return (
    <div
      className={rootClass}
      role="group"
      aria-label={ariaLabel}
    >
      <div className={styles['selection__body']}>
        <p className={styles['selection__title']}>{title}</p>

        {variant === 'autocomplete' ? (
          <div className={styles['selection__autocomplete']}>
            <div ref={anchorRef} className={styles['selection__autocomplete-anchor']}>
              <SearchInput
              className={styles['selection__autocomplete-input']}
              size="Medium"
              label={selectLabel}
              placeholder="Search channels"
              value={query}
              autoComplete="off"
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              onFocus={() => {
                setOpen(true);
                updateMenuPosition();
              }}
              onChange={(e) => handleQueryChange(e.target.value)}
              onClear={() => {
                setQuery('');
                setSelectedId(null);
                setOpen(true);
                updateMenuPosition();
              }}
            />
            </div>
          </div>
        ) : (
          <div className={styles['selection__list']} role="listbox" aria-label={ariaLabel}>
            {options.map((option, index) => {
              const isSelected = option.id === selectedId;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    styles['selection__option'],
                    isSelected ? styles['selection__option--selected'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setSelectedId(option.id)}
                >
                  <span
                    className={[
                      styles['selection__badge'],
                      isSelected ? styles['selection__badge--selected'] : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <span
                    className={[
                      styles['selection__label'],
                      option.muted ? styles['selection__label--muted'] : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles['selection__footer']}>
        <p className={styles['selection__status']}>{statusLabel}</p>
        <div className={styles['selection__actions']}>
          {onSkip ? (
            <Button size="Small" emphasis="Secondary" onClick={onSkip}>
              Skip
            </Button>
          ) : null}
          <Button
            size="Small"
            emphasis="Primary"
            disabled={!canAccept}
            onClick={handleAccept}
          >
            Accept
          </Button>
        </div>
      </div>
      {typeof document !== 'undefined' && autocompleteMenu
        ? createPortal(autocompleteMenu, document.body)
        : null}
    </div>
  );
}
