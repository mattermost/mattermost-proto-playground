import {
  Component,
  useCallback,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
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
  reaction?: string;
  connection?: VideoTileConnection;
  self?: boolean;
  /** Key into `clips`. */
  clipId?: string;
}

export interface VideoStageClip {
  src?: string;
  poster?: string;
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
  labels?: VideoStageLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<VideoStageLabels> = {
  stage: 'Call participants',
  self: 'You',
  overflow: (n) => `+${n}`,
  overflowAria: (n) => `${n} more ${n === 1 ? 'participant' : 'participants'}`,
  selectTile: (name) => `Focus ${name}`,
  presenting: (name) => `${name} is presenting`,
  pipRegion: 'Your video. Drag or use arrow keys to move it to another corner.',
  pipHide: 'Hide self view',
  pipShow: 'Show self view',
};

/** Grid columns per row: divisible by 1-5 and centres any short row exactly. */
const GRID_COLUMNS = 120;
const SHARE_CONTENT = '__share__';

type CellRole = 'tile' | 'featured' | 'strip' | 'floating';

interface Placement {
  role: CellRole;
  column?: string;
  row?: string;
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
): StagePlan {
  const cells = new Map<string, Placement>();

  if (layout.kind === 'pip') {
    cells.set(layout.mainId, { role: 'tile', column: '1 / -1', row: '1' });
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
          role: 'tile',
          column: `${1 + offset + i * span} / span ${span}`,
          row: `${r + 1}`,
        });
      });
    });
    return {
      canvas: {
        gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${Math.max(1, layout.rows.length)}, minmax(0, 1fr))`,
      },
      cells,
    };
  }

  if (layout.kind === 'speaker') {
    // Strip of 16:9 cells along the top (half-columns so a short second row
    // centres exactly), featured speaker below spanning the full width.
    const rows = layout.stripRows;
    const k = Math.max(1, ...rows.map((r) => r.length));
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
  layout,
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
  labels,
  className,
}: VideoStageProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const byId = new Map(participants.map((p) => [p.id, p]));
  const plan = planStage(layout, filmstripPosition);

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

  const flipKey = `${layout.kind}|${filmstripPosition}|${compact ? 1 : 0}|${[
    ...plan.cells,
  ]
    .map(([id, p]) => `${id}@${p.role}:${p.column ?? ''}/${p.row ?? ''}`)
    .join(',')}`;

  const renderTile = (p: VideoStageParticipant, size: VideoTileSize) => {
    const clip = p.clipId ? clips[p.clipId] : undefined;
    const useStream = !!p.self && !!selfStream;
    return (
      <VideoTile
        name={p.name}
        avatarSrc={p.avatarSrc}
        videoSrc={useStream ? undefined : clip?.src}
        posterSrc={clip?.poster}
        stream={useStream ? selfStream : undefined}
        mirrored={useStream}
        cameraOn={p.cameraOn}
        muted={p.muted}
        speaking={!!p.talking && !p.muted}
        handRaised={p.handRaised}
        reaction={p.reaction}
        connection={p.connection}
        paused={paused}
        size={size}
        selfLabel={p.self ? l.self : undefined}
        menu={getTileMenu?.(p.id)}
      />
    );
  };

  const placementStyle = (place: Placement): CSSProperties =>
    place.role === 'floating'
      ? {}
      : { gridColumn: place.column, gridRow: place.row };

  const cellClass = (place: Placement) =>
    cx(styles['video-stage__cell'], styles[`video-stage__cell--${place.role}`]);

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
            className={cellClass(place)}
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
          className={cellClass(place)}
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
        <div className={styles['video-stage__canvas']} style={plan.canvas}>
          {renderShareContent()}
          {tiles}
          {renderOverflow()}
        </div>
      </FlipBoundary>
    </section>
  );
}
