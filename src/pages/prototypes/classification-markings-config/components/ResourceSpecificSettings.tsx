import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@mattermost/compass-icons/components/close';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import {
  Button,
  Checkbox,
  Icon,
  IconButton,
  MenuItem,
  PopoverMenu,
  Radio,
} from '@mattermost/compass-ui';
import {
  APPLY_RESOURCE_ORDER,
  DISPLAY_OPTIONS_BY_RESOURCE,
  type DisplayLocation,
  type EnforceResourceKind,
  type ResourceSpecificConfig,
} from '../classificationMarkingsData';
import styles from './ResourceSpecificSettings.module.scss';

export type ResourceSpecificSettingsProps = {
  resources: EnforceResourceKind[];
  /** Applied resources that cannot be removed (e.g. currently enforced). */
  lockedResources?: EnforceResourceKind[];
  settings: Record<EnforceResourceKind, ResourceSpecificConfig>;
  onChange: (
    resource: EnforceResourceKind,
    next: Partial<ResourceSpecificConfig>,
  ) => void;
  onAdd: (resource: EnforceResourceKind) => void;
  onRemove: (resource: EnforceResourceKind) => void;
};

type MenuPlacement = 'above' | 'below';

type MenuCoords = {
  top: number;
  left: number;
  placement: MenuPlacement;
};

export default function ResourceSpecificSettings({
  resources,
  lockedResources = [],
  settings,
  onChange,
  onAdd,
  onRemove,
}: ResourceSpecificSettingsProps) {
  const radioNs = useId().replace(/\W/g, '');
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<MenuCoords | null>(null);
  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const availableToAdd = APPLY_RESOURCE_ORDER.filter(
    (resource) => !resources.includes(resource),
  );

  const orderedResources = APPLY_RESOURCE_ORDER.filter((resource) =>
    resources.includes(resource),
  );

  useLayoutEffect(() => {
    if (!menuOpen) {
      setMenuCoords(null);
      return;
    }

    const updatePosition = () => {
      const trigger = triggerWrapRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;

      const triggerRect = trigger.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const gap = 4;
      const spaceBelow = window.innerHeight - triggerRect.bottom - gap;
      const placeAbove =
        spaceBelow < menuRect.height &&
        triggerRect.top > menuRect.height + gap;

      setMenuCoords({
        top: placeAbove
          ? triggerRect.top - menuRect.height - gap
          : triggerRect.bottom + gap,
        left: triggerRect.left,
        placement: placeAbove ? 'above' : 'below',
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [menuOpen, availableToAdd.length]);

  useLayoutEffect(() => {
    if (!menuOpen) return undefined;
    const handle = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerWrapRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  return (
    <div className={styles['resource-settings']}>
      {orderedResources.length === 0 ? (
        <p className={styles['resource-settings__empty']}>
          No resources yet. Add a resource to apply classification markings.
        </p>
      ) : (
        orderedResources.map((resource) => {
          const config = settings[resource];
          const displayOptions = DISPLAY_OPTIONS_BY_RESOURCE[resource];
          const locked = lockedResources.includes(resource);

          const toggleDisplay = (
            location: DisplayLocation,
            checked: boolean,
          ) => {
            const next = checked
              ? [...config.display, location]
              : config.display.filter((item) => item !== location);
            onChange(resource, { display: next });
          };

          return (
            <div key={resource} className={styles['resource-settings__card']}>
              <div className={styles['resource-settings__card-header']}>
                <div className={styles['resource-settings__card-heading']}>
                  <h3 className={styles['resource-settings__card-title']}>
                    {resource}
                  </h3>
                  {locked ? (
                    <span className={styles['resource-settings__locked-hint']}>
                      Required for enforcement
                    </span>
                  ) : null}
                </div>
                {!locked ? (
                  <IconButton
                    type="button"
                    style="Default"
                    size="Small"
                    aria-label={`Remove ${resource}`}
                    onClick={() => onRemove(resource)}
                    icon={<Icon size="16" glyph={<CloseIcon />} />}
                  />
                ) : null}
              </div>
              <div className={styles['resource-settings__card-body']}>
                <div className={styles['resource-settings__settings']}>
                  <div className={styles['resource-settings__setting']}>
                    <div className={styles['resource-settings__label']}>
                      Required
                    </div>
                    <div className={styles['resource-settings__fields']}>
                      <div className={styles['resource-settings__radio-row']}>
                        <Radio
                          name={`${radioNs}-${resource}-required`}
                          value="true"
                          checked={config.required}
                          size="Medium"
                          onChange={() =>
                            onChange(resource, { required: true })
                          }
                        >
                          True
                        </Radio>
                        <Radio
                          name={`${radioNs}-${resource}-required`}
                          value="false"
                          checked={!config.required}
                          size="Medium"
                          onChange={() =>
                            onChange(resource, { required: false })
                          }
                        >
                          False
                        </Radio>
                      </div>
                      <p className={styles['resource-settings__help']}>
                        When true, a classification value must be set on this
                        resource.
                      </p>
                    </div>
                  </div>

                  <div className={styles['resource-settings__setting']}>
                    <div className={styles['resource-settings__label']}>
                      Display
                    </div>
                    <div className={styles['resource-settings__fields']}>
                      <div className={styles['resource-settings__checks']}>
                        {displayOptions.map((location) => (
                          <Checkbox
                            key={location}
                            size="Medium"
                            checked={config.display.includes(location)}
                            onChange={(e) =>
                              toggleDisplay(location, e.target.checked)
                            }
                          >
                            {location}
                          </Checkbox>
                        ))}
                      </div>
                      <p className={styles['resource-settings__help']}>
                        Choose where classification markings appear for{' '}
                        {resource.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {availableToAdd.length > 0 ? (
        <div className={styles['resource-settings__add']} ref={triggerWrapRef}>
          <Button
            type="button"
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Add resource
          </Button>
          {menuOpen
            ? createPortal(
                <div
                  ref={menuRef}
                  className={[
                    styles['resource-settings__menu'],
                    menuCoords?.placement === 'above'
                      ? styles['resource-settings__menu--above']
                      : styles['resource-settings__menu--below'],
                  ].join(' ')}
                  style={
                    menuCoords
                      ? {
                          top: menuCoords.top,
                          left: menuCoords.left,
                          visibility: 'visible',
                        }
                      : { top: 0, left: 0, visibility: 'hidden' }
                  }
                >
                  <PopoverMenu aria-label="Add resource">
                    {availableToAdd.map((resource) => (
                      <MenuItem
                        key={resource}
                        label={resource}
                        leadingElement={false}
                        onClick={() => {
                          onAdd(resource);
                          setMenuOpen(false);
                        }}
                      />
                    ))}
                  </PopoverMenu>
                </div>,
                document.body,
              )
            : null}
        </div>
      ) : null}
    </div>
  );
}
