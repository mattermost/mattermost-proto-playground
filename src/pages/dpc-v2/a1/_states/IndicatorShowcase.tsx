/**
 * DPC V2 A1 — IndicatorShowcase (NEW in V2; Wave 2D implementation).
 *
 * Cross-surface lock-plus application demo per §3.19 and §3.22. Panels for
 * each surface render the indicator at the correct size and placement so a
 * reviewer can confirm visual consistency without scrolling between the
 * full screen demos:
 *
 *   • Browse Channels row                — lock-plus 16px, row prefix
 *   • Channel switcher result            — lock-plus 16px, row prefix
 *   • Channel header (member view)       — lock-plus 12px, inline-after-name
 *   • Channel Settings → Info toggle row — lock-plus 18-20px, settings scale
 *   • Permalink unfurl card              — lock-plus 16px + "Discoverable" label
 *   • In-channel admin sys message       — lock-plus 12px, inline emoji-style
 *
 * The LHS member-view panel explicitly says "No DPC indicator on LHS for
 * members (subtlety per KD-26 + §3.21)".
 *
 * Renders the §3.22 cross-surface consistency matrix as a table below the
 * panel grid.
 */
import LockIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import Switch from '@/components/ui/Switch/Switch';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Icon from '@/components/ui/Icon/Icon';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './IndicatorShowcase.module.scss';

export interface IndicatorShowcaseProps {
  store: A1V2StoreApi;
}

function LockPlus({ size }: { size: 12 | 16 | 20 }) {
  return (
    <span
      className={styles['v2-indicator-showcase__glyph']}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <LockIcon size={size} />
      <span
        className={styles['v2-indicator-showcase__glyph-plus']}
        style={{ width: Math.round(size * 0.6), height: Math.round(size * 0.6) }}
      >
        <PlusIcon size={Math.round(size * 0.6)} />
      </span>
    </span>
  );
}

interface SurfacePanelProps {
  number: number;
  surface: string;
  variant: string;
  size: string;
  placement: string;
  visibility: string;
  vocabulary: string;
  ariaPattern: string;
  mobile: string;
  children: React.ReactNode;
}

function SurfacePanel({
  number,
  surface,
  variant,
  size,
  placement,
  visibility,
  vocabulary,
  ariaPattern,
  mobile,
  children,
}: SurfacePanelProps) {
  return (
    <article className={styles['v2-indicator-showcase__panel']}>
      <header className={styles['v2-indicator-showcase__panel-head']}>
        <span className={styles['v2-indicator-showcase__panel-num']}>
          #{number}
        </span>
        <h4 className={styles['v2-indicator-showcase__panel-title']}>
          {surface}
        </h4>
      </header>
      <div className={styles['v2-indicator-showcase__panel-demo']}>
        {children}
      </div>
      <dl className={styles['v2-indicator-showcase__panel-meta']}>
        <div className={styles['v2-indicator-showcase__panel-meta-row']}>
          <dt>Variant</dt>
          <dd>
            {variant} · <strong>{size}</strong>
          </dd>
        </div>
        <div className={styles['v2-indicator-showcase__panel-meta-row']}>
          <dt>Placement</dt>
          <dd>{placement}</dd>
        </div>
        <div className={styles['v2-indicator-showcase__panel-meta-row']}>
          <dt>Visibility</dt>
          <dd>{visibility}</dd>
        </div>
        <div className={styles['v2-indicator-showcase__panel-meta-row']}>
          <dt>Vocabulary</dt>
          <dd>{vocabulary}</dd>
        </div>
        <div className={styles['v2-indicator-showcase__panel-meta-row']}>
          <dt>ARIA</dt>
          <dd>{ariaPattern}</dd>
        </div>
        <div className={styles['v2-indicator-showcase__panel-meta-row']}>
          <dt>Mobile</dt>
          <dd>{mobile}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function IndicatorShowcase({ store }: IndicatorShowcaseProps) {
  const channelName = store.focusChannel.displayName;
  const purpose = store.focusChannel.purpose;
  const memberCount = store.focusChannel.memberCount;

  return (
    <section
      className={styles['v2-indicator-showcase']}
      aria-label="Cross-surface lock-plus indicator showcase"
    >
      <header className={styles['v2-indicator-showcase__header']}>
        <h3 className={styles['v2-indicator-showcase__title']}>
          Indicator showcase · §3.19 / §3.22
        </h3>
        <p className={styles['v2-indicator-showcase__subtitle']}>
          The lock-plus primitive (OPEN-D winner) is the single visual token
          for the Discoverable Private Channel state. Plus glyph adds{' '}
          <strong>shape distinction</strong> beyond the standard private lock
          per WCAG 1.4.1. Vocabulary is locked to the single word{' '}
          <strong>&quot;Discoverable&quot;</strong> across every surface.
        </p>
      </header>

      <div className={styles['v2-indicator-showcase__grid']}>
        {/* #1 Browse Channels row */}
        <SurfacePanel
          number={1}
          surface="Browse Channels row"
          variant="Standard row"
          size="16px"
          placement="Row prefix, left of channel name"
          visibility="Always-visible"
          vocabulary="Discoverable"
          ariaPattern={`aria-label="Discoverable channel"`}
          mobile="360px: same placement; row wraps if needed"
        >
          <div className={styles['v2-indicator-showcase__demo-row']}>
            <LockPlus size={16} />
            <span className={styles['v2-indicator-showcase__demo-name']}>
              {channelName}
            </span>
            <span className={styles['v2-indicator-showcase__demo-meta']}>
              <Icon size="12" glyph={<AccountMultipleOutlineIcon />} />
              {memberCount}
            </span>
            <span className={styles['v2-indicator-showcase__demo-purpose']}>
              {purpose}
            </span>
          </div>
        </SurfacePanel>

        {/* #2 Channel switcher */}
        <SurfacePanel
          number={2}
          surface="Channel switcher (DPC subsection)"
          variant="Standard row"
          size="16px"
          placement={`Row prefix within "Channels you can request to join"`}
          visibility="Always-visible inside subsection"
          vocabulary="Discoverable (section heading is primary cue)"
          ariaPattern="Press Enter to request to join"
          mobile="360px: section preserved; CTA adapts to touch"
        >
          <div className={styles['v2-indicator-showcase__demo-panel']}>
            <span className={styles['v2-indicator-showcase__demo-section']}>
              Channels you can request to join
            </span>
            <div className={styles['v2-indicator-showcase__demo-row']}>
              <LockPlus size={16} />
              <span className={styles['v2-indicator-showcase__demo-name']}>
                regional-taskforce
              </span>
              <span className={styles['v2-indicator-showcase__demo-meta']}>
                47 members
              </span>
            </div>
          </div>
        </SurfacePanel>

        {/* #3 Channel header (member view) */}
        <SurfacePanel
          number={3}
          surface="Channel header (member view)"
          variant="Compact"
          size="12px"
          placement="Inline immediately right of channel name"
          visibility="Always-visible at 12px, low-emphasis foreground (KD-26)"
          vocabulary="Discoverable (in tooltip copy)"
          ariaPattern={`aria-label="This channel is discoverable..."`}
          mobile="360px: same 12px placement; tooltip on long-press"
        >
          <div className={styles['v2-indicator-showcase__demo-header']}>
            <span className={styles['v2-indicator-showcase__demo-channel']}>
              # {channelName}
            </span>
            <LockPlus size={12} />
            <span className={styles['v2-indicator-showcase__demo-headerchrome']}>
              · 3 pinned · 📞 · 👥 {memberCount}
            </span>
          </div>
        </SurfacePanel>

        {/* #4 LHS — explicit NO indicator */}
        <SurfacePanel
          number={4}
          surface="LHS sidebar (member view)"
          variant="NONE"
          size="—"
          placement="—"
          visibility="No DPC indicator on LHS for members (KD-26 + §3.21)"
          vocabulary="—"
          ariaPattern="—"
          mobile="—"
        >
          <div className={styles['v2-indicator-showcase__demo-empty']}>
            <LabelTag
              label="No indicator"
              type="Default"
              size="X-Small"
              casing="Title Case"
            />
            <p className={styles['v2-indicator-showcase__demo-empty-body']}>
              LHS density does not support an additional always-visible badge
              per channel (Research Brief §4-bis.2). State-descriptive signals
              belong on the channel header (#3), not the navigation surface.
              The pending-request approver dot (FR-25 surface b) remains on
              the LHS — different semantics, no collision.
            </p>
          </div>
        </SurfacePanel>

        {/* #5 Channel Settings → Info tab */}
        <SurfacePanel
          number={5}
          surface="Channel Settings → Info tab"
          variant="Settings-context"
          size="18-20px"
          placement="Adjacent to the Discoverable toggle label"
          visibility="Always-visible alongside the toggle"
          vocabulary={`Discoverable (toggle label uses this word)`}
          ariaPattern={`Toggle role="switch" with aria-checked; icon aria-hidden`}
          mobile="n/a — admin/configuration surface (web-only)"
        >
          <div className={styles['v2-indicator-showcase__demo-settings']}>
            <div className={styles['v2-indicator-showcase__demo-settings-label']}>
              <LockPlus size={20} />
              <span>Discoverable</span>
            </div>
            <Switch checked readOnly aria-label="Discoverable" />
          </div>
        </SurfacePanel>

        {/* #6 Permalink unfurl card */}
        <SurfacePanel
          number={6}
          surface="Permalink unfurl card"
          variant={`Standard + "Discoverable" text label`}
          size="16px"
          placement="Card prefix, top-left, before channel name"
          visibility="Always-visible"
          vocabulary={`"Discoverable private channel" (fuller phrase)`}
          ariaPattern={`role="article" with aria-labelledby to card title`}
          mobile="360px: card renders full-width (end-user, mobile-parallel)"
        >
          <div className={styles['v2-indicator-showcase__demo-card']}>
            <div className={styles['v2-indicator-showcase__demo-cardhead']}>
              <LockPlus size={16} />
              <span>Discoverable</span>
            </div>
            <strong className={styles['v2-indicator-showcase__demo-cardname']}>
              #{channelName}
            </strong>
            <span className={styles['v2-indicator-showcase__demo-meta']}>
              {memberCount} members
            </span>
          </div>
        </SurfacePanel>

        {/* #7 In-channel admin sys msg */}
        <SurfacePanel
          number={7}
          surface="In-channel admin system message"
          variant="Compact, inline emoji-style"
          size="12px"
          placement={`Inline in copy, preceding the word "Discoverable"`}
          visibility="Always-visible (part of message content)"
          vocabulary="Discoverable (directly in message text)"
          ariaPattern={`Icon aria-hidden (word "Discoverable" follows in text)`}
          mobile="360px: same inline rendering; KD-29 mobile-parallel"
        >
          <div className={styles['v2-indicator-showcase__demo-sysmsg']}>
            <span>
              @alex.requester has requested to join this&nbsp;
            </span>
            <LockPlus size={12} />
            <span>&nbsp;Discoverable channel.</span>
          </div>
        </SurfacePanel>
      </div>

      <section
        className={styles['v2-indicator-showcase__matrix']}
        aria-label="§3.22 cross-surface consistency matrix"
      >
        <h4 className={styles['v2-indicator-showcase__matrix-title']}>
          §3.22 cross-surface consistency matrix (LOAD-BEARING)
        </h4>
        <p className={styles['v2-indicator-showcase__matrix-note']}>
          The single source-of-truth for indicator application across all
          surfaces. Phase 6 prototyping and Phase 7 spec writing both consume
          this table as authoritative.
        </p>
        <div className={styles['v2-indicator-showcase__matrix-table-wrap']}>
          <table className={styles['v2-indicator-showcase__matrix-table']}>
            <thead>
              <tr>
                <th>#</th>
                <th>Surface</th>
                <th>Size</th>
                <th>Placement</th>
                <th>Visibility</th>
                <th>Vocab</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Browse Channels row</td>
                <td>16px</td>
                <td>Row prefix, left of channel name</td>
                <td>Always-visible</td>
                <td>Discoverable</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Channel switcher (DPC subsection)</td>
                <td>16px</td>
                <td>Row prefix within DPC section</td>
                <td>Always-visible inside subsection</td>
                <td>Discoverable</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Channel header (member view)</td>
                <td>12px</td>
                <td>Inline right of channel name</td>
                <td>Always-visible, low-emphasis</td>
                <td>Discoverable (in tooltip)</td>
              </tr>
              <tr>
                <td>4</td>
                <td>LHS sidebar (member view)</td>
                <td>—</td>
                <td>—</td>
                <td>
                  <strong>NONE</strong> — KD-26 + §3.21
                </td>
                <td>—</td>
              </tr>
              <tr>
                <td>5</td>
                <td>Channel Settings → Info tab</td>
                <td>18-20px</td>
                <td>Adjacent to Discoverable toggle</td>
                <td>Always-visible</td>
                <td>Discoverable</td>
              </tr>
              <tr>
                <td>6</td>
                <td>Permalink unfurl card</td>
                <td>16px + label</td>
                <td>Card prefix, top-left</td>
                <td>Always-visible</td>
                <td>Discoverable private channel</td>
              </tr>
              <tr>
                <td>7</td>
                <td>In-channel admin sys message</td>
                <td>12px inline</td>
                <td>Inline before &quot;Discoverable&quot; in copy</td>
                <td>Always-visible (message content)</td>
                <td>Discoverable</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
