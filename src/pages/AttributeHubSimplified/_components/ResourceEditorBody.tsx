import ResourceConfigPanel from '@/pages/AttributeManagementHub/_components/AppliesToEditor/ResourceConfigPanel';
import SimplifiedResourceValuesPanel from './SimplifiedResourceValuesPanel';
import SimplifiedWhoCanSetEditor from './SimplifiedWhoCanSetEditor';
import type { HubAttribute, ResourceConfig } from '@/pages/AttributeManagementHub/hubData';
import styles from './ResourceEditorBody.module.scss';

export interface ResourceEditorBodyProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
}

/** Per-resource editor tuned for the simplified applies-to layout. */
export default function ResourceEditorBody({
  attribute,
  config,
  onChange,
  onReadIntoFilteringChange,
}: ResourceEditorBodyProps) {
  return (
    <div className={styles['body']}>
      <ResourceConfigPanel
        attribute={attribute}
        config={config}
        onChange={onChange}
        onReadIntoFilteringChange={onReadIntoFilteringChange}
        layout="simplified"
        whoCanSetSlot={
          <SimplifiedWhoCanSetEditor
            attribute={attribute}
            config={config}
            onChange={onChange}
          />
        }
      />
      <SimplifiedResourceValuesPanel
        attribute={attribute}
        config={config}
        onChange={onChange}
      />
    </div>
  );
}
