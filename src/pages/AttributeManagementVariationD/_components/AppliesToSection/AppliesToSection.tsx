import { useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import Section from '../../../AttributeManagementV2/_components/Section/Section';
import ResourceConfigPanel from '../../../AttributeManagementV2/_components/ResourceConfigPanel/ResourceConfigPanel';
import ResourceValuesPanel from '../ResourceValuesPanel/ResourceValuesPanel';
import {
  ALL_RESOURCES,
  type Resource,
} from '../../../AttributeManagementV2/data';
import {
  type AttributeD,
  type ResourceBindingD,
} from '../../dData';
import styles from './AppliesToSection.module.scss';

export interface AppliesToSectionProps {
  attribute: AttributeD;
  onBindingChange?: (
    resource: Resource,
    next: Partial<ResourceBindingD>,
  ) => void;
  onAddResource?: (resource: Resource) => void;
}

function AddResourceMenu({
  applied,
  onAdd,
}: {
  applied: Resource[];
  onAdd: (r: Resource) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  const available = ALL_RESOURCES.filter((r) => !applied.includes(r));

  return (
    <div className={styles['add']} ref={ref}>
      <Button
        emphasis="Tertiary"
        size="Small"
        leadingIcon={<Icon glyph={<PlusIcon />} size="16" />}
        onClick={() => setOpen((o) => !o)}
        disabled={available.length === 0}
      >
        Add resource
      </Button>
      {open && available.length > 0 && (
        <div className={styles['add__menu']}>
          <PopoverMenu>
            {available.map((r) => (
              <MenuItem
                key={r}
                label={r}
                leadingElement={false}
                onClick={() => {
                  setOpen(false);
                  onAdd(r);
                }}
              />
            ))}
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}

function BindingPanel({
  attribute,
  binding,
  onBindingChange,
}: {
  attribute: AttributeD;
  binding: ResourceBindingD;
  onBindingChange?: (
    resource: Resource,
    next: Partial<ResourceBindingD>,
  ) => void;
}) {
  return (
    <>
      <ResourceConfigPanel
        attribute={attribute}
        binding={binding}
        onChange={(next) => onBindingChange?.(binding.resource, next)}
      />
      <ResourceValuesPanel
        attribute={attribute}
        binding={binding}
        onChange={(next) => onBindingChange?.(binding.resource, next)}
      />
    </>
  );
}

export default function AppliesToSection({
  attribute,
  onBindingChange,
  onAddResource,
}: AppliesToSectionProps) {
  const bindings = attribute.appliesTo;
  const applied = bindings.map((b) => b.resource);
  const [active, setActive] = useState<Resource | undefined>(
    bindings[0]?.resource,
  );

  const handleAdd = (r: Resource) => {
    onAddResource?.(r);
    setActive(r);
  };

  if (bindings.length === 0) {
    return (
      <Section
        title="Applies to"
        headerAction={<AddResourceMenu applied={applied} onAdd={handleAdd} />}
      >
        <div className={styles['empty']}>
          <p className={styles['empty__msg']}>
            Not applied to any resource yet.
          </p>
        </div>
      </Section>
    );
  }

  if (bindings.length === 1) {
    const binding = bindings[0];
    return (
      <Section
        title="Applies to"
        description="Per-resource configuration and allowed values."
        headerAction={<AddResourceMenu applied={applied} onAdd={handleAdd} />}
      >
        <div className={styles['inline']}>
          <div className={styles['inline__header']}>
            <span className={styles['inline__resource-name']}>
              {binding.resource}
            </span>
          </div>
          <BindingPanel
            attribute={attribute}
            binding={binding}
            onBindingChange={onBindingChange}
          />
        </div>
      </Section>
    );
  }

  const activeBinding =
    bindings.find((b) => b.resource === active) ?? bindings[0];

  return (
    <Section
      title="Applies to"
      description="Per-resource configuration and allowed values."
    >
      <div className={styles['split']}>
        <nav className={styles['split__nav']} aria-label="Applied resources">
          {bindings.map((b) => {
            const isActive = b.resource === activeBinding.resource;
            return (
              <button
                key={b.resource}
                type="button"
                className={`${styles['split__nav-item']} ${isActive ? styles['split__nav-item--active'] : ''}`}
                onClick={() => setActive(b.resource)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={styles['split__nav-name']}>{b.resource}</span>
              </button>
            );
          })}
          <div className={styles['split__nav-foot']}>
            <AddResourceMenu applied={applied} onAdd={handleAdd} />
          </div>
        </nav>
        <div className={styles['split__panel']}>
          <BindingPanel
            attribute={attribute}
            binding={activeBinding}
            onBindingChange={onBindingChange}
          />
        </div>
      </div>
    </Section>
  );
}
