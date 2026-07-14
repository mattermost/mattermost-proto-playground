import ResourceConfigPanel from '@/pages/AttributeManagementHub/_components/AppliesToEditor/ResourceConfigPanel';
import {
  type HubAttribute,
  type ResourceConfig,
} from '@/pages/AttributeManagementHub/hubData';
import MvpWhoCanSetEditor from './MvpWhoCanSetEditor';
import MvpNextUsersWhoCanSetEditor from './MvpNextUsersWhoCanSetEditor';
import { MVP_NEXT_PROFILE_DISPLAY_OPTIONS } from './mvpNextConstants';
import styles from './MvpResourceConfigPanel.module.scss';

export interface MvpResourceConfigPanelProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
}

/**
 * MVP per-resource config. Reuses the shared ResourceConfigPanel for the
 * standard fields (Required / Profile display / Value visibility / Display
 * location / Who-can-set / Default value). Inheritance is suppressed in the
 * shared panel; no Advanced section in the Next variation.
 */
export default function MvpResourceConfigPanel({
  attribute,
  config,
  onChange,
  onReadIntoFilteringChange,
}: MvpResourceConfigPanelProps) {
  const isUsers = config.resource === 'Users';

  return (
    <div className={styles['panel']}>
      <ResourceConfigPanel
        attribute={attribute}
        config={config}
        onChange={onChange}
        onReadIntoFilteringChange={onReadIntoFilteringChange}
        layout="simplified"
        suppressInheritance
        userProfileDisplayOptions={
          isUsers ? MVP_NEXT_PROFILE_DISPLAY_OPTIONS : undefined
        }
        whoCanSetHint={
          isUsers
            ? 'Choose Member or Sysadmin.'
            : 'Multiple roles can be selected.'
        }
        whoCanSetSlot={
          isUsers ? (
            <MvpNextUsersWhoCanSetEditor config={config} onChange={onChange} />
          ) : (
            <MvpWhoCanSetEditor
              attribute={attribute}
              config={config}
              onChange={onChange}
            />
          )
        }
      />
    </div>
  );
}
