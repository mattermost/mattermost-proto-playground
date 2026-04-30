import Tags from '@/components/ui/Tags/Tags';
import styles from '@/pages/Components/Components.module.scss';

export default function TagsLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>Types</span>
                  <Tags type="General">General</Tags>
                  <Tags type="Info">Info</Tags>
                  <Tags type="Danger">Danger</Tags>
                  <Tags type="Success">Success</Tags>
                  <Tags type="Warning">Warning</Tags>
                  <Tags type="Info Dim">Info Dim</Tags>
                </div>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>Sizes</span>
                  <Tags size="X-Small" type="Info">X-Small</Tags>
                  <Tags size="Small" type="Info">Small</Tags>
                </div>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>All caps</span>
                  <Tags type="General" casing="All Caps">professional</Tags>
                  <Tags type="Success" casing="All Caps">active</Tags>
                </div>
              </div>
    </>
  );
}
