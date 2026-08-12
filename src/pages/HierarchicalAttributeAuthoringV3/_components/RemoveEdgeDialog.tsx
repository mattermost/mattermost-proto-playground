import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import DialogShell from './DialogShell';
import {
  formatList,
  labelOf,
  removeEdgePlan,
  type HierValue,
} from '../v3GraphModel';
import styles from './dialogs.module.scss';

export interface RemoveEdgeDialogProps {
  values: HierValue[];
  childId: string;
  /** The single parent edge being removed — the one the dragged row represented. */
  parentId: string;
  onCancel: () => void;
  onConfirm: (announcement: string) => void;
}

/**
 * Dragging a POINTER row out to the top-level zone.
 *
 * Under the per-edge model this gesture has a narrow, coherent meaning: remove
 * the one grant that row stands for and leave the value's other parents alone.
 * It is one grant, so it gets one confirm that names it — not the blanket block
 * that a multi-parent value's editing row still gets, where the same gesture
 * would cut every grant at once.
 */
export default function RemoveEdgeDialog({
  values,
  childId,
  parentId,
  onCancel,
  onConfirm,
}: RemoveEdgeDialogProps) {
  const plan = removeEdgePlan(values, childId, parentId);
  const childLabel = labelOf(values, childId);
  const parentLabel = labelOf(values, parentId);

  return (
    <DialogShell
      title="Remove this one grant?"
      subtitle={`“${parentLabel}” → “${childLabel}”`}
      onClose={onCancel}
      footer={
        <>
          <Button emphasis="Tertiary" onClick={onCancel}>
            Keep it
          </Button>
          <Button
            emphasis="Primary"
            destructive
            disabled={plan.rejection != null}
            onClick={() => onConfirm(plan.announcement)}
          >
            Remove this grant
          </Button>
        </>
      }
    >
      <p className={styles['dialogs__lead']}>{plan.sentence}</p>

      {plan.rejection ? (
        <div className={styles['dialogs__reject']} role="alert">
          <Icon size="16" glyph={<AlertOutlineIcon />} />
          <span>{plan.rejection}</span>
        </div>
      ) : (
        <>
          <div className={styles['dialogs__section']}>
            <p className={styles['dialogs__section-title']}>
              1 grant will be removed
            </p>
            <ul className={styles['dialogs__list']}>
              <li className={styles['dialogs__grant']}>
                <span
                  className={[
                    styles['dialogs__grant-icon'],
                    styles['dialogs__grant-icon--removed'],
                  ].join(' ')}
                  aria-hidden
                >
                  <Icon size="16" glyph={<CloseIcon />} />
                </span>
                <span>{plan.sentence}</span>
              </li>
            </ul>
          </div>

          <p className={styles['dialogs__hint']}>
            “{childLabel}” stays where it is under{' '}
            {formatList(
              plan.keptLabels.map((label) => `“${label}”`),
              3,
            )}
            , at the same position, and nothing it grants changes. Only the link
            from “{parentLabel}” goes.
          </p>
        </>
      )}
    </DialogShell>
  );
}
