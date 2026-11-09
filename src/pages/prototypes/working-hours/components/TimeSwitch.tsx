import { useId } from 'react';
import styles from './TimeSwitch.module.scss';

type Option = {
  id: string;
  label: string;
  disabled?: boolean;
};

type Props = {
  label: string;
  value: string;
  options: Option[];
  onChange: (id: string) => void;
};

/** Two-or-more exclusive choices, drawn as the prototype's pill segmented control. */
export function TimeSwitch({ label, value, options, onChange }: Props) {
  const labelId = useId();
  return (
    <div className={styles['time-switch']}>
      <span className={styles['time-switch__label']} id={labelId}>
        {label}
      </span>
      <div
        className={styles['time-switch__control']}
        role="radiogroup"
        aria-labelledby={labelId}
      >
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={option.disabled}
              className={[
                styles['time-switch__option'],
                selected && styles['time-switch__option--selected'],
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onChange(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
