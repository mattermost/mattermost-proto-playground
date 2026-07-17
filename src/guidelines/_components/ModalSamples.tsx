import { Button } from '@mattermost/compass-ui';
import { Modal } from '@mattermost/compass-ui';
import styles from './ModalSamples.module.scss';

export function ModalAnatomy() {
  const footer = (
    <>
      <Button emphasis="Tertiary">Cancel</Button>
      <Button emphasis="Primary">Save</Button>
    </>
  );

  return (
    <div className={[styles['modal-anatomy'], 'compass-doc-embed'].join(' ')}>
      <div className={styles['modal-anatomy__chart']}>
        <div className={styles['modal-anatomy__backdrop']} aria-hidden />
        <div className={styles['modal-anatomy__modal-wrap']}>
          <Modal
            title="Modal title"
            footer={footer}
            onClose={() => {}}
          >
            <p className={styles['modal-anatomy__body-sample']}>
              Body content sits here — forms, lists, or explanatory copy.
            </p>
          </Modal>
        </div>

        <span className={`${styles['modal-anatomy__pin']} ${styles['modal-anatomy__pin--container']}`}>
          <span className={styles['modal-anatomy__pin-num']}>1</span>
          <span className={`${styles['modal-anatomy__line']} ${styles['modal-anatomy__line--left']}`} />
        </span>

        <span className={`${styles['modal-anatomy__pin']} ${styles['modal-anatomy__pin--header']}`}>
          <span className={styles['modal-anatomy__pin-num']}>2</span>
          <span className={`${styles['modal-anatomy__line']} ${styles['modal-anatomy__line--down']}`} />
        </span>

        <span className={`${styles['modal-anatomy__pin']} ${styles['modal-anatomy__pin--body']}`}>
          <span className={styles['modal-anatomy__pin-num']}>3</span>
          <span className={`${styles['modal-anatomy__line']} ${styles['modal-anatomy__line--right']}`} />
        </span>

        <span className={`${styles['modal-anatomy__pin']} ${styles['modal-anatomy__pin--footer']}`}>
          <span className={styles['modal-anatomy__pin-num']}>4</span>
          <span className={`${styles['modal-anatomy__line']} ${styles['modal-anatomy__line--up']}`} />
        </span>

        <span className={`${styles['modal-anatomy__pin']} ${styles['modal-anatomy__pin--overlay']}`}>
          <span className={styles['modal-anatomy__pin-num']}>5</span>
          <span className={`${styles['modal-anatomy__line']} ${styles['modal-anatomy__line--up']}`} />
        </span>
      </div>
    </div>
  );
}
