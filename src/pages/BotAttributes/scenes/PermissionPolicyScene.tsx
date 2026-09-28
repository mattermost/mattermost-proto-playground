import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import ChevronDownCircleOutlineIcon from '@mattermost/compass-icons/components/chevron-down-circle-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import EmailOutlineIcon from '@mattermost/compass-icons/components/email-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import MenuVariantIcon from '@mattermost/compass-icons/components/menu-variant';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ShieldAlertOutlineIcon from '@mattermost/compass-icons/components/shield-alert-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import TextInput from '@/components/ui/TextInput/TextInput';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import BotAttributesConsoleShell from './BotAttributesConsoleShell';
import styles from './PermissionPolicyScene.module.scss';

type PolicyRole = 'guests' | 'members' | 'system_admins' | 'bots';

type RoleOption = {
  id: PolicyRole;
  label: string;
  description: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'guests',
    label: 'Guest users',
    description: 'Applies only to guest users.',
  },
  {
    id: 'members',
    label: 'Members',
    description:
      'Applies to regular members. System administrators also fall back to this rule if no admin-specific policy with the same permissions exists.',
  },
  {
    id: 'system_admins',
    label: 'System administrators',
    description: 'Applies only to system administrators.',
  },
  {
    id: 'bots',
    label: 'Bot accounts',
    description: 'Applies only to bot accounts.',
  },
];

type AttrSection = 'built-in' | 'custom';

type AttrDef = {
  id: string;
  label: string;
  key: string;
  section: AttrSection;
  audience: 'user' | 'bot' | 'both';
  icon: ReactNode;
};

const ATTRIBUTES: AttrDef[] = [
  {
    id: 'email',
    label: 'Email',
    key: 'email',
    section: 'built-in',
    audience: 'user',
    icon: <EmailOutlineIcon />,
  },
  {
    id: 'verified',
    label: 'Email verified',
    key: 'verified',
    section: 'built-in',
    audience: 'user',
    icon: <CheckIcon />,
  },
  {
    id: 'createat',
    label: 'Account created',
    key: 'createat',
    section: 'built-in',
    audience: 'both',
    icon: <MenuVariantIcon />,
  },
  {
    id: 'clearance',
    label: 'Security Clearance',
    key: 'clearance',
    section: 'custom',
    audience: 'both',
    icon: <ShieldAlertOutlineIcon />,
  },
  {
    id: 'program',
    label: 'Program',
    key: 'program',
    section: 'custom',
    audience: 'bot',
    icon: <MenuVariantIcon />,
  },
  {
    id: 'caveat',
    label: 'Caveat',
    key: 'caveat',
    section: 'custom',
    audience: 'bot',
    icon: <ChevronDownCircleOutlineIcon />,
  },
];

const ATTR_VALUES: Record<string, string[]> = {
  email: ['*@mattermost.com', '*@acme.com'],
  verified: ['true', 'false'],
  createat: ['Last 30 days', 'Last 90 days', 'Last year'],
  clearance: ['Unclassified', 'Confidential', 'Secret', 'Top Secret'],
  program: ['Dragon Spacecraft', 'Watch Floor', 'Delta Ops'],
  caveat: ['NOFORN', 'REL TO USA, GBR', 'ORCON'],
};

type Condition = {
  id: string;
  attributeId: string;
  value: string;
};

type PermissionDef = {
  id: string;
  label: string;
  description: string;
};

const AVAILABLE_PERMISSIONS: PermissionDef[] = [
  {
    id: 'view_channel',
    label: 'View Channel',
    description: 'Allow viewing channel content and history',
  },
  {
    id: 'create_post',
    label: 'Create Posts',
    description: 'Allow posting messages in a channel',
  },
  {
    id: 'download_files',
    label: 'Download Files',
    description: 'Allow users to download files to their device',
  },
  {
    id: 'upload_files',
    label: 'Upload Files',
    description: 'Allow users to upload files while sending a message',
  },
  {
    id: 'manage_public_channel',
    label: 'Manage Public Channels',
    description: 'Allow creating and managing public channels',
  },
];

let conditionSeq = 2;

/**
 * System Console → Permission Policies → Edit.
 * Attribute requirements match the local table editor (searchable attribute
 * menu, Add attribute, Test access rule). Bot accounts role drops `isbot`.
 */
export default function PermissionPolicyScene() {
  const [policyName, setPolicyName] = useState('Bot file access');
  const [role, setRole] = useState<PolicyRole>('bots');
  const [roleOpen, setRoleOpen] = useState(false);
  const [conditions, setConditions] = useState<Condition[]>([
    { id: 'c1', attributeId: 'program', value: 'Dragon Spacecraft' },
  ]);
  const [attrPickerFor, setAttrPickerFor] = useState<string | null>(null);
  const [addAttrOpen, setAddAttrOpen] = useState(false);
  const [valuePickerFor, setValuePickerFor] = useState<string | null>(null);
  const [attrSearch, setAttrSearch] = useState('');
  const [permissions, setPermissions] = useState<PermissionDef[]>([
    AVAILABLE_PERMISSIONS.find((perm) => perm.id === 'download_files')!,
  ]);
  const [permOpen, setPermOpen] = useState(false);

  const roleRef = useRef<HTMLDivElement>(null);
  const permRef = useRef<HTMLDivElement>(null);
  const attrMenuRef = useRef<HTMLDivElement>(null);
  const addAttrRef = useRef<HTMLDivElement>(null);
  const valueMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClose(roleRef, roleOpen, () => setRoleOpen(false));
  useOutsideClose(permRef, permOpen, () => setPermOpen(false));
  useOutsideClose(attrMenuRef, attrPickerFor !== null, () => {
    setAttrPickerFor(null);
    setAttrSearch('');
  });
  useOutsideClose(addAttrRef, addAttrOpen, () => {
    setAddAttrOpen(false);
    setAttrSearch('');
  });
  useOutsideClose(valueMenuRef, valuePickerFor !== null, () =>
    setValuePickerFor(null),
  );

  const selectedRole = ROLE_OPTIONS.find((option) => option.id === role)!;
  const subjectLabel = role === 'bots' ? 'bot' : 'user';

  const visibleAttrs = useMemo(() => {
    const audience = role === 'bots' ? 'bot' : 'user';
    return ATTRIBUTES.filter(
      (attr) => attr.audience === 'both' || attr.audience === audience,
    );
  }, [role]);

  const filteredAttrs = useMemo(() => {
    const q = attrSearch.trim().toLowerCase();
    const used = new Set(conditions.map((row) => row.attributeId));
    const base = addAttrOpen
      ? visibleAttrs.filter((attr) => !used.has(attr.id))
      : visibleAttrs;
    if (!q) return base;
    return base.filter(
      (attr) =>
        attr.label.toLowerCase().includes(q) ||
        attr.key.toLowerCase().includes(q),
    );
  }, [visibleAttrs, attrSearch, addAttrOpen, conditions]);

  const unusedPermissions = AVAILABLE_PERMISSIONS.filter(
    (perm) => !permissions.some((row) => row.id === perm.id),
  );

  const closeAttrMenus = () => {
    setAttrPickerFor(null);
    setAddAttrOpen(false);
    setAttrSearch('');
  };

  const setConditionAttr = (conditionId: string, attributeId: string) => {
    const firstValue = ATTR_VALUES[attributeId]?.[0] ?? '';
    setConditions((rows) =>
      rows.map((row) =>
        row.id === conditionId
          ? { ...row, attributeId, value: firstValue }
          : row,
      ),
    );
    closeAttrMenus();
    setValuePickerFor(null);
  };

  const setConditionValue = (conditionId: string, value: string) => {
    setConditions((rows) =>
      rows.map((row) =>
        row.id === conditionId ? { ...row, value } : row,
      ),
    );
    setValuePickerFor(null);
  };

  const removeCondition = (conditionId: string) => {
    setConditions((rows) => rows.filter((row) => row.id !== conditionId));
  };

  const addAttributeById = (attributeId: string) => {
    conditionSeq += 1;
    setConditions((rows) => [
      ...rows,
      {
        id: `c${conditionSeq}`,
        attributeId,
        value: '',
      },
    ]);
    closeAttrMenus();
  };

  const openAddAttributeMenu = () => {
    setAttrPickerFor(null);
    setValuePickerFor(null);
    setAttrSearch('');
    setAddAttrOpen((open) => !open);
  };

  const addPermission = (perm: PermissionDef) => {
    setPermissions((rows) => [...rows, perm]);
    setPermOpen(false);
  };

  const removePermission = (permId: string) => {
    setPermissions((rows) => rows.filter((row) => row.id !== permId));
  };

  const switchRole = (next: PolicyRole) => {
    setRole(next);
    setRoleOpen(false);
    const audience = next === 'bots' ? 'bot' : 'user';
    const first = ATTRIBUTES.find(
      (attr) => attr.audience === 'both' || attr.audience === audience,
    );
    const attributeId = first?.id ?? 'email';
    setConditions([
      {
        id: 'c1',
        attributeId,
        value: ATTR_VALUES[attributeId]?.[0] ?? '',
      },
    ]);
    setAttrPickerFor(null);
    setAddAttrOpen(false);
    setAttrSearch('');
    setValuePickerFor(null);
  };

  const renderAttrMenu = ({
    selectedAttributeId,
    onSelect,
  }: {
    selectedAttributeId?: string;
    onSelect: (attributeId: string) => void;
  }) => {
    const builtIn = filteredAttrs.filter((item) => item.section === 'built-in');
    const custom = filteredAttrs.filter((item) => item.section === 'custom');

    return (
      <div className={styles['pp__attr-menu']}>
        <PopoverMenu
          aria-label="Select attribute"
          className={styles['pp__attr-popover']}
        >
          <div className={styles['pp__attr-search']}>
            <SearchInput
              size="Small"
              placeholder="Search attributes…"
              aria-label="Search attributes"
              value={attrSearch}
              autoFocus
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setAttrSearch(e.currentTarget.value)
              }
              onClear={() => setAttrSearch('')}
            />
          </div>
          <div className={styles['pp__attr-body']}>
            {builtIn.length > 0 && (
              <PopoverMenuGroup aria-label="Built-in attributes">
                <PopoverMenuGroupTitle>
                  Built-in attributes
                </PopoverMenuGroupTitle>
                {builtIn.map((item) => (
                  <MenuItem
                    key={item.id}
                    label={item.label}
                    secondaryLabel={item.key}
                    secondaryLabelPosition="Below"
                    leadingVisual={<Icon size="18" glyph={item.icon} />}
                    active={item.id === selectedAttributeId}
                    trailingElement={item.id === selectedAttributeId}
                    onClick={() => onSelect(item.id)}
                  />
                ))}
              </PopoverMenuGroup>
            )}
            {custom.length > 0 && (
              <PopoverMenuGroup aria-label="Custom attributes">
                <PopoverMenuGroupTitle>
                  Custom attributes
                </PopoverMenuGroupTitle>
                {custom.map((item) => (
                  <MenuItem
                    key={item.id}
                    label={item.label}
                    secondaryLabel={item.key}
                    secondaryLabelPosition="Below"
                    leadingVisual={<Icon size="18" glyph={item.icon} />}
                    active={item.id === selectedAttributeId}
                    trailingElement={item.id === selectedAttributeId}
                    onClick={() => onSelect(item.id)}
                  />
                ))}
              </PopoverMenuGroup>
            )}
            {filteredAttrs.length === 0 && (
              <p className={styles['pp__attr-empty']}>No attributes match</p>
            )}
          </div>
        </PopoverMenu>
      </div>
    );
  };

  return (
    <BotAttributesConsoleShell
      title="Attribute Based Permission Policy"
      activeItemId="permission-policies"
    >
      <div className={styles['pp']}>
        <div className={styles['pp__name-row']}>
          <span className={styles['pp__name-label']}>Policy name</span>
          <div className={styles['pp__name-field']}>
            <TextInput
              value={policyName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPolicyName(e.currentTarget.value)
              }
            />
          </div>
        </div>

        <div className={styles['pp__info-banner']}>
          <Icon size="20" glyph={<InformationOutlineIcon />} />
          <div className={styles['pp__info-banner-content']}>
            <p className={styles['pp__info-banner-title']}>
              The permissions defined in this policy override the{' '}
              <a href="#schemes" className={styles['pp__info-banner-link']}>
                system permission schemes
              </a>{' '}
              when its conditions are met
            </p>
            <p className={styles['pp__info-banner-sub']}>
              Permissions evaluation order: Permission policies (evaluated first)
              → System scheme / Team override scheme (fallback when no policy
              applies).
            </p>
          </div>
        </div>

        <AdminPanel
          className={styles['pp__panel']}
          title="Who this policy applies to"
          subtitle={`Define rules based on ${subjectLabel} attributes and values`}
        >
          <label className={styles['pp__field-label']}>
            Select a role from the predefined list of system roles
          </label>
          <div className={styles['pp__role']} ref={roleRef}>
            <button
              type="button"
              className={styles['pp__role-trigger']}
              aria-expanded={roleOpen}
              aria-haspopup="listbox"
              onClick={() => setRoleOpen((open) => !open)}
            >
              <span>{selectedRole.label}</span>
              <Icon size="16" glyph={<ChevronDownIcon />} />
            </button>
            {roleOpen && (
              <div className={styles['pp__role-menu']}>
                <PopoverMenu aria-label="Select a role">
                  {ROLE_OPTIONS.map((option) => (
                    <MenuItem
                      key={option.id}
                      label={option.label}
                      secondaryLabel={option.description}
                      secondaryLabelPosition="Below"
                      leadingElement={false}
                      active={option.id === role}
                      trailingElement={option.id === role}
                      onClick={() => switchRole(option.id)}
                    />
                  ))}
                </PopoverMenu>
              </div>
            )}
          </div>
        </AdminPanel>

        <AdminPanel
          className={styles['pp__panel']}
          title={
            role === 'bots'
              ? 'Bot attribute requirements'
              : 'User attribute requirements'
          }
          subtitle={`Select attributes and values that ${subjectLabel}s must have for this policy`}
          headerActions={
            <Button emphasis="Primary" size="Small">
              Switch to Advanced Mode
            </Button>
          }
        >
          <div className={styles['pp__editor']}>
            <div className={styles['pp__table']}>
              <div className={styles['pp__table-head']}>
                <span className={styles['pp__col-drag']} />
                <span>Attribute</span>
                <span>Operator</span>
                <span>Values</span>
                <span className={styles['pp__col-remove']} />
              </div>
              {conditions.length === 0 ? (
                <p className={styles['pp__blank']}>
                  No attributes selected. Add an attribute to create a rule.
                </p>
              ) : (
                conditions.map((condition) => {
                  const attr =
                    visibleAttrs.find(
                      (item) => item.id === condition.attributeId,
                    ) ?? visibleAttrs[0];
                  return (
                    <div key={condition.id} className={styles['pp__table-row']}>
                      <span className={styles['pp__drag']} aria-hidden>
                        <Icon size="16" glyph={<DragVerticalIcon />} />
                      </span>
                      <div className={styles['pp__attr-cell']} ref={
                        attrPickerFor === condition.id ? attrMenuRef : undefined
                      }>
                        <button
                          type="button"
                          className={styles['pp__field-btn']}
                          aria-expanded={attrPickerFor === condition.id}
                          aria-haspopup="listbox"
                          onClick={() => {
                            setValuePickerFor(null);
                            setAddAttrOpen(false);
                            setAttrPickerFor((current) =>
                              current === condition.id ? null : condition.id,
                            );
                            setAttrSearch('');
                          }}
                        >
                          {attr && (
                            <span className={styles['pp__field-btn-icon']}>
                              <Icon size="16" glyph={attr.icon} />
                            </span>
                          )}
                          <span>{attr?.label ?? 'Select attribute'}</span>
                        </button>
                        {attrPickerFor === condition.id &&
                          renderAttrMenu({
                            selectedAttributeId: condition.attributeId,
                            onSelect: (attributeId) =>
                              setConditionAttr(condition.id, attributeId),
                          })}
                      </div>
                      <span className={styles['pp__operator']}>= is</span>
                      <div
                        className={styles['pp__value-cell']}
                        ref={
                          valuePickerFor === condition.id
                            ? valueMenuRef
                            : undefined
                        }
                      >
                        <button
                          type="button"
                          className={[
                            styles['pp__field-btn'],
                            !condition.value
                              ? styles['pp__field-btn--placeholder']
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => {
                            setAttrPickerFor(null);
                            setAddAttrOpen(false);
                            setValuePickerFor((current) =>
                              current === condition.id ? null : condition.id,
                            );
                          }}
                        >
                          {condition.value || 'Add value...'}
                        </button>
                        {valuePickerFor === condition.id && (
                          <ul
                            className={styles['pp__value-menu']}
                            role="listbox"
                          >
                            {(ATTR_VALUES[attr?.id ?? ''] ?? []).map(
                              (value) => (
                                <li key={value}>
                                  <button
                                    type="button"
                                    role="option"
                                    aria-selected={value === condition.value}
                                    className={styles['pp__value-item']}
                                    onClick={() =>
                                      setConditionValue(condition.id, value)
                                    }
                                  >
                                    {value}
                                    {value === condition.value && (
                                      <Icon size="16" glyph={<CheckIcon />} />
                                    )}
                                  </button>
                                </li>
                              ),
                            )}
                          </ul>
                        )}
                      </div>
                      <IconButton
                        size="Small"
                        className={styles['pp__remove']}
                        aria-label="Remove attribute"
                        icon={
                          <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                        }
                        onClick={() => removeCondition(condition.id)}
                      />
                    </div>
                  );
                })
              )}
              <div className={styles['pp__add-row']} ref={addAttrRef}>
                <Button
                  emphasis="Secondary"
                  size="Small"
                  leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                  disabled={
                    visibleAttrs.filter(
                      (attr) =>
                        !conditions.some((row) => row.attributeId === attr.id),
                    ).length === 0
                  }
                  aria-expanded={addAttrOpen}
                  aria-haspopup="listbox"
                  onClick={openAddAttributeMenu}
                >
                  Add attribute
                </Button>
                {addAttrOpen &&
                  renderAttrMenu({
                    onSelect: addAttributeById,
                  })}
              </div>
            </div>

            <div className={styles['pp__editor-footer']}>
              <p className={styles['pp__help']}>
                Each row is a single condition that must be met for a{' '}
                {subjectLabel} to comply with the policy. All rules are combined
                with logical AND operator{' '}
                <code className={styles['pp__and']}>&&</code>.
              </p>
              <Button
                className={styles['pp__test-btn']}
                emphasis="Tertiary"
                size="Small"
                leadingIcon={<Icon size="16" glyph={<LockOutlineIcon />} />}
                disabled={
                  conditions.length === 0 || !conditions.some((c) => c.value)
                }
              >
                Test access rule
              </Button>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel
          className={styles['pp__panel']}
          title="What permissions are modified"
          subtitle="These permissions override the default system permission scheme when policy conditions are met"
        >
          <div className={styles['pp__perm-table']}>
            <div className={styles['pp__perm-head']}>Permission</div>
            {permissions.length === 0 ? (
              <p className={styles['pp__perm-empty']}>
                Add a permission to get started…
              </p>
            ) : (
              <ul className={styles['pp__perm-list']}>
                {permissions.map((perm) => (
                  <li key={perm.id} className={styles['pp__perm-row']}>
                    <span className={styles['pp__perm-label']}>{perm.label}</span>
                    <IconButton
                      size="Small"
                      className={styles['pp__perm-remove']}
                      aria-label={`Remove ${perm.label}`}
                      icon={
                        <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                      }
                      onClick={() => removePermission(perm.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles['pp__perm-add']} ref={permRef}>
            <Button
              emphasis="Secondary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
              disabled={unusedPermissions.length === 0}
              aria-expanded={permOpen}
              aria-haspopup="menu"
              onClick={() => setPermOpen((open) => !open)}
            >
              Add permission
            </Button>
            {permOpen && unusedPermissions.length > 0 && (
              <div className={styles['pp__perm-menu']}>
                <PopoverMenu aria-label="Add permission">
                  {unusedPermissions.map((perm) => (
                    <MenuItem
                      key={perm.id}
                      label={perm.label}
                      secondaryLabel={perm.description}
                      secondaryLabelPosition="Below"
                      leadingElement={false}
                      onClick={() => addPermission(perm)}
                    />
                  ))}
                </PopoverMenu>
              </div>
            )}
          </div>
        </AdminPanel>

        <div className={styles['pp__actions']}>
          <Button emphasis="Primary">Save</Button>
        </div>
      </div>
    </BotAttributesConsoleShell>
  );
}
