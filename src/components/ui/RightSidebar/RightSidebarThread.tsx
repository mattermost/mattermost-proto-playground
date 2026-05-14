import Message from '@/components/ui/Message/Message';
import messageStyles from '@/components/ui/Message/Message.module.scss';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import styles from './RightSidebarThread.module.scss';

export default function RightSidebarThread() {
  const textClass = messageStyles['message__body-text'];

  return (
    <div className={styles['right-sidebar-thread']}>
      <Message
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="Leonard Riley"
        timestamp="Today at 9:41 AM"
      >
        <p className={textClass}>
          Quick gut-check: should the sidebar header always show the parent
          channel as a secondary title, or only when the content is scoped to a
          channel?
        </p>
      </Message>
      <Message
        avatarSrc={avatarAikoTan}
        avatarAlt="Aiko Tan"
        username="Aiko Tan"
        timestamp="Today at 9:48 AM"
      >
        <p className={textClass}>
          I&apos;d lean on showing it whenever there&apos;s a meaningful parent —
          threads, pinned messages, files. Skip it for global views like Saved
          Messages.
        </p>
      </Message>
      <Message
        avatarSrc={avatarDanielle}
        avatarAlt="Danielle Okoro"
        username="Danielle Okoro"
        timestamp="Today at 9:52 AM"
      >
        <p className={textClass}>
          +1. The divider treatment also reads as &quot;scoped to&quot; which
          reinforces the relationship.
        </p>
      </Message>
    </div>
  );
}
