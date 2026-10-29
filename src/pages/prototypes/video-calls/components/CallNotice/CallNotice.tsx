import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import AccountMinusOutlineIcon from '@mattermost/compass-icons/components/account-minus-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import {
  Toast,
  type ToastProps,
} from '@mattermost/compass-ui/components/toast';
import styles from './CallNotice.module.scss';

export type CallNoticeItemKind =
  | 'joined'
  | 'left'
  | 'network'
  | 'recording'
  | 'device'
  | 'permission'
  | 'info';

export interface CallNoticeItem {
  id: string;
  kind: CallNoticeItemKind;
  text: string;
}

export interface CallNoticeLabels {
  /** Accessible name of the notice stack. */
  region?: string;
  dismiss?: string;
}

export interface CallNoticeProps {
  notices: readonly CallNoticeItem[];
  onDismiss: (id: string) => void;
  /** Auto-dismiss delay for transient kinds. Default 5000. */
  autoDismissMs?: number;
  /** Kinds that stay until dismissed. Default network, permission, device. */
  persistentKinds?: readonly CallNoticeItemKind[];
  labels?: CallNoticeLabels;
  className?: string;
}

const DEFAULT_PERSISTENT: readonly CallNoticeItemKind[] = [
  'network',
  'permission',
  'device',
];

const DEFAULT_LABELS: Required<CallNoticeLabels> = {
  region: 'Call notifications',
  dismiss: 'Dismiss notification',
};

const TOAST_TYPE: Record<
  CallNoticeItemKind,
  NonNullable<ToastProps['type']>
> = {
  joined: 'general',
  left: 'general',
  info: 'info',
  recording: 'info',
  network: 'warning',
  device: 'danger',
  permission: 'danger',
};

const KIND_ICON: Partial<Record<CallNoticeItemKind, ReactNode>> = {
  joined: <Icon size="16" glyph={<AccountPlusOutlineIcon />} />,
  left: <Icon size="16" glyph={<AccountMinusOutlineIcon />} />,
};

interface ItemProps {
  notice: CallNoticeItem;
  persistent: boolean;
  autoDismissMs: number;
  dismissLabel: string;
  onDismiss: (id: string) => void;
}

function NoticeItem({
  notice,
  persistent,
  autoDismissMs,
  dismissLabel,
  onDismiss,
}: ItemProps) {
  const { id } = notice;
  // Latest callback without restarting the timer when the host re-renders.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (persistent) return;
    const t = window.setTimeout(() => onDismissRef.current(id), autoDismissMs);
    return () => window.clearTimeout(t);
  }, [id, persistent, autoDismissMs]);

  return (
    <div className={styles['call-notice__item']}>
      <Toast
        type={TOAST_TYPE[notice.kind]}
        icon={KIND_ICON[notice.kind]}
        message={notice.text}
        dismissLabel={dismissLabel}
        onDismiss={() => onDismiss(id)}
      />
    </div>
  );
}

/**
 * Stack of dismissible call notices (Compass `Toast`) for the top-center of a
 * stage. Each Toast is its own polite live region. Transient kinds auto-dismiss
 * (timers are cleared on dismiss/unmount); network / permission / device persist.
 */
export function CallNotice({
  notices,
  onDismiss,
  autoDismissMs = 5000,
  persistentKinds = DEFAULT_PERSISTENT,
  labels,
  className,
}: CallNoticeProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  if (notices.length === 0) return null;
  return (
    <div
      className={[styles['call-notice'], className].filter(Boolean).join(' ')}
      role="group"
      aria-label={l.region}
    >
      {notices.map((n) => (
        <NoticeItem
          key={n.id}
          notice={n}
          persistent={persistentKinds.includes(n.kind)}
          autoDismissMs={autoDismissMs}
          dismissLabel={l.dismiss}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
