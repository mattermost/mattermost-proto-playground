import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import {
  buildDefaultChannelsSidebarModel,
  ChannelsSidebar,
  GlobalHeader,
  TeamSidebar,
} from '@mattermost/compass-proto';
import { Modal, ModalOverlay } from '@mattermost/compass-ui/components/modal';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import CallsSettings from './components/CallsSettings';
import SettingsSidebar from './components/SettingsSidebar';
import {
  CALLS_SECTIONS,
  DEFAULT_CALLS_SETTINGS,
  USER_SETTINGS_SCENES,
  type CallsSectionId,
  type CallsSettingsValues,
  type UserSettingsSceneId,
} from './userSettingsData';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielleOkoro from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from './UserSettings.module.scss';

const CHANNELS_SIDEBAR_MODEL = buildDefaultChannelsSidebarModel({
  showUnreadsCategory: false,
  avatarAikoTan,
  avatarArjunPatel,
  avatarDanielleOkoro,
  avatarDariusCole,
  avatarDavidLiang,
  avatarEmmaNovak,
  avatarEthanBrooks,
});

const ALL_SECTIONS = CALLS_SECTIONS.map((s) => s.id);

const sectionsForScene = (scene: UserSettingsSceneId): Set<CallsSectionId> =>
  new Set(scene === 'expanded' ? ALL_SECTIONS : []);

const SECTION_FIELDS: Record<CallsSectionId, (keyof CallsSettingsValues)[]> = {
  audio: ['microphone', 'speaker'],
  screen: ['shareSound'],
  video: ['camera', 'mirrorVideo', 'blurBackground'],
};

export default function UserSettings() {
  const { setCenterSlot } = usePrototypeChrome();
  const [scene, setScene] = useState<UserSettingsSceneId>('collapsed');
  const [open, setOpen] = useState(true);
  const [frameEl, setFrameEl] = useState<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState<Set<CallsSectionId>>(() =>
    sectionsForScene('collapsed'),
  );
  const [values, setValues] = useState<CallsSettingsValues>(
    DEFAULT_CALLS_SETTINGS,
  );
  const [saved, setSaved] = useState<CallsSettingsValues>(
    DEFAULT_CALLS_SETTINGS,
  );

  const changeScene = useCallback((next: UserSettingsSceneId) => {
    setScene(next);
    setExpanded(sectionsForScene(next));
    setOpen(true);
  }, []);

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={USER_SETTINGS_SCENES}
        activeId={scene}
        onChange={(id) => changeScene(id as UserSettingsSceneId)}
        ariaLabel="User settings states"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, changeScene, setCenterSlot]);

  const collapse = (id: CallsSectionId) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const handleEdit = (id: CallsSectionId) =>
    setExpanded((prev) => new Set(prev).add(id));

  const handleSave = (id: CallsSectionId) => {
    setSaved((prev) => {
      const next = { ...prev };
      SECTION_FIELDS[id].forEach((key) =>
        Object.assign(next, { [key]: values[key] }),
      );
      return next;
    });
    collapse(id);
  };

  const handleCancel = (id: CallsSectionId) => {
    setValues((prev) => {
      const next = { ...prev };
      SECTION_FIELDS[id].forEach((key) =>
        Object.assign(next, { [key]: saved[key] }),
      );
      return next;
    });
    collapse(id);
  };

  // GlobalHeader has no settings callback, so listen for its cog (aria-label
  // "Settings") by delegation instead of reaching into its DOM.
  const handleHeaderClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button[aria-label="Settings"]'))
      setOpen(true);
  };

  return (
    <div className={styles['user-settings']}>
      <div ref={setFrameEl} className={styles['user-settings__shell']}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className={styles['user-settings__global-header']}
          onClick={handleHeaderClick}
        >
          <GlobalHeader
            product="channels"
            userAvatarSrc={avatarLeonard}
            userAvatarAlt="Leonard Riley"
          />
        </div>
        <div className={styles['user-settings__body']}>
          <TeamSidebar
            activeTeamId="contributors"
            teams={[
              { id: 'contributors', name: 'Task Force Aurora', initials: 'TA' },
              { id: 'design', name: 'Design', initials: 'De', unread: true },
              { id: 'acme', name: 'Acme', initials: 'Ac', mentions: 3 },
            ]}
          />
          <div className={styles['user-settings__panel']}>
            <ChannelsSidebar
              teamName="Task Force Aurora"
              showFilter
              model={CHANNELS_SIDEBAR_MODEL}
            />
            <div className={styles['user-settings__center']} />
          </div>
        </div>
        <ModalOverlay
          open={open}
          container={frameEl}
          lockScroll={false}
          onClose={() => setOpen(false)}
          style={{ position: 'absolute' }}
        >
          <Modal
            title="Settings"
            size="large"
            className={styles['user-settings__modal']}
            bodyPadding="none"
            scrollable={false}
            onClose={() => setOpen(false)}
          >
            <div className={styles['user-settings__layout']}>
              <SettingsSidebar activeId="calls" />
              <Scrollbar className={styles['user-settings__pane']}>
                <CallsSettings
                  values={values}
                  onChange={(patch) =>
                    setValues((prev) => ({ ...prev, ...patch }))
                  }
                  expanded={expanded}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </Scrollbar>
            </div>
          </Modal>
        </ModalOverlay>
      </div>
    </div>
  );
}
