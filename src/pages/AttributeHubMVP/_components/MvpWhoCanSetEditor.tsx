import { useId, useMemo, useRef, useState } from 'react';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import PopoverMenu, {
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
  PopoverMenuScroll,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import {
  SYNC_WHO_SETS,
  type HubAttribute,
  type ResourceConfig,
} from '@/pages/AttributeManagementHub/hubData';
import { applySettersList, selectedSetters } from './mvpModel';
import { setterRoleOptions, type SetterRoleOption } from './setterPickerData';
import styles from './MvpWhoCanSetEditor.module.scss';

export interface MvpWhoCanSetEditorProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
}

const SYNC_SYSTEMS = SYNC_WHO_SETS;

function matchesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

/**
 * MVP (P0) "Who can set the value" picker: a single field showing a relational
 * default plus an "Other roles" submenu. Trimmed copy — no inheritance lock,
 * no policy-locked "Members" guardrail (policy binding is out of P0's UI).
 */
export default function MvpWhoCanSetEditor({
  config,
  onChange,
}: MvpWhoCanSetEditorProps) {
  const { resource } = config;
  const wcs = config.whoCanSet;
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const syncLocked =
    wcs.relationalDefault != null && SYNC_SYSTEMS.includes(wcs.relationalDefault);
  const selected = selectedSetters(config);
  const selectedNames = useMemo(() => new Set(selected), [selected]);

  const rolePool = useMemo(
    () => setterRoleOptions(resource, false),
    [resource],
  );

  const filteredResourceRoles = useMemo(
    () =>
      rolePool.filter(
        (role) =>
          role.group === 'resource' &&
          !selectedNames.has(role.name) &&
          (query.trim() === '' || matchesQuery(role.name, query)),
      ),
    [query, rolePool, selectedNames],
  );

  const filteredSystemRoles = useMemo(
    () =>
      rolePool.filter(
        (role) =>
          role.group === 'system' &&
          !selectedNames.has(role.name) &&
          (query.trim() === '' || matchesQuery(role.name, query)),
      ),
    [query, rolePool, selectedNames],
  );

  const hasResults =
    filteredResourceRoles.length > 0 || filteredSystemRoles.length > 0;
  const hasSelections = selected.length > 0;

  const addRole = (role: SetterRoleOption) => {
    onChange({
      whoCanSet: applySettersList(resource, [...selected, role.name]),
    });
    setQuery('');
    inputRef.current?.focus();
    setOpen(true);
  };

  const removeRole = (subject: string) => {
    onChange({
      whoCanSet: applySettersList(
        resource,
        selected.filter((entry) => entry !== subject),
      ),
    });
  };

  const placeholder = hasSelections
    ? 'Enter roles to allow…'
    : 'Enter roles to allow setting this value…';

  if (syncLocked) {
    return (
      <div className={styles['setter__locked']}>
        <Chip size="Medium">{wcs.relationalDefault}</Chip>
        <span className={styles['setter__hint']}>
          Set by the sync system — not editable.
        </span>
      </div>
    );
  }

  const noOneCanSet = config.required && selected.length === 0;

  return (
    <div className={styles['edit']}>
      <div ref={fieldRef} className={styles['edit__field']}>
        {selected.map((subject) => (
          <Chip
            key={subject}
            size="Medium"
            leadingIcon={<AccountOutlineIcon />}
            onRemove={() => removeRole(subject)}
          >
            {subject}
          </Chip>
        ))}
        <input
          ref={inputRef}
          className={styles['edit__input']}
          type="text"
          value={query}
          placeholder={placeholder}
          aria-label="Add roles who can set this value"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          role="combobox"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false);
              inputRef.current?.blur();
              return;
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              const first = filteredResourceRoles[0] ?? filteredSystemRoles[0];
              if (first) {
                addRole(first);
              }
            }
          }}
        />
      </div>

      <FixedPopoverMenu
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={fieldRef}
        className={styles['edit__menu']}
        minWidthFloor={600}
      >
        <PopoverMenu className={styles['edit__popover']}>
          <PopoverMenuScroll maxHeight={320}>
            <div id={listboxId} role="listbox" aria-label="Roles who can set">
              {filteredResourceRoles.length > 0 && (
                <PopoverMenuGroup aria-label="Resource roles">
                  <PopoverMenuGroupTitle>Resource roles</PopoverMenuGroupTitle>
                  {filteredResourceRoles.map((role) => (
                    <MenuItem
                      key={role.name}
                      label={role.name}
                      secondaryLabel={
                        role.memberCount > 0 ? `${role.memberCount} users` : undefined
                      }
                      secondaryLabelPosition="Inline"
                      leadingVisual={<Icon size="16" glyph={<AccountOutlineIcon />} />}
                      onClick={() => addRole(role)}
                    />
                  ))}
                </PopoverMenuGroup>
              )}
              {filteredSystemRoles.length > 0 && (
                <PopoverMenuGroup aria-label="Other roles">
                  <PopoverMenuGroupTitle>Other roles</PopoverMenuGroupTitle>
                  {filteredSystemRoles.map((role) => (
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
              {!hasResults && (
                <p className={styles['edit__empty']}>
                  {query.trim() === ''
                    ? 'All roles are already added.'
                    : 'No matching roles.'}
                </p>
              )}
            </div>
          </PopoverMenuScroll>
        </PopoverMenu>
      </FixedPopoverMenu>

      {noOneCanSet && (
        <SectionNotice
          type="Danger"
          title="No one can set this value"
          description={`This resource requires a value, but no setter is selected. Choose who can set it so ${resource.toLowerCase()} can be created.`}
        />
      )}
    </div>
  );
}
