import type { ChangeEvent } from 'react';
import styles from './EditableTitle.module.scss';

export type EditableTitleSize = 'page' | 'sidebar' | 'modal';

export interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  size?: EditableTitleSize;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

/** Inline editable automation name used in editor chrome titles. */
export default function EditableTitle({
  value,
  onChange,
  size = 'page',
  placeholder = 'New automation',
  ariaLabel = 'Automation name',
  className = '',
}: EditableTitleProps) {
  return (
    <input
      type="text"
      className={[
        styles['editable-title'],
        styles[`editable-title--${size}`],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    />
  );
}
