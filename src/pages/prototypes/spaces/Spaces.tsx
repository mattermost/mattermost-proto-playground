import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChannelHeader, ChannelShell } from '@mattermost/compass-proto';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Select } from '@mattermost/compass-ui/components/select';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { SpaceChannel } from './components/SpaceChannel';
import { SpaceHeader, type SpaceTab } from './components/SpaceHeader';
import { SpacesSidebar } from './components/SpacesSidebar';
import { ViewingAs } from './components/ViewingAs';
import {
  ENVIRONMENTS,
  environmentById,
  type RollupView,
  type UseCaseId,
} from './environments';
import BoardScene from './scenes/BoardScene';
import CloseScene from './scenes/CloseScene';
import DayScene from './scenes/DayScene';
import DecisionScene from './scenes/DecisionScene';
import OverviewScene from './scenes/OverviewScene';
import { spacePack } from './spacePacks';
import { ME, PEOPLE } from './spacesData';
import { presetFor, type StoryState } from './spacesStory';
import styles from './Spaces.module.scss';

type ScreenId =
  'home' | 'space' | 'channel' | 'board' | 'run' | 'decision' | 'close';

const SCREENS: { id: ScreenId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'space', label: 'Space' },
  { id: 'channel', label: 'Channel' },
  { id: 'board', label: 'Board' },
  { id: 'run', label: 'Playbook Run' },
  { id: 'decision', label: 'Decision' },
  { id: 'close', label: 'Close' },
];

export default function Spaces() {
  const { setCenterSlot, setStartSlot } = usePrototypeChrome();
  const [useCase, setUseCase] = useState<UseCaseId>('a');
  const [rollup, setRollup] = useState<RollupView>('safe');
  const [screen, setScreen] = useState<ScreenId>('home');
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [tab, setTab] = useState<SpaceTab>('overview');
  const [story, setStory] = useState<StoryState>(() => presetFor('day'));

  const environment = environmentById(useCase);
  const pack = spacePack(useCase);
  const showRestricted = Boolean(
    environment.compareRollup && rollup === 'leak',
  );
  const leak = showRestricted;

  const visible = useMemo(() => {
    const keep = <T extends { restricted?: boolean }>(items: T[]) =>
      showRestricted ? items : items.filter((item) => !item.restricted);
    const runs = keep(pack.runs);
    const runIds = new Set(runs.map((run) => run.id));
    return {
      runs,
      workstreams: keep(pack.workstreams),
      tasks: pack.tasks.filter((task) => runIds.has(task.runId)),
    };
  }, [pack, showRestricted]);

  const selectUseCase = useCallback((id: UseCaseId) => {
    setUseCase(id);
    setRollup('safe');
  }, []);

  const updateStory = useCallback((update: Partial<StoryState>) => {
    setStory((current) => ({ ...current, ...update }));
  }, []);

  const jumpTo = useCallback((id: ScreenId) => {
    setScreen(id);
    setTab(id === 'board' ? 'board' : 'overview');
    if (id === 'home') setSpaceId(null);
    if (id === 'decision') setStory(presetFor('decision'));
    if (id === 'close') setStory(presetFor('close'));
  }, []);

  const openSpace = useCallback((id: string) => {
    setSpaceId(id);
    setScreen('space');
    setTab('overview');
  }, []);

  useEffect(() => {
    setStartSlot(
      <div className={styles['spaces__chrome']}>
        <Select
          size="small"
          className={styles['spaces__use-case']}
          aria-label="Use case"
          value={useCase}
          zIndex={40}
          onChange={(id) => selectUseCase(id as UseCaseId)}
          options={ENVIRONMENTS.map((item) => ({
            value: item.id,
            label: item.switchLabel,
          }))}
        />
        {environment.compareRollup ? (
          <ViewingAs value={rollup} onChange={setRollup} />
        ) : null}
      </div>,
    );
    setCenterSlot(
      <SceneSwitcher
        scenes={SCREENS}
        activeId={screen}
        onChange={(id) => jumpTo(id as ScreenId)}
        ariaLabel="Screen"
      />,
    );
    return () => {
      setStartSlot(null);
      setCenterSlot(null);
    };
  }, [
    useCase,
    rollup,
    screen,
    environment.compareRollup,
    selectUseCase,
    jumpTo,
    setCenterSlot,
    setStartSlot,
  ]);

  const sidebar = (
    <SpacesSidebar
      key={environment.id}
      environment={environment}
      leak={leak}
      active={
        screen === 'home' ? 'home' : spaceId ? `space:${spaceId}` : 'space:open'
      }
      onHome={() => jumpTo('home')}
      onOpenSpace={openSpace}
    />
  );

  const profile = {
    name: pack.name,
    type: pack.type,
    outcome: pack.outcome,
    leadId: pack.leadId,
    sponsorId: pack.sponsorId,
    targetEnd: pack.targetEnd,
    lifecycle: pack.lifecycle,
    memberIds: pack.memberIds,
    boardLabel: 'Board',
  };
  const catalog = {
    runs: visible.runs,
    tasks: visible.tasks,
    workstreams: visible.workstreams,
  };
  const openTasks = visible.tasks.filter(
    (task) => task.status !== 'done',
  ).length;

  let body;
  if (screen === 'home') {
    body = (
      <DayScene
        environment={environment}
        rollup={environment.compareRollup ? rollup : 'safe'}
        onOpenSpace={openSpace}
      />
    );
  } else if (screen === 'channel') {
    body = null;
  } else {
    const showHeader = screen !== 'run';
    body = (
      <>
        {showHeader ? (
          <SpaceHeader
            health={pack.health}
            lifecycle={pack.lifecycleCurrent}
            tab={screen === 'board' ? 'board' : tab}
            onTabChange={(next) => {
              setTab(next);
              if (next === 'board') setScreen('board');
              else setScreen('space');
            }}
            boardCount={openTasks}
            profile={profile}
            aside={
              screen === 'decision' ? (
                <Chip size="small">Viewing as Alex Reid</Chip>
              ) : null
            }
          />
        ) : null}
        {screen === 'space' ? (
          <OverviewScene
            story={story}
            onStoryChange={updateStory}
            onOpenDecision={() => jumpTo('decision')}
            onOpenBoard={() => jumpTo('board')}
            showPages={tab === 'pages'}
            pack={pack}
            showRestricted={showRestricted}
          />
        ) : null}
        {screen === 'board' ? (
          <BoardScene
            story={story}
            onStoryChange={updateStory}
            catalog={catalog}
          />
        ) : null}
        {screen === 'run' ? (
          <BoardScene
            story={story}
            onStoryChange={updateStory}
            catalog={{ ...catalog, onlyRunId: pack.playbookRunId }}
          />
        ) : null}
        {screen === 'decision' ? (
          <DecisionScene story={story} onStoryChange={updateStory} />
        ) : null}
        {screen === 'close' ? (
          <CloseScene story={story} onStoryChange={updateStory} />
        ) : null}
      </>
    );
  }

  const user = screen === 'decision' ? PEOPLE.areid! : ME;

  return (
    <div className={styles['spaces__stage']}>
      <div className={styles['spaces__frame']}>
        {screen === 'channel' ? (
          <ChannelShell
            channelsSidebar={sidebar}
            userAvatarSrc={user.avatar}
            userAvatarAlt={user.name}
            channelHeader={
              <ChannelHeader
                type="channel"
                name={pack.primaryChannel}
                description={`Part of ${pack.name}`}
                memberCount={pack.memberIds.length}
              />
            }
          >
            <SpaceChannel
              story={story}
              name={pack.shortName}
              healthLabel={
                pack.health === 'critical'
                  ? 'Off track'
                  : pack.health === 'warning'
                    ? 'At risk'
                    : 'On track'
              }
              posts={pack.posts}
              onOpenSpace={() => jumpTo('space')}
            />
          </ChannelShell>
        ) : (
          <ChannelShell
            channelsSidebar={sidebar}
            userAvatarSrc={user.avatar}
            userAvatarAlt={user.name}
            innerContent={<div className={styles['spaces']}>{body}</div>}
          />
        )}
      </div>
    </div>
  );
}
