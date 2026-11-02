import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import RecordIcon from '@mattermost/compass-icons/components/record-circle-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { CallNotice as CallNoticePill } from '@mattermost/compass-proto';
import { PopoverNotice } from '@mattermost/compass-ui/components/popover-notice';
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
  /**
   * Surface the notices sit on: `default` is the dark pill for the call stage;
   * `center-channel` is the light pill for light surfaces such as the widget.
   */
  appearance?: 'default' | 'center-channel';
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

/**
 * Everything except the two recording notices is the proto call-notice pill.
 * The pill has no dismiss button, so one that stays until dismissed (network,
 * permission, device) is dismissed by pressing the pill; its trailing close
 * icon is the affordance.
 */
const PILL_KINDS: readonly CallNoticeItemKind[] = [
  'joined',
  'left',
  'host',
  'info',
  'network',
  'device',
  'permission',
];

/** Severity of a notice: warnings and errors get a solid fill and an alert icon. */
const TONE: Partial<Record<CallNoticeItemKind, 'warning' | 'error'>> = {
  network: 'warning',
  device: 'error',
  permission: 'error',
};
const TONE_WORD = { warning: 'Warning', error: 'Error' } as const;

interface ItemProps {
  notice: CallNoticeItem;
  appearance: 'default' | 'center-channel';
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
  appearance,
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
    const tone = TONE[notice.kind];
    content = (
      <CallNoticePill
        type="other"
        size="medium"
        appearance={appearance}
        tone={tone}
        message={notice.text}
        className={persistent ? styles['call-notice__pill--dismissible'] : ''}
        {...(persistent
          ? {
              role: 'button',
              tabIndex: 0,
              // The label replaces the pill's own content, so it carries the
              // severity the hidden tone text would have read.
              'aria-label': `${dismissLabel}: ${tone ? `${TONE_WORD[tone]}: ` : ''}${notice.text}`,
              onClick: () => onDismiss(id),
              onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onDismiss(id);
                }
              },
            }
          : { role: 'status' })}
      />
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
    // 'recording-started' and 'recording' are handled above; nothing else is left.
    content = null;
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
 * Stack of dismissible call notices (the proto `CallNotice` pill for everything but recording) for the bottom-left of a
 * stage (above the controls bar). `recording` renders as a compact popover. Each Toast is its own polite live region. Transient kinds auto-dismiss
 * (timers are cleared on dismiss/unmount); network / permission / device persist.
 */
export function CallNotice({
  notices,
  onDismiss,
  autoDismissMs = 3000,
  persistentKinds = DEFAULT_PERSISTENT,
  appearance = 'default',
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
          appearance={appearance}
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
