import { Checkbox } from '@mattermost/compass-ui';
import {
  ENFORCE_RESOURCE_OPTIONS,
  type EnforceResourceKind,
} from '../classificationMarkingsData';
import styles from './EnforceResourceCheckboxes.module.scss';

export type EnforceResourceCheckboxesProps = {
  checked: EnforceResourceKind[];
  onChange: (next: EnforceResourceKind[]) => void;
};

export default function EnforceResourceCheckboxes({
  checked,
  onChange,
}: EnforceResourceCheckboxesProps) {
  const toggle = (id: EnforceResourceKind, nextChecked: boolean) => {
    if (nextChecked) {
      onChange([...checked, id]);
      return;
    }
    onChange(checked.filter((item) => item !== id));
  };

  return (
    <div className={styles['enforce-checks']}>
      <h3 className={styles['enforce-checks__heading']}>Resources to enforce</h3>
      <p className={styles['enforce-checks__help']}>
        Choose which resource types require classification for access decisions.
      </p>
      <div className={styles['enforce-checks__list']}>
        {ENFORCE_RESOURCE_OPTIONS.map((option) => (
          <Checkbox
            key={option.id}
            size="Medium"
            className={styles['enforce-checks__item']}
            checked={checked.includes(option.id)}
            onChange={(e) => toggle(option.id, e.target.checked)}
          >
            {option.label}
          </Checkbox>
        ))}
      </div>
    </div>
  );
}
