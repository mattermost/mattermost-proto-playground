import styles from './AcvcChannelApp.module.scss';

/**
 * Shipped create_post.read_only treatment: the composer shell stays, send and
 * formatting are gone, and the placeholder states the boundary. Copy is the
 * shipped en.json string — do not invent a banner or hide the input.
 *
 * In-progress compose is discarded when this replaces MessageInput: the typed
 * text is not retained in the read-only bar.
 */
export default function AcvcReadOnlyComposer() {
  return (
    <div className={styles['acvc-channel-app__readonly']} role="status">
      <p className={styles['acvc-channel-app__readonly-text']}>
        This channel is read-only. Only members with permission can post here.
      </p>
    </div>
  );
}
