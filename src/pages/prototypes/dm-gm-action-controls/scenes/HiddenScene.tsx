// [AI DRAFT] Scene 5 — hidden DM on a session that fails View. Inherits the
// View Channel D+C′ treatment unchanged. Silent: no support link in either direction.
import DmgmChannelApp from '../components/DmgmChannelApp';
import DmgmSessionControls from '../components/DmgmSessionControls';
import DmgmStage from '../components/DmgmStage';
import { useDmSession } from '../components/useDmSession';
import { ISABELLA } from '../dmgmData';
import type { SceneProps } from './AuthoringScene';

const UNMANAGED = { Network: 'Trusted', Device: 'Unmanaged' };

const COPY: Record<string, { title: string; note: string }> = {
  active: {
    title: 'On an unmanaged device, the open DM is hidden silently',
    note: 'Device is set to Unmanaged, so “Unmanaged devices can’t see DMs” denies View. Using the same treatment as Channel Read Access, the stream stops, the centre shows the permission message, and the conversations stay in the sidebar for now so nothing is pulled away mid-read. After the countdown, or the next click, every DM and GM leaves the sidebar. Set Device to Managed to bring them back.',
  },
  after: {
    title: 'After navigating away, DMs and GMs are gone from this session',
    note: 'Channels remain, because they are outside these policies. Every DM and GM, including Darius’s own self-DM, is gone from the sidebar on this session. Pushes to this device are suppressed. No message names the rule, and the support link does not appear. View denial stays silent in both directions. Set Device to Managed and they return.',
  },
};

export default function HiddenScene({ screen }: SceneProps) {
  const after = screen === 'after';
  const session = useDmSession({
    ctx: UNMANAGED,
    active: after ? 'Ashgrove Integration' : ISABELLA.name,
    removed: after,
  });
  const copy = COPY[screen] ?? COPY.active;

  return (
    <DmgmStage
      title={copy.title}
      note={<p>{copy.note}</p>}
      controls={<DmgmSessionControls session={session} />}
    >
      <DmgmChannelApp session={session} direction="a" />
    </DmgmStage>
  );
}
