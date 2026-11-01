import { useEffect, useRef, useState, type ReactNode } from 'react';
import RecordIcon from '@mattermost/compass-icons/components/record-circle-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { CallNotice as CallNoticePill } from '@mattermost/compass-proto';
import { PopoverNotice } from '@mattermost/compass-ui/components/popover-notice';
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
  | 'recording-started'
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
  /** Body of the "recording started" popover notice. */
  recordingStartedBody?: string;
  /** Action button on the "recording started" popover notice. */
  recordingStartedAction?: string;
}

export interface CallNoticeProps {
  notices: readonly CallNoticeItem[];
  onDismiss: (id: string) => void;
  /** How long transient notices stay before fading off. Default 3000. */
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
  'recording-started',
];

const DEFAULT_LABELS: Required<CallNoticeLabels> = {
  region: 'Call notifications',
  dismiss: 'Dismiss notification',
  recordingStartedBody:
    'Consider letting everyone know that this meeting is being recorded and transcribed.',
  recordingStartedAction: 'Dismiss',
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
  'recording-started': 'info',
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
  recordingStartedBody: string;
  recordingStartedAction: string;
  onDismiss: (id: string) => void;
}

/** Length of the fade-off before a timed-out notice is removed. */
const FADE_OUT_MS = 200;

function NoticeItem({
  notice,
  persistent,
  autoDismissMs,
  dismissLabel,
  recordingStartedBody,
  recordingStartedAction,
  onDismiss,
}: ItemProps) {
  const { id } = notice;
  const [leaving, setLeaving] = useState(false);
  // Latest callback without restarting the timers when the host re-renders.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // Visible for `autoDismissMs`, then fades off, then is removed.
  useEffect(() => {
    if (persistent) return;
    const fade = window.setTimeout(() => setLeaving(true), autoDismissMs);
    const remove = window.setTimeout(
      () => onDismissRef.current(id),
      autoDismissMs + FADE_OUT_MS,
    );
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(remove);
    };
  }, [id, persistent, autoDismissMs]);

  let content: ReactNode;
  if (PILL_KINDS.includes(notice.kind)) {
    content = (
      <CallNoticePill type="other" size="medium" message={notice.text} />
    );
  } else if (notice.kind === 'recording-started') {
    content = (
      <PopoverNotice
        className={styles['call-notice__recording-started']}
        icon={<Icon glyph={<RecordIcon />} />}
        title={notice.text}
        closeLabel={dismissLabel}
        onClose={() => onDismiss(id)}
        actions={[
          {
            label: recordingStartedAction,
            emphasis: 'primary',
            onClick: () => onDismiss(id),
          },
        ]}
      >
        {recordingStartedBody}
      </PopoverNotice>
    );
  } else if (notice.kind === 'recording') {
    content = (
      <div className={styles['call-notice__popover']} role="status">
        <span className={styles['call-notice__record']}>
          <Icon size="16" glyph={<RecordIcon />} />
        </span>
        <span className={styles['call-notice__popover-text']}>
          {notice.text}
        </span>
      </div>
    );
  } else {
    content = (
      <Toast
        type={TOAST_TYPE[notice.kind]}
        message={notice.text}
        dismissLabel={dismissLabel}
        onDismiss={() => onDismiss(id)}
      />
    );
  }

  return (
    <div
      className={[
        styles['call-notice__item'],
        leaving && styles['call-notice__item--leaving'],
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {content}
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
  autoDismissMs = 3000,
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
          recordingStartedBody={l.recordingStartedBody}
          recordingStartedAction={l.recordingStartedAction}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
