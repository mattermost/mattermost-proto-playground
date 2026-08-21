import type {ReactNode} from 'react';
import { MobileNavigationBar } from '@mattermost/compass-proto';
import styles from './mobile-navigation-bar.specimen.module.scss';

function Stage({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className={styles['mnb-specimen__stage']}>
      <p className={styles['mnb-specimen__label']}>{label}</p>
      <div className={styles['mnb-specimen__frame']}>{children}</div>
    </div>
  );
}

export default function MobileNavigationBarLibrary() {
  return (
    <div className={styles['mnb-specimen']}>
      <Stage label='Channel'>
        <MobileNavigationBar
          variant='Channel'
          name='UX Design'
          memberCount={32}
        />
      </Stage>

      <Stage label='Channel — mention badge'>
        <MobileNavigationBar
          variant='Channel'
          name='UX Design'
          memberCount={32}
          mentionCount={1}
        />
      </Stage>

      <Stage label='DM'>
        <MobileNavigationBar variant='DM' name='Norma Fletcher' />
      </Stage>

      <Stage label='DM — custom status'>
        <MobileNavigationBar
          variant='DM'
          name='Norma Fletcher'
          customStatusEmoji='🙂'
          customStatusText='Feeling happy'
        />
      </Stage>

      <Stage label='GM'>
        <MobileNavigationBar
          variant='GM'
          name='Hilda Martin, Steve Murphy'
          memberCount={4}
        />
      </Stage>

      <Stage label='Bot'>
        <MobileNavigationBar variant='Bot' name='Jira' />
      </Stage>
    </div>
  );
}
