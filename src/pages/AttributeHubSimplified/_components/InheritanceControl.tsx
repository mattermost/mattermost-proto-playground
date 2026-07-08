import { useId } from 'react';
import Switch from '@/components/ui/Switch/Switch';
import Radio from '@/components/ui/Radio/Radio';
import type { HubAttribute, ResourceConfig } from '@/pages/AttributeManagementHub/hubData';
import {
  inheritanceEnforcement,
  inheritanceParentLabel,
} from '@/pages/AttributeHubMVP/_components/mvpTerms';
import {
  ceilingModesFor,
  ceilingToBaseline,
  displayType,
  readStoredCeiling,
  resolveCeiling,
  storeCeiling,
  type CeilingMode,
} from './simplifiedModel';
import styles from './InheritanceControl.module.scss';

export interface InheritanceControlProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
}

/**
 * Edge-scoped inheritance + ceiling control — MVP-aligned layout and copy.
 * Rendered only when the child's parent resource is also applied.
 */
export default function InheritanceControl({
  attribute,
  config,
  onChange,
}: InheritanceControlProps) {
  const type = displayType(attribute);
  const stored = readStoredCeiling(attribute.id, config.resource);
  const mode: CeilingMode = stored ?? resolveCeiling(config);
  const on = mode !== 'off';
  const modes = ceilingModesFor(type);
  const parent = inheritanceParentLabel(config.resource);
  const enforcement = inheritanceEnforcement(config.resource);
  const groupName = useId();

  const setMode = (next: CeilingMode) => {
    storeCeiling(attribute.id, config.resource, next);
    onChange(ceilingToBaseline(next));
  };

  const toggle = (nextOn: boolean) => {
    if (!nextOn) {
      setMode('off');
    } else {
      setMode(modes[0].key);
    }
  };

  return (
    <div className={styles['inherit']}>
      <div className={styles['inherit__row']}>
        <span className={styles['inherit__label']}>
          Inherit from {parent}
        </span>
        <div className={styles['inherit__control']}>
          <Switch
            size="Small"
            checked={on}
            aria-label={`Inherit from ${parent}`}
            onChange={(e) => toggle(e.target.checked)}
          >
            {on ? 'On' : 'Off'}
          </Switch>
        </div>
      </div>

      {on && (
        <div className={styles['inherit__body']}>
          <span className={styles['inherit__ceiling-label']}>Override rules</span>
          <div
            className={styles['inherit__ceiling']}
            role="radiogroup"
            aria-label="Override rules"
          >
            {modes.map((opt) => (
              <Radio
                key={opt.key}
                className={styles['inherit__radio']}
                name={groupName}
                value={opt.key}
                size="Medium"
                checked={mode === opt.key}
                onChange={() => setMode(opt.key)}
              >
                {opt.label}
              </Radio>
            ))}
          </div>
          <p className={styles['inherit__enforce']}>
            {enforcement === 'advisory'
              ? `On posts this is advisory — authors are warned when a post's value differs from its ${parent?.toLowerCase()}, but the post is not blocked.`
              : `On ${config.resource.toLowerCase()} this is enforced — a value that violates the rule cannot be saved.`}
          </p>
        </div>
      )}
    </div>
  );
}
