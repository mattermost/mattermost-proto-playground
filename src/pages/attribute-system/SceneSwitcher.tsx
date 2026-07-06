import { Fragment, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import Icon from '@/components/ui/Icon/Icon';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  counterpartScene,
  MORE_SCENES_V1,
  PRIMARY_SCENE_GROUPS_V1,
  PRIMARY_SCENE_GROUPS_V2,
  sceneMeta,
  sceneVariant,
  type PrototypeVariant,
  type SceneId,
} from './sceneConfig';
import styles from './SceneSwitcher.module.scss';

export interface SceneSwitcherProps {
  scene: SceneId;
  onSceneChange: (id: SceneId) => void;
}

const VARIANT_OPTIONS: Array<{
  id: PrototypeVariant;
  label: string;
  tooltip: string;
}> = [
  {
    id: 'current',
    label: 'Current',
    tooltip: 'Full configuration surfaces — all axes exposed.',
  },
  {
    id: 'simplified',
    label: 'Simplified',
    tooltip: 'Smart-defaults pass — fewer controls, derived who-can-set.',
  },
];

function SceneTab({
  id,
  label,
  tooltip,
  active,
  onSelect,
}: {
  id: SceneId;
  label: string;
  tooltip?: string;
  active: boolean;
  onSelect: (id: SceneId) => void;
}) {
  return (
    <span className={styles.switcher__item}>
      <button
        type="button"
        role="tab"
        aria-selected={active}
        className={[
          styles.switcher__btn,
          active ? styles['switcher__btn--active'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => onSelect(id)}
      >
        {label}
      </button>
      {tooltip && (
        <div className={styles['switcher__tooltip-layer']} role="presentation">
          <Tooltip arrow="Top" label={tooltip} />
        </div>
      )}
    </span>
  );
}

export default function SceneSwitcher({ scene, onSceneChange }: SceneSwitcherProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  useOutsideClose(moreRef, moreOpen, () => setMoreOpen(false));

  const variant = sceneVariant(scene);
  const sceneGroups =
    variant === 'simplified'
      ? PRIMARY_SCENE_GROUPS_V2
      : PRIMARY_SCENE_GROUPS_V1;
  const activeMore = MORE_SCENES_V1.some((s) => s.id === scene);
  const current = sceneMeta(scene);

  function selectScene(id: SceneId) {
    onSceneChange(id);
    setMoreOpen(false);
    if (typeof window !== 'undefined') {
      window.location.hash = id;
    }
  }

  function selectVariant(next: PrototypeVariant) {
    if (next === variant) return;
    selectScene(counterpartScene(scene, next));
  }

  return (
    <div className={styles.switcher}>
      <div className={styles.switcher__variant}>
        <span className={styles.switcher__label}>Prototype</span>
        <div
          className={styles.switcher__segment}
          role="tablist"
          aria-label="Prototype variant"
        >
          {VARIANT_OPTIONS.map((opt) => (
            <span key={opt.id} className={styles.switcher__item}>
              <button
                type="button"
                role="tab"
                aria-selected={variant === opt.id}
                className={[
                  styles.switcher__btn,
                  variant === opt.id ? styles['switcher__btn--active'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => selectVariant(opt.id)}
              >
                {opt.label}
              </button>
              <div
                className={styles['switcher__tooltip-layer']}
                role="presentation"
              >
                <Tooltip arrow="Top" label={opt.tooltip} />
              </div>
            </span>
          ))}
        </div>
      </div>

      <span className={styles.switcher__divider} aria-hidden />

      <div className={styles.switcher__surfaces}>
        <span className={styles.switcher__label}>Surface</span>
        <div
          className={styles.switcher__segment}
          role="tablist"
          aria-label="Prototype surfaces"
        >
          {sceneGroups.map((group, groupIdx) => (
            <Fragment key={groupIdx}>
              {group.map((id) => {
                const meta = sceneMeta(id);
                return (
                  <SceneTab
                    key={id}
                    id={id}
                    label={meta.label}
                    tooltip={meta.tooltip}
                    active={scene === id}
                    onSelect={selectScene}
                  />
                );
              })}
              {groupIdx < sceneGroups.length - 1 && (
                <span className={styles.switcher__divider} aria-hidden />
              )}
            </Fragment>
          ))}

          {variant === 'current' && (
            <>
              <span className={styles.switcher__divider} aria-hidden />
              <div className={styles.switcher__more} ref={moreRef}>
                <button
                  type="button"
                  className={[
                    styles.switcher__btn,
                    styles['switcher__more-btn'],
                    activeMore || moreOpen
                      ? styles['switcher__btn--active']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-haspopup="menu"
                  aria-expanded={moreOpen}
                  onClick={() => setMoreOpen((o) => !o)}
                >
                  {activeMore ? sceneMeta(scene).label : 'More surfaces'}
                  <Icon
                    size="12"
                    glyph={<ChevronDownIcon />}
                    className={styles['switcher__more-chevron']}
                  />
                </button>

                {moreOpen && (
                  <div className={styles['switcher__more-menu']} role="menu">
                    {MORE_SCENES_V1.map((meta) => (
                      <button
                        key={meta.id}
                        type="button"
                        role="menuitem"
                        className={[
                          styles['switcher__more-item'],
                          scene === meta.id
                            ? styles['switcher__more-item--active']
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => selectScene(meta.id)}
                      >
                        <span className={styles['switcher__more-label']}>
                          {meta.label}
                        </span>
                        {meta.tooltip && (
                          <span className={styles['switcher__more-desc']}>
                            {meta.tooltip}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <span className={styles.switcher__persona}>
        <LabelTag
          label={`Acting as: ${current.persona}`}
          type="Info"
          size="X-Small"
        />
        <Link to="/prototypes" className={styles.switcher__label}>
          Exit
        </Link>
      </span>
    </div>
  );
}
