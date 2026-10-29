import type { CSSProperties, ReactNode } from 'react';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import type { StageLayout } from '../../layout/computeStageLayout';
import { VideoTile, type VideoTileConnection } from '../VideoTile';
import { SelfViewPip, type SelfViewPipCorner } from '../SelfViewPip';
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

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

/**
 * Call stage: renders a `StageLayout` (pip / grid / share) with CSS only (no
 * measuring). Tiles are keyed by participant id and kept in participant order
 * in the DOM; display order uses CSS `order`, so speaker swaps and reflows
 * never move or remount `<video>` elements within a layout kind. Overflow
 * participants are not rendered, so at most the visible tiles decode video.
 */
export function VideoStage({
  layout,
  participants,
  clips = {},
  selfStream,
  shareContent,
  onSelectTile,
  onSelectOverflow,
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
  const tileSize = compact ? 'compact' : 'default';

  const renderTile = (
    p: VideoStageParticipant,
    opts: { pip?: boolean } = {},
  ) => {
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
        size={opts.pip && compact ? 'compact' : tileSize}
        selfLabel={p.self ? l.self : undefined}
      />
    );
  };

  const renderSelect = (p: VideoStageParticipant) =>
    onSelectTile ? (
      <button
        type="button"
        className={styles['video-stage__select']}
        aria-label={l.selectTile(p.name)}
        onClick={() => onSelectTile(p.id)}
      />
    ) : null;

  /** Visible cells in participant (DOM) order, positioned with CSS `order`. */
  const renderCells = (
    ids: string[],
    cellClass: string,
    featured?: { id?: string; span: number },
  ) =>
    participants
      .filter((p) => ids.includes(p.id))
      .map((p) => {
        const style = { order: ids.indexOf(p.id) } as CSSProperties &
          Record<string, string | number>;
        const isFeatured = featured?.id === p.id && featured.span > 1;
        if (isFeatured) style['--video-stage-span'] = featured.span;
        return (
          <div
            key={p.id}
            className={cx(
              cellClass,
              isFeatured && styles['video-stage__cell--featured'],
            )}
            style={style}
          >
            {renderTile(p)}
            {renderSelect(p)}
          </div>
        );
      });

  const renderOverflow = (overflowIds: string[], cellClass: string) => {
    if (!overflowIds.length) return null;
    const people = overflowIds
      .map((id) => byId.get(id))
      .filter((p): p is VideoStageParticipant => !!p);
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
              size={compact ? '32' : '48'}
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
        key="overflow"
        className={cx(cellClass, styles['video-stage__overflow'])}
        style={{ order: 999 }}
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

  if (layout.kind === 'pip') {
    const main = byId.get(layout.mainId);
    const self = byId.get(layout.pipId);
    return (
      <section className={rootClass} aria-label={l.stage}>
        {main && (
          <div key={main.id} className={styles['video-stage__main']}>
            {renderTile(main)}
            {renderSelect(main)}
          </div>
        )}
        {self && (
          <SelfViewPip
            key={self.id}
            hidden={pipHidden}
            onHiddenChange={onPipHiddenChange}
            corner={pipCorner}
            onCornerChange={onPipCornerChange}
            size={compact ? 'compact' : 'default'}
            labels={{ region: l.pipRegion, hide: l.pipHide, show: l.pipShow }}
          >
            {renderTile(self, { pip: true })}
          </SelfViewPip>
        )}
      </section>
    );
  }

  if (layout.kind === 'share') {
    const presenter = byId.get(layout.presenterId);
    return (
      <section className={rootClass} aria-label={l.stage}>
        <div className={styles['video-stage__content']}>
          {shareContent}
          {presenter && (
            <span className={styles['video-stage__presenting']}>
              {l.presenting(presenter.name)}
            </span>
          )}
        </div>
        <div className={styles['video-stage__filmstrip']}>
          {renderCells(layout.filmstripIds, styles['video-stage__strip-cell'])}
          {renderOverflow(
            layout.overflowIds,
            styles['video-stage__strip-cell'],
          )}
        </div>
      </section>
    );
  }

  const gridStyle = {
    '--video-stage-cols': layout.cols,
    '--video-stage-rows': layout.rows,
  } as CSSProperties;

  return (
    <section className={rootClass} aria-label={l.stage}>
      <div className={styles['video-stage__grid']} style={gridStyle}>
        {renderCells(layout.tileIds, styles['video-stage__cell'], {
          id: layout.featuredId,
          span: layout.featuredSpan,
        })}
        {renderOverflow(layout.overflowIds, styles['video-stage__cell'])}
      </div>
    </section>
  );
}
