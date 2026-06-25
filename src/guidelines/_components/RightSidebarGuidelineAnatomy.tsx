import type { CSSProperties } from 'react';
import { RightSidebarHeader , RightSidebar} from '@mattermost/compass-ui';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';

const shellStyle: CSSProperties = {
  display: 'inline-flex',
  height: 360,
  maxWidth: '100%',
  border: '1px solid rgba(var(--center-channel-color-rgb), 0.16)',
  borderRadius: 'var(--radius-m)',
  overflow: 'hidden',
  backgroundColor: 'var(--center-channel-bg)',
};

const placeholderBodyStyle: CSSProperties = {
  padding: 'var(--spacing-l)',
  fontSize: 'var(--font-size-75)',
  lineHeight: 'var(--line-height-75)',
  color: 'rgba(var(--center-channel-color-rgb), 0.72)',
};

/**
 * Right Sidebar pattern — anatomy preview on the shared AnatomyStage surface.
 */
export function RightSidebarAnatomyStage() {
  return (
    <AnatomyStage
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto var(--spacing-m)',
      }}
    >
      <div style={shellStyle}>
        <RightSidebar
          header={
            <RightSidebarHeader
              title="Thread"
              secondaryTitle="UX Design"
              onExpand={() => {}}
              onClose={() => {}}
            />
          }
        >
          <div style={placeholderBodyStyle}>
            Body content scrolls here — for example thread messages, channel info,
            search hits, or plugin UI. Padding is owned by the content you compose
            inside the body region.
          </div>
        </RightSidebar>
      </div>
    </AnatomyStage>
  );
}
