import { useId } from 'react';
import Switch from '@/components/ui/Switch/Switch';
import Radio from '@/components/ui/Radio/Radio';
import type {
  HubAttribute,
  ResourceKind,
} from '@/pages/AttributeManagementHub/hubData';
import {
  ceilingOptions,
  inheritanceEnforcement,
  inheritanceParentLabel,
  type CeilingMode,
  type InheritanceState,
} from './mvpTerms';
import styles from './MvpInheritancePanel.module.scss';

export interface MvpInheritancePanelProps {
  attribute: HubAttribute;
  resource: ResourceKind;
  state: InheritanceState;
  onChange: (next: InheritanceState) => void;
}

/**
 * Edge-scoped inheritance + ceiling control (build brief §Inheritance). Rendered
 * only by the caller when the child's parent resource is also applied
 * (Posts←Channels, Channels←Teams) — this component assumes that gate is met.
 *
 * - Inheritance on/off for any attribute type.
 * - When on, "Override rules" offers the ranked set (no constraint / below /
 *   above / locked) for ranked types and the reduced set (inherit-as-default /
 *   locked) for everything else.
 * - Post edges are advisory (warn), channel/other edges are enforced.
 */
export default function MvpInheritancePanel({
  attribute,
  resource,
  state,
  onChange,
}: MvpInheritancePanelProps) {
  const parent = inheritanceParentLabel(resource);
  const enforcement = inheritanceEnforcement(resource);
  const options = ceilingOptions(attribute.type);
  const groupName = useId();

  const setCeiling = (ceiling: CeilingMode) => onChange({ ...state, ceiling });

  return (
    <div className={styles['inherit']}>
      <div className={styles['inherit__row']}>
        <span className={styles['inherit__label']}>
          Inherit from {parent}
        </span>
        <div className={styles['inherit__control']}>
          <Switch
            size="Small"
            checked={state.on}
            aria-label={`Inherit from ${parent}`}
            onChange={(e) => onChange({ ...state, on: e.target.checked })}
          >
            {state.on ? 'On' : 'Off'}
          </Switch>
        </div>
      </div>

      {state.on && (
        <div className={styles['inherit__body']}>
          <span className={styles['inherit__ceiling-label']}>
            Override rules
          </span>
          <div
            className={styles['inherit__ceiling']}
            role="radiogroup"
            aria-label="Override rules"
          >
            {options.map((opt) => (
              <Radio
                key={opt.key}
                className={styles['inherit__radio']}
                name={groupName}
                value={opt.key}
                size="Medium"
                checked={state.ceiling === opt.key}
                onChange={() => setCeiling(opt.key)}
              >
                {opt.label}
              </Radio>
            ))}
          </div>
          <p className={styles['inherit__enforce']}>
            {enforcement === 'advisory'
              ? `On posts this is advisory — authors are warned when a post's value differs from its ${parent?.toLowerCase()}, but the post is not blocked.`
              : `On ${resource.toLowerCase()} this is enforced — a value that violates the rule cannot be saved.`}
          </p>
        </div>
      )}
    </div>
  );
}
