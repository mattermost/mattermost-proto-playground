// [AI DRAFT] Prototype instrument panel, rendered OUTSIDE the product frame:
// switches the demo server's attribute inventory so reviewers can watch the
// generated starting rules change. Not product UI.
import { ATTRIBUTE_INVENTORIES, type InventoryId } from '../dmgmData';
import styles from './ServerAttributesControl.module.scss';

const IDS: InventoryId[] = ['full', 'user', 'program', 'none'];

export default function ServerAttributesControl({
  value,
  onChange,
}: {
  value: InventoryId;
  onChange: (id: InventoryId) => void;
}) {
  const attrs = ATTRIBUTE_INVENTORIES[value].attributes;
  return (
    <div className={styles['server-attrs']}>
      <div className={styles['server-attrs__identity']}>
        <span className={styles['server-attrs__label']}>
          This server&apos;s attributes
        </span>
        <span className={styles['server-attrs__list']}>
          {attrs
            .map(
              (a) =>
                `${a.name}${a.source === 'session' ? ' (session)' : a.type === 'text' ? ' (text)' : ''}`,
            )
            .join(' · ')}
        </span>
      </div>
      <div
        className={styles['server-attrs__segmented']}
        role="group"
        aria-label="Demo server"
      >
        {IDS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === value}
            onClick={() => onChange(id)}
            className={[
              styles['server-attrs__option'],
              id === value ? styles['server-attrs__option--active'] : '',
            ]
              .join(' ')
              .trim()}
          >
            {ATTRIBUTE_INVENTORIES[id].label}
          </button>
        ))}
      </div>
    </div>
  );
}
