import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import ClassificationPill from '@/pages/attribute-system/ClassificationPill';
import {
  postDisplayIncludes,
  resolvePostDisplayMode,
  type DisplayWhere,
  type HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import PostAttributesPanel from './PostAttributesPanel';
import {
  postBinding,
  resolvePostShowWhere,
  valueLabel,
  type PostAttributeValue,
  type PostCustomAttribute,
  type ThreadDemoPost,
} from './postViewData';
import styles from './PostAttributeSummary.module.scss';

const MAX_VISIBLE = 2;

export interface PostAttributeSummaryProps {
  post: ThreadDemoPost;
  postAttributesById: Map<string, HubAttribute>;
  /** Message body — rendered relative to the expandable detail list. */
  children?: ReactNode;
  onEditAttribute?: (attributeId: string) => void;
  onRemoveAttribute?: (attributeId: string) => void;
  onRemoveCustomAttribute?: (id: string) => void;
  onRenameCustomAttribute?: (id: string, name: string) => void;
  onUpdateCustomAttribute?: (
    id: string,
    patch: Partial<Pick<PostCustomAttribute, 'name' | 'selectedValueId'>>,
  ) => void;
  onAddCustomAttributeValue?: (id: string, label: string) => void;
  onUpdateAttributeValue?: (attributeId: string, valueId: string) => void;
  showWhereById?: Record<string, DisplayWhere[]>;
  /** Opens the add-attribute picker; receives the + Add attribute button. */
  onAddAttributeClick?: (anchor: HTMLElement) => void;
  /**
   * Opens the full attributes editor (modal). Used by the hover card Edit
   * button — hover itself is read-only.
   */
  onEditAttributes?: () => void;
  /** Start with the full attribute list open (edit surfaces). */
  defaultExpanded?: boolean;
  /** Where the expanded list sits relative to the message body. Default: below. */
  detailsPlacement?: 'below' | 'above';
  /** Hide collapsed pills (useful when the open panel is the primary surface). */
  hideSummary?: boolean;
}

type HoverPair = {
  key: string;
  name: string;
  value: string;
};

function orderedInstances(
  attributes: PostAttributeValue[],
): PostAttributeValue[] {
  const classification = attributes.find(
    (row) => row.attributeId === 'classification',
  );
  const rest = attributes.filter(
    (row) => row.attributeId !== 'classification',
  );
  return classification ? [classification, ...rest] : rest;
}

/**
 * Collapsed attribute pills under the message header. Hover shows a read-only
 * attribute/value popover with Edit; Edit opens the full attributes modal.
 */
export default function PostAttributeSummary({
  post,
  postAttributesById,
  children,
  onEditAttribute,
  onRemoveAttribute,
  onRemoveCustomAttribute,
  onRenameCustomAttribute,
  onUpdateCustomAttribute,
  onAddCustomAttributeValue,
  onUpdateAttributeValue,
  showWhereById = {},
  onAddAttributeClick,
  onEditAttributes,
  defaultExpanded = false,
  detailsPlacement = 'below',
  hideSummary = false,
}: PostAttributeSummaryProps) {
  const [expanded] = useState(defaultExpanded);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [hoverCardStyle, setHoverCardStyle] = useState<CSSProperties | null>(
    null,
  );
  const summaryRef = useRef<HTMLDivElement>(null);
  const hoverCardRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const ordered = useMemo(
    () => orderedInstances(post.attributes),
    [post.attributes],
  );

  const hoverPairs = useMemo((): HoverPair[] => {
    const pairs: HoverPair[] = [];
    for (const instance of ordered) {
      const attribute = postAttributesById.get(instance.attributeId);
      if (!attribute) continue;
      pairs.push({
        key: instance.attributeId,
        name: attribute.name,
        value: valueLabel(attribute, instance.valueId),
      });
    }
    for (const custom of post.customAttributes ?? []) {
      const selected =
        custom.values.find((row) => row.id === custom.selectedValueId)?.label ??
        custom.values[0]?.label ??
        '—';
      pairs.push({
        key: custom.id,
        name: custom.name,
        value: selected,
      });
    }
    return pairs;
  }, [ordered, post.customAttributes, postAttributesById]);

  const headerCatalog = useMemo(() => {
    return ordered.filter((instance) => {
      const attribute = postAttributesById.get(instance.attributeId);
      if (!attribute) return false;
      const binding = postBinding(attribute);
      if (
        resolvePostDisplayMode(binding) === 'when-overridden' &&
        !instance.overridden
      ) {
        return false;
      }
      const showWhere = resolvePostShowWhere(
        attribute.id,
        showWhereById,
        binding?.showWhere,
      );
      return postDisplayIncludes(showWhere, 'Header');
    });
  }, [ordered, postAttributesById, showWhereById]);

  const headerCustom = useMemo(() => {
    return (post.customAttributes ?? []).filter((attribute) => {
      const showWhere = resolvePostShowWhere(
        attribute.id,
        showWhereById,
        attribute.showWhere,
      );
      return postDisplayIncludes(showWhere, 'Header');
    });
  }, [post.customAttributes, showWhereById]);

  const visibleCatalog = headerCatalog.slice(0, MAX_VISIBLE);
  const totalHeader = headerCatalog.length + headerCustom.length;
  const overflow =
    totalHeader - visibleCatalog.length > 0
      ? totalHeader - visibleCatalog.length
      : 0;

  const hasAnyAttributes =
    post.attributes.length > 0 || (post.customAttributes?.length ?? 0) > 0;

  const stopBubble = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const openHover = () => {
    if (!onEditAttributes || hoverPairs.length === 0) return;
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setHoverOpen(true);
  };

  const scheduleCloseHover = () => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setHoverOpen(false);
      closeTimerRef.current = null;
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current != null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // Portal + fixed positioning so sibling message pills cannot paint over the card.
  useLayoutEffect(() => {
    if (!hoverOpen) {
      setHoverCardStyle(null);
      return;
    }

    const update = () => {
      const anchor = summaryRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      setHoverCardStyle({
        position: 'fixed',
        top: rect.bottom,
        left: rect.left,
      });
    };

    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [hoverOpen]);

  // Native listeners so hover works even when React synthetic enter is skipped
  // (e.g. nested inside a clickable message wrapper).
  useEffect(() => {
    const node = summaryRef.current;
    if (!node || !onEditAttributes) return;
    const onEnter = () => {
      if (hoverPairs.length === 0) return;
      if (closeTimerRef.current != null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setHoverOpen(true);
    };
    const onLeave = () => {
      if (closeTimerRef.current != null) {
        window.clearTimeout(closeTimerRef.current);
      }
      closeTimerRef.current = window.setTimeout(() => {
        setHoverOpen(false);
        closeTimerRef.current = null;
      }, 120);
    };
    node.addEventListener('pointerenter', onEnter);
    node.addEventListener('pointerleave', onLeave);
    return () => {
      node.removeEventListener('pointerenter', onEnter);
      node.removeEventListener('pointerleave', onLeave);
    };
  }, [onEditAttributes, hoverPairs.length]);

  const details =
    expanded && hasAnyAttributes ? (
      <div
        className={[
          styles.details,
          detailsPlacement === 'above' ? styles['details--above'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={stopBubble}
      >
        <PostAttributesPanel
          post={post}
          variant="thread"
          onEditAttribute={onEditAttribute}
          onRemoveAttribute={onRemoveAttribute}
          onRemoveCustomAttribute={onRemoveCustomAttribute}
          onRenameCustomAttribute={onRenameCustomAttribute}
          onUpdateCustomAttribute={onUpdateCustomAttribute}
          onAddCustomAttributeValue={onAddCustomAttributeValue}
          onUpdateAttributeValue={onUpdateAttributeValue}
        />
        {onAddAttributeClick && (
          <button
            type="button"
            className={styles['details__add']}
            aria-label="Add attribute"
            onClick={(event) => {
              stopBubble(event);
              onAddAttributeClick(event.currentTarget);
            }}
          >
            <span className={styles['details__add-icon']} aria-hidden>
              <Icon size="16" glyph={<PlusIcon />} />
            </span>
            Add attribute
          </button>
        )}
      </div>
    ) : null;

  const summary =
    !hideSummary && totalHeader > 0 ? (
      <div
        ref={summaryRef}
        className={styles['summary-wrap']}
        onMouseEnter={openHover}
        onMouseLeave={scheduleCloseHover}
        onFocus={openHover}
        onBlur={(event) => {
          if (
            event.relatedTarget instanceof Node &&
            (summaryRef.current?.contains(event.relatedTarget) ||
              hoverCardRef.current?.contains(event.relatedTarget))
          ) {
            return;
          }
          scheduleCloseHover();
        }}
      >
        <div
          className={styles.summary}
          role="group"
          aria-label="Post attributes"
          onClick={stopBubble}
        >
          {visibleCatalog.map((instance) => {
            const attribute = postAttributesById.get(instance.attributeId);
            if (!attribute) return null;

            if (attribute.id === 'classification') {
              return (
                <ClassificationPill
                  key={instance.attributeId}
                  valueId={instance.valueId}
                  label={valueLabel(attribute, instance.valueId)}
                />
              );
            }

            return (
              <Chip key={instance.attributeId} size="Small">
                {valueLabel(attribute, instance.valueId)}
              </Chip>
            );
          })}
          {overflow > 0 && (
            <span className={styles['summary__overflow']}>+{overflow}</span>
          )}
        </div>

        {onEditAttributes &&
          hoverOpen &&
          hoverCardStyle &&
          createPortal(
            <div
              ref={hoverCardRef}
              className={styles['hover-card']}
              role="dialog"
              aria-label="Post attributes"
              style={hoverCardStyle}
              onClick={stopBubble}
              onMouseEnter={openHover}
              onMouseLeave={scheduleCloseHover}
              onFocus={openHover}
              onBlur={(event) => {
                if (
                  event.relatedTarget instanceof Node &&
                  (summaryRef.current?.contains(event.relatedTarget) ||
                    hoverCardRef.current?.contains(event.relatedTarget))
                ) {
                  return;
                }
                scheduleCloseHover();
              }}
            >
              <div className={styles['hover-card__header']}>
                <span className={styles['hover-card__title']}>Attributes</span>
                <button
                  type="button"
                  className={styles['hover-card__edit']}
                  onClick={() => {
                    setHoverOpen(false);
                    onEditAttributes();
                  }}
                >
                  Edit
                </button>
              </div>
              <div className={styles['hover-card__divider']} aria-hidden />
              <ul className={styles['hover-card__list']}>
                {hoverPairs.map((pair) => (
                  <li key={pair.key} className={styles['hover-card__row']}>
                    <span className={styles['hover-card__name']}>
                      {pair.name}
                    </span>
                    <span className={styles['hover-card__value']}>
                      {pair.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>,
            document.body,
          )}
      </div>
    ) : null;

  return (
    <>
      {summary}
      {detailsPlacement === 'above' && details}
      {children}
      {detailsPlacement === 'below' && details}
    </>
  );
}
