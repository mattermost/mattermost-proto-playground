import { useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import type { HubAttribute, ResourceKind } from '@/pages/AttributeManagementHub/hubData';
import MvpInheritancePanel from './MvpInheritancePanel';
import {
  inheritanceParentLabel,
  nameOnResourceLabel,
  type InheritanceState,
} from './mvpTerms';
import styles from './MvpResourceAdvanced.module.scss';

export interface MvpResourceAdvancedProps {
  attribute: HubAttribute;
  resource: ResourceKind;
  attributeName: string;
  nameOnResource: string;
  onNameOnResourceChange: (value: string) => void;
  nameDisabled?: boolean;
  inheritanceVisible: boolean;
  inheritance: InheritanceState;
  onInheritanceChange: (next: InheritanceState) => void;
}

/**
 * Collapsed-by-default advanced controls: inheritance ceiling (when eligible)
 * and per-resource naming. Opens automatically when either is already configured.
 */
export default function MvpResourceAdvanced({
  attribute,
  resource,
  attributeName,
  nameOnResource,
  onNameOnResourceChange,
  nameDisabled = false,
  inheritanceVisible,
  inheritance,
  onInheritanceChange,
}: MvpResourceAdvancedProps) {
  const [open, setOpen] = useState(
    nameOnResource.trim().length > 0 ||
      (inheritanceVisible && inheritance.on),
  );
  const nameLabel = nameOnResourceLabel(resource);
  const parentLabel = inheritanceParentLabel(resource);

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
        {!open && inheritanceVisible && inheritance.on && parentLabel && (
          <span className={styles['advanced__preview']}>
            · inherit from {parentLabel}
          </span>
        )}
        {!open && nameOnResource.trim() && (
          <span className={styles['advanced__preview']}>
            · shown as “{nameOnResource}”
          </span>
        )}
      </button>

      {open && (
        <div className={styles['advanced__body']}>
          {inheritanceVisible && (
            <MvpInheritancePanel
              attribute={attribute}
              resource={resource}
              state={inheritance}
              onChange={onInheritanceChange}
            />
          )}

          <div className={styles['advanced__name']}>
            <span className={styles['advanced__label']}>{nameLabel}</span>
            <div className={styles['advanced__field']}>
              <TextInput
                className={styles['advanced__input']}
                size="Medium"
                value={nameOnResource}
                disabled={nameDisabled}
                placeholder={attributeName || 'Attribute name'}
                aria-label={nameLabel}
                onChange={(e) => onNameOnResourceChange(e.target.value)}
              />
              <p className={styles['advanced__hint']}>
                Show a different label for this attribute on{' '}
                {resource.toLowerCase()} (e.g. “Clearance” on users for a
                “Classification” attribute). Leave blank to use the attribute name.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
