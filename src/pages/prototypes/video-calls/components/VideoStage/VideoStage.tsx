import {
  Component,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import {
  OVERFLOW_CELL,
  type StageLayout,
} from '../../layout/computeStageLayout';
import {
  VideoTile,
  type VideoTileConnection,
  type VideoTileMenu,
  type VideoTileSize,
} from '../VideoTile';
import { SelfViewPip, type SelfViewPipCorner } from '../SelfViewPip';
import {
  measureBoxes,
  playFlip,
  prefersReducedMotion,
  readTiming,
  type FlipBox,
} from './flip';
import styles from './VideoStage.module.scss';

/** Participant fields the stage renders. `VideoParticipant` satisfies it. */
export interface VideoStageParticipant {
  id: string;
  name: string;
  avatarSrc?: string;
  cameraOn: boolean;
  muted?: boolean;
  talking?: boolean;
  handRaised?: boolean;
  /** Shows the host badge on the tile. */
  host?: boolean;
  reaction?: string;
  connection?: VideoTileConnection;
  self?: boolean;
  /** Key into `clips`. */
  clipId?: string;
}

export interface VideoStageClip {
  src?: string;
  poster?: string;
  /** Seconds into the loop this participant starts at. */
  offset?: number;
  /** Mirror the clip so a shared source reads as a different framing. */
  mirrored?: boolean;
}

export interface VideoStageLabels {
  /** Accessible name of the stage region. */
  stage?: string;
  /** Suffix after the signed-in user's name, e.g. "You". */
  self?: string;
  /** Overflow chip text. */
  overflow?: (count: number) => string;
  /** Overflow chip accessible name. */
  overflowAria?: (count: number) => string;
  /** Accessible name of the per-tile select button. */
  selectTile?: (name: string) => string;
  /** Speaker strip pagination: previous / next page buttons (1-based page). */
  prevPage?: (page: number, total: number) => string;
  nextPage?: (page: number, total: number) => string;
  /** Chip over shared content. */
  presenting?: (name: string) => string;
  /** Self-view PiP copy. */
  pipRegion?: string;
  pipHide?: string;
  pipShow?: string;
}

export interface VideoStageProps {
  layout: StageLayout;
  participants: readonly VideoStageParticipant[];
  /** Remote clips keyed by `participant.clipId`. */
  clips?: Record<string, VideoStageClip>;
  /** Self webcam. When set, the self tile plays it mirrored. */
  selfStream?: MediaStream | null;
  /** Rendered in the main area for `share` layouts. */
  shareContent?: ReactNode;
  /** Makes tiles clickable (pin / focus). */
  onSelectTile?: (id: string) => void;
  /** Called by the overflow chip. */
  onSelectOverflow?: () => void;
  /** Per-tile host-controls menu (passed to `VideoTile` as `menu`). */
  getTileMenu?: (participantId: string) => VideoTileMenu | undefined;
  pipHidden?: boolean;
  onPipHiddenChange?: (hidden: boolean) => void;
  pipCorner?: SelfViewPipCorner;
  onPipCornerChange?: (corner: SelfViewPipCorner) => void;
  /** `side` = filmstrip column on the right (desktop), `bottom` = row below content. */
  filmstripPosition?: 'side' | 'bottom';
  /** Use compact tiles / PiP (mobile). */
  compact?: boolean;
  /** Pause every tile (e.g. stage covered); shows poster frames only. */
  paused?: boolean;
  /**
   * Width (px) the stage will have once a host transition (e.g. a side pane
   * sliding in) finishes. Strip pagination is decided against it, so the
   * paging controls do not flicker while the stage animates. Defaults to the
   * measured width.
   */
  settledWidth?: number;
  labels?: VideoStageLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<VideoStageLabels> = {
  stage: 'Call participants',
  self: 'You',
  overflow: (n) => `+${n}`,
  overflowAria: (n) => `${n} more ${n === 1 ? 'participant' : 'participants'}`,
  selectTile: (name) => `Focus ${name}`,
  prevPage: (page, total) => `Previous participants, page ${page} of ${total}`,
  nextPage: (page, total) => `Next participants, page ${page} of ${total}`,
  presenting: (name) => `${name} is presenting`,
  pipRegion: 'Your video. Drag or use arrow keys to move it to another corner.',
  pipHide: 'Hide self view',
  pipShow: 'Show self view',
};

/** Grid columns per row: divisible by 1-5 and centres any short row exactly. */
const GRID_COLUMNS = 120;
const SHARE_CONTENT = '__share__';

type CellRole = 'tile' | 'grid' | 'featured' | 'strip' | 'floating';

interface Placement {
  role: CellRole;
  column?: string;
  row?: string;
}

interface StripBox {
  /** Canvas width (px). */
  width: number;
  /** Gap between strip tiles (px). */
  gap: number;
  /** Minimum strip tile width (px) before the strip paginates. */
  min: number;
  /** Width reserved for each page button (px). */
  nav: number;
}

interface PageFlow {
  /** 1 = next page (content moves left), -1 = previous page. */
  dir: 1 | -1;
  /** Strip tiles entering from the page flip. */
  entering: string[];
  /** Strip tiles of the old page, kept mounted while they animate out. */
  leaving: { id: string; place: Placement }[];
}

interface StagePlan {
  canvas: CSSProperties & Record<string, string | number>;
  cells: Map<string, Placement>;
}

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

/**
 * StageLayout → CSS grid placement. Every visible tile is a direct child of
 * one grid, so switching layouts only changes `grid-column` / `grid-row`.
 */
function planStage(
  layout: StageLayout,
  filmstripPosition: 'side' | 'bottom',
  stripSlots = 0,
): StagePlan {
  const cells = new Map<string, Placement>();

  if (layout.kind === 'pip') {
    cells.set(layout.mainId, { role: 'featured', column: '1 / -1', row: '1' });
    cells.set(layout.pipId, { role: 'floating' });
    return {
      canvas: {
        gridTemplateColumns: 'minmax(0, 1fr)',
        gridTemplateRows: 'minmax(0, 1fr)',
      },
      cells,
    };
  }

  if (layout.kind === 'grid') {
    const k = Math.max(1, layout.cols);
    const span = GRID_COLUMNS / k;
    layout.rows.forEach((row, r) => {
      const offset = ((k - row.length) * span) / 2;
      row.forEach((id, i) => {
        cells.set(id, {
          role: 'grid',
          column: `${1 + offset + i * span} / span ${span}`,
          row: `${r + 1}`,
        });
      });
    });
    return {
      canvas: {
        '--video-stage-grid-cols': k,
        '--video-stage-grid-rows': Math.max(1, layout.rows.length),
        gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${Math.max(1, layout.rows.length)}, minmax(0, 1fr))`,
      },
      cells,
    };
  }

  if (layout.kind === 'speaker') {
    // Strip of 16:9 cells along the top (half-columns so a short second row
    // centres exactly), featured speaker below in the largest 16:9 box that fits (centred).
    const rows = layout.stripRows;
    // A paged strip sizes cells for a full page, so a shorter last page keeps
    // the same tile size (its tiles are centred).
    const k = Math.max(1, stripSlots, ...rows.map((r) => r.length));
    rows.forEach((row, r) => {
      row.forEach((id, i) => {
        cells.set(id, {
          role: 'strip',
          column: `${2 + (k - row.length) + 2 * i} / span 2`,
          row: `${r + 1}`,
        });
      });
    });
    cells.set(layout.featuredId, {
      role: 'featured',
      column: '1 / -1',
      row: `${rows.length + 1}`,
    });
    return {
      canvas: {
        '--video-stage-strip-count': k,
        gridTemplateColumns: `minmax(0, 1fr) repeat(${2 * k}, calc(var(--video-stage-strip-cell) / 2)) minmax(0, 1fr)`,
        gridTemplateRows: `repeat(${rows.length}, var(--video-stage-strip-row)) minmax(0, 1fr)`,
      },
      cells,
    };
  }

  // share
  const strip = layout.overflowIds.length
    ? [...layout.filmstripIds, OVERFLOW_CELL]
    : layout.filmstripIds;
  const n = Math.max(1, strip.length);
  if (filmstripPosition === 'side') {
    cells.set(SHARE_CONTENT, { role: 'tile', column: '1', row: '1 / -1' });
    strip.forEach((id, i) =>
      cells.set(id, { role: 'strip', column: '2', row: `${i + 2}` }),
    );
    return {
      canvas: {
        '--video-stage-strip-count': n,
        gridTemplateColumns: 'minmax(0, 1fr) var(--video-stage-film-cell)',
        gridTemplateRows: `minmax(0, 1fr) repeat(${n}, var(--video-stage-film-row)) minmax(0, 1fr)`,
      },
      cells,
    };
  }
  cells.set(SHARE_CONTENT, { role: 'tile', column: '1 / -1', row: '1' });
  strip.forEach((id, i) =>
    cells.set(id, { role: 'strip', column: `${i + 2}`, row: '2' }),
  );
  return {
    canvas: {
      '--video-stage-strip-count': n,
      gridTemplateColumns: `minmax(0, 1fr) repeat(${n}, var(--video-stage-film-cell)) minmax(0, 1fr)`,
      gridTemplateRows: 'minmax(0, 1fr) var(--video-stage-film-row)',
    },
    cells,
  };
}

interface FlipBoundaryProps {
  flipKey: string;
  nodes: ReadonlyMap<string, HTMLElement>;
  rootRef: { current: HTMLElement | null };
  children: ReactNode;
}

/**
 * Class boundary only for `getSnapshotBeforeUpdate`: the one React hook point
 * that runs after render but BEFORE the DOM changes, i.e. where the "first"
 * boxes of a FLIP can be read. The animation starts in `componentDidUpdate`
 * (same timing as `useLayoutEffect`: after the commit, before paint).
 */
class FlipBoundary extends Component<FlipBoundaryProps> {
  getSnapshotBeforeUpdate(prev: FlipBoundaryProps) {
    if (prev.flipKey === this.props.flipKey || prefersReducedMotion()) {
      return null;
    }
    return measureBoxes(this.props.nodes);
  }

  componentDidUpdate(
    _prev: FlipBoundaryProps,
    _state: unknown,
    first: Map<string, FlipBox> | null,
  ) {
    const root = this.props.rootRef.current;
    if (!first || !root) return;
    const scale = root.offsetWidth
      ? root.getBoundingClientRect().width / root.offsetWidth
      : 1;
    playFlip(this.props.nodes, first, readTiming(root), scale || 1);
  }

  render() {
    return this.props.children;
  }
}

/**
 * Call stage: renders a `StageLayout` (pip / grid / speaker / share). Every
 * tile is a direct child of one CSS grid, keyed by participant id and kept in
 * participant order in the DOM; layouts only change each tile's grid lines,
 * so switching view, sharing or joining never reparents or remounts a
 * `<video>`. The self tile always sits inside `SelfViewPip` (docked in grids,
 * floating in 1:1 speaker view) for the same reason. Layout changes animate
 * with FLIP (see `flip.ts`); overflow participants are not rendered, so at
 * most the visible tiles decode video.
 */
export function VideoStage({
  layout: inputLayout,
  participants,
  clips = {},
  selfStream,
  shareContent,
  onSelectTile,
  onSelectOverflow,
  getTileMenu,
  pipHidden,
  onPipHiddenChange,
  pipCorner,
  onPipCornerChange,
  filmstripPosition = 'side',
  compact = false,
  paused = false,
  settledWidth,
  labels,
  className,
}: VideoStageProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [stripBox, setStripBox] = useState<StripBox | null>(null);
  const [stripPage, setStripPage] = useState(0);

  // Measure the strip's room: canvas width, gap and the minimum tile / nav
  // widths (CSS custom properties), so paging follows the stage, not a guess.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const read = () => {
      const cs = getComputedStyle(canvas);
      // Project the animating canvas onto its settled width.
      const root = canvas.parentElement;
      const delta =
        settledWidth !== undefined && root
          ? settledWidth - root.clientWidth
          : 0;
      const next: StripBox = {
        width: Math.round(canvas.clientWidth + delta),
        gap: parseFloat(cs.rowGap) || 0,
        min: parseFloat(cs.getPropertyValue('--video-stage-strip-min')) || 0,
        nav: parseFloat(cs.getPropertyValue('--video-stage-strip-nav')) || 0,
      };
      setStripBox((prev) =>
        prev &&
        prev.width === next.width &&
        prev.gap === next.gap &&
        prev.min === next.min &&
        prev.nav === next.nav
          ? prev
          : next,
      );
    };
    read();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(read);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [compact, settledWidth]);

  // Speaker strip pagination, only when the tiles would drop below the
  // minimum size (e.g. a side pane narrows the stage). Every strip tile,
  // yours included, belongs to exactly one page (yours is on the first).
  const paged = useMemo(() => {
    if (inputLayout.kind !== 'speaker' || !stripBox || stripBox.min <= 0) {
      return null;
    }
    const { width, gap, min, nav } = stripBox;
    const cell = min + gap;
    const ids = inputLayout.stripIds;
    if (ids.length <= Math.floor(width / cell)) return null;
    const capacity = Math.max(2, Math.floor((width - 2 * nav) / cell));
    const pageCount = Math.max(1, Math.ceil(ids.length / capacity));
    const page = Math.min(stripPage, pageCount - 1);
    const visible = ids.slice(page * capacity, (page + 1) * capacity);
    return {
      page,
      pageCount,
      slots: capacity,
      layout: { ...inputLayout, stripIds: visible, stripRows: [visible] },
    };
  }, [inputLayout, stripBox, stripPage]);
  const layout: StageLayout = paged?.layout ?? inputLayout;

  const byId = new Map(participants.map((p) => [p.id, p]));
  // Stable per-tile menu objects so memoised tiles skip the timer's re-renders.
  const tileMenus = useMemo(
    () =>
      new Map(participants.map((p) => [p.id, getTileMenu?.(p.id)] as const)),
    [participants, getTileMenu],
  );
  const plan = planStage(layout, filmstripPosition, paged?.slots);

  // Page flips slide the strip tiles in the direction of travel: the new page
  // enters from that side while the old one leaves the other way. The leaving
  // tiles stay mounted in their old cells until their exit animation ends.
  const [pageFlow, setPageFlow] = useState<PageFlow | null>(null);
  const prevStrip = useRef<{
    page: number;
    ids: string[];
    cells: Map<string, Placement>;
  } | null>(null);
  useLayoutEffect(() => {
    const cur = paged
      ? { page: paged.page, ids: paged.layout.stripIds, cells: plan.cells }
      : null;
    const prev = prevStrip.current;
    prevStrip.current = cur;
    if (!cur) {
      setPageFlow(null);
      return;
    }
    if (!prev || prev.page === cur.page || prefersReducedMotion()) return;
    setPageFlow({
      dir: cur.page > prev.page ? 1 : -1,
      entering: cur.ids.filter((id) => !prev.ids.includes(id)),
      leaving: prev.ids
        .filter((id) => !cur.ids.includes(id))
        .flatMap((id) => {
          const place = prev.cells.get(id);
          return place ? [{ id, place }] : [];
        }),
    });
  }, [paged, plan]);
  useEffect(() => {
    if (!pageFlow) return undefined;
    // Safety net if an exit animation never reports its end.
    const t = window.setTimeout(() => setPageFlow(null), 1000);
    return () => window.clearTimeout(t);
  }, [pageFlow]);

  const rootRef = useRef<HTMLElement | null>(null);
  const nodes = useRef(new Map<string, HTMLElement>()).current;
  const refCache = useRef(
    new Map<string, (el: HTMLElement | null) => void>(),
  ).current;
  const nodeRef = useCallback(
    (id: string) => {
      let fn = refCache.get(id);
      if (!fn) {
        fn = (el) => {
          if (el) nodes.set(id, el);
          else nodes.delete(id);
        };
        refCache.set(id, fn);
      }
      return fn;
    },
    [nodes, refCache],
  );

  // A paged strip's membership is left out of the key: page flips have their
  // own slide, and FLIP would otherwise move tiles (self included) on its own.
  const flipKey = `${layout.kind}|${filmstripPosition}|${compact ? 1 : 0}|${[
    ...plan.cells,
  ]
    .filter(([, p]) => !(paged && p.role === 'strip'))
    .map(([id, p]) => `${id}@${p.role}:${p.column ?? ''}/${p.row ?? ''}`)
    .join(',')}${paged ? `|strip:${paged.slots}` : ''}`;

  const renderTile = (p: VideoStageParticipant, size: VideoTileSize) => {
    const clip = p.clipId ? clips[p.clipId] : undefined;
    const useStream = !!p.self && !!selfStream;
    return (
      <VideoTile
        name={p.name}
        avatarSrc={p.avatarSrc}
        videoSrc={useStream ? undefined : clip?.src}
        posterSrc={clip?.poster}
        clipOffset={clip?.offset}
        clipMirrored={clip?.mirrored}
        stream={useStream ? selfStream : undefined}
        mirrored={useStream}
        cameraOn={p.cameraOn}
        muted={p.muted}
        speaking={!!p.talking && !p.muted}
        handRaised={p.handRaised}
        host={p.host}
        reaction={p.reaction}
        connection={p.connection}
        paused={paused}
        size={size}
        selfLabel={p.self ? l.self : undefined}
        menu={tileMenus.get(p.id)}
      />
    );
  };

  const placementStyle = (place: Placement): CSSProperties =>
    place.role === 'floating'
      ? {}
      : { gridColumn: place.column, gridRow: place.row };

  const cellClass = (place: Placement) =>
    cx(styles['video-stage__cell'], styles[`video-stage__cell--${place.role}`]);

  const pageClass = (id: string) =>
    pageFlow?.entering.includes(id)
      ? cx(
          styles['video-stage__cell--page-enter'],
          styles[
            pageFlow.dir > 0
              ? 'video-stage__cell--page-forward'
              : 'video-stage__cell--page-back'
          ],
        )
      : undefined;

  // Visible participants, in participant (DOM) order.
  const tiles = participants
    .filter((p) => plan.cells.has(p.id))
    .map((p) => {
      const place = plan.cells.get(p.id)!;
      const small = place.role === 'strip' || place.role === 'floating';
      const size: VideoTileSize = compact || small ? 'compact' : 'default';
      if (p.self) {
        const floating = place.role === 'floating';
        return (
          <div
            key={p.id}
            className={cx(cellClass(place), pageClass(p.id))}
            style={placementStyle(place)}
          >
            <SelfViewPip
              ref={nodeRef(p.id)}
              docked={!floating}
              hidden={floating ? pipHidden : false}
              onHiddenChange={onPipHiddenChange}
              corner={pipCorner}
              onCornerChange={onPipCornerChange}
              size={compact ? 'compact' : 'default'}
              labels={{ region: l.pipRegion, hide: l.pipHide, show: l.pipShow }}
            >
              {renderTile(p, size)}
            </SelfViewPip>
          </div>
        );
      }
      return (
        <div
          key={p.id}
          className={cx(cellClass(place), pageClass(p.id))}
          style={placementStyle(place)}
        >
          {/* Pointer clicks select the tile; the button below is the keyboard
              path (kept under the tile so tile controls stay clickable). */}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            ref={nodeRef(p.id)}
            className={styles['video-stage__frame']}
            onClick={
              onSelectTile
                ? (e) => {
                    const t = e.target as Element;
                    if (t.closest('button, [role="menu"]')) return;
                    onSelectTile(p.id);
                  }
                : undefined
            }
          >
            {onSelectTile && (
              <button
                type="button"
                className={styles['video-stage__select']}
                aria-label={l.selectTile(p.name)}
                onClick={() => onSelectTile(p.id)}
              />
            )}
            {renderTile(p, size)}
          </div>
        </div>
      );
    });

  const leavingTiles = pageFlow?.leaving.map(({ id, place }) => {
    const p = byId.get(id);
    if (!p) return null;
    return (
      <div
        key={`leaving-${id}`}
        className={cx(
          cellClass(place),
          styles['video-stage__cell--page-leave'],
          styles[
            pageFlow.dir > 0
              ? 'video-stage__cell--page-forward'
              : 'video-stage__cell--page-back'
          ],
        )}
        style={placementStyle(place)}
        aria-hidden="true"
        onAnimationEnd={(e) => {
          if (e.target !== e.currentTarget) return;
          setPageFlow((f) =>
            f ? { ...f, leaving: f.leaving.filter((x) => x.id !== id) } : f,
          );
        }}
      >
        <div className={styles['video-stage__frame']}>
          {renderTile(p, 'compact')}
        </div>
      </div>
    );
  });

  const renderOverflow = () => {
    const place = plan.cells.get(OVERFLOW_CELL);
    if (!place || layout.kind === 'pip') return null;
    const overflowIds = layout.overflowIds;
    const people = overflowIds
      .map((id) => byId.get(id))
      .filter((p): p is VideoStageParticipant => !!p);
    const small = compact || place.role === 'strip';
    const content = (
      <>
        <span
          className={styles['video-stage__overflow-avatars']}
          aria-hidden="true"
        >
          {people.slice(0, 2).map((p) => (
            <UserAvatar
              key={p.id}
              src={p.avatarSrc}
              name={p.name}
              alt=""
              size={small ? '24' : '48'}
            />
          ))}
        </span>
        <span className={styles['video-stage__overflow-count']}>
          {l.overflow(overflowIds.length)}
        </span>
      </>
    );
    return (
      <div
        key={OVERFLOW_CELL}
        className={cx(
          cellClass(place),
          small && styles['video-stage__cell--small-overflow'],
        )}
        style={placementStyle(place)}
      >
        <div
          ref={nodeRef(OVERFLOW_CELL)}
          className={styles['video-stage__frame']}
        >
          {onSelectOverflow ? (
            <button
              type="button"
              className={styles['video-stage__overflow-body']}
              aria-label={l.overflowAria(overflowIds.length)}
              onClick={onSelectOverflow}
            >
              {content}
            </button>
          ) : (
            <div
              className={styles['video-stage__overflow-body']}
              role="img"
              aria-label={l.overflowAria(overflowIds.length)}
            >
              {content}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderShareContent = () => {
    const place = plan.cells.get(SHARE_CONTENT);
    if (!place || layout.kind !== 'share') return null;
    const presenter = byId.get(layout.presenterId);
    return (
      <div
        key={SHARE_CONTENT}
        className={cellClass(place)}
        style={placementStyle(place)}
      >
        <div className={styles['video-stage__content']}>
          {shareContent}
          {presenter && (
            <span className={styles['video-stage__presenting']}>
              {l.presenting(presenter.name)}
            </span>
          )}
        </div>
      </div>
    );
  };

  const rootClass = cx(
    styles['video-stage'],
    styles[`video-stage--${layout.kind}`],
    layout.kind === 'share' &&
      styles[`video-stage--filmstrip-${filmstripPosition}`],
    compact && styles['video-stage--compact'],
    className,
  );

  return (
    <section ref={rootRef} className={rootClass} aria-label={l.stage}>
      <FlipBoundary flipKey={flipKey} nodes={nodes} rootRef={rootRef}>
        <div
          ref={canvasRef}
          className={cx(
            styles['video-stage__canvas'],
            layout.kind === 'grid' && styles['video-stage__canvas--grid'],
            !!paged && styles['video-stage__canvas--paged'],
          )}
          style={plan.canvas}
        >
          {renderShareContent()}
          {tiles}
          {leavingTiles}
          {renderOverflow()}
          {paged && (
            <>
              <div
                className={cx(
                  styles['video-stage__nav'],
                  styles['video-stage__nav--prev'],
                )}
              >
                <IconButton
                  icon={<Icon size="16" glyph={<ChevronLeftIcon />} />}
                  size="small"
                  padding="compact"
                  style="inverted"
                  aria-label={l.prevPage(paged.page + 1, paged.pageCount)}
                  disabled={paged.page === 0}
                  onClick={() => setStripPage(paged.page - 1)}
                />
              </div>
              <div
                className={cx(
                  styles['video-stage__nav'],
                  styles['video-stage__nav--next'],
                )}
              >
                <IconButton
                  icon={<Icon size="16" glyph={<ChevronRightIcon />} />}
                  size="small"
                  padding="compact"
                  style="inverted"
                  aria-label={l.nextPage(paged.page + 1, paged.pageCount)}
                  disabled={paged.page >= paged.pageCount - 1}
                  onClick={() => setStripPage(paged.page + 1)}
                />
              </div>
            </>
          )}
        </div>
      </FlipBoundary>
    </section>
  );
}
