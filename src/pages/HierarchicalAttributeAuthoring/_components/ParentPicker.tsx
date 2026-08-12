import { useMemo, useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import TextInput from '@/components/ui/TextInput/TextInput';
import PopoverMenu, {
  PopoverMenuScroll,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import {
  labelOf,
  validateAddParent,
  type GraphOption,
  type ParentRejection,
} from '../graphModel';
import styles from './ParentPicker.module.scss';

interface ParentPickerProps {
  options: GraphOption[];
  childId: string;
  parentIds: string[];
  readOnly?: boolean;
  /** Pre-seeded rejection (deep-linked validation-rejected state). */
  seededRejection?: ParentRejection | null;
  onChange: (nextParentIds: string[]) => void;
}

export default function ParentPicker({
  options,
  childId,
  parentIds,
  readOnly = false,
  seededRejection = null,
  onChange,
}: ParentPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rejection, setRejection] = useState<ParentRejection | null>(
    seededRejection,
  );
  const anchorRef = useRef<HTMLButtonElement>(null);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options
      .filter((o) => o.id !== childId && !parentIds.includes(o.id))
      .filter((o) => (q ? o.label.toLowerCase().includes(q) : true))
      .map((o) => ({
        option: o,
        rejection: validateAddParent(options, childId, o.id),
      }));
  }, [options, childId, parentIds, query]);

  const commit = (parentId: string) => {
    const r = validateAddParent(options, childId, parentId);
    if (r) {
      // Fallback validation on commit — reject inline, no partial change (FR-A5).
      setRejection(r);
      return;
    }
    setRejection(null);
    onChange([...parentIds, parentId]);
    setQuery('');
    setOpen(false);
  };

  const remove = (parentId: string) => {
    setRejection(null);
    onChange(parentIds.filter((p) => p !== parentId));
  };

  return (
    <div className={styles['parent-picker']}>
      <div className={styles['parent-picker__chips']}>
        {parentIds.length === 0 ? (
          <span className={styles['parent-picker__root']}>Root (no parent)</span>
        ) : (
          parentIds.map((pid) => (
            <Chip
              key={pid}
              size="Small"
              tone="info"
              onRemove={readOnly ? undefined : () => remove(pid)}
              removeLabel={`Remove parent ${labelOf(options, pid)}`}
            >
              {labelOf(options, pid)}
            </Chip>
          ))
        )}

        {readOnly ? (
          <span className={styles['parent-picker__readonly']}>
            <Icon size="12" glyph={<LockOutlineIcon />} />
            Inherited
          </span>
        ) : (
          <button
            ref={anchorRef}
            type="button"
            className={styles['parent-picker__add']}
            aria-label={`Add parent to ${labelOf(options, childId)}`}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon size="12" glyph={<PlusIcon />} />
            Add parent
          </button>
        )}
      </div>

      {rejection && (
        <div
          className={styles['parent-picker__rejection']}
          role="alert"
          data-kind={rejection.kind}
        >
          <Icon size="12" glyph={<AlertCircleOutlineIcon />} />
          <span>{rejection.message}</span>
        </div>
      )}

      <FixedPopoverMenu
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        minWidthFloor={320}
      >
        <PopoverMenu>
          <div className={styles['parent-picker__search']}>
            <TextInput
              size="Small"
              value={query}
              placeholder="Search options…"
              leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <PopoverMenuScroll maxHeight={280}>
            {candidates.length === 0 ? (
              <div className={styles['parent-picker__empty']}>
                No matching options
              </div>
            ) : (
              candidates.map(({ option, rejection: rej }) => (
                <MenuItem
                  key={option.id}
                  label={option.label}
                  secondaryLabel={
                    rej
                      ? rej.kind === 'cycle'
                        ? 'Would create a loop'
                        : rej.kind === 'depth'
                          ? 'Exceeds depth 100'
                          : 'Parent limit reached'
                      : undefined
                  }
                  secondaryLabelPosition="Inline"
                  destructive={!!rej}
                  onClick={() => commit(option.id)}
                />
              ))
            )}
          </PopoverMenuScroll>
        </PopoverMenu>
      </FixedPopoverMenu>
    </div>
  );
}
