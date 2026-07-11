import { useState } from 'react';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import Icon from '@/components/ui/Icon/Icon';
import ErrorMessage from '@/components/ui/ErrorMessage/ErrorMessage';
import Spinner from '@/components/ui/Spinner/Spinner';
import ClassificationPill from './ClassificationPill';
import {
  ADMIN_CLASSIFICATION_OPTIONS,
  DEMO_ACTOR,
  type ClassificationLevel,
} from './channelAttrData';
import styles from './reclass.module.scss';

export type ReclassPhase = 'idle' | 'selected' | 'loading' | 'error';

export interface ReclassificationModalProps {
  oldValue: ClassificationLevel;
  /** Force a phase for state-matrix display (loading/error). */
  forcePhase?: ReclassPhase;
  onCancel?: () => void;
  onConfirm?: (newValue: ClassificationLevel) => void;
}

/**
 * Reclassification governed-change modal (FR-11, Gap-08). Names actor, attribute,
 * old value, a clearance-scoped new-value picker (FR-13), and the audit statement
 * (NFR-COPY-1, non-enforcement-implying). Confirm requires a new value selected.
 */
export default function ReclassificationModal({
  oldValue,
  forcePhase,
  onCancel,
  onConfirm,
}: ReclassificationModalProps) {
  const [newValue, setNewValue] = useState<ClassificationLevel | ''>('');
  const [phase, setPhase] = useState<ReclassPhase>('idle');
  const effectivePhase = forcePhase ?? phase;
  const loading = effectivePhase === 'loading';
  const canConfirm = newValue !== '' && !loading;

  const options = ADMIN_CLASSIFICATION_OPTIONS.filter((o) => o !== oldValue);

  return (
    <Modal
      size="Small"
      title="Change classification"
      onClose={onCancel}
      footer={
        <>
          <Button emphasis="Tertiary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            emphasis="Primary"
            disabled={!canConfirm}
            onClick={() => {
              if (forcePhase || newValue === '') {
                if (newValue !== '') onConfirm?.(newValue);
                return;
              }
              setPhase('loading');
              window.setTimeout(() => onConfirm?.(newValue), 600);
            }}
            leadingIcon={loading ? <Spinner size={16} /> : undefined}
          >
            {loading ? 'Saving…' : 'Confirm change'}
          </Button>
        </>
      }
    >
      <div className={styles.reclass}>
        <dl className={styles.reclass__facts}>
          <div className={styles.reclass__fact}>
            <dt>Changed by</dt>
            <dd>
              {DEMO_ACTOR.displayName}{' '}
              <span className={styles['reclass__muted']}>@{DEMO_ACTOR.username}</span>
            </dd>
          </div>
          <div className={styles.reclass__fact}>
            <dt>Attribute</dt>
            <dd>Classification</dd>
          </div>
          <div className={styles.reclass__fact}>
            <dt>Change</dt>
            <dd className={styles['reclass__change']}>
              <ClassificationPill level={oldValue} />
              <span className={styles['reclass__arrow']} aria-label="changes to">
                <Icon size="16" glyph={<ArrowRightIcon />} />
              </span>
              {newValue ? (
                <ClassificationPill level={newValue} />
              ) : (
                <span className={styles['reclass__muted']}>Select a new value</span>
              )}
            </dd>
          </div>
        </dl>

        <div className={styles.reclass__picker}>
          <Select
            label="New classification"
            value={newValue}
            disabled={loading}
            onChange={(e) => {
              setNewValue(e.target.value as ClassificationLevel);
              if (!forcePhase) setPhase('selected');
            }}
          >
            <option value="" disabled>
              Select a value
            </option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </div>

        {effectivePhase === 'error' && (
          <div className={styles.reclass__error}>
            <ErrorMessage message="Change could not be saved. Try again." />
          </div>
        )}

        <p className={styles.reclass__audit}>
          This change will be recorded in the audit log with your identity, the old value,
          the new value, and a timestamp.
        </p>
      </div>
    </Modal>
  );
}
