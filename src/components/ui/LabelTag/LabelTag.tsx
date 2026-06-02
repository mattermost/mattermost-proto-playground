import type { ReactNode } from 'react';
import styles from './LabelTag.module.scss';

export type LabelTagType =
  | 'Default'
  | 'Info'
  | 'Info Dim'
  | 'Danger'
  | 'Success'
  | 'Warning';
export type LabelTagSize = 'Small' | 'X-Small';
export type LabelTagCasing = 'Title Case' | 'All Caps';

export type LabelTagProps = {
  label: string;
  type?: LabelTagType;
  size?: LabelTagSize;
  casing?: LabelTagCasing;
  leadingIcon?: ReactNode;
  /** Merged onto the root after variant classes (e.g. layout overrides in a parent row). */
  className?: string;
};

const TYPE_CLASS: Record<LabelTagType, string> = {
  Default: styles['label-tag--type-default'],
  Info: styles['label-tag--type-info'],
  'Info Dim': styles['label-tag--type-info-dim'],
  Danger: styles['label-tag--type-danger'],
  Success: styles['label-tag--type-success'],
  Warning: styles['label-tag--type-warning'],
};

export default function LabelTag({
  label,
  type = 'Default',
  size = 'X-Small',
  casing = 'Title Case',
  leadingIcon,
  className = '',
}: LabelTagProps) {
  const classes = [
    styles['label-tag'],
    TYPE_CLASS[type],
    size === 'Small'
      ? styles['label-tag--size-small']
      : styles['label-tag--size-x-small'],
    casing === 'All Caps' ? styles['label-tag--casing-all-caps'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {leadingIcon && (
        <span className={styles['label-tag__icon']}>{leadingIcon}</span>
      )}
      <span className={styles['label-tag__label']}>{label}</span>
    </span>
  );
}
