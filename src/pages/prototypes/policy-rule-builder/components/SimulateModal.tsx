// [AI DRAFT] "Simulate rules" (locked label) with a per-rule trace (intake Q8,
// ideation 04 §1.5).
//
// The admin picks the action, the user, the recipient(s) and the resources the
// action touches. The verdict follows the locked behaviour: each recipient is
// checked separately, a rule with no value fails, and a When card whose
// condition isn't met "doesn't apply". "Swap" checks the other direction, and
// "Both directions" lays every pair out as a grid (graft from E, 04 §6).
import { useMemo, useState, type ReactNode } from 'react';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import HelpCircleOutlineIcon from '@mattermost/compass-icons/components/help-circle-outline';
import MinusCircleOutlineIcon from '@mattermost/compass-icons/components/minus-circle-outline';
import SwapIcon from '@mattermost/compass-icons/components/sync';
import { Button } from '@mattermost/compass-ui/components/button';
import { Combobox } from '@mattermost/compass-ui/components/combobox';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Select } from '@mattermost/compass-ui/components/select';
import { Tabs } from '@mattermost/compass-ui/components/tabs';
import { Tag } from '@mattermost/compass-ui/components/tag';
import type { ResourceKind } from '../model/catalog';
import {
  simulate,
  type Outcome,
  type SimContext,
  type Trace,
} from '../model/evaluate';
import { PEOPLE, RESOURCES, personById, type Person } from '../model/fixtures';
import { ruleText } from '../model/format';
import {
  permissionDef,
  supplies,
  type PermissionId,
} from '../model/permissions';
import { partiesInUse, prune, type Group, type RoleId } from '../model/rules';
import type { Vocabulary } from '../model/vocabulary';
import { GROUPS, JOIN, SIMULATE, WHEN } from '../copy';
import styles from './SimulateModal.module.scss';

export interface SimulateModalProps {
  root: Group;
  /** The policy's role: Simulate offers only accounts it applies to (QA-17). */
  role: RoleId;
  permissions: PermissionId[];
  vocab: Vocabulary;
  onClose: () => void;
  initial?: {
    permission?: PermissionId;
    user?: string;
    recipients?: string[];
    resources?: Partial<Record<ResourceKind, string>>;
    view?: 'trace' | 'pairs';
  };
}

const OUTCOME_ICON: Record<Outcome, ReactNode> = {
  pass: <CheckCircleIcon />,
  fail: <CloseCircleIcon />,
  missing: <HelpCircleOutlineIcon />,
  'n/a': <MinusCircleOutlineIcon />,
};

const OUTCOME_LABEL: Record<Outcome, string> = {
  pass: SIMULATE.pass,
  fail: SIMULATE.fail,
  missing: SIMULATE.missing,
  'n/a': SIMULATE.na,
};

const modifier = (o: Outcome) => (o === 'n/a' ? 'na' : o);

/** A list or group with a missing value fails, like its rule (CON2-5). */
const listOutcome = (o: Outcome) =>
  o === 'missing' ? OUTCOME_LABEL.fail : OUTCOME_LABEL[o];

function TraceRows({
  trace,
  vocab,
  depth = 0,
  joined = false,
  n,
}: {
  trace: Trace;
  vocab: Vocabulary;
  depth?: number;
  /** A group after other rules reads "Or, all of these", as in the editor. */
  joined?: boolean;
  n?: number;
}) {
  if (trace.kind === 'rule') {
    const hasValues =
      trace.leftValue !== undefined || trace.rightValue !== undefined;
    return (
      <li
        className={`${styles['simulate__row']} ${styles[`simulate__row--${modifier(trace.outcome)}`]}`}
      >
        <Icon glyph={OUTCOME_ICON[trace.outcome]} size="16" />
        <div className={styles['simulate__row-body']}>
          <span className={styles['simulate__row-rule']}>
            {ruleText(trace.rule, vocab)}
          </span>
          <span className={styles['simulate__row-meta']}>
            {trace.outcome === 'missing'
              ? SIMULATE.missingFails
              : OUTCOME_LABEL[trace.outcome]}
            {trace.outcome === 'missing' || !hasValues
              ? ''
              : trace.rule.right.kind === 'attr'
                ? trace.leftValue === undefined &&
                  trace.rightValue === undefined
                  ? ''
                  : ` · ${trace.leftValue ?? SIMULATE.missing} vs ${trace.rightValue ?? SIMULATE.missing}`
                : ` · ${SIMULATE.actual(trace.leftValue)}`}
          </span>
        </div>
      </li>
    );
  }
  if (trace.kind === 'when') {
    // "When" says whether the card applies; "Then require" carries the result (UX-3, VIS-7).
    const whenLabel = !trace.applies
      ? SIMULATE.doesntApply
      : trace.when.outcome === 'missing'
        ? WHEN.missingChecked
        : SIMULATE.applies;
    return (
      <li className={styles['simulate__group']}>
        <span className={styles['simulate__group-label']}>
          {WHEN.when} · {whenLabel}
        </span>
        <ul className={styles['simulate__list']}>
          {trace.when.children.map((c, i) => (
            <TraceRows
              key={`w${i}`}
              trace={c}
              vocab={vocab}
              depth={depth + 1}
            />
          ))}
        </ul>
        {trace.then ? (
          <>
            <span className={styles['simulate__group-label']}>
              {WHEN.then} · {OUTCOME_LABEL[trace.then.outcome]}
            </span>
            <ul className={styles['simulate__list']}>
              {trace.then.children.map((c, i) => (
                <TraceRows
                  key={`t${i}`}
                  trace={c}
                  vocab={vocab}
                  depth={depth + 1}
                />
              ))}
            </ul>
          </>
        ) : null}
      </li>
    );
  }
  if (depth === 0) {
    // Numbered as in the editor once there are two groups (CON2-5).
    const groupCount = trace.children.filter((c) => c.kind === 'group').length;
    let groupIndex = 0;
    // Open with how the list combines, so "three Failed" reads as "none of
    // the alternatives passed" (CON1, CUX1-9, QA1-12).
    return (
      <>
        {trace.children.length > 1 ? (
          <li className={styles['simulate__root']}>
            {JOIN.root[trace.group.join]} · {listOutcome(trace.outcome)}
          </li>
        ) : null}
        {trace.children.map((c, i) => (
          <TraceRows
            key={i}
            trace={c}
            vocab={vocab}
            depth={1}
            joined={i > 0}
            n={
              groupCount > 1 && c.kind === 'group'
                ? (groupIndex += 1)
                : undefined
            }
          />
        ))}
      </>
    );
  }
  return (
    <li className={styles['simulate__group']}>
      <span className={styles['simulate__group-label']}>
        {GROUPS.blockLabel(trace.group.join, { joined, n })} ·{' '}
        {listOutcome(trace.outcome)}
      </span>
      <ul className={styles['simulate__list']}>
        {trace.children.map((c, i) => (
          <TraceRows key={i} trace={c} vocab={vocab} depth={depth + 1} />
        ))}
      </ul>
    </li>
  );
}

export default function SimulateModal({
  root: rawRoot,
  role,
  permissions,
  vocab,
  onClose,
  initial,
}: SimulateModalProps) {
  // Rules with no value yet aren't in the CEL, so they aren't simulated (QA-5).
  const root = useMemo(() => prune(rawRoot), [rawRoot]);
  const accounts = PEOPLE.filter((p) =>
    role === 'Bot accounts' ? p.account !== 'Person' : p.account === 'Person',
  );
  const [permission, setPermission] = useState<PermissionId>(
    initial?.permission ?? permissions[0] ?? 'dm_create',
  );
  const [userId, setUserId] = useState(
    initial?.user ?? (role === 'Bot accounts' ? 'readiness-bot' : 'darius'),
  );
  const [recipientIds, setRecipientIds] = useState<string[]>(
    initial?.recipients ?? ['isabella'],
  );
  const [resourceIds, setResourceIds] = useState<
    Partial<Record<ResourceKind, string>>
  >(
    initial?.resources ?? {
      file: 'file-secret',
      post: 'post-secret',
      team: 'team-ashgrove',
    },
  );
  const [view, setView] = useState<'trace' | 'pairs'>(initial?.view ?? 'trace');
  const [network, setNetwork] = useState('Trusted');
  const [device, setDevice] = useState('Managed');

  const hasRecipient = supplies(permission, 'recipient');
  // Session inputs only when a rule uses the session (CUX1-9).
  const usesSession = partiesInUse(root).includes('session');
  const kinds = (['channel', 'dm', 'file', 'post', 'team'] as ResourceKind[]).filter(
    (k) => supplies(permission, k),
  );
  const optionsFor = (kind: ResourceKind) => RESOURCES.filter((r) => r.kind === kind);
  const pick = (kind: ResourceKind) => {
    const options = optionsFor(kind);
    return options.find((o) => o.id === resourceIds[kind]) ?? options[0];
  };
  const resources = Object.fromEntries(
    kinds
      .map((k) => [k, pick(k)] as const)
      .filter(([, r]) => Boolean(r))
      .map(([k, r]) =>
        // A direct or group message has the user plus the recipients picked (QA3-7).
        k === 'dm' && r && hasRecipient
          ? [k, { ...r, attributes: { ...r.attributes, member_count: String(1 + recipientIds.length) } }]
          : [k, r],
      ),
  );

  const run = (user: Person, recipients: Person[]) => {
    const ctx: SimContext = {
      permission,
      user,
      session: { network, device },
      recipients: hasRecipient ? recipients : [],
      resources,
    };
    return simulate(root, ctx);
  };

  // No one to check: ask for a recipient rather than give a verdict (QA1-6).
  const needsPick = hasRecipient && recipientIds.length === 0;
  const verdict = useMemo(
    () => run(personById(userId), recipientIds.map(personById)),
    // run derives from these inputs
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      root,
      permission,
      userId,
      recipientIds,
      resourceIds,
      network,
      device,
    ],
  );

  const everyone = [personById(userId), ...recipientIds.map(personById)];
  // Only accounts the role covers can act; others appear as recipients only (QA2-6).
  const canAct = (p: Person) => accounts.some((a) => a.id === p.id);
  const swappable =
    hasRecipient &&
    recipientIds.length === 1 &&
    canAct(personById(recipientIds[0]));
  // One reason at a time, and none with no recipient picked (QA3-6).
  const swapReason = !hasRecipient || recipientIds.length === 0 || swappable
    ? null
    : recipientIds.length > 1
      ? SIMULATE.swapHint(vocab.noun.recipient)
      : SIMULATE.swapCantAct(personById(recipientIds[0]).name, vocab.noun.user);
  const canPair = hasRecipient && recipientIds.length >= 1;

  return (
    <Modal
      size="large"
      scrollable
      className={styles['simulate__modal']}
      title={SIMULATE.title}
      subtitle={SIMULATE.subtitle}
      onClose={onClose}
      footerType="1-action"
      footer={
        <Button emphasis="tertiary" onClick={onClose}>
          {SIMULATE.close}
        </Button>
      }
    >
      <div className={styles['simulate']}>
        <div className={styles['simulate__inputs']}>
          <Select
            label={SIMULATE.permission}
            value={permission}
            onChange={(v) => setPermission(v as PermissionId)}
            options={permissions.map((p) => ({
              value: p,
              label: permissionDef(p).label,
            }))}
          />
          <Select
            label={vocab.party.user}
            value={userId}
            onChange={(v) => {
              setUserId(v);
              setRecipientIds((ids) => ids.filter((id) => id !== v));
            }}
            options={accounts.map((p) => ({
              value: p.id,
              label: p.name,
              secondaryLabel: p.title,
            }))}
          />
          {hasRecipient ? (
            <>
              <Combobox
                multiple
                label={vocab.party.recipient}
                value={recipientIds}
                onChange={(v) =>
                  setRecipientIds(Array.isArray(v) ? v : v ? [v] : [])
                }
                options={PEOPLE.filter((p) => p.id !== userId).map((p) => ({
                  value: p.id,
                  label: p.name,
                  secondaryLabel: p.title,
                  ...(p.avatarSrc
                    ? { leadingAvatar: { src: p.avatarSrc, alt: '' } }
                    : {}),
                }))}
              />
              <Button
                emphasis="tertiary"
                size="small"
                leadingIcon={<Icon glyph={<SwapIcon />} />}
                aria-disabled={!swappable || undefined}
                aria-describedby={swapReason ? 'prb-swap-hint' : undefined}
                className={!swappable ? styles['simulate__blocked'] : undefined}
                onClick={() => {
                  if (!swappable) return;
                  const other = recipientIds[0];
                  setRecipientIds([userId]);
                  setUserId(other);
                }}
              >
                {SIMULATE.swap(vocab.noun.user, vocab.noun.recipient)}
              </Button>
              {swapReason ? (
                <span id="prb-swap-hint" className={styles['simulate__hint']}>
                  {swapReason}
                </span>
              ) : null}
            </>
          ) : null}
          {usesSession ? (
            <div className={styles['simulate__pair']}>
              <Select
                label={`${vocab.party.session}: ${SIMULATE.network}`}
                value={network}
                onChange={setNetwork}
                options={['Trusted', 'Public'].map((v) => ({
                  value: v,
                  label: v,
                }))}
              />
              <Select
                label={`${vocab.party.session}: ${SIMULATE.device}`}
                value={device}
                onChange={setDevice}
                options={['Managed', 'Unmanaged'].map((v) => ({
                  value: v,
                  label: v,
                }))}
              />
            </div>
          ) : null}
          {kinds.map((kind) => (
            <Select
              key={kind}
              label={vocab.party[kind]}
              value={pick(kind)?.id}
              onChange={(v) => setResourceIds({ ...resourceIds, [kind]: v })}
              options={optionsFor(kind).map((r) => ({
                value: r.id,
                label: r.name,
              }))}
            />
          ))}
        </div>
        <div className={styles['simulate__result']}>
          <Scrollbar className={styles['simulate__scroll']}>
            <div className={styles['simulate__result-inner']}>
              {canPair ? (
                <Tabs
                  activeKey={view}
                  onChange={(k) => setView(k as 'trace' | 'pairs')}
                  tabs={[
                    { key: 'trace', label: SIMULATE.traceTab },
                    { key: 'pairs', label: SIMULATE.pairsTab },
                  ]}
                />
              ) : null}
              {view === 'pairs' && canPair ? (
                <table className={styles['simulate__grid']}>
                  <caption className={styles['simulate__grid-caption']}>
                    {SIMULATE.pairsCaption(
                      vocab.noun.user,
                      vocab.noun.recipient,
                    )}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className={styles['simulate__grid-corner']}>
                        {`${vocab.party.user} ↓ · ${vocab.party.recipient} →`}
                      </th>
                      {everyone.map((p) => (
                        <th key={p.id} scope="col">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {everyone.filter(canAct).map((from) => (
                      <tr key={from.id}>
                        <th scope="row" className={styles['simulate__nowrap']}>
                          {from.name}
                        </th>
                        {everyone.map((to) => {
                          if (to.id === from.id)
                            return (
                              <td key={to.id} aria-label="Same person">
                                —
                              </td>
                            );
                          const v = run(from, [to]);
                          return (
                            <td key={to.id}>
                              <Tag
                                size="x-small"
                                label={
                                  v.allowed
                                    ? SIMULATE.allowed
                                    : SIMULATE.blocked
                                }
                                type={v.allowed ? 'success' : 'danger'}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles['simulate__trace']}>
                  {needsPick ? (
                    <p className={styles['simulate__empty']} role="status">
                      {SIMULATE.pickRecipient(vocab.noun.recipient)}
                    </p>
                  ) : (
                    <>
                      {/* Only the verdict is announced, not the whole trace (QA2-9). */}
                      <div
                        className={styles['simulate__verdict']}
                        aria-live="polite"
                      >
                        <Tag
                          label={
                            verdict.allowed
                              ? SIMULATE.allowed
                              : SIMULATE.blocked
                          }
                          type={verdict.allowed ? 'success' : 'danger'}
                        />
                        <span className={styles['simulate__verdict-text']}>
                          {permissionDef(permission).label}
                        </span>
                      </div>
                      {verdict.perRecipient.length > 1 ? (
                        <ul
                          className={styles['simulate__summary']}
                          aria-label={SIMULATE.summaryLabel(
                            vocab.noun.recipient,
                          )}
                        >
                          {verdict.perRecipient.map((r) => {
                            const ok =
                              r.outcome === 'pass' || r.outcome === 'n/a';
                            return (
                              <li key={r.recipient?.id}>
                                <span>{r.recipient?.name}</span>
                                <Tag
                                  size="x-small"
                                  label={
                                    ok ? SIMULATE.allowed : SIMULATE.blocked
                                  }
                                  type={ok ? 'success' : 'danger'}
                                />
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                      {[...verdict.perRecipient]
                        .sort(
                          (x, y) =>
                            Number(
                              x.outcome === 'pass' || x.outcome === 'n/a',
                            ) -
                            Number(y.outcome === 'pass' || y.outcome === 'n/a'),
                        )
                        .map((r, i) => (
                          <section
                            key={r.recipient?.id ?? i}
                            className={styles['simulate__run']}
                          >
                            {r.recipient ? (
                              <h3 className={styles['simulate__run-title']}>
                                {SIMULATE.perRecipient(r.recipient.name)}
                                <span
                                  className={
                                    styles[
                                      `simulate__run-outcome--${modifier(r.outcome)}`
                                    ]
                                  }
                                >
                                  {' · '}
                                  {r.outcome === 'pass' || r.outcome === 'n/a'
                                    ? SIMULATE.allowed
                                    : SIMULATE.blocked}
                                </span>
                              </h3>
                            ) : null}
                            <ul className={styles['simulate__list']}>
                              <TraceRows trace={r.trace} vocab={vocab} />
                            </ul>
                          </section>
                        ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </Scrollbar>
        </div>
      </div>
    </Modal>
  );
}
