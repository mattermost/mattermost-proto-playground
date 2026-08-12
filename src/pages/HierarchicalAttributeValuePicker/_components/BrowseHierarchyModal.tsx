import { useMemo, useState } from 'react';
import CheckboxBlankOutlineIcon from '@mattermost/compass-icons/components/checkbox-blank-outline';
import CheckboxMarkedIcon from '@mattermost/compass-icons/components/checkbox-marked';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import Modal from '@/components/ui/Modal/Modal';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import Tags from '@/components/ui/Tags/Tags';
import type { GraphOption } from '@/pages/HierarchicalAttributeAuthoring/graphModel';
import {
  flattenBrowseTree,
  listLabels,
  rootsOfGraph,
  subtreeIds,
} from '@/pages/HierarchicalAttributeValuePicker/pickerModel';
import styles from './BrowseHierarchyModal.module.scss';

export interface BrowseHierarchyModalProps {
  /** Viewer-scoped graph. */
  options: GraphOption[];
  selected: string[];
  /** Root to open on. Falls back to the first in-scope root. */
  initialRootId?: string | null;
  onToggle: (id: string) => void;
  onClose: () => void;
}

/**
 * P7 · The secondary control: browse a hierarchy, SCOPED TO ONE ROOT AT A TIME.
 *
 * For the admin who does not already know the value name and needs to see the
 * shape before choosing. It is deliberately not the default and deliberately not
 * a forest: showing several unrelated roots side by side in one tree implies a
 * relationship between them that does not exist. Pick a root, see that root.
 *
 * Selecting here returns to the primary control — the flat list stays the place
 * where selection is reviewed, so there is one mental model for "what is chosen".
 */
export default function BrowseHierarchyModal({
  options,
  selected,
  initialRootId,
  onToggle,
  onClose,
}: BrowseHierarchyModalProps) {
  const roots = useMemo(() => rootsOfGraph(options), [options]);
  const [rootId, setRootId] = useState<string>(
    initialRootId ?? roots[0]?.id ?? '',
  );
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(subtreeIds(options, initialRootId ?? roots[0]?.id ?? '')),
  );

  const nodes = useMemo(
    () => (rootId === '' ? [] : flattenBrowseTree(options, rootId, expanded)),
    [options, rootId, expanded],
  );

  const switchRoot = (nextRoot: string) => {
    setRootId(nextRoot);
    setExpanded(new Set(subtreeIds(options, nextRoot)));
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={styles['browse']}>
      <div className={styles['browse__scrim']} />
      <div className={styles['browse__dialog']} role="dialog" aria-modal="true">
        <Modal
          size="Medium"
          title="Browse hierarchy"
          subtitle="One hierarchy at a time — separate roots are unrelated, so they are never shown in the same tree."
          onClose={onClose}
          footer={
            <div className={styles['browse__footer']}>
              <Button emphasis="Secondary" onClick={onClose}>
                Done
              </Button>
            </div>
          }
        >
          <div className={styles['browse__body']}>
            <div
              className={styles['browse__roots']}
              role="group"
              aria-label="Choose a hierarchy"
            >
              {roots.map((root) => (
                <Chip
                  key={root.id}
                  as="button"
                  size="Small"
                  tone={rootId === root.id ? 'info' : 'neutral'}
                  aria-pressed={rootId === root.id}
                  onClick={() => switchRoot(root.id)}
                >
                  {root.label}
                </Chip>
              ))}
            </div>

            <div className={styles['browse__tree-frame']}>
              <Scrollbars style={{ maxHeight: 320 }}>
                <div className={styles['browse__tree']} role="tree">
                  {nodes.map((node) => {
                    const isSelected = selected.includes(node.option.id);
                    const isExpanded = expanded.has(node.option.id);
                    return (
                      <div
                        key={node.option.id}
                        className={[
                          styles['browse__row'],
                          styles[
                            `browse__row--depth-${Math.min(node.depth, 4)}`
                          ],
                          isSelected ? styles['browse__row--selected'] : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        role="treeitem"
                        aria-selected={isSelected}
                        aria-expanded={node.hasChildren ? isExpanded : undefined}
                      >
                        {node.hasChildren ? (
                          <button
                            type="button"
                            className={styles['browse__twisty']}
                            aria-label={
                              isExpanded
                                ? `Collapse ${node.option.label}`
                                : `Expand ${node.option.label}`
                            }
                            onClick={() => toggleExpand(node.option.id)}
                          >
                            <Icon
                              size="12"
                              glyph={
                                isExpanded ? (
                                  <ChevronDownIcon />
                                ) : (
                                  <ChevronRightIcon />
                                )
                              }
                            />
                          </button>
                        ) : (
                          <span className={styles['browse__twisty-spacer']} />
                        )}

                        <button
                          type="button"
                          className={styles['browse__pick']}
                          onClick={() => {
                            onToggle(node.option.id);
                            onClose();
                          }}
                        >
                          <span className={styles['browse__box']} aria-hidden>
                            <Icon
                              size="16"
                              glyph={
                                isSelected ? (
                                  <CheckboxMarkedIcon />
                                ) : (
                                  <CheckboxBlankOutlineIcon />
                                )
                              }
                            />
                          </span>
                          <span className={styles['browse__label']}>
                            {node.option.label}
                          </span>
                          {/* P4 · a value reachable twice inside the same tree
                              still renders once; its other parents are named
                              here instead of being re-rendered as a second row. */}
                          {node.alsoUnder.length > 0 && (
                            <Tags size="X-Small" type="Info Dim">
                              {`Also under ${listLabels(node.alsoUnder)}`}
                            </Tags>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Scrollbars>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
