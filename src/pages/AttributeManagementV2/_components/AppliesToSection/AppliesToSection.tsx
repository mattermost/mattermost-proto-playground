import { useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import Section from '../Section/Section';
import ResourceConfigPanel from '../ResourceConfigPanel/ResourceConfigPanel';
import {
  type Attribute,
  type Resource,
  type ResourceBinding,
  ALL_RESOURCES,
} from '../../data';
import styles from './AppliesToSection.module.scss';

export interface AppliesToSectionProps {
  attribute: Attribute;
  /** Persist a per-resource config change. */
  onBindingChange?: (resource: Resource, next: Partial<ResourceBinding>) => void;
  /** Add a new resource binding. */
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

/**
 * Applies-to section.
 *   - N=1: single per-resource config panel inline (no sub-nav).
 *   - N≥2: left sub-nav of applied resources + active panel.
 * `+ Add resource` opens a picker of resources not yet applied.
 */
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

  // N=1 → inline panel, no sub-nav.
  if (bindings.length === 1) {
    const binding = bindings[0];
    return (
      <Section
        title="Applies to"
        description="Per-resource configuration."
        headerAction={<AddResourceMenu applied={applied} onAdd={handleAdd} />}
      >
        <div className={styles['inline']}>
          <div className={styles['inline__header']}>
            <span className={styles['inline__resource-name']}>
              {binding.resource}
            </span>
          </div>
          <ResourceConfigPanel
            attribute={attribute}
            binding={binding}
            onChange={(next) => onBindingChange?.(binding.resource, next)}
          />
        </div>
      </Section>
    );
  }

  // N≥2 → left sub-nav + active panel.
  const activeBinding =
    bindings.find((b) => b.resource === active) ?? bindings[0];

  return (
    <Section title="Applies to" description="Per-resource configuration.">
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
          <ResourceConfigPanel
            attribute={attribute}
            binding={activeBinding}
            onChange={(next) =>
              onBindingChange?.(activeBinding.resource, next)
            }
          />
        </div>
      </div>
    </Section>
  );
}
