import type { ReactNode } from 'react';
import styles from './ConsoleSetting.module.scss';

export interface ConsoleSettingProps {
  /** Setting label shown on the left column. */
  label: string;
  /** Help text shown below the control. */
  helpText?: ReactNode;
  /** Show an "Enterprise" tag below the label. */
  enterpriseTag?: boolean;
  /** The control element(s) — radio buttons, text input, select, etc. */
  children: ReactNode;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * System Console configuration setting — the core two-column layout used on
 * every settings page.
 *
 * Left column: label (290px fixed) + optional Enterprise tag.
 * Right column: control slot (children) + optional help text below.
 *
 * Pass any control as children: Radio, TextInput, Select, Button, etc.
 *
 * @see Figma: Compass System Console → Label container + help-text container
 */
export default function ConsoleSetting({
  label,
  helpText,
  enterpriseTag = false,
  children,
  className = '',
}: ConsoleSettingProps) {
  const rootClass = [styles['console-setting'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['console-setting__label-column']}>
        <div className={styles['console-setting__label-wrapper']}>
          <span className={styles['console-setting__label']}>{label}:</span>
        </div>
        {enterpriseTag && (
          <span className={styles['console-setting__enterprise-tag']}>
            Enterprise
          </span>
        )}
      </div>
      <div className={styles['console-setting__control-column']}>
        <div className={styles['console-setting__control']}>{children}</div>
        {helpText != null && (
          <p className={styles['console-setting__help-text']}>{helpText}</p>
        )}
      </div>
    </div>
  );
}
