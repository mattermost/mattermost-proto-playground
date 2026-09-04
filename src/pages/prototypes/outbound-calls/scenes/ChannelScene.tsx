import type { MouseEvent, ReactNode } from 'react';
import { ChannelHeader } from '@mattermost/compass-ui/components/channel-header';
import { MessageInput } from '@mattermost/compass-ui/components/message-input';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { Message } from '@mattermost/compass-ui/components/message';
import { OutboundCallPhoneNumberLink } from '@/pages/prototypes/outbound-calls/OutboundCallPhoneNumberLink';
import { SegmentedCallButton } from '@/pages/prototypes/outbound-calls/OutboundCallStartCallMenu';
import { CHANNEL_POSTS, CONTACT_MAP } from '@/pages/prototypes/outbound-calls/outboundCallData';
import type { StartCallAction } from '@/types/outboundCall';
import { layoutStyles } from '@mattermost/compass-proto';
import styles from '../OutboundCalls.module.scss';

function ProfileClickable({
  contactId,
  contactName,
  onOpen,
  children,
}: {
  contactId: string;
  contactName: string;
  onOpen: (contactId: string, rect: DOMRect) => void;
  children: ReactNode;
}) {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const isAvatar = target.tagName === 'IMG';
    const isUsername = target.tagName === 'SPAN' && target.textContent?.trim() === contactName;
    if (!isAvatar && !isUsername) return;
    const img = e.currentTarget.querySelector('img');
    const rect = (img ?? target).getBoundingClientRect();
    onOpen(contactId, rect);
  };

  return (
    <div className={styles['profile-clickable']} onClick={handleClick} role="presentation">
      {children}
    </div>
  );
}

export function ChannelScene({
  onOpenProfile,
  onOpenDialer,
  onStartConferenceCall,
  onStartCall,
}: {
  onOpenProfile: (contactId: string, rect: DOMRect) => void;
  onOpenDialer: () => void;
  onStartConferenceCall: () => void;
  onStartCall: (contactId: string, phoneIndex: number) => void;
}) {
  const actions: StartCallAction[] = [
    { id: 'audio', type: 'audio' },
    { id: 'conference', type: 'conference' },
    { id: 'dialpad', type: 'dialpad' },
  ];
  const handleSelect = (action: StartCallAction) => {
    if (action.type === 'dialpad') onOpenDialer();
    else if (action.type === 'conference') onStartConferenceCall();
    // 'audio' is a stub for a Mattermost Calls group call — no-op in prototype.
  };
  return (
    <>
      <ChannelHeader
        type="channel"
        name="op-nightingale"
        description="Tasking + coordination channel for the Nightingale working group."
        memberCount={8}
        pinnedCount={1}
        callButton={<SegmentedCallButton actions={actions} onSelect={handleSelect} />}
      />
      <div className={layoutStyles['channel-shell__messages']}>
        <MessageSeparator type="date" label="Today" />

        {CHANNEL_POSTS.map((p) => {
          const c = CONTACT_MAP[p.contactId];
          return (
            <ProfileClickable
              key={p.id}
              contactId={c.id}
              contactName={c.name}
              onOpen={onOpenProfile}
            >
              <Message
                avatarSrc={c.avatar}
                avatarAlt={c.name}
                username={c.name}
                timestamp={p.timestamp}
              >
                <p className={layoutStyles['channel-shell__post-text']}>{p.body}</p>
              </Message>
            </ProfileClickable>
          );
        })}

        <ProfileClickable
          contactId="leonard"
          contactName="Leonard Riley"
          onOpen={onOpenProfile}
        >
          <Message
            avatarSrc={CONTACT_MAP['leonard'].avatar}
            avatarAlt="Leonard Riley"
            username="Leonard Riley"
            timestamp="9:42 AM"
          >
            <p className={layoutStyles['channel-shell__post-text']}>
              Reach me on{' '}
              <OutboundCallPhoneNumberLink
                number={CONTACT_MAP['leonard'].phones[0].number}
                onClick={() => onStartCall('leonard', 0)}
              />{' '}
              — I'm at my desk for the next hour.
            </p>
          </Message>
        </ProfileClickable>
      </div>
      <div className={layoutStyles['channel-shell__message-input']}>
        <MessageInput placeholder="Message op-nightingale" />
      </div>
    </>
  );
}
