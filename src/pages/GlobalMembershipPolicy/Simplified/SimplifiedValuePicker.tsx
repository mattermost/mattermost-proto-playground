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
  pairedChannelVar,
  type AttrKind,
  type ReqValue,
} from '@/pages/GlobalMembershipPolicy/gmpData';

import styles from './GlobalMembershipPolicySimplified.module.scss';

/**
 * Simplified copy of the LongForm ValuePicker (Simplification 2.1). The only
 * behavioral change vs. the original: the "Channel attributes" group is filtered
 * by SCHEMA PAIR — a user attribute offers AT MOST the ONE channel variable that
 * shares its schema/source (`pairedChannelVar`) rather than every same-`kind`
 * channel attribute (the original used `compatibleVariables`). User attributes
 * with no schema pair (e.g. Nationality, Community of interest) show literals
 * only — no channel-attributes group at all.
 *
 * Text attributes (`kind: 'text'`) use a combobox: focus on an empty field
 * opens the channel-attribute menu; typing dismisses it; clearing the field
 * brings it back.
 *
 * Copied — not imported — from LongForm/ValuePicker.tsx so the LongForm scene
 * stays byte-for-byte untouched. Literal handling is unchanged.
 */
export default function SimplifiedValuePicker({
  userAttrId,
  attrKind,
  literalKey,
  value,
  multi,
  error,
  onChange,
}: {
  /** User-attribute id — drives the single schema-paired channel variable. */
  userAttrId: string;
  /** Attribute kind — switches to the text split control when `text`. */
  attrKind: AttrKind;
  /** Key into LITERALS for the compatible literal set. */
  literalKey: string;
  value: ReqValue;
  /** When true, literals accumulate as multiple chips (operator implies multi-value). */
  multi: boolean;
  error?: boolean;
  onChange: (next: ReqValue) => void;
}) {
  if (attrKind === 'text') {
    return (
      <SimplifiedTextValuePicker
        userAttrId={userAttrId}
        value={value}
        error={error}
        onChange={onChange}
      />
    );
  }

  return (
    <SimplifiedLiteralValuePicker
      userAttrId={userAttrId}
      literalKey={literalKey}
      value={value}
      multi={multi}
      error={error}
      onChange={onChange}
    />
  );
}

function SimplifiedTextValuePicker({
  userAttrId,
  value,
  error,
  onChange,
}: {
  userAttrId: string;
  value: ReqValue;
  error?: boolean;
  onChange: (next: ReqValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  const paired = pairedChannelVar(userAttrId);
  const isVariable = value.mode === 'variable';
  const selectedVarId = isVariable ? value.variableId : '';
  const literalText = isVariable ? '' : (value.labels[0] ?? '');
  const showMenu = open && paired != null;

  const openMenuForEmptyLiteral = () => {
    if (paired != null && !isVariable && literalText === '') {
      setOpen(true);
    }
  };

  const pickVariable = (variableId: string) => {
    onChange({ mode: 'variable', variableId });
    setOpen(false);
  };

  const pickFixedText = () => {
    onChange({ mode: 'literal', labels: [''] });
    setOpen(false);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      setOpen(true);
    });
  };

  const handleLiteralChange = (nextText: string) => {
    onChange({ mode: 'literal', labels: [nextText] });
    if (nextText.length > 0) {
      setOpen(false);
      return;
    }
    if (paired != null && document.activeElement === inputRef.current) {
      setOpen(true);
    }
  };

  const comboClass = [
    styles['gmp__text-value-combo'],
    error ? styles['gmp__text-value-combo--error'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const triggerClass = [
    styles['gmp__value-trigger'],
    error ? styles['gmp__value-trigger--error'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['gmp__value-picker']} ref={open ? ref : undefined}>
      {isVariable ? (
        <button
          type="button"
          className={triggerClass}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={styles['gmp__value-trigger-content']}>
            <span className={styles['gmp__variable-token']}>
              <Icon size="12" glyph={<CodeBracketsIcon />} />
              {channelVar(selectedVarId)?.label}
            </span>
          </span>
          <span className={styles['gmp__value-caret']} aria-hidden>
            <Icon size="12" glyph={<ChevronDownIcon />} />
          </span>
        </button>
      ) : (
        <div className={comboClass}>
          <input
            ref={inputRef}
            type="text"
            className={styles['gmp__text-value-input']}
            value={literalText}
            placeholder="Enter text…"
            aria-label="Fixed text value"
            aria-haspopup={paired != null ? 'listbox' : undefined}
            aria-expanded={paired != null ? open : undefined}
            onFocus={openMenuForEmptyLiteral}
            onChange={(event) => handleLiteralChange(event.target.value)}
          />
          {paired != null && literalText === '' && (
            <span className={styles['gmp__text-value-caret']} aria-hidden>
              <Icon size="12" glyph={<ChevronDownIcon />} />
            </span>
          )}
        </div>
      )}

      {showMenu && (
        <div className={styles['gmp__value-pop']}>
          <PopoverMenu aria-label="Text comparison target">
            <PopoverMenuGroup aria-label="Channel attribute">
              <PopoverMenuGroupTitle>Channel attribute</PopoverMenuGroupTitle>
              <button
                type="button"
                role="option"
                aria-selected={isVariable}
                className={[
                  styles['gmp__value-opt'],
                  styles['gmp__value-opt--variable'],
                ].join(' ')}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pickVariable(paired.id)}
              >
                <span className={styles['gmp__value-opt-var']}>
                  <Icon size="12" glyph={<CodeBracketsIcon />} />
                  {paired.label}
                </span>
                {isVariable && (
                  <span className={styles['gmp__value-opt-check']} aria-hidden>
                    <Icon size="16" glyph={<CheckIcon />} />
                  </span>
                )}
              </button>
            </PopoverMenuGroup>

            {isVariable && (
              <>
                <PopoverMenuDivider />
                <PopoverMenuGroup aria-label="Fixed text">
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    className={styles['gmp__value-opt']}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={pickFixedText}
                  >
                    <span className={styles['gmp__value-opt-label']}>
                      Enter fixed text
                    </span>
                  </button>
                </PopoverMenuGroup>
              </>
            )}
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}

function SimplifiedLiteralValuePicker({
  userAttrId,
  literalKey,
  value,
  multi,
  error,
  onChange,
}: {
  userAttrId: string;
  literalKey: string;
  value: ReqValue;
  multi: boolean;
  error?: boolean;
  onChange: (next: ReqValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  const literals = LITERALS[literalKey] ?? [];
  const paired = pairedChannelVar(userAttrId);
  const vars = paired ? [paired] : [];

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
              {vars.length > 0
                ? 'Pick a value or a channel attribute.'
                : 'Pick a value.'}
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
