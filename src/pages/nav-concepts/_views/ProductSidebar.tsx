/**
 * Per-product LHS, shared across all nav concepts.
 *
 * Renders the appropriate resource list for the active product within the
 * active team. Same component, four different render modes:
 *   - channels: Threads / Drafts / Favorites / Channels / DMs
 *   - pages:    Recent / Page comments / Favorites / All wikis
 *   - agents:   Explore / Your agents
 *   - playbooks: Favorites / Runs / Playbooks
 */
import { CLASSIFICATION_META, type Classification } from '../_shared/types';
import type { ProductId, Team } from '../_shared/teamData';
import type { ViewId } from './ViewStub';
import styles from './ProductSidebar.module.scss';

export interface SelectedResource {
  productId: ProductId;
  resourceId: string;
  viewId: ViewId;
  resourceName: string;
  classification?: Classification;
  /** Optional channel-host marker for opening pages/runs that live in a channel */
  channelHostId?: string;
}

interface ProductSidebarProps {
  team: Team;
  productId: ProductId;
  activeResourceId?: string;
  onSelect: (sel: SelectedResource) => void;
  /** Hide the team-name header (when team identity is shown elsewhere). */
  hideTeamHeader?: boolean;
}

export default function ProductSidebar({
  team,
  productId,
  activeResourceId,
  onSelect,
  hideTeamHeader = false,
}: ProductSidebarProps) {
  const teamCls = CLASSIFICATION_META[team.classification];

  return (
    <div className={styles['ps']}>
      {!hideTeamHeader ? (
        <div className={styles['ps__team-header']}>
          <span className={styles['ps__team-name']}>{team.name}</span>
          <span className={styles['ps__team-cls']} style={{ background: teamCls.color }}>
            {teamCls.abbrev}
          </span>
        </div>
      ) : null}
      <div className={styles['ps__search']}>
        <span className={styles['ps__search-icon']}>⌕</span>
        <span className={styles['ps__search-placeholder']}>
          Find in {productId}… (⌘K for everywhere)
        </span>
      </div>

      {productId === 'channels' ? <ChannelsLhs team={team} activeId={activeResourceId} onSelect={onSelect} /> : null}
      {productId === 'pages' ? <PagesLhs team={team} activeId={activeResourceId} onSelect={onSelect} /> : null}
      {productId === 'agents' ? <AgentsLhs team={team} activeId={activeResourceId} onSelect={onSelect} /> : null}
      {productId === 'playbooks' ? <PlaybooksLhs team={team} activeId={activeResourceId} onSelect={onSelect} /> : null}
    </div>
  );
}

// ─── Per-product LHS contents ──────────────────────────────────────────────

function ChannelsLhs({ team, activeId, onSelect }: { team: Team; activeId?: string; onSelect: (sel: SelectedResource) => void }) {
  const favs = team.channels.filter((c) => (team.favoriteChannelIds ?? []).includes(c.id));
  const rest = team.channels.filter((c) => !(team.favoriteChannelIds ?? []).includes(c.id));
  const tcls = team.classification;

  const channelItem = (c: typeof team.channels[number]) => (
    <Item
      key={c.id}
      active={activeId === c.id}
      onClick={() => onSelect({ productId: 'channels', resourceId: c.id, viewId: 'channel', resourceName: c.name, classification: c.classification ?? tcls })}
      glyph="#"
      label={c.name}
      badge={c.linkedTabs && c.linkedTabs.length > 0 ? `${c.linkedTabs.length} tabs` : undefined}
      cls={c.classification && c.classification !== tcls ? c.classification : undefined}
    />
  );

  return (
    <>
      <div className={styles['ps__list']}>
        <Item
          active={activeId === 'inbox-threads'}
          onClick={() => onSelect({ productId: 'channels', resourceId: 'inbox-threads', viewId: 'threads', resourceName: 'All your threads' })}
          glyph="🧵"
          label="Threads"
        />
        <Item glyph="📝" label="Drafts" />
      </div>
      {favs.length > 0 ? (
        <>
          <Section>FAVORITES</Section>
          <div className={styles['ps__list']}>{favs.map(channelItem)}</div>
        </>
      ) : null}
      <Section>CHANNELS</Section>
      <div className={styles['ps__list']}>{rest.map(channelItem)}</div>
      {team.dms.length > 0 ? (
        <>
          <Section>DIRECT MESSAGES</Section>
          <div className={styles['ps__list']}>
            {team.dms.map((d) => (
              <Item
                key={d.id}
                active={activeId === d.id}
                onClick={() => onSelect({ productId: 'channels', resourceId: d.id, viewId: 'dm', resourceName: d.name })}
                glyph="@"
                label={d.name}
                presence={d.presence}
              />
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}

function PagesLhs({ team, activeId, onSelect }: { team: Team; activeId?: string; onSelect: (sel: SelectedResource) => void }) {
  return (
    <>
      <div className={styles['ps__list']}>
        <Item
          active={activeId === 'pages-recent'}
          onClick={() => onSelect({ productId: 'pages', resourceId: 'pages-recent', viewId: 'pages-recents', resourceName: 'Recent' })}
          glyph="🕒"
          label="Recent"
        />
        <Item
          active={activeId === 'pages-comments'}
          onClick={() => onSelect({ productId: 'pages', resourceId: 'pages-comments', viewId: 'pages-comments', resourceName: 'Page comments' })}
          glyph="💬"
          label="Page comments"
        />
      </div>
      <Section>WIKIS</Section>
      <div className={styles['ps__list']}>
        {team.pages.map((p) => (
          <Item
            key={p.id}
            active={activeId === p.id}
            onClick={() => onSelect({ productId: 'pages', resourceId: p.id, viewId: 'page-view', resourceName: p.name, classification: p.classification, channelHostId: p.channelHostId })}
            glyph="📄"
            label={p.name}
            cls={p.classification && p.classification !== team.classification ? p.classification : undefined}
          />
        ))}
      </div>
    </>
  );
}

function AgentsLhs({ team, activeId, onSelect }: { team: Team; activeId?: string; onSelect: (sel: SelectedResource) => void }) {
  return (
    <>
      <div className={styles['ps__list']}>
        <Item
          active={activeId === 'agents-explore'}
          onClick={() => onSelect({ productId: 'agents', resourceId: 'agents-explore', viewId: 'agents-explore', resourceName: 'Explore' })}
          glyph="🌐"
          label="Explore"
          badge="1"
        />
      </div>
      <Section>YOUR AGENTS</Section>
      <div className={styles['ps__list']}>
        {team.agents.map((a) => (
          <Item
            key={a.id}
            active={activeId === a.id}
            onClick={() => onSelect({ productId: 'agents', resourceId: a.id, viewId: 'agents-edit', resourceName: a.name, classification: a.classification })}
            glyph="✨"
            label={a.name}
            cls={a.classification && a.classification !== team.classification ? a.classification : undefined}
          />
        ))}
        <Item
          active={activeId === 'agents-new'}
          onClick={() => onSelect({ productId: 'agents', resourceId: 'agents-new', viewId: 'agents-edit', resourceName: 'New Agent' })}
          glyph="+"
          label="New agent"
        />
      </div>
    </>
  );
}

function PlaybooksLhs({ team, activeId, onSelect }: { team: Team; activeId?: string; onSelect: (sel: SelectedResource) => void }) {
  return (
    <>
      <div className={styles['ps__list']}>
        <Item
          active={activeId === 'runs-all'}
          onClick={() => onSelect({ productId: 'playbooks', resourceId: 'runs-all', viewId: 'playbooks-runs', resourceName: 'Runs' })}
          glyph="📥"
          label="All runs"
        />
      </div>
      <Section>ACTIVE RUNS</Section>
      <div className={styles['ps__list']}>
        {team.runs.filter((r) => r.status === 'in-progress').map((r) => (
          <Item
            key={r.id}
            active={activeId === r.id}
            onClick={() => onSelect({ productId: 'playbooks', resourceId: r.id, viewId: 'playbooks-run-detail', resourceName: r.name, classification: r.classification, channelHostId: r.channelHostId })}
            glyph="▶"
            label={r.name}
            cls={r.classification && r.classification !== team.classification ? r.classification : undefined}
          />
        ))}
      </div>
      <Section>PLAYBOOKS</Section>
      <div className={styles['ps__list']}>
        {team.playbooks.map((p) => (
          <Item
            key={p.id}
            active={activeId === p.id}
            onClick={() => onSelect({ productId: 'playbooks', resourceId: p.id, viewId: 'playbooks-playbook-detail', resourceName: p.name, classification: p.classification })}
            glyph="📋"
            label={p.name}
            cls={p.classification && p.classification !== team.classification ? p.classification : undefined}
          />
        ))}
      </div>
    </>
  );
}

// ─── Atom: Item / Section ──────────────────────────────────────────────────

interface ItemProps {
  glyph?: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string;
  presence?: 'online' | 'away' | 'offline';
  cls?: Classification;
}

function Item({ glyph, label, active, onClick, badge, presence, cls }: ItemProps) {
  const presenceColor =
    presence === 'online' ? 'var(--color-success)' :
    presence === 'away' ? 'var(--color-warning)' :
    'rgba(255,255,255,0.32)';
  const clsMeta = cls ? CLASSIFICATION_META[cls] : null;
  return (
    <button
      type="button"
      className={[styles['ps__item'], active ? styles['ps__item--active'] : ''].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      {glyph ? <span className={styles['ps__item-glyph']}>{glyph}</span> : null}
      <span className={styles['ps__item-label']}>{label}</span>
      {presence ? <span className={styles['ps__item-presence']} style={{ background: presenceColor }} /> : null}
      {clsMeta ? (
        <span className={styles['ps__item-cls']} style={{ background: `rgba(${clsMeta.rgb}, 0.20)`, color: clsMeta.color }}>
          {clsMeta.abbrev}
        </span>
      ) : null}
      {badge ? <span className={styles['ps__item-badge']}>{badge}</span> : null}
    </button>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className={styles['ps__section']}>{children}</div>;
}
