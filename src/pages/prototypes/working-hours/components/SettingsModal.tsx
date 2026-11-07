import { useEffect, useRef, useState, type ReactNode } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import DockLeftIcon from '@mattermost/compass-icons/components/dock-left';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import TuneIcon from '@mattermost/compass-icons/components/tune';
import { Button } from '@mattermost/compass-ui/components/button';
import { Divider } from '@mattermost/compass-ui/components/divider';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { Modal, ModalOverlay } from '@mattermost/compass-ui/components/modal';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Switch } from '@mattermost/compass-ui/components/switch';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { ScheduleForm } from './ScheduleForm';
import {
  activeWindows,
  OUTSIDE_HOURS_STATUS,
  rangeError,
  scheduleSummary,
  type ScheduleState,
} from '../workingHoursData';
import styles from '../WorkingHours.module.scss';

type Props = {
  open: boolean;
  /** Element the scrim is staged in (keeps it inside the prototype shell). */
  container: HTMLElement | null;
  onClose: () => void;
  /** Open with the Working Hours section expanded (profile-menu entry). */
  startExpanded: boolean;
  schedule: ScheduleState;
  clock24: boolean;
  onSave: (next: ScheduleState) => void;
};

const NAV = [
  { label: 'Notifications', icon: <BellOutlineIcon /> },
  { label: 'Display', icon: <EyeOutlineIcon /> },
  { label: 'Sidebar', icon: <DockLeftIcon /> },
  { label: 'Advanced', icon: <TuneIcon /> },
];

const STATIC_ROWS_BEFORE = [
  {
    title: 'Desktop and mobile notifications',
    value: 'Mentions, direct messages, and group messages',
  },
  {
    title: 'Desktop notification sounds',
    value: 'Bing for messages, Calm for calls',
  },
  { title: 'Email notifications', value: 'Never' },
  {
    title: 'Keywords that trigger mentions',
    value: '“@leonard.riley”, “leonard.riley”, “@channel”, “@all”, “@here”',
  },
];

function isInvalid(s: ScheduleState): boolean {
  if (!s.enabled) return false;
  const ranges = Object.values(activeWindows(s));
  if (ranges.length === 0) return true; // custom with no days selected
  return ranges.some((r) => !!r && rangeError(r) !== null);
}

/** One collapsed setting: title, current value and an Edit link (Figma "Account Setting"). */
function SettingRow({
  title,
  value,
  tag,
  onEdit,
  expanded,
}: {
  title: string;
  value: ReactNode;
  tag?: boolean;
  onEdit?: () => void;
  /** Set when Edit expands this setting in place. */
  expanded?: boolean;
}) {
  return (
    <div className={styles['setting-row']}>
      <div className={styles['setting-row__text']}>
        <p className={styles['setting-row__title']}>
          {title}
          {tag && (
            <Tag label="New" type="success" casing="all-caps" size="x-small" />
          )}
        </p>
        <p className={styles['setting-row__value']}>{value}</p>
      </div>
      <Button
        emphasis="link"
        size="small"
        leadingIcon={<Icon glyph={<PencilOutlineIcon />} />}
        aria-expanded={expanded}
        onClick={onEdit}
      >
        Edit
      </Button>
    </div>
  );
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
  const sectionRef = useRef<HTMLElement>(null);

  // Re-seed whenever the modal is (re)opened from a different entry point.
  useEffect(() => {
    if (open) {
      setExpanded(startExpanded);
      setDraft(schedule);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, startExpanded]);

  // Bring the editor into view, as the design shows it.
  useEffect(() => {
    if (open && expanded) {
      sectionRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [open, expanded]);

  const startEditing = () => {
    setDraft(schedule);
    setExpanded(true);
  };
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
                key={n.label}
                label={n.label}
                leadingVisual={<Icon glyph={n.icon} />}
                active={n.label === 'Notifications'}
              />
            ))}
            <Divider />
            <MenuGroupHeading label="Plugin preferences" />
            <MenuItem
              label="MS Teams"
              leadingVisual={<Icon glyph={<AccountMultipleOutlineIcon />} />}
            />
          </nav>

          <Scrollbar>
            <div className={styles['settings__content']}>
              <div className={styles['settings__header']}>
                <h2 className={styles['settings__title']}>Notifications</h2>
                <Button
                  emphasis="tertiary"
                  size="small"
                  leadingIcon={<Icon glyph={<InformationOutlineIcon />} />}
                >
                  Learn more about notifications
                </Button>
              </div>

              <div className={styles['settings__list']}>
                {STATIC_ROWS_BEFORE.map((r) => (
                  <SettingRow key={r.title} title={r.title} value={r.value} />
                ))}

                <div
                  className={[
                    styles['settings__collapse'],
                    !expanded && styles['settings__collapse--expanded'],
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  inert={expanded}
                >
                  <div className={styles['settings__collapse-inner']}>
                    <SettingRow
                      title="Working hours"
                      value={scheduleSummary(schedule, clock24)}
                      tag
                      onEdit={startEditing}
                      expanded={expanded}
                    />
                  </div>
                </div>
                <div
                  className={[
                    styles['settings__collapse'],
                    expanded && styles['settings__collapse--expanded'],
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  inert={!expanded}
                >
                  <div className={styles['settings__collapse-inner']}>
                    <section
                      ref={sectionRef}
                      className={styles['settings__section']}
                      aria-labelledby="wh-section-title"
                      data-testid="working-hours-section"
                    >
                      <div className={styles['settings__section-header']}>
                        <h3
                          id="wh-section-title"
                          className={styles['settings__section-title']}
                        >
                          Working hours
                        </h3>
                        <Tag
                          label="New"
                          type="success"
                          casing="all-caps"
                          size="x-small"
                        />
                      </div>

                      <div className={styles['settings__section-body']}>
                        <p className={styles['settings__description']}>
                          Set the days and times you work. Teammates are told
                          when it is outside your working hours, and you can
                          choose to pause notifications and set a custom status.
                        </p>

                        <Switch
                          className={styles['settings__switch']}
                          checked={draft.enabled}
                          onChange={(e) =>
                            setDraft({ ...draft, enabled: e.target.checked })
                          }
                        >
                          Enable working hours
                        </Switch>

                        {draft.enabled && (
                          <>
                            <ScheduleForm
                              schedule={draft}
                              clock24={clock24}
                              onChange={setDraft}
                            />
                            {noDays && (
                              <p
                                className={styles['time-range__error']}
                                role="alert"
                              >
                                Select at least one day.
                              </p>
                            )}
                            <div className={styles['settings__options']}>
                              <Switch
                                className={styles['settings__switch']}
                                checked={draft.dndOutside}
                                onChange={(e) =>
                                  setDraft({
                                    ...draft,
                                    dndOutside: e.target.checked,
                                  })
                                }
                                secondaryLabel="Silence notifications and set your status to Do Not Disturb."
                              >
                                Do Not Disturb outside working hours
                              </Switch>
                              <Switch
                                className={styles['settings__switch']}
                                checked={draft.statusOutside}
                                onChange={(e) =>
                                  setDraft({
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

                        <Divider />
                        <div className={styles['settings__actions']}>
                          <Button
                            emphasis="primary"
                            size="large"
                            onClick={save}
                            disabled={isInvalid(draft)}
                          >
                            Save
                          </Button>
                          <Button
                            emphasis="tertiary"
                            size="large"
                            onClick={cancel}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                <SettingRow
                  title="Automatic direct message replies"
                  value="Off"
                />
              </div>
            </div>
          </Scrollbar>
        </div>
      </Modal>
    </ModalOverlay>
  );
}
