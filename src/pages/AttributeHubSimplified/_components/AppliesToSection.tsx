import { useCallback, useEffect, useRef, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { resourceIcon } from '@/pages/AttributeManagementHub/resourceIcons';
import type { HubAttribute, ResourceConfig, ResourceKind } from '@/pages/AttributeManagementHub/hubData';
import AddResourceMenu from '@/pages/AttributeManagementHub/_components/AppliesToEditor/AddResourceMenu';
import ResourceEditorBody from './ResourceEditorBody';
import { summaryChips } from './appliesToModel';
import styles from './AppliesToSection.module.scss';

export interface AppliesToSectionProps {
  attribute: HubAttribute;
  onBindingChange: (resource: ResourceKind, next: Partial<ResourceConfig>) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  onAddResource: (resource: ResourceKind) => void;
  onRemoveResource: (resource: ResourceKind) => void;
}

/**
 * "Applies to" — resource rows with scan-friendly summary chips;
 * expand a row to edit configuration in place.
 */
export default function AppliesToSection({
  attribute,
  onBindingChange,
  onReadIntoFilteringChange,
  onAddResource,
  onRemoveResource,
}: AppliesToSectionProps) {
  const applied = attribute.appliesTo;
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [highlighted, setHighlighted] = useState<ResourceKind | null>(null);
  const rowRefs = useRef<Partial<Record<ResourceKind, HTMLDivElement>>>({});

  const toggle = (resource: ResourceKind) =>
    setExpanded((current) => ({ ...current, [resource]: !current[resource] }));

  const handleAddResource = useCallback(
    (resource: ResourceKind) => {
      onAddResource(resource);
      setExpanded({ [resource]: true });
      setHighlighted(resource);
    },
    [onAddResource],
  );

  useEffect(() => {
    if (!highlighted) {
      return undefined;
    }

    rowRefs.current[highlighted]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const timeout = window.setTimeout(() => setHighlighted(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [highlighted]);

  const appliedResources = applied.map((c) => c.resource);

  return (
    <div className={styles['applies']}>
      {applied.length === 0 ? (
        <div className={styles['applies__empty']}>
          <EmptyState
            title="Not applied anywhere yet"
            description="Choose the resources this attribute can be set on — users, channels, posts, or teams."
          />
          <div className={[styles['applies__footer'], styles['applies__footer--center']].join(' ')}>
            <AddResourceMenu
              applied={appliedResources}
              onAdd={handleAddResource}
              emphasis="Primary"
              size="Medium"
            />
          </div>
        </div>
      ) : (
        <>
          <div className={styles['rows']}>
            {applied.map((cfg) => {
              const isOpen = !!expanded[cfg.resource];
              const isHighlighted = highlighted === cfg.resource;
              return (
                <div
                  key={cfg.resource}
                  ref={(el) => {
                    if (el) {
                      rowRefs.current[cfg.resource] = el;
                    } else {
                      delete rowRefs.current[cfg.resource];
                    }
                  }}
                  className={[
                    styles['row'],
                    isOpen ? styles['row--open'] : '',
                    isHighlighted ? styles['row--highlight'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className={styles['row__head-bar']}>
                    <button
                      type="button"
                      className={styles['row__head']}
                      aria-expanded={isOpen}
                      onClick={() => toggle(cfg.resource)}
                    >
                    <Icon
                      size="16"
                      glyph={isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    />
                    <span className={styles['row__summary']}>
                      <span className={styles['row__name']}>
                        {resourceIcon(cfg.resource)}
                        {cfg.resource}
                      </span>
                      <span
                        className={[
                          styles['row__chips'],
                          isOpen ? styles['row__chips--hidden'] : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-hidden={isOpen}
                      >
                        {summaryChips(attribute, cfg).map((chip) => (
                          <Chip key={chip} size="Small">
                            {chip}
                          </Chip>
                        ))}
                      </span>
                    </span>
                  </button>
                  <Button
                    className={[
                      styles['row__remove'],
                      !isOpen ? styles['row__remove--hidden'] : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    emphasis="Quaternary"
                    size="Small"
                    destructive
                    tabIndex={isOpen ? 0 : -1}
                    aria-hidden={!isOpen}
                    onClick={() => onRemoveResource(cfg.resource)}
                  >
                    Stop applying
                  </Button>
                </div>
                <div
                  className={[
                    styles['row__body-wrap'],
                    isOpen ? styles['row__body-wrap--open'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className={styles['row__body']}>
                    {isOpen && (
                      <ResourceEditorBody
                        attribute={attribute}
                        config={cfg}
                        onChange={(next) => onBindingChange(cfg.resource, next)}
                        onReadIntoFilteringChange={onReadIntoFilteringChange}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          <div className={styles['applies__footer']}>
            <AddResourceMenu applied={appliedResources} onAdd={handleAddResource} />
          </div>
        </>
      )}
    </div>
  );
}
