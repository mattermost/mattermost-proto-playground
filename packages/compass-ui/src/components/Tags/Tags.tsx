import type { ReactNode } from 'react';
import { toKebab } from '@/utils/string';
import styles from './Tags.module.scss';

export type TagSize = 'Small' | 'X-Small';

export type TagType =
  | 'General'
  | 'Info'
  | 'Danger'
  | 'Success'
  | 'Warning'
  | 'Info Dim';

export type TagCasing = 'Title Case' | 'All Caps';

export interface TagsProps {
  /** Tag label text. */
  children: ReactNode;
  /** Optional CSS class name. */
  className?: string;
  /** Size variant. Default: X-Small. */
  size?: TagSize;
  /** Semantic colour type. Default: General. */
  type?: TagType;
  /** Text casing. Default: Title Case. */
  casing?: TagCasing;
  /** Optional leading icon node. */
  leadingIcon?: ReactNode;
}

/**
 * Tag / Label Tag component for status, role, or classification labels.
 * Maps to Figma Label Tag (v1.0.1) with 6 semantic types.
 *
 * @see Figma Tags (Source: xkm54Q9IQcyo3c0pGeNIMH)
 */
export default function Tags({
  casing = 'Title Case',
  children,
  className = '',
  leadingIcon,
  size = 'X-Small',
  type = 'General',
}: TagsProps) {
  const sizeClass = styles[`tag--size-${toKebab(size)}`];
  const typeClass = styles[`tag--type-${toKebab(type)}`];
  const casingClass = casing === 'All Caps' ? styles['tag--all-caps'] : '';

  const rootClass = [styles.tag, sizeClass, typeClass, casingClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={rootClass}>
      {leadingIcon != null && (
        <span className={styles['tag__icon']} aria-hidden>
          {leadingIcon}
        </span>
      )}
      <span className={styles['tag__label']}>{children}</span>
    </span>
  );
}
