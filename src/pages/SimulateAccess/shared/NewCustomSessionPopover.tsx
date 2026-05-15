/**
 * Popover that opens when admin clicks the "Add custom session" pseudo-chip.
 * Captures the attribute config for a new custom session, with a live verdict
 * preview. On Done, the parent inserts a new session chip in the row.
 *
 * Custom sessions are NOT editable after creation (per design decision) —
 * this popover is the only opportunity to set values.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import VerdictPill from './VerdictPill';
import AttributeEditPopover from './AttributeEditPopover';
import {
  attributesUsedByPolicy,
  buildCustomSession,
  COMPLIANT_DEFAULTS,
  FIELD_LABEL,
} from './customSession';
import type { CustomSessionFields } from './customSession';
import type {
  AdminRole,
  EditorScope,
  EntryContext,
  PolicyContext,
  UserSimulationRow,
} from './types';
import styles from './SimulateAccess.module.scss';

export interface NewCustomSessionPopoverProps {
  /** Anchor for placement. */
  triggerRect: DOMRect;
  user: UserSimulationRow;
  policy?: PolicyContext;
  role: AdminRole;
  context: EntryContext;
  scope: EditorScope;
  /** When set, pre-fill the popover with these values (used by the "Tweak as new" flow). */
  prefill?: { sourceSessionId: string | null; fields: CustomSessionFields };
  onClose: () => void;
  onCommit: (sourceSessionId: string | null, fields: CustomSessionFields) => void;
}

const POPOVER_WIDTH = 380;

export default function NewCustomSessionPopover({
  triggerRect,
  user,
  policy,
  role,
  context,
  scope,
  prefill,
  onClose,
  onCommit,
}: NewCustomSessionPopoverProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });

  const realSessions = user.sessions.filter((s) => !s.isPlaceholder);
  const used = attributesUsedByPolicy(policy);

  const initialSourceId = prefill?.sourceSessionId ?? realSessions[0]?.sessionId ?? null;
  const [sourceId, setSourceId] = useState<string | null>(initialSourceId);

  /** Derive starting field values from the chosen source. */
  const computeFromSource = (id: string | null): CustomSessionFields => {
    if (id === null) return { ...COMPLIANT_DEFAULTS };
    const s = realSessions.find((x) => x.sessionId === id);
    if (!s) return { ...COMPLIANT_DEFAULTS };
    const get = (suffix: string): string | undefined => {
      const a = s.attributes.find((x) => x.key === `session.${suffix}`);
      if (!a || a.value === null) return undefined;
      return String(a.value);
    };
    return {
      device_type: get('device_type') ?? COMPLIANT_DEFAULTS.device_type,
      vpn_active: get('vpn_active') ?? COMPLIANT_DEFAULTS.vpn_active,
      device_mdm_enrolled: get('device_mdm_enrolled') ?? COMPLIANT_DEFAULTS.device_mdm_enrolled,
      network_interface_type: get('network_interface_type') ?? COMPLIANT_DEFAULTS.network_interface_type,
      os_version: get('os_version') ?? COMPLIANT_DEFAULTS.os_version,
      client_version: get('client_version') ?? COMPLIANT_DEFAULTS.client_version,
      geolocation: get('geolocation') ?? COMPLIANT_DEFAULTS.geolocation,
      mfa_freshness: get('mfa_freshness') ?? COMPLIANT_DEFAULTS.mfa_freshness,
      ip_in_range: get('ip_in_range') ?? COMPLIANT_DEFAULTS.ip_in_range,
      time_of_day: get('time_of_day') ?? COMPLIANT_DEFAULTS.time_of_day,
    };
  };

  // For Tweak-as-new flow: source = the source session's true values (for diffing),
  // fields = pre-filled with the previously-tweaked values so admin can re-tweak.
  const [source, setSource] = useState<CustomSessionFields>(() => computeFromSource(initialSourceId));
  const [fields, setFields] = useState<CustomSessionFields>(() => prefill?.fields ?? source);

  const [editingKey, setEditingKey] = useState<keyof CustomSessionFields | null>(null);
  const [editingRect, setEditingRect] = useState<DOMRect | null>(null);

  // Re-seed when the admin switches source.
  function changeSource(id: string | null) {
    setSourceId(id);
    const fresh = computeFromSource(id);
    setSource(fresh);
    setFields(fresh);
  }

  function commitChip(key: keyof CustomSessionFields, value: string) {
    setFields((p) => ({ ...p, [key]: value }));
  }

  function resetChipToSource(key: keyof CustomSessionFields) {
    setFields((p) => ({ ...p, [key]: source[key] }));
  }

  function openChipEditor(key: keyof CustomSessionFields, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingRect((e.currentTarget as HTMLElement).getBoundingClientRect());
    setEditingKey(key);
  }

  const verdictPreview = useMemo(() => buildCustomSession(fields, policy), [fields, policy]);
  const manyAttributes = used.length >= 5;

  useLayoutEffect(() => {
    if (!ref.current) return;
    const w = ref.current.offsetWidth || POPOVER_WIDTH;
    const h = ref.current.offsetHeight;
    let top = triggerRect.bottom + 8;
    let left = triggerRect.left;
    if (left + w > window.innerWidth - 8) left = window.innerWidth - 8 - w;
    if (left < 8) left = 8;
    if (top + h > window.innerHeight - 8) top = triggerRect.top - h - 8;
    if (top < 8) top = 8;
    setPos({ top, left });
  }, [triggerRect, fields]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return;
      // Don't close when clicking inside the nested attribute popover.
      const t = e.target as Node;
      const inside = ref.current.contains(t);
      const inAttr = (document.querySelector(`[role="dialog"][aria-label^="Edit "]`) as HTMLElement | null);
      if (inside || (inAttr && inAttr.contains(t))) return;
      onClose();
    }
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (editingKey) return; // let the inner popover close first
        onClose();
      }
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    document.addEventListener('keydown', key);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', key);
    };
  }, [onClose, editingKey]);

  return (
    <>
      <div
        ref={ref}
        className={styles['sa-new-cs-popover']}
        style={{ top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
        role="dialog"
        aria-label="New custom session"
      >
        <div className={styles['sa-new-cs-popover__header']}>
          <span className={styles['sa-new-cs-popover__title']}>New custom session</span>
          <button
            type="button"
            className={styles['sa-new-cs-popover__close']}
            onClick={onClose}
            aria-label="Close"
          >
            <Icon glyph={<CloseIcon />} size="12" />
          </button>
        </div>

        {realSessions.length > 0 && (
          <div className={styles['sa-new-cs-popover__source-row']}>
            <label className={styles['sa-new-cs-popover__source-label']}>Source</label>
            <select
              className={styles['sa-new-cs-popover__source-select']}
              value={sourceId ?? '__defaults__'}
              onChange={(e) => {
                const v = e.target.value;
                changeSource(v === '__defaults__' ? null : v);
              }}
            >
              {realSessions.map((s) => (
                <option key={s.sessionId} value={s.sessionId}>
                  {s.deviceLabel} · {s.lastActive}
                </option>
              ))}
              <option value="__defaults__">Compliant defaults</option>
            </select>
          </div>
        )}

        <div className={styles['sa-new-cs-popover__verdict-row']}>
          <span className={styles['sa-new-cs-popover__verdict-label']}>Live verdict</span>
          <VerdictPill verdict={verdictPreview.verdict} role={role} context={context} scope={scope} />
        </div>

        <div
          className={[
            styles['sa-new-cs-popover__chips'],
            manyAttributes && styles['sa-new-cs-popover__chips--grid'],
          ].filter(Boolean).join(' ')}
        >
          {used.map((key) => {
            const value = fields[key] ?? '';
            const edited = value !== (source[key] ?? '');
            return (
              <button
                key={key}
                type="button"
                className={[
                  styles['sa-whatif-chip'],
                  edited && styles['sa-whatif-chip--edited'],
                ].filter(Boolean).join(' ')}
                onClick={(e) => openChipEditor(key, e)}
              >
                <span className={styles['sa-whatif-chip__label']}>{FIELD_LABEL[key]}:</span>
                <span className={styles['sa-whatif-chip__value']}>{value}</span>
              </button>
            );
          })}
        </div>

        <div className={styles['sa-new-cs-popover__footer']}>
          <Button emphasis="Tertiary" size="X-Small" onClick={onClose}>
            Cancel
          </Button>
          <Button
            emphasis="Primary"
            size="X-Small"
            onClick={() => {
              onCommit(sourceId, fields);
              onClose();
            }}
          >
            Add session
          </Button>
        </div>
      </div>

      {editingKey && editingRect && (
        <AttributeEditPopover
          attributeKey={editingKey}
          currentValue={fields[editingKey] ?? ''}
          sourceValue={source[editingKey] ?? ''}
          triggerRect={editingRect}
          onClose={() => {
            setEditingKey(null);
            setEditingRect(null);
          }}
          onApply={(newValue) => commitChip(editingKey, newValue)}
          onResetToSource={() => resetChipToSource(editingKey)}
        />
      )}
    </>
  );
}
