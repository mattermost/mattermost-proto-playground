import { useMemo, useState } from 'react';
import ClassificationBanner from '../_shared/ClassificationBanner';
import { TEAMS, getTeam, PRODUCT_LIST, type ProductId } from '../_shared/teamData';
import ProductSidebar, { type SelectedResource } from '../_views/ProductSidebar';
import ViewStub from '../_views/ViewStub';
import ChannelWithTabs from '../_views/ChannelWithTabs';
import NavigationMap from '../_views/NavigationMap';
import { CLASSIFICATION_META } from '../_shared/types';
import styles from './N02ProductsLeftRail.module.scss';

/**
 * N02 — Products Left Rail (Product-First, VS Code-style)
 *
 * Products live as a vertical icon rail on the left. Team is a dropdown
 * in the Global Header. Each product owns its own LHS to the right of
 * the rail. Center renders the active resource.
 */
export default function N02ProductsLeftRail() {
  const [teamId, setTeamId] = useState<string>('contributors');
  const [productId, setProductId] = useState<ProductId>('channels');
  const [sel, setSel] = useState<SelectedResource>({
    productId: 'channels',
    resourceId: 'ch-ux-design',
    viewId: 'channel',
    resourceName: 'UX Design — Staff',
  });
  const [teamMenuOpen, setTeamMenuOpen] = useState(false);

  const team = getTeam(teamId);
  const teamCls = CLASSIFICATION_META[team.classification];
  const activeChannel = useMemo(
    () => team.channels.find((c) => c.id === sel.resourceId),
    [team, sel.resourceId],
  );

  const switchTeam = (id: string) => {
    const t = getTeam(id);
    setTeamId(id);
    setTeamMenuOpen(false);
    const firstCh = t.channels[0];
    setProductId('channels');
    setSel({
      productId: 'channels',
      resourceId: firstCh.id,
      viewId: 'channel',
      resourceName: firstCh.name,
      classification: firstCh.classification ?? t.classification,
    });
  };

  const switchProduct = (p: ProductId) => {
    setProductId(p);
    const defaults: Record<ProductId, SelectedResource> = {
      channels: { productId: 'channels', resourceId: team.channels[0].id, viewId: 'channel', resourceName: team.channels[0].name },
      pages: { productId: 'pages', resourceId: 'pages-recent', viewId: 'pages-recents', resourceName: 'Recent' },
      agents: { productId: 'agents', resourceId: 'agents-explore', viewId: 'agents-explore', resourceName: 'Explore' },
      playbooks: { productId: 'playbooks', resourceId: 'runs-all', viewId: 'playbooks-runs', resourceName: 'Runs' },
    };
    setSel(defaults[p]);
  };

  return (
    <div className={styles['n02']}>
      <ClassificationBanner classification={team.classification} />
      <div className={styles['n02__global-header']}>
        <div className={styles['n02__team-dropdown']}>
          <button
            type="button"
            className={styles['n02__team-button']}
            onClick={() => setTeamMenuOpen((o) => !o)}
          >
            <span className={styles['n02__team-cls']} style={{ background: teamCls.color }}>{teamCls.abbrev}</span>
            <span className={styles['n02__team-name']}>{team.name}</span>
            <span className={styles['n02__team-caret']}>▾</span>
          </button>
          {teamMenuOpen ? (
            <div className={styles['n02__team-menu']}>
              {TEAMS.map((t) => {
                const c = CLASSIFICATION_META[t.classification];
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={[styles['n02__team-menu-item'], t.id === teamId ? styles['n02__team-menu-item--active'] : ''].join(' ')}
                    onClick={() => switchTeam(t.id)}
                  >
                    <span className={styles['n02__team-cls']} style={{ background: c.color }}>{c.abbrev}</span>
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className={styles['n02__nav-arrows']}>
          <button type="button">←</button>
          <button type="button">→</button>
        </div>

        <div className={styles['n02__search']}>
          <span>⌕</span> Search across everything · ⌘K
        </div>

        <div className={styles['n02__utilities']}>
          <span className={styles['n02__icon']}>@</span>
          <span className={styles['n02__icon']}>🔖</span>
          <span className={styles['n02__icon']}>⚙</span>
          <span className={styles['n02__avatar']}>👤</span>
        </div>
      </div>

      <div className={styles['n02__body']}>
        <aside className={styles['n02__rail']}>
          {PRODUCT_LIST.map((p) => (
            <button
              key={p.id}
              type="button"
              className={[styles['n02__rail-item'], productId === p.id ? styles['n02__rail-item--active'] : ''].join(' ')}
              onClick={() => switchProduct(p.id)}
              title={p.label}
            >
              <span className={styles['n02__rail-icon']}>{p.icon}</span>
              <span className={styles['n02__rail-label']}>{p.label}</span>
            </button>
          ))}
        </aside>

        <aside className={styles['n02__lhs']}>
          <ProductSidebar team={team} productId={productId} activeResourceId={sel.resourceId} onSelect={setSel} hideTeamHeader />
        </aside>

        <main className={styles['n02__center']}>
          {sel.viewId === 'channel' && activeChannel ? (
            <ChannelWithTabs channel={activeChannel} teamClassification={team.classification} />
          ) : (
            <ViewStub viewId={sel.viewId} classification={sel.classification ?? team.classification} resourceName={sel.resourceName} />
          )}
        </main>
      </div>

      <NavigationMap conceptLabel="N02 · Products Left Rail" steps={NAV_STEPS} />
    </div>
  );
}

const NAV_STEPS = [
  { view: 'Channel', step: 'Default landing — Channels rail icon active; click a channel in LHS' },
  { view: 'Channel + Tab', step: 'Click UX Design / Project Avalanche, then a linked tab at top of channel' },
  { view: 'Threads', step: 'Click 🧵 Threads at top of LHS (within Channels)' },
  { view: 'DM', step: 'Click @ Alex Tao (or any DM) in DIRECT MESSAGES of LHS' },
  { view: 'Pages Recents', step: 'Click 📄 Pages in left rail (lands on Recent)' },
  { view: 'Page comments', step: 'In Pages, click 💬 Page comments in LHS' },
  { view: 'Page View', step: 'In Pages, click a wiki in WIKIS list' },
  { view: 'Agents Explore', step: 'Click ✨ Agents in left rail (lands on Explore)' },
  { view: 'Agent Edit', step: 'In Agents, click an agent name in YOUR AGENTS or "+ New agent"' },
  { view: 'Playbooks Runs', step: 'Click 📋 Playbooks in left rail (lands on Runs)' },
  { view: 'Run Detail', step: 'In Playbooks, click a run in ACTIVE RUNS' },
  { view: 'Playbook Detail', step: 'In Playbooks, click a template in PLAYBOOKS section' },
  { view: 'Switch team', step: 'Click team chip at top-left of Global Header' },
];
