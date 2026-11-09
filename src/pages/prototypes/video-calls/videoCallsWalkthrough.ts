import type { WalkthroughDocument } from '@/walkthrough/types';

/**
 * Guided walkthrough for Video Calls. Every `scene` is a `DemoSceneId`
 * (see `videoCalls.scenes.ts`); `VideoCalls.tsx` applies it with `goToDemo`.
 *
 * Story follows the video-calls UX spec: a direct message rings; a group
 * message or channel does not. Phone calls are only how they sit beside video.
 */
export const videoCallsWalkthrough: WalkthroughDocument = {
  prototypeId: 'video-calls',
  title: 'Video Calls',
  intent:
    'Start, join and run a video call from a direct message, group message or channel — in a small widget or an expanded window.',
  sections: [
    { id: 'overview', label: 'Overview' },
    { id: 'start', label: 'Starting a call' },
    { id: 'receive', label: 'Receiving a call' },
    { id: 'in-call', label: 'In the call' },
    { id: 'group', label: 'Group and channel calls' },
    { id: 'phone', label: 'Phone calls' },
  ],
  steps: [
    {
      id: 'why',
      section: 'overview',
      title: 'Video calls in the conversation',
      lead: 'Video calling starts as a one-to-one call in a direct message. Group messages and channels follow, for up to 10 people.\n\nUse Jump to to skip around. Back and Next step in order. Exit returns to free exploration.',
      scene: 'dm',
    },
    {
      id: 'start-dm',
      section: 'start',
      railGroup: 'Direct message',
      title: 'Start a call from the header',
      lead: 'The header button is a phone icon with a chevron. Its tooltip says Start call. It opens the ways to start.',
      lookFor: ['Start call menu'],
      bullets: [
        'Start video call opens setup with your camera on.',
        'Start audio call opens setup with the camera off. You can turn the camera on during the call.',
        'Copy call link copies a link to share. It does not start a call, and a notice confirms the copy.',
        'Call settings, below a divider, opens User Settings on the Calls tab, where call preferences live.',
        'When phone calling is also on, these rows sit under Mattermost call, and a Phone call group follows. That is later in this walkthrough.',
      ],
      scene: 'dm',
      sceneState: { startCallMenu: true },
      focus: {
        id: 'start-call-menu',
        emphasis: 'ring',
        notePlacement: 'left',
        note: {
          title: 'Video or audio',
          points: [
            'The menu choice sets whether your camera starts on.',
            'Copy call link does not place the call.',
          ],
        },
      },
    },
    {
      id: 'prejoin-widget',
      section: 'start',
      railGroup: 'Before you join',
      title: 'Check your camera and microphone',
      lead: 'Starting a call opens a small setup card before anyone is rung. This is the default.',
      lookFor: [
        'Microphone and camera, each with a device chevron',
        'Start call on the left, Cancel on the right',
      ],
      bullets: [
        'The title names who you are calling, for example Start call with Marco Rinaldi.',
        'Cancel returns to the conversation and does not ring anyone.',
        'A preference can skip this screen so the call starts immediately. Call settings is where that preference lives. Opening a call link always shows this screen.',
        'Accepting an incoming call does not show it.',
      ],
      scene: 'prejoin-widget',
      focus: {
        id: 'call-widget',
        emphasis: 'lightbox',
        note: {
          title: 'Setup before the call',
          points: [
            'Mute or turn the camera off before you start.',
            'Expand opens the same step in a larger window.',
          ],
        },
      },
    },
    {
      id: 'prejoin-window',
      section: 'start',
      railGroup: 'Before you join',
      title: 'The same setup, larger',
      lead: 'Expanding moves setup into a window over the conversation, with a larger preview and the line “Check your camera and microphone first.”',
      lookFor: ['Window over the conversation', 'Collapse'],
      bullets: [
        'A direct message says the other person will be called.',
        'Collapse returns to the small card without losing your choices.',
        'Start call and Cancel stay in the same order as in the widget.',
      ],
      scene: 'prejoin-window',
    },
    {
      id: 'calling-widget',
      section: 'start',
      railGroup: 'Ringing',
      title: 'A direct message rings',
      lead: 'Only a direct message rings the other person. The widget shows who you are calling until they answer.',
      lookFor: ['Outgoing call', 'Cancel, with a hang-up icon'],
      bullets: [
        'Cancel before they answer leaves a canceled call in the conversation.',
        'If they do not answer, the conversation shows a missed call.',
      ],
      scene: 'calling-widget',
      focus: {
        id: 'call-widget',
        emphasis: 'ring',
        note: {
          title: 'Waiting for an answer',
          points: ['The card stays until the call connects or you cancel.'],
        },
      },
    },
    {
      id: 'calling-window',
      section: 'start',
      railGroup: 'Ringing',
      title: 'Ringing, in the window',
      lead: 'The same waiting state can fill the call window: their picture, your microphone and camera, and Cancel.',
      lookFor: ['Their picture', 'Cancel, with a hang-up icon'],
      scene: 'calling-window',
    },
    {
      id: 'incoming',
      section: 'receive',
      title: 'An incoming call',
      lead: 'The person being called gets a card over the sidebar, with the caller and a choice to accept or decline.',
      lookFor: ['Incoming video call', 'Accept and Decline'],
      bullets: [
        'Accept joins straight away. There is no setup screen.',
        'Decline leaves a “Call declined” post in the conversation.',
        'If it rings out, the conversation shows a missed call instead.',
      ],
      scene: 'incoming',
      focus: {
        id: 'incoming-call',
        emphasis: 'lightbox',
        note: {
          title: 'Accept or decline',
          points: [
            'The card follows you. It is not tied to the open conversation.',
          ],
        },
      },
    },
    {
      id: 'joining',
      section: 'receive',
      title: 'Connecting after you accept',
      lead: 'After Accept, the card shows Joining call while the connection is set up, then the call goes live.',
      lookFor: ['Joining call'],
      bullets: [
        'This step stays in the widget. It cannot be expanded.',
        'The caller’s name stays on the card so it is clear who you are joining.',
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
      title: 'Talk without leaving the conversation',
      lead: 'Once connected, the widget sits over the sidebar. You can keep reading and typing.',
      lookFor: [
        'The other person in the video area, you in the corner',
        'Microphone, camera, share, more and leave',
        'Expand call window',
      ],
      bullets: [
        'In a direct message there is no people button. It appears in group and channel calls.',
        'More holds audio output, raise hand, record call, show chat thread and call info.',
        'The widget can be dragged. It snaps to the nearest corner.',
      ],
      scene: 'call-widget',
      focus: {
        id: 'call-widget',
        emphasis: 'lightbox',
        note: {
          title: 'The call stays with the conversation',
          points: ['Expand when you want the larger window.'],
        },
      },
    },
    {
      id: 'call-window',
      section: 'in-call',
      railGroup: 'Window',
      title: 'The expanded call',
      lead: 'The window gives the call the stage. In a direct message the other person fills it, and you sit in a small preview you can move.',
      lookFor: ['Video', 'Call controls along the bottom'],
      bullets: [
        'Collapse returns to the widget.',
        'Participants and chat open beside the stage, one at a time.',
        'Leave ends the call for both of you. A direct message ends as soon as either person leaves.',
      ],
      scene: 'call-window',
      focus: {
        id: 'call-controls',
        emphasis: 'ring',
        notePlacement: 'above',
        note: {
          title: 'Call controls',
          points: [
            'Microphone, camera, share, reactions, raise hand, chat and more.',
            'Leave hangs up.',
          ],
        },
      },
    },
    {
      id: 'screen-share',
      section: 'in-call',
      railGroup: 'Window',
      title: 'Sharing your screen',
      lead: 'While you share, the shared content takes the stage and a filmstrip of people sits beside it.',
      lookFor: ['Shared content', 'Share control in the call bar'],
      bullets: [
        'The header names what you are sharing and offers Stop.',
        'Stopping the share, or leaving the call, returns to the regular layout.',
        'In the widget, the video area is replaced by what you are sharing and a Stop sharing button.',
      ],
      scene: 'screen-share',
      focus: {
        id: 'call-controls',
        emphasis: 'ring',
        notePlacement: 'above',
        note: {
          title: 'Stop sharing here',
          points: ['The share control shows that you are sharing.'],
        },
      },
    },
    {
      id: 'start-group',
      section: 'group',
      railGroup: 'Group message',
      title: 'A group message does not ring',
      lead: 'The header button is the same, but a group call does not ring people one by one. After setup, you are already in the call. Others join when they want.',
      lookFor: ['Group conversation name', 'Start call in the header'],
      bullets: [
        'There is no calling, incoming or joining step in a group message.',
        'The conversation row shows a call icon once the call is running.',
      ],
      scene: 'gm',
      focus: {
        id: 'start-call',
        emphasis: 'ring',
        note: {
          title: 'Same button, no ring',
          points: [
            'Start video call or Start audio call, then you are in the call.',
          ],
        },
      },
    },
    {
      id: 'start-channel',
      section: 'group',
      railGroup: 'Channel',
      title: 'Channels work the same way',
      lead: 'A channel call is open to the channel. People join or leave without being rung.',
      lookFor: ['UX Design', 'Release Discussion in the sidebar'],
      bullets: [
        'Release Discussion already has a call running, so a call in another conversation is visible from the sidebar.',
        'Starting here is the same as a group message: setup, then you are in the call.',
      ],
      scene: 'channel',
    },
    {
      id: 'channel-ongoing',
      section: 'group',
      railGroup: 'Channel',
      title: 'Join a call that is already running',
      lead: 'When a channel call is going on without you, a banner under the header offers Join, and the header button becomes Join call.',
      lookFor: [
        'Banner with how many people, and how long the call has been going',
        'Join call in the header',
        'Call started in the thread',
      ],
      bullets: [
        'Join opens setup, then puts you in the call. Nobody is rung.',
        'Dismiss hides the banner for this visit. It comes back with the next call.',
        'The call card in the thread uses the same start time and also offers Join call.',
        'If you leave and someone else is still in it, the call keeps going and this banner returns.',
      ],
      scene: 'channel-ongoing',
      focus: {
        id: 'call-banner',
        emphasis: 'ring',
      },
    },
    {
      id: 'channel-window',
      section: 'group',
      railGroup: 'Channel',
      title: 'Everyone in the window',
      lead: 'With more than two people, the window can show a speaker layout or a grid. Speaker puts the person talking in the large tile and everyone else in a strip along the top.',
      lookFor: ['The strip of people', 'View'],
      bullets: [
        'View switches between speaker and grid. Grid keeps join order and does not reshuffle when someone talks.',
        'You are the host here. Hover another person’s name for Mute, Make host and Remove from call.',
        'Leave on your own does not end the call. Host passes to the person who joined next.',
      ],
      scene: 'channel-window',
      focus: {
        id: 'call-layout',
        emphasis: 'ring',
      },
    },
    {
      id: 'phone-start',
      section: 'phone',
      railGroup: 'Phone',
      title: 'A phone call sits in the same menu',
      lead: 'When phone calling is on, a direct message adds a Phone call group under the video and audio options. Group messages and channels do not offer it.',
      lookFor: ['Mattermost call', 'Phone call'],
      bullets: [
        'Each number is its own row: Call, the label, and the number under it. This prototype has one demo number.',
        'A phone call is audio only. It cannot become a video call.',
        'It skips setup and rings straight away, even when the pre-join screen is on.',
        'The rest of the phone-call flow lives in the Outbound Calls prototype.',
      ],
      scene: 'dm',
      sceneState: { startCallMenu: true },
      focus: {
        id: 'start-call-menu',
        emphasis: 'ring',
        notePlacement: 'left',
        note: {
          title: 'Two kinds of call',
          points: [
            'Mattermost call: video or audio, in the call window.',
            'Phone call: the number, in the widget only.',
          ],
        },
      },
    },
    {
      id: 'phone-calling',
      section: 'phone',
      railGroup: 'Phone',
      title: 'Dialing a phone number',
      lead: 'A phone call rings in the small widget only. There is no setup screen and no call window.',
      lookFor: ['Calling, with the name', 'The number', 'Cancel'],
      bullets: [
        'The ringing sound is different from a Mattermost call.',
        'This prototype answers after a few seconds and moves on to the call.',
      ],
      scene: 'phone-calling',
      focus: {
        id: 'call-widget',
        emphasis: 'ring',
        note: {
          title: 'Widget only',
          points: ['No camera, and no way to expand into a window.'],
        },
      },
    },
    {
      id: 'phone-call',
      section: 'phone',
      railGroup: 'Phone',
      title: 'On the phone',
      lead: 'A connected phone call keeps the widget and drops what a phone line cannot do.',
      lookFor: [
        'Phone badge and number',
        'Microphone and hang up',
        'No camera, share or expand',
      ],
      bullets: [
        'You can still switch microphones during the call.',
        'Hang up ends the call at once, the same as a one-to-one video call.',
      ],
      scene: 'phone-call',
      focus: {
        id: 'call-widget',
        emphasis: 'ring',
        note: {
          title: 'Same card, fewer controls',
          points: ['Microphone, keypad and hang up.'],
        },
      },
    },
  ],
};
