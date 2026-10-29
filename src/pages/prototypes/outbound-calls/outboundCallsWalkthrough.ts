import type { WalkthroughDocument } from '@/walkthrough/types';

/** Guided walkthrough for the Outbound Calls prototype (Phase 1 + Phase 2). */
export const outboundCallsWalkthrough: WalkthroughDocument = {
  prototypeId: 'outbound-calls',
  title: 'Outbound Calls',
  intent:
    'Place outbound phone calls from profile, DM, messages, or dial pad — without leaving Channels.',
  sections: [
    { id: 'overview', label: 'Overview' },
    { id: 'call-a-person', label: 'Call a person' },
    { id: 'links-in-messages', label: 'Links in messages' },
    { id: 'phone-mode', label: 'Phone-mode widget' },
    { id: 'dial-pad', label: 'Dial pad' },
    { id: 'compose-tel', label: 'Compose with tel:' },
  ],
  steps: [
    {
      id: 'why',
      section: 'overview',
      title: 'Why outbound calling',
      lead: 'Operators place outbound phone calls from Channels without leaving the thread they are coordinating in.',
      lookFor: [
        'Profile phone rows',
        'DM Start call menu',
        'Team sidebar dial pad',
        'Phone-mode softphone PIP',
      ],
      bullets: [
        'This walkthrough covers person entry points, in-message links, phone-mode controls, and dial pad.',
        'Use Jump to move non-linearly; Back and Next step through in order.',
        'Exit returns you to free exploration with the Scene switcher.',
      ],
      scene: 'channel',
    },
    {
      id: 'profile-phones',
      section: 'call-a-person',
      railGroup: 'Profile',
      title: 'Dial from a profile',
      lead: 'Dialable numbers on a profile appear as labeled phone rows on the popover.',
      lookFor: ['Aiko Tan profile popover', 'Labeled phone rows'],
      bullets: [
        'Each row shows a label and number — tap to start an outbound call.',
        'You stay in the channel while the softphone opens.',
      ],
      scene: 'channel',
      sceneState: { popover: { contactId: 'aiko' } },
      focus: {
        id: 'profile-phones',
        emphasis: 'ring',
        note: {
          title: 'Labeled numbers',
          points: [
            'Labels help you pick which line you are dialing.',
            'The channel stays underneath so you never leave context.',
          ],
        },
      },
    },
    {
      id: 'profile-call-menu',
      section: 'call-a-person',
      railGroup: 'Profile',
      title: 'Call menu on the profile',
      lead: 'The Call chevron opens Mattermost audio alongside outbound call options for each dialable number.',
      lookFor: ['Call ▾ on the profile action bar'],
      bullets: [
        'Mattermost Calls stay separate from outbound phone rows.',
        'Unavailable numbers can appear greyed with “Not available on this network” when the line is offline.',
      ],
      scene: 'channel',
      sceneState: { popover: { contactId: 'aiko' } },
      focus: {
        id: 'profile-call-menu',
        emphasis: 'ring',
        notePlacement: 'right',
        note: {
          title: 'Two call types',
          points: [
            'Start an audio call uses Mattermost Calls.',
            'Call options for each number place an outbound phone call.',
          ],
        },
      },
    },
    {
      id: 'dm-start-call',
      section: 'call-a-person',
      railGroup: 'Direct message',
      title: 'Call from a DM header',
      lead: 'In a DM, Start call ▾ offers Mattermost audio plus outbound call options for each dialable number on that person.',
      lookFor: ['DM with Aiko Tan', 'Outbound call options in the menu'],
      bullets: [
        'DM context already knows the contact — pick the line, not the person.',
        'Outbound rows show the number under the call action.',
      ],
      scene: 'dm',
      sceneState: { startCallMenu: true },
      focus: {
        id: 'call-label',
        emphasis: 'ring',
        note: {
          title: 'Call a listed number',
          points: [
            'Pick a labeled number to place an outbound call.',
            'Start an audio call stays the Mattermost Calls path.',
          ],
        },
      },
    },
    {
      id: 'dm-use-dialpad',
      section: 'call-a-person',
      railGroup: 'Direct message',
      title: 'Open the dial pad from a DM',
      lead: 'Use dial pad in the Start call menu opens the softphone for an ad-hoc number without leaving the DM.',
      lookFor: ['Use dial pad row in the Start call menu'],
      bullets: [
        'Use this when the number is not on the contact’s profile.',
        'The composing PIP opens over the same DM thread.',
      ],
      scene: 'dm',
      sceneState: { startCallMenu: true },
      focus: {
        id: 'dm-use-dialpad',
        emphasis: 'ring',
        note: {
          title: 'Ad-hoc dialing',
          points: [
            'Use dial pad jumps to the softphone keypad.',
            'Recent and dial pad tabs are available once the PIP is open.',
          ],
        },
      },
    },
    {
      id: 'message-phone',
      section: 'links-in-messages',
      railGroup: 'Channel',
      title: 'Call a number from a message',
      lead: 'Phone numbers in messages auto-link — click to start an outbound call without copying digits.',
      lookFor: ['Leonard Riley’s message in op-nightingale', 'Clickable 555-0174 link'],
      bullets: [
        'Inline numbers stay in the thread so teammates can share lines as they coordinate.',
        'One click opens the softphone to that number; you remain in the channel.',
      ],
      scene: 'channel',
      focus: {
        id: 'message-phone',
        emphasis: 'ring',
        note: {
          title: 'Numbers in-message',
          points: [
            'Click a phone number in a message to dial it.',
            'Call context stays with the posting channel.',
          ],
        },
      },
    },
    {
      id: 'pip',
      section: 'phone-mode',
      title: 'Phone-mode softphone',
      lead: 'While dialing you see Calling… with a pulse; once connected, a timer and mute, devices, keypad, and hang up appear — with no expand or popout.',
      lookFor: ['Floating phone-mode PIP', 'Connected call with timer', 'No expand control'],
      bullets: [
        'Hang up ends the call immediately — no confirmation.',
        'Video, screen share, and raise hand stay hidden in phone mode.',
        'The channel remains visible underneath so coordination continues.',
      ],
      scene: 'channel',
      sceneState: {
        call: { contactId: 'aiko', status: 'connected' },
      },
      focus: {
        id: 'call-pip',
        emphasis: 'lightbox',
        note: {
          title: 'Phone mode ≠ popout',
          points: [
            'Outbound softphone stays a compact PIP — no expand to a full call window.',
            'Mute, devices, keypad, and hang up live here.',
          ],
        },
      },
    },
    {
      id: 'pip-dtmf',
      section: 'phone-mode',
      title: 'Send DTMF tones',
      lead: 'Open the keypad on a connected call to send tones for IVR menus, conference PINs, or extensions.',
      lookFor: ['Dial pad panel on the PIP', 'Keypad grid'],
      bullets: [
        'Keypad is enabled once the call is connected.',
        'Tones play as you press keys; the channel stays underneath.',
      ],
      scene: 'channel',
      sceneState: {
        call: { contactId: 'aiko', status: 'connected', keypad: true },
      },
      focus: {
        id: 'pip-dtmf',
        emphasis: 'ring',
        note: {
          title: 'In-call keypad',
          points: [
            'Use DTMF for IVR, PIN entry, or extensions mid-call.',
            'Close the panel when you are done — the call keeps running.',
          ],
        },
      },
    },
    {
      id: 'team-dialpad',
      section: 'dial-pad',
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
      section: 'dial-pad',
      railGroup: 'Team sidebar',
      title: 'Compose from the dial pad',
      lead: 'Opening the dial pad brings up the softphone PIP in a composing state — the Call button stays disabled until you enter digits.',
      lookFor: ['Composing softphone PIP', 'Keypad ready for digits', 'Disabled call button when empty'],
      bullets: [
        'Type or tap digits, then place the call.',
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
            'The PIP opens composing from the team rail.',
            'Enter a number before the call button arms.',
          ],
        },
      },
    },
    {
      id: 'dialpad-recent',
      section: 'dial-pad',
      railGroup: 'Team sidebar',
      title: 'Redial from Recent',
      lead: 'The Recent tab lists prior outbound calls so you can redial without re-entering the number.',
      lookFor: ['Recent tab on the composing PIP', 'Prior call rows'],
      bullets: [
        'Switch between Dial pad and Recent without closing the PIP.',
        'Pick a row to place the call again.',
      ],
      scene: 'team-sidebar',
      sceneState: { dialpad: true, composeTab: 'recent' },
      focus: {
        id: 'dialpad-recent',
        emphasis: 'ring',
        note: {
          title: 'Recent calls',
          points: [
            'Recent is for redial — not a full call history product surface.',
            'Conference stays a separate tab for later tiers.',
          ],
        },
      },
    },
    {
      id: 'tel-autocomplete',
      section: 'compose-tel',
      railGroup: 'Direct message',
      title: 'Insert a number with tel:',
      lead: 'Typing tel: in the composer opens autocomplete across contacts and their dialable numbers.',
      lookFor: ['tel: in the DM composer', 'Suggestion menu with names and numbers'],
      bullets: [
        'Pick a suggestion to insert tel:<number> into the message.',
        'Useful when sharing a dialable line in-thread for others to click later.',
      ],
      scene: 'dm',
      sceneState: { telAutocomplete: true },
      focus: {
        id: 'tel-autocomplete',
        emphasis: 'ring',
        note: {
          title: 'Composer shortcuts',
          points: [
            'tel: filters contacts and their phone numbers.',
            'Inserted links stay clickable for outbound dial later.',
          ],
        },
      },
    },
  ],
};
