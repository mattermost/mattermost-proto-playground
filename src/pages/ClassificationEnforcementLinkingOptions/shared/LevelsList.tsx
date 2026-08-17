import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import type { ClassificationLevel } from './types';
import styles from './shared.module.scss';

interface LevelsListProps {
  levels: ClassificationLevel[];
  emptyLabel?: string;
}

/**
 * Read-only ranked-level list — the same RankedValueChip pattern used for
 * ranked-hierarchical values in AttributeManagementClassificationSetup.
 * Used for both the preset-generated levels and (in Mockup A "use existing")
 * an existing attribute's values.
 */
export default function LevelsList({
  levels,
  emptyLabel = 'No levels configured yet.',
}: LevelsListProps) {
  if (levels.length === 0) {
    return <p className={styles['levels__empty']}>{emptyLabel}</p>;
  }

  return (
    <div className={styles['levels']}>
      {levels
        .slice()
        .sort((a, b) => a.rank - b.rank)
        .map((level) => (
          <div key={level.id} className={styles['levels__row']}>
            <RankedValueChip label={level.label} rank={level.rank + 1} />
          </div>
        ))}
    </div>
  );
}
