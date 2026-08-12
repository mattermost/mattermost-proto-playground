import { useMemo, useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import TextInput from '@/components/ui/TextInput/TextInput';
import PopoverMenu, {
  PopoverMenuScroll,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import { labelOf, type GraphOption } from '../graphModel';
import styles from './OptionTokenSelect.module.scss';

interface OptionTokenSelectProps {
  options: GraphOption[];
  selectedIds: string[];
  label: string;
  addLabel: string;
  onChange: (ids: string[]) => void;
}

/** Searchable multi-select over the Option pool. Used by the reachability test. */
export default function OptionTokenSelect({
  options,
  selectedIds,
  label,
  addLabel,
  onChange,
}: OptionTokenSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const anchorRef = useRef<HTMLButtonElement>(null);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options
      .filter((o) => !selectedIds.includes(o.id))
      .filter((o) => (q ? o.label.toLowerCase().includes(q) : true));
  }, [options, selectedIds, query]);

  return (
    <div className={styles['token-select']}>
      <span className={styles['token-select__label']}>{label}</span>
      <div className={styles['token-select__chips']}>
        {selectedIds.map((id) => (
          <Chip
            key={id}
            size="Small"
            tone="neutral"
            onRemove={() => onChange(selectedIds.filter((s) => s !== id))}
            removeLabel={`Remove ${labelOf(options, id)}`}
          >
            {labelOf(options, id)}
          </Chip>
        ))}
        <button
          ref={anchorRef}
          type="button"
          className={styles['token-select__add']}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon size="12" glyph={<PlusIcon />} />
          {addLabel}
        </button>
      </div>

      <FixedPopoverMenu
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        minWidthFloor={300}
      >
        <PopoverMenu>
          <div className={styles['token-select__search']}>
            <TextInput
              size="Small"
              value={query}
              placeholder="Search options…"
              leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <PopoverMenuScroll maxHeight={260}>
            {candidates.length === 0 ? (
              <div className={styles['token-select__empty']}>
                No matching options
              </div>
            ) : (
              candidates.map((o) => (
                <MenuItem
                  key={o.id}
                  label={o.label}
                  onClick={() => {
                    onChange([...selectedIds, o.id]);
                    setQuery('');
                  }}
                />
              ))
            )}
          </PopoverMenuScroll>
        </PopoverMenu>
      </FixedPopoverMenu>
    </div>
  );
}
