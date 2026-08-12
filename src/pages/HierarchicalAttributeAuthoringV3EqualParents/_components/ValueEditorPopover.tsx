import { useState, type RefObject } from 'react';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CloseIcon from '@mattermost/compass-icons/components/close';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import CreatableEdgeCombobox from '@/pages/HierarchicalAttributeDiagramHub/_components/CreatableEdgeCombobox';
import BoundedPopover from './BoundedPopover';
import HoverTip from './HoverTip';
import {
  childCandidates,
  grantSentence,
  grantsCount,
  orderedChildren,
  orderedParents,
  parentCandidates,
  type HierValue,
} from '../v3GraphModel';
import styles from './ValueEditorPopover.module.scss';

type Pane = 'main' | 'parents' | 'children';

export interface ValueEditorPopoverProps {
  value: HierValue;
  values: HierValue[];
  /**
   * Authoring gate only (F1): may a NEW second parent be created? Never affects
   * what is displayed — every existing relationship renders either way.
   */
  allowMultiParent: boolean;
  initialPane?: Pane;
  /** Pre-seeded rejection for the deep-linked cycle demo. */
  seededRejection?: string | null;
  anchorRef: RefObject<HTMLElement | null>;
  boundaryRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onRename: (label: string) => void;
  /** Hand an existing-value link to the host so it can confirm the consequence. */
  onRequestParent: (parentId: string) => void;
  onRequestChild: (childId: string) => void;
  onCreateParent: (label: string) => void;
  onCreateChild: (label: string) => void;
  onRemoveParent: (parentId: string) => void;
  onRemoveChild: (childId: string) => void;
  onRequestDelete: () => void;
  onGoToValue: (id: string) => void;
}

/**
 * Value editor (F2 + F4 + F7).
 *
 * Differences that matter versus the surface this supersedes:
 *  - There is no primary or home parent. Every tree occurrence is editable;
 *    the parents list is ordered by the parent's own creation time and all
 *    parents grant equally.
 *  - Every parent and child row carries its grant sentence, so an edge is always
 *    a claim about access rather than a nesting statement. Those sentences stay:
 *    each one describes the specific edge being looked at, which is not something
 *    a glance at the tree answers. What was removed is the whole-value grant
 *    readout, which only restated the tree.
 *  - Linking an existing value hands off to a consequence confirm; it never
 *    commits silently from inside a popover.
 *  - "Move under…" is the keyboard equivalent of grip-drag, so re-parenting is
 *    never mouse-only.
 *  - The panel is bounded by the page's scroll region and scrolls internally, so
 *    a third parent row cannot push helper text out of view.
 */
export default function ValueEditorPopover({
  value,
  values,
  allowMultiParent,
  initialPane = 'main',
  seededRejection = null,
  anchorRef,
  boundaryRef,
  onClose,
  onRename,
  onRequestParent,
  onRequestChild,
  onCreateParent,
  onCreateChild,
  onRemoveParent,
  onRemoveChild,
  onRequestDelete,
  onGoToValue,
}: ValueEditorPopoverProps) {
  const [pane, setPane] = useState<Pane>(initialPane);
  const [rejection, setRejection] = useState<string | null>(seededRejection);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const parents = orderedParents(values, value.id);
  const children = orderedChildren(values, value.id);
  // Kept for the removal confirm only: how much access a specific removal takes
  // away. It is no longer a standing readout anywhere on this surface.
  const grants = grantsCount(values, value.id);
  // A second parent is what the authoring gate governs. A value at the top level
  // can always gain its first parent.
  const parentsLocked = parents.length >= 1 && !allowMultiParent;
  // Same gate from the other direction: linking a value that already has a
  // parent would mint a second one.
  const allChildCandidates = childCandidates(values, value.id);
  const grantCandidates = allowMultiParent
    ? allChildCandidates
    : allChildCandidates.filter((c) => c.parentIds.length === 0);

  return (
    <BoundedPopover
      open
      onClose={onClose}
      anchorRef={anchorRef}
      boundaryRef={boundaryRef}
      label={`Edit ${value.label}`}
      width={368}
    >
      {pane === 'main' && (
        <div className={styles['editor']}>
          <TextInput
            className={styles['editor__name-input']}
            size="Medium"
            value={value.label}
            aria-label="Value name"
            onChange={(e) => onRename(e.target.value)}
          />

          <button
            type="button"
            className={styles['editor__nav']}
            onClick={() => setPane('parents')}
          >
            <Icon size="20" glyph={<SitemapIcon />} />
            <span className={styles['editor__nav-label']}>Parents</span>
            <span className={styles['editor__nav-value']}>
              {parents.length === 0
                ? 'Top level'
                : `${parents.length} ${parents.length === 1 ? 'parent' : 'parents'}`}
            </span>
            <Icon size="16" glyph={<ChevronRightIcon />} />
          </button>

          <button
            type="button"
            className={styles['editor__nav']}
            onClick={() => setPane('children')}
          >
            <Icon size="20" glyph={<SourceBranchIcon />} />
            <span className={styles['editor__nav-label']}>
              Children
            </span>
            <span className={styles['editor__nav-value']}>
              {children.length === 0 ? 'None' : `${children.length}`}
            </span>
            <Icon size="16" glyph={<ChevronRightIcon />} />
          </button>

          <div className={styles['editor__divider']} />

          <button
            type="button"
            className={styles['editor__danger']}
            onClick={onRequestDelete}
          >
            <Icon size="20" glyph={<TrashCanOutlineIcon />} />
            Delete this value
          </button>
        </div>
      )}

      {pane === 'parents' && (
        <div className={styles['editor']}>
          <button
            type="button"
            className={styles['editor__back']}
            onClick={() => setPane('main')}
          >
            <Icon size="16" glyph={<ChevronLeftIcon />} />
            Parents of {value.label}
          </button>

          <div className={styles['editor__rows']}>
            {parents.length === 0 && (
              <p className={styles['editor__empty']}>No parents yet.</p>
            )}

            {parents.map((parent) => (
              <div key={parent.id} className={styles['editor__row']}>
                <div className={styles['editor__row-top']}>
                  <span className={styles['editor__row-label']}>
                    {parent.label}
                  </span>

                  <HoverTip label="Remove this parent" align="end">
                    <IconButton
                      size="X-Small"
                      destructive
                      aria-label={`Remove ${parent.label} as a parent of ${value.label}`}
                      icon={<Icon size="12" glyph={<CloseIcon />} />}
                      onClick={() => setPendingRemoval(parent.id)}
                    />
                  </HoverTip>
                </div>
                <p className={styles['editor__row-grant']}>
                  {grantSentence(parent.label, value.label)}
                </p>
                {pendingRemoval === parent.id && (
                  <div className={styles['editor__confirm']}>
                    <p className={styles['editor__confirm-text']}>
                      Remove it? Anyone holding “{parent.label}” — and anything
                      above it — stops reaching “{value.label}”
                      {grants > 0
                        ? ` and the ${grants} ${
                            grants === 1 ? 'value' : 'values'
                          } below it.`
                        : '.'}
                    </p>
                    <div className={styles['editor__confirm-actions']}>
                      <Button
                        emphasis="Secondary"
                        size="Small"
                        destructive
                        onClick={() => {
                          onRemoveParent(parent.id);
                          setPendingRemoval(null);
                        }}
                      >
                        Remove the parent
                      </Button>
                      <Button
                        emphasis="Tertiary"
                        size="Small"
                        onClick={() => setPendingRemoval(null)}
                      >
                        Keep it
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {rejection && (
            <div className={styles['editor__reject']} role="alert">
              <Icon size="16" glyph={<AlertOutlineIcon />} />
              <span>{rejection}</span>
            </div>
          )}

          {parentsLocked ? (
            <div className={styles['editor__gate']}>
              <Icon size="16" glyph={<InformationOutlineIcon />} />
              <span>
                Turn on multiple parents in list settings to add another.
              </span>
            </div>
          ) : (
            <CreatableEdgeCombobox
              overlay
              placeholder="Add a parent, or type a new name…"
              ariaLabel={`Add a parent of ${value.label}`}
              candidates={parentCandidates(values, value.id)}
              onPickExisting={(id) => {
                setRejection(null);
                onRequestParent(id);
                return null;
              }}
              onCreate={(label) => {
                setRejection(null);
                onCreateParent(label);
              }}
            />
          )}

        </div>
      )}

      {pane === 'children' && (
        <div className={styles['editor']}>
          <button
            type="button"
            className={styles['editor__back']}
            onClick={() => setPane('main')}
          >
            <Icon size="16" glyph={<ChevronLeftIcon />} />
            Children of {value.label}
          </button>

          <div className={styles['editor__rows']}>
            {children.length === 0 && (
              <p className={styles['editor__empty']}>No children yet.</p>
            )}
            {children.map((child) => (
              <div key={child.id} className={styles['editor__row']}>
                <div className={styles['editor__row-top']}>
                  <span className={styles['editor__row-label']}>
                    {child.label}
                  </span>
                  <button
                    type="button"
                    className={styles['editor__show-here']}
                    onClick={() => onGoToValue(child.id)}
                  >
                    Go to it
                  </button>
                  <HoverTip label="Remove this grant" align="end">
                    <IconButton
                      size="X-Small"
                      destructive
                      aria-label={`Stop ${value.label} granting ${child.label}`}
                      icon={<Icon size="12" glyph={<CloseIcon />} />}
                      onClick={() => onRemoveChild(child.id)}
                    />
                  </HoverTip>
                </div>
                <p className={styles['editor__row-grant']}>
                  {grantSentence(value.label, child.label)}
                  {child.parentIds.length > 1 &&
                    ` It also sits under ${child.parentIds.length - 1} other ${
                      child.parentIds.length - 1 === 1 ? 'parent' : 'parents'
                    }, so removing this does not cut it off entirely.`}
                </p>
              </div>
            ))}
          </div>

          <CreatableEdgeCombobox
            overlay
            placeholder="Grant another value, or type a new name…"
            ariaLabel={`Add a value granted by ${value.label}`}
            candidates={grantCandidates}
            onPickExisting={(id) => {
              onRequestChild(id);
              return null;
            }}
            onCreate={(label) => onCreateChild(label)}
          />

        </div>
      )}
    </BoundedPopover>
  );
}
