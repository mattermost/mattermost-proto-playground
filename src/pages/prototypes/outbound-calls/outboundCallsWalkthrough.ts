import type { WalkthroughDocument } from '@/walkthrough/types';

/** Proof walkthrough for the Outbound Calls prototype. */
export const outboundCallsWalkthrough: WalkthroughDocument = {
  prototypeId: 'outbound-calls',
  title: 'Outbound Calls',
  intent: 'Start phone calls from Channels without leaving the conversation.',
  sections: [
    {
      id: 'overview',
      label: 'Overview',
    },
    {
      id: 'entry-points',
      label: 'Entry points',
    },
    {
      id: 'in-call',
      label: 'In call',
    },
  ],
  steps: [
    {
      id: 'why',
      section: 'overview',
      title: 'Why outbound calling',
      lead: 'Operators need to dial a number or a teammate without leaving the channel they are coordinating in.',
      lookFor: ['Team sidebar dial pad', 'Channel header call actions', 'Softphone PIP when a call starts'],
      bullets: [
        'This walkthrough highlights the main entry points in the playground.',
        'Use Jump to move non-linearly; Back and Next step through in order.',
        'Exit returns you to free exploration with the Scene switcher.',
      ],
      scene: 'channel',
    },
    {
      id: 'team-dialpad',
      section: 'entry-points',
      railGroup: 'Team sidebar',
      title: 'Dial pad on the team sidebar',
      lead: 'The dial pad control lives on the team rail so it is available from any channel view.',
      lookFor: ['Phone glyph at the bottom of the team sidebar'],
      bullets: [
        'The control stays on the rail while you move between channels.',
        'Opening it starts a composing softphone session.',
      ],
      scene: 'team-sidebar',
      focus: {
        id: 'team-dialpad',
        emphasis: 'ring',
        note: {
          title: 'Always within reach',
          points: [
            'The dial pad sits on the team rail, not buried in a channel menu.',
            'It stays available while you move between channels.',
          ],
        },
      },
    },
    {
      id: 'team-dialpad-open',
      section: 'entry-points',
      railGroup: 'Team sidebar',
      title: 'Compose from the dial pad',
      lead: 'Opening the dial pad brings up the softphone PIP in a composing state.',
      lookFor: ['Composing softphone PIP', 'Keypad ready for digits'],
      bullets: [
        'Operators can type or tap digits, then place the call.',
        'The channel stays visible underneath the PIP.',
      ],
      scene: 'team-sidebar',
      sceneState: { dialpad: true },
      focus: {
        id: 'call-pip',
        emphasis: 'lightbox',
        note: {
          title: 'Ready to dial',
          points: [
            'The PIP opens in a composing state from the team rail.',
            'Enter a number here, then start the call without leaving the channel.',
          ],
        },
      },
    },
    {
      id: 'dm-call',
      section: 'entry-points',
      railGroup: 'Direct message',
      title: 'Call from a DM',
      lead: 'From a direct message, start a call to the person you are already talking to.',
      lookFor: ['DM with Aiko Tan', 'Start call menu in the header'],
      bullets: [
        'DM context carries the contact, so the call targets the right person.',
        'The same softphone PIP handles dialing and connected states.',
      ],
      scene: 'dm',
      sceneState: { startCallMenu: true },
      focus: {
        id: 'call-nipr',
        emphasis: 'ring',
      },
    },
    {
      id: 'channel-call',
      section: 'entry-points',
      railGroup: 'Channel',
      title: 'Call from a channel',
      lead: 'Channel views expose call and conference actions without leaving the thread of work.',
      lookFor: ['op-nightingale channel', 'Profile popover with call actions'],
      bullets: [
        'Conference bridge entry is available for multi-party ops calls.',
        'Profile popovers on people also offer call actions.',
      ],
      scene: 'channel',
      sceneState: { popover: { contactId: 'aiko' } },
      focus: {
        id: 'profile-phones',
        emphasis: 'ring',
        note: {
          title: 'Call from a profile',
          points: [
            'Phone numbers in the popover start an outbound call.',
            'The channel stays underneath so you never leave context.',
          ],
        },
      },
    },
    {
      id: 'pip',
      section: 'in-call',
      title: 'Softphone PIP',
      lead: 'Once a call is active, the PIP is the control surface for mute, keypad, devices, and hang up.',
      lookFor: ['Floating call widget', 'Connected call with Aiko Tan'],
      bullets: [
        'Mute, keypad, device picker, and hang up all live on the PIP.',
        'The channel stays visible underneath so coordination can continue.',
      ],
      scene: 'channel',
      sceneState: {
        call: { contactId: 'aiko', status: 'connected' },
      },
      focus: {
        id: 'call-pip',
        emphasis: 'lightbox',
      },
    },
    {
      id: 'message-phone',
      section: 'entry-points',
      railGroup: 'Channel',
      title: 'Call a number from a message',
      lead: 'Phone numbers posted in channel messages are clickable — tap to start an outbound call without copying the digits.',
      lookFor: ['Leonard Riley’s message in op-nightingale', 'Clickable 555-0174 link'],
      bullets: [
        'Inline numbers stay in the thread so teammates can share lines as they coordinate.',
        'One click opens the softphone to that number.',
      ],
      scene: 'channel',
      focus: {
        id: 'message-phone',
        emphasis: 'ring',
        note: {
          title: 'Numbers in-message',
          points: [
            'Click a phone number in a message to dial it.',
            'You stay in the channel while the call starts.',
          ],
        },
      },
    },
  ],
};
