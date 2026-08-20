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
import { summaryChips, summaryLine, resourceDisplayName, channelScopedResourceLabels } from './appliesToModel';
import styles from './AppliesToSection.module.scss';

export type AppliesToRowSummaryVariant = 'chips' | 'inline';

export interface AppliesToSectionProps {
  attribute: HubAttribute;
  onBindingChange: (resource: ResourceKind, next: Partial<ResourceConfig>) => void;
  onAddResourceValue: (resource: ResourceKind, label: string) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  onAddResource: (resource: ResourceKind) => void;
  onRemoveResource: (resource: ResourceKind) => void;
  /** Collapsed row summary — chips (default) or single-line secondary text. */
  rowSummaryVariant?: AppliesToRowSummaryVariant;
  /** Channel-attributes alignment (walkthrough 2026-08-06). */
  channelAlignment?: boolean;
  /**
   * Channel Settings scope — labels/copy refer to this channel and its posts.
   * Global hub keeps Channels / Posts (all channels / all posts).
   */
  channelScope?: boolean;
  /** Show the "Changing the value" rule on each binding instead of on the attribute. */
  perResourceEditability?: boolean;
}

/**
 * "Applies to" — resource rows with scan-friendly summary chips;
 * expand a row to edit configuration in place.
 */
export default function AppliesToSection({
  attribute,
  onBindingChange,
  onAddResourceValue,
  onReadIntoFilteringChange,
  onAddResource,
  onRemoveResource,
  rowSummaryVariant = 'chips',
  channelAlignment = false,
  channelScope = false,
  perResourceEditability = false,
}: AppliesToSectionProps) {
  const applied = attribute.appliesTo.filter(
    (binding) => binding.resource !== 'Teams',
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [highlighted, setHighlighted] = useState<ResourceKind | null>(null);
  const rowRefs = useRef<Partial<Record<ResourceKind, HTMLDivElement>>>({});

  // Required channel/post bindings open by default so Required + default
  // are visible without an extra click (e.g. Classification → Channels).
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const cfg of attribute.appliesTo) {
      if (
        cfg.required &&
        (cfg.resource === 'Channels' || cfg.resource === 'Posts')
      ) {
        next[cfg.resource] = true;
      }
    }
    setExpanded(next);
  }, [attribute.id]);

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
  const addMenuLabels = channelScope
    ? channelScopedResourceLabels()
    : undefined;
  const addMenuAllowed =
    channelAlignment || channelScope
      ? (['Channels', 'Posts'] as ResourceKind[])
      : undefined;

  return (
    <div className={styles['applies']}>
      {applied.length === 0 ? (
        <div className={styles['applies__empty']}>
          <EmptyState
            title="No resources yet"
            description={
              channelScope
                ? 'Add a resource to apply this attribute to this channel or posts within it.'
                : 'Add a resource to apply this attribute to users, channels, or posts.'
            }
          />
          <div className={[styles['applies__footer'], styles['applies__footer--center']].join(' ')}>
            <AddResourceMenu
              applied={appliedResources}
              onAdd={handleAddResource}
              emphasis="Primary"
              size="Medium"
              resourceLabels={addMenuLabels}
              allowedResources={addMenuAllowed}
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
                        {resourceDisplayName(cfg.resource, channelScope)}
                      </span>
                      {rowSummaryVariant === 'chips' ? (
                        <span className={styles['row__chips']}>
                          {summaryChips(attribute, cfg, channelAlignment).map((chip) => (
                            <Chip key={chip} size="Small">
                              {chip}
                            </Chip>
                          ))}
                        </span>
                      ) : (
                        <span
                          className={styles['row__meta']}
                          title={summaryLine(attribute, cfg, channelAlignment)}
                        >
                          {summaryLine(attribute, cfg, channelAlignment)}
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
                        onAddResourceValue={(label) =>
                          onAddResourceValue(cfg.resource, label)
                        }
                        onReadIntoFilteringChange={onReadIntoFilteringChange}
                        channelAlignment={channelAlignment}
                        channelScope={channelScope}
                        perResourceEditability={perResourceEditability}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          <div className={styles['applies__footer']}>
            <AddResourceMenu
              applied={appliedResources}
              onAdd={handleAddResource}
              resourceLabels={addMenuLabels}
              allowedResources={addMenuAllowed}
            />
          </div>
        </>
      )}
    </div>
  );
}
