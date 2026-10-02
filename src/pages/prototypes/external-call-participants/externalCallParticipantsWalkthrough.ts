import type { WalkthroughDocument } from '@/walkthrough/types';

/** Guided walkthrough for External Call Participants. */
export const externalCallParticipantsWalkthrough: WalkthroughDocument = {
  prototypeId: 'external-call-participants',
  title: 'External Call Participants',
  intent:
    'Let partners join a channel call without a Mattermost account — via guest link or dial-in.',
  sections: [
    { id: 'overview', label: 'Overview' },
    { id: 'host', label: 'Host experience' },
    { id: 'guest', label: 'Guest experience' },
  ],
  steps: [
    {
      id: 'why',
      section: 'overview',
      title: 'Why external participants',
      lead: 'Channel calls often need partners who should not need a Mattermost login — share a guest link or dial-in instead.',
      lookFor: [
        'UX Design channel thread mentioning the external link',
        'Floating call widget while the call is live',
      ],
      bullets: [
        'This walkthrough covers host Call info, the roster, and the guest join path.',
        'Use Jump to skip around; Back and Next step in order.',
        'Exit returns you to free exploration with the Scene switcher.',
      ],
      scene: 'widget',
    },
    {
      id: 'widget',
      section: 'host',
      railGroup: 'Call widget',
      title: 'In-channel call widget',
      lead: 'While the call is active, the docked widget stays on the channel so coordination continues underneath.',
      lookFor: ['Floating call widget', 'Participant count on the widget', 'More (•••) control'],
      bullets: [
        'Expand opens the full popout.',
        'The participant count opens the roster, including external guests.',
      ],
      scene: 'widget',
      focus: {
        id: 'call-widget',
        emphasis: 'lightbox',
        note: {
          title: 'Stay in the channel',
          points: [
            'The widget floats over the thread while the call runs.',
            'Open Call info or Participants from here.',
          ],
        },
      },
    },
    {
      id: 'open-call-info',
      section: 'host',
      railGroup: 'Call widget',
      title: 'Open Call info from the widget',
      lead: 'The more menu (•••) on the widget is how hosts reach Call info without leaving the channel.',
      lookFor: ['Widget more menu open', 'Call info menu item'],
      bullets: [
        'Call info holds guest access, links, and dial-in details.',
        'Other menu rows (devices, record, chat) stay available from the same control.',
      ],
      scene: 'widget',
      sceneState: { widgetOverlay: 'menu' },
      focus: {
        id: 'widget-call-info-menu',
        emphasis: 'ring',
        notePlacement: 'right',
        note: {
          title: 'Call info entry',
          points: [
            'Choose Call info to open the panel on this widget.',
            'Hosts use it to enable external participants for the call.',
          ],
        },
      },
    },
    {
      id: 'enable-external',
      section: 'host',
      railGroup: 'Call info',
      title: 'Enable external participants',
      lead: 'Call info is where the host turns on guest access for this call.',
      lookFor: ['Call info panel on the widget', 'Enable external participants switch'],
      bullets: [
        'Off by default until the host opts in for this call.',
        'Turning it on reveals the guest link and dial-in details.',
      ],
      scene: 'widget',
      sceneState: { widgetOverlay: 'info', externalEnabled: false },
      focus: {
        id: 'call-info-external-toggle',
        emphasis: 'ring',
        note: {
          title: 'Host opt-in',
          points: [
            'Only hosts see this toggle.',
            'Enable it when partners need to join without an account.',
          ],
        },
      },
    },
    {
      id: 'share-details',
      section: 'host',
      railGroup: 'Call info',
      title: 'Share guest link and dial-in',
      lead: 'Once enabled, Call info shows the external link plus SIP number and PIN to copy into the thread.',
      lookFor: ['External link', 'Dial-in number and PIN', 'Copy full details'],
      bullets: [
        'External link opens the guest welcome gate in a browser.',
        'Dial-in covers partners who cannot use a browser (e.g. shop floor).',
      ],
      scene: 'widget',
      sceneState: { widgetOverlay: 'info', externalEnabled: true },
      focus: {
        id: 'call-info-external-details',
        emphasis: 'lightbox',
        note: {
          title: 'Two ways in',
          points: [
            'Copy the guest link for browser joiners.',
            'Share dial-in + PIN for phone-only participants.',
          ],
        },
      },
    },
    {
      id: 'roster-external',
      section: 'host',
      railGroup: 'Participants',
      title: 'External guests in the roster',
      lead: 'The participants panel groups link and dial-in joiners under External Participants with an EXTERNAL tag.',
      lookFor: [
        'External Participants heading',
        'James Smith (guest link)',
        'Dial-in number row',
      ],
      bullets: [
        'Guest-link joiners show a silhouette; dial-in shows a phone glyph.',
        'INTERNAL teammates stay in the list above the divider.',
      ],
      scene: 'widget',
      sceneState: { widgetOverlay: 'participants', externalEnabled: true },
      focus: {
        id: 'participants-external',
        emphasis: 'lightbox',
        note: {
          title: 'Labeled clearly',
          points: [
            'External rows sit in their own group.',
            'EXTERNAL tags make guest status obvious at a glance.',
          ],
        },
      },
    },
    {
      id: 'popout-grid',
      section: 'host',
      railGroup: 'Popout',
      title: 'External tiles in the popout',
      lead: 'In the expanded call window, guest-link and dial-in participants appear as tiles with an EXTERNAL label.',
      lookFor: ['James Smith tile', 'Dial-in phone tile', 'EXTERNAL labels'],
      bullets: [
        'Same roster as the widget — expanded for the full call stage.',
        'Host controls stay available on each tile.',
      ],
      scene: 'popout',
      sceneState: { externalEnabled: true },
      focus: {
        id: 'popout-external-tiles',
        emphasis: 'ring',
        note: {
          title: 'Visible on stage',
          points: [
            'Guest-link tiles use a silhouette fallback.',
            'Dial-in tiles use a phone glyph on green.',
          ],
        },
      },
    },
    {
      id: 'popout-call-info',
      section: 'host',
      railGroup: 'Popout',
      title: 'Call info from the popout',
      lead: 'The popout header opens the same Call info surface — toggle, links, and dial-in — without collapsing back to the widget.',
      lookFor: ['Info control in the popout header', 'Call info popover'],
      bullets: [
        'Host variant includes the internal link and external toggle.',
        'Details match what was shared from the widget.',
      ],
      scene: 'popout',
      sceneState: { callInfoOpen: true, externalEnabled: true },
      focus: {
        id: 'call-info-panel',
        emphasis: 'lightbox',
      },
    },
    {
      id: 'welcome',
      section: 'guest',
      title: 'Guest welcome gate',
      lead: 'The external link lands on a welcome screen — guests enter a display name before joining the call.',
      lookFor: ['Welcome to the call', 'Name field', 'Join as a guest footer'],
      bullets: [
        'No Mattermost account or login is required.',
        'The name they enter is what hosts see in the roster.',
      ],
      scene: 'welcome',
      focus: {
        id: 'welcome-card',
        note: {
          title: 'Name before join',
          points: [
            'Guests type a display name, then Join.',
            'Footer confirms they join as a guest.',
          ],
        },
      },
    },
    {
      id: 'guest-view',
      section: 'guest',
      title: 'Guest call view',
      lead: 'After joining, the guest gets a fullscreen call stage focused on the room — not the host channel shell.',
      lookFor: ['Fullscreen call', 'Guest shown as a participant', 'EXTERNAL labels on guests'],
      bullets: [
        'Guest Call info omits the host toggle and internal link.',
        'Leave returns to the welcome gate in this prototype.',
      ],
      scene: 'guest',
      sceneState: { guestName: 'James Smith', externalEnabled: true },
      focus: {
        id: 'popout-external-tiles',
        emphasis: 'ring',
        note: {
          title: 'Guests on stage',
          points: [
            'External tiles carry the EXTERNAL label here too.',
            'The guest view has no channel shell — only the call.',
          ],
        },
      },
    },
    {
      id: 'guest-call-info',
      section: 'guest',
      title: 'Guest Call info',
      lead: 'Guests can still open Call info to copy the external link and dial-in details — without host controls.',
      lookFor: ['Guest Call info panel', 'External link and dial-in only'],
      bullets: [
        'No “Enable external participants” switch in guest mode.',
        'Useful if a guest needs to forward dial-in to someone else.',
      ],
      scene: 'guest',
      sceneState: {
        guestName: 'James Smith',
        callInfoOpen: true,
        externalEnabled: true,
      },
      focus: {
        id: 'call-info-panel',
        emphasis: 'lightbox',
        note: {
          title: 'Read-only share details',
          points: [
            'Guest variant shows external details only.',
            'Hosts keep the toggle and internal link on their side.',
          ],
        },
      },
    },
  ],
};
