/**
 * Read-only popover shown when admin clicks a session chip (real or custom).
 * Content:
 *   - Header (session label, verdict pill)
 *   - Per-permission breakdown (one row per action; relevant for multi-action policies)
 *   - Failing condition string for any denial
 *   - Session attribute values (system admin only — privacy gate per Q23 L-E)
 *   - For custom sessions: a "Discard custom session" link at the bottom
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import Icon from '@/components/ui/Icon/Icon';
import VerdictPill from './VerdictPill';
import { ACTION_LABELS } from './types';
import type {
  AdminRole,
  CellVerdict,
  EditorScope,
  EntryContext,
  SessionAttributeValue,
  VerdictAttribution,
} from './types';
import styles from './SimulateAccess.module.scss';

export interface SessionChipDetailPopoverProps {
  /** Trigger rect for placement. */
  triggerRect: DOMRect;
  /** Display title — device label for real sessions, "Custom session" for custom. */
  title: string;
  /** Optional secondary line — e.g. "Last active 4 min ago" or "Cloned from iPhone 14 · 4 min ago". */
  subtitle?: string;
  /** True when this is a custom session — adds the Discard affordance. */
  isCustom: boolean;
  /** Aggregate verdict for the session. */
  verdict: VerdictAttribution;
  /** Per-action verdicts. */
  cellVerdicts: CellVerdict[];
  /** Attribute snapshot. Hidden for channel admins. */
  attributes: SessionAttributeValue[];
  role: AdminRole;
  context: EntryContext;
  scope: EditorScope;
  onClose: () => void;
  onDiscard?: () => void;
  /** Custom-only: open the new-custom-session popover with this chip's values pre-filled. */
  onTweak?: () => void;
}

const POPOVER_WIDTH = 320;
const POPOVER_GAP = 8;

export default function SessionChipDetailPopover({
  triggerRect,
  title,
  subtitle,
  isCustom,
  verdict,
  cellVerdicts,
  attributes,
  role,
  context,
  scope,
  onClose,
  onDiscard,
  onTweak,
}: SessionChipDetailPopoverProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const w = ref.current.offsetWidth || POPOVER_WIDTH;
    const h = ref.current.offsetHeight;
    let top = triggerRect.bottom + POPOVER_GAP;
    let left = triggerRect.left;
    if (left + w > window.innerWidth - 8) left = window.innerWidth - 8 - w;
    if (left < 8) left = 8;
    if (top + h > window.innerHeight - 8) top = triggerRect.top - h - POPOVER_GAP;
    if (top < 8) top = 8;
    setPos({ top, left });
  }, [triggerRect]);

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
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', key);
    };
  }, [onClose]);

  const showAttrs = role === 'system';

  return (
    <div
      ref={ref}
      className={styles['sa-chip-popover']}
      style={{ top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
      role="dialog"
      aria-label="Session details"
    >
      <div className={styles['sa-chip-popover__header']}>
        <div className={styles['sa-chip-popover__title-group']}>
          <span className={styles['sa-chip-popover__title']}>{title}</span>
          {subtitle && <span className={styles['sa-chip-popover__subtitle']}>{subtitle}</span>}
        </div>
        <button
          type="button"
          className={styles['sa-chip-popover__close']}
          onClick={onClose}
          aria-label="Close"
        >
          <Icon glyph={<CloseIcon />} size="12" />
        </button>
      </div>

      <div className={styles['sa-chip-popover__verdict-row']}>
        <span className={styles['sa-chip-popover__verdict-label']}>Verdict</span>
        <VerdictPill verdict={verdict} role={role} context={context} scope={scope} />
      </div>

      {cellVerdicts.length > 1 && (
        <div className={styles['sa-chip-popover__section']}>
          <span className={styles['sa-chip-popover__section-label']}>Per permission</span>
          {cellVerdicts.map((c) => {
            const allowed = c.verdict === 'allowed';
            return (
              <div key={c.action} className={styles['sa-chip-popover__perm-row']}>
                <span className={styles['sa-chip-popover__perm-name']}>{ACTION_LABELS[c.action]}</span>
                <span
                  className={[
                    styles['sa-chip-popover__perm-verdict'],
                    allowed
                      ? styles['sa-chip-popover__perm-verdict--allow']
                      : styles['sa-chip-popover__perm-verdict--deny'],
                  ].join(' ')}
                >
                  <Icon glyph={allowed ? <CheckCircleIcon /> : <CloseCircleIcon />} size="12" />
                  {allowed ? 'Allowed' : 'Denied'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/*
        Failing condition (deny only). System admins only — channel admins
        cannot see raw policy expressions per Q23 L-E privacy rule. They get
        the verdict but not the CEL string.
      */}
      {showAttrs && cellVerdicts.some((c) => c.failingCondition) && (
        <div className={styles['sa-chip-popover__section']}>
          <span className={styles['sa-chip-popover__section-label']}>Failing condition</span>
          {cellVerdicts
            .filter((c) => c.failingCondition)
            .map((c) => (
              <code key={c.action} className={styles['sa-chip-popover__condition']}>
                {c.failingCondition}
              </code>
            ))}
        </div>
      )}

      {/* Attribute values — system admin only */}
      {showAttrs && attributes.length > 0 && (
        <div className={styles['sa-chip-popover__section']}>
          <span className={styles['sa-chip-popover__section-label']}>Attributes</span>
          <dl className={styles['sa-chip-popover__attrs']}>
            {attributes.map((a) => (
              <div key={a.key} className={styles['sa-chip-popover__attr-row']}>
                <dt>{a.label}</dt>
                <dd>{a.value === null ? <em>unknown</em> : String(a.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {isCustom && (onDiscard || onTweak) && (
        <div className={styles['sa-chip-popover__footer']}>
          {onDiscard && (
            <button
              type="button"
              className={styles['sa-chip-popover__discard']}
              onClick={() => {
                onDiscard();
                onClose();
              }}
            >
              Discard
            </button>
          )}
          {onTweak && (
            <button
              type="button"
              className={styles['sa-chip-popover__tweak']}
              onClick={() => {
                onTweak();
                onClose();
              }}
              title="Create a new custom session pre-filled with these values"
            >
              Tweak as new
            </button>
          )}
        </div>
      )}
    </div>
  );
}
