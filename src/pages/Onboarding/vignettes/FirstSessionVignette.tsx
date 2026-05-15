import { useState } from 'react';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import CheckIcon from '@mattermost/compass-icons/components/check';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import PauseIcon from '@mattermost/compass-icons/components/pause';
import PlaylistCheckIcon from '@mattermost/compass-icons/components/playlist-check';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Message from '@/components/ui/Message/Message';
import MessageInput from '@/components/ui/MessageInput';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import {
  AGENT,
  AGENT_PULSES,
  CURRENT_USER,
  DAY_ONE_MISSIONS,
  NEXT_PULSE_AT,
  TEAMMATES,
  WORKSPACE_NAME,
  buildFirstSessionSidebarModel,
  type MissionStatus,
  type PulseState,
} from '../onboarding.fixtures';
import styles from './FirstSessionVignette.module.scss';

type SubScene = 'mission-brief' | 'agent-pulse' | 'baseline';

const SUB_SCENES: { id: SubScene; label: string }[] = [
  { id: 'mission-brief', label: 'Day 1 mission channel' },
  { id: 'agent-pulse', label: 'Agent pulse (drip)' },
  { id: 'baseline', label: 'Bare Town Square (baseline)' },
];

export default function FirstSessionVignette() {
  const [scene, setScene] = useState<SubScene>('mission-brief');

  const sidebarModel = buildFirstSessionSidebarModel({
    activeChannel:
      scene === 'baseline'
        ? 'town-square'
        : scene === 'agent-pulse'
          ? 'agent'
          : 'start-here',
  });

  return (
    <div className={styles['first-session']}>
      <div className={styles['first-session__sub-switcher']}>
        <SceneSwitcher
          scenes={SUB_SCENES}
          activeId={scene}
          onChange={(id) => setScene(id as SubScene)}
          ariaLabel="First-session sub-scene"
        />
      </div>

      <div className={styles['first-session__stage']}>
        <ChannelShell
          channelsSidebarModel={sidebarModel}
          teamName={WORKSPACE_NAME}
          channelHeader={renderHeader(scene)}
        >
          {scene === 'mission-brief' && <MissionBrief />}
          {scene === 'agent-pulse' && <AgentPulse />}
          {scene === 'baseline' && (
            <BareTownSquare onOpenStartHere={() => setScene('mission-brief')} />
          )}
        </ChannelShell>
      </div>
    </div>
  );
}

function renderHeader(scene: SubScene) {
  if (scene === 'baseline') {
    return (
      <ChannelHeader
        type="Channel"
        name="Town Square"
        description="All-hands and announcements"
        memberCount={42}
      />
    );
  }
  if (scene === 'agent-pulse') {
    return (
      <ChannelHeader
        type="Bot"
        name={AGENT.name}
        description={`Day 1 pulse · ${countPulses('done')} done · ${countPulses('pending')} upcoming`}
        avatarSrc={AGENT.avatarSrc}
      />
    );
  }
  return (
    <ChannelHeader
      type="Channel"
      name="Start Here"
      description={`Day 1 mission brief · pinned for ${CURRENT_USER.name.split(' ')[0]}`}
      memberCount={2}
      pinnedCount={DAY_ONE_MISSIONS.length}
    />
  );
}

function countPulses(state: PulseState) {
  return AGENT_PULSES.filter((p) => p.state === state).length;
}

/* ─────────── Mission Brief (pre-seeded #start-here) ─────────── */

function MissionBrief() {
  const [statuses, setStatuses] = useState<Record<string, MissionStatus>>(() =>
    DAY_ONE_MISSIONS.reduce(
      (acc, m) => ({ ...acc, [m.id]: m.status }),
      {} as Record<string, MissionStatus>,
    ),
  );

  const doneCount = Object.values(statuses).filter((s) => s === 'done').length;
  const total = DAY_ONE_MISSIONS.length;
  const progress = (doneCount / total) * 100;

  const toggle = (id: string) =>
    setStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === 'done' ? 'pending' : 'done',
    }));

  return (
    <>
      <div className={styles['mission-strip']}>
        <div className={styles['mission-strip__head']}>
          <span className={styles['mission-strip__icon']} aria-hidden>
            <Icon size="16" glyph={<PlaylistCheckIcon />} />
          </span>
          <span className={styles['mission-strip__title']}>
            Day 1 mission brief
          </span>
          <span className={styles['mission-strip__count']}>
            {doneCount} of {total} done
          </span>
        </div>
        <ProgressBar
          size="Small"
          value={progress}
          aria-label="Day 1 mission progress"
        />
        <p className={styles['mission-strip__sub']}>
          Mattermost Agent pinned five things to try today. Each one teaches a
          part of the workspace — by doing real work, not a tutorial.
        </p>
      </div>

      <div className={shellStyles['channel-shell__messages']}>
        <Scrollbars>
          <div className={shellStyles['channel-shell__messages-list']}>
            <MessageSeparator type="Date" label="Today" />

            <Message
              avatarSrc={AGENT.avatarSrc}
              avatarAlt={AGENT.name}
              username={AGENT.name}
              timestamp="8:45 AM"
              isBot
              botLabel={AGENT.botLabel}
            >
              <p className={shellStyles['channel-shell__post-text']}>
                Welcome, {CURRENT_USER.name.split(' ')[0]}. I’ve set up five
                pinned missions below — pick whichever looks most useful and
                I’ll get out of your way.
              </p>
            </Message>

            <ol className={styles['missions']}>
              {DAY_ONE_MISSIONS.map((m, i) => (
                <MissionCard
                  key={m.id}
                  index={i + 1}
                  mission={m}
                  status={statuses[m.id]}
                  onToggle={() => toggle(m.id)}
                />
              ))}
            </ol>

            <Message
              avatarSrc={TEAMMATES.find((t) => t.id === 'sofia')!.avatarSrc}
              avatarAlt="Sofia Bauer"
              username="Sofia Bauer"
              timestamp="8:51 AM"
            >
              <p className={shellStyles['channel-shell__post-text']}>
                Welcome to the team, {CURRENT_USER.name.split(' ')[0]}!
                Drop a one-liner here so the rest of us know you’re around.
              </p>
            </Message>
          </div>
        </Scrollbars>
      </div>
      <div className={shellStyles['channel-shell__message-input']}>
        <MessageInput placeholder="Write to Start Here" />
      </div>
    </>
  );
}

function MissionCard({
  index,
  mission,
  status,
  onToggle,
}: {
  index: number;
  mission: (typeof DAY_ONE_MISSIONS)[number];
  status: MissionStatus;
  onToggle: () => void;
}) {
  const isDone = status === 'done';
  return (
    <li
      className={[
        styles['mission'],
        isDone ? styles['mission--done'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className={[
          styles['mission__check'],
          isDone ? styles['mission__check--on'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-pressed={isDone}
        aria-label={isDone ? 'Mark mission undone' : 'Mark mission done'}
        onClick={onToggle}
      >
        {isDone && <Icon size="12" glyph={<CheckIcon />} />}
      </button>
      <div className={styles['mission__body']}>
        <div className={styles['mission__head']}>
          <span className={styles['mission__index']}>#{index}</span>
          <span className={styles['mission__title']}>{mission.title}</span>
          <LabelTag
            label={`Teaches ${mission.teaches}`}
            type="Info Dim"
            size="X-Small"
          />
        </div>
        <p className={styles['mission__blurb']}>{mission.blurb}</p>
      </div>
      <div className={styles['mission__action']}>
        {isDone ? (
          <span className={styles['mission__done-tag']}>
            <Icon size="16" glyph={<CheckCircleIcon />} />
            Done
          </span>
        ) : (
          <Button emphasis="Secondary" size="Small">
            {mission.cta}
          </Button>
        )}
      </div>
    </li>
  );
}

/* ─────────── Agent Pulse (drip DM) ─────────── */

function AgentPulse() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <div className={styles['pulse-strip']}>
        <span className={styles['pulse-strip__icon']} aria-hidden>
          <Icon size="16" glyph={<LightningBoltOutlineIcon />} />
        </span>
        <div className={styles['pulse-strip__body']}>
          <strong className={styles['pulse-strip__title']}>
            Agent is pacing your Day 1
          </strong>
          <span className={styles['pulse-strip__copy']}>
            One small nudge every couple of hours — not a checklist. Pause any
            time and pick back up later.
          </span>
        </div>
        <Button
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PauseIcon />} />}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? 'Resume pulses' : 'Pause pulses'}
        </Button>
      </div>

      <div className={shellStyles['channel-shell__messages']}>
        <Scrollbars>
          <div className={shellStyles['channel-shell__messages-list']}>
            <MessageSeparator type="Date" label="Today" />

            {AGENT_PULSES.map((pulse) => (
              <PulseMessage key={pulse.id} pulse={pulse} />
            ))}

            <div
              className={[
                styles['next-pulse'],
                paused ? styles['next-pulse--paused'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Icon size="16" glyph={<ClockOutlineIcon />} />
              {paused ? (
                <span>
                  Pulses paused. Resume to continue your Day 1 walkthrough.
                </span>
              ) : (
                <span>
                  Next pulse arrives at <strong>{NEXT_PULSE_AT}</strong> — set
                  notification preferences.
                </span>
              )}
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={shellStyles['channel-shell__message-input']}>
        <MessageInput placeholder="Reply to Mattermost Agent" />
      </div>
    </>
  );
}

function PulseMessage({ pulse }: { pulse: (typeof AGENT_PULSES)[number] }) {
  const tag =
    pulse.state === 'done'
      ? { label: 'Done', type: 'Success' as const }
      : pulse.state === 'now'
        ? { label: 'New', type: 'Info' as const }
        : { label: 'Upcoming', type: 'Info Dim' as const };

  return (
    <Message
      avatarSrc={AGENT.avatarSrc}
      avatarAlt={AGENT.name}
      username={AGENT.name}
      timestamp={pulse.time}
      isBot
      botLabel={AGENT.botLabel}
      className={[
        styles['pulse-msg'],
        styles[`pulse-msg--${pulse.state}`],
      ].join(' ')}
    >
      <div className={styles['pulse-msg__row']}>
        <p className={styles['pulse-msg__text']}>{pulse.text}</p>
        <LabelTag label={tag.label} type={tag.type} size="X-Small" />
      </div>
      {'detail' in pulse && pulse.detail && (
        <p className={styles['pulse-msg__detail']}>{pulse.detail}</p>
      )}
      {'cta' in pulse && pulse.cta && pulse.state !== 'done' && (
        <div className={styles['pulse-msg__actions']}>
          <Button emphasis="Primary" size="X-Small">
            {pulse.cta}
          </Button>
          <Button emphasis="Tertiary" size="X-Small">
            Snooze
          </Button>
        </div>
      )}
    </Message>
  );
}

/* ─────────── Bare Town Square baseline ─────────── */

function BareTownSquare({
  onOpenStartHere,
}: {
  onOpenStartHere: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  return (
    <>
      <div className={shellStyles['channel-shell__messages']}>
        <Scrollbars>
          <div className={shellStyles['channel-shell__messages-list']}>
            <MessageSeparator type="Date" label="Two weeks ago" />
            <Message
              avatarSrc={TEAMMATES[0].avatarSrc}
              avatarAlt={TEAMMATES[0].name}
              username={TEAMMATES[0].name}
              timestamp="9:14 AM"
            >
              <p className={shellStyles['channel-shell__post-text']}>
                Reminder: standup moved to 10:00 today.
              </p>
            </Message>
            <Message
              avatarSrc={TEAMMATES[1].avatarSrc}
              avatarAlt={TEAMMATES[1].name}
              username={TEAMMATES[1].name}
              timestamp="3:02 PM"
            >
              <p className={shellStyles['channel-shell__post-text']}>
                Anyone got a working VPN config for the EU region?
              </p>
            </Message>
          </div>
        </Scrollbars>
      </div>
      <div className={shellStyles['channel-shell__message-input']}>
        <MessageInput placeholder="Write to Town Square" />
      </div>
      {!dismissed && (
        <aside className={styles['floating-start-here']}>
          <span className={styles['floating-start-here__icon']} aria-hidden>
            <Icon size="16" glyph={<CreationOutlineIcon />} />
          </span>
          <div className={styles['floating-start-here__body']}>
            <strong className={styles['floating-start-here__title']}>
              New to {WORKSPACE_NAME}?
            </strong>
            <span className={styles['floating-start-here__copy']}>
              Open #start-here for your Day 1 mission brief.
            </span>
          </div>
          <Button emphasis="Tertiary" size="Small" onClick={onOpenStartHere}>
            Open
          </Button>
          <IconButton
            aria-label="Dismiss"
            size="Small"
            icon={<Icon size="16" glyph={<CloseIcon />} />}
            onClick={() => setDismissed(true)}
          />
        </aside>
      )}
    </>
  );
}

