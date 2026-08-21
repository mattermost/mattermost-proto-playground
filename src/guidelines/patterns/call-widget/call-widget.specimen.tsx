import { useState } from 'react';
import { CallWidget } from '@mattermost/compass-proto';
import type { Participant } from '@/types/callParticipant';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import styles from '@/styles/library-demo/patterns.module.scss';

const participants: Participant[] = [
  {
    id: '1',
    name: 'Leonard Riley',
    avatarSrc: avatarLeonard,
    host: true,
    talking: true,
  },
  { id: '2', name: 'Aiko Tan', avatarSrc: avatarAikoTan },
  { id: '3', name: 'Arjun Patel', avatarSrc: avatarArjunPatel, muted: true },
];

export default function CallWidgetLibrary() {
  const [overlay, setOverlay] = useState<
    'menu' | 'info' | 'participants' | null
  >(null);
  const [muted, setMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [externalEnabled, setExternalEnabled] = useState(true);

  return (
    <div className={styles['patterns__call-widget-demo']}>
      <p className={styles['patterns__variant-label']}>
        Active call (interactive)
      </p>
      <CallWidget
        participants={participants}
        currentUserId="1"
        talkerName="Leonard Riley"
        talkerAvatarSrc={avatarLeonard}
        channelName="op-nightingale"
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
        handRaised={handRaised}
        onToggleHand={() => setHandRaised((h) => !h)}
        sharing={sharing}
        onToggleShare={() => setSharing((s) => !s)}
        onExpand={() => {}}
        onLeave={() => {}}
        overlay={overlay}
        onToggleMenu={() => setOverlay((o) => (o === 'menu' ? null : 'menu'))}
        onToggleParticipants={() =>
          setOverlay((o) => (o === 'participants' ? null : 'participants'))
        }
        onOpenCallInfo={() => setOverlay('info')}
        onCloseCallInfo={() => setOverlay(null)}
        externalEnabled={externalEnabled}
        onExternalEnabledChange={setExternalEnabled}
        internalLink="https://mattermost.example.com/team/pl/join/abc123"
        externalLink="https://guest.example.com/xyz"
        dialInNumber="+1 669 555 0100"
        dialInPin="123 456"
      />
    </div>
  );
}
