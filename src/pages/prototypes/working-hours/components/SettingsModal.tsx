import { useEffect, useState } from 'react';
import { Modal, ModalOverlay } from '@mattermost/compass-ui/components/modal';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import NotificationsSettings from './NotificationsSettings';
import SettingsSidebar from './SettingsSidebar';
import {
  activeWindows,
  rangeError,
  statusInvalid,
  type ScheduleState,
} from '../workingHoursData';
import styles from './SettingsModal.module.scss';

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

function isInvalid(s: ScheduleState): boolean {
  const ranges = Object.values(activeWindows(s));
  if (statusInvalid(s)) return true;
  if (ranges.length === 0) return true; // custom with no days selected
  return ranges.some((r) => !!r && rangeError(r) !== null);
}

/** Settings modal with only the Notifications → Working hours section built. */
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

  const noDays = Object.keys(activeWindows(draft)).length === 0;

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
        className={styles['settings-modal']}
        bodyPadding="none"
        scrollable={false}
        onClose={onClose}
      >
        <div className={styles['settings-modal__layout']}>
          <SettingsSidebar activeId="notifications" />
          <Scrollbar className={styles['settings-modal__pane']}>
            <NotificationsSettings
              schedule={schedule}
              draft={draft}
              onDraftChange={setDraft}
              clock24={clock24}
              expanded={expanded}
              invalid={isInvalid(draft)}
              noDays={noDays}
              onEdit={() => {
                setDraft(schedule);
                setExpanded(true);
              }}
              onSave={() => {
                onSave(draft);
                setExpanded(false);
              }}
              onCancel={() => {
                setDraft(schedule);
                setExpanded(false);
              }}
            />
          </Scrollbar>
        </div>
      </Modal>
    </ModalOverlay>
  );
}
