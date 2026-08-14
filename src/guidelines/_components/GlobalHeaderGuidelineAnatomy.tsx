import { GlobalHeader } from '@mattermost/compass-ui';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';

/**
 * Global Header pattern — anatomy preview on the shared AnatomyStage surface.
 */
export function GlobalHeaderAnatomyStage() {
  return (
    <AnatomyStage
      style={{
        alignItems: 'stretch',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 960 }}>
        <GlobalHeader
          product="Channels"
          userAvatarSrc={avatarLeonard}
          userAvatarAlt="Leonard Riley"
        />
      </div>
    </AnatomyStage>
  );
}
