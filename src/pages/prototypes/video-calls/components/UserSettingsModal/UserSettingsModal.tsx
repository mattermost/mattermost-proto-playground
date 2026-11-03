import { useState } from 'react';
import { Modal, ModalOverlay } from '@mattermost/compass-ui/components/modal';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import CallsSettings from './CallsSettings';
import SettingsSidebar from './SettingsSidebar';
import {
  DEFAULT_CALLS_SETTINGS,
  type CallsSectionId,
  type CallsSettingsValues,
} from './userSettingsData';
import styles from './UserSettingsModal.module.scss';

const SECTION_FIELDS: Record<CallsSectionId, (keyof CallsSettingsValues)[]> = {
  audio: ['microphone', 'speaker'],
  screen: ['shareSound'],
  video: ['camera', 'mirrorVideo', 'blurBackground'],
};

export interface UserSettingsModalProps {
  open: boolean;
  onClose: () => void;
  /** Portal node: the channels frame, so the scrim is clipped to the app layout. */
  container: HTMLElement | null;
}

/**
 * User Settings modal with only the Calls tab mocked (the other tabs are inert
 * chrome). Each Calls section expands in place with Save / Cancel. The host
 * owns open state; this owns the section and form state.
 */
export default function UserSettingsModal({
  open,
  onClose,
  container,
}: UserSettingsModalProps) {
  const [expanded, setExpanded] = useState<Set<CallsSectionId>>(new Set());
  const [values, setValues] = useState(DEFAULT_CALLS_SETTINGS);
  const [saved, setSaved] = useState(DEFAULT_CALLS_SETTINGS);

  const collapse = (id: CallsSectionId) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const copyFields = (
    id: CallsSectionId,
    from: CallsSettingsValues,
    into: CallsSettingsValues,
  ): CallsSettingsValues => {
    const next = { ...into };
    SECTION_FIELDS[id].forEach((key) =>
      Object.assign(next, { [key]: from[key] }),
    );
    return next;
  };

  // Reopening starts collapsed with unsaved edits discarded.
  const handleExited = () => {
    setExpanded(new Set());
    setValues(saved);
  };

  return (
    <ModalOverlay
      open={open}
      container={container}
      lockScroll={false}
      onClose={onClose}
      style={{ position: 'absolute' }}
    >
      <Modal
        open={open}
        onExited={handleExited}
        title="Settings"
        size="large"
        className={styles['user-settings-modal']}
        bodyPadding="none"
        scrollable={false}
        onClose={onClose}
      >
        <div className={styles['user-settings-modal__layout']}>
          <SettingsSidebar activeId="calls" />
          <Scrollbar className={styles['user-settings-modal__pane']}>
            <CallsSettings
              values={values}
              onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
              expanded={expanded}
              onEdit={(id) => setExpanded((prev) => new Set(prev).add(id))}
              onSave={(id) => {
                setSaved((prev) => copyFields(id, values, prev));
                collapse(id);
              }}
              onCancel={(id) => {
                setValues((prev) => copyFields(id, saved, prev));
                collapse(id);
              }}
            />
          </Scrollbar>
        </div>
      </Modal>
    </ModalOverlay>
  );
}
