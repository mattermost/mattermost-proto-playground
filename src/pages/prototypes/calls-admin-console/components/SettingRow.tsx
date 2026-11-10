import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Radio } from '@mattermost/compass-ui/components/radio';
import styles from './SettingRow.module.scss';

export interface SettingRowProps {
  label: ReactNode;
  /** Help text under the control. */
  help?: ReactNode;
  /** A single form control. It gets an `id` so the row's `<label>` names it. */
  children: ReactElement<{ id?: string }>;
  /** Let the control fill the field column (for example a `TextArea`). */
  wide?: boolean;
}

/** System Console label / control / help layout used inside an `AdminPanel` body. */
export function SettingRow({ label, help, children, wide }: SettingRowProps) {
  const controlId = useId();
  const helpId = useId();
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: controlId,
        ...(help ? { 'aria-describedby': helpId } : {}),
      } as Record<string, unknown>)
    : children;
  return (
    <div className={styles['setting-row']}>
      <label
        className={`${styles['setting-row__label']} ${styles['setting-row__label--input']}`}
        htmlFor={controlId}
      >
        {label}
      </label>
      <div className={styles['setting-row__field']}>
        <div
          className={`${styles['setting-row__control']} ${
            wide ? styles['setting-row__control--wide'] : ''
          }`}
        >
          {control}
        </div>
        {help ? (
          <p id={helpId} className={styles['setting-row__help']}>
            {help}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export interface BooleanSettingProps extends Omit<
  SettingRowProps,
  'children' | 'wide'
> {
  defaultValue: boolean;
}

/** True / False radio setting row. */
export function BooleanSetting({
  label,
  help,
  defaultValue,
}: BooleanSettingProps) {
  const name = useId();
  const labelId = useId();
  const helpId = useId();
  return (
    <div className={styles['setting-row']}>
      <div
        id={labelId}
        className={`${styles['setting-row__label']} ${styles['setting-row__label--radio']}`}
      >
        {label}
      </div>
      <div className={styles['setting-row__field']}>
        <div
          className={styles['setting-row__radios']}
          role="radiogroup"
          aria-labelledby={labelId}
          aria-describedby={help ? helpId : undefined}
        >
          <Radio name={name} value="true" defaultChecked={defaultValue}>
            True
          </Radio>
          <Radio name={name} value="false" defaultChecked={!defaultValue}>
            False
          </Radio>
        </div>
        {help ? (
          <p id={helpId} className={styles['setting-row__help']}>
            {help}
          </p>
        ) : null}
      </div>
    </div>
  );
}
