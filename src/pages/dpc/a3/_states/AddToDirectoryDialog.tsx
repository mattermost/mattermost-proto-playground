/**
 * AddToDirectoryDialog — the confirm dialog fired by the channel-header
 * "Add to Channel Directory" affordance (§3.3.4).
 *
 * Renders the matched-audience summary and the access-rules-still-gate
 * copy verbatim per §3.3.4. The dialog is the FR-4 inline-consequence
 * surface; atomicity is by construction so there is no separate
 * acknowledgment ceremony — clicking "Add to Directory" creates the entry
 * and closes the dialog.
 *
 * The symmetric RemoveFromDirectoryDialog explains the pending-request
 * auto-withdraw consequence (FR-10 analog) before commit.
 */
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import { PERSONAS } from '@/pages/dpc/shared';
import type { A3Store } from '../useA3Store';
import styles from './AddToDirectoryDialog.module.scss';

interface DialogProps {
  store: A3Store;
}

export function AddToDirectoryDialog({ store }: DialogProps) {
  if (!store.state.directoryAddDialogOpen) return null;
  const channelId = store.state.directoryDialogTargetChannel;
  if (!channelId) return null;
  const channel = store.channelById(channelId);
  if (!channel) return null;

  const adminUsername = PERSONAS['channel-admin'].username;

  const handleClose = () => store.dispatch({ type: 'CLOSE_ADD_DIALOG' });
  const handleConfirm = () =>
    store.dispatch({
      type: 'ADD_TO_DIRECTORY',
      channelId,
      adminUsername,
    });

  return (
    <div className={styles['dpc-addto']} role="presentation">
      <div className={styles['dpc-addto__backdrop']} onClick={handleClose} />
      <div className={styles['dpc-addto__modal']}>
        <Modal
          size="Small"
          title="Add to Channel Directory"
          subtitle="Discoverability is published here, not on Channel Settings."
          onClose={handleClose}
          footer={
            <div className={styles['dpc-addto__footer']}>
              <Button emphasis="Tertiary" onClick={handleClose}>
                Cancel
              </Button>
              <Button emphasis="Primary" onClick={handleConfirm}>
                Add to Directory
              </Button>
            </div>
          }
        >
          <p className={styles['dpc-addto__lead']}>
            This channel will appear in the Channel Directory and be
            discoverable to all non-guest members of the team.
          </p>

          <div className={styles['dpc-addto__channel-card']}>
            <Icon size="20" glyph={<LockOutlineIcon />} />
            <div className={styles['dpc-addto__channel-card-body']}>
              <span className={styles['dpc-addto__channel-card-name']}>
                {channel.displayName}
              </span>
              <span className={styles['dpc-addto__channel-card-purpose']}>
                {channel.purpose}
              </span>
            </div>
          </div>

          <dl className={styles['dpc-addto__facts']}>
            <div className={styles['dpc-addto__fact']}>
              <dt>Who will see this entry</dt>
              <dd>
                All non-guest members of this team
                <span className={styles['dpc-addto__fact-meta']}>
                  (~412 people · guests filtered server-side — NFR-2 / FR-12)
                </span>
              </dd>
            </div>
            <div className={styles['dpc-addto__fact']}>
              <dt>Access rules still gate joining</dt>
              <dd>
                Adding to the directory does <strong>not</strong> change who
                can join. Configured rules on the channel’s Access Control
                tab continue to apply.
              </dd>
            </div>
            <div className={styles['dpc-addto__fact']}>
              <dt>Requests will route to</dt>
              <dd>
                Channel admins of <code>#{channel.displayName}</code> · FR-6
              </dd>
            </div>
          </dl>

          <p className={styles['dpc-addto__atomicity']}>
            <strong>FR-3 atomicity by construction:</strong> the directory
            entry can only be created after the channel and its access rules
            exist. No race window. No save-time guard needed.
          </p>
        </Modal>
      </div>
    </div>
  );
}

export function RemoveFromDirectoryDialog({ store }: DialogProps) {
  if (!store.state.directoryRemoveDialogOpen) return null;
  const channelId = store.state.directoryDialogTargetChannel;
  if (!channelId) return null;
  const channel = store.channelById(channelId);
  if (!channel) return null;

  const pending = store.pendingForChannel(channelId);
  const adminUsername = PERSONAS['channel-admin'].username;

  const handleClose = () => store.dispatch({ type: 'CLOSE_REMOVE_DIALOG' });
  const handleConfirm = () =>
    store.dispatch({
      type: 'REMOVE_FROM_DIRECTORY',
      channelId,
      adminUsername,
    });

  return (
    <div className={styles['dpc-addto']} role="presentation">
      <div className={styles['dpc-addto__backdrop']} onClick={handleClose} />
      <div className={styles['dpc-addto__modal']}>
        <Modal
          size="Small"
          title="Remove from Channel Directory"
          subtitle="Removes the directory entry only — members and access rules are untouched."
          onClose={handleClose}
          footer={
            <div className={styles['dpc-addto__footer']}>
              <Button emphasis="Tertiary" onClick={handleClose}>
                Cancel
              </Button>
              <Button emphasis="Primary" destructive onClick={handleConfirm}>
                Remove from Directory
              </Button>
            </div>
          }
        >
          <div className={styles['dpc-addto__channel-card']}>
            <Icon size="20" glyph={<LockOutlineIcon />} />
            <div className={styles['dpc-addto__channel-card-body']}>
              <span className={styles['dpc-addto__channel-card-name']}>
                {channel.displayName}
              </span>
              <span className={styles['dpc-addto__channel-card-purpose']}>
                {channel.purpose}
              </span>
            </div>
          </div>

          <dl className={styles['dpc-addto__facts']}>
            <div className={styles['dpc-addto__fact']}>
              <dt>Pending requests against this channel</dt>
              <dd>
                <strong>{pending.length}</strong> · all pending requests will
                be auto-withdrawn (FR-10 analog) and requesters notified by
                DM per §3.3.9.
              </dd>
            </div>
            <div className={styles['dpc-addto__fact']}>
              <dt>What stays the same</dt>
              <dd>
                Existing members keep access. ABAC rules on this channel are
                unchanged. The channel itself is not deleted.
              </dd>
            </div>
            <div className={styles['dpc-addto__fact']}>
              <dt>What changes</dt>
              <dd>
                The channel no longer appears in the Channel Directory. New
                end users cannot discover it through this surface.
              </dd>
            </div>
          </dl>
        </Modal>
      </div>
    </div>
  );
}
