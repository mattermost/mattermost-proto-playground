import { useId, useState } from 'react';
import DragIcon from '@mattermost/compass-icons/components/drag-vertical';
import ArrowUpIcon from '@mattermost/compass-icons/components/arrow-up';
import ArrowDownIcon from '@mattermost/compass-icons/components/arrow-down';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Modal from '@/components/ui/Modal/Modal';
import SchemaProvenanceRibbon from '@/components/ui/SchemaProvenanceRibbon/SchemaProvenanceRibbon';
import TextInput from '@/components/ui/TextInput/TextInput';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import type { RankedSchema, RankedValue } from '../shared/types';
import { nextRank, sortByRankDesc, usedRanks } from '../shared/types';
import styles from './RankedSchemaModal.module.scss';

interface RankedSchemaModalProps {
  schema: RankedSchema;
  open: boolean;
  /** Attribute-level policy reference count (drives hard-block on deletes). */
  policyCount?: number;
  onClose: () => void;
  onSave: (next: RankedSchema) => void;
}

/**
 * D1's full-schema modal — the deep-edit surface (Q5-C5 layered model).
 *
 * 2026-05-22 PM+Eng sync updates:
 *  - Ranks must be unique, explicit, and >= 1. Collisions and zero/empty
 *    are rejected with an inline error; the input reverts on blur.
 *  - Ties removed — `groupByTiedBand` no longer used. Rows render flat,
 *    sorted by rank descending.
 *  - Color descoped — color dot column removed.
 *  - Per-value remove is hard-blocked when the attribute is referenced by
 *    one or more active policies (disabled IconButton + tooltip).
 *  - Compare / Sync tabs removed — they were prototype artifacts (confirmed
 *    in the sync at 00:09:17). Only the Edit values view remains.
 *
 * Drag-to-reorder remains the primary reorder primitive; arrow stepper and
 * numeric rank field are the keyboard equivalents (WCAG 2.5.7).
 */
export default function RankedSchemaModal({
  schema,
  open,
  policyCount = 0,
  onClose,
  onSave,
}: RankedSchemaModalProps) {
  const [values, setValues] = useState<RankedValue[]>(() =>
    sortByRankDesc(schema.values),
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  /** Per-value inline error keyed by value id (rank validation feedback). */
  const [rankErrors, setRankErrors] = useState<Record<string, string>>({});
  const removeBlockedDescId = useId();

  if (!open) return null;

  const isUas = schema.source === 'uas';
  const deleteBlocked = policyCount > 0;
  const deleteBlockedMessage = `Used in ${policyCount} ${policyCount === 1 ? 'policy' : 'policies'}; cannot delete.`;

  function moveByOne(idx: number, dir: -1 | 1) {
    setValues((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      // Re-derive ranks from position: top of list = max(rank), descending.
      // This preserves uniqueness because positions are unique.
      const top = next.length;
      return next.map((v, i) => ({ ...v, rank: top - i }));
    });
    setRankErrors({});
  }

  function setRankExact(valueId: string, raw: string) {
    const parsed = Number(raw);
    setValues((prev) => prev); // no-op; we only validate on blur below

    // Validate: must be a positive integer not already used by another value.
    if (raw === '' || !Number.isFinite(parsed) || parsed < 1) {
      setRankErrors((prev) => ({
        ...prev,
        [valueId]: 'Rank must be 1 or higher.',
      }));
      return;
    }
    if (usedRanks(values, valueId).has(parsed)) {
      setRankErrors((prev) => ({
        ...prev,
        [valueId]: `Rank ${parsed} is already in use.`,
      }));
      return;
    }
    // Valid: clear error and commit.
    setRankErrors((prev) => {
      const next = { ...prev };
      delete next[valueId];
      return next;
    });
    setValues((prev) =>
      sortByRankDesc(
        prev.map((v) => (v.id === valueId ? { ...v, rank: parsed } : v)),
      ),
    );
  }

  function addValue() {
    const newRank = nextRank(values);
    setValues((prev) =>
      sortByRankDesc([
        ...prev,
        {
          id: `new-${Date.now()}`,
          label: 'New value',
          rank: newRank,
        },
      ]),
    );
    setRankErrors({});
  }

  function removeValue(idx: number) {
    if (deleteBlocked) return;
    setValues((prev) => prev.filter((_, i) => i !== idx));
    setRankErrors({});
  }

  function handleDragStart(idx: number) {
    setDragIndex(idx);
  }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setOverIndex(idx);
  }
  function handleDrop(idx: number) {
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    setValues((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(idx, 0, moved);
      // Re-derive ranks from new positions; uniqueness preserved.
      const top = next.length;
      return next.map((v, i) => ({ ...v, rank: top - i }));
    });
    setDragIndex(null);
    setOverIndex(null);
    setRankErrors({});
  }

  const saveDisabled = isUas || Object.keys(rankErrors).length > 0;

  return (
    <div className={styles['rsm-backdrop']} onClick={onClose}>
      <div
        className={styles['rsm-wrap']}
        onClick={(e) => e.stopPropagation()}
      >
        <Modal
          size="Medium"
          title={schema.attributeName}
          subtitle="Ranked Attribute"
          onClose={onClose}
          footer={
            <>
              <Button emphasis="Tertiary" size="Medium" onClick={onClose}>
                Cancel
              </Button>
              <Button
                emphasis="Primary"
                size="Medium"
                onClick={() =>
                  onSave({
                    ...schema,
                    values,
                    version: schema.version + 1,
                  })
                }
                disabled={saveDisabled}
              >
                {isUas ? 'Read-only' : `Save (v${schema.version + 1})`}
              </Button>
            </>
          }
        >
          <div className={styles['rsm']}>
            {isUas && schema.provenance && (
              <SchemaProvenanceRibbon
                source={schema.provenance.pluginName}
                lastSyncRelative={schema.provenance.lastSyncRelative}
                lastSyncAbsolute={schema.provenance.lastSyncAbsolute}
                lastKnownGoodRelative={schema.provenance.lastKnownGoodRelative}
                lastKnownGoodAbsolute={schema.provenance.lastKnownGoodAbsolute}
                syncState="fresh"
              />
            )}

            <div className={styles['rsm__hint']}>
              Top of list = highest rank. Drag to reorder, or use the arrow
              steppers / rank field (all three are keyboard-equivalent per{' '}
              <code className={styles['rsm__code']}>WCAG 2.5.7</code>). Ranks
              must be unique and at least 1.
            </div>

            <div className={styles['rsm__list']} role="list">
              {values.map((v, idx) => {
                const rowError = rankErrors[v.id];
                return (
                  <div
                    key={v.id}
                    className={[
                      styles['rsm__row-wrap'],
                      overIndex === idx && styles['rsm__row-wrap--drop-target'],
                      dragIndex === idx && styles['rsm__row-wrap--dragging'],
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    role="listitem"
                    draggable={!isUas}
                    onDragStart={() => !isUas && handleDragStart(idx)}
                    onDragOver={(e) => !isUas && handleDragOver(e, idx)}
                    onDrop={() => !isUas && handleDrop(idx)}
                  >
                    <div className={styles['rsm__row']}>
                      <span
                        className={styles['rsm__drag']}
                        aria-hidden="true"
                        title={
                          isUas
                            ? 'Locked — UAS-sourced'
                            : 'Drag to reorder'
                        }
                      >
                        <Icon size="16" glyph={<DragIcon />} />
                      </span>

                      <div className={styles['rsm__label-cell']}>
                        <TextInput
                          size="Small"
                          value={v.label}
                          onChange={(e) => {
                            const label = e.target.value;
                            setValues((prev) =>
                              prev.map((x) =>
                                x.id === v.id ? { ...x, label } : x,
                              ),
                            );
                          }}
                          disabled={isUas}
                          aria-label={`Label for ${v.label}`}
                        />
                      </div>

                      <div className={styles['rsm__rank-cell']}>
                        <IconButton
                          size="X-Small"
                          padding="Compact"
                          aria-label={`Move ${v.label} up`}
                          disabled={isUas || idx === 0}
                          icon={<Icon size="12" glyph={<ArrowUpIcon />} />}
                          onClick={() => moveByOne(idx, -1)}
                        />
                        <div className={styles['rsm__rank-input']}>
                          <TextInput
                            size="Small"
                            type="number"
                            value={String(v.rank ?? '')}
                            onChange={(e) => setRankExact(v.id, e.target.value)}
                            invalid={Boolean(rowError)}
                            disabled={isUas}
                            aria-label={`Rank for ${v.label}`}
                            aria-invalid={rowError ? true : undefined}
                          />
                        </div>
                        <IconButton
                          size="X-Small"
                          padding="Compact"
                          aria-label={`Move ${v.label} down`}
                          disabled={isUas || idx === values.length - 1}
                          icon={<Icon size="12" glyph={<ArrowDownIcon />} />}
                          onClick={() => moveByOne(idx, 1)}
                        />
                      </div>

                      {!isUas &&
                        (deleteBlocked ? (
                          <div className={styles['rsm__remove-wrap']}>
                            <IconButton
                              size="X-Small"
                              destructive
                              aria-label={`Remove ${v.label}`}
                              aria-describedby={removeBlockedDescId}
                              disabled
                              icon={
                                <Icon
                                  size="12"
                                  glyph={<TrashCanOutlineIcon />}
                                />
                              }
                            />
                            <div
                              className={styles['rsm__remove-tooltip']}
                              aria-hidden
                            >
                              <Tooltip
                                label={deleteBlockedMessage}
                                arrow="Right"
                              />
                            </div>
                          </div>
                        ) : (
                          <IconButton
                            size="X-Small"
                            destructive
                            aria-label={`Remove ${v.label}`}
                            icon={
                              <Icon
                                size="12"
                                glyph={<TrashCanOutlineIcon />}
                              />
                            }
                            onClick={() => removeValue(idx)}
                          />
                        ))}
                    </div>
                    {rowError && (
                      <div className={styles['rsm__row-error']} role="alert">
                        {rowError}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {deleteBlocked && (
              <span
                id={removeBlockedDescId}
                className={styles['rsm__sr-only']}
              >
                {deleteBlockedMessage}
              </span>
            )}

            {!isUas && (
              <div className={styles['rsm__add']}>
                <Button
                  emphasis="Quaternary"
                  size="Small"
                  leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                  onClick={addValue}
                >
                  Add value (rank {nextRank(values)})
                </Button>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
