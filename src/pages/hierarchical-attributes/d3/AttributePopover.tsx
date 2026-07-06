import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import ArrowUpIcon from '@mattermost/compass-icons/components/arrow-up';
import ArrowDownIcon from '@mattermost/compass-icons/components/arrow-down';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import { nextRank, sortByRankDesc } from '../shared/types';
import type { RankedSchema, RankedValue } from '../shared/types';
import styles from './AttributePopover.module.scss';

interface AttributePopoverProps {
  /** The full ranked schema being edited. Edits commit live to the caller. */
  schema: RankedSchema;
  /** Anchor element used for positioning (typically the row's 3-dot button). */
  anchor: HTMLElement | null;
  /** Attribute-level policy reference count — drives per-value remove gating. */
  policyCount: number;
  /** Read-only when the source schema is UAS-managed. */
  readOnly?: boolean;
  onClose: () => void;
  onChangeValueLabel: (valueId: string, label: string) => void;
  onChangeRank: (valueId: string, nextRank: number) => void;
  onAddValue: (label: string) => void;
  onRemoveValue: (valueId: string) => void;
  /** Reorder by swapping with the neighbor (UI-driven via up/down steppers). */
  onReorder: (valueId: string, direction: -1 | 1) => void;
}

/**
 * D3 per-attribute editor popover — the primary editing surface.
 *
 * Composes a vertical list of value rows (drag handle · label TextInput · rank
 * stepper · destructive remove IconButton) plus a footer "+ Add value" button.
 * Each edit commits live; there is no Save button.
 *
 * R-D3-FOCUS: focus-trap inside popover (Tab/Shift-Tab cycle); Esc closes and
 * returns focus to the anchor; outside-click dismisses.
 */
export default function AttributePopover({
  schema,
  anchor,
  policyCount,
  readOnly = false,
  onClose,
  onChangeValueLabel,
  onChangeRank,
  onAddValue,
  onRemoveValue,
  onReorder,
}: AttributePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const removeDescId = useId();
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) addInputRef.current?.focus();
  }, [adding]);

  // Position the popover anchored below the trigger button.
  useLayoutEffect(() => {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    // Anchor below-and-left so the popover floats over the table without
    // clipping; sized to the schema below.
    setPosition({
      top: rect.bottom + window.scrollY + 6,
      left: Math.max(8, rect.right + window.scrollX - 360),
    });
  }, [anchor]);

  // R-D3-FOCUS: focus the first focusable on mount, trap focus inside the
  // popover, Esc closes + restores focus to anchor.
  useEffect(() => {
    const root = popoverRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        anchor?.focus();
        return;
      }
      if (e.key === 'Tab' && root) {
        const list = root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, anchor]);

  // Outside-click dismiss.
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const root = popoverRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;
      if (anchor && anchor.contains(e.target as Node)) return;
      onClose();
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [onClose, anchor]);

  if (!position) return null;

  const ordered = sortByRankDesc(schema.values);
  const removeBlocked = policyCount > 0;
  const removeBlockedMessage = `Used in ${policyCount} ${policyCount === 1 ? 'policy' : 'policies'}; cannot delete.`;
  const nextR = nextRank(schema.values);

  function commitAdd() {
    const next = addDraft.trim();
    if (next) {
      onAddValue(next);
    }
    setAddDraft('');
    setAdding(false);
  }

  return (
    <div
      ref={popoverRef}
      className={styles['attribute-popover']}
      role="dialog"
      aria-modal="false"
      aria-label={`Edit ${schema.attributeName}`}
      style={{ top: position.top, left: position.left }}
    >
      <header className={styles['attribute-popover__head']}>
        <h2 className={styles['attribute-popover__title']}>
          {schema.attributeName}
        </h2>
        <IconButton
          size="X-Small"
          aria-label="Close editor"
          icon={<Icon size="12" glyph={<CloseIcon />} />}
          onClick={() => {
            onClose();
            anchor?.focus();
          }}
        />
      </header>

      <div className={styles['attribute-popover__hint']}>
        Top of list = highest rank. Use the steppers to reorder.
      </div>

      <ul className={styles['attribute-popover__list']}>
        {ordered.map((v, idx) => (
          <ValueRow
            key={v.id}
            value={v}
            index={idx}
            total={ordered.length}
            readOnly={readOnly}
            removeBlocked={removeBlocked}
            removeBlockedMessage={removeBlockedMessage}
            onChangeLabel={(label) => onChangeValueLabel(v.id, label)}
            onChangeRank={(nextRankValue) =>
              onChangeRank(v.id, nextRankValue)
            }
            onMoveUp={() => onReorder(v.id, -1)}
            onMoveDown={() => onReorder(v.id, 1)}
            onRemove={() => onRemoveValue(v.id)}
          />
        ))}
      </ul>

      {removeBlocked && (
        <span id={removeDescId} className={styles['attribute-popover__sr-only']}>
          {removeBlockedMessage}
        </span>
      )}

      {!readOnly && (
        <footer className={styles['attribute-popover__footer']}>
          {adding ? (
            <span className={styles['attribute-popover__add-input']}>
              <TextInput
                ref={addInputRef}
                size="Small"
                value={addDraft}
                placeholder={`Value name… (rank ${nextR})`}
                onChange={(e) => setAddDraft(e.target.value)}
                onBlur={() => {
                  if (addDraft.trim()) commitAdd();
                  else setAdding(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitAdd();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setAddDraft('');
                    setAdding(false);
                  }
                }}
                aria-label={`New value name for ${schema.attributeName}`}
              />
            </span>
          ) : (
            <Button
              emphasis="Quaternary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
              onClick={() => setAdding(true)}
            >
              Add value
            </Button>
          )}
        </footer>
      )}
    </div>
  );
}

interface ValueRowProps {
  value: RankedValue;
  index: number;
  total: number;
  readOnly: boolean;
  removeBlocked: boolean;
  removeBlockedMessage: string;
  onChangeLabel: (label: string) => void;
  onChangeRank: (nextRank: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

function ValueRow({
  value,
  index,
  total,
  readOnly,
  removeBlocked,
  removeBlockedMessage,
  onChangeLabel,
  onChangeRank,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ValueRowProps) {
  const [labelDraft, setLabelDraft] = useState(value.label);
  useEffect(() => {
    setLabelDraft(value.label);
  }, [value.label]);

  function commitLabel() {
    const next = labelDraft.trim();
    if (next && next !== value.label) {
      onChangeLabel(next);
    } else if (!next) {
      setLabelDraft(value.label);
    }
  }

  return (
    <li className={styles['attribute-popover__row']}>
      <span
        className={styles['attribute-popover__drag']}
        aria-hidden
        title={readOnly ? 'UAS-sourced; read-only' : 'Drag to reorder (not wired in prototype)'}
      >
        <Icon size="16" glyph={<DragVerticalIcon />} />
      </span>

      <div className={styles['attribute-popover__label-cell']}>
        <TextInput
          size="Small"
          value={labelDraft}
          onChange={(e) => setLabelDraft(e.target.value)}
          onBlur={commitLabel}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitLabel();
            }
          }}
          disabled={readOnly}
          aria-label={`Label for ${value.label}`}
        />
      </div>

      <div className={styles['attribute-popover__rank-cell']}>
        <IconButton
          size="X-Small"
          padding="Compact"
          aria-label={`Move ${value.label} up`}
          disabled={readOnly || index === 0}
          icon={<Icon size="12" glyph={<ArrowUpIcon />} />}
          onClick={onMoveUp}
        />
        <div className={styles['attribute-popover__rank-input']}>
          <TextInput
            size="Small"
            type="number"
            value={String(value.rank ?? '')}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              if (Number.isFinite(parsed) && parsed >= 1) {
                onChangeRank(parsed);
              }
            }}
            disabled={readOnly}
            aria-label={`Rank for ${value.label}`}
          />
        </div>
        <IconButton
          size="X-Small"
          padding="Compact"
          aria-label={`Move ${value.label} down`}
          disabled={readOnly || index === total - 1}
          icon={<Icon size="12" glyph={<ArrowDownIcon />} />}
          onClick={onMoveDown}
        />
      </div>

      {readOnly ? (
        <span
          className={styles['attribute-popover__remove-placeholder']}
          aria-hidden
        />
      ) : removeBlocked ? (
        <div className={styles['attribute-popover__remove-wrap']}>
          <IconButton
            size="X-Small"
            destructive
            aria-label={`Remove ${value.label}`}
            disabled
            icon={<Icon size="12" glyph={<TrashCanOutlineIcon />} />}
          />
          <div
            className={styles['attribute-popover__remove-tooltip']}
            aria-hidden
          >
            <Tooltip label={removeBlockedMessage} arrow="Right" />
          </div>
        </div>
      ) : (
        <IconButton
          size="X-Small"
          destructive
          aria-label={`Remove ${value.label}`}
          icon={<Icon size="12" glyph={<TrashCanOutlineIcon />} />}
          onClick={onRemove}
        />
      )}
    </li>
  );
}
