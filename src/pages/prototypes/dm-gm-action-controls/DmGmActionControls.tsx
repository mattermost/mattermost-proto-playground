// [AI DRAFT] DM/GM Attribute-Based Action Controls — Phase 6 first pass.
//
// One prototype, two carried-forward directions (`?direction=b|a`, default B)
// crossed with two ways of authoring other-person conditions
// (`?variant=inline|card`, default inline). `?scene=` and `?screen=` deep-link
// a scene and sub-screen so every state can be shared or captured by URL.
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select } from '@mattermost/compass-ui/components/select';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import AcvcScreenNav from '../action-controls-view-channel/components/AcvcScreenNav';
import {
  DEFAULT_DIRECTION,
  DEFAULT_SCENE,
  DEFAULT_VARIANT,
  DIRECTIONS,
  SCENES,
  VARIANTS,
  directionFromParam,
  sceneFromParam,
  screensFor,
  variantFromParam,
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

export default function DmGmActionControls() {
  const { setCenterSlot } = usePrototypeChrome();
  const [searchParams, setSearchParams] = useSearchParams();
  const direction: DirectionId =
    directionFromParam(searchParams.get('direction')) ?? DEFAULT_DIRECTION;
  const variant: VariantId =
    variantFromParam(searchParams.get('variant')) ?? DEFAULT_VARIANT;
  const scene: SceneId =
    sceneFromParam(searchParams.get('scene')) ?? DEFAULT_SCENE;
  const screens = screensFor(scene, direction, variant);
  const screenParam = searchParams.get('screen');
  const screen = screens.some((s) => s.id === screenParam)
    ? (screenParam as string)
    : screens[0].id;

  // AppShell clears the centre slot in a `pathname` effect that runs after this
  // child's effect on first mount. Flipping `mounted` re-runs the slot effect one
  // render later, after that reset (same workaround as the Access Channel port).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Normalise the URL so direction and variation are always explicit.
  useEffect(() => {
    if (
      searchParams.get('direction') !== direction ||
      searchParams.get('variant') !== variant
    ) {
      update({ direction, variant });
    }
  }, [direction, variant, searchParams, update]);

  useEffect(() => {
    setCenterSlot(
      <div className={styles['dmgm__chrome']}>
        <SceneSwitcher
          scenes={DIRECTIONS}
          activeId={direction}
          onChange={(id) => update({ direction: id, screen: null })}
          label="Direction"
          ariaLabel="Design direction"
        />
        <span className={styles['dmgm__label']} aria-hidden>
          Variation
        </span>
        <Select
          size="small"
          className={styles['dmgm__variant']}
          aria-label="Variation"
          options={VARIANTS}
          value={variant}
          onChange={(v) => update({ variant: v, screen: null })}
        />
      </div>,
    );
    return () => setCenterSlot(null);
  }, [direction, variant, setCenterSlot, update, mounted]);

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
