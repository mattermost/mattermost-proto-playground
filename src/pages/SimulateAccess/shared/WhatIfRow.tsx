/**
 * Final synthesized design — Option 1 (clone & tweak with chip-based editing) +
 * critique modifications. Renders inside a UserRow's expanded session list.
 *
 * Visual model: synthetic row looks ~95% identical to a real session row.
 * Identifier: small WHAT-IF tag inline with device name, asterisk prefix when
 * dirty, edited chips visually distinct from unedited ones. NO dashed border,
 * NO info-tone fill, NO persistent kicker.
 *
 * Editing model: per-attribute click-to-edit chips. Single-purpose popover.
 * Verdict re-computes on chip change (would be debounced 250ms in production).
 *
 * Scaling: chip-line wraps on a single row at 1–4 attrs; switches to a 2-column
 * grid at 5+ attrs. Always-visible — no hidden state in a security UI.
 */
import { useState } from 'react';
import Icon from '@/components/ui/Icon/Icon';
import CloseIcon from '@mattermost/compass-icons/components/close';
import VerdictPill from './VerdictPill';
import AttributeEditPopover from './AttributeEditPopover';
import {
  attributesUsedByPolicy,
  buildCustomSession,
  COMPLIANT_DEFAULTS,
  FIELD_LABEL,
  preFillFromUser,
} from './customSession';
import type { CustomSessionFields } from './customSession';
import type {
  AdminRole,
  EditorScope,
  EntryContext,
  PolicyContext,
  SessionDecision,
  UserSimulationRow,
} from './types';
import styles from './SimulateAccess.module.scss';

export interface WhatIfInstance {
  /** Stable id for React keys + dedupe. */
  id: string;
  /** sessionId of the source session (null = built from compliant defaults for 0-session users). */
  sourceSessionId: string | null;
  /** Source values — what we initialized from. Used to detect dirty + offer reset. */
  source: CustomSessionFields;
  /** Current values — what the verdict is computed against. */
  current: CustomSessionFields;
}

export interface WhatIfRowProps {
  user: UserSimulationRow;
  whatIf: WhatIfInstance;
  role: AdminRole;
  context: EntryContext;
  scope: EditorScope;
  policy?: PolicyContext;
  /** When true, more than 4 attributes — render in 2-column grid. */
  manyAttributes: boolean;
  /** When true, show an inline picker so the admin can switch the source real session. */
  showSourcePicker?: boolean;
  onChange: (next: WhatIfInstance) => void;
  onDiscard: () => void;
  /** Reseed the custom session from a different source (or null = compliant defaults). */
  onReseed?: (sourceSessionId: string | null) => void;
}

export default function WhatIfRow({
  user,
  whatIf,
  role,
  context,
  scope,
  policy,
  manyAttributes,
  showSourcePicker = false,
  onChange,
  onDiscard,
  onReseed,
}: WhatIfRowProps) {
  const used = attributesUsedByPolicy(policy);
  const [editingKey, setEditingKey] = useState<keyof CustomSessionFields | null>(null);
  const [editingRect, setEditingRect] = useState<DOMRect | null>(null);

  const isDirty = used.some((k) => whatIf.current[k] !== whatIf.source[k]);
  // Verdict consumes the full attribute set the policy references.
  const synthetic = buildCustomSession(whatIf.current, policy);

  // Source session label for context line.
  const sourceLabel = (() => {
    if (whatIf.sourceSessionId === null) {
      return null; // no source — built from defaults
    }
    const s = user.sessions.find((x) => x.sessionId === whatIf.sourceSessionId);
    if (!s) return 'a previous session';
    return `${s.deviceLabel} · ${s.lastActive}`;
  })();
  const headlineLabel = 'Custom session';
  void sourceLabel; // kept for future use; subtitle removed for compactness

  const realSessions = user.sessions.filter((s) => !s.isPlaceholder);

  function commitChip(key: keyof CustomSessionFields, value: string) {
    onChange({ ...whatIf, current: { ...whatIf.current, [key]: value } });
  }

  function resetChipToSource(key: keyof CustomSessionFields) {
    onChange({ ...whatIf, current: { ...whatIf.current, [key]: whatIf.source[key] } });
  }

  function resetAll() {
    onChange({ ...whatIf, current: { ...whatIf.source } });
  }

  function openChipEditor(key: keyof CustomSessionFields, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingRect((e.currentTarget as HTMLElement).getBoundingClientRect());
    setEditingKey(key);
  }

  return (
    <div className={styles['sa-whatif-row']}>
      {/* Top row — same layout as a real session row */}
      <div className={styles['sa-whatif-row__top']}>
        <div className={styles['sa-whatif-row__device']}>
          <span className={styles['sa-whatif-row__name']}>
            {isDirty && <span className={styles['sa-whatif-row__dirty']} aria-hidden>*</span>}
            {headlineLabel}
            <span className={styles['sa-whatif-row__tag']} aria-label="Custom session — not real">
              Custom
            </span>
          </span>
          {showSourcePicker && realSessions.length > 0 && (
            <span className={styles['sa-whatif-row__meta']}>
              Source:{' '}
              <select
                className={styles['sa-whatif-row__source-select']}
                value={whatIf.sourceSessionId ?? '__defaults__'}
                onChange={(e) => {
                  const v = e.target.value;
                  onReseed?.(v === '__defaults__' ? null : v);
                }}
              >
                {realSessions.map((s) => (
                  <option key={s.sessionId} value={s.sessionId}>
                    {s.deviceLabel} · {s.lastActive}
                  </option>
                ))}
                <option value="__defaults__">Compliant defaults</option>
              </select>
            </span>
          )}
        </div>

        <div className={styles['sa-whatif-row__verdict']}>
          <VerdictPill
            verdict={synthetic.verdict}
            role={role}
            context={context}
            scope={scope}
          />
        </div>

        <button
          type="button"
          className={styles['sa-whatif-row__discard']}
          aria-label="Discard custom session"
          title="Discard custom session"
          onClick={onDiscard}
        >
          <Icon glyph={<CloseIcon />} size="12" />
        </button>
      </div>

      {/* Attribute chips — single-line at 1–4 attrs, 2-column grid at 5+ */}
      <div
        className={[
          styles['sa-whatif-row__chips'],
          manyAttributes && styles['sa-whatif-row__chips--grid'],
        ].filter(Boolean).join(' ')}
      >
        {used.map((key) => {
          const value = whatIf.current[key] ?? '';
          const edited = value !== (whatIf.source[key] ?? '');
          return (
            <button
              type="button"
              key={key}
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

      {/* Footer — Reset all link if dirty */}
      {isDirty && (
        <div className={styles['sa-whatif-row__footer']}>
          <button type="button" className={styles['sa-whatif-row__reset-all']} onClick={resetAll}>
            Reset all to source
          </button>
        </div>
      )}

      {/* Per-chip popover */}
      {editingKey && editingRect && (
        <AttributeEditPopover
          attributeKey={editingKey}
          currentValue={whatIf.current[editingKey] ?? ''}
          sourceValue={whatIf.source[editingKey] ?? ''}
          triggerRect={editingRect}
          onClose={() => {
            setEditingKey(null);
            setEditingRect(null);
          }}
          onApply={(newValue) => commitChip(editingKey, newValue)}
          onResetToSource={() => resetChipToSource(editingKey)}
        />
      )}

    </div>
  );
}

/** Build a what-if instance from a real source session. Always populates all
 * configurable fields by falling back to compliant defaults for any attribute
 * the source session doesn't carry — keeps the WhatIfRow chip grid fully filled.
 */
export function whatIfFromSession(
  user: UserSimulationRow,
  sessionId: string,
): WhatIfInstance | null {
  const session: SessionDecision | undefined = user.sessions.find((s) => s.sessionId === sessionId);
  if (!session || session.isPlaceholder) return null;

  const get = (suffix: string): string | undefined => {
    const a = session.attributes.find((x) => x.key === `session.${suffix}`);
    if (!a || a.value === null) return undefined;
    return String(a.value);
  };

  const source: CustomSessionFields = {
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

  return {
    id: 'wi-' + Math.random().toString(36).slice(2, 8),
    sourceSessionId: sessionId,
    source,
    current: { ...source },
  };
}

/** Build a what-if from compliant defaults (0-session case). */
export function whatIfFromDefaults(user: UserSimulationRow): WhatIfInstance {
  // Fall through to preFillFromUser in case future logic differs by user.
  void user;
  const source = { ...COMPLIANT_DEFAULTS };
  return {
    id: 'wi-' + Math.random().toString(36).slice(2, 8),
    sourceSessionId: null,
    source,
    current: { ...source },
  };
}

// Suppress unused-import warning for preFillFromUser (kept for future shape).
void preFillFromUser;
