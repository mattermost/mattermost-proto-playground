import ResourceConfigPanel from '@/pages/AttributeManagementHub/_components/AppliesToEditor/ResourceConfigPanel';
import SimplifiedWhoCanSetEditor from './SimplifiedWhoCanSetEditor';
import SimplifiedResourceAdvanced from './SimplifiedResourceAdvanced';
import type { HubAttribute, ResourceConfig } from '@/pages/AttributeManagementHub/hubData';
import styles from './ResourceEditorBody.module.scss';

export interface ResourceEditorBodyProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
  onAddResourceValue: (label: string) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
}

/**
 * Per-resource editor for the Simplified applies-to layout. Standard fields
 * reuse ResourceConfigPanel; inheritance, renaming, and allowed-option subsets
 * live under a collapsed Advanced section (MVP-aligned).
 */
export default function ResourceEditorBody({
  attribute,
  config,
  onChange,
  onAddResourceValue,
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
        suppressInheritance
        whoCanSetSlot={
          <SimplifiedWhoCanSetEditor
            attribute={attribute}
            config={config}
            onChange={onChange}
          />
        }
      />

      <SimplifiedResourceAdvanced
        attribute={attribute}
        config={config}
        onChange={onChange}
        onAddResourceValue={onAddResourceValue}
      />
    </div>
  );
}
