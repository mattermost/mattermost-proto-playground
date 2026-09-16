import type { ReactNode } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import styles from './ComposerShell.module.scss';

type Props = {
  children: ReactNode;
  canSend: boolean;
  onSend: () => void;
  onAttachClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export default function ComposerShell({
  children,
  canSend,
  onSend,
  onAttachClick,
  disabled,
  className,
}: Props) {
  return (
    <div className={[styles['composer-shell'], disabled ? styles['composer-shell--disabled'] : '', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={styles['composer-shell__plus']}
        aria-label="Add attachment"
        disabled={disabled}
        onClick={onAttachClick}
      >
        <Icon glyph={<PlusIcon />} size="16" />
      </button>
      <div className={styles['composer-shell__body']}>{children}</div>
      <button
        type="button"
        className={styles['composer-shell__send']}
        aria-label="Send message"
        disabled={disabled || !canSend}
        onClick={onSend}
      >
        <Icon glyph={<SendOutlineIcon />} size="16" />
      </button>
    </div>
  );
}
