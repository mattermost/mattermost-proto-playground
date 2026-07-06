import type { ReactNode } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Switch from '@/components/ui/Switch/Switch';
import Select from '@/components/ui/Select/Select';
import Button from '@/components/ui/Button/Button';
import styles from './AttributeSystem.module.scss';

interface DrawerProps {
  eyebrow: string;
  title: string;
  onClose: () => void;
  onSave?: () => void;
  saveLabel?: string;
  children: ReactNode;
}

export function Drawer({
  eyebrow,
  title,
  onClose,
  onSave,
  saveLabel = 'Done',
  children,
}: DrawerProps) {
  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.drawer} role="dialog" aria-label={title}>
        <div className={styles.drawer__head}>
          <div>
            <span className={styles.drawer__eyebrow}>{eyebrow}</span>
            <h2 className={styles.drawer__title}>{title}</h2>
          </div>
          <IconButton
            aria-label="Close"
            size="Small"
            icon={<Icon size="16" glyph={<CloseIcon />} />}
            onClick={onClose}
          />
        </div>
        <div className={styles.drawer__body}>{children}</div>
        <div className={styles.drawer__foot}>
          <Button emphasis="Tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button emphasis="Primary" onClick={onSave ?? onClose}>
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: ReactNode;
  help?: ReactNode;
  /** Tech-spec mapping note rendered in mono blue. */
  mapNote?: string;
  /** Locked by a higher authority (e.g. sysadmin) for this persona. */
  locked?: boolean;
  trailing?: ReactNode;
  children?: ReactNode;
}

export function Field({
  label,
  help,
  mapNote,
  locked = false,
  trailing,
  children,
}: FieldProps) {
  return (
    <div
      className={[styles.field, locked ? styles['field--locked'] : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.field__top}>
        <span className={styles.field__label}>
          {label}
          {locked && (
            <span className={styles.field__lock}>
              <Icon size="12" glyph={<LockOutlineIcon />} /> set by system admin
            </span>
          )}
        </span>
        {trailing}
      </div>
      {help && <p className={styles.field__help}>{help}</p>}
      {children && <div className={styles.field__control}>{children}</div>}
      {mapNote && <div className={styles.mapNote}>{mapNote}</div>}
    </div>
  );
}

interface ToggleFieldProps {
  label: ReactNode;
  help?: ReactNode;
  mapNote?: string;
  checked: boolean;
  disabled?: boolean;
  locked?: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleField({
  label,
  help,
  mapNote,
  checked,
  disabled,
  locked,
  onChange,
}: ToggleFieldProps) {
  return (
    <Field
      label={label}
      help={help}
      mapNote={mapNote}
      locked={locked}
      trailing={
        <Switch
          size="Small"
          checked={checked}
          disabled={disabled || locked}
          onChange={(e) => onChange((e.target as HTMLInputElement).checked)}
          aria-label={typeof label === 'string' ? label : undefined}
        />
      }
    />
  );
}

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  label: ReactNode;
  help?: ReactNode;
  mapNote?: string;
  value: T;
  options: Option<T>[];
  disabled?: boolean;
  locked?: boolean;
  onChange: (value: T) => void;
}

export function SelectField<T extends string>({
  label,
  help,
  mapNote,
  value,
  options,
  disabled,
  locked,
  onChange,
}: SelectFieldProps<T>) {
  return (
    <Field label={label} help={help} mapNote={mapNote} locked={locked}>
      <Select
        size="Small"
        value={value}
        disabled={disabled || locked}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}

interface RadioFieldProps<T extends string> {
  label: ReactNode;
  help?: ReactNode;
  mapNote?: string;
  value: T;
  options: { value: T; title: string; desc: string }[];
  onChange: (value: T) => void;
}

export function RadioField<T extends string>({
  label,
  help,
  mapNote,
  value,
  options,
  onChange,
}: RadioFieldProps<T>) {
  return (
    <Field label={label} help={help} mapNote={mapNote}>
      <div className={styles.radioRow}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              className={[
                styles.radioOption,
                active ? styles['radioOption--active'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-pressed={active}
              onClick={() => onChange(o.value)}
            >
              <div className={styles.radioOption__text}>
                <span className={styles.radioOption__title}>{o.title}</span>
                <span className={styles.radioOption__desc}>{o.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </Field>
  );
}
