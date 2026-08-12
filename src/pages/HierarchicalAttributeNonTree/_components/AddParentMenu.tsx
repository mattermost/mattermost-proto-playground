import { useMemo, useState } from 'react';
import type { RefObject } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import { descendantsOf, type GraphOption } from '../nonTreeModel';
import styles from './AddParentMenu.module.scss';

export interface AddParentMenuProps {
  option: GraphOption;
  allOptions: GraphOption[];
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  /** Returns a rejection message (cycle/limit) or null on success. */
  onAddParent: (parentId: string) => string | null;
}

/**
 * Shared chip-picker for adding one parent edge. The candidate list EXCLUDES
 * self, all descendants (so a cycle is literally unselectable), and options that
 * are already parents. The commit path still re-checks fail-closed via the
 * caller's `onAddParent`. Used by the lineage table and the node-link list — the
 * matrix authors edges directly by toggling cells, so it does not use this menu.
 */
export default function AddParentMenu({
  option,
  allOptions,
  anchorRef,
  onClose,
  onAddParent,
}: AddParentMenuProps) {
  const [query, setQuery] = useState('');
  const [rejection, setRejection] = useState<string | null>(null);

  const candidates = useMemo(() => {
    const blocked = descendantsOf(allOptions, option.id);
    const q = query.trim().toLowerCase();
    return allOptions.filter(
      (o) =>
        o.id !== option.id &&
        !blocked.has(o.id) &&
        !option.parentIds.includes(o.id) &&
        (q === '' || o.label.toLowerCase().includes(q)),
    );
  }, [allOptions, option.id, option.parentIds, query]);

  const pick = (parentId: string) => {
    const err = onAddParent(parentId);
    if (err) {
      setRejection(err);
      return;
    }
    onClose();
  };

  return (
    <FixedPopoverMenu open onClose={onClose} anchorRef={anchorRef} minWidthFloor={260}>
      <div className={styles['picker']}>
        <div className={styles['picker__search']}>
          <TextInput
            size="Small"
            value={query}
            placeholder="Find a parent…"
            aria-label="Find a parent"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {rejection && (
          <div className={styles['picker__reject']} role="alert">
            <Icon size="16" glyph={<AlertOutlineIcon />} />
            <span>{rejection}</span>
          </div>
        )}

        <div className={styles['picker__list']}>
          {candidates.length === 0 ? (
            <p className={styles['picker__empty']}>
              No eligible parents. An option can’t be linked under itself or under
              one of its own children.
            </p>
          ) : (
            candidates.map((c) => (
              <button
                key={c.id}
                type="button"
                className={styles['picker__item']}
                onClick={() => pick(c.id)}
              >
                <Icon size="16" glyph={<PlusIcon />} />
                <span className={styles['picker__item-label']}>{c.label}</span>
              </button>
            ))
          )}
        </div>
        <p className={styles['picker__note']}>
          Options below this one aren’t listed — a parent can’t be one of its own
          descendants.
        </p>
      </div>
    </FixedPopoverMenu>
  );
}
