import GlobeIcon from '@mattermost/compass-icons/components/globe';
import { LabelTag } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function LabelTagLibrary() {
  return (
    <>
      <div className={styles['components__button-row']}>
        <span className={styles['components__instance-label']}>
          Types · X-Small
        </span>
        <LabelTag label="Default" type="Default" />
        <LabelTag label="Info" type="Info" />
        <LabelTag label="Info Dim" type="Info Dim" />
        <LabelTag label="Danger" type="Danger" />
        <LabelTag label="Success" type="Success" />
        <LabelTag label="Warning" type="Warning" />
      </div>
      <div className={styles['components__button-row']}>
        <span className={styles['components__instance-label']}>
          Types · Small
        </span>
        <LabelTag label="Default" type="Default" size="Small" />
        <LabelTag label="Info" type="Info" size="Small" />
        <LabelTag label="Info Dim" type="Info Dim" size="Small" />
        <LabelTag label="Danger" type="Danger" size="Small" />
        <LabelTag label="Success" type="Success" size="Small" />
        <LabelTag label="Warning" type="Warning" size="Small" />
      </div>
      <div className={styles['components__button-row']}>
        <span className={styles['components__instance-label']}>All Caps</span>
        <LabelTag label="Tag" type="Default" casing="All Caps" />
        <LabelTag label="Tag" type="Info" casing="All Caps" />
        <LabelTag label="Tag" type="Info Dim" casing="All Caps" />
        <LabelTag label="Tag" type="Danger" casing="All Caps" />
        <LabelTag label="Tag" type="Success" casing="All Caps" />
        <LabelTag label="Tag" type="Warning" casing="All Caps" />
      </div>
      <div className={styles['components__button-row']}>
        <span className={styles['components__instance-label']}>With icon</span>
        <LabelTag
          label="PROFESSIONAL"
          type="Default"
          casing="All Caps"
          leadingIcon={<GlobeIcon size={10} />}
        />
        <LabelTag
          label="Info"
          type="Info"
          leadingIcon={<GlobeIcon size={10} />}
        />
        <LabelTag
          label="Success"
          type="Success"
          size="Small"
          leadingIcon={<GlobeIcon size={12} />}
        />
      </div>
    </>
  );
}
