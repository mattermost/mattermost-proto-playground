import { Radio } from '@mattermost/compass-ui/components/radio';
import type { RollupView } from '../environments';
import styles from './ViewingAs.module.scss';

export interface ViewingAsProps {
  value: RollupView;
  onChange: (value: RollupView) => void;
}

/** Case B only: safe rollup versus one that leaks a hidden child's existence. */
export function ViewingAs({ value, onChange }: ViewingAsProps) {
  return (
    <div
      className={styles['viewing-as']}
      role="radiogroup"
      aria-label="Viewing as"
    >
      <span className={styles['viewing-as__label']}>Viewing as</span>
      <Radio
        name="viewing-as"
        size="small"
        checked={value === 'safe'}
        onChange={() => onChange('safe')}
      >
        Safe rollup
      </Radio>
      <Radio
        name="viewing-as"
        size="small"
        checked={value === 'leak'}
        onChange={() => onChange('leak')}
      >
        Leaks existence
      </Radio>
    </div>
  );
}
