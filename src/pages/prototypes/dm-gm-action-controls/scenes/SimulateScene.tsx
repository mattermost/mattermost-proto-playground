// [AI DRAFT] Scene 2 — the one-way Simulate preview.
import { useState } from 'react';
import DmgmConsoleFrame from '../components/DmgmConsoleFrame';
import DmgmStage from '../components/DmgmStage';
import PairSimulateModal from '../components/PairSimulateModal';
import PolicyEditor from '../components/PolicyEditor';
import SummaryStrip from '../components/SummaryStrip';
import { ISABELLA, DARIUS, DAVID, READINESS_BOT } from '../dmgmData';
import { FEATURED_RULE_ID, ruleById } from '../policyModel';
import type { SceneProps } from './AuthoringScene';
import { SIMULATE, TARGET_NOUN } from '../copy';
import { ENGINE_NOTE } from './sceneNotes';

const COPY: Record<string, { title: string; b: string; a: string }> = {
  pair: {
    title: 'Simulate shows both directions and labels the one-way result',
    b: 'The pair card leads: Darius Cole, a contractor, can’t start a DM with Isabella Cruz, a program lead, but Isabella can start one with him. The directional rows sit underneath, one per direction, with a verdict for each permission and the deciding layer. Change either person to try other pairs.',
    a: `The shipped Simulate access modal with the ${SIMULATE.targetField} field added. Each pair gives two directional rows, each with Start, Post and View verdicts, a One-way tag when the rows differ, and a Deciding layer column. There is no sentence, so the admin has to read the asymmetry from the pills.`,
  },
  group: {
    title:
      'Adding a third person shows the group-message verdict for each member',
    b: 'Every member is checked against every other member when a group message starts. David Liang can start the group. Darius can’t, because Isabella is a program lead, and the result names the policy that decided it.',
    a: '',
  },
  bot: {
    title: 'A bot without the attribute is denied, and Simulate says why',
    b: `The ${TARGET_NOUN} is the Readiness Alerts integration bot, which has no Position attribute. Darius → bot is denied, and the deciding layer is “${SIMULATE.layerMissingTargetLabel}”. The editor states the same consequence before save, in the note under the ${TARGET_NOUN} conditions.`,
    a: `The ${TARGET_NOUN} is the Readiness Alerts integration bot, which has no Position attribute. Darius → bot is denied, and the deciding layer is “${SIMULATE.layerMissingTargetLabel}”. The editor states the same consequence before save, in the note under the ${TARGET_NOUN} conditions.`,
  },
};

export default function SimulateScene({
  direction,
  variant,
  screen,
}: SceneProps) {
  const rule = ruleById(FEATURED_RULE_ID);
  const [policy, setPolicy] = useState(() => {
    const built = rule.build();
    return direction === 'a'
      ? { ...built, name: 'Contractor messaging limits' }
      : built;
  });
  const [open, setOpen] = useState(true);
  const copy = COPY[screen] ?? COPY.pair;
  const otherId = screen === 'bot' ? READINESS_BOT.id : ISABELLA.id;

  return (
    <DmgmStage
      title={copy.title}
      note={
        <>
          <p>{direction === 'b' ? copy.b : copy.a}</p>
          <p>{ENGINE_NOTE}</p>
        </>
      }
    >
      <DmgmConsoleFrame
        overlay={
          open ? (
            <PairSimulateModal
              direction={direction}
              policy={policy}
              initialActingId={DARIUS.id}
              initialOtherId={otherId}
              initialThirdId={screen === 'group' ? DAVID.id : undefined}
              onClose={() => setOpen(false)}
            />
          ) : undefined
        }
      >
        <PolicyEditor
          policy={policy}
          onChange={setPolicy}
          variant={variant}
          summary={
            direction === 'b' ? (
              <SummaryStrip
                policy={policy}
                startedFrom={rule.name}
                edited={false}
              />
            ) : undefined
          }
          onSimulate={() => setOpen(true)}
        />
      </DmgmConsoleFrame>
    </DmgmStage>
  );
}
