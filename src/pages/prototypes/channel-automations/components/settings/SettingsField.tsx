import type { ReactNode } from 'react';
import styles from './SettingsSectionRow.module.scss';

export interface SettingsFieldProps {
  children: ReactNode;
  className?: string;
}

/** Groups a control with its help text inside a settings row fields column. */
export default function SettingsField({
  children,
  className = '',
}: SettingsFieldProps) {
  return (
    <div
      className={[styles['settings-row__field'], className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
