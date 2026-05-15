import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import MessageInput from '@/components/ui/MessageInput/MessageInput';
import styles from './PBEComposer.module.scss';

export interface PBEComposerProps {
  /** Channel name shown in the input placeholder. */
  channelName?: string;
  /** Configuration label rendered in the encryption indicator strip. */
  configurationName?: string;
}

/**
 * Composer for a Program-Protected channel — dest `MessageInput` plus a
 * shield-prefixed indicator strip noting the encryption configuration
 * (gap G10). Single-use, kept inline.
 */
export default function PBEComposer({
  channelName = 'operations-alpha',
  configurationName = 'Program Alpha',
}: PBEComposerProps) {
  return (
    <div className={styles['pbe-composer']}>
      <div className={styles['pbe-composer__indicator']}>
        <ShieldOutlineIcon size={12} aria-hidden />
        <span className={styles['pbe-composer__indicator-label']}>
          Messages encrypted with {configurationName}
        </span>
      </div>
      <MessageInput placeholder={`Message ${channelName}…`} />
    </div>
  );
}
