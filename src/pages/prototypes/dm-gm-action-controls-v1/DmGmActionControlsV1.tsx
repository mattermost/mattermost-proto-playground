// [AI DRAFT] DM/GM Action Controls v1 — development handoff copy.
//
// Forked from the exploration prototype (`dm-gm-action-controls`) on
// 2026-10-08 as Direction A "Extend in place" with inline recipient
// conditions. Direction and variation are fixed; this copy is trimmed
// independently toward what ships. `?scene=` and `?screen=` still deep-link.
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import AcvcScreenNav from '../action-controls-view-channel/components/AcvcScreenNav';
import {
  DEFAULT_SCENE,
  SCENES,
  sceneFromParam,
  screensFor,
  type DirectionId,
  type SceneId,
  type VariantId,
} from './dmgmScenes';
import AuthoringScene from './scenes/AuthoringScene';
import BlockedStartScene from './scenes/BlockedStartScene';
import HiddenScene from './scenes/HiddenScene';
import ReadOnlyScene from './scenes/ReadOnlyScene';
import SimulateScene from './scenes/SimulateScene';
import styles from './DmGmActionControls.module.scss';

/** Fixed for the handoff copy: A "Extend in place", inline recipient conditions. */
const direction: DirectionId = 'a';
const variant: VariantId = 'inline';

export default function DmGmActionControlsV1() {
  const [searchParams, setSearchParams] = useSearchParams();
  const scene: SceneId =
    sceneFromParam(searchParams.get('scene')) ?? DEFAULT_SCENE;
  const screens = screensFor(scene, direction, variant);
  const screenParam = searchParams.get('screen');
  const screen = screens.some((s) => s.id === screenParam)
    ? (screenParam as string)
    : screens[0].id;

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      setSearchParams(next, { replace: true });
    },
    [setSearchParams],
  );

  const sceneKey = `${direction}-${variant}-${scene}-${screen}`;
  const goToScreen = useCallback(
    (id: string) => update({ screen: id }),
    [update],
  );
  const sceneProps = { direction, variant, screen, onScreenChange: goToScreen };

  return (
    <div className={styles['dmgm']}>
      <div className={styles['dmgm__nav']}>
        <SceneSwitcher
          scenes={SCENES}
          activeId={scene}
          onChange={(id) => update({ scene: id, screen: null })}
          ariaLabel="Prototype scene"
        />
      </div>
      <AcvcScreenNav
        screens={screens}
        activeId={screen}
        onChange={(id) => update({ screen: id })}
        ariaLabel="Scene screen"
      />
      {scene === 'authoring' && (
        <AuthoringScene key={sceneKey} {...sceneProps} />
      )}
      {scene === 'simulate' && <SimulateScene key={sceneKey} {...sceneProps} />}
      {scene === 'start' && (
        <BlockedStartScene key={sceneKey} {...sceneProps} />
      )}
      {scene === 'readonly' && <ReadOnlyScene key={sceneKey} {...sceneProps} />}
      {scene === 'hidden' && <HiddenScene key={sceneKey} {...sceneProps} />}
    </div>
  );
}
