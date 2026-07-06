import { useMemo, useState } from 'react';
import ClassificationBanner from '../_shared/ClassificationBanner';
import { TEAMS, getTeam, PRODUCT_LIST, type ProductId } from '../_shared/teamData';
import ProductSidebar, { type SelectedResource } from '../_views/ProductSidebar';
import ViewStub from '../_views/ViewStub';
import ChannelWithTabs from '../_views/ChannelWithTabs';
import NavigationMap from '../_views/NavigationMap';
import { CLASSIFICATION_META } from '../_shared/types';
import styles from './N05ChannelCentric.module.scss';

/**
 * N05 — Channel-Centric Hybrid
 *
 * Channels is the dominant product. The LHS defaults to Channels and most
 * cross-product work happens through channel-linked tabs (Pages, Agents,
 * Playbooks attached to specific channels). A mini product launcher at the
 * bottom of the LHS provides standalone access to other products when
 * needed — visually deprioritized but always 1 click away.
 */
export default function N05ChannelCentric() {
  const [teamId, setTeamId] = useState<string>('contributors');
  const [productId, setProductId] = useState<ProductId>('channels');
  const [sel, setSel] = useState<SelectedResource>({
    productId: 'channels',
    resourceId: 'ch-ux-design',
    viewId: 'channel',
    resourceName: 'UX Design — Staff',
  });

  const team = getTeam(teamId);
  const teamCls = CLASSIFICATION_META[team.classification];
  const activeChannel = useMemo(
    () => team.channels.find((c) => c.id === sel.resourceId),
    [team, sel.resourceId],
  );

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
    const defaults: Record<ProductId, SelectedResource> = {
      channels: { productId: 'channels', resourceId: team.channels[0].id, viewId: 'channel', resourceName: team.channels[0].name },
      pages: { productId: 'pages', resourceId: 'pages-recent', viewId: 'pages-recents', resourceName: 'Recent' },
      agents: { productId: 'agents', resourceId: 'agents-explore', viewId: 'agents-explore', resourceName: 'Explore' },
      playbooks: { productId: 'playbooks', resourceId: 'runs-all', viewId: 'playbooks-runs', resourceName: 'Runs' },
    };
    setSel(defaults[p]);
  };

  return (
    <div className={styles['n05']}>
      <ClassificationBanner classification={team.classification} />
      <div className={styles['n05__global-header']}>
        <div className={styles['n05__brand']}>
          <span className={styles['n05__brand-icon']}>💬</span>
          <span className={styles['n05__brand-name']}>Mattermost</span>
        </div>
        <div className={styles['n05__nav-arrows']}>
          <button type="button">←</button>
          <button type="button">→</button>
        </div>
        <div className={styles['n05__search']}>
          <span>⌕</span> Search across everything · ⌘K
        </div>
        <div className={styles['n05__utilities']}>
          <span className={styles['n05__icon']}>@</span>
          <span className={styles['n05__icon']}>🔖</span>
          <span className={styles['n05__icon']}>⚙</span>
          <span className={styles['n05__avatar']}>👤</span>
        </div>
      </div>

      <div className={styles['n05__body']}>
        <aside className={styles['n05__team-strip']}>
          {TEAMS.map((t) => {
            const c = CLASSIFICATION_META[t.classification];
            return (
              <button
                key={t.id}
                type="button"
                className={[styles['n05__team-icon'], t.id === teamId ? styles['n05__team-icon--active'] : ''].join(' ')}
                onClick={() => switchTeam(t.id)}
                title={`${t.name} · ${c.label}`}
              >
                <span>{t.initials ?? t.name.slice(0, 2)}</span>
                <span className={styles['n05__team-cls-dot']} style={{ background: c.color }} />
              </button>
            );
          })}
          <button type="button" className={styles['n05__team-add']}>+</button>
        </aside>

        <aside className={styles['n05__lhs']}>
          <div className={styles['n05__lhs-team']}>
            <span className={styles['n05__lhs-team-name']}>{team.name}</span>
            <span className={styles['n05__lhs-team-cls']} style={{ background: teamCls.color }}>{teamCls.abbrev}</span>
          </div>
          <div className={styles['n05__lhs-scroll']}>
            <ProductSidebar team={team} productId={productId} activeResourceId={sel.resourceId} onSelect={setSel} hideTeamHeader />
          </div>
          <div className={styles['n05__mini-products']}>
            <div className={styles['n05__mini-products-label']}>PRODUCTS</div>
            <div className={styles['n05__mini-products-row']}>
              {PRODUCT_LIST.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={[
                    styles['n05__mini-product'],
                    productId === p.id ? styles['n05__mini-product--active'] : '',
                  ].join(' ')}
                  onClick={() => switchProduct(p.id)}
                  title={p.label}
                >
                  <span className={styles['n05__mini-product-icon']}>{p.icon}</span>
                  <span className={styles['n05__mini-product-label']}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className={styles['n05__center']}>
          {sel.viewId === 'channel' && activeChannel ? (
            <ChannelWithTabs channel={activeChannel} teamClassification={team.classification} />
          ) : (
            <ViewStub viewId={sel.viewId} classification={sel.classification ?? team.classification} resourceName={sel.resourceName} />
          )}
        </main>
      </div>

      <NavigationMap conceptLabel="N05 · Channel-Centric Hybrid" steps={NAV_STEPS} />
    </div>
  );
}

const NAV_STEPS = [
  { view: 'Channel', step: 'Default landing — Channels LHS is always-on; click a channel' },
  { view: 'Channel + Tab', step: 'Click UX Design or 1389 Avalanche → click a linked tab at top (Page/Agent/Playbook attached to that channel)' },
  { view: 'Threads', step: 'Click 🧵 Threads at top of Channels LHS' },
  { view: 'DM', step: 'Click @ Alex Tao in DIRECT MESSAGES of LHS' },
  { view: 'Pages Recents', step: 'Click 📄 Pages in the MINI PRODUCTS strip at the bottom of the LHS' },
  { view: 'Page comments', step: 'Switch to Pages (mini strip) → click 💬 Page comments in LHS' },
  { view: 'Page View', step: 'Faster path: open a channel that has the page linked, then click its tab. Standalone: Pages → click a wiki' },
  { view: 'Agents Explore', step: 'Click ✨ Agents in the MINI PRODUCTS strip' },
  { view: 'Agent Edit', step: 'In Agents, click an agent name or "+ New agent"' },
  { view: 'Playbooks Runs', step: 'Click 📋 Playbooks in the MINI PRODUCTS strip' },
  { view: 'Run Detail', step: 'Faster path: open Project Avalanche channel → click v6.4 Server Release tab. Standalone: Playbooks → click a run' },
  { view: 'Playbook Detail', step: 'In Playbooks, click a template in PLAYBOOKS section' },
  { view: 'Switch team', step: 'Click another team avatar in left team strip' },
];
