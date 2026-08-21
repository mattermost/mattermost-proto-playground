import { useState, type ReactNode} from 'react';
import {
  Button, Icon, TeamAvatar } from '@mattermost/compass-ui';
import { MobileBottomSheet, MobileMenuItem } from '@mattermost/compass-proto';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import CameraOutlineIcon from '@mattermost/compass-icons/components/camera-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import FolderOutlineIcon from '@mattermost/compass-icons/components/folder-outline';
import ImageOutlineIcon from '@mattermost/compass-icons/components/image-outline';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import DeviceFrame from '@/components/layout/DeviceFrame';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import styles from './mobile-bottom-sheet.specimen.module.scss';

function Stage({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className={styles['mbs-specimen__stage']}>
      <p className={styles['mbs-specimen__label']}>{label}</p>
      {children}
    </div>
  );
}

function MenuRows() {
  return (
    <>
      <MobileMenuItem
        label='Menu Item Label'
        leadingVisual={<Icon glyph={<EmoticonHappyOutlineIcon />} size='20' />}
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
        leadingVisual={<Icon glyph={<EmoticonHappyOutlineIcon />} size='20' />}
      />
    </>
  );
}

function InteractiveSheet() {
  const [open, setOpen] = useState(false);

  return (
    <DeviceFrame insetContent={false} statusBarStyle='dark'>
      <div className={styles['mbs-specimen__device']}>
        <div className={styles['mbs-specimen__device-body']}>
          <p className={styles['mbs-specimen__device-copy']}>
            Channel content behind the sheet.
          </p>
          <Button emphasis='Primary' onClick={() => setOpen(true)}>
            Open bottom sheet
          </Button>
        </div>
        <MobileBottomSheet
          open={open}
          onClose={() => setOpen(false)}
          title='Files and media'
          footer={
            <Button
              emphasis='Primary'
              size='Large'
              className={styles['mbs-specimen__footer-btn']}
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          }
        >
          <MobileMenuItem
            label='Photo Library'
            leadingVisual={<Icon glyph={<ImageOutlineIcon />} size='20' />}
            onClick={() => setOpen(false)}
          />
          <MobileMenuItem
            label='Take Photo or Video'
            leadingVisual={<Icon glyph={<CameraOutlineIcon />} size='20' />}
            onClick={() => setOpen(false)}
          />
          <MobileMenuItem
            label='Browse Files'
            leadingVisual={<Icon glyph={<FolderOutlineIcon />} size='20' />}
            onClick={() => setOpen(false)}
          />
          <MobileMenuItem
            label='Record Video'
            leadingVisual={<Icon glyph={<VideoOutlineIcon />} size='20' />}
            onClick={() => setOpen(false)}
          />
        </MobileBottomSheet>
      </div>
    </DeviceFrame>
  );
}

export default function MobileBottomSheetLibrary() {
  return (
    <div className={styles['mbs-specimen']}>
      <Stage label='Full standard'>
        <DeviceFrame insetContent={false} statusBarStyle='dark'>
          <div className={styles['mbs-specimen__device']}>
            <div className={styles['mbs-specimen__device-body']}>
              <p className={styles['mbs-specimen__device-copy']}>
                Dimmed channel behind the sheet.
              </p>
            </div>
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
                  className={styles['mbs-specimen__footer-btn']}
                >
                  Primary Button
                </Button>
              }
            >
              <MenuRows />
            </MobileBottomSheet>
          </div>
        </DeviceFrame>
      </Stage>

      <Stage label='Title + body only'>
        <DeviceFrame insetContent={false} statusBarStyle='dark'>
          <div className={styles['mbs-specimen__device']}>
            <div className={styles['mbs-specimen__device-body']}>
              <p className={styles['mbs-specimen__device-copy']}>
                Simpler sheet without avatar or footer.
              </p>
            </div>
            <MobileBottomSheet open title='Choose an action'>
              <MenuRows />
            </MobileBottomSheet>
          </div>
        </DeviceFrame>
      </Stage>

      <Stage label='Interactive'>
        <InteractiveSheet />
      </Stage>
    </div>
  );
}
