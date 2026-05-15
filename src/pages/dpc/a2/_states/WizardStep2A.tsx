/**
 * A2 — Wizard Step 2A: Open-to-team confirmation (§3.2.4.3) — KD-5 FAIL.
 *
 * **This is the load-bearing honesty surface.** Per Phase 4 §5.2 and
 * Phase 5 §3.2.4.3, this step is deliberately rendered with minimal content
 * for the no-ABAC majority case. The admin already answered the only
 * meaningful question in Step 1; everything visible here is restatement.
 *
 * A clearly-styled meta-commentary annotation is rendered alongside the
 * production copy so reviewers parse the empty step as the wizard's
 * structural cost rather than as a design oversight. The wizard cannot
 * collapse this step without losing the structural-atomicity story that
 * justifies the wizard at all — that tension is what the annotation
 * surfaces.
 */
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import type { A2StoreApi } from '@/pages/dpc/a2/useA2Store';
import styles from './WizardStep2A.module.scss';

export interface WizardStep2AProps {
  store: A2StoreApi;
}

export default function WizardStep2A({ store }: WizardStep2AProps) {
  return (
    <div className={styles['wizard-step-2a']} role="presentation">
      <div className={styles['wizard-step-2a__backdrop']} aria-hidden />
      <Modal
        size="Medium"
        title="Enable Discoverable"
        subtitle="Step 2 of 2"
        showBackButton
        onBack={() => store.backFromStep2A()}
        onClose={() => store.abandonWizard('close-x')}
        footer={
          <>
            <Button
              emphasis="Tertiary"
              onClick={() => store.abandonWizard('cancel')}
            >
              Cancel
            </Button>
            <Button emphasis="Primary" onClick={() => store.saveStep2A()}>
              Enable Discoverable
            </Button>
          </>
        }
      >
        <div className={styles['wizard-step-2a__body']}>
          <h3 className={styles['wizard-step-2a__heading']}>
            Confirm: Anyone in this team can find and request to join
          </h3>
          <p className={styles['wizard-step-2a__copy']}>
            When you save, #{store.targetChannel.displayName} will be visible
            to all members of the team in Browse Channels. Each request to
            join will appear in your Pending Requests queue for approval.
          </p>

          {/* ──────────────────────────────────────────────────────────── *
           * KD-5 FAIL — review-only meta annotation.                      *
           * Visibly distinct from production copy: dashed border, mono    *
           * type, Review-note label. Per user directive: this step is     *
           * shown honestly with empty content; the annotation explains    *
           * why it must remain empty for reviewers.                       *
           * ──────────────────────────────────────────────────────────── */}
          <aside
            className={styles['wizard-step-2a__annotation']}
            aria-label="Review note"
          >
            <header className={styles['wizard-step-2a__annotation-head']}>
              <span className={styles['wizard-step-2a__annotation-tag']}>
                Review note
              </span>
              <span className={styles['wizard-step-2a__annotation-ref']}>
                KD-5 FAIL · for review purposes only
              </span>
            </header>
            <p className={styles['wizard-step-2a__annotation-body']}>
              This step asks no new question. The wizard added a forced step
              that has no meaningful content for the no-ABAC majority case.
              The admin already chose &ldquo;open-to-team&rdquo; in Step 1;
              everything above is restating that choice.
            </p>
            <p className={styles['wizard-step-2a__annotation-body']}>
              The wizard cannot collapse this step without losing the
              structural-atomicity story that justifies the wizard mechanism
              at all. That tension is the KD-5 cost surfaced in Phase 4
              §5.2 / Phase 5 §3.2.4.3 and is shown here unsmoothed.
            </p>
          </aside>
        </div>
      </Modal>
    </div>
  );
}
