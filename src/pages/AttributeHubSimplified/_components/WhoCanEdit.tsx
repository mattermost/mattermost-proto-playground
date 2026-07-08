import { useId, useMemo, useRef, useState } from 'react';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import PopoverMenu, {
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
  PopoverMenuScroll,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import {
  type AccessGrant,
  type HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import {
  EDITOR_ROLE_OPTIONS,
  EDITOR_USER_OPTIONS,
  type EditorRoleOption,
  type EditorUserOption,
} from './editorPickerData';
import styles from './WhoCanEdit.module.scss';

export interface WhoCanEditProps {
  attribute: HubAttribute;
  editors: { roles: AccessGrant[]; users: AccessGrant[] };
  onChange: (next: { roles: AccessGrant[]; users: AccessGrant[] }) => void;
  readOnly?: boolean;
}

function matchesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

/**
 * Unified role/user picker for "Who can edit" — chips plus a single combobox
 * that opens a role list on focus and filters roles and users while typing.
 */
export default function WhoCanEdit({ editors, onChange, readOnly = false }: WhoCanEditProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selectedRoleNames = useMemo(
    () => new Set(editors.roles.map((grant) => grant.subject)),
    [editors.roles],
  );
  const selectedUserNames = useMemo(
    () => new Set(editors.users.map((grant) => grant.subject)),
    [editors.users],
  );

  const filteredRoles = useMemo(
    () =>
      EDITOR_ROLE_OPTIONS.filter(
        (role) =>
          !selectedRoleNames.has(role.name) &&
          (query.trim() === '' || matchesQuery(role.name, query)),
      ),
    [query, selectedRoleNames],
  );

  const filteredUsers = useMemo(
    () =>
      EDITOR_USER_OPTIONS.filter(
        (user) =>
          !selectedUserNames.has(user.name) &&
          (query.trim() === '' ||
            matchesQuery(user.name, query) ||
            matchesQuery(user.handle, query)),
      ),
    [query, selectedUserNames],
  );

  const hasResults = filteredRoles.length > 0 || filteredUsers.length > 0;
  const hasSelections = editors.roles.length > 0 || editors.users.length > 0;

  const addRole = (role: EditorRoleOption) => {
    onChange({ ...editors, roles: [...editors.roles, { subject: role.name }] });
    setQuery('');
    inputRef.current?.focus();
    setOpen(true);
  };

  const addUser = (user: EditorUserOption) => {
    onChange({ ...editors, users: [...editors.users, { subject: user.name }] });
    setQuery('');
    inputRef.current?.focus();
    setOpen(true);
  };

  const removeRole = (subject: string) =>
    onChange({ ...editors, roles: editors.roles.filter((grant) => grant.subject !== subject) });

  const removeUser = (subject: string) =>
    onChange({ ...editors, users: editors.users.filter((grant) => grant.subject !== subject) });

  const openMenu = () => setOpen(true);

  const placeholder = hasSelections
    ? 'Enter roles, groups, or users…'
    : 'Enter roles, groups, or users to allow…';

  if (readOnly) {
    return (
      <div className={styles['edit']}>
        <div className={[styles['edit__field'], styles['edit__field--locked']].join(' ')}>
          {editors.roles.map((grant) => (
            <Chip
              key={`role-${grant.subject}`}
              size="Medium"
              leadingIcon={<AccountOutlineIcon />}
            >
              {grant.subject}
              {grant.owner ? ' · Owner' : ''}
            </Chip>
          ))}
          {editors.users.map((grant) => {
            const profile = EDITOR_USER_OPTIONS.find((user) => user.name === grant.subject);
            return (
              <Chip
                key={`user-${grant.subject}`}
                size="Medium"
                leadingAvatar={
                  profile
                    ? { src: profile.avatarSrc, alt: grant.subject }
                    : undefined
                }
                leadingIcon={profile ? undefined : <AccountOutlineIcon />}
              >
                {grant.subject}
                {grant.owner ? ' · Owner' : ''}
              </Chip>
            );
          })}
          {!hasSelections && (
            <span className={styles['edit__caption']}>No editors configured.</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles['edit']}>
      <div
        ref={fieldRef}
        className={styles['edit__field']}
        onMouseDown={(event) => {
          if (event.target === fieldRef.current) {
            event.preventDefault();
            inputRef.current?.focus();
          }
        }}
      >
        {editors.roles.map((grant) => (
          <Chip
            key={`role-${grant.subject}`}
            size="Medium"
            leadingIcon={<AccountOutlineIcon />}
            onRemove={grant.owner ? undefined : () => removeRole(grant.subject)}
          >
            {grant.subject}
            {grant.owner ? ' · Owner' : ''}
          </Chip>
        ))}
        {editors.users.map((grant) => {
          const profile = EDITOR_USER_OPTIONS.find((user) => user.name === grant.subject);
          return (
            <Chip
              key={`user-${grant.subject}`}
              size="Medium"
              leadingAvatar={
                profile
                  ? { src: profile.avatarSrc, alt: grant.subject }
                  : undefined
              }
              leadingIcon={profile ? undefined : <AccountOutlineIcon />}
              onRemove={grant.owner ? undefined : () => removeUser(grant.subject)}
            >
              {grant.subject}
              {grant.owner ? ' · Owner' : ''}
            </Chip>
          );
        })}
        <input
          ref={inputRef}
          className={styles['edit__input']}
          type="text"
          value={query}
          placeholder={placeholder}
          aria-label="Add roles or users who can edit this attribute"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          role="combobox"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={openMenu}
          onClick={openMenu}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false);
              inputRef.current?.blur();
              return;
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              if (filteredRoles[0]) {
                addRole(filteredRoles[0]);
              } else if (filteredUsers[0]) {
                addUser(filteredUsers[0]);
              }
            }
          }}
        />
      </div>

      <p className={styles['edit__caption']}>
        Add roles, groups, or users that can edit this attribute&apos;s configuration.
      </p>

      <FixedPopoverMenu
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={fieldRef}
        className={styles['edit__menu']}
        minWidthFloor={600}
      >
        <PopoverMenu className={styles['edit__popover']}>
          <PopoverMenuScroll maxHeight={320}>
            <div id={listboxId} role="listbox" aria-label="Roles and users">
              {filteredRoles.length > 0 && (
                <PopoverMenuGroup aria-label="Roles">
                  <PopoverMenuGroupTitle>Roles</PopoverMenuGroupTitle>
                  {filteredRoles.map((role) => (
                    <MenuItem
                      key={role.name}
                      label={role.name}
                      secondaryLabel={`${role.memberCount} users`}
                      secondaryLabelPosition="Inline"
                      leadingVisual={<Icon size="16" glyph={<AccountOutlineIcon />} />}
                      onClick={() => addRole(role)}
                    />
                  ))}
                </PopoverMenuGroup>
              )}
              {filteredUsers.length > 0 && (
                <PopoverMenuGroup aria-label="Users">
                  <PopoverMenuGroupTitle>Users</PopoverMenuGroupTitle>
                  {filteredUsers.map((user) => (
                    <MenuItem
                      key={user.name}
                      label={user.name}
                      secondaryLabel={`@${user.handle}`}
                      secondaryLabelPosition="Inline"
                      leadingVisual={
                        <UserAvatar src={user.avatarSrc} alt={user.name} size="24" />
                      }
                      onClick={() => addUser(user)}
                    />
                  ))}
                </PopoverMenuGroup>
              )}
              {!hasResults && (
                <p className={styles['edit__empty']}>
                  {query.trim() === ''
                    ? 'All roles and users are already added.'
                    : 'No matching roles or users.'}
                </p>
              )}
            </div>
          </PopoverMenuScroll>
        </PopoverMenu>
      </FixedPopoverMenu>
    </div>
  );
}
