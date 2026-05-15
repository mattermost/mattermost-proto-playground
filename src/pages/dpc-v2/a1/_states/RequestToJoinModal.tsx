/**
 * DPC V2 A1 — RequestToJoinModal (Wave 1 stub).
 *
 * Wave 2 will surface member count in the channel preview header (V2 change).
 * Wave 1 renders a static placeholder card so reviewers can verify the
 * orchestrator slot is wired.
 */
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './RequestToJoinModal.module.scss';

export interface RequestToJoinModalProps {
  store: A1V2StoreApi;
}

export default function RequestToJoinModal(_props: RequestToJoinModalProps) {
  return (
    <section className={styles['v2-request-modal']}>
      <header className={styles['v2-request-modal__header']}>
        Request to join (V2)
      </header>
      <div className={styles['v2-request-modal__placeholder']}>
        Wave 2: preview shows channel member count alongside name + purpose.
      </div>
    </section>
  );
}
