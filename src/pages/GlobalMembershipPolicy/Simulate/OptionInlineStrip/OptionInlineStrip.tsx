/**
 * GMP Simulate — ALTERNATIVE Option 2 (Inline per-channel strip).
 *
 * A persistent strip that lives INSIDE the policy editor (not on a separate
 * Simulate surface). The admin pins up to 3 channels and sees each one's
 * Added / Kept / Removed set-diff side-by-side, always visible while editing the
 * requirements. Add / swap / unpin channels without leaving the editor.
 *
 * To make the "inside the editor" framing legible without depending on the
 * committed LongForm scene, this prototype renders a compact, non-interactive
 * requirements recap above the strip (read-only, DS Program seed) — the strip is
 * the live part. All numbers come from the SAME gmpData.ts fixtures as
 * Simulate/Simulate.tsx.
 *
 * Known trade-offs carried from ideation §3 Option 2: (1) the strip eats
 * vertical space in an already-tall editor; (2) it never surfaces the AGGREGATE
 * effect across all in-scope channels — it is per-channel only, so an admin can
 * mistake one pinned column for the whole policy's effect. We surface (2) as an
 * explicit inline note pointing to the full Simulate surface for the aggregate.
 *
 * States (deep-linkable via ?state=): default (1 channel pinned), populated
 * (up to 3 pinned side-by-side), over-clearance (a pinned TS column shows bands),
 * empty (no channels pinned), error.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PoundIcon from '@mattermost/compass-icons/components/pound';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CloseIcon from '@mattermost/compass-icons/components/close';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import AccountMinusOutlineIcon from '@mattermost/compass-icons/components/account-minus-outline';

import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Tags from '@/components/ui/Tags/Tags';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';

import LockedIllustration from '@/assets/illustrations/locked-messages.svg?react';

import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarDavid from '@/assets/avatars/David Liang.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarLeila from '@/assets/avatars/Leila Haddad.png';
import avatarLukas from '@/assets/avatars/Lukas Meyer.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';

import {
  SIMULATE_ADMIN,
  visibleSimChannels,
  isOverClearance,
  channelDiff,
  failingConditionFor,
  toBand,
  simDefaultPinnedChannel,
  SIM_MAX_PINNED,
  SIM_HIDDEN_CHANNEL_COUNT,
  SIM_PICKER_FILTER_NOTE,
  SIM_OVER_CLEARANCE_NOTE,
  policyById,
  type SimChannel,
  type SimMember,
} from '@/pages/GlobalMembershipPolicy/gmpData';
import { GMP_ROUTES, GMP_SIDEBAR_CATEGORIES } from '@/pages/GlobalMembershipPolicy/gmpConsole';

import styles from './OptionInlineStrip.module.scss';

const AVATARS: Record<string, string> = {
  aiko: avatarAiko,
  marco: avatarMarco,
  emma: avatarEmma,
  david: avatarDavid,
  arjun: avatarArjun,
  danielle: avatarDanielle,
  darius: avatarDarius,
  isabella: avatarIsabella,
  leila: avatarLeila,
  lukas: avatarLukas,
  sofia: avatarSofia,
  ethan: avatarEthan,
};

type ScreenState = 'default' | 'populated' | 'over-clearance' | 'empty' | 'error';

const VALID_STATES: ScreenState[] = [
  'default',
  'populated',
  'over-clearance',
  'empty',
  'error',
];

function readParams() {
  return typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
}

function MemberRow({ member }: { member: SimMember }) {
  return (
    <div className={styles['strip__member']}>
      <UserAvatar src={AVATARS[member.key]} alt={member.name} name={member.name} size="20" />
      <span className={styles['strip__member-name']}>{member.name}</span>
    </div>
  );
}

/** One set line within a pinned column (Added / Kept / Removed). */
function SetLine({
  label,
  glyph,
  members,
  removed,
  destructive,
}: {
  label: string;
  glyph: React.ReactNode;
  members: SimMember[];
  removed?: boolean;
  destructive?: boolean;
}) {
  const lineClass = [
    styles['strip__set'],
    removed ? styles['strip__set--removed'] : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={lineClass}>
      <div className={styles['strip__set-head']}>
        <span className={styles['strip__set-glyph']}>{glyph}</span>
        <span className={styles['strip__set-label']}>{label}</span>
        <span className={styles['strip__set-count']}>{members.length}</span>
      </div>
      {removed && destructive && (
        <div className={styles['strip__set-note']}>Not reversible without re-adding.</div>
      )}
      {members.length === 0 ? (
        <div className={styles['strip__set-empty']}>None</div>
      ) : (
        <div className={styles['strip__set-members']}>
          {members.map((m) => (
            <MemberRow key={m.key} member={m} />
          ))}
        </div>
      )}
    </div>
  );
}

/** A single pinned channel column — the always-visible per-channel result. */
function PinnedColumn({
  channel,
  onUnpin,
}: {
  channel: SimChannel;
  onUnpin: () => void;
}) {
  const over = isOverClearance(channel);
  const diff = channelDiff(channel);

  return (
    <div className={styles['strip__column']}>
      <div className={styles['strip__column-head']}>
        <span className={styles['strip__column-glyph']}>
          <Icon size="16" glyph={channel.private ? <LockOutlineIcon /> : <PoundIcon />} />
        </span>
        <div className={styles['strip__column-title-group']}>
          <span className={styles['strip__column-title']}>{channel.name}</span>
          <span className={styles['strip__column-meta']}>
            {channel.team} · {channel.private ? 'Private' : 'Public'}
          </span>
        </div>
        <span className={styles['strip__column-tag']}>
          <Tags size="X-Small" type={over ? 'Danger' : 'General'}>
            {channel.classification}
          </Tags>
        </span>
        <button
          type="button"
          className={styles['strip__column-unpin']}
          onClick={onUnpin}
          aria-label={`Unpin ${channel.name}`}
        >
          <Icon size="12" glyph={<CloseIcon />} />
        </button>
      </div>

      <div className={styles['strip__column-summary']}>
        <span>
          <strong>{over ? toBand(diff.added) : diff.added}</strong> added
        </span>
        <span>
          <strong>{over ? toBand(diff.kept) : diff.kept}</strong> kept
        </span>
        <span className={diff.removed > 0 ? styles['strip__summary-removed'] : undefined}>
          <strong>{over ? toBand(diff.removed) : diff.removed}</strong> removed
        </span>
      </div>

      {over ? (
        <div className={styles['strip__column-body']}>
          <SectionNotice
            type="Warning"
            icon={<Icon size="20" glyph={<ShieldOutlineIcon />} />}
            title="Ranges only — above your clearance"
            description={SIM_OVER_CLEARANCE_NOTE}
          />
          <div className={styles['strip__bands']}>
            <div className={styles['strip__band']}>
              <span className={styles['strip__band-label']}>Added</span>
              <span className={styles['strip__band-value']}>{toBand(diff.added)}</span>
            </div>
            <div className={styles['strip__band']}>
              <span className={styles['strip__band-label']}>Kept</span>
              <span className={styles['strip__band-value']}>{toBand(diff.kept)}</span>
            </div>
            <div
              className={[styles['strip__band'], styles['strip__band--removed']]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles['strip__band-label']}>Removed</span>
              <span className={styles['strip__band-value']}>{toBand(diff.removed)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles['strip__column-body']}>
          {diff.destructive && (
            <div className={styles['strip__destructive']}>
              <Icon size="16" glyph={<AlertOutlineIcon />} />
              <span>
                {diff.removed} would be removed from this private channel.
              </span>
            </div>
          )}
          <Scrollbars style={{ maxHeight: 320 }}>
            <div className={styles['strip__sets']}>
              <SetLine
                label="Would be added"
                glyph={<Icon size="12" glyph={<AccountPlusOutlineIcon />} />}
                members={channel.members.added}
              />
              <SetLine
                label="Would be kept"
                glyph={<Icon size="12" glyph={<CheckCircleOutlineIcon />} />}
                members={channel.members.kept}
              />
              <SetLine
                label="Would be removed"
                glyph={<Icon size="12" glyph={<AccountMinusOutlineIcon />} />}
                members={channel.members.removed}
                removed
                destructive={diff.destructive}
              />
            </div>
          </Scrollbars>
          <div className={styles['strip__column-audit']}>
            <Icon size="12" glyph={<InformationOutlineIcon />} />
            <span>Matched on {failingConditionFor(channel)}.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OptionInlineStrip() {
  const navigate = useNavigate();
  const params = readParams();

  const stateParam = params.get('state') as ScreenState | null;
  const initialState: ScreenState =
    stateParam && VALID_STATES.includes(stateParam) ? stateParam : 'default';

  const policyParam = params.get('policy');
  const policyName = policyById(policyParam ?? '')?.name ?? 'DS Program';

  const channels = visibleSimChannels();
  const defaultPin = simDefaultPinnedChannel();
  const overClearanceCh = channels.find((c) => isOverClearance(c)) ?? null;
  const fullyVisible = channels.filter((c) => !isOverClearance(c));

  // Seed the pinned set per deep-linked state.
  const seedPinned = (): SimChannel[] => {
    if (initialState === 'empty') return [];
    if (initialState === 'over-clearance') {
      // One fully-visible + the TS enclave, so the bands column is exercised
      // beside a named column.
      const base = fullyVisible[0];
      return [base, overClearanceCh].filter(Boolean) as SimChannel[];
    }
    if (initialState === 'populated') {
      // Up to 3 fully-visible channels side-by-side.
      return fullyVisible.slice(0, SIM_MAX_PINNED);
    }
    // default — one channel pinned (highest-blast-radius).
    return defaultPin ? [defaultPin] : [];
  };

  const [pinned, setPinned] = useState<SimChannel[]>(seedPinned);
  const [pickerOpen, setPickerOpen] = useState(false);
  const isError = initialState === 'error';

  const [active, setActive] = useState('membership-policies');
  const handleSidebarClick = (itemId: string) => {
    setActive(itemId);
    if (itemId === 'membership-policies') navigate(GMP_ROUTES.list);
  };

  const pin = (channel: SimChannel) => {
    setPinned((prev) => {
      if (prev.some((c) => c.id === channel.id)) return prev;
      if (prev.length >= SIM_MAX_PINNED) return prev;
      return [...prev, channel];
    });
    setPickerOpen(false);
  };
  const unpin = (id: string) => setPinned((prev) => prev.filter((c) => c.id !== id));

  const pinnableChannels = channels.filter((c) => !pinned.some((p) => p.id === c.id));
  const canPinMore = pinned.length < SIM_MAX_PINNED && pinnableChannels.length > 0;

  return (
    <div className={styles['strip']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt={SIMULATE_ADMIN.name}
        username={SIMULATE_ADMIN.username}
        categories={GMP_SIDEBAR_CATEGORIES}
        activeItemId={active}
        onItemClick={handleSidebarClick}
      />

      <div className={styles['strip__center']}>
        <ConsolePageHeader
          title={`Edit membership policy — ${policyName}`}
          subtitle="Simulate who would be added, kept, or removed as you edit — without leaving the editor"
          backButton
          onBack={() => navigate(GMP_ROUTES.editor)}
        />

        <div className={styles['strip__scroll']}>
          <Scrollbars>
            <div className={styles['strip__page']}>
              {/* Read-only requirements recap — stands in for the editor body so
                  the "inside the editor" framing reads without the LongForm scene. */}
              <div className={styles['strip__editor-recap']}>
                <span className={styles['strip__section-label']}>Membership requirements</span>
                <div className={styles['strip__req']}>
                  User: Clearance <em>is at least</em> Channel: Classification
                </div>
                <div className={styles['strip__req']}>
                  User: Program <em>is</em> Channel: Program
                </div>
              </div>

              {/* The always-visible simulate strip */}
              <div className={styles['strip__panel']}>
                <div className={styles['strip__panel-head']}>
                  <div className={styles['strip__panel-title-group']}>
                    <span className={styles['strip__panel-title']}>
                      Simulate against pinned channels
                    </span>
                    <span className={styles['strip__panel-hint']}>
                      Pin up to {SIM_MAX_PINNED} channels to compare their membership changes
                      side-by-side.
                    </span>
                  </div>
                  {!isError && (
                    <Button
                      emphasis="Tertiary"
                      size="Small"
                      leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                      disabled={!canPinMore}
                      onClick={() => setPickerOpen((v) => !v)}
                    >
                      Pin a channel
                    </Button>
                  )}
                </div>

                <div className={styles['strip__panel-note']}>
                  <Icon size="16" glyph={<InformationOutlineIcon />} />
                  <span>
                    {SIM_PICKER_FILTER_NOTE} {SIM_HIDDEN_CHANNEL_COUNT} in-scope channels are
                    hidden. This strip shows per-channel results only — for the effect across all
                    channels, open the full Simulate surface.
                  </span>
                </div>

                {pickerOpen && canPinMore && (
                  <div className={styles['strip__picker']}>
                    <Scrollbars style={{ maxHeight: 260 }}>
                      {pinnableChannels.map((channel) => {
                        const over = isOverClearance(channel);
                        return (
                          <button
                            key={channel.id}
                            type="button"
                            className={styles['strip__picker-row']}
                            onClick={() => pin(channel)}
                          >
                            <span className={styles['strip__picker-glyph']}>
                              <Icon
                                size="16"
                                glyph={channel.private ? <LockOutlineIcon /> : <PoundIcon />}
                              />
                            </span>
                            <span className={styles['strip__picker-main']}>
                              <span className={styles['strip__picker-name']}>{channel.name}</span>
                              <span className={styles['strip__picker-meta']}>
                                {channel.team} · {channel.private ? 'Private' : 'Public'}
                              </span>
                            </span>
                            <Tags size="X-Small" type={over ? 'Danger' : 'General'}>
                              {channel.classification}
                            </Tags>
                          </button>
                        );
                      })}
                    </Scrollbars>
                  </div>
                )}

                {isError ? (
                  <SectionNotice
                    type="Danger"
                    icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                    title="Simulation couldn’t be computed"
                    description="The membership engine didn’t return results for the pinned channels. No changes were made. Try again."
                    primaryButtonLabel="Retry"
                    onPrimaryAction={() => navigate(0)}
                  />
                ) : pinned.length === 0 ? (
                  <EmptyState
                    illustration={{ children: <LockedIllustration /> }}
                    title="No channels pinned"
                    description="Pin a channel to see who would be added, kept, or removed as you edit this policy."
                    action={{
                      children: 'Pin a channel',
                      onClick: () => setPickerOpen(true),
                    }}
                  />
                ) : (
                  <div
                    className={[
                      styles['strip__columns'],
                      styles[`strip__columns--count-${pinned.length}`],
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {pinned.map((channel) => (
                      <PinnedColumn
                        key={channel.id}
                        channel={channel}
                        onUnpin={() => unpin(channel.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
}
