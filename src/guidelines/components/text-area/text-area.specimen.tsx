import { TextArea } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function TextAreaLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <TextArea size="Small" placeholder="Small…" />
          <TextArea size="Medium" placeholder="Medium…" />
          <TextArea size="Large" placeholder="Large…" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            With label
          </span>
          <TextArea label="Description" placeholder="Enter a description…" />
          <TextArea
            label="With value"
            defaultValue="Some existing content here."
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Character counter & invalid
          </span>
          <TextArea
            label="Bio"
            placeholder="Write your bio…"
            maxLength={200}
            showCharacterCount
          />
          <TextArea label="Error field" invalid placeholder="Required field" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Disabled & read-only
          </span>
          <TextArea label="Disabled" disabled placeholder="Disabled" />
          <TextArea
            label="Read-only"
            readOnly
            defaultValue="Read only content."
          />
        </div>
      </div>
    </>
  );
}
