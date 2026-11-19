// Sample conversation content for the channel scenes.

export interface SamplePost {
  authorId: string;
  time: string;
  /** Date separator label, e.g. 'Monday', 'Yesterday', 'Today'. */
  day: string;
  /** One string per paragraph. */
  text: string | string[];
  /** Show the call post right after this message. */
  callPostAfter?: boolean;
}

/** 1:1 conversation with the DM peer: short replies next to a long paragraph. */
export const DM_POSTS: SamplePost[] = [
  // --- Monday ---
  {
    authorId: 'leonard',
    day: 'Monday',
    time: '9:14 AM',
    text: 'Morning Marco. Did you get a chance to look at the research summary I shared on Friday?',
  },
  {
    authorId: 'marco',
    day: 'Monday',
    time: '9:31 AM',
    text: [
      'Just finished it. Two things stood out for me. People hesitate at the team-name step because they are not sure whether it is permanent, and almost nobody noticed the invite link on the last screen.',
      'I think both are copy and layout problems rather than flow problems, which is good news.',
    ],
  },
  {
    authorId: 'leonard',
    day: 'Monday',
    time: '9:33 AM',
    text: 'Agreed. I will sketch a few options for the last screen today.',
  },
  { authorId: 'marco', day: 'Monday', time: '9:34 AM', text: '🙌' },
  {
    authorId: 'marco',
    day: 'Monday',
    time: '2:05 PM',
    text: 'Also, are we still planning to demo this to the wider team on Thursday? I want to make sure I leave enough time to polish the transitions.',
  },
  {
    authorId: 'leonard',
    day: 'Monday',
    time: '2:20 PM',
    text: 'Yes, Thursday afternoon. Let us aim to have the flow stable by Wednesday evening and use Thursday morning for polish only.',
  },
  // --- Tuesday ---
  {
    authorId: 'leonard',
    day: 'Tuesday',
    time: '11:02 AM',
    text: 'Pushed three options for the last screen to the board. Option B is my favourite, the invite link finally gets some room.',
  },
  {
    authorId: 'marco',
    day: 'Tuesday',
    time: '11:15 AM',
    text: [
      'B looks great. One concern: on small windows the link wraps onto two lines and the copy button falls off the end.',
      'Could we stack them vertically below a certain width? I can mock it up if that helps.',
    ],
  },
  {
    authorId: 'leonard',
    day: 'Tuesday',
    time: '11:18 AM',
    text: 'Yes please, that would help a lot.',
  },
  {
    authorId: 'marco',
    day: 'Tuesday',
    time: '3:40 PM',
    text: 'Done, it is in the same frame as option B, just to the right. I also fixed the focus order while I was in there since keyboard users were landing on the skip link first.',
  },
  {
    authorId: 'leonard',
    day: 'Tuesday',
    time: '3:52 PM',
    text: 'Nice catch on the focus order. Merging it into the main flow.',
  },
  // --- Wednesday ---
  {
    authorId: 'marco',
    day: 'Wednesday',
    time: '10:00 AM',
    text: 'Quick heads up, the dev build of the onboarding flow is up now. Please click through it on your machine when you have a minute and note anything that feels off.',
  },
  {
    authorId: 'leonard',
    day: 'Wednesday',
    time: '10:41 AM',
    text: [
      'Clicked through the whole thing. Overall it feels solid. A few notes: the progress indicator jumps when the keyboard opens on mobile widths, the empty state illustration is slightly cropped on the right, and the success screen could use a clearer next step.',
      'None of these block the demo, I would just like to fix them before we show it around.',
    ],
  },
  {
    authorId: 'marco',
    day: 'Wednesday',
    time: '10:44 AM',
    text: 'Noted, I will take the progress indicator and the cropping today.',
  },
  {
    authorId: 'leonard',
    day: 'Wednesday',
    time: '10:45 AM',
    text: 'Thanks! I will take the success screen.',
  },
  {
    authorId: 'marco',
    day: 'Wednesday',
    time: '5:12 PM',
    text: 'Both fixes are merged. The progress indicator now keeps its width when the keyboard opens and the illustration has proper padding. See you tomorrow!',
  },
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
  // --- Monday ---
  {
    authorId: 'darius',
    day: 'Monday',
    time: '9:02 AM',
    text: 'Good morning everyone. Weekly priorities are pinned in the channel. Short version: onboarding polish, the new calling UI, and the contrast audit.',
  },
  {
    authorId: 'emma',
    day: 'Monday',
    time: '9:10 AM',
    text: 'Thanks Darius 👍',
  },
  {
    authorId: 'sofia',
    day: 'Monday',
    time: '9:45 AM',
    text: [
      'For the calling UI I would like us to agree on the widget behaviour this week. Specifically: where it docks by default, whether it is draggable, and what happens when you resize the window.',
      'I put three short videos of other products in the doc for reference. None of them is exactly what we want, but they are useful starting points.',
    ],
  },
  {
    authorId: 'ethan',
    day: 'Monday',
    time: '9:52 AM',
    text: 'Watching them now.',
  },
  {
    authorId: 'arjun',
    day: 'Monday',
    time: '10:30 AM',
    text: 'Draggable feels right to me, as long as it snaps to the corners so it never ends up half off screen.',
  },
  {
    authorId: 'aiko',
    day: 'Monday',
    time: '11:05 AM',
    text: 'Agreed on snapping. I would also keep the same distance from the edge in every corner so it feels consistent wherever it lands.',
  },
  {
    authorId: 'david',
    day: 'Monday',
    time: '4:20 PM',
    text: 'Posted a first pass of the contrast audit results in the doc. Mostly good news, a handful of combinations to fix.',
  },
  // --- Tuesday ---
  {
    authorId: 'danielle',
    day: 'Tuesday',
    time: '9:30 AM',
    text: 'I updated the avatar group spec so the overflow chip matches the new call card. Screens attached.',
  },
  {
    authorId: 'sofia',
    day: 'Tuesday',
    time: '9:48 AM',
    text: 'These look great, thank you Danielle. One small thing: the overflow chip text should not drop below the minimum contrast we agreed on, so let us use the darker neutral.',
  },
  { authorId: 'danielle', day: 'Tuesday', time: '9:50 AM', text: 'Will do.' },
  {
    authorId: 'marco',
    day: 'Tuesday',
    time: '1:15 PM',
    text: [
      'Question for the group: when someone joins a call from the pre-join screen, should the join sound play for everyone or only for the people already in the call?',
      'In some products everyone hears a chime whenever anyone joins, which gets noisy in bigger calls. I would lean towards only a subtle cue for people already in the call.',
    ],
  },
  {
    authorId: 'emma',
    day: 'Tuesday',
    time: '1:22 PM',
    text: 'Subtle cue for people already in the call, yes. And no sound at all for the person joining, they know they just joined.',
  },
  { authorId: 'arjun', day: 'Tuesday', time: '1:25 PM', text: '+1' },
  {
    authorId: 'leonard',
    day: 'Tuesday',
    time: '2:02 PM',
    text: 'I will write that up in the sounds section of the spec so we have it in one place.',
  },
  // --- Wednesday ---
  {
    authorId: 'ethan',
    day: 'Wednesday',
    time: '10:10 AM',
    text: 'Anyone else seeing the prototype lag when ten tiles are on screen? My laptop fan sounds like a jet engine.',
  },
  {
    authorId: 'david',
    day: 'Wednesday',
    time: '10:18 AM',
    text: 'A little, yes. I think it is the looping videos. We could pause the ones that are not speaking, like we do in the real thing.',
  },
  {
    authorId: 'aiko',
    day: 'Wednesday',
    time: '11:40 AM',
    text: [
      'Reminder that the design review is moved to tomorrow at 10:00 so that engineering can join.',
      'Please add your latest frames to the board by 9:45 so that we can start on time and have enough room for discussion at the end.',
    ],
  },
  {
    authorId: 'danielle',
    day: 'Wednesday',
    time: '11:42 AM',
    text: 'Thanks for the reminder!',
  },
  {
    authorId: 'sofia',
    day: 'Wednesday',
    time: '3:30 PM',
    text: 'Spent the afternoon with the research notes from last week. The biggest takeaway for calls: people want to know they are muted before they start talking, not after.',
  },
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
