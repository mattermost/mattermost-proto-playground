import { Radio } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function RadioLibrary() {
  return (
    <>
      <p
        className={styles['components__subheading']}
        style={{ marginBottom: 'var(--spacing-m)' }}
      >
        Native HTML radio with Figma Radio v2.0.0 styles. Use the same{' '}
        <code>name</code> to group options.
      </p>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Group</span>
          <Radio name="demo-size" value="a" size="Medium">
            Option A
          </Radio>
          <Radio name="demo-size" value="b" defaultChecked size="Medium">
            Option B
          </Radio>
          <Radio name="demo-size" value="c" size="Medium">
            Option C
          </Radio>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <Radio name="demo-sizes" value="s" size="Small">
            Small
          </Radio>
          <Radio name="demo-sizes" value="m" defaultChecked size="Medium">
            Medium
          </Radio>
          <Radio name="demo-sizes" value="l" size="Large">
            Large
          </Radio>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Invalid</span>
          <Radio name="demo-invalid" value="u" valid={false} size="Medium">
            Unchecked invalid
          </Radio>
          <Radio
            name="demo-invalid"
            value="c"
            defaultChecked
            valid={false}
            size="Medium"
          >
            Checked invalid
          </Radio>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Disabled</span>
          <Radio name="demo-disabled" value="u" disabled size="Medium">
            Disabled unchecked
          </Radio>
          <Radio
            name="demo-disabled"
            value="c"
            defaultChecked
            disabled
            size="Medium"
          >
            Disabled checked
          </Radio>
        </div>
      </div>
    </>
  );
}
