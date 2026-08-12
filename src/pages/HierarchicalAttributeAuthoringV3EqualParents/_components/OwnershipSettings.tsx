import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import ServerVariantIcon from '@mattermost/compass-icons/components/server-variant';
import Icon from '@/components/ui/Icon/Icon';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Select from '@/components/ui/Select/Select';
import HoverTip from './HoverTip';
import {
  HUMAN_RUNGS,
  type HumanRung,
  type MachineOwner,
  type PermissionSettings,
} from '../v3Seed';
import styles from './OwnershipSettings.module.scss';

export interface OwnershipSettingsProps {
  settings: PermissionSettings;
  onChange: (next: PermissionSettings) => void;
  /** Read-only in core. Null when nothing but people own this attribute. */
  machineOwner: MachineOwner | null;
}

const KIND_LABEL: Record<MachineOwner['kind'], string> = {
  plugin: 'Plugin',
  service: 'Service',
  role: 'Role',
  user: 'User',
};

/**
 * Who can change what (F6).
 *
 * This replaces a free combobox of roles, groups and users, which implied
 * arbitrary delegated administration that the permission model does not offer.
 * What the model actually has is a fixed five-rung ladder for human callers, plus
 * machine owners assigned in each integration's own screen — so core shows those
 * read-only.
 *
 * The three settings are separate on purpose: the real requirement is "an admin
 * may link this attribute to an integration but must not overwrite the values
 * that integration owns", which is unexpressible with one combined permission.
 * When a machine owns the values, no human rung can edit them, and the control
 * says so rather than pretending to offer a choice.
 */
export default function OwnershipSettings({
  settings,
  onChange,
  machineOwner,
}: OwnershipSettingsProps) {
  const valuesOwnedByMachine = machineOwner?.owns === 'values';

  const rows: Array<{
    key: keyof PermissionSettings;
    label: string;
    note: string;
    locked: boolean;
    lockedReason?: string;
  }> = [
    {
      key: 'assign',
      label: 'Set this attribute on users and channels',
      note: 'Picking which values a person holds, or which values mark a channel.',
      locked: false,
    },
    {
      key: 'valueList',
      label: 'Add or change the value list',
      note: valuesOwnedByMachine
        ? `Owned by ${machineOwner?.name}, so no human role can change the list here.`
        : 'Creating values, renaming them, and linking them to each other.',
      locked: valuesOwnedByMachine,
      lockedReason: machineOwner
        ? `${machineOwner.name} owns these values. Change it in that integration’s own settings.`
        : undefined,
    },
    {
      key: 'definition',
      label: 'Change the definition',
      note: 'The name, the type, and where the attribute applies.',
      locked: false,
    },
  ];

  return (
    <div className={styles['ownership']}>
      <div className={styles['ownership__rows']}>
        {rows.map((row) => (
          <div key={row.key} className={styles['ownership__row']}>
            <span className={styles['ownership__label']}>
              <span className={styles['ownership__label-text']}>
                {row.label}
                {row.locked && (
                  <HoverTip label={row.lockedReason ?? 'Managed elsewhere'}>
                    <span className={styles['ownership__owner-icon']}>
                      <Icon size="12" glyph={<LockOutlineIcon />} />
                    </span>
                  </HoverTip>
                )}
              </span>
              <span className={styles['ownership__label-note']}>
                {row.note}
              </span>
            </span>
            {row.locked ? (
              <Select
                size="Medium"
                readOnly
                value="none"
                aria-label={`${row.label} — managed by ${machineOwner?.name}`}
              >
                <option value="none">No one — owned elsewhere</option>
              </Select>
            ) : (
              <Select
                size="Medium"
                value={settings[row.key]}
                aria-label={row.label}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    [row.key]: e.target.value as HumanRung,
                  })
                }
              >
                {HUMAN_RUNGS.map((rung) => (
                  <option key={rung.value} value={rung.value}>
                    {rung.label}
                  </option>
                ))}
              </Select>
            )}
          </div>
        ))}
      </div>

      {machineOwner && (
        <div className={styles['ownership__owner']}>
          <span className={styles['ownership__owner-icon']} aria-hidden>
            <Icon size="20" glyph={<ServerVariantIcon />} />
          </span>
          <span className={styles['ownership__owner-copy']}>
            <span className={styles['ownership__owner-title']}>
              {machineOwner.owns === 'values' ? 'Values' : 'Definition'} managed
              by {machineOwner.name}
              <LabelTag
                label={KIND_LABEL[machineOwner.kind]}
                type="Info Dim"
                size="Small"
              />
            </span>
            <span className={styles['ownership__owner-note']}>
              Ownership is assigned in {machineOwner.name}’s own settings, not
              here. This attribute can be linked to a policy from this screen,
              but the values it owns can’t be overwritten from here.
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
