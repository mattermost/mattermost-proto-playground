import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import DialogShell from './DialogShell';
import {
  deleteImpact,
  formatList,
  labelOf,
  orphanDeleteGate,
  type HierValue,
} from '../v3GraphModel';
import styles from './dialogs.module.scss';

export interface DeleteValueDialogProps {
  values: HierValue[];
  valueId: string;
  onCancel: () => void;
  onConfirm: () => void;
  /** Jump to a named value so "move it under something else" is actionable. */
  onGoToValue: (id: string) => void;
}

/**
 * Delete gate + delete confirm in one dialog (F3 + F4).
 *
 * Blocked ONLY when a child would be left with no parent at all. A child that
 * also sits under other parents is named as unaffected, because a gate that
 * counts nested rows instead of orphans looks arbitrary and teaches admins to
 * distrust it.
 *
 * When the delete is allowed, the confirm states the access being removed —
 * derived by diffing coverage before and after, not estimated.
 */
export default function DeleteValueDialog({
  values,
  valueId,
  onCancel,
  onConfirm,
  onGoToValue,
}: DeleteValueDialogProps) {
  const label = labelOf(values, valueId);
  const gate = orphanDeleteGate(values, valueId);

  if (gate.blocked) {
    return (
      <DialogShell
        title={`Move ${gate.orphans.length === 1 ? 'one value' : `${gate.orphans.length} values`} first`}
        subtitle={label}
        onClose={onCancel}
        footer={
          <>
            <Button emphasis="Tertiary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              emphasis="Primary"
              onClick={() => onGoToValue(gate.orphans[0].id)}
            >
              Go to “{gate.orphans[0].label}”
            </Button>
          </>
        }
      >
        <p className={styles['dialogs__lead']}>{gate.message}</p>

        <div className={styles['dialogs__section']}>
          <p className={styles['dialogs__section-title']}>
            Would be left with no parent
          </p>
          <ul className={styles['dialogs__list']}>
            {gate.orphans.map((child) => (
              <li key={child.id} className={styles['dialogs__item']}>
                <span className={styles['dialogs__grant-icon']} aria-hidden>
                  <Icon size="16" glyph={<AlertOutlineIcon />} />
                </span>
                {child.label}
                <span className={styles['dialogs__item-note']}>
                  “{label}” is its only parent
                </span>
              </li>
            ))}
          </ul>
        </div>

        {gate.stillPlacedNote && (
          <div className={styles['dialogs__section']}>
            <p className={styles['dialogs__section-title']}>Not affected</p>
            <p className={styles['dialogs__text']}>{gate.stillPlacedNote}</p>
          </div>
        )}

        <p className={styles['dialogs__hint']}>
          A value with another parent keeps its access route, so it never blocks
          a delete.
        </p>
      </DialogShell>
    );
  }

  const impact = deleteImpact(values, valueId);

  return (
    <DialogShell
      title={`Delete “${label}”?`}
      subtitle="This removes access, not just a row"
      onClose={onCancel}
      footer={
        <>
          <Button emphasis="Tertiary" onClick={onCancel}>
            Cancel
          </Button>
          <Button emphasis="Primary" destructive onClick={onConfirm}>
            Delete the value
          </Button>
        </>
      }
    >
      <p className={styles['dialogs__lead']}>
        {impact.grants === 0
          ? `“${label}” grants access to nothing else, so deleting it only removes the value itself.`
          : `“${label}” grants access to ${impact.grants} ${
              impact.grants === 1 ? 'value' : 'values'
            }. Deleting it removes those routes.`}
      </p>

      {impact.losses.length > 0 && (
        <div className={styles['dialogs__section']}>
          <p className={styles['dialogs__section-title']}>Access removed</p>
          <Scrollbars style={{ maxHeight: 168 }}>
            <ul className={styles['dialogs__list']}>
              {impact.losses.map((loss) => (
                <li key={loss.target.id} className={styles['dialogs__item']}>
                  <span>
                    Holders of{' '}
                    {formatList(
                      loss.holders.map((h) => `“${h.label}”`),
                      3,
                    )}{' '}
                    can no longer reach “{loss.target.label}”.
                  </span>
                </li>
              ))}
            </ul>
          </Scrollbars>
        </div>
      )}

      {impact.retained.length > 0 && (
        <div className={styles['dialogs__section']}>
          <p className={styles['dialogs__section-title']}>Stays reachable</p>
          <ul className={styles['dialogs__list']}>
            {impact.retained.map((row) => (
              <li key={row.child.id} className={styles['dialogs__item']}>
                <span className={styles['dialogs__grant-icon']} aria-hidden>
                  <Icon size="16" glyph={<CheckCircleOutlineIcon />} />
                </span>
                <span>
                  “{row.child.label}” stays under{' '}
                  {formatList(
                    row.via.map((p) => `“${p.label}”`),
                    3,
                  )}
                  .
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {impact.carriedBy > 0 && (
        <p className={styles['dialogs__hint']}>
          {impact.carriedBy} channels and users currently carry “{label}”. The
          value is removed from all of them.
        </p>
      )}
    </DialogShell>
  );
}
