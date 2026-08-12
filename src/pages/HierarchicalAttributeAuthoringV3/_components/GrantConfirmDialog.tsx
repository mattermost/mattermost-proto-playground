import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ArrowDownIcon from '@mattermost/compass-icons/components/arrow-down';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import DialogShell from './DialogShell';
import {
  edgeConsequence,
  formatList,
  labelOf,
  type HierValue,
} from '../v3GraphModel';
import styles from './dialogs.module.scss';

export interface GrantConfirmDialogProps {
  values: HierValue[];
  childId: string;
  parentId: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Consequence confirm on edge creation (F4).
 *
 * An admin adding a parent is widening a population's access, so the dialog
 * leads with that sentence and the count of newly-reachable values rather than
 * with "nest under". The rejection path is re-validated here as well as on
 * commit — fail closed, no confirm-to-allow.
 */
export default function GrantConfirmDialog({
  values,
  childId,
  parentId,
  onCancel,
  onConfirm,
}: GrantConfirmDialogProps) {
  const consequence = edgeConsequence(values, childId, parentId);
  const childLabel = labelOf(values, childId);
  const parentLabel = labelOf(values, parentId);

  if (consequence.rejection) {
    return (
      <DialogShell
        title="This link can’t be added"
        subtitle={`${parentLabel} → ${childLabel}`}
        onClose={onCancel}
        footer={
          <Button emphasis="Primary" onClick={onCancel}>
            Back to the value
          </Button>
        }
      >
        <div className={styles['dialogs__reject']} role="alert">
          <Icon size="16" glyph={<AlertOutlineIcon />} />
          <span>{consequence.rejection.message}</span>
        </div>
        <p className={styles['dialogs__text']}>
          Nothing changed. Access stays exactly as it was.
        </p>
      </DialogShell>
    );
  }

  const count = consequence.newlyReachable.length;

  return (
    <DialogShell
      title="Confirm this grant"
      subtitle={`${parentLabel} → ${childLabel}`}
      onClose={onCancel}
      footer={
        <>
          <Button emphasis="Tertiary" onClick={onCancel}>
            Cancel
          </Button>
          <Button emphasis="Primary" onClick={onConfirm}>
            Add the parent
          </Button>
        </>
      }
    >
      <p className={styles['dialogs__lead']}>{consequence.headline}</p>

      <div className={styles['dialogs__grant']}>
        <span className={styles['dialogs__grant-icon']} aria-hidden>
          <Icon size="16" glyph={<ArrowDownIcon />} />
        </span>
        <span>{consequence.grant}</span>
      </div>

      <div className={styles['dialogs__section']}>
        <p className={styles['dialogs__section-title']}>
          {count === 1
            ? '1 value becomes newly reachable'
            : `${count} values become newly reachable`}
        </p>
        <Scrollbars style={{ maxHeight: 168 }}>
          <ul className={styles['dialogs__list']}>
            {consequence.newlyReachable.map((value) => (
              <li key={value.id} className={styles['dialogs__item']}>
                {value.label}
                {value.inUseCount > 0 && (
                  <span className={styles['dialogs__item-note']}>
                    {value.inUseCount} channels and users carry it
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Scrollbars>
      </div>

      {consequence.inheritedBy.length > 0 && (
        <p className={styles['dialogs__hint']}>
          Everything above “{parentLabel}” inherits the same reach:{' '}
          {formatList(
            consequence.inheritedBy.map((v) => `“${v.label}”`),
            4,
          )}
          .
        </p>
      )}

      <p className={styles['dialogs__hint']}>
        The link is checked again the moment you confirm. If anything about the
        hierarchy changed in between, it is refused rather than applied.
      </p>
    </DialogShell>
  );
}
