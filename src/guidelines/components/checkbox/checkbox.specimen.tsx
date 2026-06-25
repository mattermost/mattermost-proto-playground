import { Checkbox } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function CheckboxLibrary() {
  return (
    <>
      <p
        className={styles['components__subheading']}
        style={{ marginBottom: 'var(--spacing-m)' }}
      >
        Native HTML checkbox with Figma Checkbox (Checkbox Selector) v2.0.2
        styles. Supports checked, unchecked, and indeterminate.
      </p>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>States</span>
          <Checkbox size="Medium">Unchecked</Checkbox>
          <Checkbox size="Medium" defaultChecked>
            Checked
          </Checkbox>
          <Checkbox size="Medium" indeterminate>
            Indeterminate
          </Checkbox>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <Checkbox size="Small">Small</Checkbox>
          <Checkbox size="Medium" defaultChecked>
            Medium
          </Checkbox>
          <Checkbox size="Large" defaultChecked>
            Large
          </Checkbox>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Invalid</span>
          <Checkbox size="Medium" valid={false}>
            Unchecked invalid
          </Checkbox>
          <Checkbox size="Medium" defaultChecked valid={false}>
            Checked invalid
          </Checkbox>
          <Checkbox size="Medium" indeterminate valid={false}>
            Indeterminate invalid
          </Checkbox>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Disabled</span>
          <Checkbox size="Medium" disabled>
            Disabled unchecked
          </Checkbox>
          <Checkbox size="Medium" defaultChecked disabled>
            Disabled checked
          </Checkbox>
          <Checkbox size="Medium" indeterminate disabled>
            Disabled indeterminate
          </Checkbox>
        </div>
      </div>
    </>
  );
}
