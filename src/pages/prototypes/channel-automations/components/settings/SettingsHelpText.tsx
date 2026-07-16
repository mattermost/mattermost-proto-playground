import type { ReactNode } from 'react';
import styles from './SettingsHelpText.module.scss';

export interface SettingsHelpTextProps {
  children: ReactNode;
  className?: string;
}

/** Secondary help copy under settings controls. */
export default function SettingsHelpText({
  children,
  className = '',
}: SettingsHelpTextProps) {
  return (
    <p
      className={[styles['settings-help'], className].filter(Boolean).join(' ')}
    >
      {children}
    </p>
  );
}
