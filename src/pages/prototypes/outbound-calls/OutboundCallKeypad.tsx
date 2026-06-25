import { TextInput } from '@mattermost/compass-ui';
import { sanitizeDigits } from '@/pages/prototypes/outbound-calls/outboundCallUtils';
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import styles from './OutboundCalls.module.scss';

export const KEYPAD_KEYS: { key: string; sub?: string }[] = [
  { key: '1' },
  { key: '2', sub: 'ABC' },
  { key: '3', sub: 'DEF' },
  { key: '4', sub: 'GHI' },
  { key: '5', sub: 'JKL' },
  { key: '6', sub: 'MNO' },
  { key: '7', sub: 'PQRS' },
  { key: '8', sub: 'TUV' },
  { key: '9', sub: 'WXYZ' },
  { key: '*' },
  { key: '0', sub: '+' },
  { key: '#' },
];

export function KeypadInput({
  value,
  placeholder,
  onChange,
  onEnter,
  trailing,
  inputClassName,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  trailing?: ReactNode;
  /** Optional class for the text field (e.g. dialer vs pip). */
  inputClassName?: string;
}) {
  return (
    <TextInput
      className={inputClassName ?? styles['keypad__input']}
      size="Small"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(sanitizeDigits(e.target.value))}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (onEnter && e.key === 'Enter') {
          e.preventDefault();
          onEnter();
        }
      }}
      placeholder={placeholder}
      inputMode="tel"
      autoComplete="off"
      aria-label="Phone number"
      trailingIcon={trailing}
    />
  );
}

export function KeypadGrid({ onPress }: { onPress: (k: string) => void }) {
  return (
    <div className={styles['keypad__grid']}>
      {KEYPAD_KEYS.map(({ key, sub }) => (
        <button
          key={key}
          type="button"
          className={styles['keypad__key']}
          onClick={() => onPress(key)}
        >
          <span className={styles['keypad__key-main']}>{key}</span>
          {sub && <span className={styles['keypad__key-sub']}>{sub}</span>}
        </button>
      ))}
    </div>
  );
}
