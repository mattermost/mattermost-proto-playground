import { useCallback, useEffect, useState } from 'react';
import { ChannelHeader, ChannelShell } from '@mattermost/compass-proto';
import { Chip } from '@mattermost/compass-ui/components/chip';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { SpaceChannel } from './components/SpaceChannel';
import { SpaceHeader, type SpaceTab } from './components/SpaceHeader';
import { SpacesSidebar, type SidebarTarget } from './components/SpacesSidebar';
import BoardScene from './scenes/BoardScene';
import CloseScene from './scenes/CloseScene';
import { CreateSpaceModal } from './scenes/CreateSpaceModal';
import DayScene from './scenes/DayScene';
import DecisionScene from './scenes/DecisionScene';
import OverviewScene from './scenes/OverviewScene';
import { ME, PEOPLE } from './spacesData';
import {
  SCENES,
  needsAttention,
  presetFor,
  spaceHealth,
  type SceneId,
  type StoryState,
} from './spacesStory';
import styles from './Spaces.module.scss';

const TAB_FOR: Partial<Record<SceneId, SpaceTab>> = {
  overview: 'overview',
  board: 'board',
};

export default function Spaces() {
  const { setCenterSlot } = usePrototypeChrome();
  const [scene, setScene] = useState<SceneId>('day');
  const [story, setStory] = useState<StoryState>(() => presetFor('day'));
  const [tab, setTab] = useState<SpaceTab>('overview');
  const [channel, setChannel] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  /** Scene switcher: jump to a moment in the story (resets the story state). */
  const jumpTo = useCallback((id: SceneId) => {
    setScene(id);
    setStory(presetFor(id));
    setTab(TAB_FOR[id] ?? 'overview');
    setChannel(null);
    setCreateOpen(id === 'create');
  }, []);

  /** In-prototype navigation: move between views without resetting the story. */
  const goTo = useCallback((id: SceneId, nextTab?: SpaceTab) => {
    setScene(id);
    setTab(nextTab ?? TAB_FOR[id] ?? 'overview');
    setChannel(null);
  }, []);

  const updateStory = useCallback((update: Partial<StoryState>) => {
    setStory((s) => ({ ...s, ...update }));
  }, []);

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={SCENES.map((s) => ({ id: s.id, label: s.label }))}
        activeId={scene}
        onChange={(id) => jumpTo(id as SceneId)}
        ariaLabel="Storyboard moments"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, jumpTo, setCenterSlot]);

  const health = spaceHealth(story);
  const attention = needsAttention(story).length;
  const viewingAsReid = scene === 'decision';
  const inSpace =
    scene === 'overview' ||
    scene === 'board' ||
    scene === 'decision' ||
    scene === 'close';

  const navigate = (target: SidebarTarget) => {
    if (target === 'day') goTo('day');
    else if (target === 'space') goTo('overview');
    else setChannel(target.slice('channel:'.length));
  };

  const sidebarActive: SidebarTarget = channel
    ? `channel:${channel}`
    : inSpace
      ? 'space'
      : 'day';

  const changeTab = (next: SpaceTab) => {
    if (next === 'board') goTo('board');
    else goTo('overview', next);
  };

  const sidebar = (
    <SpacesSidebar
      active={sidebarActive}
      onNavigate={navigate}
      spaceHealth={health}
      needsAttention={attention}
      inc1294Joined={story.inc1294Joined}
      spaceExists={scene !== 'create'}
    />
  );

  const user = viewingAsReid ? PEOPLE.areid! : ME;
  const shellProps = {
    channelsSidebar: sidebar,
    userAvatarSrc: user.avatar,
    userAvatarAlt: user.name,
  };

  if (channel) {
    return (
      <div className={styles['spaces']}>
        <ChannelShell
          {...shellProps}
          channelHeader={
            <ChannelHeader
              type="channel"
              name={channel}
              description="Part of Operation: Credential Spray Campaign"
              memberCount={12}
            />
          }
        >
          <SpaceChannel story={story} onOpenSpace={() => goTo('overview')} />
        </ChannelShell>
      </div>
    );
  }

  let body;
  if (scene === 'day' || scene === 'create') {
    body = (
      <DayScene
        story={story}
        onStoryChange={updateStory}
        onOpenSpace={() => goTo('overview')}
        onOpenDecision={() => goTo('decision')}
      />
    );
  } else {
    const lifecycle =
      scene === 'close' ? (story.closed ? 'Closed' : 'Closing') : 'Active';
    body = (
      <>
        <SpaceHeader
          health={scene === 'close' ? 'nominal' : health}
          lifecycle={lifecycle}
          tab={tab}
          onTabChange={changeTab}
          boardCount={story.tasks.filter((t) => t.status !== 'done').length}
          aside={
            viewingAsReid ? (
              <Chip size="small">Viewing as Alex Reid</Chip>
            ) : null
          }
        />
        {scene === 'overview' ? (
          <OverviewScene
            story={story}
            onStoryChange={updateStory}
            onOpenDecision={() => goTo('decision')}
            onOpenBoard={() => goTo('board')}
            showPages={tab === 'pages'}
          />
        ) : null}
        {scene === 'board' ? (
          <BoardScene story={story} onStoryChange={updateStory} />
        ) : null}
        {scene === 'decision' ? (
          <DecisionScene story={story} onStoryChange={updateStory} />
        ) : null}
        {scene === 'close' ? (
          <CloseScene story={story} onStoryChange={updateStory} />
        ) : null}
      </>
    );
  }

  return (
    <div className={styles['spaces']}>
      <ChannelShell
        {...shellProps}
        innerContent={<div className={styles['spaces']}>{body}</div>}
      />
      <CreateSpaceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={() => {
          setCreateOpen(false);
          setStory(presetFor('overview'));
          goTo('overview');
        }}
      />
    </div>
  );
}
