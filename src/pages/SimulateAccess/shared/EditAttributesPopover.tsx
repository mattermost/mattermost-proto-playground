import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import type { PolicyContext, SessionDecision } from './types';
import styles from './SimulateAccess.module.scss';

export interface EditAttributesPopoverProps {
  session: SessionDecision;
  policy?: PolicyContext;
  triggerRect: DOMRect;
  onClose: () => void;
  onApply: (overriddenKeys: string[]) => void;
}

function attributesReferencedByPolicy(policy?: PolicyContext): string[] {
  if (!policy) return ['session.device_type', 'session.vpn_active', 'session.device_mdm_enrolled'];
  if (policy.policyName.includes('IL5')) return ['session.device_type', 'session.vpn_active', 'session.device_mdm_enrolled'];
  return ['session.device_type'];
}

const PRETTY_LABEL: Record<string, string> = {
  'session.device_type': 'Device type',
  'session.vpn_active': 'VPN active',
  'session.device_mdm_enrolled': 'MDM enrolled',
  'session.network_interface_type': 'Network',
  'session.os_version': 'OS version',
  'session.client_version': 'Client version',
};

const OPTIONS_FOR: Record<string, string[]> = {
  'session.device_type': ['desktop', 'mobile', 'browser'],
  'session.vpn_active': ['true', 'false'],
  'session.device_mdm_enrolled': ['true', 'false'],
  'session.network_interface_type': ['WiFi', 'Cellular', 'Ethernet', 'VPN tunnel'],
};

export default function EditAttributesPopover({
  session,
  policy,
  triggerRect,
  onClose,
  onApply,
}: EditAttributesPopoverProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const refs = attributesReferencedByPolicy(policy);
  const inScope = session.attributes.filter((a) => refs.includes(a.key));

  const initial = Object.fromEntries(
    inScope.map((a) => [a.key, a.value === null ? '' : String(a.value)]),
  ) as Record<string, string>;
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });

  // Position: anchored to the trigger button. Default: below + slightly to the left so the popover's
  // top-right corner aligns with the trigger. Falls back to above if clipped at bottom.
  useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const w = el.offsetWidth;
    const h = el.offsetHeight;

    let top = triggerRect.bottom + 4;
    let left = triggerRect.right - w; // right-align with trigger

    // If clipped at right, push left.
    if (left + w > window.innerWidth - 8) left = window.innerWidth - 8 - w;
    if (left < 8) left = 8;

    // If clipped at bottom, place ABOVE the trigger.
    if (top + h > window.innerHeight - 8) {
      top = triggerRect.top - h - 4;
      if (top < 8) top = 8;
    }

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

  function apply() {
    const overridden = Object.entries(values)
      .filter(([k, v]) => String(initial[k]) !== v)
      .map(([k]) => k);
    onApply(overridden);
  }

  const dirty = Object.entries(values).some(([k, v]) => String(initial[k]) !== v);

  return (
    <div
      ref={ref}
      className={styles['sa-popover']}
      style={{ top: pos.top, left: pos.left, minWidth: 280 }}
      role="dialog"
      aria-label="Edit session attributes"
    >
      <div className={styles['sa-popover__header']}>
        <span className={styles['sa-popover__kicker']}>Edit session attributes</span>
        <button
          type="button"
          className={styles['sa-popover__close']}
          onClick={onClose}
          aria-label="Close edit popover"
        >
          <CloseIcon size={14} />
        </button>
      </div>
      <p className={styles['sa-popover__sub']}>
        Edit values for session attributes used in this policy. Changes apply only to this simulation.
      </p>

      <div className={styles['sa-popover__body']}>
        {inScope.length === 0 ? (
          <p style={{ fontSize: 12, color: 'rgba(var(--center-channel-color-rgb), 0.56)', fontStyle: 'italic', margin: 0 }}>
            This policy doesn't reference any session attributes — nothing to edit.
          </p>
        ) : (
          inScope.map((a) => {
            const opts = OPTIONS_FOR[a.key] ?? [];
            return (
              <div className={styles['sa-floating-input']} key={a.key}>
                <label className={styles['sa-floating-input__label']} htmlFor={`f-${a.key}`}>
                  {PRETTY_LABEL[a.key] ?? a.label}
                </label>
                {opts.length > 0 ? (
                  <>
                    <select
                      id={`f-${a.key}`}
                      className={styles['sa-floating-input__select']}
                      value={values[a.key] ?? ''}
                      onChange={(e) => setValues((p) => ({ ...p, [a.key]: e.target.value }))}
                    >
                      {opts.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <span className={styles['sa-floating-input__caret']} aria-hidden>
                      <Icon glyph={<ChevronDownIcon />} size="12" />
                    </span>
                  </>
                ) : (
                  <input
                    id={`f-${a.key}`}
                    className={styles['sa-floating-input__select']}
                    value={values[a.key] ?? ''}
                    onChange={(e) => setValues((p) => ({ ...p, [a.key]: e.target.value }))}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {inScope.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <Button emphasis="Tertiary" size="X-Small" onClick={onClose}>Cancel</Button>
          <Button emphasis="Primary" size="X-Small" onClick={apply} disabled={!dirty}>Apply</Button>
        </div>
      )}
    </div>
  );
}
