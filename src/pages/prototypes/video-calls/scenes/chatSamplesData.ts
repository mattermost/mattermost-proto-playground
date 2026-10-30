// Sample conversation content for the channel scenes.

export interface SamplePost {
  authorId: string;
  time: string;
  day: 'Yesterday' | 'Today';
  /** One string per paragraph. */
  text: string | string[];
  /** Show the call post right after this message. */
  callPostAfter?: boolean;
}

/** 1:1 conversation with the DM peer: short replies next to a long paragraph. */
export const DM_POSTS: SamplePost[] = [
  {
    authorId: 'marco',
    day: 'Yesterday',
    time: '4:48 PM',
    text: 'Hey, got a minute tomorrow to look at the onboarding flow?',
  },
  {
    authorId: 'leonard',
    day: 'Yesterday',
    time: '4:52 PM',
    text: 'Sure. Morning works.',
  },
  {
    authorId: 'marco',
    day: 'Yesterday',
    time: '4:53 PM',
    text: [
      'Perfect. I rebuilt the empty state and step three from scratch based on the research notes. The biggest change is that we now explain why we ask for a team name before asking for it, which cut the drop-off in the test sessions by a lot.',
      'I would love a second pair of eyes before I send it to Sofia and the eng team.',
    ],
  },
  {
    authorId: 'marco',
    day: 'Today',
    time: '10:12 AM',
    text: 'Morning! I updated the onboarding flow with your comments.',
  },
  {
    authorId: 'leonard',
    day: 'Today',
    time: '10:15 AM',
    text: 'Thanks, looking now. The new empty state is much clearer.',
  },
  {
    authorId: 'leonard',
    day: 'Today',
    time: '10:15 AM',
    text: 'One question: should step two still be skippable?',
  },
  {
    authorId: 'marco',
    day: 'Today',
    time: '10:16 AM',
    text: 'Good catch, yes. Skipping keeps the defaults and we show a gentle nudge on the home screen afterwards. I added a note in the spec so engineering has the exact behaviour.',
  },
  {
    authorId: 'marco',
    day: 'Today',
    time: '10:16 AM',
    text: 'Great. Can we go through step three together? Easier to show than to type.',
  },
];

/** Channel / group conversation: many voices, mixed lengths. */
export const GROUP_POSTS: SamplePost[] = [
  {
    authorId: 'aiko',
    day: 'Yesterday',
    time: '3:10 PM',
    text: 'Uploaded the updated icon set to the shared library.',
  },
  {
    authorId: 'david',
    day: 'Yesterday',
    time: '3:24 PM',
    text: [
      'Finished the contrast audit on the new palette. Most of it holds up, but the secondary text on the dark surfaces is borderline in a few places, especially the timestamps and the muted participant labels.',
      'I put the failing combinations in a table in the doc with suggested replacements. Happy to walk through it whenever suits.',
    ],
  },
  {
    authorId: 'emma',
    day: 'Yesterday',
    time: '3:25 PM',
    text: 'Nice, will review tonight 👍',
  },
  {
    authorId: 'arjun',
    day: 'Yesterday',
    time: '4:40 PM',
    text: 'Can someone remind me where the latest component specs live? I keep landing on the old board.',
  },
  {
    authorId: 'darius',
    day: 'Today',
    time: '9:05 AM',
    text: 'Reminder: design critique at 10:00. Please add your screens to the board by 9:45 if you want feedback.',
  },
  {
    authorId: 'danielle',
    day: 'Today',
    time: '9:12 AM',
    text: 'Adding mine now.',
  },
  {
    authorId: 'ethan',
    day: 'Today',
    time: '9:30 AM',
    text: [
      'I have three options for the call controls bar. The first keeps everything in one row, the second moves reactions and hand raise into a menu, and the third splits controls into two groups.',
      'My vote is the second one, but I would like to hear what the rest of you think before the critique.',
    ],
  },
  {
    authorId: 'sofia',
    day: 'Today',
    time: '10:02 AM',
    text: 'Starting the weekly design critique now. Hop in if you want to walk through the new onboarding screens.',
    callPostAfter: true,
  },
  {
    authorId: 'marco',
    day: 'Today',
    time: '10:04 AM',
    text: 'I have the latest prototype open, sharing in a minute.',
  },
  { authorId: 'aiko', day: 'Today', time: '10:05 AM', text: 'Joining!' },
  {
    authorId: 'leonard',
    day: 'Today',
    time: '10:06 AM',
    text: 'Finishing something up, I will join shortly.',
  },
  {
    authorId: 'arjun',
    day: 'Today',
    time: '10:07 AM',
    text: 'No rush. We are starting with the empty states, then the pre-join screen, then the in-call layouts. Should take about forty minutes in total, and we will leave time at the end for questions.',
  },
];
