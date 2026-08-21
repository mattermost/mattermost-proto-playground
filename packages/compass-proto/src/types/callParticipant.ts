export type ParticipantKind = 'user' | 'external-link' | 'dial-in';

export type Participant = {
  id: string;
  name: string;
  avatarSrc?: string;
  host?: boolean;
  talking?: boolean;
  muted?: boolean;
  kind?: ParticipantKind;
  external?: boolean;
};
