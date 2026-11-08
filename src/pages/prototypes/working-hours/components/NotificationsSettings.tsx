import { useEffect, useId, useRef } from 'react';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Switch } from '@mattermost/compass-ui/components/switch';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { ScheduleForm } from './ScheduleForm';
import {
  OUTSIDE_HOURS_STATUS,
  scheduleSummary,
  type ScheduleState,
} from '../workingHoursData';
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

function StaticSection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className={styles['notifications-settings__section']}>
      <div className={styles['notifications-settings__summary']}>
        <h3 className={styles['notifications-settings__section-title']}>
          {title}
        </h3>
        {/* Inert: only Working hours is built, but the row reads like the real one. */}
        <Button
          emphasis="quaternary"
          size="small"
          className={styles['notifications-settings__edit']}
          leadingIcon={<Icon glyph={<PencilOutlineIcon />} size="16" />}
          aria-label={`Edit ${title}`}
        >
          Edit
        </Button>
        <p className={styles['notifications-settings__description']}>
          {description}
        </p>
      </div>
    </div>
  );
}

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
  const uid = useId();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Bring the editor into view when it opens, as the design shows it.
  useEffect(() => {
    if (expanded) sectionRef.current?.scrollIntoView({ block: 'nearest' });
  }, [expanded]);

  const title = (
    <>
      Working hours
      <Tag label="New" type="success" casing="all-caps" size="x-small" />
    </>
  );

  return (
    <section
      className={styles['notifications-settings']}
      aria-labelledby={`${uid}-title`}
    >
      <h2
        className={styles['notifications-settings__title']}
        id={`${uid}-title`}
      >
        Notifications
      </h2>
      <div className={styles['notifications-settings__list']}>
        {STATIC_BEFORE.map((s) => (
          <StaticSection key={s.title} {...s} />
        ))}

        {/* Row click is a pointer shortcut; the Edit button is the keyboard path. */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
        <div
          ref={sectionRef}
          className={[
            styles['notifications-settings__section'],
            styles['notifications-settings__section--editable'],
            expanded && styles['notifications-settings__section--expanded'],
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={expanded ? undefined : onEdit}
          data-testid="working-hours-section"
        >
          {/* Both views stay mounted in one grid cell so the swap can animate
              without moving content; the hidden one is inert. */}
          <div className={styles['notifications-settings__stack']}>
            <div
              className={styles['notifications-settings__summary']}
              inert={expanded}
            >
              <h3 className={styles['notifications-settings__section-title']}>
                {title}
              </h3>
              <Button
                emphasis="quaternary"
                size="small"
                className={styles['notifications-settings__edit']}
                leadingIcon={<Icon glyph={<PencilOutlineIcon />} size="16" />}
                aria-label="Edit Working hours"
                aria-expanded={expanded}
              >
                Edit
              </Button>
              <p className={styles['notifications-settings__description']}>
                {scheduleSummary(schedule, clock24)}
              </p>
            </div>
            <div
              className={styles['notifications-settings__collapse']}
              inert={!expanded}
            >
              <div className={styles['notifications-settings__collapse-inner']}>
                <div className={styles['notifications-settings__panel']}>
                  <h3
                    className={`${styles['notifications-settings__section-title']} ${styles['notifications-settings__section-title--hidden']}`}
                  >
                    {title}
                  </h3>
                  <div
                    className={styles['notifications-settings__section-body']}
                  >
                    <Switch
                      size="large"
                      className={formStyles['settings__switch']}
                      checked={draft.enabled}
                      onChange={(e) =>
                        onDraftChange({ ...draft, enabled: e.target.checked })
                      }
                      secondaryLabel="Teammates are told when it is outside your working hours."
                    >
                      Enable working hours
                    </Switch>

                    {draft.enabled && (
                      <>
                        <ScheduleForm
                          schedule={draft}
                          clock24={clock24}
                          onChange={onDraftChange}
                        />
                        {noDays && (
                          <p
                            className={formStyles['time-range__error']}
                            role="alert"
                          >
                            Select at least one day.
                          </p>
                        )}
                        <div
                          className={styles['notifications-settings__options']}
                        >
                          <Switch
                            size="large"
                            className={formStyles['settings__switch']}
                            checked={draft.dndOutside}
                            onChange={(e) =>
                              onDraftChange({
                                ...draft,
                                dndOutside: e.target.checked,
                              })
                            }
                            secondaryLabel="Silence notifications and set your status to Do Not Disturb."
                          >
                            Do Not Disturb outside working hours
                          </Switch>
                          <Switch
                            size="large"
                            className={formStyles['settings__switch']}
                            checked={draft.statusOutside}
                            onChange={(e) =>
                              onDraftChange({
                                ...draft,
                                statusOutside: e.target.checked,
                              })
                            }
                            secondaryLabel={`Sets ${OUTSIDE_HOURS_STATUS.emoji} “${OUTSIDE_HOURS_STATUS.text}” as your custom status.`}
                          >
                            Set a custom status outside working hours
                          </Switch>
                        </div>
                      </>
                    )}

                    <div className={styles['notifications-settings__actions']}>
                      <Button
                        emphasis="primary"
                        onClick={onSave}
                        disabled={invalid}
                      >
                        Save
                      </Button>
                      <Button emphasis="tertiary" onClick={onCancel}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {STATIC_AFTER.map((s) => (
          <StaticSection key={s.title} {...s} />
        ))}
      </div>
    </section>
  );
}
