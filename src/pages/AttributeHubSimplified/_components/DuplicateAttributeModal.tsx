import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import styles from './RenameAttributeModal.module.scss';

export interface DuplicateAttributeModalProps {
  sourceName: string;
  onClose: () => void;
  onDuplicate: (name: string) => void;
}

export default function DuplicateAttributeModal({
  sourceName,
  onClose,
  onDuplicate,
}: DuplicateAttributeModalProps) {
  const [name, setName] = useState(`${sourceName} (copy)`);

  useEffect(() => {
    setName(`${sourceName} (copy)`);
  }, [sourceName]);

  const trimmed = name.trim();
  const canDuplicate = trimmed.length > 0;

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
          title="Duplicate attribute"
          onClose={onClose}
          footer={
            <>
              <Button emphasis="Tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                emphasis="Primary"
                disabled={!canDuplicate}
                onClick={() => onDuplicate(trimmed)}
              >
                Duplicate
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
              if (e.key === 'Enter' && canDuplicate) {
                onDuplicate(trimmed);
              }
            }}
          />
        </Modal>
      </div>
    </div>
  );
}
