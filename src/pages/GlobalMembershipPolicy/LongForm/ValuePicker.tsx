import { useRef, useState } from 'react';
import CodeBracketsIcon from '@mattermost/compass-icons/components/code-brackets';
import CheckIcon from '@mattermost/compass-icons/components/check';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';

import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import PopoverMenu, {
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
  PopoverMenuDivider,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import { useOutsideClose } from '@/hooks/useOutsideClose';

import {
  LITERALS,
  channelVar,
  compatibleVariables,
  type AttrKind,
  type ReqValue,
} from '@/pages/GlobalMembershipPolicy/gmpData';

import styles from './GlobalMembershipPolicyLongForm.module.scss';

/**
 * Grouped combobox (research Pattern A) for the requirement/condition "Value"
 * cell. ONE picker per row — no mode toggle. Two labelled groups:
 *   - "Values" — type-compatible literals for the LHS attribute.
 *   - "Channel attributes" — type-compatible channel variables (blue token).
 * Picking from one group clears the other (mutual exclusion). Literals support
 * multi-select when the operator implies it (`multi`); single otherwise.
 * Built accessibly from PopoverMenu/MenuItem-family primitives with a labelled
 * group per section and keyboard support (Enter/Space open, Escape close).
 */
export default function ValuePicker({
  literalKey,
  kind,
  value,
  multi,
  error,
  hideVariables = false,
  onChange,
}: {
  /** Key into LITERALS for the compatible literal set (user-attr id or channel-attr literal id). */
  literalKey: string;
  /** Attribute kind — drives which channel variables are type-compatible. */
  kind: AttrKind;
  value: ReqValue;
  /** When true, literals accumulate as multiple chips (operator implies multi-value). */
  multi: boolean;
  error?: boolean;
  /** Suppress the "Channel attributes" group (e.g. channel-condition RHS is literal-only). */
  hideVariables?: boolean;
  onChange: (next: ReqValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  const literals = LITERALS[literalKey] ?? [];
  const vars = hideVariables ? [] : compatibleVariables(kind);

  const selectedLabels = value.mode === 'literal' ? value.labels : [];
  const selectedVarId = value.mode === 'variable' ? value.variableId : '';

  const pickLiteral = (label: string) => {
    if (multi) {
      const current = value.mode === 'literal' ? value.labels : [];
      const next = current.includes(label)
        ? current.filter((l) => l !== label)
        : [...current, label];
      onChange({ mode: 'literal', labels: next });
    } else {
      onChange({ mode: 'literal', labels: [label] });
      setOpen(false);
    }
  };

  const pickVariable = (variableId: string) => {
    onChange({ mode: 'variable', variableId });
    setOpen(false);
  };

  const isEmpty =
    (value.mode === 'literal' && value.labels.length === 0) ||
    (value.mode === 'variable' && !value.variableId);

  const triggerClass = [
    styles['gmp__value-trigger'],
    error ? styles['gmp__value-trigger--error'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['gmp__value-picker']} ref={open ? ref : undefined}>
      <button
        type="button"
        className={triggerClass}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles['gmp__value-trigger-content']}>
          {isEmpty ? (
            <span className={styles['gmp__value-placeholder']}>
              Pick a value or a channel attribute.
            </span>
          ) : value.mode === 'variable' ? (
            <span className={styles['gmp__variable-token']}>
              <Icon size="12" glyph={<CodeBracketsIcon />} />
              {channelVar(selectedVarId)?.label}
            </span>
          ) : (
            selectedLabels.map((l) => (
              <Chip key={l} size="Small" tone="neutral">
                {l}
              </Chip>
            ))
          )}
        </span>
        <span className={styles['gmp__value-caret']} aria-hidden>
          <Icon size="12" glyph={<ChevronDownIcon />} />
        </span>
      </button>

      {open && (
        <div className={styles['gmp__value-pop']}>
          <PopoverMenu aria-label="Value or channel attribute">
            {literals.length > 0 && (
              <PopoverMenuGroup aria-label="Values">
                <PopoverMenuGroupTitle>Values</PopoverMenuGroupTitle>
                {literals.map((lit) => {
                  const checked = selectedLabels.includes(lit.label);
                  return (
                    <button
                      key={lit.id}
                      type="button"
                      role="option"
                      aria-selected={checked}
                      className={styles['gmp__value-opt']}
                      onClick={() => pickLiteral(lit.label)}
                    >
                      <span className={styles['gmp__value-opt-label']}>
                        {lit.label}
                      </span>
                      {checked && (
                        <span className={styles['gmp__value-opt-check']} aria-hidden>
                          <Icon size="16" glyph={<CheckIcon />} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </PopoverMenuGroup>
            )}

            {literals.length > 0 && vars.length > 0 && <PopoverMenuDivider />}

            {vars.length > 0 && (
              <PopoverMenuGroup aria-label="Channel attributes">
                <PopoverMenuGroupTitle>Channel attributes</PopoverMenuGroupTitle>
                {vars.map((v) => {
                  const checked = selectedVarId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="option"
                      aria-selected={checked}
                      className={[
                        styles['gmp__value-opt'],
                        styles['gmp__value-opt--variable'],
                      ].join(' ')}
                      onClick={() => pickVariable(v.id)}
                    >
                      <span className={styles['gmp__value-opt-var']}>
                        <Icon size="12" glyph={<CodeBracketsIcon />} />
                        {v.label}
                      </span>
                      {checked && (
                        <span className={styles['gmp__value-opt-check']} aria-hidden>
                          <Icon size="16" glyph={<CheckIcon />} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </PopoverMenuGroup>
            )}
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}
