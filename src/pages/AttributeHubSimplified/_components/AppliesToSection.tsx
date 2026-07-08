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
import { summaryChips, summaryLine } from './appliesToModel';
import styles from './AppliesToSection.module.scss';

export type AppliesToRowSummaryVariant = 'chips' | 'inline';

export interface AppliesToSectionProps {
  attribute: HubAttribute;
  onBindingChange: (resource: ResourceKind, next: Partial<ResourceConfig>) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  onAddResource: (resource: ResourceKind) => void;
  onRemoveResource: (resource: ResourceKind) => void;
  /** Collapsed row summary — chips (default) or single-line secondary text. */
  rowSummaryVariant?: AppliesToRowSummaryVariant;
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
  rowSummaryVariant = 'chips',
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
            title="No resources yet"
            description="Add a resource to apply this attribute to users, channels, posts, or teams."
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
                      className={[
                        styles['row__head'],
                        rowSummaryVariant === 'chips'
                          ? styles['row__head--chips']
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-expanded={isOpen}
                      onClick={() => toggle(cfg.resource)}
                    >
                    <Icon
                      size="16"
                      glyph={isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    />
                    <span
                      className={[
                        styles['row__summary'],
                        rowSummaryVariant === 'inline'
                          ? styles['row__summary--inline']
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className={styles['row__name']}>
                        {resourceIcon(cfg.resource)}
                        {cfg.resource}
                      </span>
                      {rowSummaryVariant === 'chips' ? (
                        <span className={styles['row__chips']}>
                          {summaryChips(attribute, cfg).map((chip) => (
                            <Chip key={chip} size="Small">
                              {chip}
                            </Chip>
                          ))}
                        </span>
                      ) : (
                        <span
                          className={styles['row__meta']}
                          title={summaryLine(attribute, cfg)}
                        >
                          {summaryLine(attribute, cfg)}
                        </span>
                      )}
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
                    Remove resource
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
