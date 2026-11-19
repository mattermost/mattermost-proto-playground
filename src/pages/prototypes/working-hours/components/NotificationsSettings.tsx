import { useEffect, useId, useRef } from 'react';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Switch } from '@mattermost/compass-ui/components/switch';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { CustomStatusFields } from './CustomStatusFields';
import { ScheduleForm } from './ScheduleForm';
import { scheduleSummary, type ScheduleState } from '../workingHoursData';
import styles from './NotificationsSettings.module.scss';
import formStyles from '../WorkingHours.module.scss';

/** Shown for context only; Working hours is the section that is built. */
const STATIC_AFTER = [
  {
    title: 'Out of office',
    description: 'Automatic direct message replies are off',
  },
  { title: 'Share last active time', description: 'On' },
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
        Availability
      </h2>
      <div className={styles['notifications-settings__list']}>
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
          data-wt-focus="wh-row"
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
                    <div className={styles['notifications-settings__editor']}>
                      <Switch
                        size="medium"
                        checked={draft.enabled}
                        aria-expanded={draft.enabled}
                        aria-controls={`${uid}-hours`}
                        onChange={(e) =>
                          onDraftChange({
                            ...draft,
                            enabled: e.target.checked,
                          })
                        }
                        secondaryLabel="Applies this schedule. Off keeps the setup and pauses every effect."
                      >
                        Enable working hours
                      </Switch>
                      <div
                        id={`${uid}-hours`}
                        className={[
                          styles['notifications-settings__details'],
                          draft.enabled &&
                            styles['notifications-settings__details--expanded'],
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        inert={!draft.enabled}
                        aria-hidden={!draft.enabled}
                      >
                        <div
                          className={
                            styles['notifications-settings__details-inner']
                          }
                        >
                          <div
                            className={
                              styles['notifications-settings__details-content']
                            }
                          >
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
                              className={
                                styles['notifications-settings__options']
                              }
                              data-wt-focus="wh-outside"
                            >
                              <Switch
                                size="medium"
                                checked={draft.dndOutside}
                                onChange={(e) =>
                                  onDraftChange({
                                    ...draft,
                                    dndOutside: e.target.checked,
                                  })
                                }
                              >
                                Do Not Disturb outside working hours
                              </Switch>
                              <Switch
                                size="medium"
                                checked={draft.statusOutside}
                                onChange={(e) =>
                                  onDraftChange({
                                    ...draft,
                                    statusOutside: e.target.checked,
                                  })
                                }
                              >
                                Set a custom status outside working hours
                              </Switch>
                              <CustomStatusFields
                                open={draft.statusOutside}
                                emoji={draft.statusEmoji}
                                text={draft.statusText}
                                onChange={({ emoji, text }) =>
                                  onDraftChange({
                                    ...draft,
                                    statusEmoji: emoji,
                                    statusText: text,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

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
