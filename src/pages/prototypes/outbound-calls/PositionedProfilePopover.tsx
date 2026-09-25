/**
 * Outbound-only (not for `main`): positions {@link ProfilePopover} from a
 * channel/DM anchor. See root CLAUDE.md (Profile popover + positioning).
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ProfilePopover } from '@mattermost/compass-ui/components/profile-popover';
import { phoneGlyphFor } from '@/pages/prototypes/outbound-calls/OutboundCallPhoneGlyphs';
import { PopoverCallButton } from '@/pages/prototypes/outbound-calls/OutboundCallStartCallMenu';
import type { Contact, StartCallAction } from '@/types/outboundCall';
import styles from './OutboundCalls.module.scss';

const POPOVER_WIDTH = 272;
const POPOVER_GAP = 8;

export function PositionedProfilePopover({
  contact,
  anchorRect,
  onClose,
  onStartCall,
  onOpenDialer,
  dismissOnOutside = true,
}: {
  contact: Contact;
  anchorRect: DOMRect;
  onClose: () => void;
  onStartCall: (contactId: string, phoneIndex: number) => void;
  onOpenDialer: () => void;
  /** When false, ignore outside mousedown (walkthrough owns open/close). */
  dismissOnOutside?: boolean;
}) {
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
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState<number>(anchorRect.bottom + POPOVER_GAP);
  const [measured, setMeasured] = useState(false);
  const [closing, setClosing] = useState(false);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const h = ref.current.offsetHeight;
    const spaceBelow = window.innerHeight - anchorRect.bottom - POPOVER_GAP - 16;
    const spaceAbove = anchorRect.top - POPOVER_GAP - 16;
    const placeAbove = h > spaceBelow && spaceAbove >= h;
    setTop(
      placeAbove ? anchorRect.top - h - POPOVER_GAP : anchorRect.bottom + POPOVER_GAP,
    );
    setMeasured(true);
  }, [anchorRect]);

  // Stamp walkthrough focus on the phone-rows group (Compass has no data attrs).
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !measured) return;
    const links = root.querySelectorAll<HTMLElement>(
      'button[class*="profile-popover__meta-link"]',
    );
    if (links.length === 0) return;
    const first = links[0];
    const group =
      first.closest<HTMLElement>('[class*="profile-popover__meta"]') ??
      first.parentElement;
    if (!group) return;
    group.setAttribute('data-wt-focus', 'profile-phones');
    return () => group.removeAttribute('data-wt-focus');
  }, [contact.id, contact.phones, measured]);

  const beginClose = useCallback(() => setClosing(true), []);

  useEffect(() => {
    if (!dismissOnOutside) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) beginClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [beginClose, dismissOnOutside]);

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (closing && e.target === e.currentTarget) onClose();
  };

  const maxLeft = window.innerWidth - POPOVER_WIDTH - 16;
  const left = Math.min(Math.max(8, anchorRect.left), Math.max(8, maxLeft));

  return (
    <div
      ref={ref}
      className={styles['popover-anchor']}
      style={{ top, left, visibility: measured ? 'visible' : 'hidden' }}
    >
      <ProfilePopover
        avatarSrc={contact.avatar}
        avatarAlt={contact.name}
        name={contact.name}
        username={contact.handle}
        title={contact.title}
        email={contact.email}
        phones={contact.phones.map((p, i) => ({
          number: p.number,
          label: p.label,
          sipTrunk: p.sipTrunk,
          icon: phoneGlyphFor(p.kind, styles['phone-icon--secure']),
          onClick: () => onStartCall(contact.id, i),
        }))}
        jobRole={contact.role}
        localTime={contact.localTime}
        lastOnline={contact.online ? undefined : 'Last online 2 hrs ago'}
        onClose={beginClose}
        callButton={
          <PopoverCallButton
            actions={actions}
            onSelect={handleSelect}
            audioLabel={`Start audio call with ${contact.name}`}
          />
        }
        state={closing ? 'closing' : 'open'}
        onAnimationEnd={handleAnimationEnd}
      />
    </div>
  );
}
