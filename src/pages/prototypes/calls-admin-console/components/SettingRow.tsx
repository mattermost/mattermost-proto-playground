import { useId, type ReactNode } from 'react';
import { Radio } from '@mattermost/compass-ui/components/radio';
import styles from './SettingRow.module.scss';

export interface SettingRowProps {
  label: ReactNode;
  /** Help text under the control. */
  help?: ReactNode;
  children: ReactNode;
}

/** System Console label / control / help layout used inside an `AdminPanel` body. */
export function SettingRow({ label, help, children }: SettingRowProps) {
  return (
    <div className={styles['setting-row']}>
      <div className={styles['setting-row__label']}>{label}</div>
      <div className={styles['setting-row__field']}>
        {children}
        {help ? <p className={styles['setting-row__help']}>{help}</p> : null}
      </div>
    </div>
  );
}

export interface BooleanSettingProps extends Omit<SettingRowProps, 'children'> {
  defaultValue: boolean;
}

/** True / False radio setting row. */
export function BooleanSetting({
  label,
  help,
  defaultValue,
}: BooleanSettingProps) {
  const name = useId();
  return (
    <SettingRow label={label} help={help}>
      <div className={styles['setting-row__radios']}>
        <Radio name={name} value="true" defaultChecked={defaultValue}>
          True
        </Radio>
        <Radio name={name} value="false" defaultChecked={!defaultValue}>
          False
        </Radio>
      </div>
    </SettingRow>
  );
}
