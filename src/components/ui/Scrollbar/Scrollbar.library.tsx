import Scrollbar from '@/components/ui/Scrollbar/Scrollbar';
import styles from '@/pages/Components/Components.module.scss';

export default function ScrollbarLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>Vertical</span>
                  <Scrollbar orientation="Vertical" thumbSize="25%" scrollPosition={0} />
                  <Scrollbar orientation="Vertical" thumbSize="33%" scrollPosition={50} />
                  <Scrollbar orientation="Vertical" thumbSize="50%" scrollPosition={100} />
                </div>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>Horizontal</span>
                  <Scrollbar orientation="Horizontal" thumbSize="25%" scrollPosition={0} />
                  <Scrollbar orientation="Horizontal" thumbSize="50%" scrollPosition={50} />
                </div>
              </div>
    </>
  );
}
