import { useId } from 'react';
import Chip from '@/components/ui/Chip/Chip';
import Radio from '@/components/ui/Radio/Radio';
import {
  SYNC_WHO_SETS,
  accessCap,
  type HubAttribute,
  type ResourceConfig,
} from '@/pages/AttributeManagementHub/hubData';
import { syncSetterDisplayLabel, syncSetterLockedHint } from './mvpTerms';
import {
  MVP_NEXT_USERS_SETTER_MEMBER_LABEL,
  MVP_NEXT_USERS_SETTER_SYSADMIN_LABEL,
} from './mvpNextConstants';
import styles from './MvpNextUsersWhoCanSetEditor.module.scss';

export type UsersSetterMode = 'member' | 'sysadmin';

export interface MvpNextUsersWhoCanSetEditorProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
}

function readUsersSetterMode(config: ResourceConfig): UsersSetterMode {
  return config.whoCanSet.relationalDefault === 'System admin'
    ? 'sysadmin'
    : 'member';
}

function applyUsersSetterMode(mode: UsersSetterMode): Partial<ResourceConfig> {
  return {
    whoCanSet: {
      relationalDefault: mode === 'sysadmin' ? 'System admin' : 'Members',
      grants: accessCap(),
    },
  };
}

/** Users binding — Member or System Administrator who-can-edit-value control (MVP · Next). */
export default function MvpNextUsersWhoCanSetEditor({
  attribute,
  config,
  onChange,
}: MvpNextUsersWhoCanSetEditorProps) {
  const groupName = useId();
  const wcs = config.whoCanSet;
  const syncLocked =
    wcs.relationalDefault != null && SYNC_WHO_SETS.includes(wcs.relationalDefault);
  const mode = readUsersSetterMode(config);

  if (syncLocked) {
    return (
      <div className={styles['locked']}>
        <Chip size="Medium">
          {syncSetterDisplayLabel(attribute, wcs.relationalDefault)}
        </Chip>
        <span className={styles['locked__hint']}>
          {syncSetterLockedHint(attribute, wcs.relationalDefault)}
        </span>
      </div>
    );
  }

  return (
    <div className={styles['setter']} role="radiogroup" aria-label="Who can edit this value">
      <Radio
        className={styles['setter__radio']}
        name={groupName}
        value="member"
        size="Medium"
        checked={mode === 'member'}
        onChange={() => onChange(applyUsersSetterMode('member'))}
      >
        {MVP_NEXT_USERS_SETTER_MEMBER_LABEL}
      </Radio>
      <Radio
        className={styles['setter__radio']}
        name={groupName}
        value="sysadmin"
        size="Medium"
        checked={mode === 'sysadmin'}
        onChange={() => onChange(applyUsersSetterMode('sysadmin'))}
      >
        {MVP_NEXT_USERS_SETTER_SYSADMIN_LABEL}
      </Radio>
    </div>
  );
}

export { readUsersSetterMode };
