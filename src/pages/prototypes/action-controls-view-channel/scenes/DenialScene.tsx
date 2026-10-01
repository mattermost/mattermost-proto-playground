import { useState, type ReactNode } from 'react';
import AcvcChannelApp from '../components/AcvcChannelApp';
import AcvcScreenNav from '../components/AcvcScreenNav';
import AcvcSessionStage from '../components/AcvcSessionStage';
import { DENIAL_SCREENS } from '../actionControlsScenes';
import { useSession } from '../sessionModel';
import styles from './DenialScene.module.scss';

type ScreenId = (typeof DENIAL_SCREENS)[number]['id'];

const SCREEN_COPY: Record<ScreenId, { title: string; note: ReactNode }> = {
  channel: {
    title: 'One session, driven by its own attributes',
    note: (
      <>
        Set <strong>Network</strong> to Public (or <strong>Device</strong> to Unmanaged) and the
        denial lands: the centre channel becomes the permission message while the channel{' '}
        <strong>stays in the sidebar</strong> — nothing is yanked away mid-read. Click any other
        channel and the row disappears entirely. Set Network back to Trusted and it returns
        carrying the mentions that accumulated while it was hidden; open it to see the full
        history with a New Messages separator at the boundary. The verdict is computed per
        session, so a second device on a different network would answer differently at this same
        moment.
      </>
    ),
  },
  workspace: {
    title: 'Workspace-wide denial — channels gone, DMs and GMs stay',
    note: (
      <>
        A system-scope <strong>Read Channels</strong> policy applies to every public and private
        channel. DMs and GMs are out of scope. Flip <strong>Network</strong> to Public: the
        CHANNELS group disappears, <strong>Aiko Tan</strong> and <strong>Watch leads</strong> stay,
        and the centre shows the permission message until you open a DM. Flip Network back to
        Trusted to restore channels. System Console access is unaffected.
      </>
    ),
  },
};

/**
 * End-user denial surfaces, driven by session attributes rather than staged variants.
 */
export default function DenialScene() {
  const [screen, setScreen] = useState<ScreenId>('channel');
  const channelSession = useSession({ network: 'Trusted', device: 'Managed' });
  const workspaceSession = useSession({
    network: 'Trusted',
    device: 'Managed',
    viewChannelCoverage: 'workspace',
  });
  const copy = SCREEN_COPY[screen];
  const session = screen === 'channel' ? channelSession : workspaceSession;

  return (
    <div className={styles['denial-scene']}>
      <AcvcScreenNav
        screens={DENIAL_SCREENS}
        activeId={screen}
        onChange={(id) => setScreen(id as ScreenId)}
        ariaLabel="Denial surface"
      />
      <AcvcSessionStage
        title={copy.title}
        note={copy.note}
        session={session}
        label="Session"
      >
        <AcvcChannelApp
          session={screen === 'channel' ? channelSession : workspaceSession}
        />
      </AcvcSessionStage>
    </div>
  );
}
