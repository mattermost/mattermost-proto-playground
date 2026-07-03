import styles from './Divider.module.scss';

export default function Divider() {
  return (
    <div className={styles.divider}>
      <hr className={styles['divider__line']} />
    </div>
  );
}
