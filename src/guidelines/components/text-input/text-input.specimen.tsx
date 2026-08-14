import GlobeIcon from '@mattermost/compass-icons/components/globe';
import { Icon } from '@mattermost/compass-ui';
import { TextInput } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function TextInputLibrary() {
  return (
    <>
      <p
        className={styles['components__subheading']}
        style={{ marginBottom: 'var(--spacing-m)' }}
      >
        Figma Text Input v2.0.1 (Border=On). Floating label when{' '}
        <code>label</code> is provided: resting when empty/unfocused, floated
        when focused or has value. Theme variables only.
      </p>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <TextInput size="Small" placeholder="Small" />
          <TextInput size="Medium" placeholder="Medium" />
          <TextInput size="Large" placeholder="Large" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            With / without label
          </span>
          <TextInput label="Label" placeholder="Placeholder" />
          <TextInput placeholder="No label" />
          <TextInput label="With value" defaultValue="Some text" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Leading / trailing icons
          </span>
          <TextInput
            label="Search"
            placeholder="Search..."
            leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
          />
          <TextInput
            placeholder="Trailing only"
            trailingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
          />
          <TextInput
            label="Both"
            placeholder="Leading and trailing"
            leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
            trailingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Invalid</span>
          <TextInput label="Error" invalid placeholder="Invalid state" />
          <TextInput label="Error with value" invalid defaultValue="Invalid" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Character counter
          </span>
          <TextInput
            label="Description"
            placeholder="Enter text..."
            maxLength={100}
            showCharacterCount
          />
          <TextInput
            label="With value"
            defaultValue="Already filled"
            maxLength={50}
            showCharacterCount
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Disabled & read-only
          </span>
          <TextInput label="Disabled" disabled placeholder="Disabled" />
          <TextInput
            label="Read-only"
            readOnly
            defaultValue="Read only value"
          />
        </div>
      </div>
    </>
  );
}
