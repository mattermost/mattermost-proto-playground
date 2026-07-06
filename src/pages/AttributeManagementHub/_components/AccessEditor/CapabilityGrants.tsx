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
import AttributeRulesEditor from './AttributeRulesEditor';
import { type AccessCapability, type AccessGrant } from '../../hubData';
import styles from './AccessEditor.module.scss';

export const ROLES = [
  'Security Administrators',
  'Program Security Officers',
  'Channel Admins',
  'Team Admins',
  'Members',
  'Directory Administrators',
  'People Operations',
  'Finance Administrators',
  'UAS sync (system)',
  'LDAP sync (system)',
];

export const USERS = ['Marisol Vance', 'Idris Fanning', 'Priya Anand'];

type GrantType = 'roles' | 'users' | 'rules';

function GrantChips({
  grants,
  variant,
  onRemove,
  disabled,
}: {
  grants: AccessGrant[];
  variant: 'roles' | 'users';
  onRemove: (subject: string) => void;
  disabled: boolean;
}) {
  return (
    <div className={styles['access__chips']}>
      {grants.map((g) => (
        <Chip
          key={g.subject}
          size="Medium"
          leadingIcon={
            variant === 'users' ? <AccountOutlineIcon /> : <ShieldOutlineIcon />
          }
          onRemove={g.owner || disabled ? undefined : () => onRemove(g.subject)}
        >
          {g.subject}
          {g.owner ? ' · Owner' : ''}
        </Chip>
      ))}
    </div>
  );
}

/** A labeled, borderless grant row that collapses back to a chip when emptied. */
function GrantPoolSection({
  label,
  pool,
  grants,
  variant,
  readOnly,
  addLabel,
  emptyPickLabel,
  onChange,
  onCollapse,
}: {
  label: string;
  pool: string[];
  grants: AccessGrant[];
  variant: 'roles' | 'users';
  readOnly: boolean;
  addLabel: string;
  emptyPickLabel: string;
  onChange: (grants: AccessGrant[]) => void;
  onCollapse: () => void;
}) {
  const [pick, setPick] = useState('');
  const remaining = pool.filter((s) => !grants.some((g) => g.subject === s));

  const addGrant = (subject: string) => {
    if (!subject || grants.some((g) => g.subject === subject)) return;
    onChange([...grants, { subject }]);
    setPick('');
  };

  const removeGrant = (subject: string) => {
    onChange(grants.filter((g) => g.subject !== subject));
  };

  return (
    <section className={styles['access__row']}>
      <div className={styles['access__row-head']}>
        <span className={styles['access__row-label']}>{label}</span>
        {!readOnly && grants.length === 0 && (
          <IconButton
            size="Small"
            aria-label={`Remove ${label} grant`}
            icon={<Icon size="16" glyph={<CloseIcon />} />}
            onClick={onCollapse}
          />
        )}
      </div>

      {grants.length > 0 && (
        <GrantChips
          grants={grants}
          variant={variant}
          onRemove={removeGrant}
          disabled={readOnly}
        />
      )}

      {!readOnly && (
        <div className={styles['access__picker']}>
          <Select
            className={styles['access__picker-select']}
            size="Small"
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            aria-label={addLabel}
          >
            <option value="">{emptyPickLabel}</option>
            {remaining.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Button
            emphasis="Secondary"
            size="Small"
            disabled={!pick}
            onClick={() => addGrant(pick)}
          >
            Add
          </Button>
        </div>
      )}
    </section>
  );
}

export interface CapabilityGrantsProps {
  capability: AccessCapability;
  readOnly?: boolean;
  /** R4 — remove "Members" from the roles pool when the value must stay trusted. */
  disableMembersRole?: boolean;
  membersNote?: string;
  combineHint?: string;
  /** Caption above the add-chips row (e.g. "Also let others set it"). */
  addCaption?: string;
  onChange: (next: AccessCapability) => void;
}

const TRIGGER_LABEL: Record<GrantType, string> = {
  roles: 'Roles',
  users: 'Users',
  rules: 'Attribute rules',
};

export default function CapabilityGrants({
  capability,
  readOnly = false,
  disableMembersRole = false,
  membersNote,
  combineHint,
  addCaption,
  onChange,
}: CapabilityGrantsProps) {
  const [open, setOpen] = useState<Record<GrantType, boolean>>({
    roles: capability.roles.length > 0,
    users: capability.users.length > 0,
    rules: capability.attributeRules.length > 0,
  });

  const rolePool = disableMembersRole
    ? ROLES.filter((r) => r !== 'Members')
    : ROLES;

  const expand = (type: GrantType) =>
    setOpen((o) => ({ ...o, [type]: true }));
  const collapse = (type: GrantType) =>
    setOpen((o) => ({ ...o, [type]: false }));

  const inactive = (['roles', 'users', 'rules'] as GrantType[]).filter(
    (t) => !open[t],
  );

  return (
    <div className={styles['access__grants']}>
      {combineHint != null && (
        <p className={styles['access__combine-hint']}>{combineHint}</p>
      )}

      {open.roles && (
        <>
          <GrantPoolSection
            label="Roles"
            pool={rolePool}
            grants={capability.roles}
            variant="roles"
            readOnly={readOnly}
            addLabel="Add role"
            emptyPickLabel="Select role…"
            onChange={(roles) => onChange({ ...capability, roles })}
            onCollapse={() => collapse('roles')}
          />
          {disableMembersRole && membersNote != null && (
            <p className={styles['access__members-note']}>{membersNote}</p>
          )}
        </>
      )}

      {open.users && (
        <GrantPoolSection
          label="Specific users"
          pool={USERS}
          grants={capability.users}
          variant="users"
          readOnly={readOnly}
          addLabel="Add user"
          emptyPickLabel="Select user…"
          onChange={(users) => onChange({ ...capability, users })}
          onCollapse={() => collapse('users')}
        />
      )}

      {open.rules && (
        <section className={styles['access__row']}>
          <div className={styles['access__row-head']}>
            <span className={styles['access__row-label']}>
              Attribute-based rules
            </span>
            {!readOnly && capability.attributeRules.length === 0 && (
              <IconButton
                size="Small"
                aria-label="Remove attribute rules grant"
                icon={<Icon size="16" glyph={<CloseIcon />} />}
                onClick={() => collapse('rules')}
              />
            )}
          </div>
          <AttributeRulesEditor
            rules={capability.attributeRules}
            readOnly={readOnly}
            onChange={(attributeRules) =>
              onChange({ ...capability, attributeRules })
            }
          />
        </section>
      )}

      {!readOnly && inactive.length > 0 && (
        <div className={styles['access__triggers']}>
          {addCaption != null && (
            <span className={styles['access__triggers-caption']}>
              {addCaption}
            </span>
          )}
          <div className={styles['access__triggers-row']}>
            {inactive.map((type) => (
              <Button
                key={type}
                emphasis="Tertiary"
                size="Small"
                leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                onClick={() => expand(type)}
              >
                {TRIGGER_LABEL[type]}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
