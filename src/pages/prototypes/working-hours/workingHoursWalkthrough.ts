import type { WalkthroughDocument } from '@/walkthrough/types';

/** Guided walkthrough for the Working Hours prototype (desktop). */
export const workingHoursWalkthrough: WalkthroughDocument = {
  prototypeId: 'working-hours',
  title: 'Working Hours',
  intent:
    'Set the days and hours you are reachable; outside them, your status and notifications follow.',
  sections: [
    { id: 'overview', label: 'Overview' },
    { id: 'set-up', label: 'Set up' },
    { id: 'in-action', label: 'In action' },
    { id: 'teammates', label: 'Teammates' },
  ],
  steps: [
    {
      id: 'why',
      section: 'overview',
      title: 'Why working hours',
      lead: 'Working hours let people say when they want to be reached, so work stays reachable without being always on.',
      lookFor: [
        'Settings > Availability',
        'Do Not Disturb in the profile menu',
      ],
      bullets: [
        'Focus during deep work without interruptions.',
        'Limit work notifications after hours.',
        'Fit different shifts and time zones.',
        'Outside your hours, your status switches to Do Not Disturb and notifications are silenced.',
      ],
      scene: 'settings',
      sceneState: { settings: 'collapsed' },
    },
    {
      id: 'entry-settings',
      section: 'set-up',
      railGroup: 'Two ways in',
      title: 'From Settings',
      lead: 'Settings > Availability has a Working hours section. The row shows what is set today.',
      lookFor: ['The Working hours row', 'Its summary line'],
      bullets: [
        'Until a schedule is saved, the row reads Not set.',
        'Click anywhere on the row to open the editor.',
      ],
      scene: 'settings',
      sceneState: { settings: 'collapsed' },
      focus: {
        id: 'wh-row',
        emphasis: 'ring',
        note: {
          title: 'Working hours row',
          points: ['Shows Not set, Off, or the days and hours you saved.'],
        },
      },
    },
    {
      id: 'entry-menu',
      section: 'set-up',
      railGroup: 'Two ways in',
      title: 'From the profile menu',
      lead: 'Hover Do Not Disturb in the profile menu and choose Working hours.',
      lookFor: [
        'Do Not Disturb submenu',
        'Working hours entry with its On / Off state',
      ],
      bullets: [
        'It opens Settings with the Working hours section already expanded.',
      ],
      scene: 'menu',
      focus: {
        id: 'wh-menu-item',
        emphasis: 'ring',
        notePlacement: 'left',
        note: {
          title: 'Working hours entry',
          points: ['The row shows whether working hours are On or Off.'],
        },
      },
    },
    {
      id: 'configure',
      section: 'set-up',
      title: 'Choose days and hours',
      lead: 'Turn on Enable working hours, then pick the days and the time range you are reachable.',
      lookFor: ['Working days select', 'Start and end time'],
      bullets: [
        'Days: Every day, Weekdays (Monday - Friday), or Custom Schedule.',
        'Custom Schedule shows every day of the week: tick the days you work and set a range for each.',
        'Times move in half-hour steps; the default is 8:00 AM to 8:00 PM.',
      ],
      scene: 'settings',
      sceneState: { settings: 'editing' },
      focus: {
        id: 'wh-schedule',
        emphasis: 'ring',
        notePlacement: 'left',
        note: {
          title: 'Days and time range',
          points: [
            'One range applies to every working day, unless you choose Custom.',
          ],
        },
      },
    },
    {
      id: 'outside',
      section: 'set-up',
      title: 'What happens outside the hours',
      lead: 'Two independent options decide what changes when you are off the clock.',
      lookFor: [
        'Do Not Disturb outside working hours',
        'Custom status with emoji and message',
      ],
      bullets: [
        'Do Not Disturb silences notifications and sets your status.',
        'A custom status shows people why you are away; pick the emoji and write the message.',
      ],
      scene: 'settings',
      sceneState: { settings: 'editing' },
      focus: {
        id: 'wh-outside',
        emphasis: 'ring',
        notePlacement: 'left',
        note: {
          title: 'Two options',
          points: [
            'Turn either on or off on its own.',
            'Save applies them; Cancel keeps what you had.',
          ],
        },
      },
    },
    {
      id: 'in-action',
      section: 'in-action',
      title: 'Off hours',
      lead: 'Once it is off hours, your status icon becomes Do Not Disturb, whatever you were doing.',
      lookFor: [
        'Status icon and custom status in the header',
        'Do Not Disturb with its end time',
      ],
      bullets: [
        'Open the profile menu: Do Not Disturb is selected and shows when it ends, like a manual one with an expiry.',
        'You can change your status by hand any time. It then stays put until the next cycle starts.',
      ],
      scene: 'in-action',
      focus: {
        id: 'wh-dnd-row',
        emphasis: 'ring',
        notePlacement: 'left',
        note: {
          title: 'Until Monday',
          points: ['The end time comes from your working hours.'],
        },
      },
    },
    {
      id: 'dm-notice',
      section: 'teammates',
      title: 'Teammates see it too',
      lead: 'When someone you message is outside their working hours, a notice above the message box shows their local time.',
      lookFor: ['The time notice above the composer'],
      bullets: [
        'It appears only while they are outside their hours.',
        'Switch the teammate time below the stage to see it appear and disappear.',
      ],
      scene: 'dm',
      focus: {
        id: 'wh-notice',
        emphasis: 'ring',
        notePlacement: 'above',
        note: {
          title: 'Late-hours notice',
          points: ['"The time for {name} is {time}".'],
        },
      },
    },
  ],
};
