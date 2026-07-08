import { useCallback, useEffect, useRef, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { resourceIcon } from '@/pages/AttributeManagementHub/resourceIcons';
import type {
  HubAttribute,
  ResourceConfig,
  ResourceKind,
} from '@/pages/AttributeManagementHub/hubData';
import MvpAddResourceMenu from './MvpAddResourceMenu';
import MvpResourceEditorBody from './MvpResourceEditorBody';
import { summaryLine } from './mvpModel';
import type { InheritanceState } from './mvpTerms';
import styles from './MvpAppliesToSection.module.scss';

export interface MvpAppliesToSectionProps {
  attribute: HubAttribute;
  onBindingChange: (resource: ResourceKind, next: Partial<ResourceConfig>) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  onAddResource: (resource: ResourceKind) => void;
  onRemoveResource: (resource: ResourceKind) => void;
  /** OPEN — reveal allowed-value subsets (?allowed=on). */
  allowedOn: boolean;
  inheritanceFor: (cfg: ResourceConfig) => InheritanceState;
  onInheritanceChange: (resource: ResourceKind, next: InheritanceState) => void;
  nameOnResourceFor: (resource: ResourceKind) => string;
  onNameOnResourceChange: (resource: ResourceKind, value: string) => void;
}

/**
 * MVP "Applies to" — a single layout: defaults-collapsed cards, one per enabled
 * resource, expanding in place to the §3 config. No cards/rows toggle, no
 * inheritance. Add-resource offers Users / Channels / Posts only.
 */
export default function MvpAppliesToSection({
  attribute,
  onBindingChange,
  onReadIntoFilteringChange,
  onAddResource,
  onRemoveResource,
  allowedOn,
  inheritanceFor,
  onInheritanceChange,
  nameOnResourceFor,
  onNameOnResourceChange,
}: MvpAppliesToSectionProps) {
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
    rowRefs.current[highlighted]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
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
            description="Add a resource to apply this attribute to users, channels, or posts."
          />
          <div
            className={[
              styles['applies__footer'],
              styles['applies__footer--center'],
            ].join(' ')}
          >
            <MvpAddResourceMenu
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
                      <span
                        className={[
                          styles['row__summary'],
                          styles['row__summary--inline'],
                        ].join(' ')}
                      >
                        <span className={styles['row__name']}>
                          {resourceIcon(cfg.resource)}
                          {cfg.resource}
                        </span>
                        <span
                          className={styles['row__meta']}
                          title={summaryLine(attribute, cfg)}
                        >
                          {summaryLine(attribute, cfg)}
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
                        <MvpResourceEditorBody
                          attribute={attribute}
                          config={cfg}
                          onChange={(next) => onBindingChange(cfg.resource, next)}
                          onReadIntoFilteringChange={onReadIntoFilteringChange}
                          allowedOn={allowedOn}
                          inheritance={inheritanceFor(cfg)}
                          onInheritanceChange={(next) =>
                            onInheritanceChange(cfg.resource, next)
                          }
                          nameOnResource={nameOnResourceFor(cfg.resource)}
                          onNameOnResourceChange={(value) =>
                            onNameOnResourceChange(cfg.resource, value)
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles['applies__footer']}>
            <MvpAddResourceMenu
              applied={appliedResources}
              onAdd={handleAddResource}
            />
          </div>
        </>
      )}
    </div>
  );
}
