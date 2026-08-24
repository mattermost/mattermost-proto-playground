import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ANCHORED_POPUP_GAP,
  computeAnchoredPopupFixedStyle,
  getAnchoredPopupContainerFrame,
} from './anchoredPopupPlacement';

describe('computeAnchoredPopupFixedStyle (custom container)', () => {
  const gap = ANCHORED_POPUP_GAP;
  const clientHeight = 400;
  const scrollHeight = 1000;
  const scrollTop = 300;

  /** Padding-box top of anchor after vertical scroll (100px below visible top). */
  const visibleTop = 100;
  const anchorHeight = 40;
  const contentTop = visibleTop + scrollTop;
  const contentBottom = contentTop + anchorHeight;

  const containerFrame = {
    bounds: { top: 0, bottom: clientHeight },
    clientHeight,
    scrollTop,
    anchorInContainer: () => ({
      left: 64,
      top: contentTop,
      bottom: contentBottom,
      width: 200,
    }),
  };

  it('places below using content coordinates (includes scrollTop)', () => {
    const style = computeAnchoredPopupFixedStyle(
      { top: 0, bottom: 0, left: 0, width: 200 },
      'below',
      { gap, containerFrame },
    );

    expect(style).toMatchObject({
      position: 'absolute',
      top: contentBottom + gap,
      left: 64,
    });
    expect(style.bottom).toBeUndefined();
  });

  it('places above using clientHeight (padding box), not scrollHeight', () => {
    const style = computeAnchoredPopupFixedStyle(
      { top: 0, bottom: 0, left: 0, width: 200 },
      'above',
      { gap, containerFrame },
    );

    const expectedBottom = clientHeight - visibleTop + gap;
    expect(style).toMatchObject({
      position: 'absolute',
      bottom: expectedBottom,
      left: 64,
    });
    expect(style.top).toBeUndefined();

    const wrongBottom = scrollHeight - contentTop + gap;
    expect(expectedBottom).toBe(304);
    expect(wrongBottom).toBe(604);
    expect(expectedBottom).not.toBe(wrongBottom);
  });
});

describe('getAnchoredPopupContainerFrame', () => {
  let mount: HTMLDivElement;
  let anchor: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="mount" style="
        position: relative;
        overflow: auto;
        width: 320px;
        height: 200px;
        border: 2px solid #000;
        padding: 0;
      ">
        <div id="spacer" style="height: 600px; width: 800px;"></div>
        <div id="anchor" style="
          position: absolute;
          top: 420px;
          left: 180px;
          width: 120px;
          height: 32px;
        "></div>
      </div>
    `;

    mount = document.getElementById('mount') as HTMLDivElement;
    anchor = document.getElementById('anchor') as HTMLDivElement;
    mount.scrollTop = 250;
    mount.scrollLeft = 90;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('accounts for borders, client offsets, and scroll when mapping anchor coords', () => {
    const frame = getAnchoredPopupContainerFrame(mount);
    const borderRect = mount.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();

    expect(frame.clientHeight).toBe(mount.clientHeight);
    expect(frame.scrollTop).toBe(250);
    expect(frame.bounds.top).toBe(borderRect.top + mount.clientTop);
    expect(frame.bounds.bottom).toBe(frame.bounds.top + mount.clientHeight);

    const mapped = frame.anchorInContainer(anchorRect);
    expect(mapped.left).toBe(
      anchorRect.left -
        borderRect.left -
        mount.clientLeft +
        mount.scrollLeft,
    );
    expect(mapped.top).toBe(
      anchorRect.top - borderRect.top - mount.clientTop + mount.scrollTop,
    );

    const below = computeAnchoredPopupFixedStyle(anchorRect, 'below', {
      containerFrame: frame,
    });
    expect(below.top).toBe(mapped.bottom + ANCHORED_POPUP_GAP);

    const above = computeAnchoredPopupFixedStyle(anchorRect, 'above', {
      containerFrame: frame,
    });
    const visibleTop = mapped.top - frame.scrollTop;
    expect(above.bottom).toBe(frame.clientHeight - visibleTop + ANCHORED_POPUP_GAP);
    expect(above.bottom).not.toBe(mount.scrollHeight - mapped.top + ANCHORED_POPUP_GAP);
  });
});
