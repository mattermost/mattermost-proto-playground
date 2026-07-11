import { useState } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import TextArea from '@/components/ui/TextArea/TextArea';
import Select from '@/components/ui/Select/Select';
import Icon from '@/components/ui/Icon/Icon';
import Spinner from '@/components/ui/Spinner/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage/ErrorMessage';
import ClassificationPill from '../shared/ClassificationPill';
import {
  ADMIN_CLASSIFICATION_OPTIONS,
  ADMIN_PROGRAM_OPTIONS,
  ADMIN_HANDLING_OPTIONS,
  type ClassificationLevel,
} from '../shared/channelAttrData';
import styles from './create.module.scss';

export type CreateModalState =
  | 'default-on' // toggle ON, mandatory pre-filled
  | 'default-off' // toggle OFF, optional
  | 'error' // Save clicked, mandatory Handling unset (toggle ON)
  | 'loading' // Save in flight
  | 'picker'; // programs picker shown open

export interface CreateChannelModalProps {
  state: CreateModalState;
  /** Mobile styling variant (narrow, native controls). */
  mobile?: boolean;
  onClose?: () => void;
}

/**
 * Create-channel modal with the "Channel attributes" section below Purpose (FR-1).
 * Mandatory attributes pre-populated with system default (FR-2). Pickers offer
 * only clearance-scoped options (FR-5) — TOP SECRET / TS//SCI / Artemis are absent
 * with no hidden count. Toggle ON blocks Save with named inline errors +
 * aria-describedby (FR-4, NFR-A11Y-3); toggle OFF never blocks.
 */
export default function CreateChannelModal({
  state,
  mobile = false,
  onClose,
}: CreateChannelModalProps) {
  const [classification, setClassification] = useState<ClassificationLevel>('SECRET');
  const toggleOn = state !== 'default-off';
  const loading = state === 'loading';
  const showError = state === 'error';
  const handlingUnset = showError; // mandatory Handling left empty in the error scene

  return (
    <Modal
      size="Medium"
      title="Create a new channel"
      onClose={onClose}
      footer={
        <>
          <Button emphasis="Tertiary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            emphasis="Primary"
            disabled={loading}
            leadingIcon={loading ? <Spinner size={16} /> : undefined}
          >
            {loading ? 'Creating…' : 'Save'}
          </Button>
        </>
      }
    >
      <div className={[styles.create, mobile ? styles['create--mobile'] : ''].filter(Boolean).join(' ')}>
        {/* Channel type selector */}
        <div className={styles.create__types}>
          <button type="button" className={`${styles['create__type']} ${styles['create__type--active']}`}>
            <Icon size="24" glyph={<GlobeIcon />} />
            <span className={styles['create__type-title']}>Public Channel</span>
            <span className={styles['create__type-sub']}>Anyone can join</span>
          </button>
          <button type="button" className={styles['create__type']}>
            <Icon size="24" glyph={<LockOutlineIcon />} />
            <span className={styles['create__type-title']}>Private Channel</span>
            <span className={styles['create__type-sub']}>Only invited members</span>
          </button>
        </div>

        <TextInput label="Channel name" defaultValue="Operation Aurora" />
        <TextArea placeholder="Purpose (optional)" rows={3} />

        <div className={styles.create__divider} />

        {/* Channel attributes section — always visible below Purpose (FR-1) */}
        <div className={styles.create__attrs}>
          <h3 className={styles['create__attrs-title']}>Channel attributes</h3>
          <p className={styles['create__attrs-sub']}>
            Configure attributes and values for this channel
            {toggleOn && (
              <span className={styles['create__attrs-req']}> · Required attributes must be set</span>
            )}
          </p>

          {/* Classification (mandatory, pre-filled with system default) */}
          <div className={styles.create__field}>
            <span className={styles['create__field-label']}>
              Classification{toggleOn && <span className={styles['create__req']}> *</span>}
            </span>
            <div className={styles['create__field-control']}>
              <div className={styles['create__class-picker']}>
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
          </div>

          {/* Programs (optional multi-select) */}
          <div className={styles.create__field}>
            <span className={styles['create__field-label']}>Programs</span>
            <div className={styles['create__field-control']}>
              <Select
                defaultValue=""
                aria-label="Programs"
                invalid={false}
              >
                <option value="" disabled>
                  Select one or more values
                </option>
                {ADMIN_PROGRAM_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
              {state === 'picker' && (
                <div className={styles['create__picker-list']} role="listbox" aria-label="Program options">
                  {ADMIN_PROGRAM_OPTIONS.map((o) => (
                    <div key={o} className={styles['create__picker-option']} role="option" aria-selected={false}>
                      {o}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Handling (mandatory) — the error-state driver */}
          <div className={styles.create__field}>
            <span className={styles['create__field-label']}>
              Handling{toggleOn && <span className={styles['create__req']}> *</span>}
            </span>
            <div className={styles['create__field-control']}>
              <Select
                defaultValue={handlingUnset ? '' : 'NOFORN'}
                invalid={handlingUnset}
                aria-label="Handling"
                aria-describedby={handlingUnset ? 'handling-error' : undefined}
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
                <div id="handling-error" className={styles['create__field-error']}>
                  <ErrorMessage message="Handling is required" />
                </div>
              )}
            </div>
          </div>

          <button type="button" className={styles.create__add}>
            <Icon size="16" glyph={<PlusIcon />} />
            <span>Add attribute</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
