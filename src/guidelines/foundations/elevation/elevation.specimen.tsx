import styles from '@/styles/library-demo/foundations.module.scss';

const ELEVATIONS = [
  { level: '1', token: '--elevation-1', desc: 'Subtle — hover, dropdowns' },
  { level: '2', token: '--elevation-2', desc: 'Low — chips, small cards' },
  { level: '3', token: '--elevation-3', desc: 'Medium — menus, tooltips' },
  { level: '4', token: '--elevation-4', desc: 'High — modals, popovers' },
  { level: '5', token: '--elevation-5', desc: 'Higher — dialogs, drawers' },
  { level: '6', token: '--elevation-6', desc: 'Highest — overlays' },
];

export default function ElevationLibrary() {
  return (
    <div className={styles['foundations__elevations']}>
      {ELEVATIONS.map(({ level, token, desc }) => (
        <div key={level} className={styles['foundations__elevation']}>
          <div
            className={styles['foundations__elevation-box']}
            style={{ boxShadow: `var(${token})` }}
          />
          <span className={styles['foundations__elevation-level']}>
            Level {level}
          </span>
          <span className={styles['foundations__elevation-desc']}>{desc}</span>
        </div>
      ))}
    </div>
  );
}
