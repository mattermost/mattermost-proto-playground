import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import Select from '@/components/ui/Select/Select';
import TextInput from '@/components/ui/TextInput/TextInput';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
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
import AppliesToSection, {
  type AppliesToRowSummaryVariant,
} from './AppliesToSection';
import WhoCanEdit from './WhoCanEdit';
import ValueEditabilityField from './ValueEditabilityField';
import { getEditability, setEditability } from './editabilityModel';
import AddResourceMenu from '@/pages/AttributeManagementHub/_components/AppliesToEditor/AddResourceMenu';
import {
  SIMPLIFIED_ATTR_TYPES,
  assignSequentialTiers,
  comparesRank,
  displayType,
  isExactMirror,
  markHierarchical,
  stripTiers,
  type SimplifiedAttrType,
  type ValueLinkConfig,
} from './simplifiedModel';
import styles from './SimplifiedDetailView.module.scss';

export interface SimplifiedDetailViewProps {
  attribute: HubAttribute;
  attributes: HubAttribute[];
  valueLink: ValueLinkConfig | null;
  /** Blank/guided create mode. */
  creating?: boolean;
  onDefinitionChange: (next: Partial<Pick<HubAttribute, 'name' | 'type' | 'values'>>) => void;
  onAddValue: (label: string, asTier?: boolean) => void;
  onAddChild: (parentId: string, label: string) => void;
  onToggleValueDisabled: (valueId: string) => void;
  onDeleteValue: (valueId: string) => void;
  onReorderValue: (valueId: string, dir: -1 | 1) => void;
  onRelabelValue: (valueId: string, label: string) => void;
  onSetValueRank: (valueId: string, tier: number) => void;
  onValuesLockedAttempt: () => void;
  onBindingChange: (resource: ResourceKind, next: Partial<ResourceConfig>) => void;
  onAddResourceValue: (resource: ResourceKind, label: string) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  onAddResource: (resource: ResourceKind) => void;
  onRemoveResource: (resource: ResourceKind) => void;
  editors: { roles: AccessGrant[]; users: AccessGrant[] };
  onEditorsChange: (next: { roles: AccessGrant[]; users: AccessGrant[] }) => void;
  onConnectSource: () => void;
  onManageSource: () => void;
  onLinkValues: () => void;
  onEditLink: () => void;
  onUnlinkValues: () => void;
  /** Refs the Name field for create-mode auto-focus. */
  nameRef?: (el: HTMLInputElement | null) => void;
  /** Collapsed applies-to row summary display. */
  appliesToRowSummary?: AppliesToRowSummaryVariant;
  /** Channel-attributes alignment (walkthrough 2026-08-06). */
  channelAlignment?: boolean;
  /** Move the "Changing the value" rule onto each Applies-to binding. */
  perResourceEditability?: boolean;
}

/**
 * Classification keeps its own setup page in this variation — the hub defers to
 * it rather than duplicating the presets and colors (Abhijit, 00:12:21).
 */
function usesClassificationSetupPage(attribute: HubAttribute): boolean {
  return attribute.id === 'classification';
}

export default function SimplifiedDetailView({
  attribute,
  attributes,
  valueLink,
  creating = false,
  onDefinitionChange,
  onAddValue,
  onAddChild,
  onToggleValueDisabled,
  onDeleteValue,
  onReorderValue,
  onRelabelValue,
  onSetValueRank,
  onValuesLockedAttempt,
  onBindingChange,
  onAddResourceValue,
  onReadIntoFilteringChange,
  onAddResource,
  onRemoveResource,
  editors,
  onEditorsChange,
  onConnectSource,
  onManageSource,
  onLinkValues,
  onEditLink,
  onUnlinkValues,
  nameRef,
  appliesToRowSummary = 'chips',
  channelAlignment = false,
  perResourceEditability = false,
}: SimplifiedDetailViewProps) {
  const sourceOwned = isSourceOwned(attribute);
  const policyLocked = isPolicyLocked(attribute);
  const nameReadOnly = sourceOwned;
  const typeReadOnly =
    sourceOwned || policyLocked || isExactMirror(attribute, valueLink);
  const currentType = displayType(attribute);

  const handleTypeChange = (next: SimplifiedAttrType) => {
    const wasRanked = comparesRank(currentType);
    const willRanked = comparesRank(next);
    const updates: Partial<HubAttribute> = {};

    if (next === 'Hierarchical') {
      markHierarchical(attribute.id, true);
      updates.type = 'Ranked-hierarchical' as AttrType;
    } else {
      markHierarchical(attribute.id, false);
      updates.type = next as AttrType;
    }

    if (willRanked && !wasRanked) {
      updates.values = assignSequentialTiers(attribute.values);
    } else if (!willRanked && wasRanked) {
      updates.values = stripTiers(attribute.values);
    }

    onDefinitionChange(updates);
  };

  return (
    <div className={styles['detail']}>
      {/* Merged Definition = Name · Type · adaptive Values (+ synced status). */}
      <ConsolePanel
        title="Definition"
        subtitle={channelAlignment ? 'Name, type, and options.' : 'Name, type, options, and editors.'}
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
                value={currentType}
                readOnly={typeReadOnly}
                aria-label="Attribute type"
                onChange={(e) =>
                  handleTypeChange(e.target.value as SimplifiedAttrType)
                }
              >
                {SIMPLIFIED_ATTR_TYPES.map((t) => (
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

          {currentType !== 'Text' && (
            <div className={styles['detail__row']}>
              <span className={styles['detail__key']}>Options</span>
              <div className={styles['detail__field']}>
                {channelAlignment && usesClassificationSetupPage(attribute) && (
                  <p className={styles['detail__external']}>
                    Presets and marking colors are configured on Classification
                    Markings.
                    <Button
                      emphasis="Tertiary"
                      size="Small"
                      trailingIcon={
                        <Icon size="12" glyph={<OpenInNewIcon />} />
                      }
                      onClick={() => undefined}
                    >
                      Open
                    </Button>
                  </p>
                )}
                <DefinitionValues
                  attribute={attribute}
                  attributes={attributes}
                  valueLink={valueLink}
                  onAddValue={onAddValue}
                  onAddChild={onAddChild}
                  onToggleDisabled={onToggleValueDisabled}
                  onDeleteValue={onDeleteValue}
                  onReorder={onReorderValue}
                  onRelabel={onRelabelValue}
                  onSetRank={onSetValueRank}
                  onLockedAttempt={onValuesLockedAttempt}
                  onConnectSource={onConnectSource}
                  onManageSource={onManageSource}
                  onLinkValues={onLinkValues}
                  onEditLink={onEditLink}
                  onUnlinkValues={onUnlinkValues}
                />
              </div>
            </div>
          )}

          {channelAlignment && !perResourceEditability && (
            <div className={styles['detail__row']}>
              <span className={styles['detail__key']}>
                Changing the value
              </span>
              <div className={styles['detail__field']}>
                <ValueEditabilityField
                  attribute={attribute}
                  value={getEditability(attribute)}
                  onChange={(next) => {
                    setEditability(attribute.id, next);
                    onDefinitionChange({});
                  }}
                />
              </div>
            </div>
          )}

          {!channelAlignment && (
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
          )}
        </div>
      </ConsolePanel>

      {/* Applies to — first-class, both layouts. */}
      <ConsolePanel
        title="Applies to"
        subtitle="Resources this attribute applies to, and who can set the value on each."
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
          onAddResourceValue={onAddResourceValue}
          onReadIntoFilteringChange={onReadIntoFilteringChange}
          onAddResource={onAddResource}
          onRemoveResource={onRemoveResource}
          rowSummaryVariant={appliesToRowSummary}
          channelAlignment={channelAlignment}
          perResourceEditability={perResourceEditability}
        />
      </ConsolePanel>
    </div>
  );
}
