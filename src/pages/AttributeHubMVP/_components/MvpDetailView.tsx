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
import type { InheritanceState } from './mvpTerms';
import styles from './MvpDetailView.module.scss';

/** P0 types only — Ranked-Hierarchical is cut. */
const MVP_ATTR_TYPES: AttrType[] = ['Select', 'Multiselect', 'Ranked', 'Text'];

export interface MvpDetailViewProps {
  attribute: HubAttribute;
  creating?: boolean;
  onDefinitionChange: (next: Partial<Pick<HubAttribute, 'name' | 'type'>>) => void;
  onAddValue: (label: string) => void;
  onDeleteValue: (valueId: string) => void;
  onToggleValueDisabled: (valueId: string) => void;
  onBindingChange: (resource: ResourceKind, next: Partial<ResourceConfig>) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  onAddResource: (resource: ResourceKind) => void;
  onRemoveResource: (resource: ResourceKind) => void;
  /** OPEN — reveal allowed-value subsets (?allowed=on). */
  allowedOn: boolean;
  /** Connect an external source (LDAP / SAML) — demo record. */
  onConnectSource: (system: SourceSystem) => void;
  /** Source just connected in this session, if any. */
  connectedSource?: SourceSystem;
  /** Per-resource inheritance state accessor + setter. */
  inheritanceFor: (cfg: ResourceConfig) => InheritanceState;
  onInheritanceChange: (resource: ResourceKind, next: InheritanceState) => void;
  /** Per-resource "Name on {resource}" accessor + setter. */
  nameOnResourceFor: (resource: ResourceKind) => string;
  onNameOnResourceChange: (resource: ResourceKind, value: string) => void;
  nameRef?: (el: HTMLInputElement | null) => void;
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
  connectedSource,
  inheritanceFor,
  onInheritanceChange,
  nameOnResourceFor,
  onNameOnResourceChange,
  nameRef,
}: MvpDetailViewProps) {
  const sourceOwned = isSourceOwned(attribute);
  const policyLocked = isPolicyLocked(attribute);
  const nameReadOnly = sourceOwned;
  const typeReadOnly = sourceOwned || policyLocked;

  return (
    <div className={styles['detail']}>
      <ConsolePanel title="Definition" subtitle="Name, type, and options.">
        <div className={styles['detail__def']}>
          <div className={styles['detail__row']}>
            <span className={styles['detail__key']}>Name</span>
            <div className={styles['detail__field']}>
              <TextInput
                ref={nameRef}
                className={styles['detail__input']}
                size="Medium"
                value={attribute.name}
                readOnly={nameReadOnly}
                placeholder={creating ? 'Name this attribute' : undefined}
                aria-label="Attribute name"
                onChange={(e) => onDefinitionChange({ name: e.target.value })}
              />
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
              {connectedSource && !sourceOwned && (
                <p className={styles['detail__connected']}>
                  Connected to {connectedSource}. Options and values will sync from
                  the source.
                </p>
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
          inheritanceFor={inheritanceFor}
          onInheritanceChange={onInheritanceChange}
          nameOnResourceFor={nameOnResourceFor}
          onNameOnResourceChange={onNameOnResourceChange}
        />
      </ConsolePanel>
    </div>
  );
}
