import { useEffect, useState } from 'react';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  AdminConsoleHeader,
  AdminConsoleSidebar,
  Button,
  Scrollbar,
  defaultAdminConsoleSidebarGroups,
} from '@mattermost/compass-ui';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import {
  MARKINGS_SCENES,
  type MarkingsSceneId,
} from './classificationMarkingsScenes';
import CurrentScene from './scenes/CurrentScene';
import IntegratedScene from './scenes/IntegratedScene';
import ReworkedScene from './scenes/ReworkedScene';
import styles from './ClassificationMarkingsConfig.module.scss';

const sidebarGroups = defaultAdminConsoleSidebarGroups.map((group) => {
  if (group.key !== 'site') {
    return {
      ...group,
      items: group.items.map((item) => ({ ...item, active: false })),
    };
  }

  const withoutActive = group.items.map((item) => ({ ...item, active: false }));
  const hasMarkings = withoutActive.some(
    (item) => item.name === 'Classification Markings',
  );
  const items = hasMarkings
    ? withoutActive.map((item) =>
        item.name === 'Classification Markings'
          ? { ...item, active: true }
          : item,
      )
    : [...withoutActive, { name: 'Classification Markings', active: true }];

  return { ...group, items };
});

export default function ClassificationMarkingsConfig() {
  const { setCenterSlot } = usePrototypeChrome();
  const [scene, setScene] = useState<MarkingsSceneId>('integrated');

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={MARKINGS_SCENES}
        activeId={scene}
        onChange={(id) => setScene(id as MarkingsSceneId)}
        ariaLabel="Classification Markings versions"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, setCenterSlot]);

  const handleSave = () => {
    // Prototype: no persistence yet.
  };

  return (
    <div className={styles['markings-config']}>
      <div className={styles['markings-config__sidebar-mount']}>
        <AdminConsoleSidebar
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          groups={sidebarGroups}
        />
      </div>

      <div className={styles['markings-config__main']}>
        <AdminConsoleHeader title="Classification Markings" />

        <div className={styles['markings-config__scroll']}>
          <Scrollbar>
            {scene === 'integrated' ? (
              <IntegratedScene />
            ) : scene === 'reworked' ? (
              <ReworkedScene />
            ) : (
              <CurrentScene />
            )}
          </Scrollbar>
        </div>

        <div className={styles['markings-config__footer']}>
          <Button
            type="button"
            emphasis="Primary"
            size="Medium"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
