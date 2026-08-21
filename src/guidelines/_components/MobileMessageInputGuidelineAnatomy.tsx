import {useState} from 'react';
import { MobileMessageInput } from '@mattermost/compass-proto';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import sampleImage from '@/assets/images/sample-image.jpg';
import styles from './MobileMessageInputGuidelineAnatomy.module.scss';

/**
 * Mobile Message Input — anatomy preview on the shared AnatomyStage surface.
 */
export function MobileMessageInputAnatomyStage() {
  const [value, setValue] = useState('');

  return (
    <AnatomyStage
      style={{
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div className={styles['mobile-message-input-anatomy__frame']}>
        <MobileMessageInput
          variant='Root'
          placeholder='Write to UX Design…'
          value={value}
          onChange={setValue}
          defaultFocused
          attachments={[
            {
              id: 'anatomy-1',
              src: sampleImage,
              alt: 'Sample attachment',
            },
          ]}
        />
      </div>
    </AnatomyStage>
  );
}
