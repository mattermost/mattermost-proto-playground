import type { ReactNode } from 'react';
import { ShortcutTagGroup } from '@/components/ShortcutTag/ShortcutTag';
import styles from './Tooltip.module.scss';

export type TooltipArrow = 'Top' | 'Right' | 'Bottom' | 'Left';

export interface TooltipShortcutKey {
  label: string;
}

export interface TooltipProps {
  /** Tooltip label text. */
  label: string;
  /** Arrow direction. Default: Right. */
  arrow?: TooltipArrow;
  /** Optional hint text shown below label. */
  hint?: string;
  /** Optional keyboard shortcut keys shown below label. */
  shortcutKeys?: TooltipShortcutKey[];
  /** Optional leading icon node. */
  icon?: ReactNode;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Tooltip component matching Figma design.
 * Dark overlay for hover context with optional arrow, hint, and keyboard shortcuts.
 */
export default function Tooltip({
  label,
  arrow = 'Right',
  hint,
  shortcutKeys,
  icon,
  className = '',
}: TooltipProps) {
  const arrowClass = styles[`tooltip--arrow-${arrow.toLowerCase()}`] ?? '';

  const rootClass = [styles.tooltip, arrowClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['tooltip__container']}>
        <div className={styles['tooltip__content']}>
          {icon != null && (
            <span className={styles['tooltip__icon']} aria-hidden>
              {icon}
            </span>
          )}
          <span className={styles['tooltip__label']}>{label}</span>
        </div>

        {shortcutKeys && shortcutKeys.length > 0 && (
          <div className={styles['tooltip__shortcuts']}>
            <ShortcutTagGroup
              labels={shortcutKeys.map((key) => key.label)}
              location="Tooltips"
              size="Small"
            />
          </div>
        )}

        {hint && <span className={styles['tooltip__hint']}>{hint}</span>}
      </div>

      <div className={styles['tooltip__arrow']} aria-hidden />
    </div>
  );
}
