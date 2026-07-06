import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal/Modal';
import { deleteDisposition } from './data';
import type { AttrDef } from './data';
import styles from './AttributeSystem.module.scss';

interface DeleteAttributeConfirmModalProps {
  def: AttrDef;
  /** Called for hard-delete (disposition === 'delete'). */
  onDelete: (defId: string) => void;
  /** Called for soft-deactivate (disposition === 'deactivate'). */
  onDeactivate: (defId: string) => void;
  onClose: () => void;
}

/**
 * Delete vs Deactivate (NIST 800-162 PAP, plan §8a.2 / §12.2).
 *
 *  - 'delete'     — unreferenced + non-system: red Delete + Cancel.
 *  - 'deactivate' — referenced (policyCount > 0): Deactivate to stop new
 *                   assignments while preserving policy references.
 *  - 'blocked'    — system/protected: shown as a guard message; primary action
 *                   disabled. Callers should not normally open the modal in
 *                   this case (the row menu disables Delete with a tooltip).
 */
export default function DeleteAttributeConfirmModal({
  def,
  onDelete,
  onDeactivate,
  onClose,
}: DeleteAttributeConfirmModalProps) {
  const disposition = deleteDisposition(def);

  const isDeactivate = disposition === 'deactivate';
  const isBlocked = disposition === 'blocked';

  const title = isDeactivate
    ? `Deactivate ‘${def.name}’?`
    : isBlocked
      ? `Cannot delete ‘${def.name}’`
      : `Delete ‘${def.name}’?`;

  const subtitle = isDeactivate
    ? 'Existing policy references stay intact.'
    : isBlocked
      ? 'This is a built-in system attribute.'
      : 'This action cannot be undone.';

  const body = isDeactivate ? (
    <p className={styles.copy}>
      This attribute is referenced in {def.policyCount}{' '}
      {def.policyCount === 1 ? 'active policy' : 'active policies'}. Deactivate
      it to stop new assignments while preserving policy references.
    </p>
  ) : isBlocked ? (
    <p className={styles.copy}>
      Built-in system attributes are required by the platform and cannot be
      deleted. Adjust visibility or access from the row menu instead.
    </p>
  ) : (
    <p className={styles.copy}>
      Delete the “{def.name}” attribute. No policies reference it, so removing
      it will not affect access decisions.
    </p>
  );

  const primary = isDeactivate ? (
    <Button
      emphasis="Primary"
      leadingIcon={<Icon size="16" glyph={<ArchiveOutlineIcon />} />}
      onClick={() => onDeactivate(def.id)}
    >
      Deactivate attribute
    </Button>
  ) : isBlocked ? (
    <Button emphasis="Primary" disabled>
      Delete attribute
    </Button>
  ) : (
    <Button
      emphasis="Primary"
      destructive
      leadingIcon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
      onClick={() => onDelete(def.id)}
    >
      Delete attribute
    </Button>
  );

  return (
    <div
      className={styles.modalOverlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Modal
        size="Small"
        title={title}
        subtitle={subtitle}
        onClose={onClose}
        footer={
          <>
            <Button emphasis="Tertiary" onClick={onClose}>
              Cancel
            </Button>
            {primary}
          </>
        }
      >
        {body}
      </Modal>
    </div>
  );
}
