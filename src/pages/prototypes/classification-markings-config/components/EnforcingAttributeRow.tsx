import type { ClassificationLevel } from '../classificationMarkingsData';
import styles from './EnforcingAttributeRow.module.scss';

export type EnforcingAttributeRowProps = {
  attributeName?: string;
  levels: ClassificationLevel[];
};

export default function EnforcingAttributeRow({
  attributeName = 'Classification',
  levels,
}: EnforcingAttributeRowProps) {
  return (
    <div className={styles['enforcing-row']}>
      <p className={styles['enforcing-row__label']}>Enforcing attribute</p>
      <div className={styles['enforcing-row__body']}>
        <span className={styles['enforcing-row__name']}>{attributeName}</span>
        <div className={styles['enforcing-row__pills']} aria-label="Classification levels">
          {levels.map((level) => (
            <span key={level.id} className={styles['enforcing-row__pill']}>
              <span
                className={styles['enforcing-row__swatch']}
                style={{ backgroundColor: level.color }}
                aria-hidden
              />
              {level.text || `Level ${level.rank}`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
