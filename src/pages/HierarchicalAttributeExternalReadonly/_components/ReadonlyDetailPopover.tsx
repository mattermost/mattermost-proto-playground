import type { RefObject } from 'react';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import {
  anchorParentIdOf,
  childrenOf,
  parentsOf,
  schemeOf,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import { EXTERNAL_SOURCE, isRestricted } from '../externalModel';
import styles from './ReadonlyDetailPopover.module.scss';

export interface ReadonlyDetailPopoverProps {
  option: GraphOption;
  allOptions: GraphOption[];
  /** true when restricted relatives are OMITTED rather than shown as "Restricted". */
  effectiveHidden: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

interface Relative {
  key: string;
  label: string;
  restricted: boolean;
  isAnchor?: boolean;
}

/**
 * READ-ONLY detail for one accessible value. Shows the value's parents and
 * children as non-interactive lists, its color, and its external source. There
 * are NO edit affordances — no rename field, no add/remove parent or child, no
 * make-primary, no color picker, no deactivate/delete. It is the viewer-side
 * counterpart to the authoring popover: same information architecture (Parents /
 * Children sections, color), stripped of every mutation.
 *
 * Restricted relatives never leak their identity: in masked mode they render as
 * a generic "Restricted" chip; in hidden mode they are omitted entirely.
 */
export default function ReadonlyDetailPopover({
  option,
  allOptions,
  effectiveHidden,
  anchorRef,
  onClose,
}: ReadonlyDetailPopoverProps) {
  const anchorId = anchorParentIdOf(option);
  const color = option.color ?? null;

  const toRelatives = (
    relatives: GraphOption[],
    markAnchor: boolean,
  ): Relative[] =>
    relatives
      .map((r) => ({
        key: r.id,
        label: r.label,
        restricted: isRestricted(r.id),
        isAnchor: markAnchor && r.id === anchorId,
      }))
      // In hidden mode, drop restricted relatives so nothing hints at them.
      .filter((r) => !(effectiveHidden && r.restricted));

  const parents = toRelatives(parentsOf(allOptions, option.id), true);
  const children = toRelatives(childrenOf(allOptions, option.id), false);

  const renderChips = (rels: Relative[], emptyText: string) => {
    const accessible = rels.filter((r) => !r.restricted);
    // Count-leak defense (T1): any number of restricted relatives collapse into
    // ONE non-enumerated "Restricted" chip. No numeric relative-count is shown.
    const anyRestricted = rels.some((r) => r.restricted);
    if (accessible.length === 0 && !anyRestricted) {
      return <p className={styles['pop__empty']}>{emptyText}</p>;
    }
    return (
      <div className={styles['pop__chips']}>
        {accessible.map((r) => (
          <span key={r.key} className={styles['pop__chip']}>
            {r.label}
            {r.isAnchor && <span className={styles['pop__primary']}>Primary</span>}
          </span>
        ))}
        {anyRestricted && (
          <span
            className={[styles['pop__chip'], styles['pop__chip--restricted']].join(' ')}
            aria-label="One or more restricted values you don’t have access to"
          >
            <Icon size="12" glyph={<LockOutlineIcon />} />
            Restricted
          </span>
        )}
      </div>
    );
  };

  return (
    <FixedPopoverMenu open onClose={onClose} anchorRef={anchorRef} minWidthFloor={300}>
      <div className={styles['pop']}>
        <div className={styles['pop__viewport']}>
          <Scrollbars>
            <div className={styles['pop__body']}>
              <div className={styles['pop__head']}>
                <span
                  className={styles['pop__dot']}
                  data-scheme={schemeOf(option.id)}
                  style={color ? { backgroundColor: color } : undefined}
                  aria-hidden
                />
                <span className={styles['pop__title']}>{option.label}</span>
              </div>

              <div className={styles['pop__source']}>
                <Icon size="16" glyph={<SyncIcon />} />
                <span>
                  Managed by {EXTERNAL_SOURCE} · read-only
                </span>
              </div>

              <div className={styles['pop__section']}>
                <div className={styles['pop__section-head']}>
                  <Icon size="16" glyph={<SitemapIcon />} />
                  <span className={styles['pop__section-title']}>Parents</span>
                </div>
                {renderChips(
                  parents,
                  'Top-level value — no parents.',
                )}
              </div>

              <div className={styles['pop__section']}>
                <div className={styles['pop__section-head']}>
                  <Icon size="16" glyph={<SourceBranchIcon />} />
                  <span className={styles['pop__section-title']}>Children</span>
                </div>
                {renderChips(children, 'No nested values under this one.')}
              </div>
            </div>
          </Scrollbars>
        </div>
      </div>
    </FixedPopoverMenu>
  );
}
