import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import { Message } from '@mattermost/compass-ui';
import { messageStyles } from '@mattermost/compass-ui';
import Preview from '@/guidelines/_components/Preview';
import styles from './MessageGuidelineStates.module.scss';

/**
 * Default vs hover snapshots for the Message pattern guidelines (States section).
 */
function SampleBody() {
  return (
    <p className={messageStyles['message__body-text']}>
      Short status update for the team.
    </p>
  );
}

export function MessageGuidelineStates() {
  return (
    <div className={styles['message-states']}>
      <Preview caption="Default">
        <Message
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          username="Leonard Riley"
          timestamp="Today at 9:41 AM"
        >
          <SampleBody />
        </Message>
      </Preview>
      <Preview caption="Hover">
        <Message
          className={messageStyles['message--state-hover']}
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          username="Leonard Riley"
          timestamp="Today at 9:41 AM"
        >
          <SampleBody />
        </Message>
      </Preview>
    </div>
  );
}
