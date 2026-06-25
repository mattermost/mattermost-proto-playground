import { Switch } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function SwitchLibrary() {
  return (
    <>
      <p
        className={styles['components__subheading']}
        style={{ marginBottom: 'var(--spacing-m)' }}
      >
        Native HTML checkbox with <code>role="switch"</code> for toggle
        semantics. Figma Switch v2.0.0 — track + sliding knob; checked = on
        (right), unchecked = off (left).
      </p>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>States</span>
          <Switch size="Medium">Unchecked</Switch>
          <Switch size="Medium" defaultChecked>
            Checked
          </Switch>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <Switch size="Small">Small</Switch>
          <Switch size="Medium" defaultChecked>
            Medium
          </Switch>
          <Switch size="Large" defaultChecked>
            Large
          </Switch>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            With secondary label
          </span>
          <Switch size="Medium" secondaryLabel="Optional description text">
            Label
          </Switch>
          <Switch
            size="Medium"
            defaultChecked
            secondaryLabel="Optional description"
          >
            Label
          </Switch>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Semi-bold & disabled
          </span>
          <Switch size="Medium" semiBold>
            Semi-bold label
          </Switch>
          <Switch size="Medium" disabled>
            Disabled unchecked
          </Switch>
          <Switch size="Medium" defaultChecked disabled>
            Disabled checked
          </Switch>
        </div>
      </div>
    </>
  );
}
