import { useState, type ReactNode } from 'react';
import AcvcChannelApp, {
  type WriteDeniedSurface,
} from '../components/AcvcChannelApp';
import AcvcScreenNav from '../components/AcvcScreenNav';
import AcvcSessionStage from '../components/AcvcSessionStage';
import AcvcThreadPanel from '../components/AcvcThreadPanel';
import AcvcThreadsApp from '../components/AcvcThreadsApp';
import { READONLY_SCREENS } from '../actionControlsScenes';
import { useSession } from '../sessionModel';
import styles from './ReadOnlyScene.module.scss';

type ScreenId = (typeof READONLY_SCREENS)[number]['id'];

const SCREEN_COPY: Record<ScreenId, { title: string; note: ReactNode }> = {
  channel: {
    title: 'Channel-scoped freeze — mission-update channel',
    note: (
      <>
        Only <strong>Watchfloor Ops</strong> is under Channel Write Access. The
        composer uses the shipped read-only string. Message hover actions stay —
        save and more — and write controls (react, reply, edit) are gone. Click
        the channel name, info, or more-actions to reach the other surfaces.
        Town Square and every DM/GM stay writable.
      </>
    ),
  },
  'message-menu': {
    title: 'Message actions — keep read and personal, drop writes',
    note: (
      <>
        The more menu stays. Reply, Edit, and Delete are hidden. Follow, unread,
        save, remind, pin, copy, forward, and flag remain — they assert
        &ldquo;I can see this,&rdquo; not &ldquo;I can write here.&rdquo; Existing
        reaction counts stay visible but are not togglable.
      </>
    ),
  },
  info: {
    title: 'Channel info — membership write gone, personal prefs stay',
    note: (
      <>
        Add people is omitted. Favorite, Mute, and Copy Link stay. Purpose and
        header are display-only. Channel Settings still opens, read-only.
        Members, pinned, and files remain as view surfaces.
      </>
    ),
  },
  'header-menu': {
    title: 'Header menu — leave stays, archive goes',
    note: (
      <>
        Open in new window, View info, Mute, Notifications, Channel settings,
        Bookmarks bar, Members, Move to, and Leave stay. Archive is hidden —
        that is a channel-property write. Channel settings opens the read-only
        modal.
      </>
    ),
  },
  settings: {
    title: 'Channel settings — inspect, do not mutate',
    note: (
      <>
        The modal still opens for anyone who had RBAC access. Info fields are
        read-only: no rename, no privacy flip, no header edit, no save bar.
        Archive Channel is omitted from the left nav. Policy tabs remain
        visible as view-only.
      </>
    ),
  },
  system: {
    title: 'System-wide freeze — every channel, DMs still live',
    note: (
      <>
        A system-scope Channel Write Access policy covers every public and
        private channel. Open Town Square or Engineering: same read-only
        composer. Open <strong>Aiko Tan</strong> or{' '}
        <strong>Watch leads</strong>: the composer returns, because DMs and GMs
        are out of scope. Flip Participation to Participant to restore posting
        in channels.
      </>
    ),
  },
  thread: {
    title: 'Thread reply — same gate as the channel composer',
    note: (
      <>
        The right-hand thread is the playground Channel Thread layout. Channel
        Write Access denial replaces both the centre composer and the thread
        reply input with the same read-only string. Flip Participation to
        restore both.
      </>
    ),
  },
  threads: {
    title: 'Threads view — reply follows the parent resource',
    note: (
      <>
        Layout matches the playground Threads view. The Watchfloor Ops thread is
        read-only. Town Square is still writable on a channel-scoped policy. The
        Aiko Tan DM thread stays writable either way. Select each row to compare.
      </>
    ),
  },
};

function writeSurfaceFor(screen: ScreenId): WriteDeniedSurface {
  switch (screen) {
    case 'message-menu':
      return 'message-menu';
    case 'info':
      return 'info';
    case 'header-menu':
      return 'header-menu';
    case 'settings':
      return 'settings';
    case 'channel':
    case 'system':
    case 'thread':
    case 'threads':
      return 'none';
    default: {
      const exhaustive: never = screen;
      return exhaustive;
    }
  }
}

export default function ReadOnlyScene() {
  const [screen, setScreen] = useState<ScreenId>('channel');
  const channelSession = useSession({
    network: 'Trusted',
    device: 'Managed',
    participation: 'Observer',
    createPostCoverage: 'channel',
  });
  const systemSession = useSession({
    network: 'Trusted',
    device: 'Managed',
    participation: 'Observer',
    createPostCoverage: 'system',
  });
  const threadSession = useSession({
    network: 'Trusted',
    device: 'Managed',
    participation: 'Observer',
    createPostCoverage: 'channel',
  });
  const threadsSession = useSession({
    network: 'Trusted',
    device: 'Managed',
    participation: 'Observer',
    createPostCoverage: 'channel',
    activeChannel: 'Threads',
  });

  const session =
    screen === 'system'
      ? systemSession
      : screen === 'thread'
        ? threadSession
        : screen === 'threads'
          ? threadsSession
          : channelSession;

  const copy = SCREEN_COPY[screen];

  return (
    <div className={styles['readonly-scene']}>
      <AcvcScreenNav
        screens={READONLY_SCREENS}
        activeId={screen}
        onChange={(id) => setScreen(id as ScreenId)}
        ariaLabel="Write to Channels surface"
      />
      <AcvcSessionStage
        title={copy.title}
        note={copy.note}
        session={session}
        label="Session"
        showParticipation
      >
        {screen === 'threads' ? (
          <AcvcThreadsApp session={threadsSession} />
        ) : (
          <AcvcChannelApp
            session={session}
            writeDeniedSurface={writeSurfaceFor(screen)}
            trailing={
              screen === 'thread' ? (
                <AcvcThreadPanel readOnly={threadSession.showReadOnly} />
              ) : undefined
            }
          />
        )}
      </AcvcSessionStage>
    </div>
  );
}
