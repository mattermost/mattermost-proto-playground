/**
 * Classification & Clearance — customer conversation.
 *
 * Four questions, asked in order. The rule the running order encodes: ask the
 * question first and get their model on the record, THEN show how Mattermost
 * would handle it. Nothing about our solution is on screen until the presenter
 * reveals it, so the answer isn't anchored to our design.
 *
 * Screens are grouped into APPROACHES. Where a question has more than one way of
 * doing the thing, each way is its own labelled group — so nobody in the room
 * mistakes three alternatives for one three-step flow.
 *
 * Every screen is an existing prototype or the existing markings mockup — no
 * screens were authored for this deck:
 *   - /prototypes/attribute-hub-mvp                        (deep-linked by state)
 *   - /prototypes/hierarchical-attribute-authoring-refined (?seed=classification)
 *   - /prototypes/global-membership-policy-long-form        (deep-linked by state)
 *   - reference/classification-markings-concept.png         (the markings mockup)
 */

export type QuestionScreen = {
  id: string;
  /** Short tab label. */
  label: string;
  /** Said aloud while the screen is up. Customer-safe. */
  caption: string;
  source:
    | { kind: 'iframe'; path: string }
    | {
        kind: 'image';
        src: string;
        alt: string;
        /** Position in the image to scroll to, as a fraction of its height. */
        scrollToPct?: number;
      };
};

export type Approach = {
  id: string;
  /** "Approach A" etc. Omitted when the question has only one group. */
  label?: string;
  /** What this approach is, in a few words. */
  title: string;
  screens: QuestionScreen[];
};

export type Question = {
  id: string;
  /** Short label for the rail. */
  navLabel: string;
  /** Asked verbatim. This is the only thing on screen until the reveal. */
  ask: string;
  /** Optional follow-on framing, still customer-safe, read after the ask. */
  probe?: string;
  /** Internal. Shown by default while asking; collapses once the demo is up. */
  listenFor: string[];
  /** Internal. What the answer changes on our side. */
  decides: string;
  /** Label on the reveal control. */
  revealLabel: string;
  approaches: Approach[];
};

const MARKINGS_MOCKUP = 'reference/classification-markings-concept.png';
const MARKINGS_ALT =
  'Classification Markings admin page concept: enable markings, classification preset, enforcement, a levels table with text, color, rank and clearance mapping, global classification indicators, and per-resource display settings.';

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    navLabel: 'One list, or two?',
    ask: 'How do you define data classification and user clearances in your UAS? Are they one basic ranked list of values — Top Secret, Secret, … Unclassified — shared by both users and data? Or are they two separate definitions?',
    probe:
      'If they are separate, could you walk us through each side? We would like to hear the data side and the people side on their own, even if they turn out to be identical.',
    listenFor: [
      'Whether the people side is shorter than the data side. That is the tell.',
      'Whether any value only makes sense on one side — is there such a thing as a person "cleared to Unclassified"? Does their CUI-equivalent need a clearance at all?',
      'Whether a person holds one clearance overall, or a different one per program.',
      'Where a new or renamed level gets added — identity system, marking guide, both.',
    ],
    decides:
      'Two lists means we must ship per-resource allowed values and an explicit mapping, and "clearance not required" becomes a real requirement. One list means the current shared-scale model stands.',
    revealLabel: 'Show how Mattermost could model this',
    approaches: [
      {
        id: 'q1-a',
        label: 'Approach A',
        title: 'One shared list of values',
        screens: [
          {
            id: 'q1-catalog',
            label: 'Attribute catalog',
            caption:
              'Classification and Clearance are two separate definitions in the catalog — Classification on Channels and Posts, Clearance on Users — but both draw on the same ranked list of values, so they are directly comparable.',
            source: { kind: 'iframe', path: '/prototypes/attribute-hub-mvp' },
          },
          {
            id: 'q1-clearance',
            label: 'Clearance, from UAS',
            caption:
              'The people side. Clearance is a ranked attribute on users, and its values are owned by the sync plugin — read-only inside Mattermost, because your identity system is the source of truth.',
            source: {
              kind: 'iframe',
              path: '/prototypes/attribute-hub-mvp?attr=clearance',
            },
          },
        ],
      },
      {
        id: 'q1-b',
        label: 'Approach B',
        title: 'Two lists joined by an explicit mapping',
        screens: [
          {
            id: 'q1-mapping',
            label: 'Levels and their clearance',
            caption:
              'The two lists are defined separately and can be different lengths. Each classification level states which clearance a person needs for it — and some rows can say "clearance not required" at all.',
            source: {
              kind: 'image',
              src: MARKINGS_MOCKUP,
              alt: MARKINGS_ALT,
              scrollToPct: 0.38,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'q2',
    navLabel: 'Handling: paired or separate?',
    ask: 'Does handling get paired directly with classification in your source definition — something like TS//NOFORN as a single value — or is handling defined separately from the level?',
    probe:
      'In the actual spreadsheet or schema: is "Secret, no foreign nationals" one value, or is it Secret in one field and NOFORN in another? And when you send it to us, does it arrive as one field or two?',
    listenFor: [
      'How many values are on that list in total. A large number means they are fusing; a small number means separate fields.',
      'Whether the level stays fixed while the handling varies — two Secret channels, one NOFORN and one releasable to a partner.',
      'Whether any marking should be shown but never enforced — handling guidance that does not control who can see something.',
      'Whether some combinations are simply illegal at a given level.',
    ],
    decides:
      'Fused means our ranked-spine shape is wrong for them and a rank comparison would silently ignore the handling. Separate means the shape holds, but we still owe a user-side counterpart and a set-membership test.',
    revealLabel: 'Show the three ways we could model this',
    approaches: [
      {
        id: 'q2-a',
        label: 'Approach A',
        title: 'One attribute — handling nested under each level',
        screens: [
          {
            id: 'q2-nested',
            label: 'Nested under the level',
            caption:
              'One attribute holds both. Each classification level is a top-level option, and the handling markings valid at that level sit beneath it. Note NOFORN: it is a single option that hangs under Confidential, Secret and Top Secret at once rather than being repeated per level.',
            source: {
              kind: 'iframe',
              path: '/prototypes/hierarchical-attribute-authoring-refined?seed=classification&demo=off&focus=options',
            },
          },
        ],
      },
      {
        id: 'q2-b',
        label: 'Approach B',
        title: 'Two attributes — handling defined on its own',
        screens: [
          {
            id: 'q2-separate',
            label: 'Its own attribute',
            caption:
              'Handling as an attribute in its own right, on Channels and Posts, with its own values — independent of whatever level the channel carries, and combined only when the marking is rendered.',
            source: {
              kind: 'iframe',
              path: '/prototypes/attribute-hub-mvp?attr=caveat',
            },
          },
        ],
      },
      {
        id: 'q2-c',
        label: 'Approach C',
        title: 'One flat list — the combined string is the value',
        screens: [
          {
            id: 'q2-fused',
            label: 'Fused into the level',
            caption:
              'The combined string is itself a level in the list — note TOP SECRET//SCI sitting alongside TOP SECRET as a peer value. This is the shape that matches a fused source definition, and the one that grows fastest as combinations multiply.',
            source: {
              kind: 'image',
              src: MARKINGS_MOCKUP,
              alt: MARKINGS_ALT,
              scrollToPct: 0.42,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'q3',
    navLabel: 'Is clearance compared?',
    ask: 'Do you expect data classification to ever be compared against user clearance — for example, enforcing channel access by comparing a channel’s classification to a user’s clearance? Or is it already assumed that everyone on a given server holds the maximum clearance needed for all the content on it?',
    probe:
      'And how do you decide who belongs in a given channel today — is that the same decision as "are they cleared", or a separate one somebody makes deliberately?',
    listenFor: [
      'Whether one server ever hosts people cleared to different levels. If everyone is cleared to system high, the comparison can never deny anyone.',
      'If everyone is cleared anyway — why they would still want channels marked. Wrong-place prevention, audit trail, and what happens on egress are different products.',
      'Whether setting a clearance value on every account is worth the effort to them, or busywork.',
      'What a denied person should experience, and whether naming the missing value is itself a disclosure.',
      'Whether anything beyond the level is required — a signed agreement, a formal read-in, a per-compartment approval.',
    ],
    decides:
      'System high makes the comparison a tautology and shifts the value of classification to marking, evidence and egress — with channel membership as the real control. Mixed clearance makes the comparison the headline feature.',
    revealLabel: 'Show both, compared and not compared',
    approaches: [
      {
        id: 'q3-a',
        label: 'Approach A',
        title: 'Clearance is compared, and can deny',
        screens: [
          {
            id: 'q3-policy',
            label: 'The comparison rule',
            caption:
              'The comparison expressed as a membership policy: a user’s Clearance must be at least the channel’s Classification. It is one rule among several a policy can carry.',
            source: {
              kind: 'iframe',
              path: '/prototypes/global-membership-policy-long-form',
            },
          },
          {
            id: 'q3-test',
            label: 'Who it matches',
            caption:
              'Before saving, you can test the rule against real accounts and see who it would and would not admit — which is also how you would find out that a rule never denies anyone.',
            source: {
              kind: 'iframe',
              path: '/prototypes/global-membership-policy-long-form?sim=channel',
            },
          },
        ],
      },
      {
        id: 'q3-b',
        label: 'Approach B',
        title: 'Nothing is compared — rules use fixed values',
        screens: [
          {
            id: 'q3-static',
            label: 'Fixed-value rules',
            caption:
              'The same policy builder, but neither rule looks at the channel. A person must hold at least Secret, and must be on the Dragon Spacecraft program — both fixed values you choose here. This is the shape that still does real work when everyone on the server is cleared to the same level, because a comparison against the channel could never deny anyone.',
            source: {
              kind: 'iframe',
              path: '/prototypes/global-membership-policy-long-form?policy=static-values',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'q4',
    navLabel: 'Server level: label or limit?',
    ask: 'For the global classification set at the server level — do you expect that to be enforced against channel classification? The specific thing we are testing is a system-level constraint: that no channel can be created with a classification above the server’s defined global classification level.',
    probe:
      'Concretely: if the global classification is set to Secret, should someone still be able to create a channel classified Top Secret on that server? And is the server the right boundary for that, or is it really the team?',
    listenFor: [
      'Whether the banner alone is enough, or they expect it to actually block.',
      'Where the server-wide level comes from in their world — accreditation documents, an admin typing it in, or just the highest level on their list.',
      'Server or team. If they say team, that is a much larger build — there is no team-attribute UI today.',
      'Whether the same limit should cover messages and files, not just channels.',
      'What should happen if their identity system sends a level above the server’s level.',
    ],
    decides:
      'If they expect a ceiling, PRFAQ Theme 3.5 is real and needs server-side rejection rather than a filtered dropdown. If the boundary is the team rather than the server, the sequencing changes.',
    revealLabel: 'Show configuration options',
    approaches: [
      {
        id: 'q4-today',
        // One group: there is no second approach to show, because enforcement
        // is not built. That absence is the honest answer to this question.
        title: 'What exists today — a declaration, not a limit',
        screens: [
          {
            id: 'q4-global',
            label: 'Global classification',
            caption:
              'Today this is a display setting: it sets the classification banner across the top of the app and declares the level the server operates at. It does not stop anyone from classifying a channel above it — that constraint is exactly what we are asking about, and it is not built.',
            source: {
              kind: 'image',
              src: MARKINGS_MOCKUP,
              alt: MARKINGS_ALT,
              scrollToPct: 0.6,
            },
          },
          {
            id: 'q4-levels',
            label: 'The levels a channel can carry',
            caption:
              'And the full list a channel can be classified with. Nothing here is tied to the global level — so with the global classification set to Secret, someone can still create a channel classified Top Secret. Should they be able to? That is the specific thing we need to validate.',
            source: {
              kind: 'image',
              src: MARKINGS_MOCKUP,
              alt: MARKINGS_ALT,
              scrollToPct: 0.38,
            },
          },
        ],
      },
    ],
  },
];

/** Flat screen list for a question, tagged with the approach each one belongs to. */
export function flatScreens(question: Question): Array<{
  screen: QuestionScreen;
  approach: Approach;
  firstOfApproach: boolean;
}> {
  return question.approaches.flatMap((approach) =>
    approach.screens.map((screen, i) => ({
      screen,
      approach,
      firstOfApproach: i === 0,
    })),
  );
}

/** The single highest-value outcome of the whole conversation. */
export const CLOSING_ASK =
  'Could you share the actual list — the spreadsheet, the schema export, the marking guide — for both the data side and the people side? Even a redacted version with the real structure and placeholder value names would settle most of what we have asked today.';

export const HOW_TO_RUN = [
  'Ask first. Read the question, get their answer on the record, and only then reveal the screens — otherwise the answer is just a reaction to our design.',
  'Show, do not describe. Put the screen up and let them react before you narrate it.',
  'Name the approach out loud when you switch groups, so nobody reads three alternatives as one flow.',
  'Record verbatim, especially the exact spelling of their values. "Secret" vs "SECRET" vs "S" matters.',
  'Questions 1 and 2 are the must-haves. Land those even if the conversation gets cut short.',
];
