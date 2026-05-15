import type { SceneId } from '@/types/outboundCall';
import styles from './OutboundCalls.module.scss';

export const OUTBOUND_SCENES: { id: SceneId; label: string }[] = [
  { id: 'channel', label: 'Channel' },
  { id: 'dm', label: 'Direct message' },
  { id: 'team-sidebar', label: 'Dialer v1' },
];

export function OutboundCallSceneSwitcher({
  active,
  onChange,
}: {
  active: SceneId;
  onChange: (id: SceneId) => void;
}) {
  return (
    <div className={styles['scene-switcher']} role="tablist" aria-label="Prototype entry points">
      <span className={styles['scene-switcher__label']}>Entry point</span>
      <div className={styles['scene-switcher__segmented']}>
        {OUTBOUND_SCENES.map((s) => {
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles['scene-switcher__tab']} ${isActive ? styles['scene-switcher__tab--active'] : ''}`}
              onClick={() => onChange(s.id)}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
