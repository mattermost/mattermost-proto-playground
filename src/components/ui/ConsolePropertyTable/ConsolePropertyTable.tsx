import type { ReactNode } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Icon from '@/components/ui/Icon/Icon';
import styles from './ConsolePropertyTable.module.scss';

export interface ConsolePropertyTableColumn {
  /** Column key (unique). */
  key: string;
  /** Column header label. */
  label: string;
  /** Fixed width in px. Omit for a flex column. */
  width?: number;
}

export interface ConsolePropertyTableSection {
  /** Optional section title (e.g. "Custom Properties"). */
  title?: string;
  /** Column definitions for this section's header row. */
  columns: ConsolePropertyTableColumn[];
  /** Row content — render ConsolePropertyRow components here. */
  rows: ReactNode;
}

export interface ConsolePropertyTableProps {
  /** Table sections. Each section has its own header and rows. */
  sections: ConsolePropertyTableSection[];
  /** Label for the add-row footer action (e.g. "Add property"). Omit to hide. */
  addLabel?: string;
  /** Callback when the add action is clicked. */
  onAdd?: () => void;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * System Console properties table — composed of sections, each with a
 * column header row and a stack of ConsolePropertyRow components.
 *
 * Use the `addLabel` footer action to expose a "Select attribute" or
 * "Add property" affordance under the rows.
 *
 * @see Figma: Compass System Console → Properties Table
 */
export default function ConsolePropertyTable({
  sections,
  addLabel,
  onAdd,
  className = '',
}: ConsolePropertyTableProps) {
  const rootClass = [styles['console-property-table'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      {sections.map((section, i) => (
        <div key={i} className={styles['console-property-table__section']}>
          {section.title != null && (
            <div className={styles['console-property-table__section-title']}>
              {section.title}
            </div>
          )}
          <div className={styles['console-property-table__header']}>
            {section.columns.map((col) => (
              <div
                key={col.key}
                className={styles['console-property-table__header-cell']}
                style={
                  col.width != null
                    ? { width: col.width, flexShrink: 0 }
                    : { flex: '1 1 auto', minWidth: 0 }
                }
              >
                {col.label}
              </div>
            ))}
          </div>
          <div className={styles['console-property-table__rows']}>
            {section.rows}
          </div>
        </div>
      ))}
      {addLabel != null && (
        <button
          type="button"
          className={styles['console-property-table__add']}
          onClick={onAdd}
        >
          <Icon size="16" glyph={<PlusIcon />} />
          <span className={styles['console-property-table__add-label']}>
            {addLabel}
          </span>
        </button>
      )}
    </div>
  );
}
