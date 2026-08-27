import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import Chip from '@/components/ui/Chip/Chip';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import AttributeHeaderChipValue from './AttributeHeaderChipValue';
import type { DisplayWhere, HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import {
  postHeaderAttributes,
  type PostHeaderAttribute,
  type ThreadDemoPost,
} from './postViewData';
import { useResponsiveHeaderChipCount } from './useResponsiveHeaderChipCount';
import styles from './ChannelHeaderAttributeChips.module.scss';

export interface PostHeaderAttributeChipsProps {
  post: ThreadDemoPost;
  postAttributesById: Map<string, HubAttribute>;
  showWhereById?: Record<string, DisplayWhere[]>;
  className?: string;
  maxVisible?: number;
  /** Fit as many chips as the container width allows; overflow uses "+N". */
  responsiveOverflow?: boolean;
  /** Hide classification pill when it is also shown as a reply banner. */
  omitClassification?: boolean;
  /** Pre-resolved header attributes; skips postHeaderAttributes when set. */
  attributes?: PostHeaderAttribute[];
}

const CHIP_HINT_TOOLTIP_GAP = 8;
const CHIP_HINT_TOOLTIP_Z_INDEX = 1100;
const CHIP_HINT_TOOLTIP_ESTIMATED_HEIGHT = 36;
const DEFAULT_MAX_VISIBLE = 3;

type ChipHintPlacement = 'above' | 'below';

function HeaderAttributeValue({
  attribute,
}: {
  attribute: PostHeaderAttribute;
}) {
  return (
    <AttributeHeaderChipValue
      label={attribute.label}
      valueId={attribute.valueId}
      isClassification={attribute.isClassification}
      locked={attribute.isClassification ? false : undefined}
    />
  );
}

function HeaderAttributeChipHint({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const hintRef = useRef<HTMLElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [placement, setPlacement] = useState<ChipHintPlacement>('above');
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const updateCoords = useCallback(() => {
    const hint = hintRef.current;
    if (!hint) return;

    const rect = hint.getBoundingClientRect();
    const bubbleHeight =
      bubbleRef.current?.offsetHeight ?? CHIP_HINT_TOOLTIP_ESTIMATED_HEIGHT;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const nextPlacement: ChipHintPlacement =
      spaceAbove >= bubbleHeight + CHIP_HINT_TOOLTIP_GAP ||
      spaceAbove >= spaceBelow
        ? 'above'
        : 'below';

    setPlacement(nextPlacement);
    setCoords({
      left: rect.left + rect.width / 2,
      top:
        nextPlacement === 'above'
          ? rect.top - CHIP_HINT_TOOLTIP_GAP
          : rect.bottom + CHIP_HINT_TOOLTIP_GAP,
    });
  }, []);

  useLayoutEffect(() => {
    if (!hovered) return;
    updateCoords();
  }, [hovered, updateCoords]);

  useEffect(() => {
    if (!hovered) return;

    const dismiss = () => setHovered(false);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);

    return () => {
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, [hovered]);

  const translate =
    placement === 'above' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)';
  const bubbleStyle: CSSProperties | undefined = coords
    ? {
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        zIndex: CHIP_HINT_TOOLTIP_Z_INDEX,
        transform: `${translate} scale(${hovered ? 1 : 0.9})`,
        transformOrigin:
          placement === 'above' ? 'bottom center' : 'top center',
        opacity: hovered ? 1 : 0,
        transition: hovered
          ? `opacity var(--duration-quick) var(--ease-entrance), transform var(--duration-quick) var(--ease-entrance)`
          : `opacity var(--duration-quick) var(--ease-exit), transform var(--duration-quick) var(--ease-exit)`,
      }
    : undefined;

  const tooltipBubble =
    hovered &&
    coords &&
    createPortal(
      <span
        ref={bubbleRef}
        className={styles['header-attrs__hint-bubble']}
        style={bubbleStyle}
        aria-hidden
      >
        <Tooltip
          label={name}
          arrow={placement === 'above' ? 'Bottom' : 'Top'}
        />
      </span>,
      document.body,
    );

  return (
    <span
      ref={hintRef as React.RefObject<HTMLSpanElement>}
      className={styles['header-attrs__hint']}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setCoords(null);
      }}
    >
      {children}
      {tooltipBubble}
    </span>
  );
}

export default function PostHeaderAttributeChips({
  post,
  postAttributesById,
  showWhereById = {},
  className = '',
  maxVisible = DEFAULT_MAX_VISIBLE,
  responsiveOverflow = false,
  omitClassification = false,
  attributes: attributesProp,
}: PostHeaderAttributeChipsProps) {
  const attributes = (
    attributesProp ??
    postHeaderAttributes(post, postAttributesById, showWhereById)
  ).filter((attribute) => !(omitClassification && attribute.isClassification));
  const moreRef = useRef<HTMLButtonElement>(null);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const { hostRef, measureRef, visibleCount } = useResponsiveHeaderChipCount(
    attributes.length,
    responsiveOverflow,
    responsiveOverflow ? 1 : 0,
  );

  if (attributes.length === 0) return null;

  const visibleLimit = responsiveOverflow
    ? visibleCount
    : Math.max(0, maxVisible);
  const visible = attributes.slice(0, visibleLimit);
  const overflow = attributes.slice(visibleLimit);
  const overflowCount = overflow.length;
  const overflowLabel = responsiveOverflow
    ? `+${overflowCount}`
    : `+${overflowCount} more`;

  const closeOverflow = () => setOverflowOpen(false);

  const rootClass = [
    styles['header-attrs'],
    responsiveOverflow ? styles['header-attrs--responsive'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={hostRef}
      className={
        responsiveOverflow ? styles['header-attrs__host'] : undefined
      }
    >
      <div className={rootClass} aria-label="Reply attributes">
        {visible.map((attribute) => (
          <HeaderAttributeChipHint key={attribute.id} name={attribute.name}>
            <HeaderAttributeValue attribute={attribute} />
          </HeaderAttributeChipHint>
        ))}

        {overflowCount > 0 && (
          <>
            <button
              ref={moreRef}
              type="button"
              className={styles['header-attrs__more']}
              aria-haspopup="menu"
              aria-expanded={overflowOpen}
              aria-label={`${overflowCount} more attributes`}
              onClick={() => setOverflowOpen((open) => !open)}
            >
              <Chip as="div" size="Small">
                {overflowLabel}
              </Chip>
            </button>
            <FixedPopoverMenu
              open={overflowOpen}
              onClose={closeOverflow}
              anchorRef={moreRef}
              align="start"
              minWidthFloor={280}
              gap={4}
            >
              <PopoverMenu aria-label="More reply attributes">
                {overflow.map((attribute) => (
                  <div
                    key={attribute.id}
                    className={styles['header-attrs__overflow-row']}
                    role="presentation"
                  >
                    <span className={styles['header-attrs__overflow-label']}>
                      {attribute.name}
                    </span>
                    <span className={styles['header-attrs__overflow-value']}>
                      <HeaderAttributeValue attribute={attribute} />
                    </span>
                  </div>
                ))}
                <PopoverMenuDivider />
                <MenuItem
                  className={styles['header-attrs__view-all']}
                  label="View all attributes"
                  leadingElement={false}
                  onClick={closeOverflow}
                />
              </PopoverMenu>
            </FixedPopoverMenu>
          </>
        )}
      </div>

      {responsiveOverflow && (
        <div
          ref={measureRef}
          className={styles['header-attrs__measure']}
          aria-hidden
        >
          {attributes.map((attribute) => (
            <span key={attribute.id} data-header-chip-measure>
              <HeaderAttributeValue attribute={attribute} />
            </span>
          ))}
          {Array.from(
            { length: Math.max(0, attributes.length - 1) },
            (_, index) => {
              const count = index + 1;
              return (
                <span key={count} data-header-chip-overflow-measure={count}>
                  <Chip as="div" size="Small">
                    +{count}
                  </Chip>
                </span>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
