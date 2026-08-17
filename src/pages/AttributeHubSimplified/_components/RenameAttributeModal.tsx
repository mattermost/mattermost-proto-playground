import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import styles from './RenameAttributeModal.module.scss';

export interface RenameAttributeModalProps {
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function RenameAttributeModal({
  initialName,
  onClose,
  onSave,
}: RenameAttributeModalProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && trimmed !== initialName.trim();

  return (
    <div className={styles['rename']} role="presentation">
      <button
        type="button"
        className={styles['rename__scrim']}
        aria-label="Close"
        onClick={onClose}
      />
      <div className={styles['rename__dialog']}>
        <Modal
          title="Rename attribute"
          onClose={onClose}
          footer={
            <>
              <Button emphasis="Tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                emphasis="Primary"
                disabled={!canSave}
                onClick={() => onSave(trimmed)}
              >
                Save
              </Button>
            </>
          }
        >
          <TextInput
            size="Medium"
            value={name}
            aria-label="Attribute name"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSave) {
                onSave(trimmed);
              }
            }}
          />
        </Modal>
      </div>
    </div>
  );
}
