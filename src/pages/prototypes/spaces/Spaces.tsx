import { useCallback, useEffect, useState } from 'react';
import { ChannelShell } from '@mattermost/compass-proto';
import { Chip } from '@mattermost/compass-ui/components/chip';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { ViewingAs } from './components/ViewingAs';
import { SpaceHeader, type SpaceTab } from './components/SpaceHeader';
import { SpacesSidebar } from './components/SpacesSidebar';
import {
  ENVIRONMENTS,
  environmentById,
  type RollupView,
  type UseCaseId,
} from './environments';
import BoardScene from './scenes/BoardScene';
import DayScene from './scenes/DayScene';
import DecisionScene from './scenes/DecisionScene';
import OverviewScene from './scenes/OverviewScene';
import { ME, PEOPLE } from './spacesData';
import { presetFor, spaceHealth, type StoryState } from './spacesStory';
import styles from './Spaces.module.scss';

type SpaceScene = 'overview' | 'board' | 'decision';

export default function Spaces() {
  const { setCenterSlot } = usePrototypeChrome();
  const [useCase, setUseCase] = useState<UseCaseId>('a');
  const [rollup, setRollup] = useState<RollupView>('safe');
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [spaceScene, setSpaceScene] = useState<SpaceScene>('overview');
  const [tab, setTab] = useState<SpaceTab>('overview');
  const [story, setStory] = useState<StoryState>(() => presetFor('overview'));

  const environment = environmentById(useCase);
  const space = environment.spaces.find((item) => item.id === spaceId) ?? null;
  const leak = Boolean(environment.compareRollup && rollup === 'leak');

  const selectUseCase = useCallback((id: UseCaseId) => {
    setUseCase(id);
    setRollup('safe');
    setSpaceId(null);
  }, []);

  const updateStory = useCallback((update: Partial<StoryState>) => {
    setStory((current) => ({ ...current, ...update }));
  }, []);

  /** Enter the original Space screen. A different Space starts at its overview. */
  const openSpace = useCallback((id: string) => {
    setSpaceId((current) => {
      if (current !== id) setStory(presetFor('overview'));
      return id;
    });
    setSpaceScene('overview');
    setTab('overview');
  }, []);

  const goTo = useCallback((id: SpaceScene, nextTab?: SpaceTab) => {
    setSpaceScene(id);
    setTab(nextTab ?? (id === 'board' ? 'board' : 'overview'));
  }, []);

  const changeTab = (next: SpaceTab) => {
    if (next === 'board') goTo('board');
    else goTo('overview', next);
  };

  useEffect(() => {
    setCenterSlot(
      <div className={styles['spaces__chrome']}>
        <SceneSwitcher
          scenes={ENVIRONMENTS.map((item) => ({
            id: item.id,
            label: item.switchLabel,
          }))}
          activeId={useCase}
          onChange={(id) => selectUseCase(id as UseCaseId)}
          ariaLabel="Use case"
        />
        {environment.compareRollup ? (
          <ViewingAs value={rollup} onChange={setRollup} />
        ) : null}
      </div>,
    );
    return () => setCenterSlot(null);
  }, [
    useCase,
    rollup,
    environment.compareRollup,
    selectUseCase,
    setCenterSlot,
  ]);

  const sidebar = (
    <SpacesSidebar
      key={environment.id}
      environment={environment}
      leak={leak}
      active={space ? `space:${space.id}` : 'home'}
      onHome={() => setSpaceId(null)}
      onOpenSpace={openSpace}
    />
  );

  const viewingAsReid = Boolean(space) && spaceScene === 'decision';
  const user = viewingAsReid ? PEOPLE.areid! : ME;

  const body = space ? (
    <>
      <SpaceHeader
        health={spaceHealth(story)}
        lifecycle="Active"
        tab={tab}
        onTabChange={changeTab}
        boardCount={story.tasks.filter((task) => task.status !== 'done').length}
        aside={
          viewingAsReid ? <Chip size="small">Viewing as Alex Reid</Chip> : null
        }
      />
      {spaceScene === 'overview' ? (
        <OverviewScene
          story={story}
          onStoryChange={updateStory}
          onOpenDecision={() => goTo('decision')}
          onOpenBoard={() => goTo('board')}
          showPages={tab === 'pages'}
        />
      ) : null}
      {spaceScene === 'board' ? (
        <BoardScene story={story} onStoryChange={updateStory} />
      ) : null}
      {spaceScene === 'decision' ? (
        <DecisionScene story={story} onStoryChange={updateStory} />
      ) : null}
    </>
  ) : (
    <DayScene
      environment={environment}
      rollup={environment.compareRollup ? rollup : 'safe'}
      onOpenSpace={openSpace}
    />
  );

  return (
    <div className={styles['spaces__stage']}>
      <div className={styles['spaces__frame']}>
        <ChannelShell
          channelsSidebar={sidebar}
          userAvatarSrc={user.avatar}
          userAvatarAlt={user.name}
          innerContent={<div className={styles['spaces']}>{body}</div>}
        />
      </div>
    </div>
  );
}
