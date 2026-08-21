import type { RightSidebarThreadMessage } from '@mattermost/compass-proto';
import { messageStyles } from '@mattermost/compass-ui';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';

const textClass = messageStyles['message__body-text'];

export const RIGHT_SIDEBAR_THREAD_DEMO_MESSAGES: RightSidebarThreadMessage[] = [
  {
    avatarSrc: avatarLeonard,
    avatarAlt: 'Leonard Riley',
    username: 'Leonard Riley',
    timestamp: 'Today at 9:41 AM',
    body: (
      <p className={textClass}>
        Quick gut-check: should the sidebar header always show the parent channel
        as a secondary title, or only when the content is scoped to a channel?
      </p>
    ),
  },
  {
    avatarSrc: avatarAikoTan,
    avatarAlt: 'Aiko Tan',
    username: 'Aiko Tan',
    timestamp: 'Today at 9:48 AM',
    body: (
      <p className={textClass}>
        I&apos;d lean on showing it whenever there&apos;s a meaningful parent —
        threads, pinned messages, files. Skip it for global views like Saved
        Messages.
      </p>
    ),
  },
  {
    avatarSrc: avatarDanielle,
    avatarAlt: 'Danielle Okoro',
    username: 'Danielle Okoro',
    timestamp: 'Today at 9:52 AM',
    body: (
      <p className={textClass}>
        +1. The divider treatment also reads as &quot;scoped to&quot; which
        reinforces the relationship.
      </p>
    ),
  },
];
