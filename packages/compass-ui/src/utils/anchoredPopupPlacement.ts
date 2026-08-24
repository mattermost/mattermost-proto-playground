export type PopupPlacement = 'above' | 'below';

export const ANCHORED_POPUP_GAP = 4;
export const ANCHORED_POPUP_VIEWPORT_MARGIN = 48;
export const ANCHORED_POPUP_MIN_HEIGHT = 120;
/** Default stacking above typical product chrome; hosts can override via zIndex. */
export const ANCHORED_POPUP_Z_INDEX = 1000;

export interface AnchoredPopupPlacementOptions {
  /** Gap between trigger and popup. Default: 4. */
  gap?: number;
  /** Reserved space at the viewport edge. Default: 48. */
  viewportMargin?: number;
  /** Height used to decide whether the popup fits below. */
  preferredHeight: number;
  /** Cap for scrollable menus (e.g. Select/Combobox 280). */
  maxHeightCap?: number;
  /** Floor so short viewports still show a scrollable list. Default: 120. */
  minHeight?: number;
}

export interface AnchoredPopupPlacementResult {
  placement: PopupPlacement;
  maxHeight: number;
}

/**
 * Prefers opening below the anchor; flips above when there isn’t enough room
 * below and there is more space above. Max-height is the available space in the
 * chosen direction, optionally capped.
 */
export function computeAnchoredPopupPlacement(
  anchorRect: Pick<DOMRect, 'top' | 'bottom'>,
  viewportHeight: number,
  options: AnchoredPopupPlacementOptions & {
    /** When set, flip/max-height use this box instead of the viewport. */
    bounds?: Pick<DOMRect, 'top' | 'bottom'>;
  },
): AnchoredPopupPlacementResult {
  const gap = options.gap ?? ANCHORED_POPUP_GAP;
  const viewportMargin =
    options.viewportMargin ?? ANCHORED_POPUP_VIEWPORT_MARGIN;
  const minHeight = options.minHeight ?? ANCHORED_POPUP_MIN_HEIGHT;
  const preferredHeight = Math.max(options.preferredHeight, 0);

  const boundsTop = options.bounds?.top ?? 0;
  const boundsBottom = options.bounds?.bottom ?? viewportHeight;

  const spaceBelow = Math.max(
    0,
    boundsBottom - anchorRect.bottom - gap - viewportMargin,
  );
  const spaceAbove = Math.max(0, anchorRect.top - boundsTop - gap - viewportMargin);

  const placement: PopupPlacement =
    spaceBelow < preferredHeight && spaceAbove > spaceBelow ? 'above' : 'below';

  const available = placement === 'below' ? spaceBelow : spaceAbove;
  const capped =
    options.maxHeightCap != null
      ? Math.min(options.maxHeightCap, available)
      : available;

  return {
    placement,
    maxHeight: Math.max(minHeight, capped),
  };
}

export interface AnchoredPopupFixedStyle {
  position: 'fixed' | 'absolute';
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  zIndex: number;
}

export type AnchoredPopupBounds = Pick<
  DOMRect,
  'top' | 'bottom' | 'left' | 'width' | 'height'
>;

/** Mount element metrics for portaled absolute positioning. */
export interface AnchoredPopupContainerFrame {
  /** Visible viewport bounds used for flip/max-height. */
  bounds: Pick<DOMRect, 'top' | 'bottom'>;
  /** Maps a viewport anchor rect into mount padding-box coordinates. */
  anchorInContainer: (
    anchorRect: Pick<DOMRect, 'top' | 'bottom' | 'left' | 'width'>,
  ) => {
    left: number;
    top: number;
    bottom: number;
    width: number;
  };
  /** Visible padding-box height used for above `bottom` anchoring. */
  clientHeight: number;
  /** Current vertical scroll offset of the mount. */
  scrollTop: number;
}

export function getAnchoredPopupContainerFrame(
  mount: HTMLElement,
): AnchoredPopupContainerFrame {
  const borderRect = mount.getBoundingClientRect();
  const boundsTop = borderRect.top + mount.clientTop;
  const boundsBottom = boundsTop + mount.clientHeight;

  return {
    bounds: { top: boundsTop, bottom: boundsBottom },
    anchorInContainer: (anchorRect: Pick<DOMRect, 'top' | 'bottom' | 'left' | 'width'>) => ({
      left:
        anchorRect.left -
        borderRect.left -
        mount.clientLeft +
        mount.scrollLeft,
      top:
        anchorRect.top -
        borderRect.top -
        mount.clientTop +
        mount.scrollTop,
      bottom:
        anchorRect.bottom -
        borderRect.top -
        mount.clientTop +
        mount.scrollTop,
      width: anchorRect.width,
    }),
    clientHeight: mount.clientHeight,
    scrollTop: mount.scrollTop,
  };
}

/**
 * Fixed box coords for a portaled popup anchored to a trigger rect.
 * Below: top edge sits `gap` px under the trigger bottom.
 * Above: bottom edge sits `gap` px above the trigger top (uses `bottom` so
 * height does not affect the gap).
 *
 * When `containerFrame` is provided, returns `absolute` coords in the mount
 * padding box (accounts for scroll and client border offsets). Otherwise uses
 * viewport `fixed` coords (document.body default).
 */
export function computeAnchoredPopupFixedStyle(
  anchorRect: Pick<DOMRect, 'top' | 'bottom' | 'left' | 'width'>,
  placement: PopupPlacement,
  options: {
    gap?: number;
    zIndex?: number;
    /** Override width (defaults to trigger width). */
    width?: number;
    viewportHeight?: number;
    containerFrame?: AnchoredPopupContainerFrame;
  },
): AnchoredPopupFixedStyle {
  const gap = options.gap ?? ANCHORED_POPUP_GAP;
  const width = options.width ?? anchorRect.width;
  const zIndex = options.zIndex ?? ANCHORED_POPUP_Z_INDEX;
  const containerFrame = options.containerFrame;

  if (containerFrame) {
    const anchor = containerFrame.anchorInContainer(anchorRect);
    if (placement === 'below') {
      return {
        position: 'absolute',
        top: anchor.bottom + gap,
        left: anchor.left,
        width,
        zIndex,
      };
    }
    const visibleTop = anchor.top - containerFrame.scrollTop;
    return {
      position: 'absolute',
      bottom: containerFrame.clientHeight - visibleTop + gap,
      left: anchor.left,
      width,
      zIndex,
    };
  }

  const viewportHeight = options.viewportHeight ?? window.innerHeight;

  if (placement === 'below') {
    return {
      position: 'fixed',
      top: anchorRect.bottom + gap,
      left: anchorRect.left,
      width,
      zIndex,
    };
  }

  return {
    position: 'fixed',
    bottom: viewportHeight - anchorRect.top + gap,
    left: anchorRect.left,
    width,
    zIndex,
  };
}
