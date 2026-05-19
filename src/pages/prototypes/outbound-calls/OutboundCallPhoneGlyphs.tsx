import type { ReactElement } from 'react';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import OutboundCallIcon from '@/components/icons/OutboundCallIcon';
import PhoneLockIcon from '@/components/icons/PhoneLockIcon';
import type { PhoneKind } from '@/types/outboundCall';

export function phoneLabelText(phone: { label: string; sipTrunk?: string }): string {
  return [phone.label, phone.sipTrunk].filter(Boolean).join(' • ');
}

export function phoneGlyphFor(
  kind: PhoneKind,
  secureClass?: string,
): ReactElement {
  if (kind === 'conference') return <OutboundCallIcon />;
  if (kind === 'secure') return <PhoneLockIcon className={secureClass} />;
  return <PhoneIcon />;
}
