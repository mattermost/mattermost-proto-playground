import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Select from '@/components/ui/Select/Select';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import CapabilityGrants from '../AccessEditor/CapabilityGrants';
import {
  capabilityGrantCount,
  isPolicyLocked,
  whoCanSetLock,
  type AccessCapability,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
  type WhoSets,
} from '../../hubData';
import styles from './WhoCanSetEditor.module.scss';

export interface WhoCanSetEditorProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
}

const SYNC_SYSTEMS: WhoSets[] = ['UAS', 'LDAP', 'SCIM'];

const DEFAULT_OPTIONS: Record<ResourceKind, WhoSets[]> = {
  Users: ['System admin', 'Members'],
  Channels: ['Channel admin', 'Team admin', 'System admin', 'Members'],
  Teams: ['Team admin', 'System admin', 'Members'],
  Posts: ['Post author', 'Channel admin', 'System admin'],
};

const PARENT_OWNER: Record<ResourceKind, string> = {
  Users: 'the user',
  Channels: 'the channel',
  Teams: 'the team',
  Posts: 'the post',
};

export default function WhoCanSetEditor({
  attribute,
  config,
  onChange,
}: WhoCanSetEditorProps) {
  const { resource } = config;
  const wcs = config.whoCanSet;
  const [escalated, setEscalated] = useState(
    capabilityGrantCount(wcs.grants) > 0,
  );
  const policyLocked = isPolicyLocked(attribute);
  const inheritLock = whoCanSetLock(attribute, resource);
  const syncLocked =
    wcs.relationalDefault != null && SYNC_SYSTEMS.includes(wcs.relationalDefault);
  const membersBlocked = policyLocked && resource !== 'Posts';

  const policyCount = `${attribute.usedByPolicies} ${
    attribute.usedByPolicies === 1 ? 'policy' : 'policies'
  }`;

  if (inheritLock.locked && inheritLock.parent) {
    const lockDescription =
      resource === 'Posts'
        ? 'The value is inherited and locked from the channel. Turn off Inherits from channel on posts to unlock who can set the value.'
        : `The value is inherited and locked from ${
            PARENT_OWNER[inheritLock.parent]
          }. It can't be set on ${resource.toLowerCase()} directly — change the inheritance on ${inheritLock.parent} to unlock.`;

    return (
      <div className={styles['editor']}>
        <span className={styles['label']}>Who can set the value</span>
        <SectionNotice
          type="Info"
          title={`Locked to ${inheritLock.parent}`}
          description={lockDescription}
        />
      </div>
    );
  }

  // R2 — locked to the sync system on the synced resource.
  if (syncLocked) {
    return (
      <div className={styles['editor']}>
        <span className={styles['label']}>Who can set the value</span>
        <div className={styles['locked']}>
          <Chip size="Medium">{wcs.relationalDefault}</Chip>
          <span className={styles['hint']}>
            Set by the sync system — not editable.
          </span>
        </div>
      </div>
    );
  }

  const options = DEFAULT_OPTIONS[resource].filter(
    (o) => !(membersBlocked && o === 'Members'),
  );

  const setDefault = (value: string) => {
    onChange({
      whoCanSet: {
        ...wcs,
        relationalDefault: value === '' ? null : (value as WhoSets),
      },
    });
  };

  const setGrants = (grants: AccessCapability) => {
    onChange({ whoCanSet: { ...wcs, grants } });
  };

  const noOneCanSet =
    config.required &&
    wcs.relationalDefault == null &&
    wcs.grants.roles.length === 0 &&
    wcs.grants.users.length === 0 &&
    wcs.grants.attributeRules.length === 0;

  return (
    <div className={styles['editor']}>
      <span className={styles['label']}>Who can set the value</span>
      <p className={styles['desc']}>
        The default owner of the {resource.toLowerCase()} can set it.
      </p>

      <div className={styles['default']}>
        <span className={styles['default-label']}>Default setter</span>
        <Select
          className={styles['default-select']}
          size="Small"
          value={wcs.relationalDefault ?? ''}
          aria-label="Default setter"
          onChange={(e) => setDefault(e.target.value)}
        >
          <option value="">No default (grants only)</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      </div>

      {membersBlocked && (
        <p className={styles['hint']}>
          “Members” is unavailable — this attribute is used by {policyCount}, so a
          value any member can set can’t be trusted for access decisions.
        </p>
      )}

      {escalated ? (
        <div className={styles['grants']}>
          <CapabilityGrants
            capability={wcs.grants}
            disableMembersRole={membersBlocked}
            membersNote={
              membersBlocked
                ? '“Members” can’t be granted while this attribute gates access.'
                : undefined
            }
            addCaption="Also let others set it (optional)"
            onChange={setGrants}
          />
        </div>
      ) : (
        <Button
          className={styles['add']}
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={() => setEscalated(true)}
        >
          Add specific access
        </Button>
      )}

      {noOneCanSet && (
        <SectionNotice
          type="Danger"
          title="No one can set this value"
          description={`This resource requires a value, but there's no default setter and no grants. Add at least one so ${resource.toLowerCase()} can be created.`}
        />
      )}
    </div>
  );
}
