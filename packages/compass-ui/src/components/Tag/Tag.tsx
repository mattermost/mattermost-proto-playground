import type { ReactNode } from 'react';
import styles from './Tag.module.scss';

export type TagType =
  | 'Default'
  | 'Info'
  | 'Info Dim'
  | 'Danger'
  | 'Success'
  | 'Warning';

export type TagSize = 'Small' | 'X-Small';
export type TagCasing = 'Title Case' | 'All Caps';

export type TagProps = {
  /** Tag label text. */
  label: string;
  /** Semantic colour type. Default: Default. */
  type?: TagType;
  /** Size variant. Default: X-Small. */
  size?: TagSize;
  /** Text casing. Default: Title Case. */
  casing?: TagCasing;
  /** Optional leading icon node. */
  leadingIcon?: ReactNode;
  /** Merged onto the root after variant classes (e.g. layout overrides in a parent row). */
  className?: string;
};

const TYPE_CLASS: Record<TagType, string> = {
  Default: styles['tag--type-default'],
  Info: styles['tag--type-info'],
  'Info Dim': styles['tag--type-info-dim'],
  Danger: styles['tag--type-danger'],
  Success: styles['tag--type-success'],
  Warning: styles['tag--type-warning'],
};

/**
 * Compact pill for roles, status, tiers, and other metadata labels.
 * Maps to Figma Label Tag (v1.0.1).
 */
export default function Tag({
  label,
  type = 'Default',
  size = 'X-Small',
  casing = 'Title Case',
  leadingIcon,
  className = '',
}: TagProps) {
  const classes = [
    styles.tag,
    TYPE_CLASS[type],
    size === 'Small'
      ? styles['tag--size-small']
      : styles['tag--size-x-small'],
    casing === 'All Caps' ? styles['tag--casing-all-caps'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {leadingIcon && (
        <span className={styles['tag__icon']} aria-hidden>
          {leadingIcon}
        </span>
      )}
      <span className={styles['tag__label']}>{label}</span>
    </span>
  );
}
