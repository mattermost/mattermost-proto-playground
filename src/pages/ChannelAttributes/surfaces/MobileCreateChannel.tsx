import { useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Icon from '@/components/ui/Icon/Icon';
import Switch from '@/components/ui/Switch/Switch';
import TextInput from '@/components/ui/TextInput/TextInput';
import Select from '@/components/ui/Select/Select';
import ErrorMessage from '@/components/ui/ErrorMessage/ErrorMessage';
import ClassificationPill from '../shared/ClassificationPill';
import {
  ADMIN_CLASSIFICATION_OPTIONS,
  ADMIN_PROGRAM_OPTIONS,
  ADMIN_HANDLING_OPTIONS,
  type ClassificationLevel,
} from '../shared/channelAttrData';
import styles from './mobileCreate.module.scss';

export type MobileCreateState =
  | 'default-on' // Make-private toggle ON, mandatory attributes present, no errors
  | 'error'; // Create tapped with a mandatory attribute unset → inline field error

export interface MobileCreateChannelProps {
  state: MobileCreateState;
  onClose?: () => void;
}

/**
 * Native mobile "New channel" screen matching the iOS mockup: dark-blue nav bar
 * ("×" left, "New channel" title, "Create" top-right), a Make-private toggle row,
 * floating-label Name / Purpose / Header fields, THEN the "Channel attributes"
 * section (FR-1) with mandatory Classification* + Handling* required markers, an
 * optional Programs multi-select, and "+ Add attribute".
 *
 * Attribute logic is identical to the desktop CreateChannelModal — same shared
 * option lists (ADMIN_* from channelAttrData, clearance-scoped, no hidden count)
 * and the same validate-on-submit rule: a mandatory attribute unset when Create is
 * tapped renders a named inline error associated via aria-describedby (FR-4,
 * NFR-A11Y-3). The data model is not forked.
 */
export default function MobileCreateChannel({ state, onClose }: MobileCreateChannelProps) {
  const [classification, setClassification] = useState<ClassificationLevel>('SECRET');

  // Validate-on-submit: in the error scene the mandatory Handling caveat is unset.
  const handlingUnset = state === 'error';

  return (
    <div className={styles.phone}>
      <div className={styles.phone__statusbar}>
        <span>9:41</span>
        <span className={styles['phone__notch']} aria-hidden />
        <span>▮▮▮</span>
      </div>

      <div className={styles.phone__nav}>
        <button type="button" className={styles['phone__nav-btn']} onClick={onClose} aria-label="Close">
          <Icon size="24" glyph={<CloseIcon />} />
        </button>
        <span className={styles['phone__nav-title']}>New channel</span>
        <button type="button" className={styles['phone__nav-action']}>
          Create
        </button>
      </div>

      <div className={styles.phone__body}>
        {/* Make-private toggle row */}
        <div className={styles.phone__toggle}>
          <span className={styles['phone__toggle-icon']} aria-hidden>
            <Icon size="20" glyph={<LockOutlineIcon />} />
          </span>
          <div className={styles['phone__toggle-copy']}>
            <span className={styles['phone__toggle-title']}>Make private</span>
            <span className={styles['phone__toggle-desc']}>
              When a channel is set to private, only invited team members can access and participate
              in that channel.
            </span>
          </div>
          <Switch defaultChecked aria-label="Make private" />
        </div>

        <TextInput label="Name" defaultValue="Operation Aurora" />
        <TextInput label="Purpose (optional)" defaultValue="" />
        <TextInput label="Header (optional)" defaultValue="" />

        <div className={styles.phone__divider} />

        {/* Channel attributes — identical logic to desktop (FR-1) */}
        <div className={styles.phone__attrs}>
          <h3 className={styles['phone__attrs-title']}>Channel attributes</h3>
          <p className={styles['phone__attrs-sub']}>
            Configure attributes and values for this channel · Required attributes must be set
          </p>

          {/* Classification (mandatory, pre-filled with system default) */}
          <div className={styles.phone__field}>
            <span className={styles['phone__field-label']}>
              Classification<span className={styles['phone__req']}> *</span>
            </span>
            <div className={styles['phone__class-picker']}>
              <ClassificationPill level={classification} />
              <Select
                width="fit"
                value={classification}
                onChange={(e) => setClassification(e.target.value as ClassificationLevel)}
                aria-label="Classification"
              >
                {ADMIN_CLASSIFICATION_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Programs (optional multi-select) */}
          <div className={styles.phone__field}>
            <span className={styles['phone__field-label']}>Programs</span>
            <Select defaultValue="" aria-label="Programs">
              <option value="" disabled>
                Select one or more values
              </option>
              {ADMIN_PROGRAM_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </Select>
          </div>

          {/* Handling (mandatory) — the error-state driver */}
          <div className={styles.phone__field}>
            <span className={styles['phone__field-label']}>
              Handling<span className={styles['phone__req']}> *</span>
            </span>
            <Select
              defaultValue={handlingUnset ? '' : 'NOFORN'}
              invalid={handlingUnset}
              aria-label="Handling"
              aria-describedby={handlingUnset ? 'mobile-handling-error' : undefined}
            >
              <option value="" disabled>
                Select one or more values
              </option>
              {ADMIN_HANDLING_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </Select>
            {handlingUnset && (
              <div id="mobile-handling-error" className={styles['phone__field-error']}>
                <ErrorMessage message="Handling is required" />
              </div>
            )}
          </div>

          <button type="button" className={styles.phone__add}>
            <Icon size="16" glyph={<PlusIcon />} />
            <span>Add attribute</span>
          </button>
        </div>
      </div>
    </div>
  );
}
