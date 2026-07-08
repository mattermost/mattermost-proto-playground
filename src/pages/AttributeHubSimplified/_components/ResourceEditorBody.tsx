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
  readOnly?: boolean;
}

/** Per-resource editor tuned for the simplified applies-to layout. */
export default function ResourceEditorBody({
  attribute,
  config,
  onChange,
  onReadIntoFilteringChange,
  readOnly = false,
}: ResourceEditorBodyProps) {
  const handleChange = readOnly ? () => {} : onChange;
  const handleReadInto = readOnly ? () => {} : onReadIntoFilteringChange;

  return (
    <div className={styles['body']}>
      <ResourceConfigPanel
        attribute={attribute}
        config={config}
        readOnly={readOnly}
        onChange={handleChange}
        onReadIntoFilteringChange={handleReadInto}
        layout="simplified"
        whoCanSetSlot={
          <SimplifiedWhoCanSetEditor
            attribute={attribute}
            config={config}
            readOnly={readOnly}
            onChange={handleChange}
          />
        }
      />
      <SimplifiedResourceValuesPanel
        attribute={attribute}
        config={config}
        readOnly={readOnly}
        onChange={handleChange}
      />
    </div>
  );
}
