import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CloseIcon from '@mattermost/compass-icons/components/close';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import Select from '@/components/ui/Select/Select';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import { ROLES, USERS } from '../AttributeManagementHub/_components/AccessEditor/CapabilityGrants';
import {
  isPolicyLocked,
  isSyncSetter,
  WHO_SETS_PRESETS,
  type HubAttribute,
  type ResourceConfig,
  type WhoSets,
} from './basicsData';
import type { AccessCapability } from '../AttributeManagementHub/hubData';
import styles from './WhoSetsBasicsEditor.module.scss';

type Capability = AccessCapability;

export interface WhoSetsBasicsEditorProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
}

/**
 * JS-2 — the Basics who-can-set control. Renders the "Option 3" pattern:
 * a relational-default preset dropdown plus an inline "Add specific access"
 * reveal (specific roles + named users only). Attribute-rule-based setters
 * are kept BEHIND the Advanced door, not here. One dropdown per ENABLED
 * resource — a single-resource attribute shows exactly one control.
 */
export default function WhoSetsBasicsEditor({
  attribute,
  config,
  onChange,
}: WhoSetsBasicsEditorProps) {
  const { resource } = config;
  const wcs = config.whoCanSet;
  const grantCount = wcs.grants.roles.length + wcs.grants.users.length;
  const [expanded, setExpanded] = useState(grantCount > 0);
  const [rolePick, setRolePick] = useState('');
  const [userPick, setUserPick] = useState('');

  const policyLocked = isPolicyLocked(attribute);
  const membersBlocked = policyLocked && resource !== 'Posts';

  // Sync-locked: the value is owned by the sync system — read-only, no editor.
  if (isSyncSetter(wcs.relationalDefault)) {
    return (
      <div className={styles['who']}>
        <div className={styles['who__locked']}>
          <Chip size="Medium">{wcs.relationalDefault}</Chip>
          <span className={styles['who__hint']}>
            Set by the sync system — not editable.
          </span>
        </div>
      </div>
    );
  }

  const presets = WHO_SETS_PRESETS[resource].filter(
    (o) => !(membersBlocked && o === 'Members'),
  );

  const setDefault = (value: string) =>
    onChange({
      whoCanSet: {
        ...wcs,
        relationalDefault: value === '' ? null : (value as WhoSets),
      },
    });

  const patchGrants = (next: Capability) =>
    onChange({ whoCanSet: { ...wcs, grants: next } });

  const remainingRoles = ROLES.filter(
    (r) =>
      !wcs.grants.roles.some((g) => g.subject === r) &&
      !(membersBlocked && r === 'Members'),
  );
  const remainingUsers = USERS.filter(
    (u) => !wcs.grants.users.some((g) => g.subject === u),
  );

  const addRole = () => {
    if (!rolePick) return;
    patchGrants({
      ...wcs.grants,
      roles: [...wcs.grants.roles, { subject: rolePick }],
    });
    setRolePick('');
  };
  const addUser = () => {
    if (!userPick) return;
    patchGrants({
      ...wcs.grants,
      users: [...wcs.grants.users, { subject: userPick }],
    });
    setUserPick('');
  };
  const removeRole = (subject: string) =>
    patchGrants({
      ...wcs.grants,
      roles: wcs.grants.roles.filter((g) => g.subject !== subject),
    });
  const removeUser = (subject: string) =>
    patchGrants({
      ...wcs.grants,
      users: wcs.grants.users.filter((g) => g.subject !== subject),
    });

  const noOneCanSet =
    config.required &&
    wcs.relationalDefault == null &&
    grantCount === 0;

  return (
    <div className={styles['who']}>
      <div className={styles['who__default']}>
        <span className={styles['who__default-label']}>Who sets it by default</span>
        <Select
          className={styles['who__default-select']}
          size="Small"
          value={wcs.relationalDefault ?? ''}
          aria-label={`Who sets it by default on ${resource}`}
          onChange={(e) => setDefault(e.target.value)}
        >
          <option value="">No default — pick specific people below</option>
          {presets.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      </div>

      {membersBlocked && (
        <p className={styles['who__hint']}>
          “Members” is unavailable — this attribute gates access, so a value any
          member can set can’t be trusted.
        </p>
      )}

      {expanded ? (
        <div className={styles['who__specific']}>
          <div className={styles['who__specific-head']}>
            <span className={styles['who__specific-title']}>Specific access</span>
            {grantCount === 0 && (
              <IconButton
                size="Small"
                aria-label="Remove specific access"
                icon={<Icon size="16" glyph={<CloseIcon />} />}
                onClick={() => setExpanded(false)}
              />
            )}
          </div>

          {grantCount > 0 && (
            <div className={styles['who__chips']}>
              {wcs.grants.roles.map((g) => (
                <Chip
                  key={`r-${g.subject}`}
                  size="Small"
                  leadingIcon={<ShieldOutlineIcon />}
                  onRemove={() => removeRole(g.subject)}
                >
                  {g.subject}
                </Chip>
              ))}
              {wcs.grants.users.map((g) => (
                <Chip
                  key={`u-${g.subject}`}
                  size="Small"
                  leadingIcon={<AccountOutlineIcon />}
                  onRemove={() => removeUser(g.subject)}
                >
                  {g.subject}
                </Chip>
              ))}
            </div>
          )}

          <div className={styles['who__picker-row']}>
            <Select
              className={styles['who__picker']}
              size="Small"
              value={rolePick}
              aria-label="Add a role"
              onChange={(e) => setRolePick(e.target.value)}
            >
              <option value="">Add a role…</option>
              {remainingRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
            <Button
              emphasis="Secondary"
              size="Small"
              disabled={!rolePick}
              onClick={addRole}
            >
              Add
            </Button>
          </div>

          <div className={styles['who__picker-row']}>
            <Select
              className={styles['who__picker']}
              size="Small"
              value={userPick}
              aria-label="Add a specific person"
              onChange={(e) => setUserPick(e.target.value)}
            >
              <option value="">Add a specific person…</option>
              {remainingUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
            <Button
              emphasis="Secondary"
              size="Small"
              disabled={!userPick}
              onClick={addUser}
            >
              Add
            </Button>
          </div>

          <p className={styles['who__advanced-note']}>
            Need rule-based setters (e.g. “anyone with Clearance ≥ Protected B”)?
            Those live under Advanced settings.
          </p>
        </div>
      ) : (
        <Button
          className={styles['who__add']}
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={() => setExpanded(true)}
        >
          Add specific access
        </Button>
      )}

      {noOneCanSet && (
        <SectionNotice
          type="Danger"
          title="No one can set this value"
          description={`${resource} require a value but there’s no default setter and no specific access. Add at least one.`}
        />
      )}
    </div>
  );
}
