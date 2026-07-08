import ResourceConfigPanel from '@/pages/AttributeManagementHub/_components/AppliesToEditor/ResourceConfigPanel';
import {
  isSourceOwned,
  type HubAttribute,
  type ResourceConfig,
} from '@/pages/AttributeManagementHub/hubData';
import MvpWhoCanSetEditor from './MvpWhoCanSetEditor';
import MvpResourceAdvanced from './MvpResourceAdvanced';
import { showsInheritance, type InheritanceState } from './mvpTerms';
import styles from './MvpResourceConfigPanel.module.scss';

export interface MvpResourceConfigPanelProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  inheritance: InheritanceState;
  onInheritanceChange: (next: InheritanceState) => void;
  nameOnResource: string;
  onNameOnResourceChange: (value: string) => void;
}

/**
 * MVP (P0) per-resource config. Reuses the shared ResourceConfigPanel for the
 * standard fields (Required / Profile display / Value visibility / Display
 * location / Who-can-set / Default value) so the field layout matches the rest
 * of the system, then adds inheritance and per-resource naming under a
 * collapsed Advanced section. Inheritance is suppressed in the shared panel.
 */
export default function MvpResourceConfigPanel({
  attribute,
  config,
  onChange,
  onReadIntoFilteringChange,
  inheritance,
  onInheritanceChange,
  nameOnResource,
  onNameOnResourceChange,
}: MvpResourceConfigPanelProps) {
  const sourceOwned = isSourceOwned(attribute);
  const inheritanceVisible = showsInheritance(attribute, config.resource);

  return (
    <div className={styles['panel']}>
      <ResourceConfigPanel
        attribute={attribute}
        config={config}
        onChange={onChange}
        onReadIntoFilteringChange={onReadIntoFilteringChange}
        layout="simplified"
        suppressInheritance
        whoCanSetSlot={
          <MvpWhoCanSetEditor
            attribute={attribute}
            config={config}
            onChange={onChange}
          />
        }
      />

      <MvpResourceAdvanced
        attribute={attribute}
        resource={config.resource}
        attributeName={attribute.name}
        nameOnResource={nameOnResource}
        onNameOnResourceChange={onNameOnResourceChange}
        nameDisabled={sourceOwned}
        inheritanceVisible={inheritanceVisible}
        inheritance={inheritance}
        onInheritanceChange={onInheritanceChange}
      />
    </div>
  );
}
