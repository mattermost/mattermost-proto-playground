import { useState } from 'react';

import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import TextArea from '@/components/ui/TextArea/TextArea';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import PaginationDots from '@/components/ui/PaginationDots/PaginationDots';
import Spinner from '@/components/ui/Spinner/Spinner';

import { REPORT } from './fixtures';
import styles from './RemoveFlow.module.scss';

interface FlowProps {
  onClose: () => void;
  onComplete: () => void;
}

const CAPTURE_NOTE =
  "We'll snapshot delivery data now and prepare a downloadable report. It can take up to 30 minutes — we'll send it to you when it's ready, so you don't have to wait here.";

// ── Wizard variant ──────────────────────────────────────────────────────
export function RemoveWizard({ onClose, onComplete }: FlowProps) {
  const [step, setStep] = useState(1);
  const [capture, setCapture] = useState(true);
  const [comment, setComment] = useState('');

  const title =
    step === 1
      ? 'Remove message'
      : step === 2
        ? 'Capture who it reached'
        : 'Confirm removal';

  const footer =
    step === 1 ? (
      <>
        <Button emphasis="Tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button emphasis="Primary" onClick={() => setStep(2)}>
          Next
        </Button>
      </>
    ) : step === 2 ? (
      <>
        <Button emphasis="Tertiary" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button emphasis="Primary" onClick={() => setStep(3)}>
          Next
        </Button>
      </>
    ) : (
      <>
        <Button emphasis="Tertiary" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button emphasis="Primary" destructive onClick={onComplete}>
          Remove message
        </Button>
      </>
    );

  return (
    <Modal
      size="Small"
      title={title}
      showBackButton={step > 1}
      onBack={() => setStep(step - 1)}
      onClose={onClose}
      footer={footer}
    >
      <div className={styles['remove-flow']}>
        <PaginationDots
          className={styles['remove-flow__dots']}
          pages={3}
          activePage={step}
        />

        {step === 1 && (
          <>
            <SectionNotice
              type="Danger"
              title="This can't be undone"
              description={`Removing permanently deletes this message for everyone, everywhere it was delivered in ~${REPORT.channel}.`}
            />
            <p className={styles['remove-flow__copy']}>
              Once it's removed, you can no longer generate the list of who the
              message reached. If you need that record, capture it in the next step.
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <p className={styles['remove-flow__copy']}>
              Capture the recipient list before the message is deleted — it can't be
              rebuilt afterward.
            </p>
            <label className={styles['remove-flow__choice']}>
              <Checkbox
                checked={capture}
                onChange={(e) => setCapture(e.target.checked)}
              />
              <span>
                <span className={styles['remove-flow__choice-label']}>
                  Capture recipient list and generate report
                </span>
                <span className={styles['remove-flow__choice-note']}>
                  {CAPTURE_NOTE}
                </span>
              </span>
            </label>
            <TextArea
              label="Reviewer comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </>
        )}

        {step === 3 && (
          <>
            <SectionNotice
              type={capture ? 'Success' : 'Warning'}
              title={
                capture
                  ? 'Recipient report will be prepared'
                  : 'No recipient list will be captured'
              }
              description={
                capture
                  ? "We'll send you the report when it's ready (up to 30 minutes)."
                  : "You won't be able to generate the recipient list after removal."
              }
            />
            <p className={styles['remove-flow__copy']}>
              The message will be permanently removed from ~{REPORT.channel}.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}

// ── Inline (single-step) variant ──────────────────────────────────────────
export function RemoveConfirm({ onClose, onComplete }: FlowProps) {
  const [capture, setCapture] = useState(true);
  const [comment, setComment] = useState('');

  return (
    <Modal
      size="Small"
      title="Remove message"
      onClose={onClose}
      footer={
        <>
          <Button emphasis="Tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button emphasis="Primary" destructive onClick={onComplete}>
            Remove message
          </Button>
        </>
      }
    >
      <div className={styles['remove-flow']}>
        <SectionNotice
          type="Danger"
          title="This can't be undone"
          description="Removing permanently deletes this message for everyone. The recipient list can't be generated once the message is gone."
        />
        <label className={styles['remove-flow__choice']}>
          <Checkbox
            checked={capture}
            onChange={(e) => setCapture(e.target.checked)}
          />
          <span>
            <span className={styles['remove-flow__choice-label']}>
              Capture recipient list and report before removing (recommended)
            </span>
            <span className={styles['remove-flow__choice-note']}>{CAPTURE_NOTE}</span>
          </span>
        </label>
        <TextArea
          label="Reviewer comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </Modal>
  );
}

// ── Download variant (mirrors the existing "Remove message from channel" modal) ──
// Two steps: confirm (+ download-report checkbox + generate-list notice) → status.
export function RemoveDownloadFlow({
  onClose,
  onComplete,
  listGenerated,
}: FlowProps & { listGenerated: boolean }) {
  const [step, setStep] = useState(1);
  const [comment, setComment] = useState('');
  const [downloadReport, setDownloadReport] = useState(true);

  if (step === 1) {
    return (
      <Modal
        size="Medium"
        title="Remove message from channel"
        onClose={onClose}
        footer={
          <div className={styles['remove-flow__footer']}>
            <label className={styles['remove-flow__footer-check']}>
              <Checkbox
                checked={downloadReport}
                onChange={(e) => setDownloadReport(e.target.checked)}
              />
              <span>Download quarantined message report</span>
            </label>
            <span className={styles['remove-flow__footer-actions']}>
              <Button emphasis="Tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button emphasis="Primary" destructive onClick={() => setStep(2)}>
                Continue
              </Button>
            </span>
          </div>
        }
      >
        <div className={styles['remove-flow']}>
          <p className={styles['remove-flow__copy']}>
            You are about to remove a message authored by{' '}
            <strong>@{REPORT.author}</strong> posted in the {REPORT.channel} channel
            and quarantined for review by <strong>@{REPORT.reporter}</strong>.
          </p>
          <p className={styles['remove-flow__copy']}>
            If you confirm, the message will be removed from the channel and a
            notification will be sent to the reporter. This action cannot be reverted.
          </p>

          {!listGenerated && (
            <SectionNotice
              type="Warning"
              title="The “Delivered to” list hasn’t been generated"
              description="It can’t be generated after removal. The message and all its data are permanently deleted from Mattermost."
            />
          )}

          <div className={styles['remove-flow__field']}>
            <span className={styles['remove-flow__field-label']}>
              Add Comment (optional)
            </span>
            <TextArea
              placeholder="Add your comment here"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      size="Medium"
      title="Remove message from channel"
      showBackButton
      onBack={() => setStep(1)}
      onClose={onClose}
      footer={
        <>
          <Button emphasis="Tertiary" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button emphasis="Primary" destructive onClick={onComplete}>
            Permanently remove message
          </Button>
        </>
      }
    >
      <div className={styles['remove-flow']}>
        {downloadReport ? (
          <div className={styles['remove-flow__status']}>
            <Spinner size={16} />
            <span className={styles['remove-flow__status-body']}>
              <span className={styles['remove-flow__status-head']}>
                Preparing the report…
              </span>
              <span className={styles['remove-flow__status-note']}>
                This can take up to 30 minutes. We’ll notify you when the report is
                ready. You can remove the message now.
              </span>
            </span>
          </div>
        ) : (
          <SectionNotice
            type="Warning"
            title="No report will be generated"
            description="You won’t be able to recover the Delivered to list after the message is removed."
          />
        )}
        <p className={styles['remove-flow__copy']}>
          Removing permanently deletes this message for everyone in ~{REPORT.channel}.
        </p>
      </div>
    </Modal>
  );
}
