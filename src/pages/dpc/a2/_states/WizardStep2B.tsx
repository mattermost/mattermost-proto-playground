/**
 * A2 — Membership Policy tab (Access Rules) — Figma node 4118:33458.
 *
 * Visual chrome ported from the canonical Mattermost Figma: persistent
 * warning notice → "Access Rules" heading → bordered table (Attribute /
 * Operator / Values + trash) → "+ Select attribute" tertiary button → helper
 * row with "Test rules" → divider → auto-add checkbox → divider → floating
 * footer with "Save access rules & enable".
 *
 * Behaviour preserved from the A2 store: SAVE_STEP2B is an atomic commit that
 * persists rules and turns Discoverable ON in the same transaction
 * (§3.2.4.4). The footer Cancel cancels the wizard from the banner-cancel
 * path (CANCEL_DISCOVERABLE_FROM_BANNER) when the wizard is active.
 */
import { useEffect, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import Button from '@/components/ui/Button/Button';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import TextInput from '@/components/ui/TextInput/TextInput';
import type { A2StoreApi, AbacRule } from '@/pages/dpc/a2/useA2Store';
import styles from './WizardStep2B.module.scss';

export interface WizardStep2BProps {
  store: A2StoreApi;
}

export default function WizardStep2B({ store }: WizardStep2BProps) {
  const inWizard = store.wizardStep === 'step2b';

  // Mirror the rules from the store; allow local edits so the table can
  // grow/shrink before save dispatches.
  const rulesFromStore = inWizard
    ? store.step2bAccessRules
    : store.committedRules.length > 0
      ? store.committedRules
      : [{ attribute: '', operator: 'equals', value: '' } as AbacRule];

  const [autoAdd, setAutoAdd] = useState(false);
  const [rules, setRules] = useState<AbacRule[]>(rulesFromStore);

  useEffect(() => {
    setRules(rulesFromStore);
    // intentionally only resync when wizard state flips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inWizard]);

  const updateRule = (index: number, patch: Partial<AbacRule>) => {
    const next = rules.map((r, i) => (i === index ? { ...r, ...patch } : r));
    setRules(next);
    store.editRulesStep2B(next);
  };

  const removeRule = (index: number) => {
    const next = rules.filter((_, i) => i !== index);
    const fallback =
      next.length > 0
        ? next
        : [{ attribute: '', operator: 'equals', value: '' } as AbacRule];
    setRules(fallback);
    store.editRulesStep2B(fallback);
  };

  const addRule = () => {
    const next: AbacRule[] = [
      ...rules,
      { attribute: '', operator: 'equals', value: '' },
    ];
    setRules(next);
    store.editRulesStep2B(next);
  };

  const hasValidRule = rules.some((r) => r.attribute.trim() && r.value.trim());
  const isDirty = store.step2bRulesDirty;

  const handleSave = () => {
    if (!inWizard) return;
    store.saveStep2B();
  };

  const handleCancel = () => {
    if (inWizard) {
      store.cancelDiscoverableFromBanner();
    } else {
      setRules(rulesFromStore);
    }
  };

  return (
    <div className={styles['wizard-step-2b']}>
      <SectionNotice
        type="Warning"
        title="Discoverable will activate when you save your access rules."
        description="The channel is not yet visible to non-members."
      />

      <header className={styles['wizard-step-2b__heading-block']}>
        <h3 className={styles['wizard-step-2b__heading']}>Access Rules</h3>
        <p className={styles['wizard-step-2b__subtitle']}>
          Select user attributes and values as rules to restrict channel
          membership.
        </p>
      </header>

      <div className={styles['wizard-step-2b__table']}>
        <div className={styles['wizard-step-2b__table-head']}>
          <span>Attribute/Policy</span>
          <span>Operator</span>
          <span>Values</span>
          <span className={styles['wizard-step-2b__table-head-action']} />
        </div>
        {rules.map((rule, i) => (
          <div key={`rule-${i}`} className={styles['wizard-step-2b__table-row']}>
            <div className={styles['wizard-step-2b__cell-attribute']}>
              <Icon
                size="16"
                glyph={<DotsHorizontalIcon />}
                className={styles['wizard-step-2b__menu-icon']}
              />
              <TextInput
                size="Small"
                placeholder="Attribute"
                value={rule.attribute}
                onChange={(e) =>
                  updateRule(i, { attribute: e.target.value })
                }
              />
            </div>
            <TextInput
              size="Small"
              value={rule.operator === 'equals' ? 'is' : rule.operator}
              readOnly
            />
            <TextInput
              size="Small"
              placeholder="Values"
              value={rule.value}
              onChange={(e) => updateRule(i, { value: e.target.value })}
            />
            <IconButton
              size="Small"
              destructive
              aria-label={`Remove rule ${i + 1}`}
              icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
              onClick={() => removeRule(i)}
            />
          </div>
        ))}
        <div className={styles['wizard-step-2b__add-row']}>
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
            onClick={addRule}
          >
            Select attribute
          </Button>
        </div>
      </div>

      <div className={styles['wizard-step-2b__helper-row']}>
        <p className={styles['wizard-step-2b__helper-text']}>
          Each row is a single condition that must be met for a user to comply
          with the policy. All rules are combined with logical AND operator
          (&amp;&amp;).
        </p>
        <Button
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<ShieldOutlineIcon />} />}
        >
          Test rules
        </Button>
      </div>

      <div className={styles['wizard-step-2b__divider']} aria-hidden />

      <div className={styles['wizard-step-2b__auto-add']}>
        <Checkbox
          checked={autoAdd}
          onChange={(e) =>
            setAutoAdd((e.target as HTMLInputElement).checked)
          }
        >
          Auto-add members based on access rules
        </Checkbox>
        <p className={styles['wizard-step-2b__auto-add-help']}>
          Users who match the configured attribute values will be automatically
          added as members.
        </p>
      </div>

      <div className={styles['wizard-step-2b__divider']} aria-hidden />

      {inWizard && (
        <div
          className={styles['wizard-step-2b__floating-footer']}
          role="region"
          aria-label="Save access rules"
        >
          <div className={styles['wizard-step-2b__floating-footer-left']}>
            <Icon size="16" glyph={<InformationOutlineIcon />} />
            <span className={styles['wizard-step-2b__floating-footer-text']}>
              {hasValidRule
                ? 'There are unsaved changes'
                : 'Add at least one access rule to enable Discoverable'}
            </span>
          </div>
          <div className={styles['wizard-step-2b__floating-footer-actions']}>
            <Button emphasis="Tertiary" size="Small" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              emphasis="Primary"
              size="Small"
              onClick={handleSave}
              disabled={!isDirty || !hasValidRule}
            >
              Save access rules &amp; enable
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
