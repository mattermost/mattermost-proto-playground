import { useState } from 'react';
import { Modal, ModalOverlay } from '@mattermost/compass-ui/components/modal';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { useMediaDevices } from '../../hooks/useMediaDevices';
import { useVideoCall } from '../../videoCallContext';
import CallsSettings from './CallsSettings';
import SettingsSidebar from './SettingsSidebar';
import {
  DEFAULT_LOCAL_SETTINGS,
  FALLBACK_CAMERAS,
  FALLBACK_MICROPHONES,
  FALLBACK_SPEAKERS,
  type CallsSectionId,
  type CallsSettingsValues,
  type DeviceField,
  type DeviceOption,
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
  const { state, actions } = useVideoCall();
  const { media } = state;
  const devices = useMediaDevices({ enabled: open });
  const toOptions = (
    list: { deviceId: string; label: string }[],
    fallback: DeviceOption[],
  ): DeviceOption[] =>
    list.length
      ? list.map((d) => ({ value: d.deviceId, label: d.label }))
      : fallback;
  const microphones = toOptions(devices.microphones, FALLBACK_MICROPHONES);
  const speakers = toOptions(devices.speakers, FALLBACK_SPEAKERS);
  const cameras = toOptions(devices.cameras, FALLBACK_CAMERAS);

  const [expanded, setExpanded] = useState<Set<CallsSectionId>>(new Set());
  // Non-device fields persist here; device ids persist in the call's media prefs.
  const [saved, setSaved] = useState(DEFAULT_LOCAL_SETTINGS);
  // Unsaved edits layered over the saved values, per field.
  const [draft, setDraft] = useState<Partial<CallsSettingsValues>>({});

  const values: CallsSettingsValues = {
    ...saved,
    microphone: media.micDeviceId ?? microphones[0].value,
    speaker: media.speakerDeviceId ?? speakers[0].value,
    camera: media.cameraDeviceId ?? cameras[0].value,
    ...draft,
  };

  const collapse = (id: CallsSectionId) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const clearDraft = (id: CallsSectionId) =>
    setDraft((prev) => {
      const next = { ...prev };
      SECTION_FIELDS[id].forEach((key) => delete next[key]);
      return next;
    });

  const handleSave = (id: CallsSectionId) => {
    const deviceIds: Record<
      DeviceField,
      'micDeviceId' | 'speakerDeviceId' | 'cameraDeviceId'
    > = {
      microphone: 'micDeviceId',
      speaker: 'speakerDeviceId',
      camera: 'cameraDeviceId',
    };
    SECTION_FIELDS[id].forEach((key) => {
      if (key === 'microphone' || key === 'speaker' || key === 'camera') {
        actions.setMedia({ [deviceIds[key]]: values[key] });
      } else {
        setSaved((prev) => ({ ...prev, [key]: values[key] }));
      }
    });
    clearDraft(id);
    collapse(id);
  };

  // Reopening starts collapsed with unsaved edits discarded.
  const handleExited = () => {
    setExpanded(new Set());
    setDraft({});
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
              microphones={microphones}
              speakers={speakers}
              cameras={cameras}
              onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
              expanded={expanded}
              onEdit={(id) => setExpanded((prev) => new Set(prev).add(id))}
              onSave={handleSave}
              onCancel={(id) => {
                clearDraft(id);
                collapse(id);
              }}
            />
          </Scrollbar>
        </div>
      </Modal>
    </ModalOverlay>
  );
}
