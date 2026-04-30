import GlobeIcon from '@mattermost/compass-icons/components/globe';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import styles from '@/pages/Components/Components.module.scss';

export default function ButtonLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>
                    Primary
                  </span>
                  <Button>Primary</Button>
                  <Button
                    leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
                  >
                    With leading icon
                  </Button>
                  <Button
                    trailingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
                  >
                    With trailing icon
                  </Button>
                </div>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>
                    Secondary
                  </span>
                  <Button emphasis="Secondary">Secondary</Button>
                  <Button emphasis="Tertiary">Tertiary</Button>
                  <Button emphasis="Quaternary">Quaternary</Button>
                  <Button emphasis="Link">Link</Button>
                </div>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>Sizes</span>
                  <Button size="X-Small">X-Small</Button>
                  <Button size="Small">Small</Button>
                  <Button size="Medium">Medium</Button>
                  <Button size="Large">Large</Button>
                </div>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>
                    Destructive
                  </span>
                  <Button destructive>Delete</Button>
                  <Button destructive emphasis="Secondary">
                    Cancel
                  </Button>
                </div>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>
                    Disabled
                  </span>
                  <Button disabled>Disabled</Button>
                  <Button emphasis="Secondary" disabled>
                    Disabled
                  </Button>
                </div>
                <div
                  className={[
                    styles['components__button-row'],
                    styles['components__button-row--inverted-bg'],
                  ].join(' ')}
                >
                  <span className={styles['components__instance-label']}>
                    Inverted
                  </span>
                  <Button appearance="Inverted">Primary</Button>
                  <Button appearance="Inverted" emphasis="Secondary">
                    Secondary
                  </Button>
                  <Button appearance="Inverted" emphasis="Tertiary">
                    Tertiary
                  </Button>
                </div>
              </div>
    </>
  );
}
