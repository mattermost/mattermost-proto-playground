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
   * Sectioned rows get a top border and vertical padding (AutomationFormEditor).
   * Plain rows rely on parent gap (Agent Settings).
   */
  sectioned?: boolean;
  /**
   * Divided rows get a top border and vertical padding (Access / Advanced).
   */
  divided?: boolean;
  /** Gap inside the fields column. Default: s. */
  fieldsGap?: 's' | 'm' | 'l';
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
  fieldsGap = 's',
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
        <div
          className={[
            styles['settings-row__fields'],
            styles[`settings-row__fields--gap-${fieldsGap}`],
          ].join(' ')}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
