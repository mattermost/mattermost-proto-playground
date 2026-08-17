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
import ClassificationPill from '@/pages/attribute-system/ClassificationPill';
import {
  headerChannelAttributes,
  type ChannelDemoState,
  type HeaderChannelAttribute,
} from './channelViewData';
import styles from './ChannelHeaderAttributeChips.module.scss';

export interface ChannelHeaderAttributeChipsProps {
  channel: ChannelDemoState;
  className?: string;
  /** Max chips shown inline; the rest appear under "+N more". */
  maxVisible?: number;
  /** Opens channel info in the RHS when a header attribute chip is clicked. */
  onChipClick?: () => void;
  /** Opens channel info from the overflow popover "View all attributes" action. */
  onViewAllAttributes?: () => void;
}

const CHIP_HINT_TOOLTIP_GAP = 8;
const CHIP_HINT_TOOLTIP_Z_INDEX = 1100;
const CHIP_HINT_TOOLTIP_ESTIMATED_HEIGHT = 36;
const DEFAULT_MAX_VISIBLE = 3;

type ChipHintPlacement = 'above' | 'below';

function HeaderAttributeValue({
  attribute,
  chipClassName,
}: {
  attribute: HeaderChannelAttribute;
  chipClassName?: string;
}) {
  if (attribute.isClassification) {
    return (
      <ClassificationPill
        valueId={attribute.valueId}
        label={attribute.label}
        locked={attribute.locked}
      />
    );
  }

  if (attribute.useChip) {
    return (
      <Chip size="Small" className={chipClassName}>
        {attribute.label}
      </Chip>
    );
  }

  return (
    <span className={styles['header-attrs__text']}>{attribute.label}</span>
  );
}

function HeaderAttributeChipHint({
  name,
  children,
  onClick,
}: {
  name: string;
  children: ReactNode;
  onClick?: () => void;
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

  const hintClass = [
    styles['header-attrs__hint'],
    onClick ? styles['header-attrs__hint--clickable'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const hintHandlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => {
      setHovered(false);
      setCoords(null);
    },
  };

  if (onClick) {
    return (
      <button
        ref={hintRef as React.RefObject<HTMLButtonElement>}
        type="button"
        className={hintClass}
        aria-label={`View ${name} in channel info`}
        onClick={onClick}
        {...hintHandlers}
      >
        {children}
        {tooltipBubble}
      </button>
    );
  }

  return (
    <span ref={hintRef as React.RefObject<HTMLSpanElement>} className={hintClass} {...hintHandlers}>
      {children}
      {tooltipBubble}
    </span>
  );
}

function renderVisibleChip(
  attribute: HeaderChannelAttribute,
  onChipClick?: () => void,
) {
  if (attribute.isClassification || attribute.useChip) {
    return (
      <HeaderAttributeChipHint
        key={attribute.id}
        name={attribute.name}
        onClick={onChipClick}
      >
        <HeaderAttributeValue
          attribute={attribute}
          chipClassName={styles['header-attrs__chip']}
        />
      </HeaderAttributeChipHint>
    );
  }

  if (onChipClick) {
    return (
      <button
        key={attribute.id}
        type="button"
        className={[
          styles['header-attrs__text'],
          styles['header-attrs__text--clickable'],
        ].join(' ')}
        aria-label={`View ${attribute.name} in channel info`}
        onClick={onChipClick}
      >
        {attribute.label}
      </button>
    );
  }

  return (
    <span key={attribute.id} className={styles['header-attrs__text']}>
      {attribute.label}
    </span>
  );
}

export default function ChannelHeaderAttributeChips({
  channel,
  className = '',
  maxVisible = DEFAULT_MAX_VISIBLE,
  onChipClick,
  onViewAllAttributes,
}: ChannelHeaderAttributeChipsProps) {
  const attributes = headerChannelAttributes(channel);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [overflowOpen, setOverflowOpen] = useState(false);

  if (attributes.length === 0) return null;

  const visibleLimit = Math.max(0, maxVisible);
  const visible = attributes.slice(0, visibleLimit);
  const overflow = attributes.slice(visibleLimit);
  const overflowCount = overflow.length;

  const closeOverflow = () => setOverflowOpen(false);

  const handleViewAll = () => {
    closeOverflow();
    (onViewAllAttributes ?? onChipClick)?.();
  };

  const rootClass = [styles['header-attrs'], className].filter(Boolean).join(' ');

  return (
    <div className={rootClass} aria-label="Channel attributes">
      {visible.map((attribute) => renderVisibleChip(attribute, onChipClick))}

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
            +{overflowCount} more
          </button>
          <FixedPopoverMenu
            open={overflowOpen}
            onClose={closeOverflow}
            anchorRef={moreRef}
            align="start"
            minWidthFloor={280}
            gap={4}
          >
            <PopoverMenu aria-label="More channel attributes">
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
                    <HeaderAttributeValue
                      attribute={attribute}
                      chipClassName={styles['header-attrs__chip']}
                    />
                  </span>
                </div>
              ))}
              {(onViewAllAttributes || onChipClick) && (
                <>
                  <PopoverMenuDivider />
                  <MenuItem
                    label="View all attributes"
                    leadingElement={false}
                    onClick={handleViewAll}
                  />
                </>
              )}
            </PopoverMenu>
          </FixedPopoverMenu>
        </>
      )}
    </div>
  );
}
