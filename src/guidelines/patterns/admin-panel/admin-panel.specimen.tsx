import { useState } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import {
  type AdminPanelExpandedState,
  AdminPanel} from '@mattermost/compass-ui';
import { Icon } from '@mattermost/compass-ui';
import { IconButton } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function AdminPanelPatternSpecimen() {
  const [controlledExpand, setControlledExpand] =
    useState<AdminPanelExpandedState>('Expanded');

  return (
    <div className={styles['components__button-block']}>
      <div>
        <p className={styles['components__instance-label']}>
          Figma header toggles on (expanded)
        </p>
        <AdminPanel
          title="Section Title"
          subtitle="Section sub-title"
          iconLeft
          showEnterpriseLabel
          showBeta
          showSwitch
          switchLabel="Off"
          showButton
          buttonLabel="Button"
          expandable
          defaultExpandedState="Expanded"
        >
          Section content — body hides when collapsed and expandable.
        </AdminPanel>
      </div>
      <div>
        <p className={styles['components__instance-label']}>
          Expandable, starts collapsed (no divider until open)
        </p>
        <AdminPanel
          title="Section Title"
          subtitle="Section sub-title"
          expandable
          defaultExpandedState="Collapsed"
          showSwitch
          switchLabel="Off"
        >
          Content appears after expand.
        </AdminPanel>
      </div>
      <div>
        <p className={styles['components__instance-label']}>
          Controlled expand + custom leading icon
        </p>
        <AdminPanel
          title="Section Title"
          subtitle="Section sub-title"
          iconLeft
          leadingIcon={<Icon size="20" glyph={<GlobeIcon />} />}
          expandable
          expandedState={controlledExpand}
          onExpandedStateChange={setControlledExpand}
          headerActions={
            <IconButton
              type="button"
              style="Default"
              size="Medium"
              aria-label="Help"
              icon={<Icon size="20" glyph={<InformationOutlineIcon />} />}
            />
          }
        >
          Controlled via parent state ({controlledExpand}).
        </AdminPanel>
      </div>
      <div>
        <p className={styles['components__instance-label']}>With subtitle</p>
        <AdminPanel
          title="Section Title"
          subtitle="Section sub-title"
        >
          Section content
        </AdminPanel>
      </div>
      <div>
        <p className={styles['components__instance-label']}>Title only</p>
        <AdminPanel title="Section Title">
          Section content
        </AdminPanel>
      </div>
    </div>
  );
}
