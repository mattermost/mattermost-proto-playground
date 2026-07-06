import { useMemo, useState } from 'react';
import ClassificationBanner from '../_shared/ClassificationBanner';
import { TEAMS, getTeam, PRODUCT_LIST, type ProductId } from '../_shared/teamData';
import ProductSidebar, { type SelectedResource } from '../_views/ProductSidebar';
import ViewStub from '../_views/ViewStub';
import ChannelWithTabs from '../_views/ChannelWithTabs';
import NavigationMap from '../_views/NavigationMap';
import { CLASSIFICATION_META } from '../_shared/types';
import styles from './N04CompactTeam.module.scss';

/**
 * N04 — Compact Team (Team-First, minimal team chrome)
 *
 * Team selector lives in a top-left dropdown only — no left strip. Products
 * are inline tabs in the Global Header. Reclaims the 62px team strip width
 * for content. Good for single-team users; one click for multi-team users.
 */
export default function N04CompactTeam() {
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
    <div className={styles['n04']}>
      <ClassificationBanner classification={team.classification} />
      <div className={styles['n04__global-header']}>
        <div className={styles['n04__team-dropdown']}>
          <button
            type="button"
            className={styles['n04__team-button']}
            onClick={() => setTeamMenuOpen((o) => !o)}
          >
            <span className={styles['n04__team-cls']} style={{ background: teamCls.color }}>{teamCls.abbrev}</span>
            <span className={styles['n04__team-name']}>{team.name}</span>
            <span className={styles['n04__caret']}>▾</span>
          </button>
          {teamMenuOpen ? (
            <div className={styles['n04__team-menu']}>
              {TEAMS.map((t) => {
                const c = CLASSIFICATION_META[t.classification];
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={[styles['n04__team-menu-item'], t.id === teamId ? styles['n04__team-menu-item--active'] : ''].join(' ')}
                    onClick={() => switchTeam(t.id)}
                  >
                    <span className={styles['n04__team-cls']} style={{ background: c.color }}>{c.abbrev}</span>
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <nav className={styles['n04__products']}>
          {PRODUCT_LIST.map((p) => (
            <button
              key={p.id}
              type="button"
              className={[styles['n04__product'], productId === p.id ? styles['n04__product--active'] : ''].join(' ')}
              onClick={() => switchProduct(p.id)}
            >
              <span className={styles['n04__product-glyph']}>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles['n04__search']}>
          <span>⌕</span> Search · ⌘K
        </div>

        <div className={styles['n04__utilities']}>
          <span className={styles['n04__icon']}>@</span>
          <span className={styles['n04__icon']}>🔖</span>
          <span className={styles['n04__icon']}>⚙</span>
          <span className={styles['n04__avatar']}>👤</span>
        </div>
      </div>

      <div className={styles['n04__body']}>
        <aside className={styles['n04__lhs']}>
          <ProductSidebar team={team} productId={productId} activeResourceId={sel.resourceId} onSelect={setSel} hideTeamHeader />
        </aside>
        <main className={styles['n04__center']}>
          {sel.viewId === 'channel' && activeChannel ? (
            <ChannelWithTabs channel={activeChannel} teamClassification={team.classification} />
          ) : (
            <ViewStub viewId={sel.viewId} classification={sel.classification ?? team.classification} resourceName={sel.resourceName} />
          )}
        </main>
      </div>

      <NavigationMap conceptLabel="N04 · Compact Team" steps={NAV_STEPS} />
    </div>
  );
}

const NAV_STEPS = [
  { view: 'Channel', step: 'Default landing — Channels tab active in header; click any channel in LHS' },
  { view: 'Channel + Tab', step: 'Click UX Design / Project Avalanche, then click a linked tab at top of the channel' },
  { view: 'Threads', step: 'Click 🧵 Threads at top of LHS' },
  { view: 'DM', step: 'Click @ Alex Tao in DIRECT MESSAGES of LHS' },
  { view: 'Pages Recents', step: 'Click 📄 Pages in Global Header product tabs (lands on Recent)' },
  { view: 'Page comments', step: 'In Pages, click 💬 Page comments in LHS' },
  { view: 'Page View', step: 'In Pages, click a wiki in WIKIS list' },
  { view: 'Agents Explore', step: 'Click ✨ Agents in Global Header product tabs' },
  { view: 'Agent Edit', step: 'In Agents, click an agent or "+ New agent"' },
  { view: 'Playbooks Runs', step: 'Click 📋 Playbooks in Global Header product tabs' },
  { view: 'Run Detail', step: 'In Playbooks, click a run in ACTIVE RUNS' },
  { view: 'Playbook Detail', step: 'In Playbooks, click a template in PLAYBOOKS section' },
  { view: 'Switch team', step: 'Click team chip at top-left of Global Header → pick another team' },
];
