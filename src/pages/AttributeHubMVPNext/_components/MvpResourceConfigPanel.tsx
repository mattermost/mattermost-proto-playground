import ResourceConfigPanel from '@/pages/AttributeManagementHub/_components/AppliesToEditor/ResourceConfigPanel';
import {
  type HubAttribute,
  type ResourceConfig,
  whoCanSetIsEditable,
} from '@/pages/AttributeManagementHub/hubData';
import MvpWhoCanSetEditor from './MvpWhoCanSetEditor';
import MvpNextUsersWhoCanSetEditor from './MvpNextUsersWhoCanSetEditor';
import { MVP_NEXT_PROFILE_DISPLAY_OPTIONS, MVP_NEXT_USERS_WHO_CAN_SET_HINT } from './mvpNextConstants';
import { managedSourceConfigLabel } from './mvpTerms';
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
  const whoCanSetEditable = whoCanSetIsEditable(attribute, config);

  return (
    <div className={styles['panel']}>
      <ResourceConfigPanel
        attribute={attribute}
        config={config}
        onChange={onChange}
        onReadIntoFilteringChange={onReadIntoFilteringChange}
        layout="simplified"
        adjacentRequiredAndDefault
        requireDefaultWhenRequired
        managedByPluginName={
          attribute.source.kind === 'synced'
            ? managedSourceConfigLabel(attribute)
            : undefined
        }
        suppressInheritance
        userProfileDisplayOptions={
          isUsers ? MVP_NEXT_PROFILE_DISPLAY_OPTIONS : undefined
        }
        whoCanSetHint={
          !whoCanSetEditable
            ? null
            : isUsers
              ? MVP_NEXT_USERS_WHO_CAN_SET_HINT
              : 'Multiple roles can be selected.'
        }
        whoCanSetSlot={
          isUsers ? (
            <MvpNextUsersWhoCanSetEditor
              attribute={attribute}
              config={config}
              onChange={onChange}
            />
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
