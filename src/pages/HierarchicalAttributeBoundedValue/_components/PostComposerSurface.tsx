import { useCallback, useRef, useState } from 'react';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Icon from '@/components/ui/Icon/Icon';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Message from '@/components/ui/Message/Message';
import MessageInput from '@/components/ui/MessageInput';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  effectiveValue,
  offeredValueIds,
  optionLabel,
  resolvedCap,
  unresolvedCap,
  validateWrite,
  type CapResolution,
  type ValueScheme,
} from '../boundsModel';
import {
  CHANNEL,
  CHANNEL_VALUE,
  EXPLICIT_DRAFT_VALUE,
  OVER_CAP_ATTEMPT,
  SEED_POSTS,
  SYSTEM_LABEL,
  SYSTEM_VALUE,
} from '../seedData';
import {
  CLEAR_ACTION,
  EXPLICIT_BADGE,
  INHERITED_BADGE,
  INHERITED_TITLE,
  REJECTED_GUARD_NOTE,
  REJECTED_PICK_LOWER_ACTION,
  UNRESOLVABLE_ACTION,
  capHeader,
  clearedConfirmation,
  explicitDetail,
  explicitMatchesCapNote,
  inheritedBadgeTooltip,
  inheritedDetail,
  noun,
  rejectedDetail,
  rejectedTitle,
  unresolvableDetail,
  unresolvableEmptyDetail,
  unresolvableNotNoLimit,
  unresolvableTitle,
} from '../copy';
import type { StateKey } from '../urlState';
import BoundedValuePicker from './BoundedValuePicker';
import CapChain from './CapChain';
import HoverHint from './HoverHint';
import ProtoNote, { ProtoNoteText } from './ProtoNote';
import ValueChip from './ValueChip';
import styles from './PostComposerSurface.module.scss';

export interface PostComposerSurfaceProps {
  scheme: ValueScheme;
  state: StateKey;
  /** Prototype-only affordances (the out-of-band write simulator, notes). */
  showDemoExtras: boolean;
  /** Jumps to the channel surface — the fix path for an unresolvable cap. */
  onOpenChannelSurface: () => void;
}

interface Rejection {
  attemptedId: string;
  capId: string;
}

/**
 * Surface 1 — a post composer in a channel that carries a value.
 *
 * The default is INHERITED: nothing is stored on the post, so it shows the
 * channel's value. The marking says so in those words, because the marking is
 * inferred from the absence of a stored value and not from any flag.
 *
 * Setting a value stores one. Going back to inheriting is a CLEAR — there is no
 * revert, so the affordance is a remove action whose copy explains what removal
 * does.
 */
export default function PostComposerSurface({
  scheme,
  state,
  showDemoExtras,
  onOpenChannelSurface,
}: PostComposerSurfaceProps) {
  const capUnresolved = state === 'cap-unresolved';

  const cap: CapResolution = capUnresolved
    ? unresolvedCap('no-reference-value', CHANNEL.handle)
    : resolvedCap(CHANNEL_VALUE[scheme.key], CHANNEL.handle);

  const seedStored =
    state === 'explicit' ? EXPLICIT_DRAFT_VALUE[scheme.key] : null;
  const seedRejection: Rejection | null =
    state === 'rejected'
      ? {
          attemptedId: OVER_CAP_ATTEMPT[scheme.key],
          capId: CHANNEL_VALUE[scheme.key],
        }
      : null;

  const [stored, setStored] = useState<string | null>(seedStored);
  const [rejection, setRejection] = useState<Rejection | null>(seedRejection);
  const [cleared, setCleared] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(
    state === 'graph-cap' || state === 'cap-unresolved',
  );

  // Re-seed when the deep-linked state or scheme changes.
  const [seedKey, setSeedKey] = useState(`${state}:${scheme.key}`);
  if (seedKey !== `${state}:${scheme.key}`) {
    setSeedKey(`${state}:${scheme.key}`);
    setStored(seedStored);
    setRejection(seedRejection);
    setCleared(false);
    setPickerOpen(state === 'graph-cap' || state === 'cap-unresolved');
  }

  const railRef = useRef<HTMLDivElement>(null);
  const closePicker = useCallback(() => setPickerOpen(false), []);
  useOutsideClose(railRef, pickerOpen, closePicker);

  const draft = effectiveValue(stored, 'parent', cap.capId ?? null);
  const offered = offeredValueIds(scheme, cap);

  const handlePick = (valueId: string) => {
    const result = validateWrite(scheme, cap, valueId);
    if (result.ok) {
      setStored(valueId);
      setRejection(null);
      setCleared(false);
      setPickerOpen(false);
      return;
    }
    // Defensive: the picker never offers an invalid value, but the guard runs
    // regardless — that is the whole point of write.value.bounds.
    if (result.kind === 'above-cap' && result.capId) {
      setRejection({ attemptedId: valueId, capId: result.capId });
      setPickerOpen(false);
    }
  };

  const handleClear = () => {
    setStored(null);
    setRejection(null);
    setCleared(true);
    setPickerOpen(false);
  };

  /**
   * Prototype-only: writes a value the picker never offered, exactly as a
   * scripted client or a later edit could. The server rejects it, which is what
   * makes read.option.bounds a convenience rather than a control.
   */
  const simulateOutOfBandWrite = () => {
    const attemptedId = OVER_CAP_ATTEMPT[scheme.key];
    const result = validateWrite(scheme, cap, attemptedId);
    if (!result.ok && result.kind === 'above-cap' && result.capId) {
      setRejection({ attemptedId, capId: result.capId });
      setStored(null);
      setCleared(false);
      setPickerOpen(false);
    }
  };

  const chainLinks = [
    {
      label: 'This post',
      valueId: draft.valueId,
      unresolvedText: `No ${noun(scheme)}`,
      current: true,
    },
    {
      label: CHANNEL.handle,
      valueId: cap.status === 'resolved' ? (cap.capId ?? null) : null,
      unresolvedText: 'Could not resolve',
      cap: true,
    },
    {
      label: SYSTEM_LABEL,
      valueId: SYSTEM_VALUE[scheme.key],
    },
  ];

  return (
    <div className={styles['post-surface']}>
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
      >
        <>
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbars>
              <div className={shellStyles['channel-shell__messages-list']}>
                <CapChain
                  scheme={scheme}
                  links={chainLinks}
                  className={styles['post-surface__chain']}
                />

                <MessageSeparator type="Date" label="Today" />

                {SEED_POSTS.map((post) => {
                  const postStored = post.stored[scheme.key];
                  const resolvedPost = effectiveValue(
                    postStored,
                    'parent',
                    cap.capId ?? null,
                  );
                  const sameAsChannel =
                    postStored != null && postStored === cap.capId;
                  return (
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
                      <div className={styles['post-surface__post-value']}>
                        <ValueChip
                          scheme={scheme}
                          valueId={resolvedPost.valueId}
                          emptyLabel={`No ${noun(scheme)}`}
                          size="Small"
                        />
                        {resolvedPost.derived ? (
                          <HoverHint label={inheritedBadgeTooltip(scheme)}>
                            <span
                              className={styles['post-surface__badge-wrap']}
                            >
                              <LabelTag
                                label={INHERITED_BADGE}
                                type="Default"
                                size="X-Small"
                                leadingIcon={
                                  <Icon size="10" glyph={<LinkVariantIcon />} />
                                }
                              />
                            </span>
                          </HoverHint>
                        ) : (
                          <LabelTag
                            label={EXPLICIT_BADGE}
                            type="Info"
                            size="X-Small"
                          />
                        )}
                        {sameAsChannel && (
                          <span className={styles['post-surface__post-note']}>
                            {explicitMatchesCapNote(CHANNEL.handle)}
                          </span>
                        )}
                      </div>
                    </Message>
                  );
                })}
              </div>
            </Scrollbars>
          </div>

          <div className={styles['post-surface__foot']}>
            {rejection && (
              <SectionNotice
                className={styles['post-surface__notice']}
                type="Danger"
                icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                title={rejectedTitle(scheme, rejection.attemptedId)}
                description={
                  <span className={styles['post-surface__notice-body']}>
                    <span className={styles['post-surface__notice-line']}>
                      {rejectedDetail(
                        scheme,
                        CHANNEL.handle,
                        rejection.capId,
                        rejection.attemptedId,
                      )}
                    </span>
                    <span className={styles['post-surface__notice-guard']}>
                      <Icon size="12" glyph={<ShieldOutlineIcon />} />
                      {REJECTED_GUARD_NOTE}
                    </span>
                  </span>
                }
                primaryButtonLabel={REJECTED_PICK_LOWER_ACTION}
                onPrimaryAction={() => {
                  setRejection(null);
                  setPickerOpen(true);
                }}
                secondaryButtonLabel={CLEAR_ACTION}
                onSecondaryAction={handleClear}
              />
            )}

            {capUnresolved && (
              <SectionNotice
                className={styles['post-surface__notice']}
                type="Danger"
                icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                title={unresolvableTitle(scheme)}
                description={
                  <span className={styles['post-surface__notice-body']}>
                    <span className={styles['post-surface__notice-line']}>
                      {unresolvableDetail(
                        scheme,
                        CHANNEL.handle,
                        cap.reason ?? 'no-reference-value',
                      )}
                    </span>
                    <span className={styles['post-surface__notice-line']}>
                      {unresolvableNotNoLimit(scheme)}
                    </span>
                  </span>
                }
                primaryButtonLabel={UNRESOLVABLE_ACTION}
                onPrimaryAction={onOpenChannelSurface}
              />
            )}

            {cleared && cap.capId && (
              <SectionNotice
                className={styles['post-surface__notice']}
                type="Info"
                icon={<Icon size="20" glyph={<InformationOutlineIcon />} />}
                title={INHERITED_TITLE}
                description={clearedConfirmation(
                  scheme,
                  CHANNEL.handle,
                  cap.capId,
                )}
                onDismiss={() => setCleared(false)}
              />
            )}

            <div className={styles['post-surface__rail']} ref={railRef}>
              <span className={styles['post-surface__rail-label']}>
                {scheme.fieldLabel}
              </span>
              <div className={styles['post-surface__rail-anchor']}>
                <ValueChip
                  scheme={scheme}
                  valueId={draft.valueId}
                  emptyLabel={`No ${noun(scheme)} available`}
                  active={pickerOpen}
                  error={capUnresolved}
                  onClick={() => setPickerOpen((open) => !open)}
                  aria-label={`${scheme.fieldLabel} for this post`}
                />
                {pickerOpen && (
                  <div className={styles['post-surface__picker']}>
                    <BoundedValuePicker
                      scheme={scheme}
                      cap={cap}
                      storedValueId={stored}
                      effectiveValueId={draft.valueId}
                      onPick={handlePick}
                      onClear={handleClear}
                      onClose={closePicker}
                      onOpenReference={onOpenChannelSurface}
                    />
                  </div>
                )}
              </div>

              {draft.derived ? (
                <span className={styles['post-surface__rail-marker']}>
                  <LabelTag
                    label={INHERITED_BADGE}
                    type="Default"
                    size="X-Small"
                    leadingIcon={<Icon size="10" glyph={<LinkVariantIcon />} />}
                  />
                  <span className={styles['post-surface__rail-text']}>
                    {inheritedDetail(scheme, CHANNEL.handle, cap.capId!)}
                  </span>
                </span>
              ) : stored != null ? (
                <span className={styles['post-surface__rail-marker']}>
                  <LabelTag label={EXPLICIT_BADGE} type="Info" size="X-Small" />
                  <span className={styles['post-surface__rail-text']}>
                    {explicitDetail(scheme, CHANNEL.handle)}
                  </span>
                </span>
              ) : (
                <span className={styles['post-surface__rail-marker']}>
                  <span className={styles['post-surface__rail-text']}>
                    {unresolvableEmptyDetail(scheme, CHANNEL.handle)}
                  </span>
                </span>
              )}

              {cap.status === 'resolved' && offered.length > 0 && (
                <span className={styles['post-surface__rail-cap']}>
                  {capHeader(scheme, CHANNEL.handle, cap.capId!)}
                </span>
              )}
            </div>

            <div className={styles['post-surface__input']}>
              <MessageInput
                placeholder={`Write to ${CHANNEL.handle}…`}
                stackedBelowRail
              />
            </div>

            {showDemoExtras && (
              <ProtoNote
                heading="Why the picker is not the control"
                className={styles['post-surface__proto-note']}
              >
                <ProtoNoteText>
                  {`read.option.bounds only shapes this picker. write.value.bounds is what actually stops a bad value — it runs on the server for every save, including edits an author makes later. Simulate a client that ignores the picker:`}
                </ProtoNoteText>
                <Button
                  emphasis="Secondary"
                  size="Small"
                  destructive
                  onClick={simulateOutOfBandWrite}
                  disabled={capUnresolved}
                >
                  {`Save ${optionLabel(scheme, OVER_CAP_ATTEMPT[scheme.key])} anyway`}
                </Button>
              </ProtoNote>
            )}
          </div>
        </>
      </ChannelShell>
    </div>
  );
}
