import styles from './ShortcutTag.module.scss';

export type ShortcutTagSize = 'Small' | 'Medium' | 'Large';
export type ShortcutTagLocation = 'Default' | 'Tooltips';

export type ShortcutTagProps = {
  /** Key label (e.g. `⌘`, `Shift`, `K`). */
  label: string;
  size?: ShortcutTagSize;
  /** Default for menus and light surfaces; Tooltips for dark overlays. */
  location?: ShortcutTagLocation;
  className?: string;
};

const SIZE_CLASS: Record<ShortcutTagSize, string> = {
  Small: styles['shortcut-tag__key--size-small'],
  Medium: styles['shortcut-tag__key--size-medium'],
  Large: styles['shortcut-tag__key--size-large'],
};

const LOCATION_CLASS: Record<ShortcutTagLocation, string> = {
  Default: styles['shortcut-tag__key--location-default'],
  Tooltips: styles['shortcut-tag__key--location-tooltips'],
};

/**
 * Keyboard shortcut key chip for menus, tooltips, and popovers.
 *
 * @see Figma Shortcut Tag (Source: xkm54Q9IQcyo3c0pGeNIMH)
 */
export default function ShortcutTag({
  label,
  size = 'Small',
  location = 'Default',
  className = '',
}: ShortcutTagProps) {
  const rootClass = [
    styles['shortcut-tag__key'],
    SIZE_CLASS[size],
    LOCATION_CLASS[location],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <kbd className={rootClass}>{label}</kbd>;
}

export type ShortcutTagGroupProps = {
  /** Individual key labels (e.g. `['Ctrl', 'K']`). */
  labels: string[];
  size?: ShortcutTagSize;
  location?: ShortcutTagLocation;
  className?: string;
};

/** Inline row of shortcut tags for prose and notice copy. */
export function ShortcutTagGroup({
  labels,
  size = 'Small',
  location = 'Default',
  className = '',
}: ShortcutTagGroupProps) {
  const groupClass = [styles['shortcut-tag-group'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={groupClass}>
      {labels.map((label, index) => (
        <ShortcutTag
          key={`${label}-${index}`}
          label={label}
          size={size}
          location={location}
        />
      ))}
    </span>
  );
}
