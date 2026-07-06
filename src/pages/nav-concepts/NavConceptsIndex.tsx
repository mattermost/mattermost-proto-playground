import { Link } from 'react-router-dom';
import styles from './NavConceptsIndex.module.scss';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

interface ConceptCard {
  id: string;
  num: string;
  name: string;
  tagline: string;
  kind: 'PF' | 'TF' | 'HYBRID';
  productNav: string;
  teamNav: string;
  href: string;
}

const CONCEPTS: ConceptCard[] = [
  {
    id: 'n01',
    num: '01',
    name: 'Products Top Strip',
    tagline: 'Products as horizontal tabs at the top. Team picker is a dropdown at far-left of the strip.',
    kind: 'PF',
    productNav: 'Horizontal tabs (top strip)',
    teamNav: 'Header dropdown',
    href: `${BASE}/prototypes/nav-concepts/n01-products-top-strip`,
  },
  {
    id: 'n02',
    num: '02',
    name: 'Products Left Rail',
    tagline: 'VS Code Activity Bar pattern — products as a vertical icon rail. Team dropdown in Global Header.',
    kind: 'PF',
    productNav: 'Vertical icon rail (left)',
    teamNav: 'Header dropdown',
    href: `${BASE}/prototypes/nav-concepts/n02-products-left-rail`,
  },
  {
    id: 'n03',
    num: '03',
    name: 'Classic Team Strip',
    tagline: 'Persistent team icon strip on the left. Product Switcher dropdown in Global Header. Closest to today.',
    kind: 'TF',
    productNav: 'Header dropdown',
    teamNav: 'Persistent left strip',
    href: `${BASE}/prototypes/nav-concepts/n03-classic-team-strip`,
  },
  {
    id: 'n04',
    num: '04',
    name: 'Compact Team',
    tagline: 'Team in a top-left dropdown only. Products as inline tabs in Global Header. Reclaims the team-strip width.',
    kind: 'TF',
    productNav: 'Inline tabs in Global Header',
    teamNav: 'Header dropdown (top-left)',
    href: `${BASE}/prototypes/nav-concepts/n04-compact-team`,
  },
  {
    id: 'n05',
    num: '05',
    name: 'Channel-Centric Hybrid',
    tagline: 'Channels LHS is always-on. Other products accessed via mini launcher at the bottom of the LHS. Lean into channel-linked tabs.',
    kind: 'HYBRID',
    productNav: 'Mini launcher (LHS footer)',
    teamNav: 'Persistent left strip',
    href: `${BASE}/prototypes/nav-concepts/n05-channel-centric`,
  },
];

export default function NavConceptsIndex() {
  return (
    <div className={styles['idx']}>
      <header className={styles['idx__header']}>
        <span className={styles['idx__kicker']}>Mattermost Global Navigation Redesign · Exploration</span>
        <h1 className={styles['idx__title']}>Five navigation concepts on a locked architecture.</h1>
        <p className={styles['idx__lede']}>
          All five share the same Team → Product → Resource model. Teams carry a classification ceiling;
          resources are ≤ team class with a small badge only when below. Channels host other resources
          (Pages / Agents / Playbooks) as in-channel tabs. Concepts differ only in how the top-level
          team and product navigation is presented.
        </p>
      </header>

      <section className={styles['idx__principles']}>
        <h2 className={styles['idx__principles-title']}>Shared architecture</h2>
        <ul>
          <li>Full-width <strong>classification banner</strong> at the top, color-coded for the current team</li>
          <li>Strict <strong>Team → Product → Resource</strong> hierarchy; resources never exceed team's classification</li>
          <li><strong>Channels host linked Pages/Agents/Playbooks as tabs</strong> at the top of the channel (Slack-canvas pattern)</li>
          <li>Standalone access to every product is always reachable in 1 click (mechanism varies per concept)</li>
          <li>All 12 Figma views reachable in every concept; click paths documented in the Navigation Map panel</li>
        </ul>
      </section>

      <section className={styles['idx__grid']}>
        {CONCEPTS.map((c) => (
          <Link
            key={c.id}
            to={c.href}
            className={[
              styles['idx__card'],
              c.kind === 'PF' ? styles['idx__card--pf']
                : c.kind === 'TF' ? styles['idx__card--tf']
                : styles['idx__card--hybrid'],
            ].join(' ')}
          >
            <div className={styles['idx__card-head']}>
              <span className={styles['idx__card-num']}>N{c.num}</span>
              <span
                className={[
                  styles['idx__card-kind'],
                  c.kind === 'PF' ? styles['idx__card-kind--pf']
                    : c.kind === 'TF' ? styles['idx__card-kind--tf']
                    : styles['idx__card-kind--hybrid'],
                ].join(' ')}
              >
                {c.kind === 'PF' ? 'Product-First' : c.kind === 'TF' ? 'Team-First' : 'Hybrid'}
              </span>
            </div>
            <h2 className={styles['idx__card-name']}>{c.name}</h2>
            <p className={styles['idx__card-tagline']}>{c.tagline}</p>
            <dl className={styles['idx__card-dl']}>
              <dt>Products</dt>
              <dd>{c.productNav}</dd>
              <dt>Teams</dt>
              <dd>{c.teamNav}</dd>
            </dl>
            <span className={styles['idx__card-cta']}>Open prototype →</span>
          </Link>
        ))}
      </section>

      <footer className={styles['idx__footer']}>
        <span className={styles['idx__footer-meta']}>
          Each prototype is fully wired — clicking team / product / resource updates the center pane.
          Toggle the bottom-right Navigation Map for step-by-step instructions per view.
          Switch between Contributors (CUI), Design (Unclass), and Security Ops (Secret) to feel
          the classification cascade.
        </span>
      </footer>
    </div>
  );
}
