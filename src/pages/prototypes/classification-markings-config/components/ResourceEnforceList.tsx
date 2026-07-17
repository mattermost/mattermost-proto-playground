import PlusIcon from '@mattermost/compass-icons/components/plus';
import { Button, Icon } from '@mattermost/compass-ui';
import type { EnforceResource } from '../classificationMarkingsData';
import styles from './ResourceEnforceList.module.scss';

export type ResourceEnforceListProps = {
  resources: EnforceResource[];
  onAddResource?: () => void;
};

export default function ResourceEnforceList({
  resources,
  onAddResource,
}: ResourceEnforceListProps) {
  return (
    <div className={styles['resource-list']}>
      <h3 className={styles['resource-list__heading']}>Resources to enforce</h3>
      <div className={styles['resource-list__items']}>
        {resources.map((resource) => (
          <div key={resource.id} className={styles['resource-list__item']}>
            <span className={styles['resource-list__name']}>{resource.name}</span>
            <p className={styles['resource-list__summary']}>{resource.summary}</p>
          </div>
        ))}
      </div>
      <div className={styles['resource-list__actions']}>
        <Button
          type="button"
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={onAddResource}
        >
          Add resource
        </Button>
      </div>
    </div>
  );
}
