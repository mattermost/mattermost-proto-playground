import { Divider } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function DividerLibrary() {
  return (
    <>
      <div className={styles['components__divider-demo']}>
        <p className={styles['components__demo-text']}>Content above</p>
        <Divider />
        <p className={styles['components__demo-text']}>Content below</p>
      </div>
    </>
  );
}
