/** Prototype types for the Outbound Calls / softphone playground. */

export type PhoneKind = 'standard' | 'conference' | 'secure';

export type Phone = {
  number: string;
  /** Category label, e.g. "NIPR", "NIPR Conf Bridge", "SIPR Extension". */
  label: string;
  kind: PhoneKind;
  /** Trunk / gateway identifier shown next to the label, e.g. "DSN", "DSN Gateway". */
  sipTrunk?: string;
};

export type Contact = {
  id: string;
  name: string;
  handle: string;
  email: string;
  title: string;
  role?: string;
  avatar: string;
  online: boolean;
  localTime?: { time: string; timezone: string; hourDifference?: string };
  phones: Phone[];
};

export type Recent = {
  contactId: string;
  phoneIndex: number;
  direction: 'outbound' | 'inbound-missed';
  timestamp: string;
  durationSec?: number;
};

export type AudioDeviceKind = 'laptop' | 'headphones' | 'external' | 'phone';
export type AudioDevice = { id: string; label: string; kind: AudioDeviceKind };

export type CallStatus = 'idle' | 'composing' | 'dialing' | 'connected' | 'ended';

export type BridgedStatus = 'dialing' | 'connected' | 'ended';

export type BridgedParticipant = {
  id: string;
  contactId: string;
  phoneIndex: number;
  status: BridgedStatus;
  startedAt: number | null;
};

export type ActiveCall = {
  contactId: string;
  phoneIndex: number;
  status: CallStatus;
  startedAt: number | null;
  endedAt: number | null;
  muted: boolean;
  deviceId: string;
  dtmf: string;
  bridgedParticipants: BridgedParticipant[];
  fromDialpad: boolean;
  pendingDtmf?: string;
};

export type AddMode = 'recents' | 'dialpad';

export type SceneId = 'channel' | 'dm' | 'dialer' | 'rhs' | 'team-sidebar';

export type StartCallAction =
  | { id: 'audio'; type: 'audio' }
  | { id: 'dialpad'; type: 'dialpad' }
  | { id: 'conference'; type: 'conference' }
  | {
      id: string;
      type: 'phone';
      label: string;
      number: string;
      kind: PhoneKind;
      sipTrunk?: string;
      contactId: string;
      phoneIndex: number;
    };

export type OutboundPostItem = {
  id: string;
  contactId: string;
  timestamp: string;
  body: string;
};
