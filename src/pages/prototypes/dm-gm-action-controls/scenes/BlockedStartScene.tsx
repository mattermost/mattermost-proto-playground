// [AI DRAFT] Scene 3 — blocked start, at every entry point. Shared by both
// directions; B adds the "Contact support" link where the surface can hold one.
import { useEffect, useId, useRef, useState } from 'react';
import { ProfilePopover } from '@mattermost/compass-ui/components/profile-popover';
import { Tooltip } from '@mattermost/compass-ui/components/tooltip';
import { shellStyles } from '@mattermost/compass-proto';
import DeniedReason from '../components/DeniedReason';
import { DENIED_COPY } from '../deniedCopy';
import DirectMessagesModal from '../components/DirectMessagesModal';
import DmgmChannelApp from '../components/DmgmChannelApp';
import DmgmSessionControls from '../components/DmgmSessionControls';
import DmgmStage from '../components/DmgmStage';
import { useDmSession } from '../components/useDmSession';
import { canStartWith } from '../conversations';
import { ISABELLA, DAVID, PEOPLE, type Person } from '../dmgmData';
import { TRUSTED_SESSION } from '../policyModel';
import type { SceneProps } from './AuthoringScene';
import { SUPPORT_LINK_NOTE_A, SUPPORT_LINK_NOTE_B } from './sceneNotes';
import avatarSystem from '@/assets/avatars/Staff Team.png';
import styles from './BlockedStartScene.module.scss';

const SYSTEM: Person = {
  id: 'system',
  name: 'System',
  username: 'system',
  avatarSrc: avatarSystem,
  kind: 'bot',
  title: '',
  attributes: {},
};

const COPY: Record<string, { title: string; note: string }> = {
  'dm-modal': {
    title:
      'Direct Messages modal: the person stays listed, and Go is unavailable',
    note: 'Darius Cole, a contractor, has selected Isabella Cruz, a program lead. She is still listed and selectable, so the directory reveals nothing. Once she is selected, Go is aria-disabled and the neutral reason appears. Remove her and add David Liang, and Go works. Select Emma Novak, who is in the other program, and it is blocked again with the same text.',
  },
  'gm-modal': {
    title: 'Group message: every recipient is checked',
    note: 'With Isabella Cruz and David Liang selected, the group is blocked, because one failing member blocks the whole start. The copy says "this group" and names nobody, so Darius can’t tell which member caused it.',
  },
  profile: {
    title:
      'Profile popover: Message is unavailable, with the reason in a tooltip',
    note: 'Click Isabella Cruz’s name in Ashgrove Integration. Message stays visible but is aria-disabled, and the tooltip carries the neutral reason. A tooltip can’t hold a link, so Direction B’s support link does not appear on this surface.',
  },
  slash: {
    title: '/msg replies with the same neutral text, visible only to the user',
    note: 'Darius typed /msg @isabella.cruz. The reply is ephemeral, and the same string appears for /groupmsg. Type another /msg in the composer and press Enter to try other people, for example @david.liang, which works.',
  },
};

function ephemeralBody(direction: SceneProps['direction'], group: boolean) {
  return (
    <p className={shellStyles['channel-shell__post-text']}>
      <DeniedReason
        inline
        kind={group ? 'start-gm' : 'start-dm'}
        direction={direction}
      />{' '}
      <span className={styles['blocked-start__ephemeral']}>
        (Only visible to you)
      </span>
    </p>
  );
}

/** Profile popover with Message aria-disabled. ProfilePopover has no disabled prop. */
function BlockedProfilePopover({
  person,
  onClose,
}: {
  person: Person;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const tipId = useId();
  const [tipOpen, setTipOpen] = useState(true);
  const blocked = !canStartWith([person], TRUSTED_SESSION);

  useEffect(() => {
    const button = ref.current?.querySelector<HTMLButtonElement>(
      "[class*='profile-popover__primary-button']",
    );
    if (!button) return;
    if (blocked) {
      button.setAttribute('aria-disabled', 'true');
      button.setAttribute('aria-describedby', tipId);
    }
    const show = () => setTipOpen(true);
    const hide = () => setTipOpen(false);
    button.addEventListener('mouseenter', show);
    button.addEventListener('focus', show);
    button.addEventListener('mouseleave', hide);
    button.addEventListener('blur', hide);
    return () => {
      button.removeEventListener('mouseenter', show);
      button.removeEventListener('focus', show);
      button.removeEventListener('mouseleave', hide);
      button.removeEventListener('blur', hide);
    };
  }, [blocked, tipId]);

  return (
    <div
      ref={ref}
      className={[
        styles['blocked-start__popover'],
        blocked ? styles['blocked-start__popover--blocked'] : '',
      ]
        .join(' ')
        .trim()}
    >
      <ProfilePopover
        avatarSrc={person.avatarSrc ?? ''}
        avatarAlt={person.name}
        name={person.name}
        username={person.username}
        title={person.title}
        email={`${person.username}@program-office.example`}
        localTime={{ time: '10:42 AM', timezone: 'EST' }}
        onClose={onClose}
        onPrimaryAction={() => undefined}
      />
      {blocked ? (
        <div
          className={[
            styles['blocked-start__tooltip'],
            tipOpen ? styles['blocked-start__tooltip--open'] : '',
          ]
            .join(' ')
            .trim()}
          id={tipId}
          role="tooltip"
        >
          <Tooltip label={DENIED_COPY['start-dm']} arrow="top" />
        </div>
      ) : null}
    </div>
  );
}

export default function BlockedStartScene({ direction, screen }: SceneProps) {
  const isModal = screen === 'dm-modal' || screen === 'gm-modal';
  const session = useDmSession({
    ctx: TRUSTED_SESSION,
    active: isModal ? 'Town Square' : 'Ashgrove Integration',
    drafts: screen === 'slash' ? { 'Ashgrove Integration': '' } : undefined,
  });
  const [modalOpen, setModalOpen] = useState(isModal);
  const [profile, setProfile] = useState<Person | null>(
    screen === 'profile' ? ISABELLA : null,
  );
  const seeded = useRef(false);

  // The /msg screen opens with the reply already posted, as if Darius had just pressed Enter.
  useEffect(() => {
    if (screen !== 'slash' || seeded.current) return;
    seeded.current = true;
    session.addMessage('Ashgrove Integration', {
      author: SYSTEM,
      time: '10:44',
      text: DENIED_COPY['start-dm'],
      body: ephemeralBody(direction, false),
    });
  }, [screen, direction, session]);

  const onSubmit = (text: string): boolean => {
    const match = /^\/(msg|groupmsg)\s+(.+)$/.exec(text);
    if (!match) return false;
    const handles = match[2]
      .split(/[\s,]+/)
      .map((h) => h.replace(/^@/, ''))
      .filter(Boolean);
    const people = handles
      .map((h) => PEOPLE.find((p) => p.username === h))
      .filter((p): p is Person => Boolean(p));
    if (people.length === 0) return false;
    if (canStartWith(people, session.ctx)) {
      const name = people.length === 1 ? people[0].name : null;
      if (name) {
        session.openConversation(name);
      }
      return true;
    }
    session.addMessage(session.active, {
      author: SYSTEM,
      time: 'Now',
      text: DENIED_COPY[people.length > 1 ? 'start-gm' : 'start-dm'],
      body: ephemeralBody(direction, people.length > 1),
    });
    return true;
  };

  const copy = COPY[screen] ?? COPY['dm-modal'];
  return (
    <DmgmStage
      title={copy.title}
      note={
        <>
          <p>{copy.note}</p>
          <p>{direction === 'b' ? SUPPORT_LINK_NOTE_B : SUPPORT_LINK_NOTE_A}</p>
        </>
      }
      controls={<DmgmSessionControls session={session} />}
    >
      <DmgmChannelApp
        session={session}
        direction={direction}
        onNewDirectMessage={() => setModalOpen(true)}
        onSubmit={onSubmit}
        onAuthorClick={(username) => {
          const person = PEOPLE.find((p) => p.username === username);
          if (person && person.id !== 'darius') setProfile(person);
        }}
        floating={
          profile ? (
            <BlockedProfilePopover
              person={profile}
              onClose={() => setProfile(null)}
            />
          ) : null
        }
        overlay={
          modalOpen ? (
            <DirectMessagesModal
              direction={direction}
              ctx={session.ctx}
              initialSelected={
                screen === 'gm-modal' ? [ISABELLA.id, DAVID.id] : [ISABELLA.id]
              }
              onClose={() => setModalOpen(false)}
              onGo={(ids) => {
                setModalOpen(false);
                if (ids.length === 1) {
                  const person = PEOPLE.find((p) => p.id === ids[0]);
                  if (person) session.openConversation(person.name);
                }
              }}
            />
          ) : null
        }
      />
    </DmgmStage>
  );
}
