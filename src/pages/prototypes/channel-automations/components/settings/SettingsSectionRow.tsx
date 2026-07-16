import type { ReactNode } from 'react';
import styles from './SettingsSectionRow.module.scss';

export interface SettingsSectionRowProps {
  label: string;
  children: ReactNode;
  className?: string;
  /** Id for the label element (aria-labelledby). */
  labelId?: string;
  /** Semantic label element. Default: p. Use h3 for top-level form sections. */
  labelAs?: 'p' | 'h3';
  /**
   * Sectioned rows get a top border and vertical padding (Automation Settings).
   * Same rhythm as `divided`.
   */
  sectioned?: boolean;
  /**
   * Divided rows get a top border and vertical padding (Agent Settings / Access / Advanced).
   * First child drops the top border and padding.
   */
  divided?: boolean;
}

/** Shared two-column settings row: label | fields. Stacks under 600px. */
export default function SettingsSectionRow({
  label,
  children,
  className = '',
  labelId,
  labelAs = 'p',
  sectioned = false,
  divided = false,
}: SettingsSectionRowProps) {
  const LabelTag = labelAs;
  const hostClass = [
    styles['settings-row-host'],
    sectioned ? styles['settings-row-host--sectioned'] : '',
    divided ? styles['settings-row-host--divided'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={hostClass}>
      <div className={styles['settings-row']}>
        <LabelTag id={labelId} className={styles['settings-row__label']}>
          {label}
        </LabelTag>
        <div className={styles['settings-row__fields']}>
          {children}
        </div>
      </div>
    </div>
  );
}
