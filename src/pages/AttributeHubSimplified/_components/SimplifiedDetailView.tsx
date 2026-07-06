import Select from '@/components/ui/Select/Select';
import TextInput from '@/components/ui/TextInput/TextInput';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import {
  isPolicyLocked,
  isSourceOwned,
  type AccessGrant,
  type AttrType,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
} from '@/pages/AttributeManagementHub/hubData';
import DefinitionValues from './DefinitionValues';
import AppliesToSection from './AppliesToSection';
import WhoCanEdit from './WhoCanEdit';
import AttributeSourceField from './AttributeSourceField';
import AddResourceMenu from '@/pages/AttributeManagementHub/_components/AppliesToEditor/AddResourceMenu';
import styles from './SimplifiedDetailView.module.scss';

const ATTR_TYPES: AttrType[] = [
  'Select',
  'Multiselect',
  'Ranked',
  'Ranked-hierarchical',
  'Text',
];

export interface SimplifiedDetailViewProps {
  attribute: HubAttribute;
  /** Blank/guided create mode. */
  creating?: boolean;
  onDefinitionChange: (next: Partial<Pick<HubAttribute, 'name' | 'type'>>) => void;
  onAddValue: (label: string, asTier?: boolean) => void;
  onAddChild: (parentId: string, label: string) => void;
  onToggleValueDisabled: (valueId: string) => void;
  onDeleteValue: (valueId: string) => void;
  onReorderValue: (valueId: string, dir: -1 | 1) => void;
  onValuesLockedAttempt: () => void;
  onReuse: () => void;
  onUnlink: () => void;
  onBindingChange: (resource: ResourceKind, next: Partial<ResourceConfig>) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  onAddResource: (resource: ResourceKind) => void;
  onRemoveResource: (resource: ResourceKind) => void;
  editors: { roles: AccessGrant[]; users: AccessGrant[] };
  onEditorsChange: (next: { roles: AccessGrant[]; users: AccessGrant[] }) => void;
  onConnectSource: () => void;
  onManageSource: () => void;
  /** Refs the Name field for create-mode auto-focus. */
  nameRef?: (el: HTMLInputElement | null) => void;
}

export default function SimplifiedDetailView({
  attribute,
  creating = false,
  onDefinitionChange,
  onAddValue,
  onAddChild,
  onToggleValueDisabled,
  onDeleteValue,
  onReorderValue,
  onValuesLockedAttempt,
  onReuse,
  onUnlink,
  onBindingChange,
  onReadIntoFilteringChange,
  onAddResource,
  onRemoveResource,
  editors,
  onEditorsChange,
  onConnectSource,
  onManageSource,
  nameRef,
}: SimplifiedDetailViewProps) {
  const sourceOwned = isSourceOwned(attribute);
  const policyLocked = isPolicyLocked(attribute);
  const nameReadOnly = sourceOwned;
  const typeReadOnly = sourceOwned || !!attribute.valuesLink || policyLocked;

  return (
    <div className={styles['detail']}>
      {/* Merged Definition = Name · Type · adaptive Values (+ synced status). */}
      <ConsolePanel
        title="Definition"
        subtitle="Name, type, value source, allowed values, and editors."
      >
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
                disabled={typeReadOnly}
                aria-label="Attribute type"
                onChange={(e) =>
                  onDefinitionChange({ type: e.target.value as AttrType })
                }
              >
                {ATTR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
              {policyLocked && !sourceOwned && !attribute.valuesLink && (
                <p className={styles['detail__lock']}>
                  Locked — used by {attribute.usedByPolicies}{' '}
                  {attribute.usedByPolicies === 1 ? 'policy' : 'policies'}.
                  Changing the type could break them.
                </p>
              )}
            </div>
          </div>

          <div className={[styles['detail__row'], styles['detail__row--chip-align']].join(' ')}>
            <span className={styles['detail__key']}>Value source</span>
            <div className={styles['detail__field']}>
              <AttributeSourceField
                attribute={attribute}
                onConnect={onConnectSource}
                onManage={onManageSource}
              />
            </div>
          </div>

          <div className={styles['detail__row']}>
            <span className={styles['detail__key']}>Values</span>
            <div className={styles['detail__field']}>
              <DefinitionValues
                attribute={attribute}
                onAddValue={onAddValue}
                onAddChild={onAddChild}
                onToggleDisabled={onToggleValueDisabled}
                onDeleteValue={onDeleteValue}
                onReorder={onReorderValue}
                onLockedAttempt={onValuesLockedAttempt}
                onReuse={onReuse}
                onUnlink={onUnlink}
              />
            </div>
          </div>

          <div className={styles['detail__row']}>
            <span className={styles['detail__key']}>Who can edit</span>
            <div className={styles['detail__field']}>
              <WhoCanEdit
                attribute={attribute}
                editors={editors}
                onChange={onEditorsChange}
              />
            </div>
          </div>
        </div>
      </ConsolePanel>

      {/* Applies to — first-class, both layouts. */}
      <ConsolePanel
        title="Applies to"
        subtitle="Where this attribute can be set, and who can set it."
        trailing={
          <AddResourceMenu
            applied={attribute.appliesTo.map((c) => c.resource)}
            onAdd={onAddResource}
            align="end"
          />
        }
      >
        <AppliesToSection
          attribute={attribute}
          onBindingChange={onBindingChange}
          onReadIntoFilteringChange={onReadIntoFilteringChange}
          onAddResource={onAddResource}
          onRemoveResource={onRemoveResource}
        />
      </ConsolePanel>
    </div>
  );
}
