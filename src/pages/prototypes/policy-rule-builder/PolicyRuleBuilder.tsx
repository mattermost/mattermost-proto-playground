// [AI DRAFT] Permission Policy rule builder: expands the DM/GM v1 requirements
// table into a rule grammar (User / Recipient / resource × value / attribute,
// AND/OR groups → one CEL expression).
//
// Built from ideation 04 (specs/dm-gm-action-controls/rule-expansion/):
//   A′ "Extend in place" (lead) and B′ "When … then" (contrast), plus the
//   designer's switches: resource selection (permission decides / choose per
//   rule), grouping (flat / one level) and naming (N1–N5).
// v1 (/prototypes/dm-gm-action-controls-v1) is untouched; this is a new route.
// Deep links: ?scene= &screen= &grp= &name= &explain=
// Round 2 (M7): the "Explain" switch tries placements for "What this policy
// does"; today's button is the baseline.
// Archived 2026-10-29 (designer feedback): B′ "When … then", the
// "Permission decides" resource option and, in round 1.2, Group blocks: one
// flat All/Any join, with anything more complex in Advanced mode.
// See specs/…/rule-expansion/archive/.
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select } from '@mattermost/compass-ui/components/select';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import AcvcScreenNav from '../action-controls-view-channel/components/AcvcScreenNav';
import { EXPLAIN_PLACEMENTS, explainPlacementFromParam } from './components/explanation';
import type { GroupingMode } from './model/celParse';
import {
  VOCABULARIES,
  VOCABULARY_ORDER,
  vocabularyFromParam,
} from './model/vocabulary';
import { SCENES, SCREENS, sceneFromParam } from './scenes';
import ScreenView from './scenes/ScreenView';
import styles from './PolicyRuleBuilder.module.scss';

export default function PolicyRuleBuilder() {
  const [params, setParams] = useSearchParams();
  const scene = sceneFromParam(params.get('scene'));
  const screens = SCREENS[scene];
  const screen = screens.find((s) => s.id === params.get('screen')) ?? screens[0];
  // Flat only (round 1.2); `grp` is ignored.
  const grouping: GroupingMode = 'flat';
  const vocabulary = vocabularyFromParam(params.get('name'));
  const explainPlacement = explainPlacementFromParam(params.get('explain'));

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(window.location.search);
      for (const [k, v] of Object.entries(patch)) {
        if (v === null) next.delete(k);
        else next.set(k, v);
      }
      setParams(next, { replace: true });
    },
    [setParams],
  );

  const key = [scene, screen.id, grouping, vocabulary, explainPlacement].join('-');

  return (
    <div className={styles['prb']}>
      <header className={styles['prb__header']}>
        <div className={styles['prb__header-bar']}>
          <SceneSwitcher
            scenes={SCENES}
            activeId={scene}
            onChange={(id) => update({ scene: id, screen: null })}
            ariaLabel="Prototype scene"
          />
          <div className={styles['prb__options']} aria-label="Prototype options">
            <span className={styles['prb__label']}>Naming</span>
            <Select
              className={styles['prb__variant']}
              size="small"
              aria-label="Naming"
              value={vocabulary}
              onChange={(v) => update({ name: v })}
              options={VOCABULARY_ORDER.map((id) => ({ value: id, label: VOCABULARIES[id].label }))}
            />
            <span className={styles['prb__label']}>Explain</span>
            <Select
              className={styles['prb__variant']}
              size="small"
              aria-label="Where the explanation sits"
              value={explainPlacement}
              onChange={(v) => update({ explain: v })}
              options={EXPLAIN_PLACEMENTS}
            />
          </div>
        </div>
        <div className={styles['prb__screen']}>
          <h2 className={styles['prb__title']}>{screen.title}</h2>
          <p className={styles['prb__note']}>{screen.note(grouping)}</p>
        </div>
        <AcvcScreenNav
          screens={screens}
          activeId={screen.id}
          onChange={(id) => update({ screen: id })}
          ariaLabel="Scene screen"
        />
      </header>
      <div className={styles['prb__stage']}>
        <ScreenView
          key={key}
          screen={screen}
          grouping={grouping}
          vocabulary={vocabulary}
          explainPlacement={explainPlacement}
        />
      </div>
    </div>
  );
}
