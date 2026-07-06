import { useEffect, useMemo, useRef, useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import MessageInput from '@/components/ui/MessageInput';
import Message from '@/components/ui/Message/Message';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import Icon from '@/components/ui/Icon/Icon';
import ClassificationPill from './ClassificationPill';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import AttributeChip from './AttributeChip';
import type { AttributeChipSource } from './AttributeChip';
import AttributeChipPicker from './AttributeChipPicker';
import ComposerAttrStrip from './ComposerAttrStrip';
import AttributesButton from './AttributesButton';
import {
  channelBinding,
  postBinding,
  inheritanceIsActive,
} from './data';
import type { AttrDef, Binding } from './data';
import styles from './ComposerScene.module.scss';

/** Demo channel value for #fires-watch — Classification ceiling = SECRET. */
const CHANNEL_CLASSIFICATION = 's';

/** Channel-side seeded values for the demo. Classification + Program inherit. */
const CHANNEL_VALUES: Record<string, string> = {
  classification: CHANNEL_CLASSIFICATION,
  program: 'shield',
};

export type ComposerVariant = 'rail' | 'compact';

export interface ComposerSceneProps {
  /** All attribute definitions in scope (passed through from AttributeSystem). */
  defs: AttrDef[];
  /**
   * `rail`    — Option A: persistent compact chip rail above MessageInput.
   * `compact` — Option B: `Attributes ▾` in the MessageInput action row only
   *             (no chip rail; popover is the sole edit surface).
   */
  variant: ComposerVariant;
}

interface RowDescriptor {
  defId: string;
  attrName: string;
  kind: 'ranked' | 'other';
  rank?: number;
  locked: boolean;
  source: AttributeChipSource;
  sourceName?: string;
  unset: boolean;
  requiredMissing: boolean;
  currentValueId: string | null;
  currentLabel: string;
  // Picker driver bits
  values: AttrDef['values'];
  ranked: boolean;
  ceilingValueId?: string;
  channelDefaultId?: string;
  showReset: boolean;
}

function authorCanOverride(binding: Binding): boolean {
  if (binding.mutability === 'Locked' || binding.mutability === 'Approval') {
    return false;
  }
  return binding.inheritanceMode === 'channel-default';
}

/**
 * Composer scene rendered on the REAL channel layout shell.
 *
 *  - Channel: `#fires-watch`, ceiling `SECRET` (locked at compose).
 *  - Demo exercises three chip flavors in one view: Classification (locked
 *    inheritance), Program (editable inheritance, channel-default → author
 *    may downgrade), Mission tag (post-only editable, no inheritance).
 *
 * Variant `rail` = Option A (persistent chip rail). Variant `compact` = Option B:
 * `Attributes ▾` in the MessageInput action row; no rail — popover only.
 */
export default function ComposerScene({ defs, variant }: ComposerSceneProps) {
  const channelName = '#fires-watch';

  // ─── Build the applicable attribute set (Posts-binding only) ─────────
  const applicable = useMemo(
    () => defs.filter((d) => d.appliesTo.includes('Posts')),
    [defs],
  );

  // ─── Seed inherited values ───────────────────────────────────────────
  const inheritedSeed = useMemo(() => {
    const next: Record<string, string> = {};
    for (const def of applicable) {
      const post = postBinding(def);
      const channel = channelBinding(def);
      if (
        post &&
        post.inheritanceMode &&
        post.inheritanceMode !== 'none' &&
        channel?.propagateToPosts &&
        CHANNEL_VALUES[def.id]
      ) {
        next[def.id] = CHANNEL_VALUES[def.id];
      }
    }
    return next;
  }, [applicable]);

  const [draft, setDraft] = useState<Record<string, string>>(inheritedSeed);
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // ─── Outside-click for picker / popover ──────────────────────────────
  const railRef = useRef<HTMLDivElement>(null);
  const attrsSlotRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!openPickerId && !popoverOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inRail = railRef.current?.contains(target) ?? false;
      const inAttrsSlot = attrsSlotRef.current?.contains(target) ?? false;
      const inPopover = popoverRef.current?.contains(target) ?? false;
      if (!inRail && !inAttrsSlot && !inPopover) {
        setOpenPickerId(null);
        setPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openPickerId, popoverOpen]);

  // ─── Build the row descriptors (order: Classification, inherited, post-only) ─
  const rows = useMemo<RowDescriptor[]>(() => {
    // Stable ordering: Classification first, then other inherited, then post-only.
    const ordered = [...applicable].sort((a, b) => {
      const aClass = a.id === 'classification' ? -1 : 0;
      const bClass = b.id === 'classification' ? -1 : 0;
      if (aClass !== bClass) return aClass - bClass;
      const aInherits = inheritanceIsActive(a) ? -1 : 0;
      const bInherits = inheritanceIsActive(b) ? -1 : 0;
      return aInherits - bInherits;
    });

    return ordered.map((def) => {
      const post = postBinding(def);
      const channel = channelBinding(def);
      const inheritsFromChannel =
        Boolean(post?.inheritanceMode && post.inheritanceMode !== 'none') &&
        Boolean(channel?.propagateToPosts);
      const channelDefaultId = inheritsFromChannel
        ? CHANNEL_VALUES[def.id]
        : undefined;
      const currentValueId = draft[def.id] ?? null;
      const currentLabel =
        def.values.find((v) => v.id === currentValueId)?.label ?? '';

      const locked =
        inheritsFromChannel &&
        Boolean(post) &&
        (post!.inheritanceMode === 'channel-locked' || !authorCanOverride(post!));

      const overridden =
        inheritsFromChannel &&
        channelDefaultId != null &&
        currentValueId != null &&
        currentValueId !== channelDefaultId;

      let source: AttributeChipSource;
      if (locked) source = 'inherited-locked';
      else if (overridden) source = 'overridden';
      else if (inheritsFromChannel) source = 'inherited-editable';
      else source = 'post-only';

      const required = post?.required === 'Required';
      const unset = !currentValueId;
      const requiredMissing = required && unset && !locked;

      // Display label: unset → placeholder copy; otherwise resolved label.
      // Overridden register adds the `· overridden` cue per design §4 State 2.
      let displayLabel = currentLabel;
      if (unset) {
        displayLabel = `${def.name} — set value`;
      } else if (overridden) {
        displayLabel = `${currentLabel} · overridden`;
      }

      return {
        defId: def.id,
        attrName: def.name,
        kind: def.type === 'Ranked' ? 'ranked' : 'other',
        rank: def.values.find((v) => v.id === currentValueId)?.rank,
        locked,
        source,
        sourceName: inheritsFromChannel ? channelName : undefined,
        unset,
        requiredMissing,
        currentValueId,
        currentLabel: displayLabel,
        values: def.values,
        ranked: def.type === 'Ranked',
        ceilingValueId: def.type === 'Ranked' ? CHANNEL_VALUES[def.id] : undefined,
        channelDefaultId,
        showReset: overridden,
      };
    });
  }, [applicable, draft]);

  // ─── Divergence detection — drives Option B button edited state ───────
  const diverged = useMemo(() => {
    for (const row of rows) {
      if (row.source === 'overridden') return true;
      // A post-only chip whose value is set (or required-unset) counts as
      // a deviation from the empty/inherited default per design §12.3.
      if (row.source === 'post-only' && row.currentValueId) return true;
    }
    return false;
  }, [rows]);

  const requiredMissingSomewhere = rows.some((r) => r.requiredMissing);

  // Classification snapshot for the Option B button face.
  const classificationRow = rows.find((r) => r.defId === 'classification');

  const railVisible = variant === 'rail';

  // ─── Handlers ────────────────────────────────────────────────────────
  const setValue = (defId: string, valueId: string) => {
    setDraft((prev) => ({ ...prev, [defId]: valueId }));
  };
  const resetToChannel = (defId: string) => {
    const channelVal = CHANNEL_VALUES[defId];
    if (channelVal) {
      setDraft((prev) => ({ ...prev, [defId]: channelVal }));
    } else {
      setDraft((prev) => {
        const next = { ...prev };
        delete next[defId];
        return next;
      });
    }
  };

  // ─── Rail rendering — Option A only ───────────────────────────────────
  const renderRail = (key: string) => (
    <div
      ref={railRef}
      key={key}
      className={styles['composer-scene__rail-anchor']}
    >
      <span className={styles['composer-scene__rail-label']}>Post</span>
      <ComposerAttrStrip
        errorMessage={
          requiredMissingSomewhere
            ? 'A required post attribute is not set.'
            : null
        }
      >
        {rows.map((row) => {
          const open = openPickerId === row.defId;
          return (
            <span
              key={row.defId}
              className={styles['composer-scene__chip-anchor']}
            >
              <AttributeChip
                label={row.currentLabel}
                kind={row.kind}
                rank={row.rank}
                locked={row.locked}
                source={row.source}
                attrName={row.attrName}
                sourceName={row.sourceName}
                unset={row.unset}
                requiredMissing={row.requiredMissing}
                classificationValueId={
                  row.defId === 'classification'
                    ? row.currentValueId ?? undefined
                    : undefined
                }
                active={open}
                onClick={
                  row.locked
                    ? undefined
                    : () =>
                        setOpenPickerId((cur) =>
                          cur === row.defId ? null : row.defId,
                        )
                }
              />
              {open && (
                <div
                  className={[
                    styles['composer-scene__picker-popover'],
                    styles['composer-scene__picker-popover--above'],
                  ].join(' ')}
                >
                  <AttributeChipPicker
                    attrName={row.attrName}
                    values={row.values}
                    ranked={row.ranked}
                    ceilingValueId={row.ceilingValueId}
                    selectedId={row.currentValueId}
                    channelDefaultId={row.channelDefaultId}
                    showReset={row.showReset}
                    onPick={(id) => setValue(row.defId, id)}
                    onReset={() => resetToChannel(row.defId)}
                    onClose={() => setOpenPickerId(null)}
                  />
                </div>
              )}
            </span>
          );
        })}
      </ComposerAttrStrip>
    </div>
  );

  // ─── Option B popover content (lists every post attribute) ───────────
  const renderPopover = () => (
    <div ref={popoverRef} className={styles['composer-scene__attrs-popover']}>
      <div className={styles['composer-scene__popover-head']}>
        <span className={styles['composer-scene__popover-title']}>
          Post attributes
        </span>
        <button
          type="button"
          className={styles['composer-scene__popover-close']}
          onClick={() => setPopoverOpen(false)}
          aria-label="Close attributes"
        >
          <Icon size="12" glyph={<CloseIcon />} />
        </button>
      </div>
      <ul className={styles['composer-scene__popover-list']}>
        {rows.map((row) => {
          const open = openPickerId === row.defId;
          return (
            <li key={row.defId} className={styles['composer-scene__popover-row']}>
              <span className={styles['composer-scene__popover-name']}>
                {row.attrName}
                {row.requiredMissing && (
                  <span className={styles['composer-scene__popover-asterisk']}>
                    *
                  </span>
                )}
              </span>
              <span className={styles['composer-scene__popover-value']}>
                <AttributeChip
                  label={row.currentLabel}
                  kind={row.kind}
                  rank={row.rank}
                  locked={row.locked}
                  source={row.source}
                  attrName={row.attrName}
                  sourceName={row.sourceName}
                  unset={row.unset}
                  requiredMissing={row.requiredMissing}
                  classificationValueId={
                    row.defId === 'classification'
                      ? row.currentValueId ?? undefined
                      : undefined
                  }
                  active={open}
                  onClick={
                    row.locked
                      ? undefined
                      : () =>
                          setOpenPickerId((cur) =>
                            cur === row.defId ? null : row.defId,
                          )
                  }
                />
                {open && (
                  <div className={styles['composer-scene__picker-popover']}>
                    <AttributeChipPicker
                      attrName={row.attrName}
                      values={row.values}
                      ranked={row.ranked}
                      ceilingValueId={row.ceilingValueId}
                      selectedId={row.currentValueId}
                      channelDefaultId={row.channelDefaultId}
                      showReset={row.showReset}
                      onPick={(id) => setValue(row.defId, id)}
                      onReset={() => resetToChannel(row.defId)}
                      onClose={() => setOpenPickerId(null)}
                    />
                  </div>
                )}
              </span>
              <span className={styles['composer-scene__popover-affordance']}>
                {row.locked ? (
                  <span className={styles['composer-scene__popover-locked']}>
                    <Icon size="10" glyph={<LockOutlineIcon />} />
                    Locked
                  </span>
                ) : (
                  ''
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <p className={styles['composer-scene__popover-footer']} role="note">
        Channel ceiling: SECRET
      </p>
    </div>
  );

  // ─── Channel header ceiling chip (right of channel name) ─────────────
  // ChannelHeader doesn't expose a custom-trailing slot, so we keep the
  // ceiling visible via a small descriptor row above messages — same hook
  // PostCreateScene used. This preserves the design doc's "channel ceiling
  // is in the header" claim without modifying ChannelHeader.

  return (
    <div className={styles['composer-scene']}>
      <ChannelShell
        channelHeader={
          <ChannelHeader
            type="Channel"
            name="fires-watch"
            description="Wildfire ops · West coast incidents"
            memberCount={124}
            pinnedCount={2}
          />
        }
      >
        <>
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbars>
              <div className={shellStyles['channel-shell__messages-list']}>
                <div className={styles['composer-scene__ceiling-row']}>
                  <span className={styles['composer-scene__ceiling-label']}>
                    Channel ceiling
                  </span>
                  <ClassificationPill valueId="s" label="SECRET" size="Small" />
                  <span className={styles['composer-scene__ceiling-meta']}>
                    New posts inherit at creation
                  </span>
                </div>

                <MessageSeparator type="Date" label="Today" />

                <Message
                  avatarSrc={avatarSofia}
                  avatarAlt="Sofia Bauer"
                  username="Sofia Bauer"
                  timestamp="9:02 AM"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Standing up the West-coast wildfire ops thread. All posts here
                    are classified SECRET — confirm before sharing externally.
                  </p>
                </Message>

                <Message
                  avatarSrc={avatarMarco}
                  avatarAlt="Marco Rinaldi"
                  username="Marco Rinaldi"
                  timestamp="9:14 AM"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Air assets reposition complete. Tanker 04 holding at Redding.
                  </p>
                </Message>

                <Message
                  avatarSrc={avatarArjunPatel}
                  avatarAlt="Arjun Patel"
                  username="Arjun Patel"
                  timestamp="9:47 AM"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Status board updated — Operation Shield posture is amber on the
                    northern flank.
                  </p>
                </Message>

                <MessageSeparator type="New Messages" />

                <Message
                  avatarSrc={avatarLeonard}
                  avatarAlt="Leonard Riley"
                  username="Leonard Riley"
                  timestamp="10:12 AM"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Design review bumped to 2:00 PM. Same secure room.
                  </p>
                </Message>

                <Message
                  avatarSrc={avatarAikoTan}
                  avatarAlt="Aiko Tan"
                  username="Aiko Tan"
                  timestamp="10:18 AM"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Ack — pulling logistics overlay before then.
                  </p>
                </Message>
              </div>
            </Scrollbars>
          </div>

          <div className={styles['composer-scene__foot']}>
            {variant === 'rail' && (
              <div className={styles['composer-scene__rail-slot']}>
                {renderRail('rail-A')}
              </div>
            )}

            <div className={styles['composer-scene__input-slot']}>
              <MessageInput
                placeholder={`Write to ${channelName}…`}
                stackedBelowRail={railVisible}
                leadingActions={
                  variant === 'compact'
                    ? (
                      <div
                        ref={attrsSlotRef}
                        className={styles['composer-scene__attrs-button-slot']}
                      >
                        <AttributesButton
                          classificationLabel={
                            classificationRow?.currentValueId
                              ? classificationRow.currentLabel.replace(
                                  ' · overridden',
                                  '',
                                )
                              : undefined
                          }
                          classificationRank={classificationRow?.rank}
                          edited={diverged}
                          active={popoverOpen}
                          hasError={requiredMissingSomewhere}
                          onClick={() => setPopoverOpen((o) => !o)}
                        />
                        {popoverOpen && renderPopover()}
                      </div>
                    )
                    : undefined
                }
              />
            </div>
          </div>
        </>
      </ChannelShell>
    </div>
  );
}
