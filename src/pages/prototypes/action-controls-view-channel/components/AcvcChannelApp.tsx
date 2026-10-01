import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ChannelsSidebar } from '@mattermost/compass-ui/components/channels-sidebar';
import { EmptyState } from '@mattermost/compass-ui/components/empty-state';
import {
  RightSidebarHeader,
} from '@mattermost/compass-ui/components/right-sidebar-header';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import {
  ChannelHeader,
  ChannelShell,
  MessageInput,
  RightSidebar,
  shellStyles,
  type ChannelHeaderType,
} from '@mattermost/compass-proto';
import LockedMessagesSvg from '@/assets/illustrations/locked-messages.svg?react';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import AcvcChannelInfo from './AcvcChannelInfo';
import AcvcChannelSettingsModal from './AcvcChannelSettingsModal';
import AcvcMessages from './AcvcMessages';
import AcvcReadOnlyComposer from './AcvcReadOnlyComposer';
import {
  AcvcChannelHeaderMenu,
  AcvcMessageMoreOptionsMenu,
} from './AcvcReadOnlyMenus';
import {
  DEFAULT_DM,
  GROUP_MESSAGE,
  RESTRICTED_CHANNEL,
  buildSidebarModel,
  isDirectOrGroup,
} from '../channelData';
import { DENIAL_REDIRECT_SECONDS, type SessionView } from '../sessionModel';
import styles from './AcvcChannelApp.module.scss';

type ChannelMeta = {
  type: ChannelHeaderType;
  description?: string;
  members?: number;
  pinned?: number;
  avatarSrc?: string;
  avatarAlt?: string;
};

const CHANNEL_META: Record<string, ChannelMeta> = {
  [RESTRICTED_CHANNEL]: {
    type: 'channel',
    description: 'Watch floor coordination and shift handover.',
    members: 18,
    pinned: 3,
  },
  'Town Square': {
    type: 'channel',
    description: 'Company-wide announcements and general discussion.',
    members: 124,
    pinned: 2,
  },
  'Off-Topic': {
    type: 'channel',
    description: 'Non-work chatter.',
    members: 96,
    pinned: 0,
  },
  Engineering: {
    type: 'channel',
    description: 'Platform and infrastructure.',
    members: 61,
    pinned: 1,
  },
  [DEFAULT_DM]: {
    type: 'dm',
    avatarSrc: avatarAikoTan,
    avatarAlt: 'Aiko Tan',
  },
  'Arjun Patel': {
    type: 'dm',
    avatarSrc: avatarArjunPatel,
    avatarAlt: 'Arjun Patel',
  },
  'Marco Rinaldi': {
    type: 'dm',
    avatarSrc: avatarMarco,
    avatarAlt: 'Marco Rinaldi',
  },
  [GROUP_MESSAGE]: {
    type: 'gm',
    members: 3,
  },
};

/**
 * The permission-denied centre channel.
 *
 * Not an error and not a retry affordance: retrying cannot succeed, and a
 * transient-looking failure would send the user to a support desk that also
 * cannot explain it. The copy names the boundary and stops — no policy, no
 * attribute, no mention that a policy engine exists.
 */
function DeniedState({ onRedirect }: { onRedirect: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(DENIAL_REDIRECT_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onRedirect();
      return;
    }

    const timerId = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [secondsLeft, onRedirect]);

  const redirectLabel =
    secondsLeft === 1
      ? 'Redirecting in 1 second…'
      : `Redirecting in ${secondsLeft} seconds…`;

  return (
    // Focus moves here when the verdict flips, and the region announces exactly
    // the copy a sighted user reads — no more. That satisfies WCAG 2.4.3
    // without disclosing anything the screen doesn't already show.
    <div className={styles['acvc-channel-app__denied']} role="status" tabIndex={-1}>
      <EmptyState
        illustration={{
          children: <LockedMessagesSvg />,
          width: '200px',
          'aria-label': '',
        }}
        title="You do not have permission to view this content"
        description="Contact your system administrator if you believe this is an error."
      />
      <p className={styles['acvc-channel-app__denied-redirect']} aria-live="polite">
        {redirectLabel}
      </p>
    </div>
  );
}

export type WriteDeniedSurface =
  | 'none'
  | 'message-menu'
  | 'info'
  | 'header-menu'
  | 'settings';

export interface AcvcChannelAppProps {
  session: SessionView;
  /** Replaces the centre column (search results, threads inbox, permalinks). */
  centerOverride?: ReactNode;
  /** Floating layer inside the frame (channel switcher, browse modal). */
  overlay?: ReactNode;
  /** Optional right column (thread). */
  trailing?: ReactNode;
  /**
   * Force a write-denied chrome surface open for review. Ignored unless the
   * active resource is read-only.
   */
  writeDeniedSurface?: WriteDeniedSurface;
}

function messageVariant(
  name: string,
): 'restricted' | 'general' | 'dm' | 'gm' {
  if (name === RESTRICTED_CHANNEL) {
    return 'restricted';
  }
  if (name === GROUP_MESSAGE) {
    return 'gm';
  }
  if (isDirectOrGroup(name)) {
    return 'dm';
  }
  return 'general';
}

/** One session's Mattermost window, rendered from that session's verdict. */
export default function AcvcChannelApp({
  session,
  centerOverride,
  overlay,
  trailing,
  writeDeniedSurface = 'none',
}: AcvcChannelAppProps) {
  const {
    state,
    showDenied,
    showReadOnly,
    channelInSidebar,
    includeChannels,
    openChannel,
  } = session;
  const redirectToLastPermitted = useCallback(
    () => openChannel(state.lastViewedPermittedChannel),
    [openChannel, state.lastViewedPermittedChannel],
  );
  const active = state.activeChannel;
  const meta = CHANNEL_META[active] ?? CHANNEL_META['Town Square'];
  const [infoOpen, setInfoOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [messageMenuOpen, setMessageMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const forced = showReadOnly ? writeDeniedSurface : 'none';
  const showInfo =
    showReadOnly &&
    trailing == null &&
    (forced === 'info' || (forced === 'none' && infoOpen));
  const showHeaderMenu =
    showReadOnly &&
    (forced === 'header-menu' || (forced === 'none' && headerMenuOpen));
  const showMessageMenu =
    showReadOnly &&
    (forced === 'message-menu' || (forced === 'none' && messageMenuOpen));
  const showSettings =
    showReadOnly &&
    (forced === 'settings' || (forced === 'none' && settingsOpen));

  const openInfo = useCallback(() => {
    setHeaderMenuOpen(false);
    setInfoOpen(true);
  }, []);
  const openSettings = useCallback(() => {
    setHeaderMenuOpen(false);
    setSettingsOpen(true);
  }, []);

  const sidebarModel = buildSidebarModel({
    activeChannelName: active,
    includeChannels,
    restrictedState: channelInSidebar
      ? state.pendingMentions > 0
        ? 'mention'
        : 'read'
      : undefined,
    restrictedMentionCount: state.pendingMentions || undefined,
    onItemClick: openChannel,
  });

  // Re-keying the sidebar on list membership lets the column settle with a
  // short fade when the restricted row appears or disappears, so the change is
  // noticeable without inventing any product affordance.
  const sidebarKey = `${includeChannels ? 'channels' : 'no-channels'}-${channelInSidebar ? 'with' : 'without'}-${state.pendingMentions}`;

  const body = centerOverride ?? (
    <>
      <div
        key={showDenied ? 'denied' : 'content'}
        className={styles['acvc-channel-app__center']}
      >
        {showDenied ? (
          <DeniedState onRedirect={redirectToLastPermitted} />
        ) : (
          <AcvcMessages
            variant={messageVariant(active)}
            writeDenied={showReadOnly}
            showMessageMenu={showMessageMenu}
            onMoreActionsClick={() => setMessageMenuOpen((open) => !open)}
            // After a denial the channel returns carrying everything sent while
            // it was hidden, with the separator at the pre-denial boundary.
            showBackfill={active === RESTRICTED_CHANNEL && state.backfilled}
          />
        )}
      </div>
      {showDenied ? null : (
        <div className={shellStyles['channel-shell__message-input']}>
          {showReadOnly ? (
            <AcvcReadOnlyComposer />
          ) : (
            <MessageInput placeholder={`Write to ${active}`} />
          )}
        </div>
      )}
    </>
  );

  const header = showDenied ? (
    <ChannelHeader type={meta.type} name={active} />
  ) : (
    <ChannelHeader
      type={meta.type}
      name={active}
      description={meta.description}
      memberCount={meta.members}
      pinnedCount={meta.pinned}
      avatarSrc={meta.avatarSrc}
      avatarStatus={meta.type === 'dm'}
      infoToggled={showInfo}
      onInfoClick={
        showReadOnly
          ? () => setInfoOpen((open) => !open)
          : undefined
      }
      onNameClick={
        showReadOnly
          ? () => setHeaderMenuOpen((open) => !open)
          : undefined
      }
    />
  );

  const infoPanel = showInfo ? (
    <RightSidebar
      className={shellStyles['channel-shell__right-sidebar']}
      header={
        <RightSidebarHeader
          title="Channel Info"
          secondaryTitle={active}
          onClose={() => setInfoOpen(false)}
        />
      }
    >
      <Scrollbar>
        <AcvcChannelInfo
          channelName={active}
          purpose={meta.description ?? ''}
          header={meta.description}
          onChannelSettings={openSettings}
        />
      </Scrollbar>
    </RightSidebar>
  ) : undefined;

  return (
    <div className={styles['acvc-channel-app']}>
      <ChannelShell
        channelsSidebar={
          <div key={sidebarKey} className={styles['acvc-channel-app__sidebar']}>
            <ChannelsSidebar
              teamName="Contributors"
              activeChannelName={active}
              // Must be passed to the component, not just baked into the model:
              // ChannelsSidebar recomputes each row's onClick from this prop and
              // discards whatever the model set.
              onItemClick={openChannel}
              model={sidebarModel}
            />
          </div>
        }
        channelHeader={header}
        trailing={trailing ?? infoPanel}
      >
        {body}
      </ChannelShell>
      {showHeaderMenu ? (
        <div className={styles['acvc-channel-app__header-menu']}>
          <AcvcChannelHeaderMenu
            onViewInfo={openInfo}
            onChannelSettings={openSettings}
          />
        </div>
      ) : null}
      {showMessageMenu ? (
        <div className={styles['acvc-channel-app__message-menu']}>
          <AcvcMessageMoreOptionsMenu />
        </div>
      ) : null}
      {overlay ? (
        <div className={styles['acvc-channel-app__overlay']}>{overlay}</div>
      ) : null}
      {showSettings ? (
        <AcvcChannelSettingsModal
          channelName={active}
          purpose={meta.description ?? ''}
          header={meta.description ?? ''}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </div>
  );
}
