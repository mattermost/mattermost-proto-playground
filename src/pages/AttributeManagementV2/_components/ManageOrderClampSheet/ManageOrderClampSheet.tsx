import { useEffect, useState } from 'react';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import ArrowUpIcon from '@mattermost/compass-icons/components/arrow-up';
import ArrowDownIcon from '@mattermost/compass-icons/components/arrow-down';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import SideSheet from '../SideSheet/SideSheet';
import { type Attribute, type ValueOption } from '../../data';
import styles from './ManageOrderClampSheet.module.scss';

export interface ManageOrderClampSheetProps {
  open: boolean;
  attribute: Attribute;
  onClose: () => void;
  /** Persist the edited values back to page state. */
  onSave?: (values: ValueOption[]) => void;
  /** Open the in-use policy dry-run (the "Review policies" link). */
  onReviewPolicies?: () => void;
}

/**
 * "Manage values & order" editor (renamed from "Manage order & clamp").
 *
 * Two modes, decided by whether the attribute is used by active policies:
 *   - Locked (Classification): read-only with a lock banner + "Review policies".
 *   - Editable (Mission tag): add, rename, reorder, delete — all working.
 *
 * Ranked types renumber automatically by position; the meaningless
 * "Clamp window" readout is gone. The ceiling rule lives on the
 * Channels→Posts inheritance control, not here.
 */
export default function ManageOrderClampSheet({
  open,
  attribute,
  onClose,
  onSave,
  onReviewPolicies,
}: ManageOrderClampSheetProps) {
  const locked = attribute.inUseByPolicies > 0;
  const isRanked = attribute.type === 'Ranked';

  const [draft, setDraft] = useState<ValueOption[]>(() =>
    [...attribute.values].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)),
  );
  const [newLabel, setNewLabel] = useState('');

  // Re-seed when the attribute changes (e.g. switching which sheet is open).
  useEffect(() => {
    setDraft(
      [...attribute.values].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)),
    );
    setNewLabel('');
  }, [attribute.id, attribute.values]);

  const renumber = (list: ValueOption[]): ValueOption[] =>
    list.map((v, i) => ({ ...v, rank: isRanked ? i : v.rank }));

  const move = (index: number, dir: -1 | 1) => {
    const next = [...draft];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(renumber(next));
  };

  const rename = (id: string, label: string) =>
    setDraft((prev) => prev.map((v) => (v.id === id ? { ...v, label } : v)));

  const remove = (id: string) =>
    setDraft((prev) => renumber(prev.filter((v) => v.id !== id)));

  const add = () => {
    const label = newLabel.trim();
    if (!label) return;
    setDraft((prev) =>
      renumber([...prev, { id: `v-${Date.now()}`, label }]),
    );
    setNewLabel('');
  };

  return (
    <SideSheet
      open={open}
      title="Manage values & order"
      onClose={onClose}
      footer={
        locked ? (
          <Button emphasis="Tertiary" onClick={onClose}>
            Close
          </Button>
        ) : (
          <>
            <Button emphasis="Tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button emphasis="Primary" onClick={() => onSave?.(draft)}>
              Save
            </Button>
          </>
        )
      }
    >
      <div className={styles['sheet']}>
        {locked ? (
          <div className={styles['sheet__lock']}>
            <span className={styles['sheet__lock-icon']} aria-hidden>
              <LockOutlineIcon size={18} />
            </span>
            <div className={styles['sheet__lock-text']}>
              <p className={styles['sheet__lock-title']}>Locked</p>
              <p className={styles['sheet__lock-body']}>
                {attribute.name} is used by {attribute.inUseByPolicies} active
                access {attribute.inUseByPolicies === 1 ? 'policy' : 'policies'}.
                Changing the order or values would re-evaluate access across
                every channel and post that relies on it.
              </p>
              <button
                type="button"
                className={styles['sheet__lock-link']}
                onClick={onReviewPolicies}
              >
                Review policies
              </button>
            </div>
          </div>
        ) : (
          <p className={styles['sheet__intro']}>
            {isRanked
              ? 'Drag to reorder. A higher position outranks a lower one.'
              : 'Reorder, rename, add, or remove values.'}
          </p>
        )}

        <div className={styles['sheet__list']}>
          {draft.map((v, i) => (
            <div
              key={v.id}
              className={`${styles['sheet__row']} ${locked ? styles['sheet__row--locked'] : ''}`}
            >
              <span className={styles['sheet__handle']} aria-hidden>
                <DragVerticalIcon size={16} />
              </span>
              {isRanked && (
                <span className={styles['sheet__rank']}>{i + 1}</span>
              )}
              {locked ? (
                <span className={styles['sheet__label-static']}>{v.label}</span>
              ) : (
                <input
                  className={styles['sheet__label-input']}
                  value={v.label}
                  aria-label={`Rename ${v.label}`}
                  onChange={(e) => rename(v.id, e.target.value)}
                />
              )}
              {!locked && (
                <div className={styles['sheet__row-actions']}>
                  <button
                    type="button"
                    className={styles['sheet__icon-btn']}
                    aria-label={`Move ${v.label} up`}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUpIcon size={14} />
                  </button>
                  <button
                    type="button"
                    className={styles['sheet__icon-btn']}
                    aria-label={`Move ${v.label} down`}
                    disabled={i === draft.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDownIcon size={14} />
                  </button>
                  <button
                    type="button"
                    className={`${styles['sheet__icon-btn']} ${styles['sheet__icon-btn--danger']}`}
                    aria-label={`Delete ${v.label}`}
                    onClick={() => remove(v.id)}
                  >
                    <TrashCanOutlineIcon size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {!locked && (
          <div className={styles['sheet__add']}>
            <TextInput
              value={newLabel}
              placeholder="Add a value"
              aria-label="New value label"
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  add();
                }
              }}
            />
            <Button
              emphasis="Secondary"
              size="Small"
              leadingIcon={<Icon glyph={<PlusIcon />} size="16" />}
              onClick={add}
              disabled={newLabel.trim().length === 0}
            >
              Add value
            </Button>
          </div>
        )}
      </div>
    </SideSheet>
  );
}
