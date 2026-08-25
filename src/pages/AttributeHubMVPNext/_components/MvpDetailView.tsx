import { useEffect, useRef, useState } from 'react';
import Select from '@/components/ui/Select/Select';
import TextInput from '@/components/ui/TextInput/TextInput';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import {
  isPolicyLocked,
  isSourceOwned,
  type AttrType,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
  type SourceSystem,
} from '@/pages/AttributeManagementHub/hubData';
import MvpDefinitionValues from './MvpDefinitionValues';
import MvpAppliesToSection from './MvpAppliesToSection';
import MvpAddResourceMenu from './MvpAddResourceMenu';
import MvpSourceSection from './MvpSourceSection';
import MvpAttrTypeLabel from './MvpAttrTypeLabel';
import { mvpAttrTypeIcon } from './mvpAttrTypeIcons';
import Icon from '@/components/ui/Icon/Icon';
import styles from './MvpDetailView.module.scss';

/** P0 types only — Ranked-Hierarchical is cut. */
const MVP_ATTR_TYPES: AttrType[] = ['Select', 'Multiselect', 'Ranked', 'Text'];

function displayNameToUniqueName(displayName: string): string {
  return displayName.trim().replace(/\s+/g, '_');
}

function effectiveDisplayName(attribute: HubAttribute): string {
  return attribute.displayName?.trim() || attribute.name.trim();
}

export interface MvpDetailViewProps {
  attribute: HubAttribute;
  creating?: boolean;
  onDefinitionChange: (
    next: Partial<Pick<HubAttribute, 'name' | 'displayName' | 'type'>>,
  ) => void;
  onAddValue: (label: string) => void;
  onDeleteValue: (valueId: string) => void;
  onToggleValueDisabled: (valueId: string) => void;
  onBindingChange: (resource: ResourceKind, next: Partial<ResourceConfig>) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  onAddResource: (resource: ResourceKind) => void;
  onRemoveResource: (resource: ResourceKind) => void;
  /** OPEN — reveal allowed-value subsets (?allowed=on). */
  allowedOn: boolean;
  /** Connect an external source (LDAP / SAML) — demo modal only. */
  onConnectSource: (system: SourceSystem) => void;
  displayNameRef?: (el: HTMLInputElement | null) => void;
}

export default function MvpDetailView({
  attribute,
  creating = false,
  onDefinitionChange,
  onAddValue,
  onDeleteValue,
  onToggleValueDisabled,
  onBindingChange,
  onReadIntoFilteringChange,
  onAddResource,
  onRemoveResource,
  allowedOn,
  onConnectSource,
  displayNameRef,
}: MvpDetailViewProps) {
  const [nameEditing, setNameEditing] = useState(false);
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const sourceOwned = isSourceOwned(attribute);
  const policyLocked = isPolicyLocked(attribute);
  const nameReadOnly = sourceOwned;
  const typeReadOnly = sourceOwned || policyLocked;

  useEffect(() => {
    setNameEditing(false);
    setNameManuallyEdited(false);
  }, [attribute.id, creating]);

  useEffect(() => {
    if (nameEditing) {
      nameInputRef.current?.focus();
    }
  }, [nameEditing]);

  const uniqueNamePreview =
    attribute.name.trim() ||
    (creating ? displayNameToUniqueName(attribute.displayName ?? '') : '');

  const typeOptions: AttrType[] = MVP_ATTR_TYPES.includes(attribute.type)
    ? MVP_ATTR_TYPES
    : [...MVP_ATTR_TYPES, attribute.type];

  const handleDisplayNameChange = (value: string) => {
    if (creating && !nameManuallyEdited) {
      const hasEstablishedName =
        attribute.name.trim() !== '' &&
        (attribute.displayName ?? '').trim() !== '' &&
        value !== (attribute.displayName ?? '');
      if (!hasEstablishedName) {
        onDefinitionChange({
          displayName: value,
          name: displayNameToUniqueName(value),
        });
        return;
      }
    }
    onDefinitionChange({ displayName: value });
  };

  const handleUniqueNameChange = (value: string) => {
    setNameManuallyEdited(true);
    onDefinitionChange({ name: value });
  };

  return (
    <div className={styles['detail']}>
      <ConsolePanel title="Definition" subtitle="Display name, type, and options.">
        <div className={styles['detail__def']}>
          <div className={styles['detail__row']} data-tour-focus="attr-display-name">
            <span className={styles['detail__key']}>Display name</span>
            <div className={styles['detail__field']}>
              <TextInput
                ref={displayNameRef}
                className={styles['detail__display-input']}
                size="Medium"
                value={effectiveDisplayName(attribute)}
                readOnly={nameReadOnly}
                placeholder={creating ? 'Label shown in the product' : undefined}
                aria-label="Display name"
                onChange={(e) => handleDisplayNameChange(e.target.value)}
              />

              {nameEditing ? (
                <div
                  className={[
                    styles['detail__unique-row'],
                    styles['detail__unique-row--editing'],
                  ].join(' ')}
                  data-tour-focus="attr-unique-name"
                >
                  <span className={styles['detail__unique-label']}>Unique name:</span>
                  <TextInput
                    ref={nameInputRef}
                    className={styles['detail__unique-input']}
                    size="Small"
                    value={attribute.name}
                    readOnly={nameReadOnly}
                    placeholder="Internal identifier"
                    aria-label="Unique name"
                    onChange={(e) => handleUniqueNameChange(e.target.value)}
                  />
                  {!nameReadOnly && (
                    <button
                      type="button"
                      className={styles['detail__unique-action']}
                      onClick={() => setNameEditing(false)}
                    >
                      Done
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={styles['detail__unique-row']}
                  data-tour-focus="attr-unique-name"
                >
                  <span className={styles['detail__unique-label']}>Unique name:</span>
                  <span className={styles['detail__unique-value']}>
                    {uniqueNamePreview || '—'}
                  </span>
                  {!nameReadOnly && (
                    <button
                      type="button"
                      className={styles['detail__unique-action']}
                      onClick={() => setNameEditing(true)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}

              <p className={styles['detail__hint']}>
                Unique name is the internal identifier for policies and integrations.
                Display name is what admins and users see.
              </p>
            </div>
          </div>

          <div className={styles['detail__row']} data-tour-focus="attr-type">
            <span className={styles['detail__key']}>Type</span>
            <div className={styles['detail__field']}>
              {typeReadOnly ? (
                <MvpAttrTypeLabel
                  type={attribute.type}
                  className={styles['detail__type-label']}
                />
              ) : (
                <Select
                  className={styles['detail__input']}
                  size="Medium"
                  value={attribute.type}
                  aria-label="Attribute type"
                  leadingIcon={
                    <Icon size="16" glyph={mvpAttrTypeIcon(attribute.type)} />
                  }
                  onChange={(e) =>
                    onDefinitionChange({ type: e.target.value as AttrType })
                  }
                >
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              )}
              {policyLocked && !sourceOwned && (
                <p className={styles['detail__lock']}>
                  Locked — used by {attribute.usedByPolicies}{' '}
                  {attribute.usedByPolicies === 1 ? 'policy' : 'policies'}.
                  Changing the type could break them.
                </p>
              )}
            </div>
          </div>

          <div className={styles['detail__row']} data-tour-focus="attr-values">
            <span className={styles['detail__key']}>Options</span>
            <div className={styles['detail__field']}>
              <MvpDefinitionValues
                attribute={attribute}
                onAddValue={onAddValue}
                onDeleteValue={onDeleteValue}
                onToggleDisabled={onToggleValueDisabled}
              />
              {!sourceOwned && (
                <MvpSourceSection
                  attribute={attribute}
                  onConnect={onConnectSource}
                />
              )}
            </div>
          </div>
        </div>
      </ConsolePanel>

      <ConsolePanel
        title="Applies to"
        subtitle="Resources this attribute applies to, and who can set the value on each."
        trailing={
          <MvpAddResourceMenu
            applied={attribute.appliesTo.map((c) => c.resource)}
            onAdd={onAddResource}
            align="end"
          />
        }
      >
        <MvpAppliesToSection
          attribute={attribute}
          onBindingChange={onBindingChange}
          onReadIntoFilteringChange={onReadIntoFilteringChange}
          onAddResource={onAddResource}
          onRemoveResource={onRemoveResource}
          allowedOn={allowedOn}
        />
      </ConsolePanel>
    </div>
  );
}
