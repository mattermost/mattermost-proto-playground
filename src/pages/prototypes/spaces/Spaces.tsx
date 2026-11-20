import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BullseyeArrowIcon,
  ChannelHeader,
  ClipboardTextOutlineIcon,
  MessageProcessingOutlineIcon,
  ProductRail,
  ProductShell,
} from '@mattermost/compass-proto';
import { Chip } from '@mattermost/compass-ui/components/chip';
import LayersOutlineIcon from '@mattermost/compass-icons/components/layers-outline';
import { Select } from '@mattermost/compass-ui/components/select';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { SpaceChannel } from './components/SpaceChannel';
import { SpaceHeader, type SpaceTab } from './components/SpaceHeader';
import { SpacesSidebar, type SidebarChild } from './components/SpacesSidebar';
import { ViewingAs } from './components/ViewingAs';
import {
  ENVIRONMENTS,
  environmentById,
  type RollupNode,
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
  const [childId, setChildId] = useState<string | null>(null);
  const [channelName, setChannelName] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
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
    setChildId(null);
    setChannelName(null);
    setRunId(null);
  }, []);

  const updateStory = useCallback((update: Partial<StoryState>) => {
    setStory((current) => ({ ...current, ...update }));
  }, []);

  const jumpTo = useCallback((id: ScreenId) => {
    setScreen(id);
    setChildId(null);
    setTab(id === 'board' ? 'board' : 'overview');
    if (id === 'home') setSpaceId(null);
    if (id === 'decision') setStory(presetFor('decision'));
    if (id === 'close') setStory(presetFor('close'));
  }, []);

  const openSpace = useCallback((id: string) => {
    setSpaceId(id);
    setChildId(null);
    setScreen('space');
    setTab('overview');
  }, []);

  const openChild = useCallback((child: SidebarChild) => {
    setSpaceId(child.spaceId || null);
    setChildId(child.id);
    const kind = child.kind.toLowerCase();
    if (kind === 'channel') {
      setChannelName(child.name);
      setScreen('channel');
      return;
    }
    if (kind === 'board') {
      setScreen('board');
      setTab('board');
      return;
    }
    if (kind === 'run') {
      setRunId(child.id);
      setScreen('run');
      return;
    }
    if (kind === 'doc' || kind === 'page' || kind === 'record') {
      setScreen('space');
      setTab('pages');
      return;
    }
    setScreen('space');
    setTab('overview');
  }, []);

  const linked = useMemo(() => {
    const space = environment.spaces.find(
      (item) => item.tenure === 'temporary',
    );
    if (!space) return undefined;
    const channels = showRestricted
      ? pack.channels
      : pack.channels.filter((channel) => !channel.restricted);
    const nodes: RollupNode[] = [
      ...channels.slice(0, 2).map((channel) => ({
        id: `channel:${channel.name}`,
        name: channel.name,
        kind: 'Channel',
      })),
      { id: `board:${space.id}`, name: 'Board', kind: 'Board' },
      ...pack.pages.slice(0, 2).map((page) => ({
        id: `doc:${page.title}`,
        name: page.title,
        kind: 'Doc',
      })),
      ...visible.runs.slice(0, 2).map((run) => ({
        id: run.id,
        name: run.title,
        kind: 'Run',
      })),
    ];
    return { spaceId: space.id, nodes };
  }, [environment.spaces, pack, showRestricted, visible.runs]);

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
        childId
          ? `child:${childId}`
          : screen === 'home'
            ? 'home'
            : spaceId
              ? `space:${spaceId}`
              : 'space:open'
      }
      healthById={{
        [environment.spaces.find((item) => item.tenure === 'temporary')?.id ??
        '']: pack.health,
      }}
      linked={linked}
      onHome={() => jumpTo('home')}
      onOpenSpace={openSpace}
      onOpenChild={openChild}
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
            catalog={{
              ...catalog,
              onlyRunId:
                runId && visible.runs.some((run) => run.id === runId)
                  ? runId
                  : pack.playbookRunId,
            }}
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

  const rail = (
    <ProductRail
      activeId="spaces"
      navLabel="Products"
      items={[
        {
          id: 'spaces',
          label: 'Spaces',
          icon: <LayersOutlineIcon size={24} />,
        },
        {
          id: 'channels',
          label: 'Channels',
          icon: <MessageProcessingOutlineIcon size={24} />,
        },
        {
          id: 'boards',
          label: 'Boards',
          icon: <BullseyeArrowIcon size={24} />,
        },
        {
          id: 'playbooks',
          label: 'Playbooks',
          icon: <ClipboardTextOutlineIcon size={24} />,
        },
      ]}
    />
  );

  return (
    <div className={styles['spaces__stage']}>
      <div className={styles['spaces__frame']}>
        <ProductShell
          productRail={rail}
          sidebar={sidebar}
          userAvatarSrc={user.avatar}
          userAvatarAlt={user.name}
        >
          {screen === 'channel' ? (
            <div className={styles['spaces__channel']}>
              <ChannelHeader
                type="channel"
                name={channelName ?? pack.primaryChannel}
                description={`Part of ${pack.name}`}
                memberCount={pack.memberIds.length}
              />
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
            </div>
          ) : (
            <div className={styles['spaces']}>{body}</div>
          )}
        </ProductShell>
      </div>
    </div>
  );
}
