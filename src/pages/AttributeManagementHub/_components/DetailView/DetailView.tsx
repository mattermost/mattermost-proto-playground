import { useState } from 'react';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import TextInput from '@/components/ui/TextInput/TextInput';
import TextArea from '@/components/ui/TextArea/TextArea';
import Select from '@/components/ui/Select/Select';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import SyncPill from '../SyncPill/SyncPill';
import ValuesEditor from '../ValuesEditor/ValuesEditor';
import AppliesToEditor from '../AppliesToEditor/AppliesToEditor';
import AddResourceMenu from '../AppliesToEditor/AddResourceMenu';
import AccessEditor from '../AccessEditor/AccessEditor';
import {
  eligibility,
  isPolicyLocked,
  isSourceOwned,
  capabilityGrantCount,
  type AccessModel,
  type AttrType,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
} from '../../hubData';
import styles from './DetailView.module.scss';

const ATTR_TYPES: AttrType[] = [
  'Select',
  'Multiselect',
  'Ranked',
  'Ranked-hierarchical',
  'Text',
];

export interface DetailViewProps {
  attribute: HubAttribute;
  onDefinitionChange: (
    next: Partial<Pick<HubAttribute, 'name' | 'type' | 'description'>>,
  ) => void;
  onAddValue: (label: string, asTier?: boolean) => void;
  onAddChild: (parentId: string, label: string) => void;
  onToggleValueDisabled: (valueId: string) => void;
  onDeleteValue: (valueId: string) => void;
  onReorderValue: (valueId: string, dir: -1 | 1) => void;
  onValuesLockedAttempt: () => void;
  onReuse: () => void;
  onUnlink: () => void;
  onImportMatrix: () => void;
  onBindingChange: (
    resource: ResourceKind,
    next: Partial<ResourceConfig>,
  ) => void;
  onAddResource: (resource: ResourceKind) => void;
  onRemoveResource: (resource: ResourceKind) => void;
  onAccessChange: (next: AccessModel) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
}

/** Sections that use progressive disclosure — collapsed by default to reduce clutter. */
type SecKey = 'applies' | 'access' | 'source';

export default function DetailView({
  attribute,
  onDefinitionChange,
  onAddValue,
  onAddChild,
  onToggleValueDisabled,
  onDeleteValue,
  onReorderValue,
  onValuesLockedAttempt,
  onReuse,
  onUnlink,
  onImportMatrix,
  onBindingChange,
  onAddResource,
  onRemoveResource,
  onAccessChange,
  onReadIntoFilteringChange,
}: DetailViewProps) {
  const elig = eligibility(attribute);
  const sourceOwned = isSourceOwned(attribute);
  const policyLocked = isPolicyLocked(attribute);
  const nameReadOnly = sourceOwned;
  const typeReadOnly =
    sourceOwned || !!attribute.valuesLink || policyLocked;
  const descriptionReadOnly = false;
  const [open, setOpen] = useState<Record<SecKey, boolean>>({
    applies: false,
    access: false,
    source: false,
  });
  const toggle = (k: SecKey) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const accessCount =
    capabilityGrantCount(attribute.access.editDefinition) +
    capabilityGrantCount(attribute.access.manageValues);

  return (
    <div className={styles['detail']}>
      {/* Definition — open, form fields + derived eligibility line */}
      <ConsolePanel title="Definition">
        <div className={styles['detail__def']}>
          <div className={styles['detail__def-row']}>
            <span className={styles['detail__def-key']}>Name</span>
            <div
              className={[
                styles['detail__def-field'],
                styles['detail__def-field--compact'],
              ].join(' ')}
            >
              <TextInput
                className={styles['detail__def-input--compact']}
                size="Medium"
                value={attribute.name}
                readOnly={nameReadOnly}
                aria-label="Attribute name"
                onChange={(e) =>
                  onDefinitionChange({ name: e.target.value })
                }
              />
            </div>
          </div>
          <div className={styles['detail__def-row']}>
            <span className={styles['detail__def-key']}>Type</span>
            <div
              className={[
                styles['detail__def-field'],
                styles['detail__def-field--compact'],
              ].join(' ')}
            >
              <Select
                className={styles['detail__def-input--compact']}
                size="Medium"
                value={attribute.type}
                disabled={typeReadOnly}
                aria-label="Attribute type"
                onChange={(e) =>
                  onDefinitionChange({
                    type: e.target.value as AttrType,
                  })
                }
              >
                {ATTR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
              {policyLocked && !sourceOwned && !attribute.valuesLink && (
                <p className={styles['detail__def-lock']}>
                  Locked — used by {attribute.usedByPolicies}{' '}
                  {attribute.usedByPolicies === 1 ? 'policy' : 'policies'}.
                  Changing the type could break them.
                </p>
              )}
            </div>
          </div>
          <div className={styles['detail__def-row']}>
            <span className={styles['detail__def-key']}>Description</span>
            <div className={styles['detail__def-field']}>
              <TextArea
                className={styles['detail__def-input']}
                size="Medium"
                value={attribute.description}
                readOnly={descriptionReadOnly}
                aria-label="Attribute description"
                onChange={(e) =>
                  onDefinitionChange({ description: e.target.value })
                }
              />
            </div>
          </div>
          <div className={styles['detail__def-row']}>
            <span className={styles['detail__def-key']}>Eligibility</span>
            <div className={styles['detail__def-val']}>
              <span
                className={[
                  styles['detail__elig-badge'],
                  elig.eligible
                    ? styles['detail__elig-badge--yes']
                    : styles['detail__elig-badge--no'],
                ].join(' ')}
              >
                <Icon
                  size="16"
                  glyph={
                    elig.eligible ? (
                      <CheckCircleOutlineIcon />
                    ) : (
                      <AlertCircleOutlineIcon />
                    )
                  }
                />
                {elig.eligible
                  ? 'Usable in access policies'
                  : 'Not eligible for access policies'}
              </span>
              <span className={styles['detail__elig-why']}>{elig.why}</span>
            </div>
          </div>
        </div>
      </ConsolePanel>

      {/* Values — open, the primary editing surface */}
      <ConsolePanel title="Values">
        <ValuesEditor
          attribute={attribute}
          onAddValue={onAddValue}
          onAddChild={onAddChild}
          onToggleDisabled={onToggleValueDisabled}
          onDeleteValue={onDeleteValue}
          onReorder={onReorderValue}
          onLockedAttempt={onValuesLockedAttempt}
          onReuse={onReuse}
          onUnlink={onUnlink}
          onImportMatrix={onImportMatrix}
        />
      </ConsolePanel>

      {/* Applies to — collapsed by default */}
      <ConsolePanel
        title="Applies to"
        subtitle="Per-resource configuration and allowed values."
        expandable
        expanded={open.applies}
        onExpandToggle={() => toggle('applies')}
        trailing={
          <AddResourceMenu
            applied={attribute.appliesTo.map((b) => b.resource)}
            onAdd={onAddResource}
          />
        }
      >
        <AppliesToEditor
          attribute={attribute}
          onChange={onBindingChange}
          onRemoveResource={onRemoveResource}
          onReadIntoFilteringChange={onReadIntoFilteringChange}
        />
      </ConsolePanel>

      {/* Access — collapsed by default */}
      <ConsolePanel
        title="Access"
        subtitle={`${accessCount} role and user grants`}
        expandable
        expanded={open.access}
        onExpandToggle={() => toggle('access')}
      >
        <AccessEditor
          access={attribute.access}
          onChange={onAccessChange}
          sourceOwned={sourceOwned}
        />
      </ConsolePanel>

      {/* Source — synced only, collapsed by default */}
      {sourceOwned && (
        <ConsolePanel
          title="Source"
          subtitle={attribute.source.system}
          expandable
          expanded={open.source}
          onExpandToggle={() => toggle('source')}
        >
          <div className={styles['detail__source']}>
            <div className={styles['detail__source-row']}>
              {attribute.source.state && (
                <SyncPill
                  state={attribute.source.state}
                  system={attribute.source.system}
                  size="Medium"
                />
              )}
              {attribute.source.cadence && (
                <Chip size="Small">{attribute.source.cadence}</Chip>
              )}
              {attribute.source.pastBudget && (
                <LabelTag
                  label="Past freshness budget"
                  type="Danger"
                  size="Small"
                />
              )}
            </div>
            <p className={styles['detail__source-status']}>
              {attribute.source.status}
            </p>
            {attribute.source.fieldMap && (
              <code className={styles['detail__source-map']}>
                {attribute.source.fieldMap}
              </code>
            )}
          </div>
        </ConsolePanel>
      )}
    </div>
  );
}
