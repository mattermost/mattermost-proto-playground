import type { WalkthroughDocument } from '@/walkthrough/types';

/**
 * Guided walkthrough for the Weave automation permissions prototype.
 *
 * sceneState keys (see WeaveAutomationPermissions.tsx):
 * - `resetNewSteps: true` brings back the "new steps" banner.
 * - `expand: string[]` opens these step categories in the step picker.
 */
export const weaveAutomationPermissionsWalkthrough: WalkthroughDocument = {
  prototypeId: 'weave-automation-permissions',
  title: 'Automation permissions',
  intent:
    'Decide who can create team automations, and which steps they can use.',
  sections: [
    { id: 'overview', label: 'Overview' },
    { id: 'permissions', label: 'Permissions page' },
    { id: 'shared-steps', label: 'Steps for all editors' },
    { id: 'groups', label: 'Groups' },
  ],
  steps: [
    {
      id: 'why',
      section: 'overview',
      title: 'Who can build automations',
      lead: 'Admins decide who can create team automations and which steps they get, all on one page.',
      lookFor: ['Steps for all editors', 'Automation editor groups'],
      bullets: [
        'One shared set of steps goes to everyone who can create automations.',
        'Groups say who can create, and can add extra steps on top.',
        'Someone in more than one group gets the shared steps plus the extra steps from each of their groups.',
        'Guests and deactivated accounts are never included. System admins always have full access.',
      ],
      scene: 'permissions',
      sceneState: { resetNewSteps: true },
    },
    {
      id: 'new-steps',
      section: 'permissions',
      title: 'New steps wait for a decision',
      lead: 'When an upgrade adds steps, nobody gets them until an admin decides.',
      lookFor: ['The new steps banner'],
      bullets: [
        '"Add to everyone" puts them in the shared steps.',
        '"Review" opens the shared steps, or you can give them to specific groups instead.',
        'Dismissing the banner only hides it. The steps stay unassigned.',
      ],
      scene: 'permissions',
      sceneState: { resetNewSteps: true },
      focus: {
        id: 'new-steps-notice',
        emphasis: 'ring',
        note: {
          title: 'Nothing is granted automatically',
          points: [
            'The banner names the new steps.',
            'Decide once, here, instead of per group.',
          ],
        },
      },
    },
    {
      id: 'shared-preset',
      section: 'permissions',
      title: 'Steps for all editors',
      lead: "A preset that can't be deleted. It holds the triggers and actions everyone who can create automations gets.",
      lookFor: ['Steps for all editors, with the Preset tag'],
      bullets: [
        'Who is fixed: everyone in any group on the page.',
        'Click anywhere on the panel to edit the shared steps.',
      ],
      scene: 'permissions',
      focus: {
        id: 'shared-steps-panel',
        emphasis: 'ring',
        note: {
          title: 'The shared base',
          points: [
            'Most people only ever need these steps.',
            'Extra steps go on groups, not here.',
          ],
        },
      },
    },
    {
      id: 'groups-list',
      section: 'permissions',
      title: 'Automation editor groups',
      lead: 'Each group names who can create, and any extra steps they get.',
      lookFor: ['People count and extra steps on each row', 'Add group'],
      bullets: [
        'Click a row, or its pencil, to edit the group.',
        'The ••• menu has View users and Delete group.',
        'Delete asks for confirmation first.',
      ],
      scene: 'permissions',
      focus: {
        id: 'groups-panel',
        emphasis: 'ring',
        note: {
          title: 'One row per group',
          points: [
            'Each row has a summary. Long lists show four steps, then "and N more".',
            'The Add group button starts a new group with an "Untitled" name.',
          ],
        },
      },
    },
    {
      id: 'shared-step-list',
      section: 'shared-steps',
      title: 'Choose the shared steps',
      lead: 'Every trigger and action in one checklist, grouped by category.',
      lookFor: ['Select all and Search', 'Category rows with counts'],
      bullets: [
        'Tick a category to grant every step in it, or open it to pick individual steps.',
        'Expand all opens every category at once.',
        'Save appears only when something has changed.',
      ],
      scene: 'shared',
      focus: {
        id: 'shared-step-picker',
        emphasis: 'ring',
        note: {
          title: 'Search, select, expand',
          points: [
            'Search narrows what Select all affects.',
            'Newly released steps carry a New tag.',
          ],
        },
      },
    },
    {
      id: 'blocking-hooks',
      section: 'shared-steps',
      title: 'Blocking hooks need care',
      lead: 'Some triggers run before an action finishes and can stop it.',
      lookFor: ['Blocking hooks, under Triggers'],
      bullets: [
        'For example, holding a message until an automation approves it.',
        'They are off for everyone by default. Grant them to specific groups.',
      ],
      scene: 'shared',
      sceneState: { expand: ['triggers'] },
      focus: {
        id: 'blocking-hooks',
        emphasis: 'ring',
        note: {
          title: 'Off by default',
          points: [
            'Shared steps leave these unchecked.',
            'A moderation group can add them as extra steps.',
          ],
        },
      },
    },
    {
      id: 'group-people',
      section: 'groups',
      title: 'Who is in the group',
      lead: 'Pick specific people or user groups by name.',
      lookFor: [
        'The group name, editable in the title',
        'Users or groups field',
      ],
      bullets: [
        'Click the group name at the top to rename it.',
        'Picking a user group shows how many people it adds, with See who.',
      ],
      scene: 'group-members',
      focus: {
        id: 'group-who-panel',
        emphasis: 'ring',
        note: {
          title: 'Names, not lists of ids',
          points: ['People and user groups mix in the same field.'],
        },
      },
    },
    {
      id: 'group-attributes',
      section: 'groups',
      title: 'Or choose by attribute rules',
      lead: 'An attribute-based policy picks people by their profile attributes.',
      lookFor: ['Attribute, Operator, Values rows', 'Test matching users'],
      bullets: [
        'Simple builds rules in a table. Advanced shows the expression.',
        'Test matching users lists who the rules match right now.',
      ],
      scene: 'group-attributes',
      focus: {
        id: 'attribute-rules',
        emphasis: 'ring',
        note: {
          title: 'Rules, not a fixed list',
          points: ['New people who match are included automatically.'],
        },
      },
    },
    {
      id: 'group-extra-steps',
      section: 'groups',
      title: 'Extra steps for the group',
      lead: 'On top of the shared steps, a group can get more.',
      lookFor: ['Extra steps', 'Select all and Expand all'],
      bullets: [
        "Only steps that aren't already shared are listed.",
        'Edit shared steps jumps to the shared list.',
      ],
      scene: 'group-attributes',
      sceneState: { expand: ['ai'] },
      focus: {
        id: 'extra-steps-panel',
        emphasis: 'ring',
        note: {
          title: 'Granted per group',
          points: [
            'Someone in several groups gets the extras from all of them.',
          ],
        },
      },
    },
  ],
};
