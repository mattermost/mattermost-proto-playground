import { useEffect, useState } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { Modal, ModalOverlay } from '@mattermost/compass-ui/components/modal';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Switch } from '@mattermost/compass-ui/components/switch';
import { ScheduleForm } from './ScheduleForm';
import {
  rangeError,
  scheduleSummary,
  activeWindows,
  type ScheduleState,
} from '../notificationScheduleData';
import styles from '../NotificationSchedule.module.scss';

type Props = {
  open: boolean;
  /** Element the scrim is staged in (keeps it inside the prototype shell). */
  container: HTMLElement | null;
  onClose: () => void;
  /** Open with the Notification Schedule section expanded (profile-menu entry). */
  startExpanded: boolean;
  schedule: ScheduleState;
  clock24: boolean;
  onSave: (next: ScheduleState) => void;
};

const NAV = ['Notifications', 'Display', 'Sidebar', 'Advanced'];

function isInvalid(s: ScheduleState): boolean {
  if (!s.enabled) return false;
  const windows = activeWindows(s);
  const ranges = Object.values(windows);
  if (ranges.length === 0) return true; // custom with no days selected
  return ranges.some((r) => !!r && rangeError(r) !== null);
}

export function SettingsModal({
  open,
  container,
  onClose,
  startExpanded,
  schedule,
  clock24,
  onSave,
}: Props) {
  const [expanded, setExpanded] = useState(startExpanded);
  const [draft, setDraft] = useState<ScheduleState>(schedule);

  // Re-seed whenever the modal is (re)opened from a different entry point.
  useEffect(() => {
    if (open) {
      setExpanded(startExpanded);
      setDraft(schedule);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, startExpanded]);

  const cancel = () => {
    setDraft(schedule);
    setExpanded(false);
  };
  const save = () => {
    onSave(draft);
    setExpanded(false);
  };

  const noDays =
    draft.enabled && Object.keys(activeWindows(draft)).length === 0;

  return (
    <ModalOverlay
      open={open}
      onClose={onClose}
      container={container}
      lockScroll={false}
      style={{ position: 'absolute' }}
    >
      <Modal
        open={open}
        title="Settings"
        size="large"
        bodyPadding="none"
        scrollable={false}
        footerDivider={false}
        onClose={onClose}
        className={styles['settings-modal']}
        footer={null}
      >
        <div className={styles['settings']}>
          <nav
            className={styles['settings__nav']}
            aria-label="Settings sections"
          >
            {NAV.map((n) => (
              <MenuItem
                key={n}
                label={n}
                leadingElement={false}
                active={n === 'Notifications'}
              />
            ))}
          </nav>

          <Scrollbar>
            <div className={styles['settings__content']}>
              <h2 className={styles['settings__title']}>Notifications</h2>

              <section className={styles['settings__section']}>
                <div className={styles['settings__row']}>
                  <div>
                    <h3 className={styles['settings__section-title']}>
                      Desktop and mobile notifications
                    </h3>
                    <p className={styles['settings__summary']}>
                      Mentions, direct messages and keywords
                    </p>
                  </div>
                  <Button emphasis="tertiary" size="small">
                    Edit
                  </Button>
                </div>
              </section>

              <section
                className={styles['settings__section']}
                aria-labelledby="ns-section-title"
                data-testid="notification-schedule-section"
              >
                <div className={styles['settings__row']}>
                  <div>
                    <h3
                      id="ns-section-title"
                      className={styles['settings__section-title']}
                    >
                      Notification Schedule
                    </h3>
                    {!expanded && (
                      <p className={styles['settings__summary']}>
                        {scheduleSummary(schedule, clock24)}
                      </p>
                    )}
                  </div>
                  {!expanded && (
                    <Button
                      emphasis="tertiary"
                      size="small"
                      onClick={() => {
                        setDraft(schedule);
                        setExpanded(true);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {expanded && (
                  <div className={styles['settings__editor']}>
                    <Switch
                      checked={draft.enabled}
                      onChange={(e) =>
                        setDraft({ ...draft, enabled: e.target.checked })
                      }
                      secondaryLabel="Outside these hours your status is set to Do Not Disturb and notifications are silenced."
                    >
                      Enable notification schedule
                    </Switch>

                    {draft.enabled && (
                      <ScheduleForm
                        schedule={draft}
                        clock24={clock24}
                        onChange={setDraft}
                      />
                    )}
                    {noDays && (
                      <p className={styles['time-range__error']} role="alert">
                        Select at least one day.
                      </p>
                    )}

                    <div className={styles['settings__actions']}>
                      <Button emphasis="tertiary" onClick={cancel}>
                        Cancel
                      </Button>
                      <Button
                        emphasis="primary"
                        onClick={save}
                        disabled={isInvalid(draft)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </Scrollbar>
        </div>
      </Modal>
    </ModalOverlay>
  );
}
