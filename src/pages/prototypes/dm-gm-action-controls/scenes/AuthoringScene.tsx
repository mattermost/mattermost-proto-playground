// [AI DRAFT] Scene 1 — authoring. The only scene where the directions (B / A)
// and the variations (inline conditions / separate card) differ.
import { useState, type ReactNode } from 'react';
import {
  BLANK_ID,
  MappingStep,
  PoliciesListPage,
  StartingRuleChooser,
} from '../components/AddPolicyFlow';
import DmgmConsoleFrame from '../components/DmgmConsoleFrame';
import DmgmStage from '../components/DmgmStage';
import PairSimulateModal from '../components/PairSimulateModal';
import PolicyEditor from '../components/PolicyEditor';
import SummaryStrip from '../components/SummaryStrip';
import { ISABELLA, DARIUS } from '../dmgmData';
import type { DirectionId, VariantId } from '../dmgmScenes';
import {
  FEATURED_RULE_ID,
  blankPolicy,
  isMappingComplete,
  nextConditionId,
  ruleById,
  type DmPolicy,
  type Mapping,
} from '../policyModel';
import {
  ACTING_LABEL,
  ACTING_NOUN,
  COMPARISON,
  EDITOR,
  TARGET_LABEL,
  TARGET_NOUN,
  actingAttr,
} from '../copy';
import { ENGINE_NOTE } from './sceneNotes';

export interface SceneProps {
  direction: DirectionId;
  variant: VariantId;
  screen: string;
  onScreenChange?: (id: string) => void;
}

type ScrollTarget = 'acting' | 'permissions' | 'other';

/**
 * B's chooser and mapping choices survive moving between sub-screens (each
 * sub-screen remounts the scene), so "Continue" lands on the editor with the
 * rule the reviewer actually picked and mapped. Kept per variation.
 *
 * Inline opens on "Same program only" because it is a single AND row; the
 * one-way rule needs OR, which inline Simple mode can't express (see the
 * "One-way rule (Advanced)" screen).
 */
const bMemory: Record<VariantId, { ruleId: string; mapping: Mapping }> = {
  inline: { ruleId: 'same-program', mapping: {} },
  card: {
    ruleId: FEATURED_RULE_ID,
    // Half-mapped, so the mapping screen opens with "Open in editor" still blocked.
    mapping: { employment: 'Employment type', contractor: 'Contractor' },
  },
};

function policyFromMemory(variant: VariantId): DmPolicy {
  const memory = bMemory[variant];
  if (memory.ruleId === BLANK_ID) {
    return blankPolicy();
  }
  const rule = ruleById(memory.ruleId);
  return rule.build(
    isMappingComplete(rule, memory.mapping) ? memory.mapping : rule.canonical,
  );
}

function featuredPolicy(name?: string): DmPolicy {
  const rule = ruleById(FEATURED_RULE_ID);
  const built = rule.build(rule.canonical);
  return name ? { ...built, name } : built;
}

/** Direction A, card variation: the one-way rule built by hand in two tables. */
function aCardPolicy(): DmPolicy {
  return {
    name: 'Contractor messaging limits',
    role: 'Members',
    permissions: ['start'],
    acting: [
      {
        id: nextConditionId(),
        attribute: 'Employment type',
        operator: 'is not',
        value: 'Contractor',
      },
    ],
    other: [
      {
        id: nextConditionId(),
        attribute: 'Position',
        operator: 'is not',
        value: { kind: 'fixed', value: 'Program lead' },
      },
    ],
    match: 'any',
  };
}

/**
 * Direction A, inline variation: two AND rows, one per subject. The designer's
 * examples: a same-as comparison (user.attributes.program ==
 * target.attributes.program) combined with an acting-user row.
 */
function aInlinePolicy(): DmPolicy {
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
    ],
    other: [
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
  inline: `Variation: inline conditions (primary). Conditions on the ${TARGET_NOUN} are rows in the same requirements table as the ${ACTING_NOUN}. Each row names its subject. Rows are joined with AND, as shipped.`,
  card: `Variation: separate card (secondary). Conditions on the ${TARGET_NOUN} sit in their own “${EDITOR.targetCardTitle}” card, which appears once a direct or group message permission is added.`,
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
        The <strong>+ Add permission</strong> menu is open. Conditions on the{' '}
        {TARGET_NOUN} mean nothing to channel and file permissions, so those
        rows are disabled and a line in the menu says why. Direct and group
        message permissions can still be added. This inline block is draft
        behaviour for the first pass.
      </p>
    </Note>
  );
}

const BLOCKED_TITLE = `Channel and file permissions are blocked while the policy has conditions on the ${TARGET_NOUN}`;

function BAuthoring({ screen, variant, onScreenChange }: SceneProps) {
  const memory = bMemory[variant];
  const [ruleId, setRuleId] = useState(memory.ruleId);
  const [mapping, setMapping] = useState<Mapping>(memory.mapping);

  if (screen === 'gallery') {
    return (
      <DmgmStage
        title="Add policy offers starting rules for direct and group messages"
        note={
          <Note variant={variant}>
            <p>
              <strong>Add policy</strong> on Permission Policies opens a
              chooser. The five starting rules come first, and{' '}
              <strong>Blank policy</strong> is always offered. Each rule says in
              one line what it does, with tags for its permission and whether it
              applies both ways or one way. Choose a rule and select{' '}
              <strong>Continue</strong>. The catalogue is draft content. No
              admin-workflow interview has checked it yet.
            </p>
          </Note>
        }
      >
        <DmgmConsoleFrame
          overlay={
            <StartingRuleChooser
              selected={ruleId}
              onSelect={(id) => {
                setRuleId(id);
                memory.ruleId = id;
                memory.mapping = {};
                setMapping({});
              }}
              onContinue={() =>
                onScreenChange?.(ruleId === BLANK_ID ? 'editor' : 'mapping')
              }
            />
          }
        >
          <PoliciesListPage />
        </DmgmConsoleFrame>
      </DmgmStage>
    );
  }

  if (screen === 'mapping') {
    const rule = ruleById(ruleId === BLANK_ID ? FEATURED_RULE_ID : ruleId);
    return (
      <DmgmStage
        title="A required step maps the rule to this server's attributes"
        note={
          <Note variant={variant}>
            <p>
              Starting rules refer to attributes by meaning, such as Program, or
              Employment type and its value Contractor. The admin binds each one
              to a real attribute and value. <strong>Open in editor</strong>{' '}
              stays blocked until every one is mapped. Choosing an attribute
              unlocks its value list, and changing an attribute clears the value
              chosen for it.
            </p>
          </Note>
        }
      >
        <DmgmConsoleFrame
          overlay={
            <MappingStep
              rule={rule}
              mapping={mapping}
              onChange={(next) => {
                setMapping(next);
                memory.mapping = next;
              }}
              onBack={() => onScreenChange?.('gallery')}
              onContinue={() => onScreenChange?.('editor')}
            />
          }
        >
          <PoliciesListPage />
        </DmgmConsoleFrame>
      </DmgmStage>
    );
  }

  if (screen === 'advanced') {
    return (
      <DmgmStage
        title="A one-way rule needs OR, so it opens in Advanced mode, and the summary explains it"
        note={
          <Note variant={variant}>
            <p>
              &ldquo;Contractors can&apos;t start DMs with program leads&rdquo;
              allows a start when the {ACTING_NOUN} is not a contractor{' '}
              <em>or</em> the {TARGET_NOUN} is not a program lead. Inline rows
              are joined with AND, so this rule opens as one expression over{' '}
              <code>user.</code> and <code>target.</code>, and Simple mode is
              unavailable. The Rule summary still says what it means in words,
              and that it applies one way.
            </p>
          </Note>
        }
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
    memory.ruleId === BLANK_ID ? undefined : ruleById(memory.ruleId).name;
  const blocked = screen === 'blocked';
  return (
    <DmgmStage
      title={
        blocked
          ? BLOCKED_TITLE
          : "The full editor, pre-filled, with a summary that's rewritten after every edit"
      }
      note={
        blocked ? (
          <BlockedNote variant={variant} />
        ) : (
          <Note variant={variant}>
            <p>
              The same editor as Direction A, filled in from the rule. The{' '}
              <strong>Rule summary</strong> stays pinned while the admin
              scrolls. It is generated from the current conditions, never from
              the rule&apos;s name. Change an operator or value and the sentence
              and direction tag update, and &ldquo;Started from&rdquo; becomes{' '}
              <strong>Edited</strong>. <strong>Simulate rules</strong> opens the
              pair preview.
            </p>
          </Note>
        )
      }
    >
      <EditorWithSimulate
        direction="b"
        variant={variant}
        initialPolicy={policyFromMemory(variant)}
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
        title="Add permission gains a Direct and group messages group"
        note={
          <Note variant={variant}>
            <p>
              The shipped editor is unchanged except for the menu. Three direct
              and group message permissions sit under their own heading,
              separate from Channel Read Access and Channel Write Access. The
              group headings are the one structural change. Labels and
              descriptions are draft copy.
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

  if (screen === 'advanced') {
    return (
      <DmgmStage
        title="A one-way rule needs OR, so the admin writes it in Advanced mode"
        note={
          <Note variant={variant}>
            <p>
              To say &ldquo;contractors can&apos;t start DMs with program
              leads&rdquo;, the admin has to write an OR expression by hand:{' '}
              <code>
                user.attributes.employment_type != &quot;Contractor&quot;
              </code>{' '}
              OR{' '}
              <code>
                target.attributes.position != &quot;Program lead&quot;
              </code>
              . Simple mode can&apos;t show it. Nothing on the page restates the
              rule in words or says it applies one way. The admin finds that out
              only in <strong>Simulate rules</strong>.
            </p>
          </Note>
        }
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
            ? `${TARGET_LABEL} rows sit in the same table, joined with AND`
            : 'The admin builds the one-way rule by hand in two tables'
      }
      note={
        blocked ? (
          <BlockedNote variant={variant} />
        ) : inline ? (
          <Note variant={variant}>
            <p>
              Two rows, one per subject. {ACTING_LABEL}: Network is Trusted.{' '}
              {TARGET_LABEL}: Program {COMPARISON.isSameAs}{' '}
              {actingAttr('Program')}. Add attribute groups the attributes under{' '}
              {ACTING_LABEL}, {EDITOR.actingSessionGroup}, and {TARGET_LABEL}.
              Session attributes are never offered for the {TARGET_NOUN}. Switch
              to Advanced Mode shows the same rule as{' '}
              <code>
                user.session.network == &quot;Trusted&quot; &amp;&amp;
                target.attributes.program == user.attributes.program
              </code>
              .
            </p>
          </Note>
        ) : (
          <Note variant={variant}>
            <p>
              &ldquo;Contractors can&apos;t start DMs with program leads&rdquo;,
              built from blank. {ACTING_LABEL}: Employment type is not
              Contractor. {TARGET_LABEL}: Position is not Program lead. The two
              are joined by <strong>Any condition required</strong>. Nothing
              restates what this means in words or that it applies one way. The
              admin finds that out only by opening{' '}
              <strong>Simulate rules</strong>.
            </p>
          </Note>
        )
      }
    >
      <EditorWithSimulate
        direction="a"
        variant={variant}
        initialPolicy={inline ? aInlinePolicy() : aCardPolicy()}
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
