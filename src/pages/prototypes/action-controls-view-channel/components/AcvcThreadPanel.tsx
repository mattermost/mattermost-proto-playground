import type { ReactNode } from 'react';
import {
  RightSidebarHeader,
} from '@mattermost/compass-ui/components/right-sidebar-header';
import {
  MessageInput,
  RightSidebar,
  RightSidebarThread,
  messageStyles,
  shellStyles,
  type RightSidebarThreadMessage,
} from '@mattermost/compass-proto';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import { RESTRICTED_CHANNEL } from '../channelData';
import AcvcReadOnlyComposer from './AcvcReadOnlyComposer';

const WATCHFLOOR_THREAD: RightSidebarThreadMessage[] = [
  {
    avatarSrc: avatarSofia,
    avatarAlt: 'Sofia Bauer',
    username: 'Sofia Bauer',
    timestamp: 'Today at 8:12 AM',
    body: (
      <p className={messageStyles['message__body-text']}>
        Watch turnover complete. Night shift handed over three open items — all
        logged in the tracker.
      </p>
    ),
  },
  {
    avatarSrc: avatarMarco,
    avatarAlt: 'Marco Rinaldi',
    username: 'Marco Rinaldi',
    timestamp: 'Today at 8:31 AM',
    body: (
      <p className={messageStyles['message__body-text']}>
        Sensor feed on the eastern array came back up at 07:50. No data gap on
        our side.
      </p>
    ),
  },
  {
    avatarSrc: avatarAikoTan,
    avatarAlt: 'Aiko Tan',
    username: 'Aiko Tan',
    timestamp: 'Today at 8:44 AM',
    body: (
      <p className={messageStyles['message__body-text']}>
        Confirmed. I will fold that into the morning summary before the 0900
        brief.
      </p>
    ),
  },
];

export interface AcvcThreadPanelProps {
  readOnly: boolean;
  channelName?: string;
  messages?: RightSidebarThreadMessage[];
  replySeparatorLabel?: string;
  footer?: ReactNode;
}

export default function AcvcThreadPanel({
  readOnly,
  channelName = RESTRICTED_CHANNEL,
  messages = WATCHFLOOR_THREAD,
  replySeparatorLabel = '2 replies',
  footer,
}: AcvcThreadPanelProps) {
  return (
    <RightSidebar
      alignBody="end"
      className={shellStyles['channel-shell__right-sidebar']}
      header={
        <RightSidebarHeader
          title="Thread"
          secondaryTitle={channelName}
          actionLabel="Following"
          actionActive
          onExpand={() => undefined}
          onClose={() => undefined}
        />
      }
      footer={
        footer ?? (
          <div className={shellStyles['channel-shell__message-input']}>
            {readOnly ? (
              <AcvcReadOnlyComposer />
            ) : (
              <MessageInput placeholder="Reply to thread…" width="narrow" />
            )}
          </div>
        )
      }
    >
      <RightSidebarThread
        messages={messages}
        replySeparatorLabel={replySeparatorLabel}
      />
    </RightSidebar>
  );
}
