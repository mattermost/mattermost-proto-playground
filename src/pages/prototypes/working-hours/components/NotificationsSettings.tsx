import { SettingsPane, SettingsSection } from '@mattermost/compass-proto';
import { Switch } from '@mattermost/compass-ui/components/switch';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { CustomStatusFields } from './CustomStatusFields';
import { ScheduleForm } from './ScheduleForm';
import { scheduleSummary, type ScheduleState } from '../workingHoursData';
import styles from './NotificationsSettings.module.scss';
import formStyles from '../WorkingHours.module.scss';

/** Other Notifications rows are shown for context only; Working hours is the one built. */
const STATIC_BEFORE = [
  {
    title: 'Desktop and mobile notifications',
    description: 'Mentions, direct messages, and group messages',
  },
  {
    title: 'Desktop notification sounds',
    description: 'Bing for messages, Calm for calls',
  },
  { title: 'Email notifications', description: 'Never' },
  {
    title: 'Keywords that trigger mentions',
    description:
      '“@leonard.riley”, “leonard.riley”, “@channel”, “@all”, “@here”',
  },
  {
    title: 'Keywords that get highlighted (without notifications)',
    description:
      '“@leonard.riley”, “leonard.riley”, “@channel”, “@all”, “@here”',
  },
];
const STATIC_AFTER = [
  { title: 'Automatic direct message replies', description: 'Off' },
];

type Props = {
  /** The saved schedule (drives the summary). */
  schedule: ScheduleState;
  /** Unsaved edits shown in the open panel. */
  draft: ScheduleState;
  onDraftChange: (next: ScheduleState) => void;
  clock24: boolean;
  expanded: boolean;
  /** Save is disabled and a hint shown when this is true. */
  invalid: boolean;
  noDays: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function NotificationsSettings({
  schedule,
  draft,
  onDraftChange,
  clock24,
  expanded,
  invalid,
  noDays,
  onEdit,
  onSave,
  onCancel,
}: Props) {
  const title = (
    <>
      Working hours
      <Tag label="New" type="success" casing="all-caps" size="x-small" />
    </>
  );

  return (
    <SettingsPane title="Notifications">
      {STATIC_BEFORE.map((s) => (
        <SettingsSection key={s.title} {...s} />
      ))}

      <SettingsSection
        title={title}
        description={scheduleSummary(schedule, clock24)}
        expanded={expanded}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
        saveDisabled={invalid}
        editAriaLabel="Edit Working hours"
        data-testid="working-hours-section"
      >
        <ScheduleForm
          schedule={draft}
          clock24={clock24}
          onChange={onDraftChange}
        />
        {noDays && (
          <p className={formStyles['time-range__error']} role="alert">
            Select at least one day.
          </p>
        )}
        <div className={styles['notifications-settings__options']}>
          <Switch
            size="medium"
            checked={draft.dndOutside}
            onChange={(e) =>
              onDraftChange({ ...draft, dndOutside: e.target.checked })
            }
            secondaryLabel="Silence notifications and set your status to Do Not Disturb."
          >
            Do Not Disturb outside working hours
          </Switch>
          <Switch
            size="medium"
            checked={draft.statusOutside}
            onChange={(e) =>
              onDraftChange({ ...draft, statusOutside: e.target.checked })
            }
            secondaryLabel="Sets a custom status while you are outside your working hours."
          >
            Set a custom status outside working hours
          </Switch>
          <CustomStatusFields
            open={draft.statusOutside}
            emoji={draft.statusEmoji}
            text={draft.statusText}
            onChange={({ emoji, text }) =>
              onDraftChange({ ...draft, statusEmoji: emoji, statusText: text })
            }
          />
        </div>
      </SettingsSection>

      {STATIC_AFTER.map((s) => (
        <SettingsSection key={s.title} {...s} />
      ))}
    </SettingsPane>
  );
}
