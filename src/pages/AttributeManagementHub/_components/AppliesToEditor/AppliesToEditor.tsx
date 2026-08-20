import { useEffect, useRef, useState } from 'react';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import ResourceConfigPanel from './ResourceConfigPanel';
import ResourceValuesPanel from './ResourceValuesPanel';
import {
  type HubAttribute,
  type ResourceConfig,
  type ResourceKind,
} from '../../hubData';
import styles from './AppliesToEditor.module.scss';

export interface AppliesToEditorProps {
  attribute: HubAttribute;
  onChange: (resource: ResourceKind, next: Partial<ResourceConfig>) => void;
  onRemoveResource: (resource: ResourceKind) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
}

function BindingPanel({
  attribute,
  config,
  onChange,
  onRemoveResource,
  onReadIntoFilteringChange,
}: {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (resource: ResourceKind, next: Partial<ResourceConfig>) => void;
  onRemoveResource: (resource: ResourceKind) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
}) {
  return (
    <>
      <ResourceConfigPanel
        attribute={attribute}
        config={config}
        onChange={(next) => onChange(config.resource, next)}
        onReadIntoFilteringChange={onReadIntoFilteringChange}
        suppressWhoCanSet
      />
      <ResourceValuesPanel
        attribute={attribute}
        config={config}
        onChange={(next) => onChange(config.resource, next)}
      />
      <div className={styles['remove']}>
        <Button
          emphasis="Tertiary"
          size="Small"
          destructive
          leadingIcon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
          onClick={() => onRemoveResource(config.resource)}
        >
          Stop applying to {config.resource}
        </Button>
      </div>
    </>
  );
}

export default function AppliesToEditor({
  attribute,
  onChange,
  onRemoveResource,
  onReadIntoFilteringChange,
}: AppliesToEditorProps) {
  const bindings = attribute.appliesTo;
  const [active, setActive] = useState<ResourceKind | undefined>(
    bindings[0]?.resource,
  );
  const prevApplied = useRef<ResourceKind[]>([]);

  useEffect(() => {
    const current = bindings.map((b) => b.resource);
    const added = current.find((r) => !prevApplied.current.includes(r));
    if (added) {
      setActive(added);
    } else {
      setActive((prev) => {
        if (prev != null && current.includes(prev)) return prev;
        return current[0];
      });
    }
    prevApplied.current = current;
  }, [bindings]);

  if (bindings.length === 0) {
    return (
      <p className={styles['empty__msg']}>
        Not applied to any resource yet. Use Add resource above to get started.
      </p>
    );
  }

  if (bindings.length === 1) {
    const config = bindings[0];
    return (
      <BindingPanel
        attribute={attribute}
        config={config}
        onChange={onChange}
        onRemoveResource={onRemoveResource}
        onReadIntoFilteringChange={onReadIntoFilteringChange}
      />
    );
  }

  const activeConfig =
    bindings.find((b) => b.resource === active) ?? bindings[0];

  return (
    <div className={styles['split']}>
      <nav className={styles['split__nav']} aria-label="Applied resources">
        {bindings.map((binding) => {
          const isActive = binding.resource === activeConfig.resource;
          return (
            <button
              key={binding.resource}
              type="button"
              className={[
                styles['split__nav-item'],
                isActive ? styles['split__nav-item--active'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setActive(binding.resource)}
            >
              {binding.resource}
            </button>
          );
        })}
      </nav>
      <div className={styles['split__panel']}>
        <BindingPanel
          attribute={attribute}
          config={activeConfig}
          onChange={onChange}
          onRemoveResource={onRemoveResource}
          onReadIntoFilteringChange={onReadIntoFilteringChange}
        />
      </div>
    </div>
  );
}
