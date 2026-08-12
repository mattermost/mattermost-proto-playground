import { useState } from 'react';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Icon from '@/components/ui/Icon/Icon';
import Message from '@/components/ui/Message/Message';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Modal from '@/components/ui/Modal/Modal';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Select from '@/components/ui/Select/Select';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  conflictingChildIds,
  isWithin,
  optionLabel,
  valuesAtOrBelow,
  valuesContaining,
  type ValueScheme,
} from '../boundsModel';
import {
  CHANNEL,
  CHANNEL_VALUE,
  CONFLICT_TARGET,
  SEED_POSTS,
  SYSTEM_LABEL,
  SYSTEM_VALUE,
  type SeedPost,
} from '../seedData';
import {
  CLEAR_ACTION,
  CONFLICT_CHECK_ACTION,
  CONFLICT_PROPOSAL_NOTE,
  CONFLICT_RESOLVED_TITLE,
  UNRESOLVABLE_EMPTY_TITLE,
  channelCurrentTitle,
  channelDirectionExplainer,
  channelLowerToggleHelp,
  channelLowerToggleLabel,
  conflictConsequenceNote,
  conflictDetail,
  conflictKeepActionLabel,
  conflictResolveActionLabel,
  conflictResolvedDetail,
  conflictRowSubtitle,
  conflictTitle,
  noun,
  unresolvableDetail,
  unresolvableEmptyDetail,
  unresolvableNotNoLimit,
  unresolvableTitle,
} from '../copy';
import type { StateKey } from '../urlState';
import CapChain, { type CapChainLink } from './CapChain';
import ProtoNote, { ProtoNoteList, ProtoNoteText } from './ProtoNote';
import ValueChip from './ValueChip';
import ValueLadder from './ValueLadder';
import styles from './ChannelSettingsSurface.module.scss';

export interface ChannelSettingsSurfaceProps {
  scheme: ValueScheme;
  state: StateKey;
  showDemoExtras: boolean;
}

/**
 * Surface 2 — the channel's own value: capped by the system value, and itself
 * the cap for every post inside it.
 *
 * Two rules meet here:
 *
 *  • RAISE, NEVER LOWER. The picker offers only values that still contain the
 *    channel's current value, so nothing already inside the channel can fall
 *    outside as a side effect. The ladder beside it shows the whole list and
 *    gives every unavailable value a reason, because an admin needs to see the
 *    direction of travel.
 *
 *  • WHAT IF IT DROPS ANYWAY. Lowering is reachable through an explicit
 *    disclosure, and that path runs a conflict check first. See the design
 *    proposal note — the backend behaviour here is NOT settled.
 */
export default function ChannelSettingsSurface({
  scheme,
  state,
  showDemoExtras,
}: ChannelSettingsSurfaceProps) {
  const capUnresolved = state === 'cap-unresolved';
  const currentId = CHANNEL_VALUE[scheme.key];
  const systemId = capUnresolved ? null : SYSTEM_VALUE[scheme.key];

  /**
   * The channel's own cap is the system value. Fail-closed applies here too: no
   * system value means no options at all, not "anything goes".
   */
  const withinSystem = systemId ? valuesAtOrBelow(scheme, systemId) : [];
  const allowedIds = systemId
    ? valuesContaining(scheme, currentId).filter((id) =>
        withinSystem.includes(id),
      )
    : [];

  const notOfferedIds = scheme.displayOrder.filter(
    (id) =>
      !allowedIds.includes(id) &&
      (systemId ? isWithin(scheme, systemId, id) : false),
  );

  const seedConflict = state === 'conflict';
  const seedTarget = CONFLICT_TARGET[scheme.key];

  const [selectedId, setSelectedId] = useState(currentId);
  const [lowerOpen, setLowerOpen] = useState(seedConflict);
  const [lowerTarget, setLowerTarget] = useState(
    seedConflict ? seedTarget : (notOfferedIds[0] ?? ''),
  );
  const [checkedTarget, setCheckedTarget] = useState<string | null>(
    seedConflict ? seedTarget : null,
  );
  const [resolvedPostIds, setResolvedPostIds] = useState<string[]>([]);

  const [seedKey, setSeedKey] = useState(`${state}:${scheme.key}`);
  if (seedKey !== `${state}:${scheme.key}`) {
    setSeedKey(`${state}:${scheme.key}`);
    setSelectedId(currentId);
    setLowerOpen(seedConflict);
    setLowerTarget(seedConflict ? seedTarget : (notOfferedIds[0] ?? ''));
    setCheckedTarget(seedConflict ? seedTarget : null);
    setResolvedPostIds([]);
  }

  const conflicts: SeedPost[] = checkedTarget
    ? conflictingChildIds(
        scheme,
        SEED_POSTS.map((p) => ({ ...p, storedValueId: p.stored[scheme.key] })),
        checkedTarget,
      ).filter((p) => !resolvedPostIds.includes(p.id))
    : [];

  const chainLinks: CapChainLink[] = [
    {
      label: 'Posts in this channel',
      valueId: null,
      unresolvedText: `≤ ${optionLabel(scheme, currentId)}`,
      // Not a fault: posts have many values, all capped by the channel.
      unresolvedTone: 'muted',
    },
    {
      label: CHANNEL.handle,
      valueId: currentId,
      current: true,
    },
    {
      label: SYSTEM_LABEL,
      valueId: systemId,
      unresolvedText: 'Could not resolve',
      cap: true,
    },
  ];

  /**
   * What Save would actually do. The lower path takes priority once it has been
   * checked, because that is the change the admin is mid-way through: blocked
   * while any post is outside the target, saveable once each one is resolved.
   */
  const pendingTargetId = checkedTarget ?? selectedId;
  const blocked = conflicts.length > 0;
  const hasChange = pendingTargetId !== currentId;
  const footerStatus = blocked
    ? conflictTitle(scheme, conflicts.length, checkedTarget!)
    : hasChange
      ? `Will set ${CHANNEL.handle} to ${optionLabel(scheme, pendingTargetId)}.`
      : 'No changes to save.';

  const modal = (
    <Modal
      size="Large"
      title="Channel Settings"
      subtitle={`${CHANNEL.handle} · ${scheme.fieldLabel}`}
      footer={
        <div className={styles['channel-surface__modal-footer']}>
          <span className={styles['channel-surface__footer-status']}>
            {footerStatus}
          </span>
          <Button emphasis="Tertiary" size="Medium">
            Cancel
          </Button>
          <Button
            emphasis="Primary"
            size="Medium"
            disabled={blocked || !hasChange}
          >
            Save
          </Button>
        </div>
      }
    >
      <div className={styles['channel-surface__body']}>
        <CapChain
          scheme={scheme}
          links={chainLinks}
          showChannelIsCapNote={!capUnresolved}
        />

        {capUnresolved ? (
          <SectionNotice
            type="Danger"
            icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
            title={unresolvableTitle(scheme)}
            description={
              <span className={styles['channel-surface__notice-body']}>
                <span>
                  {unresolvableDetail(
                    scheme,
                    SYSTEM_LABEL,
                    'no-reference-value',
                    'channel',
                  )}
                </span>
                <span>{unresolvableNotNoLimit(scheme)}</span>
                <span className={styles['channel-surface__notice-strong']}>
                  {`${UNRESOLVABLE_EMPTY_TITLE} — ${unresolvableEmptyDetail(scheme, SYSTEM_LABEL)}`}
                </span>
              </span>
            }
          />
        ) : (
          <section className={styles['channel-surface__section']}>
            <div className={styles['channel-surface__section-head']}>
              <span className={styles['channel-surface__section-title']}>
                {channelCurrentTitle(scheme, CHANNEL.handle, currentId)}
              </span>
              <ValueChip scheme={scheme} valueId={currentId} size="Small" />
            </div>
            <span className={styles['channel-surface__section-text']}>
              {channelDirectionExplainer(scheme, currentId, allowedIds)}
            </span>

            <div className={styles['channel-surface__split']}>
              <label className={styles['channel-surface__field']}>
                <span className={styles['channel-surface__field-label']}>
                  {scheme.fieldLabel}
                </span>
                <Select
                  size="Medium"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {allowedIds.map((id) => (
                    <option key={id} value={id}>
                      {optionLabel(scheme, id)}
                      {id === currentId ? ' (current)' : ''}
                    </option>
                  ))}
                </Select>
              </label>

              <ValueLadder
                scheme={scheme}
                currentId={currentId}
                allowedIds={allowedIds}
                systemCapId={systemId}
                className={styles['channel-surface__ladder']}
              />
            </div>
          </section>
        )}

        {!capUnresolved && (
          <section className={styles['channel-surface__section']}>
            <button
              type="button"
              className={styles['channel-surface__disclosure']}
              onClick={() => setLowerOpen((open) => !open)}
              aria-expanded={lowerOpen}
            >
              <Icon
                size="16"
                glyph={lowerOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
              />
              {channelLowerToggleLabel(scheme)}
            </button>

            {lowerOpen && (
              <div className={styles['channel-surface__disclosure-body']}>
                <span className={styles['channel-surface__section-text']}>
                  {channelLowerToggleHelp(scheme)}
                </span>

                <div className={styles['channel-surface__check-row']}>
                  <label className={styles['channel-surface__field']}>
                    <span className={styles['channel-surface__field-label']}>
                      {`Proposed ${noun(scheme)}`}
                    </span>
                    <Select
                      size="Medium"
                      value={lowerTarget}
                      onChange={(e) => {
                        setLowerTarget(e.target.value);
                        setCheckedTarget(null);
                        setResolvedPostIds([]);
                      }}
                    >
                      {notOfferedIds.map((id) => (
                        <option key={id} value={id}>
                          {optionLabel(scheme, id)}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <Button
                    emphasis="Secondary"
                    size="Medium"
                    onClick={() => {
                      setCheckedTarget(lowerTarget);
                      setResolvedPostIds([]);
                    }}
                    disabled={!lowerTarget}
                  >
                    {CONFLICT_CHECK_ACTION}
                  </Button>
                </div>

                {checkedTarget && conflicts.length > 0 && (
                  <>
                    <SectionNotice
                      type="Danger"
                      icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                      title={conflictTitle(
                        scheme,
                        conflicts.length,
                        checkedTarget,
                      )}
                      description={
                        <span
                          className={styles['channel-surface__notice-body']}
                        >
                          <span>
                            {conflictDetail(
                              scheme,
                              CHANNEL.handle,
                              conflicts.length,
                              checkedTarget,
                            )}
                          </span>
                          <span
                            className={styles['channel-surface__notice-strong']}
                          >
                            {conflictConsequenceNote(scheme, checkedTarget)}
                          </span>
                        </span>
                      }
                      secondaryButtonLabel={conflictKeepActionLabel(
                        scheme,
                        currentId,
                      )}
                      onSecondaryAction={() => {
                        setCheckedTarget(null);
                        setLowerOpen(false);
                        setResolvedPostIds([]);
                      }}
                    />

                    <ul className={styles['channel-surface__conflicts']}>
                      {conflicts.map((post) => (
                        <li
                          key={post.id}
                          className={styles['channel-surface__conflict']}
                        >
                          <UserAvatar
                            src={post.avatarSrc}
                            alt={post.author}
                            size="32"
                          />
                          <div
                            className={styles['channel-surface__conflict-text']}
                          >
                            <span
                              className={
                                styles['channel-surface__conflict-meta']
                              }
                            >
                              {conflictRowSubtitle(
                                scheme,
                                post.author,
                                post.timestamp,
                              )}
                            </span>
                            <span
                              className={
                                styles['channel-surface__conflict-body']
                              }
                            >
                              {post.text}
                            </span>
                          </div>
                          <ValueChip
                            scheme={scheme}
                            valueId={post.stored[scheme.key]}
                            size="Small"
                          />
                          <div
                            className={
                              styles['channel-surface__conflict-actions']
                            }
                          >
                            <Button
                              emphasis="Tertiary"
                              size="Small"
                              onClick={() =>
                                setResolvedPostIds((ids) => [...ids, post.id])
                              }
                            >
                              {conflictResolveActionLabel(
                                scheme,
                                checkedTarget,
                              )}
                            </Button>
                            <Button
                              emphasis="Tertiary"
                              size="Small"
                              destructive
                              onClick={() =>
                                setResolvedPostIds((ids) => [...ids, post.id])
                              }
                            >
                              {CLEAR_ACTION}
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {checkedTarget && conflicts.length === 0 && (
                  <SectionNotice
                    type="Success"
                    icon={<Icon size="20" glyph={<CheckCircleOutlineIcon />} />}
                    title={CONFLICT_RESOLVED_TITLE}
                    description={conflictResolvedDetail(
                      scheme,
                      CHANNEL.handle,
                      checkedTarget,
                    )}
                  />
                )}

                {showDemoExtras && (
                  <ProtoNote heading={CONFLICT_PROPOSAL_NOTE.heading}>
                    <ProtoNoteText strong>
                      {CONFLICT_PROPOSAL_NOTE.recommendation}
                    </ProtoNoteText>
                    <ProtoNoteText>Alternatives and why not:</ProtoNoteText>
                    <ProtoNoteList items={CONFLICT_PROPOSAL_NOTE.rejected} />
                    <ProtoNoteText>
                      {CONFLICT_PROPOSAL_NOTE.status}
                    </ProtoNoteText>
                  </ProtoNote>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </Modal>
  );

  return (
    <div className={styles['channel-surface']}>
      <ChannelShell
        userAvatarSrc={avatarLeonard}
        userAvatarAlt="Leonard Riley"
        channelHeader={
          <ChannelHeader
            type="Channel"
            name={CHANNEL.name}
            description={CHANNEL.description}
            memberCount={CHANNEL.memberCount}
            pinnedCount={CHANNEL.pinnedCount}
          />
        }
        innerPanelOverlay={modal}
      >
        <>
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbars>
              <div className={shellStyles['channel-shell__messages-list']}>
                <MessageSeparator type="Date" label="Today" />
                {SEED_POSTS.slice(0, 4).map((post) => (
                  <Message
                    key={post.id}
                    avatarSrc={post.avatarSrc}
                    avatarAlt={post.author}
                    username={post.author}
                    timestamp={post.timestamp}
                  >
                    <p className={shellStyles['channel-shell__post-text']}>
                      {post.text}
                    </p>
                  </Message>
                ))}
              </div>
            </Scrollbars>
          </div>
        </>
      </ChannelShell>
    </div>
  );
}
