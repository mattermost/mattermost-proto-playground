import { Button, Icon, TeamAvatar } from '@mattermost/compass-ui';
import { MobileBottomSheet, MobileMenuItem } from '@mattermost/compass-proto';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import LogoutVariantIcon from '@mattermost/compass-icons/components/logout-variant';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import styles from './MobileBottomSheetGuidelineAnatomy.module.scss';

/**
 * Mobile Bottom Sheet — anatomy preview on the shared AnatomyStage surface.
 */
export function MobileBottomSheetAnatomyStage() {
  return (
    <AnatomyStage
      style={{
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        margin: '0 auto var(--spacing-m)',
        minHeight: 520,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <div className={styles['mobile-bottom-sheet-anatomy__frame']}>
        <MobileBottomSheet
          open
          title='Bottom sheet title'
          subtitle='Bottom sheet subtitle'
          leadingVisual={
            <TeamAvatar src={avatarStaffTeam} alt='Team' size='72' />
          }
          footer={
            <Button
              emphasis='Primary'
              size='Large'
              className={styles['mobile-bottom-sheet-anatomy__footer-btn']}
            >
              Primary Button
            </Button>
          }
        >
          <MobileMenuItem
            label='Menu Item Label'
            leadingVisual={
              <Icon glyph={<EmoticonHappyOutlineIcon />} size='20' />
            }
          />
          <MobileMenuItem
            label='Menu Item Label'
            leadingVisual={<Icon glyph={<AccountOutlineIcon />} size='20' />}
          />
          <MobileMenuItem
            label='Menu Item Label'
            active
            leadingVisual={<Icon glyph={<BellOutlineIcon />} size='20' />}
          />
          <MobileMenuItem
            label='Menu Item Label'
            leadingVisual={<Icon glyph={<CogOutlineIcon />} size='20' />}
          />
          <MobileMenuItem
            label='Menu Item Label'
            leadingVisual={<Icon glyph={<LogoutVariantIcon />} size='20' />}
          />
        </MobileBottomSheet>
      </div>
    </AnatomyStage>
  );
}
