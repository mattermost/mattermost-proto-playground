// [AI DRAFT] Pair Simulate: the shipped "Simulate access" modal extended with an
// "Other person" field and two directional rows per pair.
//
// Shared by both directions. Direction B adds the two-arrow pair card at the
// top (the who-messages-whom one-way view, reused as a component), the
// starting rule's suggested pair, and "Add a third person" for the group verdict.
import { useEffect, useRef, useState } from 'react';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { Select } from '@mattermost/compass-ui/components/select';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import ToneChip from '../../simulate-access/components/ToneChip';
import { PEOPLE, personById, type Person } from '../dmgmData';
import type { DirectionId } from '../dmgmScenes';
import {
  DM_PERMISSIONS,
  DM_PERMISSION_ORDER,
  TRUSTED_SESSION,
  evaluate,
  layerLabel,
  type DmPermission,
  type DmPolicy,
  type Verdict,
} from '../policyModel';
import styles from './PairSimulateModal.module.scss';

export interface PairSimulateModalProps {
  direction: DirectionId;
  policy: DmPolicy;
  initialActingId: string;
  initialOtherId: string;
  initialThirdId?: string;
  onClose?: () => void;
}

const SHORT_LABEL: Record<DmPermission, string> = {
  start: 'Start',
  post: 'Post',
  view: 'View',
};

function personOption(p: Person) {
  const suffix =
    p.kind === 'bot'
      ? ' (bot)'
      : p.kind === 'remote'
        ? ` (${p.remoteServer ?? 'connected server'})`
        : '';
  return {
    value: p.id,
    label: `${p.name}${suffix}`,
    secondaryLabel: `@${p.username}`,
  };
}

function PersonAvatar({
  person,
  size = '24',
}: {
  person: Person;
  size?: '20' | '24' | '32';
}) {
  return (
    <UserAvatar
      size={size}
      src={person.avatarSrc}
      alt={person.name}
      name={person.name}
    />
  );
}

function VerdictChip({ verdict }: { verdict: Verdict }) {
  return verdict.allowed ? (
    <ToneChip size="small" tone="success" leadingIcon={<CheckCircleIcon />}>
      Allowed
    </ToneChip>
  ) : (
    <ToneChip size="small" tone="danger" leadingIcon={<CloseCircleIcon />}>
      Denied
    </ToneChip>
  );
}

function firstName(p: Person) {
  return p.name.split(' ')[0];
}

interface DirectionalRow {
  from: Person;
  to: Person;
  verdicts: Record<DmPermission, Verdict>;
}

function rowFor(policy: DmPolicy, from: Person, to: Person): DirectionalRow {
  const verdicts = Object.fromEntries(
    DM_PERMISSION_ORDER.map((p) => [
      p,
      evaluate([policy], p, from, TRUSTED_SESSION, [to]),
    ]),
  ) as Record<DmPermission, Verdict>;
  return { from, to, verdicts };
}

function decidingLayer(row: DirectionalRow): string {
  const denied = DM_PERMISSION_ORDER.find((p) => !row.verdicts[p].allowed);
  return denied ? layerLabel(row.verdicts[denied].layer) : 'All layers allow';
}

function sameVerdicts(a: DirectionalRow, b: DirectionalRow) {
  return DM_PERMISSION_ORDER.every(
    (p) => a.verdicts[p].allowed === b.verdicts[p].allowed,
  );
}

/** Direction B: one sentence per direction for the policy's first permission. */
function PairCard({
  forward,
  reverse,
  policy,
}: {
  forward: DirectionalRow;
  reverse: DirectionalRow;
  policy: DmPolicy;
}) {
  const perm =
    DM_PERMISSION_ORDER.find((p) => policy.permissions.includes(p)) ?? 'start';
  const verb =
    perm === 'start'
      ? 'start a DM with'
      : perm === 'post'
        ? 'post to'
        : 'see DMs with';
  const line = (row: DirectionalRow) =>
    `${firstName(row.from)} ${row.verdicts[perm].allowed ? 'can' : "can't"} ${verb} ${firstName(row.to)}.`;
  const oneWay = !sameVerdicts(forward, reverse);

  const arrow = (row: DirectionalRow) => (
    <div className={styles['pair-sim__arrow-row']}>
      <PersonAvatar person={row.from} />
      <span className={styles['pair-sim__arrow-name']}>{row.from.name}</span>
      <span
        className={[
          styles['pair-sim__arrow'],
          row.verdicts[perm].allowed
            ? styles['pair-sim__arrow--allow']
            : styles['pair-sim__arrow--deny'],
        ].join(' ')}
      >
        <Icon glyph={<ArrowRightIcon />} size="20" />
        <span className={styles['pair-sim__arrow-label']}>
          {row.verdicts[perm].allowed
            ? `Can ${SHORT_LABEL[perm].toLowerCase()}`
            : `Can't ${SHORT_LABEL[perm].toLowerCase()}`}
        </span>
      </span>
      <PersonAvatar person={row.to} />
      <span className={styles['pair-sim__arrow-name']}>{row.to.name}</span>
    </div>
  );

  return (
    <section className={styles['pair-sim__card']} aria-label="Pair result">
      {arrow(forward)}
      {arrow(reverse)}
      <p className={styles['pair-sim__sentence']}>
        {line(forward)} {line(reverse)}{' '}
        {oneWay ? <strong>One-way.</strong> : <strong>Same both ways.</strong>}
      </p>
    </section>
  );
}

export default function PairSimulateModal({
  direction,
  policy,
  initialActingId,
  initialOtherId,
  initialThirdId,
  onClose,
}: PairSimulateModalProps) {
  const [actingId, setActingId] = useState(initialActingId);
  const [otherId, setOtherId] = useState(initialOtherId);
  const [thirdId, setThirdId] = useState<string | undefined>(initialThirdId);
  const groupRef = useRef<HTMLDivElement>(null);

  // Opening with a third person: bring the group verdicts into view inside the
  // dialog's own scroll region (never the page).
  useEffect(() => {
    if (!initialThirdId) return;
    // Nearest ancestor that actually scrolls (the dialog body).
    let node = groupRef.current?.parentElement ?? null;
    while (node && node.scrollHeight <= node.clientHeight + 1) {
      node = node.parentElement;
    }
    if (node && node.closest('[role="dialog"], [class*="modal"]')) {
      node.scrollTop = node.scrollHeight;
    }
  }, [initialThirdId]);
  const acting = personById(actingId);
  const other = personById(otherId);
  const forward = rowFor(policy, acting, other);
  const reverse = rowFor(policy, other, acting);
  const oneWay = !sameVerdicts(forward, reverse);

  // Bots and remote users can be the other person but never the acting user here
  // (bot subjects arrive with the separate bot-attributes feature).
  const actingOptions = PEOPLE.filter(
    (p) => p.kind === 'user' && p.id !== otherId,
  ).map(personOption);
  const otherOptions = PEOPLE.filter((p) => p.id !== actingId).map(
    personOption,
  );
  const third = thirdId ? personById(thirdId) : undefined;
  const group = third ? [acting, other, third] : [];

  return (
    <Modal
      size="large"
      className={styles['pair-sim__modal']}
      title="Simulate access"
      subtitle="Pick two people to check every direct and group message permission in both directions."
      headerDivider={false}
      onClose={onClose}
      footer={
        <Button emphasis="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className={styles['pair-sim']}>
        {direction === 'b' ? (
          <p className={styles['pair-sim__suggestion']}>
            Suggested by the starting rule: pick a contractor and a program
            lead.
          </p>
        ) : null}

        <div className={styles['pair-sim__pickers']}>
          <Select
            label="Acting user"
            aria-label="Acting user"
            className={styles['pair-sim__picker']}
            options={actingOptions}
            value={actingId}
            onChange={setActingId}
          />
          <span className={styles['pair-sim__picker-arrow']} aria-hidden>
            <Icon glyph={<ArrowRightIcon />} size="20" />
          </span>
          <Select
            label="Other person"
            aria-label="Other person"
            className={styles['pair-sim__picker']}
            options={otherOptions}
            value={otherId}
            onChange={setOtherId}
          />
        </div>

        {direction === 'b' ? (
          <PairCard forward={forward} reverse={reverse} policy={policy} />
        ) : null}

        <div className={styles['pair-sim__table-wrap']}>
          <table className={styles['pair-sim__table']}>
            <thead>
              <tr>
                <th>
                  <span className={styles['pair-sim__th-direction']}>
                    Direction
                    {oneWay ? (
                      <Tag label="One-way" type="warning" size="small" />
                    ) : null}
                  </span>
                </th>
                {DM_PERMISSION_ORDER.map((p) => (
                  <th key={p} title={DM_PERMISSIONS[p].label}>
                    {SHORT_LABEL[p]}
                  </th>
                ))}
                <th>Deciding layer</th>
              </tr>
            </thead>
            <tbody>
              {[forward, reverse].map((row) => (
                <tr key={`${row.from.id}-${row.to.id}`}>
                  <td>
                    <span className={styles['pair-sim__direction']}>
                      {row.from.name}
                      <Icon glyph={<ArrowRightIcon />} size="16" />
                      {row.to.name}
                      {row.to.kind === 'bot' ? (
                        <Tag label="BOT" casing="all-caps" />
                      ) : null}
                      {row.to.kind === 'remote' ? (
                        <Tag label="Remote" type="default" />
                      ) : null}
                    </span>
                  </td>
                  {DM_PERMISSION_ORDER.map((p) => (
                    <td key={p}>
                      {policy.permissions.includes(p) ? (
                        <VerdictChip verdict={row.verdicts[p]} />
                      ) : (
                        <span className={styles['pair-sim__na']}>
                          Not in policy
                        </span>
                      )}
                    </td>
                  ))}
                  <td className={styles['pair-sim__layer']}>
                    {decidingLayer(row)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {direction === 'b' ? (
          <div className={styles['pair-sim__group']} ref={groupRef}>
            {third ? (
              <>
                <div className={styles['pair-sim__group-head']}>
                  <h3 className={styles['pair-sim__group-title']}>
                    Group message
                  </h3>
                  <Select
                    aria-label="Third person"
                    size="small"
                    className={styles['pair-sim__group-picker']}
                    options={PEOPLE.filter(
                      (p) => p.id !== actingId && p.id !== otherId,
                    ).map(personOption)}
                    value={third.id}
                    onChange={setThirdId}
                  />
                  <Button
                    emphasis="tertiary"
                    size="small"
                    onClick={() => setThirdId(undefined)}
                  >
                    Remove
                  </Button>
                </div>
                <p className={styles['pair-sim__group-hint']}>
                  Every member is checked against every other member when a
                  group message is started.
                </p>
                <ul className={styles['pair-sim__group-list']}>
                  {group.map((member) => {
                    const others = group.filter((g) => g.id !== member.id);
                    const v = evaluate(
                      [policy],
                      'start',
                      member,
                      TRUSTED_SESSION,
                      others,
                    );
                    return (
                      <li
                        key={member.id}
                        className={styles['pair-sim__group-row']}
                      >
                        <PersonAvatar person={member} size="20" />
                        <span className={styles['pair-sim__group-name']}>
                          {member.name}
                        </span>
                        <span className={styles['pair-sim__group-verdict']}>
                          {member.kind === 'user' ? (
                            <>
                              <VerdictChip verdict={v} />
                              <span className={styles['pair-sim__layer']}>
                                {v.allowed
                                  ? 'Can start this group'
                                  : layerLabel(v.layer)}
                              </span>
                            </>
                          ) : (
                            <span className={styles['pair-sim__na']}>
                              Not evaluated as acting user
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <Button
                emphasis="tertiary"
                size="small"
                leadingIcon={<Icon glyph={<AccountPlusOutlineIcon />} />}
                onClick={() =>
                  setThirdId(
                    PEOPLE.find(
                      (p) =>
                        p.kind === 'user' &&
                        p.id !== actingId &&
                        p.id !== otherId,
                    )?.id,
                  )
                }
              >
                Add a third person
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
