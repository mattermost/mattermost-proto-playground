import { useEffect, useRef, useState } from 'react';
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
  isTreeType,
  markHierarchical,
  stripTiers,
  type SimplifiedAttrType,
  type ValueLinkConfig,
} from './simplifiedModel';
import { channelScopedResourceLabels } from './appliesToModel';
import styles from './SimplifiedDetailView.module.scss';

function displayNameToUniqueName(displayName: string): string {
  return displayName.trim().replace(/\s+/g, '_');
}

function effectiveDisplayName(attribute: HubAttribute): string {
  return attribute.displayName?.trim() || attribute.name.trim();
}

export interface SimplifiedDetailViewProps {
  attribute: HubAttribute;
  attributes: HubAttribute[];
  valueLink: ValueLinkConfig | null;
  /** Blank/guided create mode. */
  creating?: boolean;
  onDefinitionChange: (
    next: Partial<Pick<HubAttribute, 'name' | 'displayName' | 'type' | 'values'>>,
  ) => void;
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
  /** Refs the display name field for create-mode auto-focus. */
  displayNameRef?: (el: HTMLInputElement | null) => void;
  /** Collapsed applies-to row summary display. */
  appliesToRowSummary?: AppliesToRowSummaryVariant;
  /** Channel-attributes alignment (walkthrough 2026-08-06). */
  channelAlignment?: boolean;
  /**
   * Channel Settings scope — Applies-to uses This channel / Posts of this channel.
   * Global hub keeps Channels / Posts (all channels / all posts).
   */
  channelScope?: boolean;
  /** Move the "Changing the value" rule onto each Applies-to binding. */
  perResourceEditability?: boolean;
  /**
   * Open Classification Markings — presets and colors are edited there; the
   * Definition panel stays locked and only previews them.
   */
  onOpenMarkings?: (attributeId: string) => void;
}

/**
 * Classification keeps its own markings page in this variation — the hub shows
 * a locked preview and defers presets/colors there (Abhijit, 00:12:21).
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
  displayNameRef,
  appliesToRowSummary = 'chips',
  channelAlignment = false,
  channelScope = false,
  perResourceEditability = false,
  onOpenMarkings,
}: SimplifiedDetailViewProps) {
  const [nameEditing, setNameEditing] = useState(false);
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
  const uniqueNameInputRef = useRef<HTMLInputElement | null>(null);
  const sourceOwned = isSourceOwned(attribute);
  const policyLocked = isPolicyLocked(attribute);
  const classificationLocked =
    channelAlignment && usesClassificationSetupPage(attribute);
  const nameReadOnly = sourceOwned || classificationLocked;
  const typeReadOnly =
    sourceOwned ||
    policyLocked ||
    valueLink?.mode === 'exact' ||
    classificationLocked;
  const currentType = displayType(attribute);

  useEffect(() => {
    setNameEditing(false);
    setNameManuallyEdited(false);
  }, [attribute.id, creating]);

  useEffect(() => {
    if (nameEditing) {
      uniqueNameInputRef.current?.focus();
    }
  }, [nameEditing]);

  const uniqueNamePreview =
    attribute.name.trim() ||
    (creating ? displayNameToUniqueName(attribute.displayName ?? '') : '');

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
        subtitle={
          channelAlignment
            ? 'Display name, type, and options.'
            : 'Display name, type, options, and editors.'
        }
      >
        <div className={styles['detail__def']}>
          <div className={[styles['detail__row'], styles['detail__row--name']].join(' ')}>
            <span className={styles['detail__key']}>Display name</span>
            <div className={[styles['detail__field'], styles['detail__field--name']].join(' ')}>
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
                >
                  <span className={styles['detail__unique-label']}>Unique name:</span>
                  <TextInput
                    ref={uniqueNameInputRef}
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
                <div className={styles['detail__unique-row']}>
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
              {policyLocked && !classificationLocked && !sourceOwned && (
                <p className={styles['detail__lock']}>
                  Locked — used by {attribute.usedByPolicies}{' '}
                  {attribute.usedByPolicies === 1 ? 'policy' : 'policies'}.
                  Changing the type could break them.
                </p>
              )}
            </div>
          </div>

          {currentType !== 'Text' && (
            <div
              className={[
                styles['detail__row'],
                isTreeType(currentType)
                  ? styles['detail__row--tree-align']
                  : styles['detail__row--chip-align'],
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles['detail__key']}>Options</span>
              <div className={styles['detail__field']}>
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
                  forceReadOnly={classificationLocked}
                  hideSourceActions={classificationLocked}
                />
                {classificationLocked && (
                  <div className={styles['detail__markings-footer']}>
                    <p className={styles['detail__external']}>
                      Presets and marking colors are configured on Classification
                      Markings.
                      <Button
                        emphasis="Tertiary"
                        size="Small"
                        trailingIcon={
                          <Icon size="12" glyph={<OpenInNewIcon />} />
                        }
                        onClick={() => onOpenMarkings?.(attribute.id)}
                      >
                        Open
                      </Button>
                    </p>
                  </div>
                )}
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
            resourceLabels={
              channelScope ? channelScopedResourceLabels() : undefined
            }
            allowedResources={
              channelScope
                ? (['Channels', 'Posts'] as ResourceKind[])
                : channelAlignment
                  ? (['Users', 'Channels', 'Posts'] as ResourceKind[])
                  : undefined
            }
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
          channelScope={channelScope}
          perResourceEditability={perResourceEditability}
        />
      </ConsolePanel>
    </div>
  );
}
