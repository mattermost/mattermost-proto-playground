import { useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Icon from '@/components/ui/Icon/Icon';
import {
  hasInheritanceParent,
  listValuesForOverlay,
  takesValueList,
  visibleValues,
  type HubAttribute,
  type ResourceConfig,
} from '@/pages/AttributeManagementHub/hubData';
import InheritanceControl from './InheritanceControl';
import ResourceNameField from './ResourceNameField';
import SimplifiedResourceValuesPanel from './SimplifiedResourceValuesPanel';
import {
  readStoredCeiling,
  resolveCeiling,
  resourceName,
  type CeilingMode,
} from './simplifiedModel';
import { inheritanceParentLabel } from '@/pages/AttributeHubMVP/_components/mvpTerms';
import styles from './SimplifiedResourceAdvanced.module.scss';

export interface SimplifiedResourceAdvancedProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
  onAddResourceValue: (label: string) => void;
}

function inheritanceOn(attributeId: string, config: ResourceConfig): boolean {
  const stored = readStoredCeiling(attributeId, config.resource);
  const mode: CeilingMode = stored ?? resolveCeiling(config);
  return mode !== 'off';
}

function allowedOptionsCustomized(attribute: HubAttribute, config: ResourceConfig): boolean {
  if (!takesValueList(attribute) || attribute.values.length === 0) {
    return false;
  }
  const disabledIds = config.disabledValueIds ?? [];
  return disabledIds.length > 0;
}

/**
 * Collapsed-by-default advanced controls: inheritance ceiling (when eligible),
 * per-resource naming, and allowed-option subsets.
 */
export default function SimplifiedResourceAdvanced({
  attribute,
  config,
  onChange,
  onAddResourceValue,
}: SimplifiedResourceAdvancedProps) {
  const { resource } = config;
  const showInheritFromTeam =
    resource === 'Channels' && hasInheritanceParent(attribute, 'Channels');
  const showInheritFromChannel =
    resource === 'Posts' && hasInheritanceParent(attribute, 'Posts');
  const inheritanceVisible = showInheritFromTeam || showInheritFromChannel;
  const inheritOn = inheritanceVisible && inheritanceOn(attribute.id, config);
  const customName = resourceName(attribute.id, resource).trim();
  const optionsCustomized = allowedOptionsCustomized(attribute, config);
  const showAllowedOptions =
    takesValueList(attribute) && attribute.values.length > 0;

  const parentLabel = inheritanceParentLabel(resource);

  const [open, setOpen] = useState(
    customName.length > 0 || inheritOn || optionsCustomized,
  );

  const disabledCount = (config.disabledValueIds ?? []).length;
  const valueCount = visibleValues(attribute, listValuesForOverlay(attribute)).length;

  return (
    <div className={styles['advanced']}>
      <button
        type="button"
        className={styles['advanced__toggle']}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon
          size="12"
          glyph={open ? <ChevronDownIcon /> : <ChevronRightIcon />}
        />
        Advanced
        {!open && inheritOn && parentLabel && (
          <span className={styles['advanced__preview']}>
            · inherit from {parentLabel}
          </span>
        )}
        {!open && customName && (
          <span className={styles['advanced__preview']}>
            · shown as “{customName}”
          </span>
        )}
        {!open && optionsCustomized && (
          <span className={styles['advanced__preview']}>
            · {valueCount - disabledCount} of {valueCount} options allowed
          </span>
        )}
      </button>

      {open && (
        <div className={styles['advanced__body']}>
          {showInheritFromTeam && (
            <InheritanceControl
              attribute={attribute}
              config={config}
              onChange={onChange}
            />
          )}

          {showInheritFromChannel && (
            <InheritanceControl
              attribute={attribute}
              config={config}
              onChange={onChange}
            />
          )}

          <ResourceNameField
            attribute={attribute}
            resource={resource}
            variant="inline"
          />

          {showAllowedOptions && (
            <SimplifiedResourceValuesPanel
              attribute={attribute}
              config={config}
              onChange={onChange}
              onAddResourceValue={onAddResourceValue}
              embedded
            />
          )}
        </div>
      )}
    </div>
  );
}
