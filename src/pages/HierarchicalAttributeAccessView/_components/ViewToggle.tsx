import type { ReactNode } from 'react';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import LayersOutlineIcon from '@mattermost/compass-icons/components/layers-outline';
import Icon from '@/components/ui/Icon/Icon';
import styles from './ViewToggle.module.scss';

export type AccessViewMode = 'diagram' | 'table' | 'both';

export interface ViewToggleProps {
  value: AccessViewMode;
  onChange: (value: AccessViewMode) => void;
}

const OPTIONS: Array<{
  value: AccessViewMode;
  label: string;
  glyph: ReactNode;
}> = [
  { value: 'diagram', label: 'Diagram', glyph: <SitemapIcon /> },
  { value: 'table', label: 'Table', glyph: <FormatListBulletedIcon /> },
  { value: 'both', label: 'Both', glyph: <LayersOutlineIcon /> },
];

/**
 * Diagram / table / both switcher.
 *
 * This control belongs to the PRODUCT surface, not the prototype demo band: the
 * table is the Section 508 answer for a graph, so the ability to reach it must
 * survive `?demo=off`. Built as pressed-state buttons in a labelled group
 * rather than a tablist, because "both" renders two regions at once and there is
 * no one tabpanel to point a `role="tab"` at.
 */
export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className={styles['view-toggle']} role="group" aria-label="View">
      <span className={styles['view-toggle__label']}>View</span>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={[
            styles['view-toggle__button'],
            value === opt.value ? styles['view-toggle__button--active'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          <Icon size="16" glyph={opt.glyph} />
          <span className={styles['view-toggle__button-label']}>
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}
