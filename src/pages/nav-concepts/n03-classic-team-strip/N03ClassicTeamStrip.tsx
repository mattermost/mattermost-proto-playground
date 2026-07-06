import { useMemo, useState } from 'react';
import ClassificationBanner from '../_shared/ClassificationBanner';
import { TEAMS, getTeam, PRODUCT_LIST, type ProductId } from '../_shared/teamData';
import ProductSidebar, { type SelectedResource } from '../_views/ProductSidebar';
import ViewStub from '../_views/ViewStub';
import ChannelWithTabs from '../_views/ChannelWithTabs';
import NavigationMap from '../_views/NavigationMap';
import { CLASSIFICATION_META } from '../_shared/types';
import styles from './N03ClassicTeamStrip.module.scss';

/**
 * N03 — Classic Team Strip (Team-First, closest to today)
 *
 * Persistent team strip on the left (icons). Global Header shows the current
 * product label with a dropdown product-switcher. Per-product LHS within
 * the active team.
 */
export default function N03ClassicTeamStrip() {
  const [teamId, setTeamId] = useState<string>('contributors');
  const [productId, setProductId] = useState<ProductId>('channels');
  const [sel, setSel] = useState<SelectedResource>({
    productId: 'channels',
    resourceId: 'ch-ux-design',
    viewId: 'channel',
    resourceName: 'UX Design — Staff',
  });
  const [productMenuOpen, setProductMenuOpen] = useState(false);

  const team = getTeam(teamId);
  const activeChannel = useMemo(
    () => team.channels.find((c) => c.id === sel.resourceId),
    [team, sel.resourceId],
  );
  const activeProduct = PRODUCT_LIST.find((p) => p.id === productId)!;

  const switchTeam = (id: string) => {
    const t = getTeam(id);
    setTeamId(id);
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
    setProductMenuOpen(false);
    const defaults: Record<ProductId, SelectedResource> = {
      channels: { productId: 'channels', resourceId: team.channels[0].id, viewId: 'channel', resourceName: team.channels[0].name },
      pages: { productId: 'pages', resourceId: 'pages-recent', viewId: 'pages-recents', resourceName: 'Recent' },
      agents: { productId: 'agents', resourceId: 'agents-explore', viewId: 'agents-explore', resourceName: 'Explore' },
      playbooks: { productId: 'playbooks', resourceId: 'runs-all', viewId: 'playbooks-runs', resourceName: 'Runs' },
    };
    setSel(defaults[p]);
  };

  return (
    <div className={styles['n03']}>
      <ClassificationBanner classification={team.classification} />
      <div className={styles['n03__global-header']}>
        <div className={styles['n03__product-switcher']}>
          <button
            type="button"
            className={styles['n03__product-button']}
            onClick={() => setProductMenuOpen((o) => !o)}
          >
            <span className={styles['n03__product-icon']}>{activeProduct.icon}</span>
            <span className={styles['n03__product-name']}>{activeProduct.label}</span>
            <span className={styles['n03__caret']}>▾</span>
          </button>
          {productMenuOpen ? (
            <div className={styles['n03__product-menu']}>
              {PRODUCT_LIST.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={[styles['n03__product-menu-item'], productId === p.id ? styles['n03__product-menu-item--active'] : ''].join(' ')}
                  onClick={() => switchProduct(p.id)}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles['n03__nav-arrows']}>
          <button type="button">←</button>
          <button type="button">→</button>
        </div>

        <div className={styles['n03__search']}>
          <span>⌕</span> Search across everything · ⌘K
        </div>

        <div className={styles['n03__utilities']}>
          <span className={styles['n03__icon']}>@</span>
          <span className={styles['n03__icon']}>🔖</span>
          <span className={styles['n03__icon']}>⚙</span>
          <span className={styles['n03__avatar']}>👤</span>
        </div>
      </div>

      <div className={styles['n03__body']}>
        <aside className={styles['n03__team-strip']}>
          {TEAMS.map((t) => {
            const c = CLASSIFICATION_META[t.classification];
            return (
              <button
                key={t.id}
                type="button"
                className={[styles['n03__team-icon'], t.id === teamId ? styles['n03__team-icon--active'] : ''].join(' ')}
                onClick={() => switchTeam(t.id)}
                title={`${t.name} · ${c.label}`}
              >
                <span className={styles['n03__team-letters']}>{t.initials ?? t.name.slice(0, 2)}</span>
                <span className={styles['n03__team-cls-dot']} style={{ background: c.color }} />
                {t.unread ? <span className={styles['n03__team-unread']} /> : null}
                {t.mentions ? <span className={styles['n03__team-mentions']}>{t.mentions}</span> : null}
              </button>
            );
          })}
          <button type="button" className={styles['n03__team-add']}>+</button>
        </aside>

        <aside className={styles['n03__lhs']}>
          <ProductSidebar
            team={team}
            productId={productId}
            activeResourceId={sel.resourceId}
            onSelect={setSel}
          />
        </aside>

        <main className={styles['n03__center']}>
          {sel.viewId === 'channel' && activeChannel ? (
            <ChannelWithTabs channel={activeChannel} teamClassification={team.classification} />
          ) : (
            <ViewStub viewId={sel.viewId} classification={sel.classification ?? team.classification} resourceName={sel.resourceName} />
          )}
        </main>
      </div>

      <NavigationMap conceptLabel="N03 · Classic Team Strip" steps={NAV_STEPS} />
    </div>
  );
}

const NAV_STEPS = [
  { view: 'Channel', step: 'Default landing — Channels product, click any channel in LHS' },
  { view: 'Channel + Tab', step: 'Click UX Design / Project Avalanche, then click a linked tab at top of channel' },
  { view: 'Threads', step: 'Click 🧵 Threads at top of Channels LHS' },
  { view: 'DM', step: 'Click @ Alex Tao (or any DM) in DIRECT MESSAGES of LHS' },
  { view: 'Pages Recents', step: 'Click product switcher in Global Header → select Pages' },
  { view: 'Page comments', step: 'In Pages, click 💬 Page comments in LHS' },
  { view: 'Page View', step: 'In Pages, click a wiki in WIKIS list' },
  { view: 'Agents Explore', step: 'Click product switcher → Agents (lands on Explore)' },
  { view: 'Agent Edit', step: 'In Agents, click an agent or "+ New agent"' },
  { view: 'Playbooks Runs', step: 'Click product switcher → Playbooks' },
  { view: 'Run Detail', step: 'In Playbooks, click a run in ACTIVE RUNS' },
  { view: 'Playbook Detail', step: 'In Playbooks, click a template in PLAYBOOKS section' },
  { view: 'Switch team', step: 'Click another team avatar in left team strip' },
];
