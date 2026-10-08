// [AI DRAFT] Scene 1 — authoring. The only scene where the directions (B / A)
// and the variations (inline conditions / separate card) differ.
import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BLANK_ID,
  PoliciesListPage,
  StartingRuleChooser,
} from '../components/AddPolicyFlow';
import DmgmConsoleFrame from '../components/DmgmConsoleFrame';
import DmgmStage from '../components/DmgmStage';
import PairSimulateModal from '../components/PairSimulateModal';
import PolicyEditor from '../components/PolicyEditor';
import ServerAttributesControl from '../components/ServerAttributesControl';
import SummaryStrip from '../components/SummaryStrip';
import {
  ACTING_LABEL,
  ACTING_NOUN,
  EDITOR,
  MATCH,
  TARGET_LABEL,
  TARGET_NOUN,
  actingAttr,
  COMPARISON,
} from '../copy';
import {
  ATTRIBUTE_INVENTORIES,
  DARIUS,
  ISABELLA,
  inventoryFromParam,
  type InventoryId,
} from '../dmgmData';
import type { DirectionId, VariantId } from '../dmgmScenes';
import {
  FEATURED_RULE_ID,
  blankPolicy,
  generateStartingRules,
  nextConditionId,
  ruleById,
  type DmPolicy,
} from '../policyModel';
import { ENGINE_NOTE } from './sceneNotes';

export interface SceneProps {
  direction: DirectionId;
  variant: VariantId;
  screen: string;
  onScreenChange?: (id: string) => void;
}

type ScrollTarget = 'acting' | 'permissions' | 'other';

/** B's chosen rule survives moving between sub-screens (each one remounts). */
const bMemory: { ruleId: string } = { ruleId: 'same-program' };

function policyFromMemory(): DmPolicy {
  return bMemory.ruleId === BLANK_ID
    ? blankPolicy()
    : ruleById(bMemory.ruleId).build();
}

function featuredPolicy(name?: string): DmPolicy {
  const built = ruleById(FEATURED_RULE_ID).build();
  return name ? { ...built, name } : built;
}

/**
 * Direction A, "Policy configured": two AND rows, one per subject.
 * Inline: the comparison is written from the User side
 * (user.attributes.program == target.attributes.program), to show that a
 * comparison works in either direction. Card: the recipient row sits in the
 * separate card, compared with the user's Program (card-only behaviour).
 */
function aConfiguredPolicy(variant: VariantId): DmPolicy {
  return {
    name: 'Same program on trusted networks',
    role: 'Members',
    permissions: ['start', 'post'],
    acting: [
      {
        id: nextConditionId(),
        attribute: 'Network',
        operator: 'is',
        value: 'Trusted',
      },
      ...(variant === 'inline'
        ? [
            {
              id: nextConditionId(),
              attribute: 'Program' as const,
              operator: 'is' as const,
              value: '',
              compareTo: 'Program' as const,
            },
          ]
        : []),
    ],
    other:
      variant === 'inline'
        ? []
        : [
            {
              id: nextConditionId(),
              attribute: 'Program',
              operator: 'is',
              value: { kind: 'same' },
            },
          ],
    match: 'all',
  };
}

function EditorWithSimulate({
  direction,
  variant,
  initialPolicy,
  initialPickerOpen = false,
  startedFrom,
  scrollTo,
}: {
  direction: DirectionId;
  variant: VariantId;
  initialPolicy: DmPolicy;
  initialPickerOpen?: boolean;
  startedFrom?: string;
  scrollTo?: ScrollTarget;
}) {
  const [policy, setPolicy] = useState(initialPolicy);
  const [edited, setEdited] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const summary: ReactNode =
    direction === 'b' ? (
      <SummaryStrip policy={policy} startedFrom={startedFrom} edited={edited} />
    ) : undefined;

  return (
    <DmgmConsoleFrame
      overlay={
        simulating ? (
          <PairSimulateModal
            direction={direction}
            policy={policy}
            initialActingId={DARIUS.id}
            initialOtherId={ISABELLA.id}
            onClose={() => setSimulating(false)}
          />
        ) : undefined
      }
    >
      <PolicyEditor
        policy={policy}
        onChange={(next) => {
          setPolicy(next);
          setEdited(true);
        }}
        summary={summary}
        variant={variant}
        initialPickerOpen={initialPickerOpen}
        onSimulate={() => setSimulating(true)}
        scrollTo={scrollTo}
      />
    </DmgmConsoleFrame>
  );
}

const VARIANT_NOTE: Record<VariantId, string> = {
  inline: `Variation: inline conditions (primary). Conditions on the ${TARGET_NOUN} are rows in the same requirements table as the ${ACTING_NOUN}. Each row names its subject. The table header joins all rows with “${MATCH.all}” (default) or “${MATCH.any}”.`,
  card: `Variation: separate card (secondary). Conditions on the ${TARGET_NOUN} sit in their own “${EDITOR.targetCardTitle}” card, which appears once a direct or group message permission is added. The same “${MATCH.all}” / “${MATCH.any}” join covers both tables.`,
};

function Note({
  children,
  variant,
}: {
  children: ReactNode;
  variant: VariantId;
}) {
  return (
    <>
      {children}
      <p>{VARIANT_NOTE[variant]}</p>
      <p>{ENGINE_NOTE}</p>
    </>
  );
}

function BlockedNote({ variant }: { variant: VariantId }) {
  return (
    <Note variant={variant}>
      <p>
        The <strong>+ Add permission</strong> menu is open, grouped as Files,
        Channels, and Direct and Group Messages. While the policy has{' '}
        {TARGET_NOUN} conditions, the Files and Channels rows are disabled and a
        line under each heading says why. Direct and group message permissions
        can still be added. Designer decision: keep this block for now.
      </p>
    </Note>
  );
}

const BLOCKED_TITLE = `File and channel permissions are blocked while the policy has ${TARGET_NOUN} conditions`;

function oneWayNote(direction: DirectionId) {
  return (
    <p>
      &ldquo;Contractors can&apos;t start DMs with program leads&rdquo; allows a
      start when the {ACTING_NOUN} is not a contractor <em>or</em> the{' '}
      {TARGET_NOUN} is not a program lead. It is written in Simple mode as two
      rows joined with <strong>{MATCH.any}</strong>.{' '}
      <strong>Switch to Advanced Mode</strong> shows the same rule as{' '}
      <code>
        user.attributes.employment_type != &quot;Contractor&quot; ||
        target.attributes.position != &quot;Program lead&quot;
      </code>
      .{' '}
      {direction === 'b'
        ? 'The Rule summary says what it means in words and tags it One way.'
        : 'Nothing on the page restates the rule in words or says it applies one way; the admin finds that out in Simulate rules.'}
    </p>
  );
}

function BAuthoring({ screen, variant, onScreenChange }: SceneProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const inventory = inventoryFromParam(searchParams.get('server'));
  const rules = generateStartingRules(
    ATTRIBUTE_INVENTORIES[inventory].attributes,
  );
  const [ruleId, setRuleId] = useState(
    rules.some((r) => r.id === bMemory.ruleId)
      ? bMemory.ruleId
      : (rules[0]?.id ?? BLANK_ID),
  );

  const setInventory = (id: InventoryId) => {
    const next = new URLSearchParams(window.location.search);
    next.set('server', id);
    setSearchParams(next, { replace: true });
    const available = generateStartingRules(
      ATTRIBUTE_INVENTORIES[id].attributes,
    );
    const keep = available.some((r) => r.id === ruleId)
      ? ruleId
      : (available[0]?.id ?? BLANK_ID);
    setRuleId(keep);
    bMemory.ruleId = keep;
  };

  if (screen === 'gallery') {
    return (
      <DmgmStage
        title="Starting rules are generated from this server's attributes"
        note={
          <Note variant={variant}>
            <p>
              <strong>Add policy</strong> lists only the rules this
              server&apos;s attributes can fully support, named with the
              server&apos;s own attribute names and values. Each card says which
              attributes it uses, so the admin can check the match in place.
              Rules that can&apos;t be matched are not shown at all.{' '}
              <strong>Continue</strong> opens the pre-filled editor; there is no
              mapping step. <strong>Blank policy</strong> is always offered.
              Switch the demo server above to watch the list change.
            </p>
            <p>
              Engineering must define how templates match attributes. The
              prototype uses a small explicit table.
            </p>
          </Note>
        }
        controls={
          <ServerAttributesControl value={inventory} onChange={setInventory} />
        }
      >
        <DmgmConsoleFrame
          overlay={
            <StartingRuleChooser
              rules={rules}
              selected={ruleId}
              onSelect={(id) => {
                setRuleId(id);
                bMemory.ruleId = id;
              }}
              onContinue={() => onScreenChange?.('editor')}
            />
          }
        >
          <PoliciesListPage />
        </DmgmConsoleFrame>
      </DmgmStage>
    );
  }

  if (screen === 'one-way') {
    return (
      <DmgmStage
        title="The one-way rule opens in Simple mode, joined with Any, and the summary explains it"
        note={<Note variant={variant}>{oneWayNote('b')}</Note>}
      >
        <EditorWithSimulate
          direction="b"
          variant={variant}
          initialPolicy={featuredPolicy()}
          startedFrom={ruleById(FEATURED_RULE_ID).name}
          scrollTo="acting"
        />
      </DmgmStage>
    );
  }

  const startedFrom =
    bMemory.ruleId === BLANK_ID ? undefined : ruleById(bMemory.ruleId).name;
  const blocked = screen === 'blocked';
  return (
    <DmgmStage
      title={
        blocked
          ? BLOCKED_TITLE
          : "The full editor, pre-filled from the rule, with a summary that's rewritten after every edit"
      }
      note={
        blocked ? (
          <BlockedNote variant={variant} />
        ) : (
          <Note variant={variant}>
            <p>
              The same editor as Direction A, filled in from the chosen rule
              with this server&apos;s attributes. The{' '}
              <strong>Rule summary</strong> stays pinned while the admin
              scrolls. It is generated from the current conditions, never from
              the rule&apos;s name. Change an operator, a value or the All / Any
              join and the sentence and direction tag update, and &ldquo;Started
              from&rdquo; becomes <strong>Edited</strong>.
            </p>
          </Note>
        )
      }
    >
      <EditorWithSimulate
        direction="b"
        variant={variant}
        initialPolicy={policyFromMemory()}
        initialPickerOpen={blocked}
        startedFrom={startedFrom}
        scrollTo={blocked ? 'permissions' : 'acting'}
      />
    </DmgmStage>
  );
}

function AAuthoring({ screen, variant }: SceneProps) {
  if (screen === 'picker') {
    return (
      <DmgmStage
        title="Add permission groups permissions as Files, Channels, and Direct and Group Messages"
        note={
          <Note variant={variant}>
            <p>
              The shipped editor is unchanged except for the menu. Files come
              first because they apply to channels and to direct and group
              messages alike. The three direct and group message permissions sit
              under their own heading. The group headings are the one structural
              change. Labels and descriptions are draft copy.
            </p>
          </Note>
        }
      >
        <EditorWithSimulate
          direction="a"
          variant={variant}
          initialPolicy={{
            ...blankPolicy(),
            name: 'Contractor messaging limits',
          }}
          initialPickerOpen
          scrollTo="permissions"
        />
      </DmgmStage>
    );
  }

  if (screen === 'one-way') {
    return (
      <DmgmStage
        title="The admin builds the one-way rule by hand in Simple mode, joined with Any"
        note={<Note variant={variant}>{oneWayNote('a')}</Note>}
      >
        <EditorWithSimulate
          direction="a"
          variant={variant}
          initialPolicy={featuredPolicy('Contractor messaging limits')}
          scrollTo="acting"
        />
      </DmgmStage>
    );
  }

  const blocked = screen === 'blocked';
  const inline = variant === 'inline';
  return (
    <DmgmStage
      title={
        blocked
          ? BLOCKED_TITLE
          : inline
            ? `A ${ACTING_NOUN} row can compare with the ${TARGET_NOUN}, joined with ${MATCH.all}`
            : `The ${TARGET_NOUN} row sits in its own card, joined with ${MATCH.all}`
      }
      note={
        blocked ? (
          <BlockedNote variant={variant} />
        ) : (
          <Note variant={variant}>
            <p>
              {inline ? (
                <>
                  Two {ACTING_LABEL} rows. Network is Trusted, and Program{' '}
                  {COMPARISON.isSameAs} {TARGET_LABEL} · Program, a comparison
                  written from the {ACTING_NOUN} side. A row of either subject
                  can compare with an attribute of the other subject, defaulting
                  to the same-named one. Advanced mode shows{' '}
                  <code>
                    user.session.network == &quot;Trusted&quot; &amp;&amp;
                    user.attributes.program == target.attributes.program
                  </code>
                  . Session rows can&apos;t compare, and session attributes are
                  never offered for the {TARGET_NOUN}.
                </>
              ) : (
                <>
                  Two rows, one per subject. {ACTING_LABEL}: Network is Trusted.{' '}
                  {TARGET_LABEL}: Program {COMPARISON.isSameAs}{' '}
                  {actingAttr('Program')}, in the separate card. Session
                  attributes are never offered for the {TARGET_NOUN}.
                </>
              )}
            </p>
          </Note>
        )
      }
    >
      <EditorWithSimulate
        direction="a"
        variant={variant}
        initialPolicy={aConfiguredPolicy(variant)}
        initialPickerOpen={blocked}
        scrollTo={blocked ? 'permissions' : 'acting'}
      />
    </DmgmStage>
  );
}

export default function AuthoringScene(props: SceneProps) {
  return props.direction === 'b' ? (
    <BAuthoring {...props} />
  ) : (
    <AAuthoring {...props} />
  );
}
