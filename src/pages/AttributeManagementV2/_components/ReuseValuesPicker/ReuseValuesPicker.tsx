import { useMemo, useState } from 'react';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import SideSheet from '../SideSheet/SideSheet';
import DisabledControl from '../DisabledControl/DisabledControl';
import {
  type Attribute,
  DISABLED_REASONS,
  isMirroring,
} from '../../data';
import styles from './ReuseValuesPicker.module.scss';

export interface ReuseValuesPickerProps {
  open: boolean;
  /** The attribute doing the reusing (excluded from the list). */
  currentId: string;
  attributes: Attribute[];
  onClose: () => void;
  onPick: (siblingId: string) => void;
}

/**
 * Picker for "Reuse values from…" (§5 step 1). Lists existing attributes whose
 * schema can be mirrored — name · type · value count (or "restricted" when the
 * source is external). Search filters the list.
 *
 * Chains are blocked (§5 step 5): an attribute that itself mirrors a third is
 * shown disabled with the consistent disabled treatment + WHY tooltip.
 */
export default function ReuseValuesPicker({
  open,
  currentId,
  attributes,
  onClose,
  onPick,
}: ReuseValuesPickerProps) {
  const [query, setQuery] = useState('');

  const candidates = useMemo(
    () =>
      attributes.filter(
        (a) =>
          a.id !== currentId &&
          (a.type === 'Ranked' ||
            a.type === 'Select' ||
            a.type === 'Multiselect' ||
            a.type === 'Hierarchical'),
      ),
    [attributes, currentId],
  );

  const filtered = candidates.filter((a) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q);
  });

  function valueSummary(a: Attribute): string {
    if (a.restrictedValues) return 'Restricted';
    return `${a.values.length} value${a.values.length === 1 ? '' : 's'}`;
  }

  return (
    <SideSheet open={open} title="Reuse values from…" onClose={onClose}>
      <div className={styles['picker']}>
        <p className={styles['picker__intro']}>
          Pick an attribute to mirror. This attribute’s values and order stay
          in sync with it.
        </p>

        <TextInput
          value={query}
          placeholder="Search attributes"
          aria-label="Search attributes"
          leadingIcon={<Icon glyph={<MagnifyIcon />} size="16" />}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className={styles['picker__list']}>
          {filtered.length === 0 ? (
            <p className={styles['picker__empty']}>
              No attributes match “{query}”.
            </p>
          ) : (
            filtered.map((a) => {
              const isChain = isMirroring(a);
              if (isChain) {
                return (
                  <div
                    key={a.id}
                    className={`${styles['picker__row']} ${styles['picker__row--disabled']}`}
                  >
                    <DisabledControl
                      reason={DISABLED_REASONS.reuseChainBlocked}
                      glyph="info"
                    >
                      <span className={styles['picker__row-main']}>
                        <span className={styles['picker__row-name']}>
                          {a.name}
                        </span>
                        <span className={styles['picker__row-meta']}>
                          {a.type} · {valueSummary(a)}
                        </span>
                      </span>
                    </DisabledControl>
                  </div>
                );
              }
              return (
                <button
                  key={a.id}
                  type="button"
                  className={styles['picker__row']}
                  onClick={() => onPick(a.id)}
                >
                  <span className={styles['picker__row-main']}>
                    <span className={styles['picker__row-name']}>{a.name}</span>
                    <span className={styles['picker__row-meta']}>
                      {a.type} · {valueSummary(a)}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </SideSheet>
  );
}
