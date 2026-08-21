import { CallWidget } from '@mattermost/compass-proto';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import type { Participant } from '@/types/callParticipant';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';

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

/**
 * Call Widget pattern — static anatomy preview on the shared AnatomyStage surface.
 */
export function CallWidgetAnatomyStage() {
  return (
    <AnatomyStage
      style={{
        margin: '0 auto var(--spacing-m)',
        alignItems: 'center',
      }}
    >
      <CallWidget
        participants={participants}
        currentUserId="1"
        talkerName="Leonard Riley"
        talkerAvatarSrc={avatarLeonard}
        channelName="op-nightingale"
        muted={false}
        onToggleMute={() => {}}
        handRaised={false}
        onToggleHand={() => {}}
        sharing={false}
        onToggleShare={() => {}}
        onExpand={() => {}}
        onLeave={() => {}}
        overlay={null}
        onToggleMenu={() => {}}
        onToggleParticipants={() => {}}
        onOpenCallInfo={() => {}}
        onCloseCallInfo={() => {}}
        externalEnabled
        onExternalEnabledChange={() => {}}
        internalLink="https://mattermost.example.com/team/pl/join/abc123"
        externalLink="https://guest.example.com/xyz"
        dialInNumber="+1 669 555 0100"
        dialInPin="123 456"
      />
    </AnatomyStage>
  );
}
