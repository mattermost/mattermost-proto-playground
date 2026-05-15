/**
 * RequestToJoinModal — two-step Request-to-Join flow (§3.1.3 / §3.3.3).
 *
 * Step 1: rationale form. Step 2: confirm screen. After submission the
 * modal closes; pending state is reflected by the directory row showing
 * "Pending — Withdraw" (FR-8 subdued styling).
 *
 * Identical to A1's modal from the requester's perspective — referenced
 * here per §3.3.3 ("No A3-specific divergence on the requester side").
 * The non-obvious A3 detail is that the request lifecycle is tied to the
 * channel_id, not the directory_entry_id — handled by useA3Store.
 */
import { useEffect, useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import TextArea from '@/components/ui/TextArea/TextArea';
import Icon from '@/components/ui/Icon/Icon';
import { usePersona } from '@/pages/dpc/shared';
import type { A3Store } from '../useA3Store';
import styles from './RequestToJoinModal.module.scss';

interface RequestToJoinModalProps {
  store: A3Store;
}

export default function RequestToJoinModal({
  store,
}: RequestToJoinModalProps) {
  const { personaInfo } = usePersona();
  const [rationale, setRationale] = useState('');

  // Reset rationale every time the modal opens for a fresh channel.
  useEffect(() => {
    if (store.state.requestModalStep === 'form') {
      setRationale('');
    }
  }, [store.state.requestModalTargetChannel, store.state.requestModalStep]);

  if (store.state.requestModalStep === 'closed') return null;
  const channelId = store.state.requestModalTargetChannel;
  if (!channelId) return null;
  const channel = store.channelById(channelId);
  if (!channel) return null;

  const isForm = store.state.requestModalStep === 'form';
  const isConfirm = store.state.requestModalStep === 'confirm';

  const onClose = () => store.dispatch({ type: 'CLOSE_REQUEST_MODAL' });
  const onAdvance = () => store.dispatch({ type: 'ADVANCE_REQUEST_MODAL' });
  const onSubmit = () =>
    store.dispatch({
      type: 'SUBMIT_REQUEST',
      channelId,
      requesterUsername: personaInfo.username,
      rationale: rationale.trim(),
    });

  return (
    <div className={styles['dpc-rtj']} role="presentation">
      <div className={styles['dpc-rtj__backdrop']} onClick={onClose} />
      <div className={styles['dpc-rtj__modal']}>
        <Modal
          size="Small"
          title={
            isForm ? 'Request to Join' : 'Confirm — send your request'
          }
          subtitle={
            isForm
              ? 'A2/A3 two-step pattern · request submission ≠ join until approved.'
              : 'You can withdraw at any time before an admin acts on the request.'
          }
          onClose={onClose}
          footer={
            <div className={styles['dpc-rtj__footer']}>
              {isForm && (
                <>
                  <Button emphasis="Tertiary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    emphasis="Primary"
                    onClick={onAdvance}
                    disabled={rationale.trim().length === 0}
                  >
                    Continue
                  </Button>
                </>
              )}
              {isConfirm && (
                <>
                  <Button emphasis="Tertiary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button emphasis="Primary" onClick={onSubmit}>
                    Send Request
                  </Button>
                </>
              )}
            </div>
          }
        >
          <div className={styles['dpc-rtj__channel-card']}>
            <Icon size="20" glyph={<LockOutlineIcon />} />
            <div className={styles['dpc-rtj__channel-card-body']}>
              <span className={styles['dpc-rtj__channel-card-name']}>
                {channel.displayName}
              </span>
              <span className={styles['dpc-rtj__channel-card-purpose']}>
                {channel.purpose}
              </span>
            </div>
          </div>

          {isForm && (
            <div className={styles['dpc-rtj__form']}>
              <TextArea
                label="Why are you requesting access?"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                maxLength={500}
                showCharacterCount
                rows={4}
                placeholder="Plain text only · max 500 characters · FR-17"
              />
              <p className={styles['dpc-rtj__hint']}>
                Submitted to the channel admins of{' '}
                <code>#{channel.displayName}</code>. Audit event{' '}
                <code>Request_submitted</code> emits with{' '}
                <code>channel_id</code> (not directory_entry_id) per §3.3.3.
              </p>
            </div>
          )}

          {isConfirm && (
            <div className={styles['dpc-rtj__confirm']}>
              <p className={styles['dpc-rtj__confirm-lead']}>
                You are about to send the following request:
              </p>
              <blockquote className={styles['dpc-rtj__confirm-rationale']}>
                {rationale}
              </blockquote>
              <p className={styles['dpc-rtj__hint']}>
                After submission the directory row updates to "Pending —
                Withdraw" with the FR-8 subdued styling. You'll receive a DM
                when an admin approves or declines.
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
