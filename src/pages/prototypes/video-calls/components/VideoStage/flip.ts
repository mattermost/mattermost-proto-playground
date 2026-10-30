/**
 * FLIP layout animation for stage tiles (Web Animations API, no layout thrash).
 *
 * `measureBoxes` reads every tile's on-screen box BEFORE React commits a new
 * layout (from a class `getSnapshotBeforeUpdate`); `playFlip` runs right after
 * the commit, before paint: it cancels in-flight animations, reads every new
 * box in one pass, then writes one animation per tile.
 *
 * A tile changes both size and aspect ratio between layouts, so a plain
 * non-uniform scale would stretch the video. Instead each tile scales
 * UNIFORMLY (enough to cover its old box) and a `clip-path: inset()` crops it
 * to the old box's shape; both animate to identity. The video keeps
 * `object-fit: cover` proportions the whole way.
 */

export interface FlipBox {
  /** Visual centre (viewport px). */
  cx: number;
  cy: number;
  /** Visual size (viewport px). */
  w: number;
  h: number;
}

const running = new WeakMap<Element, Animation>();

const INSET_RE = /inset\(\s*([\d.]+)px(?:\s+([\d.]+)px)?/;

/** On-screen box of a tile, accounting for a FLIP animation in flight. */
function visualBox(el: HTMLElement): FlipBox {
  const r = el.getBoundingClientRect();
  const box = {
    cx: r.left + r.width / 2,
    cy: r.top + r.height / 2,
    w: r.width,
    h: r.height,
  };
  if (!running.has(el) || !el.offsetWidth) return box;
  // Mid-flight: the bounding box is the uniformly scaled layout box; the
  // visible part is that box minus the (scaled) clip insets.
  const s = r.width / el.offsetWidth;
  const m = INSET_RE.exec(getComputedStyle(el).clipPath);
  if (!m) return box;
  const iy = Number(m[1]);
  const ix = Number(m[2] ?? m[1]);
  return { ...box, w: r.width - 2 * ix * s, h: r.height - 2 * iy * s };
}

export function measureBoxes(
  nodes: ReadonlyMap<string, HTMLElement>,
): Map<string, FlipBox> {
  const out = new Map<string, FlipBox>();
  nodes.forEach((el, id) => {
    if (el.isConnected) out.set(id, visualBox(el));
  });
  return out;
}

export interface FlipTiming {
  duration: number;
  easing: string;
  enterDuration: number;
  enterEasing: string;
}

function parseDuration(value: string, fallback: number) {
  const v = value.trim();
  if (v.endsWith('ms')) return parseFloat(v) || fallback;
  if (v.endsWith('s')) return parseFloat(v) * 1000 || fallback;
  return fallback;
}

/** Motion tokens from the stage's computed style. */
export function readTiming(root: Element): FlipTiming {
  const cs = getComputedStyle(root);
  const token = (name: string) => cs.getPropertyValue(name).trim();
  return {
    duration: parseDuration(token('--duration-moderate'), 300),
    easing: token('--ease-transition') || 'ease-in-out',
    enterDuration: parseDuration(token('--duration-quick'), 150),
    enterEasing: token('--ease-entrance') || 'ease-out',
  };
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

const track = (el: Element, anim: Animation) => {
  running.set(el, anim);
  const done = () => {
    if (running.get(el) === anim) running.delete(el);
  };
  anim.addEventListener('finish', done);
  anim.addEventListener('cancel', done);
};

/**
 * Animate every tile from its `first` box to where it is now.
 * `scale` = the container's CSS scale (viewport px per layout px), so
 * transforms stay right inside a scaled device frame.
 */
export function playFlip(
  nodes: ReadonlyMap<string, HTMLElement>,
  first: ReadonlyMap<string, FlipBox>,
  timing: FlipTiming,
  scale = 1,
) {
  const els = [...nodes].filter(([, el]) => el.isConnected);
  // Writes: stop anything in flight so the reads below see final layout.
  for (const [, el] of els) running.get(el)?.cancel();
  // Reads (one layout pass).
  const last = els.map(([id, el]) => ({
    id,
    el,
    box: visualBox(el),
    radius: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0,
  }));
  // Writes.
  for (const { id, el, box, radius } of last) {
    const from = first.get(id);
    if (!from) {
      track(
        el,
        el.animate(
          [
            { opacity: 0, transform: 'scale(0.92)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: timing.enterDuration, easing: timing.enterEasing },
        ),
      );
      continue;
    }
    if (!box.w || !box.h) continue;
    const dx = (from.cx - box.cx) / scale;
    const dy = (from.cy - box.cy) / scale;
    if (
      Math.abs(dx) < 0.5 &&
      Math.abs(dy) < 0.5 &&
      Math.abs(from.w - box.w) < 0.5 &&
      Math.abs(from.h - box.h) < 0.5
    ) {
      continue;
    }
    // Uniform scale that covers the old box, clipped to the old box's shape.
    const s = Math.max(from.w / box.w, from.h / box.h);
    const localW = box.w / scale;
    const localH = box.h / scale;
    const ix = Math.max(0, (localW - from.w / scale / s) / 2);
    const iy = Math.max(0, (localH - from.h / scale / s) / 2);
    track(
      el,
      el.animate(
        [
          {
            transform: `translate(${dx}px, ${dy}px) scale(${s})`,
            clipPath: `inset(${iy}px ${ix}px round ${radius / s}px)`,
          },
          {
            transform: 'none',
            clipPath: `inset(0px 0px round ${radius}px)`,
          },
        ],
        { duration: timing.duration, easing: timing.easing },
      ),
    );
  }
}
