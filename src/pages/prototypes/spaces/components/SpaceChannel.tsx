import { Message, MessageInput } from '@mattermost/compass-proto';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import LayersOutlineIcon from '@mattermost/compass-icons/components/layers-outline';
import { HealthDot } from './HealthDot';
import { HEALTH_LABEL, PEOPLE, SPACE } from '../spacesData';
import {
  hardeningDone,
  needsAttention,
  spaceHealth,
  type StoryState,
} from '../spacesStory';
import styles from './SpaceChannel.module.scss';

const POSTS = [
  {
    by: 'jthomas',
    at: '9:02 AM',
    text: 'Morning. Finance spray is contained, sessions revoked. Mary is writing it up.',
  },
  {
    by: 'playbooks',
    at: '9:15 AM',
    text: 'INC-1294 joined Operation: Credential Spray Campaign. Its alert matched the campaign IOC set.',
  },
  {
    by: 'kchegg',
    at: '10:41 AM',
    text: 'Two new SentryMBA hosting ranges. Added to IOC set v3 in the Space library.',
  },
  {
    by: 'agent',
    at: '11:30 AM',
    text: 'Sitrep for week 3 is saved as a page in the Space. Short version: no new successes since Oct 14, hardening at 3 of 5, one unit blocked on an exception.',
  },
];

export interface SpaceChannelProps {
  story: StoryState;
  onOpenSpace: () => void;
}

/** A Space channel: the Space's status comes to where people already are. */
export function SpaceChannel({ story, onOpenSpace }: SpaceChannelProps) {
  const health = spaceHealth(story);
  const attention = needsAttention(story).length;
  const hardening = hardeningDone(story);

  return (
    <>
      <div className={styles['space-channel']} role="status">
        <Icon glyph={<LayersOutlineIcon />} size="16" />
        <span className={styles['space-channel__name']}>{SPACE.shortName}</span>
        <HealthDot health={health} />
        <span className={styles['space-channel__meta']}>
          {HEALTH_LABEL[health]} · {attention} need attention · hardening{' '}
          {hardening.done}/{hardening.total}
        </span>
        <Button
          className={styles['space-channel__open']}
          size="x-small"
          emphasis="tertiary"
          onClick={onOpenSpace}
        >
          Open Space
        </Button>
      </div>
      <Scrollbar className={styles['space-channel__scroll']}>
        <div className={styles['space-channel__posts']}>
          {POSTS.map((p) => {
            const person = PEOPLE[p.by]!;
            return (
              <Message
                key={p.at}
                avatarSrc={person.avatar}
                avatarAlt={person.name}
                username={person.name}
                timestamp={p.at}
                isBot={person.isBot}
              >
                {p.text}
              </Message>
            );
          })}
        </div>
      </Scrollbar>
      <div className={styles['space-channel__composer']}>
        <MessageInput placeholder="Write to spray-war-room" />
      </div>
    </>
  );
}
