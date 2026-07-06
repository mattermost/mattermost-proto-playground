import { useState } from 'react';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import Select from '@/components/ui/Select/Select';
import Switch from '@/components/ui/Switch/Switch';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Modal from '@/components/ui/Modal/Modal';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Tabs from '@/components/ui/Tabs/Tabs';
import AttributeRulesEditor from '../AttributeManagementHub/_components/AccessEditor/AttributeRulesEditor';
import {
  ROLES,
  USERS,
} from '../AttributeManagementHub/_components/AccessEditor/CapabilityGrants';
import {
  appliesToUsers,
  isSourceOwned,
  readIntoForced,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
} from './basicsData';
import {
  resolveInheritMode,
  type AccessCapability,
  type AccessGrant,
  type AccessModel,
  type AttributeAccessRule,
  type InheritMode,
} from '../AttributeManagementHub/hubData';
import styles from './AdvancedDrawer.module.scss';

export interface AdvancedDrawerProps {
  attribute: HubAttribute;
  onClose: () => void;
  onAccessChange: (next: AccessModel) => void;
  onBindingChange: (
    resource: ResourceKind,
    next: Partial<ResourceConfig>,
  ) => void;
  onReadIntoChange: (value: boolean) => void;
}

/**
 * JS-3 — access-layer capability editor with roles + named users ONLY.
 * Attribute-rule grants are CUT from the ACCESS layer (no meta-recursion).
 */
function CapabilityRolesUsers({
  cap,
  readOnly,
  onChange,
}: {
  cap: AccessCapability;
  readOnly?: boolean;
  onChange: (next: AccessCapability) => void;
}) {
  const [rolePick, setRolePick] = useState('');
  const [userPick, setUserPick] = useState('');
  const remainingRoles = ROLES.filter(
    (r) => !cap.roles.some((g) => g.subject === r),
  );
  const remainingUsers = USERS.filter(
    (u) => !cap.users.some((g) => g.subject === u),
  );

  const setRoles = (roles: AccessGrant[]) => onChange({ ...cap, roles });
  const setUsers = (users: AccessGrant[]) => onChange({ ...cap, users });

  return (
    <div className={styles['adv__cap']}>
      <div className={styles['adv__chips']}>
        {cap.roles.map((g) => (
          <Chip
            key={`r-${g.subject}`}
            size="Small"
            leadingIcon={<ShieldOutlineIcon />}
            onRemove={
              g.owner || readOnly
                ? undefined
                : () => setRoles(cap.roles.filter((x) => x.subject !== g.subject))
            }
          >
            {g.subject}
            {g.owner ? ' · Owner' : ''}
          </Chip>
        ))}
        {cap.users.map((g) => (
          <Chip
            key={`u-${g.subject}`}
            size="Small"
            leadingIcon={<AccountOutlineIcon />}
            onRemove={
              readOnly
                ? undefined
                : () => setUsers(cap.users.filter((x) => x.subject !== g.subject))
            }
          >
            {g.subject}
          </Chip>
        ))}
      </div>
      {!readOnly && (
        <div className={styles['adv__picker-grid']}>
          <div className={styles['adv__picker-row']}>
            <Select
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
              onClick={() => {
                setRoles([...cap.roles, { subject: rolePick }]);
                setRolePick('');
              }}
            >
              Add
            </Button>
          </div>
          <div className={styles['adv__picker-row']}>
            <Select
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
              onClick={() => {
                setUsers([...cap.users, { subject: userPick }]);
                setUserPick('');
              }}
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const INHERIT_LABEL: Record<InheritMode, string> = {
  off: 'No inheritance',
  inherit: 'Inherit (editable on child)',
  'inherit-lock': 'Inherit and lock the child',
};

/**
 * The single "Advanced settings" door for Approach B. Everything advanced from
 * spec 27 §3 lives here: edit/manage access split (roles+users only — JS-3),
 * per-resource value subsets (disabledValueIds), read-into toggle (manual/LDAP),
 * inheritance mode, source field-map, and attribute-rule-based who-can-set
 * setters (behind Advanced only per JS-2).
 */
export default function AdvancedDrawer({
  attribute,
  onClose,
  onAccessChange,
  onBindingChange,
  onReadIntoChange,
}: AdvancedDrawerProps) {
  const sourceOwned = isSourceOwned(attribute);
  const readIntoLocked = readIntoForced(attribute);
  const userBinding = attribute.appliesTo.find((c) => c.resource === 'Users');
  const nonUserBindings = attribute.appliesTo;
  const [activeTab, setActiveTab] = useState<string>('access');

  const tabs = [
    { key: 'access', label: 'Access' },
    { key: 'resources', label: 'Per-resource rules' },
  ];
  if (appliesToUsers(attribute)) tabs.push({ key: 'filtering', label: 'Value visibility' });
  if (sourceOwned) tabs.push({ key: 'source', label: 'Source mapping' });

  const setEditDefinition = (next: AccessCapability) =>
    onAccessChange({ ...attribute.access, editDefinition: next });
  const setManageValues = (next: AccessCapability) =>
    onAccessChange({ ...attribute.access, manageValues: next });

  const toggleDisabledValue = (cfg: ResourceConfig, valueId: string) => {
    const current = cfg.disabledValueIds ?? [];
    const next = current.includes(valueId)
      ? current.filter((v) => v !== valueId)
      : [...current, valueId];
    onBindingChange(cfg.resource, { disabledValueIds: next });
  };

  const setInherit = (cfg: ResourceConfig, mode: InheritMode) =>
    onBindingChange(cfg.resource, { inheritMode: mode });

  const setRuleSetters = (
    cfg: ResourceConfig,
    attributeRules: AttributeAccessRule[],
  ) =>
    onBindingChange(cfg.resource, {
      whoCanSet: {
        ...cfg.whoCanSet,
        grants: { ...cfg.whoCanSet.grants, attributeRules },
      },
    });

  return (
    <div className={styles['adv']} role="presentation">
      <button
        type="button"
        className={styles['adv__scrim']}
        aria-label="Close advanced settings"
        onClick={onClose}
      />
      <div className={styles['adv__dock']}>
        <Modal
          size="Large"
          title="Advanced settings"
          subtitle={`${attribute.name} · fine-grained access, value rules, and source mapping`}
          onClose={onClose}
          footer={
            <Button emphasis="Primary" onClick={onClose}>
              Done
            </Button>
          }
        >
          <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

          {activeTab === 'access' && (
            <div className={styles['adv__section']}>
              <p className={styles['adv__lead']}>
                Split who can edit the attribute’s definition from who can manage
                its values. Grant to roles or named people — rule-based grants are
                not used for edit access.
              </p>
              <div className={styles['adv__cap-card']}>
                <span className={styles['adv__cap-title']}>Edit definition</span>
                <span className={styles['adv__cap-help']}>
                  Rename, change type, edit description.
                </span>
                <CapabilityRolesUsers
                  cap={attribute.access.editDefinition}
                  onChange={setEditDefinition}
                />
              </div>
              <div className={styles['adv__cap-card']}>
                <span className={styles['adv__cap-title']}>Manage values</span>
                <span className={styles['adv__cap-help']}>
                  Add, reorder, disable, and share values.
                </span>
                {sourceOwned ? (
                  <SectionNotice
                    type="Info"
                    title={`Managed by ${attribute.source.system}`}
                    description="Values sync from the source — not editable here."
                  />
                ) : (
                  <CapabilityRolesUsers
                    cap={attribute.access.manageValues}
                    onChange={setManageValues}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className={styles['adv__section']}>
              <p className={styles['adv__lead']}>
                Per-resource rules: restrict which values apply, control
                inheritance, and add rule-based setters.
              </p>
              {nonUserBindings.map((cfg) => (
                <div key={cfg.resource} className={styles['adv__res-card']}>
                  <span className={styles['adv__res-title']}>{cfg.resource}</span>

                  {/* Per-resource allowed-value subsets (disabledValueIds, D4). */}
                  {attribute.type !== 'Text' && !sourceOwned && (
                    <div className={styles['adv__res-block']}>
                      <span className={styles['adv__res-label']}>
                        Allowed values on {cfg.resource}
                      </span>
                      <div className={styles['adv__value-grid']}>
                        {attribute.values.map((v) => (
                          <Checkbox
                            key={v.id}
                            checked={!(cfg.disabledValueIds ?? []).includes(v.id)}
                            onChange={() => toggleDisabledValue(cfg, v.id)}
                          >
                            {v.label}
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inheritance (Channels/Teams). */}
                  {(cfg.resource === 'Channels' || cfg.resource === 'Teams') && (
                    <div className={styles['adv__res-block']}>
                      <span className={styles['adv__res-label']}>Inheritance</span>
                      <Select
                        size="Small"
                        value={resolveInheritMode(cfg)}
                        aria-label={`Inheritance on ${cfg.resource}`}
                        onChange={(e) =>
                          setInherit(cfg, e.target.value as InheritMode)
                        }
                      >
                        {(['off', 'inherit', 'inherit-lock'] as InheritMode[]).map(
                          (m) => (
                            <option key={m} value={m}>
                              {INHERIT_LABEL[m]}
                            </option>
                          ),
                        )}
                      </Select>
                    </div>
                  )}

                  {/* JS-2 — attribute-rule-based who-can-set setters (Advanced only). */}
                  <div className={styles['adv__res-block']}>
                    <span className={styles['adv__res-label']}>
                      Rule-based setters
                    </span>
                    <span className={styles['adv__res-help']}>
                      Let anyone matching an attribute rule set the value on{' '}
                      {cfg.resource.toLowerCase()}.
                    </span>
                    <AttributeRulesEditor
                      rules={cfg.whoCanSet.grants.attributeRules}
                      onChange={(rules) => setRuleSetters(cfg, rules)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'filtering' && userBinding && (
            <div className={styles['adv__section']}>
              <p className={styles['adv__lead']}>
                Hide values from admins who aren’t cleared for them (need-to-know).
              </p>
              {readIntoLocked ? (
                <SectionNotice
                  type="Info"
                  title="Enforced for this source"
                  description={`Required for ${attribute.source.system}-owned lists — this is on and can’t be turned off.`}
                />
              ) : (
                <div className={styles['adv__toggle-row']}>
                  <Switch
                    checked={attribute.readIntoFiltering}
                    onChange={(e) => onReadIntoChange(e.target.checked)}
                    secondaryLabel="When on, values are hidden from admins who aren’t read into them."
                  >
                    Hide values viewers aren’t cleared for
                  </Switch>
                </div>
              )}
            </div>
          )}

          {activeTab === 'source' && sourceOwned && (
            <div className={styles['adv__section']}>
              <p className={styles['adv__lead']}>
                Full field mapping from the source system.
              </p>
              <div className={styles['adv__source-row']}>
                <LabelTag
                  label={attribute.source.system ?? 'Synced'}
                  type="Info"
                  size="Small"
                />
                {attribute.source.cadence && (
                  <Chip size="Small">{attribute.source.cadence}</Chip>
                )}
              </div>
              {attribute.source.fieldMap && (
                <code className={styles['adv__source-map']}>
                  {attribute.source.fieldMap}
                </code>
              )}
              <p className={styles['adv__source-status']}>
                {attribute.source.status}
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
