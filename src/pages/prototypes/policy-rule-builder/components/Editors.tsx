// [AI DRAFT] The carried-forward direction, A′ (ideation 04 §7).
// B′ "When … then" was archived on 2026-10-29 (designer feedback F2). Its
// code stays here, compiled but not wired; see specs/…/rule-expansion/archive/.
//
//   A′ "Extend in place": the shipped table, generalized. Directional rules
//      are written as an Any list (S5: three inverted rows).
//   B′ "When … then":    A′'s table verbatim for unconditional rules, plus
//      "When" cards: the admin states the condition and what it requires.
//      Cards are joined with All; CEL is `!(when) || (then)`.
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import {
  group,
  nextId,
  partiesInUse,
  whenReadback,
  type Group,
  type When,
} from '../model/rules';
import { GROUPS, JOIN, WHEN } from '../copy';
import type { SimpleEditorProps } from './PolicyPage';
import RuleTable, { type RuleContext } from './RuleTable';
import styles from './Editors.module.scss';

function contextOf(p: SimpleEditorProps): RuleContext {
  return {
    vocab: p.vocab,
    role: p.policy.role,
    permissions: p.policy.permissions,
    resourceMode: p.resourceMode,
    partiesInUse: partiesInUse(p.policy.root),
    grouping: p.grouping,
    parties: p.parties,
    root: p.policy.root,
  };
}

export function EditorA(props: SimpleEditorProps) {
  if (props.grouping === 'sets') return <SetsEditor {...props} />;
  return (
    <RuleTable
      group={props.policy.root}
      onChange={props.onRootChange}
      ctx={contextOf(props)}
      addMenuOpen={props.addMenuOpen}
      addMenuQuery={props.addMenuQuery}
      valueMenuOpen={props.valueMenuOpen}
      rowMenuOpen={props.rowMenuOpen}
      initialUndo={props.initialUndo}
    />
  );
}

/**
 * Rule sets — archived after grouping-loop iteration 1 (both lenses: it can't
 * show "A and (B or C)" without repeating a rule). Kept, not wired. (feedback F5, grouping option "sets"): each set is a plain table
 * where every rule is required, and sets are joined with Or. This mirrors
 * channel rules (conditions ANDed, rules ORed). One set looks exactly like the
 * shipped table; headers and the Or divider appear from the second set.
 */
function SetsEditor(props: SimpleEditorProps) {
  const ctx = contextOf(props);
  const root = props.policy.root;
  const sets: Group[] =
    root.join === 'all'
      ? [root]
      : root.children.map((c) =>
          c.kind === 'group' ? c : { kind: 'group', id: `set-${c.id}`, join: 'all', children: [c] },
        );
  const rebuild = (next: Group[]) => {
    const kept = next.filter((g, i) => g.children.length > 0 || i === 0);
    if (kept.length <= 1) {
      props.onRootChange({ ...root, join: 'all', children: kept[0]?.children ?? [] });
      return;
    }
    props.onRootChange({
      ...root,
      join: 'any',
      children: kept.map((g) => (g.children.length === 1 ? g.children[0] : { ...g, join: 'all' })),
    });
  };
  const multiple = sets.length > 1;
  return (
    <div className={styles['editors']}>
      {sets.map((set, i) => (
        <div key={set.id}>
          {i > 0 ? <p className={styles['editors__or']}>{GROUPS.or_divider}</p> : null}
          {multiple ? (
            <div className={styles['editors__set-head']}>
              <span>
                {GROUPS.setLabel(i + 1)} · {GROUPS.setHelp}
              </span>
              <IconButton
                size="small"
                destructive
                icon={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
                aria-label={GROUPS.removeSet(i + 1)}
                onClick={() => rebuild(sets.filter((x) => x.id !== set.id))}
              />
            </div>
          ) : null}
          <RuleTable
            group={{ ...set, join: 'all' }}
            ctx={{ ...ctx, grouping: 'flat' }}
            hideJoin
            noGroups
            ariaLabel={GROUPS.setLabel(i + 1)}
            addMenuOpen={i === 0 && props.addMenuOpen}
            valueMenuOpen={i === 0 && props.valueMenuOpen}
            onChange={(next) => rebuild(sets.map((x) => (x.id === set.id ? next : x)))}
            footerExtra={
              i === sets.length - 1 ? (
                <Button
                  emphasis="tertiary"
                  size="small"
                  onClick={() => rebuild([...sets, group('all', [])].map((g) => g))}
                >
                  {GROUPS.addSet}
                </Button>
              ) : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}

function WhenCard({
  node,
  index,
  ctx,
  onChange,
  onRemove,
  showSentence,
}: {
  node: When;
  index: number;
  ctx: RuleContext;
  onChange: (next: When) => void;
  onRemove: () => void;
  /** Per-card sentence, only when several cards make the main readback long. */
  showSentence: boolean;
}) {
  const sentence = showSentence ? whenReadback(node, ctx.vocab) : '';
  return (
    <section className={styles['editors__card']} aria-label={`When rule ${index + 1}`}>
      <div className={styles['editors__card-head']}>
        <h4 className={styles['editors__card-title']}>{WHEN.when}</h4>
        <IconButton
          size="small"
          destructive
          className={styles['editors__card-remove']}
          icon={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
          aria-label={`${WHEN.remove} ${index + 1}`}
          onClick={onRemove}
        />
      </div>
      <RuleTable
        group={node.when}
        ctx={ctx}
        noGroups
        joinLocked={WHEN.whenLocked}
        emptyText={WHEN.emptyWhen}
        ariaLabel={`${WHEN.when}: ${JOIN.root.all}`}
        onChange={(next) => onChange({ ...node, when: { ...next, join: 'all' } })}
      />
      <h4 className={styles['editors__card-title']}>{WHEN.then}</h4>
      <RuleTable
        group={node.then}
        ctx={ctx}
        emptyText={WHEN.emptyThen}
        ariaLabel={`${WHEN.then}: ${JOIN.root[node.then.join]}`}
        onChange={(next) => onChange({ ...node, then: next })}
      />
      {!node.when.children.length || !node.then.children.length ? (
        <p className={styles['editors__card-error']} role="note">
          {WHEN.incomplete}
        </p>
      ) : sentence ? (
        <p className={styles['editors__card-readback']}>{sentence}</p>
      ) : null}
    </section>
  );
}

export function EditorB(props: SimpleEditorProps) {
  const ctx = contextOf(props);
  const root = props.policy.root;
  const cards = root.children.filter((c): c is When => c.kind === 'when');
  const setRoot = (next: Group) => props.onRootChange(next);

  const plainCount = root.children.filter((c) => c.kind !== 'when').length;
  // When rules combine with All. Adding one to an Any list would silently turn
  // "or" into "and", so it waits until the list is All (QA2-11).
  const cardBlocked = root.join === 'any' && plainCount > 1;
  const addCard = () =>
    setRoot({
      ...root,
      join: 'all',
      children: [
        ...root.children,
        {
          kind: 'when',
          id: nextId('w'),
          when: group('all', []),
          then: group('all', []),
        },
      ],
    });

  return (
    <div className={styles['editors']}>
      <RuleTable
        group={root}
        ctx={ctx}
        joinLocked={cards.length > 0 ? JOIN.lockedReason : undefined}
        addMenuOpen={props.addMenuOpen}
        valueMenuOpen={props.valueMenuOpen}
        emptyText={cards.length > 0 ? WHEN.emptyAlways : undefined}
        onChange={setRoot}
        footerExtra={
          <>
            <Button
              emphasis="tertiary"
              size="small"
              aria-disabled={cardBlocked || undefined}
              aria-describedby={cardBlocked ? 'prb-when-hint' : undefined}
              className={cardBlocked ? styles['editors__blocked'] : undefined}
              onClick={() => {
                if (!cardBlocked) addCard();
              }}
            >
              {WHEN.add}
            </Button>
            {cardBlocked ? (
              <span id="prb-when-hint" className={styles['editors__hint']}>
                {WHEN.addBlocked}
              </span>
            ) : null}
          </>
        }
      />
      {cards.length > 0 ? <p className={styles['editors__connector']}>{WHEN.connector}</p> : null}
      {cards.map((card, i) => (
        <WhenCard
          key={card.id}
          node={card}
          index={i}
          ctx={ctx}
          showSentence={cards.length > 1}
          onChange={(next) =>
            setRoot({
              ...root,
              children: root.children.map((c) => (c.id === card.id ? next : c)),
            })
          }
          onRemove={() =>
            setRoot({ ...root, children: root.children.filter((c) => c.id !== card.id) })
          }
        />
      ))}
    </div>
  );
}
