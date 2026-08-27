import { useLayoutEffect, useRef, useState } from 'react';

const CHIP_GAP_PX = 6;

function resolveAvailableWidth(host: HTMLElement): number {
  const hostWidth = host.clientWidth;
  const parentWidth = host.parentElement?.clientWidth ?? 0;

  let inlineSiblingsWidth = 0;
  let inlineGaps = 0;
  const inlineGroup = host.parentElement;

  if (inlineGroup) {
    for (const child of Array.from(inlineGroup.children)) {
      if (child === host || child.contains(host)) continue;
      inlineSiblingsWidth += (child as HTMLElement).getBoundingClientRect().width;
      inlineGaps += CHIP_GAP_PX;
    }
  }

  const row =
    host.closest('[class*="channel-header__primary-row"]') ??
    host.closest('[class*="right-sidebar-header__left"]');

  if (!row) {
    return Math.max(hostWidth, parentWidth) - inlineSiblingsWidth - inlineGaps;
  }

  const rowEl = row as HTMLElement;
  let siblingsWidth = 0;
  let siblingGaps = 0;

  for (const child of Array.from(rowEl.children)) {
    if (child.contains(host)) continue;
    siblingsWidth += (child as HTMLElement).getBoundingClientRect().width;
    siblingGaps += CHIP_GAP_PX;
  }

  const rowAvailable =
    rowEl.clientWidth -
    siblingsWidth -
    siblingGaps -
    inlineSiblingsWidth -
    inlineGaps;

  return Math.max(
    hostWidth,
    parentWidth - inlineSiblingsWidth - inlineGaps,
    rowAvailable,
  );
}

function overflowWidthForCount(
  hiddenCount: number,
  measure: HTMLElement,
): number {
  if (hiddenCount <= 0) return 0;

  const overflowEl = measure.querySelector(
    `[data-header-chip-overflow-measure="${hiddenCount}"]`,
  ) as HTMLElement | null;

  return overflowEl?.offsetWidth ?? 36;
}

export function useResponsiveHeaderChipCount(
  itemCount: number,
  enabled: boolean,
  minVisible = 0,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(itemCount);

  useLayoutEffect(() => {
    if (!enabled) {
      setVisibleCount(itemCount);
      return;
    }

    const host = hostRef.current;
    const measure = measureRef.current;
    if (!host || !measure) return;

    const calculate = () => {
      const availableWidth = resolveAvailableWidth(host);
      if (availableWidth <= 0) {
        setVisibleCount(itemCount);
        return;
      }

      const chipEls = Array.from(
        measure.querySelectorAll('[data-header-chip-measure]'),
      ) as HTMLElement[];

      if (chipEls.length === 0) {
        setVisibleCount(0);
        return;
      }

      let used = 0;
      let visible = 0;

      for (let index = 0; index < chipEls.length; index++) {
        const chipWidth = chipEls[index].offsetWidth;
        const gap = visible > 0 ? CHIP_GAP_PX : 0;
        const hiddenAfter = chipEls.length - visible - 1;
        const reserveOverflow = overflowWidthForCount(hiddenAfter, measure);
        const reserveGap = hiddenAfter > 0 ? CHIP_GAP_PX : 0;

        if (used + gap + chipWidth + reserveGap + reserveOverflow > availableWidth) {
          break;
        }

        used += gap + chipWidth;
        visible++;
      }

      setVisibleCount(
        Math.max(minVisible, Math.min(visible, itemCount)),
      );
    };

    calculate();

    const row =
      host.closest('[class*="channel-header__primary-row"]') ??
      host.closest('[class*="right-sidebar-header__left"]');

    const observer = new ResizeObserver(calculate);
    observer.observe(host);
    if (host.parentElement) observer.observe(host.parentElement);
    if (row) observer.observe(row);
    return () => observer.disconnect();
  }, [enabled, itemCount, minVisible]);

  return { hostRef, measureRef, visibleCount };
}
