import { useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Select from '@/components/ui/Select/Select';
import TextInput from '@/components/ui/TextInput/TextInput';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
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
import styles from './MvpDetailView.module.scss';

/** P0 types only — Ranked-Hierarchical is cut. */
const MVP_ATTR_TYPES: AttrType[] = ['Select', 'Multiselect', 'Ranked', 'Text'];

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
  const [nameExpanded, setNameExpanded] = useState(
    () => creating || attribute.name.trim().length > 0,
  );
  const sourceOwned = isSourceOwned(attribute);
  const policyLocked = isPolicyLocked(attribute);
  const nameReadOnly = sourceOwned;
  const typeReadOnly = sourceOwned || policyLocked;

  return (
    <div className={styles['detail']}>
      <ConsolePanel title="Definition" subtitle="Display name, type, and options.">
        <div className={styles['detail__def']}>
          <div className={styles['detail__row']}>
            <span className={styles['detail__key']}>Display name</span>
            <div className={styles['detail__field']}>
              <div className={styles['detail__display-row']}>
                <TextInput
                  ref={displayNameRef}
                  className={styles['detail__display-input']}
                  size="Medium"
                  value={attribute.displayName ?? ''}
                  readOnly={nameReadOnly}
                  placeholder={creating ? 'Label shown in the product' : undefined}
                  aria-label="Display name"
                  onChange={(e) =>
                    onDefinitionChange({ displayName: e.target.value })
                  }
                />
                <IconButton
                  className={styles['detail__name-toggle']}
                  size="Small"
                  aria-label={nameExpanded ? 'Hide name field' : 'Show name field'}
                  aria-expanded={nameExpanded}
                  icon={
                    <Icon
                      size="16"
                      glyph={nameExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    />
                  }
                  onClick={() => setNameExpanded((open) => !open)}
                />
                <span className={styles['detail__name-toggle-label']}>Name</span>
              </div>
              {nameExpanded && (
                <TextInput
                  className={styles['detail__input']}
                  size="Medium"
                  value={attribute.name}
                  readOnly={nameReadOnly}
                  placeholder="Internal identifier"
                  aria-label="Attribute name"
                  onChange={(e) => onDefinitionChange({ name: e.target.value })}
                />
              )}
              <p className={styles['detail__hint']}>
                Name is the internal identifier for policies and integrations.
                Display name is what admins and users see.
              </p>
            </div>
          </div>

          <div className={styles['detail__row']}>
            <span className={styles['detail__key']}>Type</span>
            <div className={styles['detail__field']}>
              <Select
                className={styles['detail__input']}
                size="Medium"
                value={attribute.type}
                readOnly={typeReadOnly}
                aria-label="Attribute type"
                onChange={(e) =>
                  onDefinitionChange({ type: e.target.value as AttrType })
                }
              >
                {MVP_ATTR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
              {policyLocked && !sourceOwned && (
                <p className={styles['detail__lock']}>
                  Locked — used by {attribute.usedByPolicies}{' '}
                  {attribute.usedByPolicies === 1 ? 'policy' : 'policies'}.
                  Changing the type could break them.
                </p>
              )}
            </div>
          </div>

          <div className={styles['detail__row']}>
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
