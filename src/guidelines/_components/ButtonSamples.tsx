import GlobeIcon from '@mattermost/compass-icons/components/globe';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { Button } from '@mattermost/compass-ui';
import { Icon } from '@mattermost/compass-ui';
import { Modal } from '@mattermost/compass-ui';
import styles from './ButtonSamples.module.scss';

export function ButtonAnatomy() {
  return (
    <div className={[styles['anatomy'], 'compass-doc-embed'].join(' ')}>
      <div className={styles['anatomy__chart']}>
        <Button
          size="Large"
          leadingIcon={<Icon glyph={<GlobeIcon />} size="20" />}
          trailingIcon={<Icon glyph={<ChevronDownIcon />} size="20" />}
        >
          Button label
        </Button>
        <span className={`${styles['anatomy__pin']} ${styles['anatomy__pin--label']}`}>
          <span className={styles['anatomy__pin-num']}>1</span>
          <span className={`${styles['anatomy__line']} ${styles['anatomy__line--down']}`} />
        </span>
        <span className={`${styles['anatomy__pin']} ${styles['anatomy__pin--container']}`}>
          <span className={styles['anatomy__pin-num']}>2</span>
          <span className={`${styles['anatomy__line']} ${styles['anatomy__line--left']}`} />
        </span>
        <span className={`${styles['anatomy__pin']} ${styles['anatomy__pin--leading']}`}>
          <span className={styles['anatomy__pin-num']}>3</span>
          <span className={`${styles['anatomy__line']} ${styles['anatomy__line--up']}`} />
        </span>
        <span className={`${styles['anatomy__pin']} ${styles['anatomy__pin--trailing']}`}>
          <span className={styles['anatomy__pin-num']}>4</span>
          <span className={`${styles['anatomy__line']} ${styles['anatomy__line--up']}`} />
        </span>
      </div>
    </div>
  );
}

export function ButtonSizes() {
  return (
    <div className={styles['row']}>
      <Button size="X-Small">X-Small</Button>
      <Button size="Small">Small</Button>
      <Button size="Medium">Medium</Button>
      <Button size="Large">Large</Button>
    </div>
  );
}

export function ButtonEmphasis() {
  return (
    <div className={styles['row']}>
      <Button emphasis="Primary">Primary</Button>
      <Button emphasis="Secondary">Secondary</Button>
      <Button emphasis="Tertiary">Tertiary</Button>
      <Button emphasis="Quaternary">Quaternary</Button>
    </div>
  );
}

export function ButtonStates() {
  return (
    <div className={styles['row']}>
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}

export function ButtonInverted() {
  return (
    <div className={`${styles['row']} ${styles['row--inverted']}`}>
      <Button appearance="Inverted">Primary</Button>
      <Button appearance="Inverted" emphasis="Secondary">
        Secondary
      </Button>
      <Button appearance="Inverted" emphasis="Tertiary">
        Tertiary
      </Button>
      <Button appearance="Inverted" emphasis="Quaternary">
        Quaternary
      </Button>
    </div>
  );
}

export function ButtonDestructive() {
  return (
    <div className={styles['row']}>
      <Button destructive leadingIcon={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}>
        Delete channel
      </Button>
      <Button destructive emphasis="Secondary">
        Delete
      </Button>
      <Button destructive emphasis="Tertiary">
        Delete
      </Button>
    </div>
  );
}

export function ButtonWidths() {
  return (
    <div className={styles['widths']}>
      <div className={styles['widths__row']}>
        <span className={styles['widths__caption']}>Dynamic (default)</span>
        <div className={styles['widths__stage']}>
          <Button>Save</Button>
          <Button emphasis="Tertiary">Save changes</Button>
        </div>
      </div>
      <div className={styles['widths__row']}>
        <span className={styles['widths__caption']}>Fixed-width (160px)</span>
        <div className={styles['widths__stage']}>
          <Button className={styles['widths__fixed']}>Save</Button>
          <Button
            className={styles['widths__fixed']}
            leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
          >
            Save changes
          </Button>
        </div>
      </div>
      <div className={styles['widths__row']}>
        <span className={styles['widths__caption']}>Full-width</span>
        <div className={`${styles['widths__stage']} ${styles['widths__stage--column']}`}>
          <Button className={styles['widths__full']}>Sign in</Button>
          <Button
            className={styles['widths__full']}
            emphasis="Tertiary"
          >
            Use a different account
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ButtonPositioning() {
  return (
    <div className={styles['positioning']}>
      <figure className={styles['positioning__case']}>
        <div className={styles['positioning__canvas']}>
          <Modal
            title="Delete channel"
            headerDivider={false}
            footerDivider={false}
            footer={
              <>
                <Button emphasis="Tertiary">Cancel</Button>
                <Button destructive>Delete channel</Button>
              </>
            }
          >
            <p className={styles['positioning__body-text']}>
              This will permanently delete <strong>#design</strong> and all of
              its messages. Members will lose access immediately. This action
              cannot be undone.
            </p>
          </Modal>
        </div>
        <figcaption>Modal — content left-aligned, primary action right.</figcaption>
      </figure>

      <figure className={styles['positioning__case']}>
        <div className={`${styles['surface']} ${styles['surface--page']}`}>
          <div className={styles['surface__title']}>Channel settings</div>
          <div className={styles['surface__body']}>Left-aligned page content.</div>
          <div className={`${styles['surface__actions']} ${styles['surface__actions--start']}`}>
            <Button emphasis="Tertiary">Cancel</Button>
            <Button>Save</Button>
          </div>
        </div>
        <figcaption>In-page — actions follow content.</figcaption>
      </figure>
    </div>
  );
}
