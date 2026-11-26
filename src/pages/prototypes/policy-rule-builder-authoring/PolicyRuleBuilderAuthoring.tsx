// [AI DRAFT] Authoring-only variation of the Permission Policy rule builder.
// Same editor as /prototypes/policy-rule-builder, without:
//   - Create with AI
//   - the "What this policy does" card
//   - save confirmation updates
//   - advanced-mode editor updates (Simple | Advanced stays; the field is the expression)
//   - simulate dialog updates (the Simulate rules button stays)
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select } from '@mattermost/compass-ui/components/select';
import AcvcScreenNav from '../action-controls-view-channel/components/AcvcScreenNav';
import {
  VOCABULARIES,
  VOCABULARY_ORDER,
  vocabularyFromParam,
} from '../policy-rule-builder/model/vocabulary';
import { SCREENS } from '../policy-rule-builder/scenes';
import ScreenView from '../policy-rule-builder/scenes/ScreenView';
import styles from '../policy-rule-builder/PolicyRuleBuilder.module.scss';

const SCREENS_AUTHORING = SCREENS.authoring;

export default function PolicyRuleBuilderAuthoring() {
  const [params, setParams] = useSearchParams();
  const screen =
    SCREENS_AUTHORING.find((s) => s.id === params.get('screen')) ??
    SCREENS_AUTHORING.find((s) => s.id === 's1') ??
    SCREENS_AUTHORING[0];
  const vocabulary = vocabularyFromParam(params.get('name'));

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

  return (
    <div className={styles['prb']}>
      <header className={styles['prb__header']}>
        <div className={styles['prb__header-bar']}>
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
          </div>
        </div>
        <div className={styles['prb__screen']}>
          <h2 className={styles['prb__title']}>{screen.title}</h2>
          <p className={styles['prb__note']}>
            Authoring layout only. The policy description, Create with AI, the &quot;What this policy does&quot; card, and the save, advanced, and simulate updates are not in this variation.
          </p>
        </div>
        <AcvcScreenNav
          screens={SCREENS_AUTHORING}
          activeId={screen.id}
          onChange={(id) => update({ screen: id })}
          ariaLabel="Authoring screen"
        />
      </header>
      <div className={styles['prb__stage']}>
        <ScreenView
          key={[screen.id, vocabulary].join('-')}
          screen={screen}
          grouping="flat"
          vocabulary={vocabulary}
          explainPlacement="rail"
          authoringOnly
        />
      </div>
    </div>
  );
}
