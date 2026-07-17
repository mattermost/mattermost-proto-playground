import { useId, useState, type ReactNode } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import {
  type AdminPanelExpandedState,
  AdminPanelHeader} from '@mattermost/compass-ui';
import { Icon } from '@mattermost/compass-ui';
import { IconButton } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

function HeaderChrome({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: '1px solid rgba(var(--center-channel-color-rgb), 0.12)',
        borderRadius: 'var(--radius-m)',
        background: 'var(--center-channel-bg)',
        boxShadow: 'var(--elevation-1)',
        overflow: 'hidden',
        maxWidth: 920,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

export default function AdminPanelHeaderLibrary() {
  const [expanded, setExpanded] =
    useState<AdminPanelExpandedState>('Expanded');

  const idFull = useId();
  const idCollapsed = useId();
  const idControlled = useId();
  const idSubtitle = useId();
  const idTitle = useId();

  return (
    <div className={styles['components__button-block']}>
      <div>
        <p className={styles['components__instance-label']}>
          Full header (divider on)
        </p>
        <HeaderChrome>
          <AdminPanelHeader
            titleId={idFull}
            title="Section Title"
            subtitle="Section sub-title"
            iconLeft
            showEnterpriseLabel
            showBeta
            showSwitch
            switchLabel="Off"
            showButton
            buttonLabel="Button"
            showDivider
          />
        </HeaderChrome>
      </div>
      <div>
        <p className={styles['components__instance-label']}>
          Expandable, collapsed (no lower divider)
        </p>
        <HeaderChrome>
          <AdminPanelHeader
            titleId={idCollapsed}
            title="Section Title"
            subtitle="Section sub-title"
            expandable
            isExpanded={false}
            onToggleExpand={() => undefined}
            showDivider={false}
            showSwitch
            switchLabel="Off"
          />
        </HeaderChrome>
      </div>
      <div>
        <p className={styles['components__instance-label']}>
          Controlled expand + custom icon + help action
        </p>
        <HeaderChrome>
          <AdminPanelHeader
            titleId={idControlled}
            title="Section Title"
            subtitle="Section sub-title"
            iconLeft
            leadingIcon={<Icon size="20" glyph={<GlobeIcon />} />}
            expandable
            isExpanded={expanded === 'Expanded'}
            onToggleExpand={() =>
              setExpanded((s: AdminPanelExpandedState) => (s === 'Expanded' ? 'Collapsed' : 'Expanded'))
            }
            showDivider={expanded === 'Expanded'}
            headerActions={
              <IconButton
                type="button"
                style="Default"
                size="Medium"
                aria-label="Help"
                icon={<Icon size="20" glyph={<InformationOutlineIcon />} />}
              />
            }
          />
        </HeaderChrome>
      </div>
      <div>
        <p className={styles['components__instance-label']}>Title + subtitle only</p>
        <HeaderChrome>
          <AdminPanelHeader
            titleId={idSubtitle}
            title="Section Title"
            subtitle="Section sub-title"
            showDivider
          />
        </HeaderChrome>
      </div>
      <div>
        <p className={styles['components__instance-label']}>Title only</p>
        <HeaderChrome>
          <AdminPanelHeader titleId={idTitle} title="Section Title" showDivider />
        </HeaderChrome>
      </div>
    </div>
  );
}
