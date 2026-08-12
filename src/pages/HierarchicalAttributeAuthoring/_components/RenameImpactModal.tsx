import { useEffect, useState } from 'react';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ShieldAlertOutlineIcon from '@mattermost/compass-icons/components/shield-alert-outline';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Spinner from '@/components/ui/Spinner/Spinner';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Icon from '@/components/ui/Icon/Icon';
import type { GraphOption } from '../graphModel';
import styles from './RenameImpactModal.module.scss';

interface RenameImpactModalProps {
  option: GraphOption;
  onClose: () => void;
  onCommit: (newLabel: string) => void;
}

/**
 * A5 rename → policy-impact warning, made PRE-COMMIT BLOCKING (F-3): commit is
 * disabled until the dependency scan returns. F-6: shows the total affected
 * count including a cross-owner warning, without naming out-of-scope policies.
 */
export default function RenameImpactModal({
  option,
  onClose,
  onCommit,
}: RenameImpactModalProps) {
  const [label, setLabel] = useState(option.label);
  const [scanning, setScanning] = useState(true);
  const [acked, setAcked] = useState(false);

  const referenced = option.policyRefCount > 0;
  const crossOwner = option.crossOwnerPolicyCount ?? 0;

  useEffect(() => {
    if (!referenced) {
      setScanning(false);
      return;
    }
    const t = window.setTimeout(() => setScanning(false), 600);
    return () => window.clearTimeout(t);
  }, [referenced]);

  const changed = label.trim().length > 0 && label.trim() !== option.label;
  const canCommit =
    changed && (!referenced || (!scanning && acked));

  return (
    <Modal
      size="Small"
      title="Rename option"
      subtitle={`Renaming “${option.label}”`}
      onClose={onClose}
      footer={
        <div className={styles['rename__footer']}>
          <Button emphasis="Tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            emphasis="Primary"
            disabled={!canCommit}
            onClick={() => onCommit(label.trim())}
          >
            {referenced && scanning ? 'Scanning impact…' : 'Rename'}
          </Button>
        </div>
      }
    >
      <div className={styles['rename']}>
        <TextInput
          label="Option name"
          size="Medium"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        {referenced && scanning && (
          <div className={styles['rename__scanning']}>
            <Spinner size={16} aria-label="Scanning policy impact" />
            Scanning policy impact… commit is blocked until this completes.
          </div>
        )}

        {referenced && !scanning && (
          <>
            <SectionNotice
              type="Warning"
              icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
              title={`${option.policyRefCount} ${
                option.policyRefCount === 1 ? 'policy references' : 'policies reference'
              } “${option.label}”`}
              description="Referencing policies will recompile and evaluate to deny until they are updated. This is whole-rule fail-closed, not a single-predicate change."
            />

            {crossOwner > 0 && (
              <div className={styles['rename__cross-owner']}>
                <Icon size="16" glyph={<ShieldAlertOutlineIcon />} />
                <span>
                  This change affects {crossOwner}{' '}
                  {crossOwner === 1 ? 'policy' : 'policies'} you don&apos;t own.
                  Out-of-scope policy names are not shown.
                </span>
              </div>
            )}

            <Checkbox checked={acked} onChange={(e) => setAcked(e.target.checked)}>
              I understand referencing policies will deny until updated
            </Checkbox>
          </>
        )}
      </div>
    </Modal>
  );
}
