import { useState } from 'react';
import ResourceConfigPanel from '@/pages/AttributeManagementHub/_components/AppliesToEditor/ResourceConfigPanel';
import Select from '@/components/ui/Select/Select';
import SimplifiedWhoCanSetEditor from './SimplifiedWhoCanSetEditor';
import SimplifiedResourceAdvanced from './SimplifiedResourceAdvanced';
import {
  hasInheritanceParent,
  type HubAttribute,
  type ResourceConfig,
} from '@/pages/AttributeManagementHub/hubData';
import {
  editabilityOptionsFor,
  getResourceEditability,
  plainEditabilityLabel,
  plainPolicyCaveat,
  setResourceEditability,
  type ValueEditability,
} from './editabilityModel';
import {
  ceilingToBaseline,
  displayType,
  inheritanceModesFor,
  readStoredCeiling,
  resolveCeiling,
  storeCeiling,
  type CeilingMode,
} from './simplifiedModel';
import { inheritanceParentLabel } from '@/pages/AttributeHubMVP/_components/mvpTerms';
import styles from './ResourceEditorBody.module.scss';

export interface ResourceEditorBodyProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
  onAddResourceValue: (label: string) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  /** Channel-attributes alignment (walkthrough 2026-08-06). */
  channelAlignment?: boolean;
  /** Show the "Changing the value" rule on this binding instead of on the attribute. */
  perResourceEditability?: boolean;
}

/**
 * Per-resource editor for the Simplified applies-to layout.
 *
 * Design Crit 2026-08-10: the Advanced section is gone in the aligned
 * variations. Per-resource naming was cut outright, allowed-option subsets were
 * cut earlier, and inheritance was promoted to a primary field — which left the
 * accordion holding nothing.
 */
export default function ResourceEditorBody({
  attribute,
  config,
  onChange,
  onAddResourceValue,
  onReadIntoFilteringChange,
  channelAlignment = false,
  perResourceEditability = false,
}: ResourceEditorBodyProps) {
  const type = displayType(attribute);
  const parentLabel = inheritanceParentLabel(config.resource);
  const hasParent =
    parentLabel != null && hasInheritanceParent(attribute, config.resource);

  const [inheritance, setInheritanceState] = useState<CeilingMode>(
    () => readStoredCeiling(attribute.id, config.resource) ?? resolveCeiling(config),
  );
  const [editability, setEditabilityState] = useState<ValueEditability>(() =>
    getResourceEditability(attribute, config.resource),
  );

  // A value pinned to its parent has nothing left to decide about changing it.
  const lockedToParent = hasParent && inheritance === 'locked';

  const inheritanceSlot =
    channelAlignment && hasParent ? (
      <Select
        size="Medium"
        width="fit"
        value={inheritance}
        aria-label={`Inherit from ${parentLabel}`}
        onChange={(e) => {
          const next = e.target.value as CeilingMode;
          storeCeiling(attribute.id, config.resource, next);
          setInheritanceState(next);
          onChange(ceilingToBaseline(next));
        }}
      >
        {inheritanceModesFor(type, parentLabel).map((mode) => (
          <option key={mode.key} value={mode.key}>
            {mode.label}
          </option>
        ))}
      </Select>
    ) : undefined;

  const caveat = lockedToParent ? null : plainPolicyCaveat(attribute, editability);

  const editabilitySlot = perResourceEditability ? (
    <div className={styles['editability']}>
      <Select
        size="Medium"
        width="fit"
        value={lockedToParent ? 'locked' : editability}
        readOnly={lockedToParent}
        aria-label="Changing the value"
        onChange={(e) => {
          const next = e.target.value as ValueEditability;
          setResourceEditability(attribute.id, config.resource, next);
          setEditabilityState(next);
        }}
      >
        {lockedToParent ? (
          <option value="locked">
            Follows the {parentLabel?.toLowerCase()}&apos;s value
          </option>
        ) : (
          editabilityOptionsFor(type).map((option) => (
            <option key={option} value={option}>
              {plainEditabilityLabel(option, type)}
            </option>
          ))
        )}
      </Select>
      {lockedToParent && (
        <p className={styles['reflection']}>
          Locked to the {parentLabel?.toLowerCase()}&apos;s value, so there is
          nothing to change here.
        </p>
      )}
      {caveat && <p className={styles['caveat']}>{caveat}</p>}
    </div>
  ) : undefined;

  return (
    <div className={styles['body']}>
      <ResourceConfigPanel
        attribute={attribute}
        config={config}
        onChange={onChange}
        onReadIntoFilteringChange={onReadIntoFilteringChange}
        layout="simplified"
        channelAlignment={channelAlignment}
        requireDefaultWhenRequired={channelAlignment}
        inheritanceSlot={inheritanceSlot}
        valueEditabilitySlot={editabilitySlot}
        suppressInheritance
        whoCanSetSlot={
          <SimplifiedWhoCanSetEditor
            attribute={attribute}
            config={config}
            onChange={onChange}
          />
        }
      />

      {!channelAlignment && (
        <SimplifiedResourceAdvanced
          attribute={attribute}
          config={config}
          onChange={onChange}
          onAddResourceValue={onAddResourceValue}
        />
      )}
    </div>
  );
}
