import { useState } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Radio from '@/components/ui/Radio/Radio';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import { valueCountLabel, type HubAttribute } from '../../hubData';
import styles from './ReuseValuesPicker.module.scss';

export interface ReuseValuesPickerProps {
  current: HubAttribute;
  attributes: HubAttribute[];
  onClose: () => void;
  onPick: (sourceId: string) => void;
}

/**
 * Pick a source attribute to mirror values from. Only attributes that own a
 * value scale (ranked/select/multiselect) are offered.
 */
export default function ReuseValuesPicker({
  current,
  attributes,
  onClose,
  onPick,
}: ReuseValuesPickerProps) {
  const candidates = attributes.filter(
    (a) =>
      a.id !== current.id &&
      a.type !== 'Text' &&
      a.values.length > 0 &&
      !a.valuesLink,
  );
  const [selected, setSelected] = useState<string>(candidates[0]?.id ?? '');

  return (
    <div className={styles['reuse']} role="presentation">
      <button
        type="button"
        className={styles['reuse__scrim']}
        aria-label="Close"
        onClick={onClose}
      />
      <div className={styles['reuse__dialog']}>
        <Modal
          size="Small"
          title="Reuse values from another attribute"
          subtitle={`${current.name} will mirror the selected scale (read-only)`}
          onClose={onClose}
          footer={
            <div className={styles['reuse__footer']}>
              <Button emphasis="Tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                emphasis="Primary"
                disabled={!selected}
                onClick={() => onPick(selected)}
              >
                Link values
              </Button>
            </div>
          }
        >
          <div className={styles['reuse__list']}>
            {candidates.map((a) => (
              <label key={a.id} className={styles['reuse__option']}>
                <Radio
                  checked={selected === a.id}
                  onChange={() => setSelected(a.id)}
                />
                <div className={styles['reuse__option-body']}>
                  <span className={styles['reuse__option-name']}>{a.name}</span>
                  <span className={styles['reuse__option-meta']}>
                    {a.type} · {valueCountLabel(a)}
                  </span>
                </div>
                {a.mirroredBy?.length ? (
                  <LabelTag label="Owns a scale" type="Info" size="X-Small" />
                ) : null}
              </label>
            ))}
          </div>
        </Modal>
      </div>
    </div>
  );
}
