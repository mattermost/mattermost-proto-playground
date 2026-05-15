import { useState } from 'react';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import {
  attributesUsedByPolicy,
  COMPLIANT_DEFAULTS,
  FIELD_LABEL,
  FIELD_OPTIONS,
  preFillFromUser,
} from './customSession';
import type { CustomSessionFields } from './customSession';
import type { PolicyContext, UserSimulationRow } from './types';
import styles from './SimulateAccess.module.scss';

export interface CustomSessionFormProps {
  user: UserSimulationRow;
  policy?: PolicyContext;
  /** When user has 0 real sessions, copy and CTAs adapt. */
  emptyMode: boolean;
  /** Initial values when re-opening an existing custom session. */
  initialValues?: CustomSessionFields;
  onCancel: () => void;
  onSubmit: (fields: CustomSessionFields) => void;
}

/**
 * Form used inside both the persistent card (Option C) and the inline ghost (Option B).
 * The wrapping chrome decides the framing; the form is identical.
 */
export default function CustomSessionForm({
  user,
  policy,
  emptyMode,
  initialValues,
  onCancel,
  onSubmit,
}: CustomSessionFormProps) {
  const prefill = initialValues
    ? { fields: initialValues, source: 'denied-session' as const, sourceLabel: undefined }
    : preFillFromUser(user);

  const [fields, setFields] = useState<CustomSessionFields>(prefill.fields);
  const [dirty, setDirty] = useState(false);
  const used = attributesUsedByPolicy(policy);

  function update(key: keyof CustomSessionFields, value: string) {
    setFields((p) => ({ ...p, [key]: value }));
    setDirty(true);
  }

  function reset() {
    setFields(prefill.fields);
    setDirty(false);
  }

  const sourceLine = (() => {
    if (emptyMode) return null;
    if (prefill.source === 'denied-session' && prefill.sourceLabel) {
      return `Pre-filled from a denied session — ${prefill.sourceLabel}.`;
    }
    if (prefill.source === 'recent-session' && prefill.sourceLabel) {
      return `Pre-filled from ${prefill.sourceLabel}.`;
    }
    return null;
  })();

  return (
    <div className={styles['sa-cs-form']}>
      {sourceLine && (
        <div className={styles['sa-cs-form__source']}>
          {sourceLine}
          {dirty && (
            <button type="button" className={styles['sa-cs-form__reset']} onClick={reset}>
              Reset to user's session
            </button>
          )}
        </div>
      )}

      <div className={styles['sa-cs-form__grid']}>
        {used.map((key) => (
          <label key={key} className={styles['sa-cs-form__field']}>
            <span className={styles['sa-cs-form__label']}>{FIELD_LABEL[key]}</span>
            <span className={styles['sa-cs-form__select-wrap']}>
              <select
                className={styles['sa-cs-form__select']}
                value={fields[key]}
                onChange={(e) => update(key, e.target.value)}
              >
                {FIELD_OPTIONS[key].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span className={styles['sa-cs-form__caret']} aria-hidden>
                <Icon glyph={<ChevronDownIcon />} size="12" />
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className={styles['sa-cs-form__footer']}>
        <Button emphasis="Tertiary" size="X-Small" onClick={onCancel}>
          Cancel
        </Button>
        <Button emphasis="Primary" size="X-Small" onClick={() => onSubmit(fields)}>
          Test
        </Button>
      </div>
    </div>
  );
}

// Suppress unused-import warning for COMPLIANT_DEFAULTS — re-exported for tests if needed.
void COMPLIANT_DEFAULTS;
