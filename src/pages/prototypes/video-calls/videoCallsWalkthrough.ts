import type { WalkthroughDocument } from '@/walkthrough/types';

/**
 * Guided walkthrough for Video Calls. Every `scene` is a `DemoSceneId`
 * (see `videoCalls.scenes.ts`); `VideoCalls.tsx` applies it with `goToDemo`.
 */
export const videoCallsWalkthrough: WalkthroughDocument = {
  prototypeId: 'video-calls',
  title: 'Video Calls',
  intent:
    'Start, join and run video calls from a DM, group message or channel — in a small widget or an expanded window.',
  sections: [
    { id: 'overview', label: 'Overview' },
    { id: 'start', label: 'Starting a call' },
    { id: 'receive', label: 'Receiving a call' },
    { id: 'in-call', label: 'In the call' },
    { id: 'phone', label: 'Phone calls' },
  ],
  steps: [
    {
      id: 'why',
      section: 'overview',
      title: 'Video calls where the conversation is',
      lead: 'Calls start from the conversation you are already in, so people never leave the thread to talk face to face.',
      lookFor: [
        'Call button (a phone icon) in the channel header',
        'The conversation staying visible while a call runs',
      ],
      bullets: [
        'The same call works in a one-to-one message, a group message and a channel.',
        'A call lives in a small widget by default and can expand into its own window.',
        'Use Jump to skip around; Back and Next step in order. Exit returns to free exploration.',
      ],
      scene: 'dm',
    },
    {
      id: 'start-dm',
      section: 'start',
      railGroup: 'Direct message',
      title: 'Start a call from a message',
      lead: 'The call button in the header, a phone icon with a chevron, offers a video or an audio call.',
      lookFor: [
        'Call button (hover for “Start call”)',
        'Video and audio options',
      ],
      bullets: [
        'Start video call turns your camera on in the next step.',
        'Start audio call keeps the camera off.',
        'Copy call link copies the link to share; it does not start a call.',
        'Call settings, below a divider, is where call preferences live. It is only a placeholder in this prototype.',
        'While a call runs, the same button turns green: “Join call” when a group or channel call is running without you, “In call” once you are in it.',
      ],
      scene: 'dm',
      focus: {
        id: 'start-call',
        emphasis: 'ring',
        note: {
          title: 'One button, two ways to start',
          points: [
            'Choose video or audio from the menu.',
            'In a one-to-one message the other person is rung.',
          ],
        },
      },
    },
    {
      id: 'start-group',
      section: 'start',
      railGroup: 'Group message',
      title: 'Group messages start a shared call',
      lead: 'In a group message the call is not rung to anyone one by one — it opens for the whole group to join.',
      lookFor: [
        'Group conversation name in the sidebar',
        'Call button in the header',
      ],
      bullets: [
        'Members see an ongoing call and can join whenever they like.',
        'The sidebar row for the conversation shows an in-call icon while a call runs.',
      ],
      scene: 'gm',
    },
    {
      id: 'start-channel',
      section: 'start',
      railGroup: 'Channel',
      title: 'Channels work the same way',
      lead: 'A channel call is open to the channel, so people can join or leave without being rung.',
      lookFor: ['Channel header', 'Sidebar rows with a call in progress'],
      bullets: [
        'Another channel in the sidebar already has a call running, so you can spot active calls at a glance.',
      ],
      scene: 'channel',
    },
    {
      id: 'prejoin-widget',
      section: 'start',
      railGroup: 'Before you join',
      title: 'Check your setup first',
      lead: 'Before anyone is rung, a small setup card lets you check your microphone and camera.',
      lookFor: [
        'Microphone and camera toggles',
        'Level meter',
        'Start call (green) on the left, Cancel on the right',
      ],
      bullets: [
        'The chevrons next to the toggles pick which device to use.',
        'Cancel leaves without ringing anyone.',
        'This screen is the default when you start a call. A setting, “Skip the pre-join screen”, starts calls straight away instead.',
        'Opening a call link, or joining a call that is already running, always shows it.',
        'When video calls are off, the same screen only checks your microphone.',
      ],
      scene: 'prejoin-widget',
      focus: {
        id: 'call-widget',
        emphasis: 'lightbox',
        note: {
          title: 'Setup before the call',
          points: [
            'Mute or switch off video before you start.',
            'Expand opens the same step in a larger window.',
          ],
        },
      },
    },
    {
      id: 'prejoin-window',
      section: 'start',
      railGroup: 'Before you join',
      title: 'The same setup, expanded',
      lead: 'Expanding moves the setup into a larger window over the conversation, with a bigger preview of your camera.',
      lookFor: ['Window floating over the conversation', 'Collapse control'],
      bullets: [
        'Collapse returns to the small widget without losing your choices.',
        'Start call (green) and Cancel sit in the same order as in the widget.',
      ],
      scene: 'prejoin-window',
    },
    {
      id: 'calling-widget',
      section: 'start',
      railGroup: 'Ringing',
      title: 'Waiting for an answer',
      lead: 'In a one-to-one message the other person is rung, and the widget shows who you are calling.',
      lookFor: ['Outgoing call card', 'Cancel, with a hang-up icon'],
      bullets: ['You can cancel at any time before they answer.'],
      scene: 'calling-widget',
      focus: {
        id: 'call-widget',
        emphasis: 'ring',
        note: {
          title: 'Outgoing call',
          points: ['The card stays in place until the call connects.'],
        },
      },
    },
    {
      id: 'calling-window',
      section: 'start',
      railGroup: 'Ringing',
      title: 'Ringing, expanded',
      lead: 'The ringing state also has a larger version in the call window.',
      lookFor: [
        'Peer avatar',
        'Mic and camera controls',
        'Cancel, with a hang-up icon',
      ],
      scene: 'calling-window',
    },
    {
      id: 'incoming',
      section: 'receive',
      title: 'An incoming call',
      lead: 'The person being called sees a card with the caller and the choice to accept or decline.',
      lookFor: ['Caller name and avatar', 'Accept (green) and Decline'],
      bullets: [
        'Declining leaves a “Call declined” post in the conversation.',
        'A call that rings out leaves a missed-call post instead.',
      ],
      scene: 'incoming',
      focus: {
        id: 'incoming-call',
        emphasis: 'lightbox',
        note: {
          title: 'Accept or decline',
          points: ['The card appears over the sidebar, wherever you are.'],
        },
      },
    },
    {
      id: 'joining',
      section: 'receive',
      title: 'Connecting after accepting',
      lead: 'After Accept, the same card shows a joining state while the connection is set up, then the call goes live.',
      lookFor: ['Joining call card'],
      bullets: [
        'The caller is named in the card so it is clear who you are joining.',
      ],
      scene: 'joining',
      focus: {
        id: 'call-widget',
        emphasis: 'ring',
      },
    },
    {
      id: 'call-widget',
      section: 'in-call',
      railGroup: 'Widget',
      title: 'The call in the widget',
      lead: 'Once connected, the widget stays over the sidebar so you can keep reading and typing while you talk.',
      lookFor: [
        'Participant tiles and call timer',
        'Mic, camera, share, more and leave controls',
        'Expand call window',
      ],
      bullets: [
        'The more menu holds devices, raise hand, recording, call chat and call info.',
        'The widget can be dragged out of the way.',
      ],
      scene: 'call-widget',
      focus: {
        id: 'call-widget',
        emphasis: 'lightbox',
        note: {
          title: 'Keep working while you talk',
          points: [
            'The conversation behind the widget stays fully usable.',
            'Expand when you want a bigger view.',
          ],
        },
      },
    },
    {
      id: 'call-window',
      section: 'in-call',
      railGroup: 'Window',
      title: 'The expanded call window',
      lead: 'The window gives the call the whole stage: large video tiles and a control bar along the bottom.',
      lookFor: [
        'Video tiles',
        'Your own camera in a movable preview',
        'Call controls bar',
      ],
      bullets: [
        'The layout control switches between speaker and grid views.',
        'Participants and call chat open beside the stage.',
      ],
      scene: 'call-window',
      focus: {
        id: 'call-controls',
        emphasis: 'ring',
        notePlacement: 'above',
        note: {
          title: 'Call controls',
          points: [
            'Mic, camera, share screen, reactions, raise hand, chat and more.',
            'Leave ends your part in the call.',
          ],
        },
      },
    },
    {
      id: 'screen-share',
      section: 'in-call',
      railGroup: 'Window',
      title: 'Sharing your screen',
      lead: 'While sharing, the window shifts to a share layout so the shared content gets the room.',
      lookFor: ['Shared content in the stage', 'Share control in the call bar'],
      bullets: ['Stopping the share returns to the regular video layout.'],
      scene: 'screen-share',
      focus: {
        id: 'call-controls',
        emphasis: 'ring',
        notePlacement: 'above',
        note: {
          title: 'Stop sharing here',
          points: ['The share control in the bar shows that you are sharing.'],
        },
      },
    },
    {
      id: 'phone-start',
      section: 'phone',
      railGroup: 'Phone',
      title: 'Phone calls sit next to video calls',
      lead: 'When phone calling is on, a message header adds a Phone call group under the video and audio options. It is not offered in group messages or channels.',
      lookFor: ['Call button', 'Mattermost call and Phone call groups'],
      bullets: [
        'The phone number is a fixed demo number here; the full outbound flow lives in the Outbound Calls prototype.',
        'Mattermost call groups Start video call, Start audio call and Copy call link. Phone call lists the number to dial.',
        'Without phone calling the menu has no groups. With video calling off it offers Start audio call and Copy call link, and calls are audio only.',
      ],
      scene: 'dm',
      focus: {
        id: 'start-call',
        emphasis: 'ring',
        note: {
          title: 'One menu, two kinds of call',
          points: [
            'Mattermost calls: video or audio.',
            'Phone call: dials the number straight away, with no pre-join, even if pre-join is on.',
          ],
        },
      },
    },
    {
      id: 'phone-calling',
      section: 'phone',
      railGroup: 'Phone',
      title: 'Dialing a phone number',
      lead: 'A phone call goes straight to ringing, in the small widget only. There is no setup screen and no window.',
      lookFor: [
        'Calling name and number',
        'Phone badge',
        'Cancel, with a hang-up icon',
      ],
      bullets: [
        'A different ringing sound from a Mattermost call, so the two are easy to tell apart.',
        'The prototype answers after a few seconds and moves on to the call itself.',
      ],
      scene: 'phone-calling',
      focus: {
        id: 'call-widget',
        emphasis: 'ring',
        note: {
          title: 'Compact by design',
          points: [
            'No video area, since a phone line carries audio only.',
            'The number and its label sit under the name.',
          ],
        },
      },
    },
    {
      id: 'phone-call',
      section: 'phone',
      railGroup: 'Phone',
      title: 'A phone call uses the same widget',
      lead: 'A phone call is audio only. It keeps the widget but drops what a phone line cannot do.',
      lookFor: [
        'Phone badge and number',
        'Keypad button',
        'No camera, share or expand',
      ],
      bullets: [
        'The widget only: a phone call has no call window.',
        'A phone call cannot become a video call.',
        'Hang up ends the call at once, like a one-to-one video call.',
      ],
      scene: 'phone-call',
      focus: {
        id: 'call-widget',
        emphasis: 'ring',
        note: {
          title: 'Same card, fewer controls',
          points: [
            'Microphone, keypad and hang up.',
            'Camera, share, participants and expand are hidden.',
          ],
        },
      },
    },
  ],
};
