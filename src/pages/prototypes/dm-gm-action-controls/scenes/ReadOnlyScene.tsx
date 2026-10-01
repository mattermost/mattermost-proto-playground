// [AI DRAFT] Scene 4 — read-only DM and GM. Shared by both directions; B adds
// the support link after the reason.
import DmgmChannelApp from '../components/DmgmChannelApp';
import DmgmSessionControls from '../components/DmgmSessionControls';
import DmgmStage from '../components/DmgmStage';
import { useDmSession } from '../components/useDmSession';
import { DAVID, EMMA } from '../dmgmData';
import { TRUSTED_SESSION } from '../policyModel';
import type { SceneProps } from './AuthoringScene';
import { SUPPORT_LINK_NOTE_A, SUPPORT_LINK_NOTE_B } from './sceneNotes';

const GM_NAME = `${DAVID.name}, ${EMMA.name}`;

const COPY: Record<string, { title: string; note: string }> = {
  dm: {
    title: 'An existing DM becomes read-only when a post rule fails',
    note: 'Emma Novak is in the Corvane program, so “Same program only” denies Darius posting to her. The history stays, the composer is replaced by the neutral reason, and hovering a message shows no react or reply. Emma sees no indicator of the restriction. The field stays focusable, and the reason is linked to it for screen readers.',
  },
  gm: {
    title: 'A group message is read-only if any member fails',
    note: 'David Liang passes and Emma Novak fails, so the whole group is read-only for Darius. The member list, header and history are unchanged, and no system message is posted. The copy names nobody.',
  },
  session: {
    title: 'A session change mid-typing keeps the draft',
    note: 'Darius was typing to David Liang when his Network changed to Public, so “No posting from untrusted networks” now denies the post. The typed text stays in the composer, neither sent nor discarded, and the composer is read-only. Set Network back to Trusted and the draft is editable again, then set it to Public to watch the switch happen.',
  },
};

export default function ReadOnlyScene({ direction, screen }: SceneProps) {
  const active =
    screen === 'gm' ? GM_NAME : screen === 'session' ? DAVID.name : EMMA.name;
  const session = useDmSession({
    ctx:
      screen === 'session'
        ? { ...TRUSTED_SESSION, Network: 'Public' }
        : TRUSTED_SESSION,
    active,
    drafts:
      screen === 'session'
        ? {
            [DAVID.name]:
              'Timestamps look right. The second dropout lines up with the antenna swap at T+212',
          }
        : undefined,
  });
  const copy = COPY[screen] ?? COPY.dm;

  return (
    <DmgmStage
      title={copy.title}
      note={
        <>
          <p>{copy.note}</p>
          <p>{direction === 'b' ? SUPPORT_LINK_NOTE_B : SUPPORT_LINK_NOTE_A}</p>
        </>
      }
      controls={<DmgmSessionControls session={session} />}
    >
      <DmgmChannelApp session={session} direction={direction} />
    </DmgmStage>
  );
}
