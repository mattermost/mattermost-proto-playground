import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Tooltip, { type TooltipArrow } from '@/components/ui/Tooltip/Tooltip';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import PopoverMenu, {
  PopoverMenuDivider,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import styles from './MvpCatalogListing.module.scss';

const VIEWPORT_MARGIN = 8;
const TOOLTIP_GAP = 8;

export interface MvpAttributeRowActionsMenuProps {
  attributeName: string;
  open: boolean;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
  onToggle: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function DisabledMenuItemTooltip({
  reason,
  describedById,
  children,
}: {
  reason: string;
  describedById: string;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    arrow: TooltipArrow;
  } | null>(null);

  useLayoutEffect(() => {
    if (!open || !wrapRef.current) {
      setPosition(null);
      return undefined;
    }

    const update = () => {
      const anchor = wrapRef.current;
      const tooltip = tooltipRef.current;
      if (!anchor) {
        return;
      }

      const anchorRect = anchor.getBoundingClientRect();
      const tooltipWidth = tooltip?.offsetWidth ?? 220;
      const tooltipHeight = tooltip?.offsetHeight ?? 40;

      let arrow: TooltipArrow = 'Left';
      let left = anchorRect.left - tooltipWidth - TOOLTIP_GAP;
      let top = anchorRect.top + anchorRect.height / 2 - tooltipHeight / 2;

      if (left < VIEWPORT_MARGIN) {
        arrow = 'Bottom';
        left = anchorRect.left + anchorRect.width / 2 - tooltipWidth / 2;
        top = anchorRect.top - tooltipHeight - TOOLTIP_GAP;
      }

      if (top < VIEWPORT_MARGIN) {
        arrow = 'Top';
        top = anchorRect.bottom + TOOLTIP_GAP;
      }

      setPosition({
        top: clamp(
          top,
          VIEWPORT_MARGIN,
          window.innerHeight - tooltipHeight - VIEWPORT_MARGIN,
        ),
        left: clamp(
          left,
          VIEWPORT_MARGIN,
          window.innerWidth - tooltipWidth - VIEWPORT_MARGIN,
        ),
        arrow,
      });
    };

    update();
    const frame = requestAnimationFrame(update);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, reason]);

  return (
    <>
      <div
        ref={wrapRef}
        className={styles['table__menu-tooltip-wrap']}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setOpen(false);
          }
        }}
      >
        {children}
        <span id={describedById} className={styles['table__sr-only']}>
          {reason}
        </span>
      </div>
      {open &&
        createPortal(
          <div
            ref={tooltipRef}
            className={styles['table__menu-tooltip-portal']}
            style={
              position
                ? { top: position.top, left: position.left }
                : { top: -9999, left: -9999, visibility: 'hidden' as const }
            }
            aria-hidden
          >
            <Tooltip label={reason} arrow={position?.arrow ?? 'Left'} />
          </div>,
          document.body,
        )}
    </>
  );
}

/** Per-row overflow menu — stable anchor ref so the portaled popover positions correctly. */
export default function MvpAttributeRowActionsMenu({
  attributeName,
  open,
  deleteDisabled = false,
  deleteDisabledReason,
  onToggle,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}: MvpAttributeRowActionsMenuProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const deleteDescId = useId();

  const deleteItem = (
    <MenuItem
      label="Delete attribute"
      destructive
      disabled={deleteDisabled}
      leadingVisual={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
      aria-describedby={
        deleteDisabled && deleteDisabledReason ? deleteDescId : undefined
      }
      onClick={() => {
        if (deleteDisabled) {
          return;
        }
        onClose();
        onDelete();
      }}
    />
  );

  return (
    <div ref={wrapRef} className={styles['table__menu-wrap']}>
      <IconButton
        size="Small"
        className={open ? styles['table__menu-trigger--open'] : undefined}
        aria-label={`More actions for ${attributeName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      />
      <FixedPopoverMenu
        open={open}
        onClose={onClose}
        anchorRef={wrapRef}
        align="end"
        className={styles['table__menu']}
      >
        <PopoverMenu aria-label={`${attributeName} actions`}>
          <MenuItem
            label="Edit attribute"
            leadingVisual={<Icon size="16" glyph={<PencilOutlineIcon />} />}
            onClick={() => {
              onClose();
              onEdit();
            }}
          />
          <MenuItem
            label="Duplicate attribute"
            leadingVisual={<Icon size="16" glyph={<ContentCopyIcon />} />}
            onClick={() => {
              onClose();
              onDuplicate();
            }}
          />
          <PopoverMenuDivider />
          {deleteDisabled && deleteDisabledReason ? (
            <DisabledMenuItemTooltip reason={deleteDisabledReason} describedById={deleteDescId}>
              {deleteItem}
            </DisabledMenuItemTooltip>
          ) : (
            deleteItem
          )}
        </PopoverMenu>
      </FixedPopoverMenu>
    </div>
  );
}
