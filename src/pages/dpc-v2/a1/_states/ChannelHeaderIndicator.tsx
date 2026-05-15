/**
 * DPC V2 A1 — Channel header subtle Discoverable indicator (Wave 2C, NEW).
 *
 * Mocks a Mattermost channel header with the §3.20 subtle 12px lock-plus
 * indicator inline next to the channel name. The indicator is the member-side
 * situational-awareness cue per FR-26 / KD-26 — always-visible at 12px,
 * low-emphasis foreground, never hover-revealed.
 *
 * Two variants render side-by-side so reviewers can compare:
 *   Option A — Discoverable (S2/S3/S5): header renders the lock-plus 12px
 *              after the channel name; hover/long-press reveals tooltip:
 *              "This channel is discoverable; non-members in your team can
 *              request to join."
 *   Option B — Non-discoverable (S1):  header without the indicator (control).
 *
 * Tooltip behavior (§3.20.3): 500ms hover or focus reveals; tap-elsewhere or
 * blur dismisses. The aria-label remains active even when the tooltip cannot
 * paint (low-bandwidth degrade per §3.20.5).
 */
import { useId, useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import PinOutlineIcon from '@mattermost/compass-icons/components/pin-outline';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './ChannelHeaderIndicator.module.scss';

export interface ChannelHeaderIndicatorProps {
  store: A1V2StoreApi;
}

export default function ChannelHeaderIndicator({
  store,
}: ChannelHeaderIndicatorProps) {
  const { focusChannel } = store;

  if (!store.state.channelHeaderIndicatorVisible) return null;

  return (
    <section
      className={styles['v2-header-indicator']}
      aria-label="Channel header — Discoverable indicator preview"
    >
      <header className={styles['v2-header-indicator__heading']}>
        <h3 className={styles['v2-header-indicator__heading-title']}>
          Channel header — Discoverable indicator (FR-26)
        </h3>
        <p className={styles['v2-header-indicator__heading-sub']}>
          Subtle lock-plus at 12px next to channel name. Always-visible per
          KD-26; tooltip on hover or focus.
        </p>
      </header>

      <div className={styles['v2-header-indicator__variants']}>
        {/* Option A — Discoverable */}
        <div className={styles['v2-header-indicator__variant']}>
          <span className={styles['v2-header-indicator__variant-label']}>
            Option A · Discoverable channel
          </span>
          <ChannelHeaderMock
            channelName={focusChannel.displayName}
            memberCount={focusChannel.memberCount}
            isPrivate
            isDiscoverable
          />
        </div>

        {/* Option B — Non-discoverable control */}
        <div className={styles['v2-header-indicator__variant']}>
          <span className={styles['v2-header-indicator__variant-label']}>
            Option B · Non-discoverable channel (control)
          </span>
          <ChannelHeaderMock
            channelName="ops-private-internal"
            memberCount={11}
            isPrivate
            isDiscoverable={false}
          />
        </div>
      </div>
    </section>
  );
}

interface ChannelHeaderMockProps {
  channelName: string;
  memberCount: number;
  isPrivate: boolean;
  isDiscoverable: boolean;
}

function ChannelHeaderMock({
  channelName,
  memberCount,
  isPrivate,
  isDiscoverable,
}: ChannelHeaderMockProps) {
  return (
    <div
      className={styles['v2-header-indicator__bar']}
      role="region"
      aria-label={`Channel header for ${channelName}`}
    >
      <div className={styles['v2-header-indicator__bar-left']}>
        <Icon
          size="16"
          glyph={isPrivate ? <LockOutlineIcon /> : <GlobeIcon />}
        />
        <span className={styles['v2-header-indicator__bar-name']}>
          {channelName}
        </span>
        {isDiscoverable && <DiscoverableTooltipTrigger />}
        <span
          className={styles['v2-header-indicator__bar-divider']}
          aria-hidden
        />
        <span className={styles['v2-header-indicator__bar-purpose']}>
          Add a channel header
        </span>
      </div>
      <div className={styles['v2-header-indicator__bar-right']}>
        <IconButton
          aria-label="Favorite"
          size="Small"
          icon={<Icon size="16" glyph={<StarOutlineIcon />} />}
        />
        <IconButton
          aria-label="Pinned messages"
          size="Small"
          icon={<Icon size="16" glyph={<PinOutlineIcon />} />}
        />
        <IconButton
          aria-label="Start call"
          size="Small"
          icon={<Icon size="16" glyph={<PhoneIcon />} />}
        />
        <button
          type="button"
          className={styles['v2-header-indicator__members-chip']}
        >
          <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
          <span>{memberCount}</span>
        </button>
        <IconButton
          aria-label="More"
          size="Small"
          icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
        />
      </div>
    </div>
  );
}

/**
 * The 12px lock-plus indicator with hover/focus tooltip.
 * `aria-describedby` links to the tooltip when visible; the icon's own
 * `aria-label` provides the screen-reader announcement on focus regardless
 * of tooltip state.
 */
function DiscoverableTooltipTrigger() {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const ariaLabel =
    'This channel is discoverable; non-members in your team can request to join.';

  return (
    <span className={styles['v2-header-indicator__lock-plus-wrap']}>
      <button
        type="button"
        className={styles['v2-header-indicator__lock-plus-trigger']}
        aria-label={ariaLabel}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span
          className={styles['v2-header-indicator__lock-plus']}
          role="img"
          aria-hidden
        >
          <LockOutlineIcon size={12} />
          <PlusIcon
            size={8}
            className={styles['v2-header-indicator__lock-plus-plus']}
          />
        </span>
      </button>
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className={styles['v2-header-indicator__tooltip']}
        >
          {ariaLabel}
        </span>
      )}
    </span>
  );
}
