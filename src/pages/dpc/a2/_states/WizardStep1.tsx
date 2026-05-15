/**
 * A2 — Wizard Step 1: Choose access scope (§3.2.4.2).
 *
 * Modal with two radio options as full-width cards. Cancel discards;
 * Continue routes to Step 2A (open-to-team) or Step 2B (restrict-by-rules).
 *
 * Focus is intentionally not trapped on the primary CTA — per Phase 4 §7.3
 * the user navigates to it explicitly.
 */
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Radio from '@/components/ui/Radio/Radio';
import type { A2StoreApi, ScopeChoice } from '@/pages/dpc/a2/useA2Store';
import styles from './WizardStep1.module.scss';

export interface WizardStep1Props {
  store: A2StoreApi;
}

interface ScopeOption {
  value: ScopeChoice;
  title: string;
  description: string;
}

const OPTIONS: ScopeOption[] = [
  {
    value: 'open-to-team',
    title: 'Anyone in this team can find and request to join',
    description:
      'Users see the channel in Browse Channels. Each request needs your approval before they join.',
  },
  {
    value: 'restrict-by-rules',
    title: 'Restrict to users matching access rules',
    description:
      "Define attribute-based rules. Qualifying users can find and join directly. Others can't see it.",
  },
];

export default function WizardStep1({ store }: WizardStep1Props) {
  const canContinue = store.scopeChoice != null;

  return (
    <div className={styles['wizard-step-1']} role="presentation">
      <div className={styles['wizard-step-1__backdrop']} aria-hidden />
      <Modal
        size="Medium"
        title="Enable Discoverable"
        subtitle="Step 1 of 2"
        onClose={() => store.abandonWizard('close-x')}
        footer={
          <>
            <Button
              emphasis="Tertiary"
              onClick={() => store.abandonWizard('cancel')}
            >
              Cancel
            </Button>
            <Button
              emphasis="Primary"
              disabled={!canContinue}
              onClick={() => store.continueToStep2()}
            >
              Continue
            </Button>
          </>
        }
      >
        <div className={styles['wizard-step-1__body']}>
          <h3 className={styles['wizard-step-1__heading']}>
            Choose access scope for #{store.targetChannel.displayName}
          </h3>
          <p className={styles['wizard-step-1__lede']}>
            Discoverable lets non-members find this channel. Choose who can
            request access:
          </p>

          <fieldset
            className={styles['wizard-step-1__options']}
            aria-label="Access scope"
          >
            <legend className={styles['wizard-step-1__sr-only']}>
              Access scope
            </legend>
            {OPTIONS.map((opt) => {
              const checked = store.scopeChoice === opt.value;
              return (
                <label
                  key={opt.value}
                  className={[
                    styles['wizard-step-1__option'],
                    checked
                      ? styles['wizard-step-1__option--selected']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <Radio
                    name="a2-wizard-scope"
                    value={opt.value}
                    checked={checked}
                    onChange={() => store.selectScope(opt.value)}
                  />
                  <div className={styles['wizard-step-1__option-text']}>
                    <span className={styles['wizard-step-1__option-title']}>
                      {opt.title}
                    </span>
                    <span
                      className={styles['wizard-step-1__option-description']}
                    >
                      {opt.description}
                    </span>
                  </div>
                </label>
              );
            })}
          </fieldset>
        </div>
      </Modal>
    </div>
  );
}
