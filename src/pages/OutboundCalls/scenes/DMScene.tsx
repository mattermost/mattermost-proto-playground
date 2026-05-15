import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Message from '@/components/ui/Message/Message';
import { OutboundCallPhoneNumberLink } from '@/pages/OutboundCalls/OutboundCallPhoneNumberLink';
import { SegmentedCallButton } from '@/pages/OutboundCalls/OutboundCallStartCallMenu';
import TelAutocompleteMessageInput from '@/pages/OutboundCalls/TelAutocompleteMessageInput';
import { avatarLeonard, CONTACT_MAP } from '@/pages/OutboundCalls/outboundCallData';
import type { StartCallAction } from '@/types/outboundCall';
import layoutStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';

export function DMScene({
  onOpenProfile,
  onStartCall,
  onOpenDialer,
}: {
  onOpenProfile: (contactId: string, rect: DOMRect) => void;
  onStartCall: (contactId: string, phoneIndex: number) => void;
  onOpenDialer: () => void;
}) {
  const contact = CONTACT_MAP['aiko'];
  const primaryIndex = contact.phones.findIndex((p) => p.kind === 'standard');
  const primaryPhone = primaryIndex >= 0 ? contact.phones[primaryIndex] : null;

  const actions: StartCallAction[] = [
    { id: 'audio', type: 'audio' },
    ...contact.phones.map((p, i) => ({
      id: `${contact.id}:${i}`,
      type: 'phone' as const,
      label: p.label,
      number: p.number,
      kind: p.kind,
      sipTrunk: p.sipTrunk,
      contactId: contact.id,
      phoneIndex: i,
    })),
    { id: 'dialpad', type: 'dialpad' },
  ];

  const handleSelect = (action: StartCallAction) => {
    if (action.type === 'dialpad') {
      onOpenDialer();
    } else if (action.type === 'phone') {
      onStartCall(action.contactId, action.phoneIndex);
    }
    // 'audio' is a stub for a Mattermost Calls WebRTC call — no-op in prototype.
  };

  return (
    <>
      <ChannelHeader
        type="DM"
        name={contact.name}
        description={contact.title}
        avatarSrc={contact.avatar}
        avatarStatus={contact.online}
        onNameClick={(e) => onOpenProfile(contact.id, e.currentTarget.getBoundingClientRect())}
        callButton={
          <SegmentedCallButton
            actions={actions}
            onSelect={handleSelect}
            audioLabel={`Start audio call with ${contact.name}`}
          />
        }
      />

      <div className={layoutStyles['channel-shell__messages']}>
        <MessageSeparator type="Date" label="Today" />

        <Message
          avatarSrc={contact.avatar}
          avatarAlt={contact.name}
          username={contact.name}
          timestamp="9:02 AM"
        >
          <p className={layoutStyles['channel-shell__post-text']}>
            Hey — have a minute? Need to walk through the Nightingale comms plan before the 11:00
            handover. Easier by voice.
          </p>
        </Message>
        <Message
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          username="Leonard Riley"
          timestamp="9:04 AM"
        >
          <p className={layoutStyles['channel-shell__post-text']}>
            Copy — hit Call above or pick a number off my profile, either works.
          </p>
        </Message>
        <Message
          avatarSrc={contact.avatar}
          avatarAlt={contact.name}
          username={contact.name}
          timestamp="9:05 AM"
        >
          <p className={layoutStyles['channel-shell__post-text']}>
            Or just ring my direct line:{' '}
            {primaryPhone && (
              <OutboundCallPhoneNumberLink
                number={primaryPhone.number}
                onClick={() => onStartCall(contact.id, primaryIndex)}
              />
            )}
          </p>
        </Message>
      </div>
      <div className={layoutStyles['channel-shell__message-input']}>
        <TelAutocompleteMessageInput placeholder={`Message ${contact.name}`} />
      </div>
    </>
  );
}
