import { useCallback, useEffect, useRef, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { resourceIcon } from '@/pages/AttributeManagementHub/resourceIcons';
import {
  isSourceOwned,
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
} from '@/pages/AttributeManagementHub/hubData';
import { readWalkthroughFocus } from '@/components/walkthrough/walkthroughFocus';
import MvpAddResourceMenu from './MvpAddResourceMenu';
import MvpResourceEditorBody from './MvpResourceEditorBody';
import { summaryLine } from './mvpModel';
import styles from './MvpAppliesToSection.module.scss';

/**
 * Walkthrough deep links land on a specific sub-control (e.g. `channels-required`)
 * inside a resource's collapsed card. Map each such focus id to the resource it
 * lives on so the matching card auto-expands instead of requiring a manual click.
 */
const RESOURCE_FOR_FOCUS_ID: Record<string, ResourceKind> = {
  'applies-users': 'Users',
  'applies-channels': 'Channels',
  'applies-posts': 'Posts',
  'users-profile-display': 'Users',
  'users-value-visibility': 'Users',
  'users-who-can-set': 'Users',
  'self-edit-warning-dialog': 'Users',
  'channels-required': 'Channels',
  'channels-default-value': 'Channels',
  'channels-display-location': 'Channels',
  'channels-who-can-set': 'Channels',
  'channels-remove-resource': 'Channels',
  'posts-required': 'Posts',
  'posts-default-value': 'Posts',
  'posts-display-location': 'Posts',
  'posts-who-can-set': 'Posts',
  'posts-remove-resource': 'Posts',
};

export interface MvpAppliesToSectionProps {
  attribute: HubAttribute;
  onBindingChange: (resource: ResourceKind, next: Partial<ResourceConfig>) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  onAddResource: (resource: ResourceKind) => void;
  onRemoveResource: (resource: ResourceKind) => void;
  /** OPEN — reveal allowed-value subsets (?allowed=on). */
  allowedOn: boolean;
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
}: MvpAppliesToSectionProps) {
  const applied = attribute.appliesTo;
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const focus = readWalkthroughFocus();
    const resource = focus != null ? RESOURCE_FOR_FOCUS_ID[focus] : undefined;
    if (resource && applied.some((c) => c.resource === resource)) {
      return { [resource]: true };
    }
    return {};
  });
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
        <div className={styles['applies__empty']} data-tour-focus="applies-empty">
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
              const removeDisabled =
                isSourceOwned(attribute) && cfg.resource === 'Users';
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
                  data-tour-focus={`applies-${cfg.resource.toLowerCase()}`}
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
                      data-tour-focus={`${cfg.resource.toLowerCase()}-remove-resource`}
                      emphasis="Quaternary"
                      size="Small"
                      destructive
                      disabled={removeDisabled}
                      tabIndex={isOpen && !removeDisabled ? 0 : -1}
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
