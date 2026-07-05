import type { HTMLAttributes, ReactNode } from 'react';
import Scrollbar from '@/components/Scrollbar/Scrollbar';
import styles from './PopoverMenu.module.scss';

export interface PopoverMenuProps extends HTMLAttributes<HTMLDivElement> {
  /** Parent menus use Elevation 4; nested child menus use Elevation 5. */
  variant?: 'parent' | 'child';
  children: ReactNode;
}

/**
 * Surface container for popover-style menus — border, fill, elevation, and width
 * constraints per Compass. Compose with {@link MenuItem} rows and optional
 * titles, group labels, and dividers. Use {@link PopoverMenuScroll} when the item
 * list should scroll while a {@link PopoverMenuTitle} stays pinned.
 */
export default function PopoverMenu({
  variant = 'parent',
  children,
  className = '',
  ...rest
}: PopoverMenuProps) {
  const rootClass = [
    styles['popover-menu'],
    variant === 'child'
      ? styles['popover-menu--child']
      : styles['popover-menu--parent'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} {...rest}>
      {children}
    </div>
  );
}

export interface PopoverMenuScrollProps {
  children: ReactNode;
  /** Maximum height of the scrollable region (coerces numbers to px). */
  maxHeight: string | number;
  className?: string;
}

/** Scrollable region for long item lists; keeps a sibling title visible when used with `maxHeight`. */
export function PopoverMenuScroll({
  maxHeight,
  children,
  className = '',
}: PopoverMenuScrollProps) {
  const maxH =
    typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
  return (
    <Scrollbar
      className={[styles['popover-menu__scroll'], className]
        .filter(Boolean)
        .join(' ')}
      style={{ maxHeight: maxH }}
    >
      {children}
    </Scrollbar>
  );
}

export interface PopoverMenuTitleProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

/** Optional heading above menu items; keep pinned outside a scrolling body when using `maxHeight` on `PopoverMenu`. */
export function PopoverMenuTitle({
  children,
  className = '',
  ...rest
}: PopoverMenuTitleProps) {
  return (
    <p
      className={[styles['popover-menu__title'], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </p>
  );
}

export interface PopoverMenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Accessible label when the group has no visible `PopoverMenuGroupTitle`. */
  'aria-label'?: string;
}

/** Groups related menu items. */
export function PopoverMenuGroup({
  children,
  className = '',
  ...rest
}: PopoverMenuGroupProps) {
  return (
    <div
      role="group"
      className={[styles['popover-menu__group'], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface PopoverMenuGroupTitleProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

/** Optional label for a `PopoverMenuGroup`. */
export function PopoverMenuGroupTitle({
  children,
  className = '',
  ...rest
}: PopoverMenuGroupTitleProps) {
  return (
    <p
      className={[styles['popover-menu__group-title'], className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </p>
  );
}

export interface PopoverMenuDividerProps extends HTMLAttributes<HTMLDivElement> {}

/** Horizontal rule between groups or below a menu title. */
export function PopoverMenuDivider({
  className = '',
  ...rest
}: PopoverMenuDividerProps) {
  return (
    <div
      className={[styles['popover-menu__divider'], className].filter(Boolean).join(' ')}
      role="separator"
      {...rest}
    />
  );
}
