import { useEffect, useRef } from 'react';
import RecordIcon from '@mattermost/compass-icons/components/record-circle-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { CallNotice as CallNoticePill } from '@mattermost/compass-proto';
import {
  Toast,
  type ToastProps,
} from '@mattermost/compass-ui/components/toast';
import styles from './CallNotice.module.scss';

export type CallNoticeItemKind =
  | 'joined'
  | 'left'
  | 'host'
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
  host: 'general',
  info: 'info',
  recording: 'info',
  network: 'warning',
  device: 'danger',
  permission: 'danger',
};

/** Join / leave / new host use the proto call-notice pill; the rest stay Toasts. */
const PILL_KINDS: readonly CallNoticeItemKind[] = ['joined', 'left', 'host'];

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

  if (PILL_KINDS.includes(notice.kind)) {
    return (
      <div className={styles['call-notice__item']}>
        <CallNoticePill type="other" size="medium" message={notice.text} />
      </div>
    );
  }

  if (notice.kind === 'recording') {
    return (
      <div
        className={[
          styles['call-notice__item'],
          styles['call-notice__popover'],
        ].join(' ')}
        role="status"
      >
        <span className={styles['call-notice__record']}>
          <Icon size="16" glyph={<RecordIcon />} />
        </span>
        <span className={styles['call-notice__popover-text']}>
          {notice.text}
        </span>
      </div>
    );
  }

  return (
    <div className={styles['call-notice__item']}>
      <Toast
        type={TOAST_TYPE[notice.kind]}
        message={notice.text}
        dismissLabel={dismissLabel}
        onDismiss={() => onDismiss(id)}
      />
    </div>
  );
}

/**
 * Stack of dismissible call notices (proto `CallNotice` pill for join/leave, Compass `Toast` otherwise) for the bottom-left of a
 * stage (above the controls bar). `recording` renders as a compact popover. Each Toast is its own polite live region. Transient kinds auto-dismiss
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
