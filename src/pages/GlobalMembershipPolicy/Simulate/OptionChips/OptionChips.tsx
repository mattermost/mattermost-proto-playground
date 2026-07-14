/**
 * GMP Simulate — ALTERNATIVE Option 1 (Chips-adapted).
 *
 * Reuses the Simulate-Access CHIP visual (a `Chip` with a leading glyph +
 * trailing chevron, click → anchored read-only popover) BUT each chip is a
 * CHANNEL context — not a session — and the popover content is a membership
 * Added / Kept / Removed set-diff, NOT an access verdict. This is the ideation's
 * "reuse Simulate-Access as the base" idea made concrete.
 *
 * All numbers come from the SAME gmpData.ts fixtures as the committed
 * Simulate/Simulate.tsx scene (channelDiff / isOverClearance / toBand), so the
 * three prototypes stay consistent.
 *
 * Known trade-off carried from ideation §3 Option 1: the chip pattern was built
 * for per-session pass/fail verdicts, so the destructive "would be removed"
 * weight sits one click behind the chip. We counter that by (a) tinting the chip
 * danger when a private removal is present and (b) showing the count-first
 * summary the moment the popover opens.
 *
 * States (deep-linkable via ?state=): default (chips row), populated (a chip's
 * popover open with named set-diff), over-clearance (the TS chip's popover shows
 * bands only), empty (no channels), error.
 */

import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PoundIcon from '@mattermost/compass-icons/components/pound';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CloseIcon from '@mattermost/compass-icons/components/close';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import AccountMinusOutlineIcon from '@mattermost/compass-icons/components/account-minus-outline';

import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Chip from '@/components/ui/Chip/Chip';
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
  simChannelChipTone,
  SIM_HIDDEN_CHANNEL_COUNT,
  SIM_PICKER_FILTER_NOTE,
  SIM_OVER_CLEARANCE_NOTE,
  policyById,
  type SimChannel,
  type SimMember,
} from '@/pages/GlobalMembershipPolicy/gmpData';
import { GMP_ROUTES, GMP_SIDEBAR_CATEGORIES } from '@/pages/GlobalMembershipPolicy/gmpConsole';
import type { ChipTone } from '@/components/ui/Chip/Chip';
import type { ConsoleSidebarCategoryData } from '@/components/ui/ConsoleSidebar/ConsoleSidebar';

import styles from './OptionChips.module.scss';

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

/** Chip tone maps to the DS Chip's semantic tone. Not a verdict — encodes weight. */
function chipTone(channel: SimChannel): ChipTone {
  const tone = simChannelChipTone(channel);
  if (tone === 'danger') return 'danger';
  if (tone === 'warning') return 'warning';
  return 'neutral';
}

function MemberRow({ member }: { member: SimMember }) {
  return (
    <div className={styles['chips__member']}>
      <UserAvatar src={AVATARS[member.key]} alt={member.name} name={member.name} size="24" />
      <div className={styles['chips__member-main']}>
        <span className={styles['chips__member-name']}>{member.name}</span>
        <span className={styles['chips__member-role']}>{member.role}</span>
      </div>
    </div>
  );
}

function DiffRow({
  label,
  glyph,
  members,
  removed,
  destructive,
  publicChannel,
}: {
  label: string;
  glyph: React.ReactNode;
  members: SimMember[];
  removed?: boolean;
  destructive?: boolean;
  publicChannel?: boolean;
}) {
  const rowClass = [
    styles['chips__diff-group'],
    removed ? styles['chips__diff-group--removed'] : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={rowClass}>
      <div className={styles['chips__diff-head']}>
        <span className={styles['chips__diff-glyph']}>{glyph}</span>
        <span className={styles['chips__diff-label']}>{label}</span>
        <span className={styles['chips__diff-count']}>{members.length}</span>
      </div>
      {removed && destructive && (
        <div className={styles['chips__diff-note']}>
          Removed from a private channel. Not reversible without re-adding.
        </div>
      )}
      {removed && !destructive && publicChannel && members.length > 0 && (
        <div className={styles['chips__diff-note-muted']}>
          Dropped from recommendations only. Members keep their access.
        </div>
      )}
      {members.length === 0 ? (
        <div className={styles['chips__diff-empty']}>No members in this set.</div>
      ) : (
        <div className={styles['chips__diff-members']}>
          {members.map((m) => (
            <MemberRow key={m.key} member={m} />
          ))}
        </div>
      )}
    </div>
  );
}

const POPOVER_WIDTH = 360;
const POPOVER_GAP = 8;

/**
 * The channel-context detail popover — the Option 1 analog of Simulate-Access's
 * SessionChipDetailPopover, but the body is a set-diff, not a verdict.
 */
function ChannelDetailPopover({
  channel,
  triggerRect,
  onClose,
}: {
  channel: SimChannel;
  triggerRect: DOMRect;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });
  const over = isOverClearance(channel);
  const diff = channelDiff(channel);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const w = ref.current.offsetWidth || POPOVER_WIDTH;
    const h = ref.current.offsetHeight;
    let top = triggerRect.bottom + POPOVER_GAP;
    let left = triggerRect.left;
    if (left + w > window.innerWidth - 8) left = window.innerWidth - 8 - w;
    if (left < 8) left = 8;
    if (top + h > window.innerHeight - 8) top = triggerRect.top - h - POPOVER_GAP;
    if (top < 8) top = 8;
    setPos({ top, left });
  }, [triggerRect]);

  return (
    <>
      <div className={styles['chips__scrim']} onClick={onClose} aria-hidden />
      <div
        ref={ref}
        className={styles['chips__popover']}
        style={{ top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
        role="dialog"
        aria-label={`Membership changes for ${channel.name}`}
      >
        <div className={styles['chips__popover-head']}>
          <div className={styles['chips__popover-title-group']}>
            <span className={styles['chips__popover-title']}>{channel.name}</span>
            <span className={styles['chips__popover-subtitle']}>
              {channel.team} · {channel.private ? 'Private' : 'Public'}
            </span>
          </div>
          <button
            type="button"
            className={styles['chips__popover-close']}
            onClick={onClose}
            aria-label="Close"
          >
            <Icon size="12" glyph={<CloseIcon />} />
          </button>
        </div>

        {/* Count-first summary — pulls the destructive weight to the front. */}
        <div className={styles['chips__popover-summary']}>
          <span>
            <strong>{over ? toBand(diff.added) : diff.added}</strong> added
          </span>
          <span>
            <strong>{over ? toBand(diff.kept) : diff.kept}</strong> kept
          </span>
          <span
            className={
              diff.removed > 0 ? styles['chips__popover-removed'] : undefined
            }
          >
            <strong>{over ? toBand(diff.removed) : diff.removed}</strong> removed
          </span>
        </div>

        {over ? (
          <div className={styles['chips__popover-body']}>
            <SectionNotice
              type="Warning"
              icon={<Icon size="20" glyph={<ShieldOutlineIcon />} />}
              title="Results shown as ranges — above your clearance"
              description={SIM_OVER_CLEARANCE_NOTE}
            />
            <div className={styles['chips__bands']}>
              <div className={styles['chips__band']}>
                <span className={styles['chips__band-label']}>Would be added</span>
                <span className={styles['chips__band-value']}>{toBand(diff.added)}</span>
              </div>
              <div className={styles['chips__band']}>
                <span className={styles['chips__band-label']}>Would be kept</span>
                <span className={styles['chips__band-value']}>{toBand(diff.kept)}</span>
              </div>
              <div
                className={[styles['chips__band'], styles['chips__band--removed']]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className={styles['chips__band-label']}>Would be removed</span>
                <span className={styles['chips__band-value']}>{toBand(diff.removed)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles['chips__popover-body']}>
            {diff.destructive && (
              <SectionNotice
                type="Danger"
                icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                title={`${diff.removed} members would be removed from this private channel`}
                description="Private-channel removals take effect on save and are not reversible without re-adding each member."
              />
            )}
            <DiffRow
              label="Would be added"
              glyph={<Icon size="16" glyph={<AccountPlusOutlineIcon />} />}
              members={channel.members.added}
            />
            <DiffRow
              label="Would be kept"
              glyph={<Icon size="16" glyph={<CheckCircleOutlineIcon />} />}
              members={channel.members.kept}
            />
            <DiffRow
              label="Would be removed"
              glyph={<Icon size="16" glyph={<AccountMinusOutlineIcon />} />}
              members={channel.members.removed}
              removed
              destructive={diff.destructive}
              publicChannel={!channel.private}
            />
          </div>
        )}

        <div className={styles['chips__audit']}>
          <Icon size="12" glyph={<InformationOutlineIcon />} />
          <span>
            {over
              ? 'This simulation was recorded as a range-only result. View audit log.'
              : `Matched on ${failingConditionFor(channel)}. This simulation was recorded. View audit log.`}
          </span>
        </div>
      </div>
    </>
  );
}

export default function OptionChips() {
  const navigate = useNavigate();
  const params = readParams();

  const stateParam = params.get('state') as ScreenState | null;
  const initialState: ScreenState =
    stateParam && VALID_STATES.includes(stateParam) ? stateParam : 'default';

  const policyParam = params.get('policy');
  const policyName = policyById(policyParam ?? '')?.name ?? 'DS Program';

  const channels = visibleSimChannels();
  const overClearanceSeed = channels.find((c) => isOverClearance(c)) ?? null;
  const fullySeeSeed =
    channels
      .filter((c) => !isOverClearance(c))
      .sort((a, b) => channelDiff(b).removed - channelDiff(a).removed)[0] ?? null;

  const isEmpty = initialState === 'empty';
  const isError = initialState === 'error';

  // For deep-linked populated / over-clearance states, open the popover on a
  // representative chip immediately so the state renders without a click.
  const [openChannel, setOpenChannel] = useState<SimChannel | null>(
    initialState === 'over-clearance'
      ? overClearanceSeed
      : initialState === 'populated'
        ? fullySeeSeed
        : null,
  );
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);

  // For deep-linked states there's no click, so anchor the popover to the chip
  // row once it's laid out.
  useLayoutEffect(() => {
    if (openChannel && triggerRect == null && rowRef.current) {
      const chip = rowRef.current.querySelector(
        `[data-channel="${openChannel.id}"]`,
      ) as HTMLElement | null;
      if (chip) setTriggerRect(chip.getBoundingClientRect());
      else setTriggerRect(rowRef.current.getBoundingClientRect());
    }
  }, [openChannel, triggerRect]);

  const [active, setActive] = useState('membership-policies');
  const categories: ConsoleSidebarCategoryData[] = GMP_SIDEBAR_CATEGORIES;
  const handleSidebarClick = (itemId: string) => {
    setActive(itemId);
    if (itemId === 'membership-policies') navigate(GMP_ROUTES.list);
  };

  const openChip = (channel: SimChannel, rect: DOMRect) => {
    setOpenChannel(channel);
    setTriggerRect(rect);
  };
  const closePopover = () => {
    setOpenChannel(null);
    setTriggerRect(null);
  };

  return (
    <div className={styles['chips']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt={SIMULATE_ADMIN.name}
        username={SIMULATE_ADMIN.username}
        categories={categories}
        activeItemId={active}
        onItemClick={handleSidebarClick}
      />

      <div className={styles['chips__center']}>
        <ConsolePageHeader
          title={`Simulate — ${policyName}`}
          subtitle="Preview who would be added, kept, or removed before you save"
          backButton
          onBack={() => navigate(GMP_ROUTES.editor)}
        />

        <div className={styles['chips__scroll']}>
          <Scrollbars>
            <div className={styles['chips__page']}>
              <div className={styles['chips__intro']}>
                <h2 className={styles['chips__title']}>Simulate against a channel</h2>
                <p className={styles['chips__subtitle']}>
                  Each chip is a channel this policy touches. Select one to see who would be
                  added, kept, or removed.
                </p>
              </div>

              {isError ? (
                <SectionNotice
                  type="Danger"
                  icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                  title="Simulation couldn’t be computed"
                  description="The membership engine didn’t return results for these channels. No changes were made. Try again."
                  primaryButtonLabel="Retry"
                  onPrimaryAction={() => navigate(0)}
                />
              ) : isEmpty ? (
                <EmptyState
                  illustration={{ children: <LockedIllustration /> }}
                  title="No channels available to simulate"
                  description="You don’t have visibility into any channels in this policy’s scope. Ask an administrator with the right clearance to run this simulation."
                />
              ) : (
                <>
                  <div className={styles['chips__note']}>
                    <Icon size="16" glyph={<InformationOutlineIcon />} />
                    <span>
                      {SIM_PICKER_FILTER_NOTE} {SIM_HIDDEN_CHANNEL_COUNT} in-scope channels are
                      hidden. Channels above your clearance show ranges only.
                    </span>
                  </div>

                  <div className={styles['chips__row']} ref={rowRef}>
                    {channels.map((channel) => {
                      const over = isOverClearance(channel);
                      const isOpen = openChannel?.id === channel.id;
                      return (
                        <span
                          key={channel.id}
                          data-channel={channel.id}
                          className={styles['chips__chip-wrap']}
                        >
                          <Chip
                            as="button"
                            size="Large"
                            tone={chipTone(channel)}
                            leadingIcon={
                              channel.private ? <LockOutlineIcon /> : <PoundIcon />
                            }
                            trailingIcon={<ChevronRightIcon />}
                            className={[
                              styles['chips__chip'],
                              isOpen ? styles['chips__chip--active'] : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            aria-label={`Simulate against ${channel.name}`}
                            onClick={(e) =>
                              openChip(
                                channel,
                                (e.currentTarget as HTMLElement).getBoundingClientRect(),
                              )
                            }
                          >
                            {channel.name}
                            <span className={styles['chips__chip-tag']}>
                              <Tags size="X-Small" type={over ? 'Danger' : 'General'}>
                                {channel.classification}
                              </Tags>
                            </span>
                          </Chip>
                        </span>
                      );
                    })}
                  </div>

                  <p className={styles['chips__hint']}>
                    {openChannel
                      ? 'Showing membership changes for the selected channel.'
                      : 'Select a channel chip above to open its Added / Kept / Removed detail.'}
                  </p>

                  {!openChannel && (
                    <div>
                      <Button
                        emphasis="Tertiary"
                        size="Small"
                        onClick={() => fullySeeSeed && setOpenChannel(fullySeeSeed)}
                      >
                        Open the most-affected channel
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Scrollbars>
        </div>
      </div>

      {openChannel && triggerRect && (
        <ChannelDetailPopover
          channel={openChannel}
          triggerRect={triggerRect}
          onClose={closePopover}
        />
      )}
    </div>
  );
}
