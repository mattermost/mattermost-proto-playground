import { useCallback, useEffect, useState } from 'react';
import { ChannelShell } from '@mattermost/compass-proto';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { ViewingAs } from './components/ViewingAs';
import { SpacesSidebar } from './components/SpacesSidebar';
import {
  ENVIRONMENTS,
  environmentById,
  type RollupView,
  type UseCaseId,
} from './environments';
import DayScene from './scenes/DayScene';
import SpaceDetail from './scenes/SpaceDetail';
import { ME } from './spacesData';
import styles from './Spaces.module.scss';

export default function Spaces() {
  const { setCenterSlot } = usePrototypeChrome();
  const [useCase, setUseCase] = useState<UseCaseId>('a');
  const [rollup, setRollup] = useState<RollupView>('safe');
  const [spaceId, setSpaceId] = useState<string | null>(null);

  const environment = environmentById(useCase);
  const space = environment.spaces.find((item) => item.id === spaceId) ?? null;
  const leak = Boolean(environment.compareRollup && rollup === 'leak');

  const selectUseCase = useCallback((id: UseCaseId) => {
    setUseCase(id);
    setRollup('safe');
    setSpaceId(null);
  }, []);

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
      onOpenSpace={setSpaceId}
    />
  );

  const body = space ? (
    <SpaceDetail
      environment={environment}
      space={space}
      rollup={environment.compareRollup ? rollup : 'safe'}
      onOpenSpace={setSpaceId}
    />
  ) : (
    <DayScene
      environment={environment}
      rollup={environment.compareRollup ? rollup : 'safe'}
      onOpenSpace={setSpaceId}
    />
  );

  return (
    <div className={styles['spaces__stage']}>
      <div className={styles['spaces__frame']}>
        <ChannelShell
          channelsSidebar={sidebar}
          userAvatarSrc={ME.avatar}
          userAvatarAlt={ME.name}
          innerContent={<div className={styles['spaces']}>{body}</div>}
        />
      </div>
    </div>
  );
}
