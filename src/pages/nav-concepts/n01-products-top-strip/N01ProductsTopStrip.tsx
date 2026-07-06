import { useMemo, useState } from 'react';
import ClassificationBanner from '../_shared/ClassificationBanner';
import { TEAMS, getTeam, PRODUCT_LIST, type ProductId } from '../_shared/teamData';
import ProductSidebar, { type SelectedResource } from '../_views/ProductSidebar';
import ViewStub from '../_views/ViewStub';
import ChannelWithTabs from '../_views/ChannelWithTabs';
import NavigationMap from '../_views/NavigationMap';
import { CLASSIFICATION_META } from '../_shared/types';
import styles from './N01ProductsTopStrip.module.scss';

/**
 * N01 — Products Top Strip (Product-First)
 *
 * Products are presented as a horizontal tab strip at the top of the app,
 * directly below the classification banner. Team selector is a dropdown at
 * the far left of the strip. Body is just LHS + Center (no team rail).
 */
export default function N01ProductsTopStrip() {
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
    // Reset selection to first channel of new team
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
    // Land on the product's default destination
    const first = p === 'channels' ? team.channels[0]
      : p === 'pages' ? { id: 'pages-recent', name: 'Recent' }
      : p === 'agents' ? { id: 'agents-explore', name: 'Explore' }
      : { id: 'runs-all', name: 'Runs' };
    setSel({
      productId: p,
      resourceId: first.id,
      viewId: p === 'channels' ? 'channel' : p === 'pages' ? 'pages-recents' : p === 'agents' ? 'agents-explore' : 'playbooks-runs',
      resourceName: first.name,
    });
  };

  return (
    <div className={styles['n01']}>
      <ClassificationBanner classification={team.classification} />
      <div className={styles['n01__top-bar']}>
        <div className={styles['n01__team-dropdown']}>
          <button
            type="button"
            className={styles['n01__team-button']}
            onClick={() => setTeamMenuOpen((o) => !o)}
          >
            <span className={styles['n01__team-cls']} style={{ background: teamCls.color }}>{teamCls.abbrev}</span>
            <span className={styles['n01__team-name']}>{team.name}</span>
            <span className={styles['n01__team-caret']}>▾</span>
          </button>
          {teamMenuOpen ? (
            <div className={styles['n01__team-menu']}>
              {TEAMS.map((t) => {
                const c = CLASSIFICATION_META[t.classification];
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={[styles['n01__team-menu-item'], t.id === teamId ? styles['n01__team-menu-item--active'] : ''].join(' ')}
                    onClick={() => switchTeam(t.id)}
                  >
                    <span className={styles['n01__team-cls']} style={{ background: c.color }}>{c.abbrev}</span>
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <nav className={styles['n01__products']}>
          {PRODUCT_LIST.map((p) => (
            <button
              key={p.id}
              type="button"
              className={[styles['n01__product'], productId === p.id ? styles['n01__product--active'] : ''].join(' ')}
              onClick={() => switchProduct(p.id)}
            >
              <span className={styles['n01__product-glyph']}>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles['n01__utilities']}>
          <div className={styles['n01__search']}>
            <span>⌕</span> Search · ⌘K
          </div>
          <span className={styles['n01__icon']}>@</span>
          <span className={styles['n01__icon']}>🔖</span>
          <span className={styles['n01__icon']}>⚙</span>
          <span className={styles['n01__avatar']}>👤</span>
        </div>
      </div>

      <div className={styles['n01__body']}>
        <aside className={styles['n01__lhs']}>
          <ProductSidebar team={team} productId={productId} activeResourceId={sel.resourceId} onSelect={setSel} hideTeamHeader />
        </aside>
        <main className={styles['n01__center']}>
          {sel.viewId === 'channel' && activeChannel ? (
            <ChannelWithTabs channel={activeChannel} teamClassification={team.classification} />
          ) : (
            <ViewStub viewId={sel.viewId} classification={sel.classification ?? team.classification} resourceName={sel.resourceName} />
          )}
        </main>
      </div>

      <NavigationMap conceptLabel="N01 · Products Top Strip" steps={NAV_STEPS} />
    </div>
  );
}

const NAV_STEPS = [
  { view: 'Channel', step: 'Default landing — Channels product selected; click any channel in LHS' },
  { view: 'Channel + Tab (Page)', step: 'Click UX Design or 1389 Project Avalanche → click a linked tab at top of the channel' },
  { view: 'Threads', step: 'Click 🧵 Threads at the top of the channels LHS' },
  { view: 'DM', step: 'Click @ Alex Tao (or any DM) in DIRECT MESSAGES section of LHS' },
  { view: 'Pages Recents', step: 'Click 📄 Pages in the top product strip (lands on Recent)' },
  { view: 'Page comments', step: 'In Pages, click 💬 Page comments in LHS' },
  { view: 'Page View', step: 'In Pages, click a wiki in WIKIS section of LHS' },
  { view: 'Agents Explore', step: 'Click ✨ Agents in the top product strip (lands on Explore)' },
  { view: 'Agent Edit', step: 'In Agents, click any agent in YOUR AGENTS — or "+ New agent"' },
  { view: 'Playbooks Runs', step: 'Click 📋 Playbooks in the top product strip (lands on All runs)' },
  { view: 'Run Detail', step: 'In Playbooks, click any run in ACTIVE RUNS section' },
  { view: 'Playbook Detail', step: 'In Playbooks, click any template in PLAYBOOKS section' },
  { view: 'Switch team', step: 'Click the team chip at far left of the product strip → pick a different team' },
];
