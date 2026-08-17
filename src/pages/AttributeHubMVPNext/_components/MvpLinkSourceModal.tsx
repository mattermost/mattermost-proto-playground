import { useEffect, useRef, useState } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import type { AttrType } from '@/pages/AttributeManagementHub/hubData';
import {
  linkSourceTitle,
  type LinkableSource,
} from './mvpTerms';
import styles from './MvpLinkSourceModal.module.scss';

const MAX_MAPPED_NAME = 64;

export interface MvpLinkSourceModalProps {
  system: LinkableSource;
  /** Existing mapped attribute name when editing. */
  initialMapped?: string;
  currentType: AttrType;
  onClose: () => void;
  onSave: (mapped: string) => void;
}

function helpText(system: LinkableSource): string {
  if (system === 'LDAP') {
    return 'The AD/LDAP attribute that populates this field on user profiles.';
  }
  return 'The SAML assertion attribute that populates this field on user profiles.';
}

export default function MvpLinkSourceModal({
  system,
  initialMapped = '',
  currentType,
  onClose,
  onSave,
}: MvpLinkSourceModalProps) {
  const [mapped, setMapped] = useState(initialMapped);
  const inputRef = useRef<HTMLInputElement>(null);
  const title = initialMapped
    ? `Edit ${linkSourceTitle(system)} link`
    : `Link attribute to ${linkSourceTitle(system)}`;
  const converting = currentType !== 'Text';
  const trimmed = mapped.trim();
  const tooLong = trimmed.length > MAX_MAPPED_NAME;
  const canSave = trimmed.length > 0 && !tooLong;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className={styles['link-modal']} role="presentation">
      <button
        type="button"
        className={styles['link-modal__scrim']}
        aria-label="Close"
        onClick={onClose}
      />
      <div className={styles['link-modal__dialog']}>
        <Modal
          size="Small"
          title={title}
          onClose={onClose}
          footer={
            <div className={styles['link-modal__footer']}>
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
            </div>
          }
        >
          <div className={styles['link-modal__body']}>
            <TextInput
              ref={inputRef}
              size="Medium"
              label={`${linkSourceTitle(system)} attribute`}
              placeholder="department"
              value={mapped}
              maxLength={MAX_MAPPED_NAME}
              showCharacterCount
              aria-label={`${linkSourceTitle(system)} attribute`}
              onChange={(e) => setMapped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSave) {
                  e.preventDefault();
                  onSave(trimmed);
                }
              }}
            />
            <p className={styles['link-modal__help']}>{helpText(system)}</p>
            {converting && (
              <SectionNotice
                type="Warning"
                title="This attribute will convert to Text"
                description="Linked attributes cannot keep a preset option list. Existing options will be removed."
              />
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
