import GlobeIcon from '@mattermost/compass-icons/components/globe';
import { Tag } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function TagLibrary() {
  return (
    <>
      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>Types</h3>
        <div className={styles['components__row']}>
          <Tag label="Default" type="Default" />
          <Tag label="Info" type="Info" />
          <Tag label="Info Dim" type="Info Dim" />
          <Tag label="Danger" type="Danger" />
          <Tag label="Success" type="Success" />
          <Tag label="Warning" type="Warning" />
        </div>
      </div>
      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>Sizes</h3>
        <div className={styles['components__row']}>
          <Tag label="Default" type="Default" size="Small" />
          <Tag label="Info" type="Info" size="Small" />
          <Tag label="Info Dim" type="Info Dim" size="Small" />
          <Tag label="Danger" type="Danger" size="Small" />
          <Tag label="Success" type="Success" size="Small" />
          <Tag label="Warning" type="Warning" size="Small" />
        </div>
      </div>
      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>All caps</h3>
        <div className={styles['components__row']}>
          <Tag label="Tag" type="Default" casing="All Caps" />
          <Tag label="Tag" type="Info" casing="All Caps" />
          <Tag label="Tag" type="Info Dim" casing="All Caps" />
          <Tag label="Tag" type="Danger" casing="All Caps" />
          <Tag label="Tag" type="Success" casing="All Caps" />
          <Tag label="Tag" type="Warning" casing="All Caps" />
        </div>
      </div>
      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>With icon</h3>
        <div className={styles['components__row']}>
          <Tag
            label="Professional"
            casing="All Caps"
            leadingIcon={<GlobeIcon size={10} />}
            type="Default"
          />
          <Tag
            label="Info"
            leadingIcon={<GlobeIcon size={10} />}
            type="Info"
          />
          <Tag
            label="Success"
            leadingIcon={<GlobeIcon size={12} />}
            size="Small"
            type="Success"
          />
        </div>
      </div>
    </>
  );
}
