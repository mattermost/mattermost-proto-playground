import { useId } from 'react';
import Chip from '@/components/ui/Chip/Chip';
import Radio from '@/components/ui/Radio/Radio';
import {
  SYNC_WHO_SETS,
  accessCap,
  type ResourceConfig,
} from '@/pages/AttributeManagementHub/hubData';
import styles from './MvpNextUsersWhoCanSetEditor.module.scss';

export type UsersSetterMode = 'member' | 'sysadmin';

export interface MvpNextUsersWhoCanSetEditorProps {
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

/** Users binding — Member or Sysadmin who-can-edit-value control (MVP · Next). */
export default function MvpNextUsersWhoCanSetEditor({
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
        <Chip size="Medium">{wcs.relationalDefault}</Chip>
        <span className={styles['locked__hint']}>
          Set by the sync system — not editable.
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
        Member
      </Radio>
      <Radio
        className={styles['setter__radio']}
        name={groupName}
        value="sysadmin"
        size="Medium"
        checked={mode === 'sysadmin'}
        onChange={() => onChange(applyUsersSetterMode('sysadmin'))}
      >
        Sysadmin
      </Radio>
    </div>
  );
}

export { readUsersSetterMode };
