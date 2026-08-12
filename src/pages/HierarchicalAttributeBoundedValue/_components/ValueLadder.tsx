import ArrowUpIcon from '@mattermost/compass-icons/components/arrow-up';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Icon from '@/components/ui/Icon/Icon';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import { depthOf } from '@/pages/HierarchicalAttributeAuthoring/graphModel';
import { isWithin, optionLabel, type ValueScheme } from '../boundsModel';
import styles from './ValueLadder.module.scss';

export interface ValueLadderProps {
  scheme: ValueScheme;
  /** The container's current value. */
  currentId: string;
  /** Values the container may move to (current value included). */
  allowedIds: string[];
  /** The container's own cap — the system value. */
  systemCapId: string | null;
  className?: string;
}

/**
 * Direction diagram for the container surface.
 *
 * The picker itself offers only the allowed values — the same rule the post
 * composer follows. This diagram sits beside it and does the opposite job: it
 * shows the whole list so the direction of travel is legible, and gives each
 * unavailable value a reason. An admin deciding whether to change a channel's
 * value needs to see which way the rule points; an author choosing a value for
 * one post does not.
 */
export default function ValueLadder({
  scheme,
  currentId,
  allowedIds,
  systemCapId,
  className = '',
}: ValueLadderProps) {
  const rootClass = [styles['value-ladder'], className]
    .filter(Boolean)
    .join(' ');

  const currentLabel = optionLabel(scheme, currentId);

  const reasonFor = (id: string): string => {
    if (systemCapId && !isWithin(scheme, systemCapId, id)) {
      return scheme.fieldType === 'rank'
        ? 'Above the system default'
        : 'Outside the system default';
    }
    return scheme.fieldType === 'rank'
      ? `Lower than ${currentLabel}`
      : `Would put ${currentLabel} outside the channel`;
  };

  return (
    <div className={rootClass}>
      <div className={styles['value-ladder__legend']}>
        <span className={styles['value-ladder__legend-arrow']}>
          <Icon size="12" glyph={<ArrowUpIcon />} />
        </span>
        <span className={styles['value-ladder__legend-text']}>
          {scheme.fieldType === 'rank'
            ? 'Higher classifications are up. Only this direction is offered.'
            : 'Wider programs are up. Only values that still contain the current one are offered.'}
        </span>
      </div>
      <ul className={styles['value-ladder__list']}>
        {scheme.displayOrder.map((id) => {
          const offered = allowedIds.includes(id);
          const isCurrent = id === currentId;
          const indent =
            scheme.fieldType === 'hierarchical'
              ? depthOf(scheme.options, id) - 1
              : 0;
          return (
            <li
              key={id}
              className={[
                styles['value-ladder__row'],
                offered ? styles['value-ladder__row--offered'] : '',
                isCurrent ? styles['value-ladder__row--current'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span
                className={styles['value-ladder__indent']}
                style={{ width: `${indent * 14}px` }}
                aria-hidden
              />
              <span
                className={styles['value-ladder__dot']}
                style={{
                  backgroundColor: scheme.options.find((o) => o.id === id)
                    ?.color,
                }}
                aria-hidden
              />
              <span className={styles['value-ladder__label']}>
                {optionLabel(scheme, id)}
              </span>
              {isCurrent ? (
                <span className={styles['value-ladder__state']}>
                  <Icon size="12" glyph={<CheckIcon />} />
                  Current
                </span>
              ) : offered ? (
                <LabelTag label="Offered" type="Success" size="X-Small" />
              ) : (
                <span className={styles['value-ladder__reason']}>
                  {reasonFor(id)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
