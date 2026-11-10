import { useEffect, useState } from 'react';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import { AdminConsoleSidebar, GlobalHeader } from '@mattermost/compass-proto';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { CALLS_SIDEBAR_GROUPS } from '@/pages/prototypes/calls-admin-console/callsAdminConsoleData';
import {
  SCENES,
  type SceneId,
} from '@/pages/prototypes/calls-admin-console/callsAdminConsoleScenes';
import { SettingsScene } from '@/pages/prototypes/calls-admin-console/scenes/SettingsScene';
import styles from './CallsAdminConsole.module.scss';

export default function CallsAdminConsole() {
  const { setCenterSlot } = usePrototypeChrome();
  const [activeScene, setActiveScene] = useState<SceneId>('settings');

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={SCENES}
        activeId={activeScene}
        onChange={(id) => setActiveScene(id as SceneId)}
        ariaLabel="Calls admin console scenes"
      />,
    );
    return () => setCenterSlot(null);
  }, [activeScene, setCenterSlot]);

  return (
    <div className={styles['calls-admin']}>
      <div className={styles['calls-admin__shell']}>
        <GlobalHeader
          product="channels"
          userAvatarSrc={avatarLeonard}
          userAvatarAlt="Leonard Riley"
        />
        <div className={styles['calls-admin__body']}>
          <div className={styles['calls-admin__sidebar']}>
            <AdminConsoleSidebar
              avatarSrc={avatarLeonard}
              avatarAlt="Leonard Riley"
              groups={CALLS_SIDEBAR_GROUPS}
            />
          </div>
          <div className={styles['calls-admin__main']}>
            {activeScene === 'settings' && <SettingsScene />}
          </div>
        </div>
      </div>
    </div>
  );
}
