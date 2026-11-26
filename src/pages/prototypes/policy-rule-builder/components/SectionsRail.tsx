// [AI DRAFT] The Sections rail (designer mock, 2026-10-31): an in-page nav
// over the policy's cards, with "What this policy does" beneath it.
//
// The nav is the shipped AD/LDAP wizard pattern (ldap_wizard.tsx: "Sections"
// header, text-box-outline icon, active section highlighted). A section with
// an error says so beside its name. Warnings stay on the rules card, not here.
// The rail stays in view while the form scrolls, so the reading is beside
// whatever the admin is editing.
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import TextBoxOutlineIcon from '@mattermost/compass-icons/components/text-box-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { RAIL } from '../copy';
import styles from './SectionsRail.module.scss';

export interface RailSection {
  /** Matches the card's `data-prb-section`. */
  id: string;
  label: string;
  status?: { tone: 'danger' | 'warning'; label: string };
}

/** After a click, scroll events from the smooth scroll don't move the highlight. */
const CLICK_HOLD_MS = 800;

export default function SectionsRail({ sections, children }: { sections: RailSection[]; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(sections[0]?.id);
  const clickedAt = useRef(0);
  const ids = sections.map((s) => s.id).join(',');

  // The console's scroll region owns the page. The current section is the one
  // taking up most of the view, so a short page that can't scroll a section
  // to the top still marks what the admin is looking at.
  useEffect(() => {
    const scroller = ref.current?.closest<HTMLElement>('[data-prb-scroll]');
    if (!scroller) return undefined;
    const order = ids.split(',');
    const update = () => {
      if (Date.now() - clickedAt.current < CLICK_HOLD_MS) return;
      const view = scroller.getBoundingClientRect();
      let current = order[0];
      let most = 0;
      for (const id of order) {
        const box = scroller.querySelector(`[data-prb-section="${id}"]`)?.getBoundingClientRect();
        const seen = box ? Math.min(box.bottom, view.bottom) - Math.max(box.top, view.top) : 0;
        if (seen > most) {
          most = seen;
          current = id;
        }
      }
      setActive(current);
    };
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    return () => scroller.removeEventListener('scroll', update);
  }, [ids]);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const scroller = ref.current?.closest<HTMLElement>('[data-prb-scroll]');
    const section = scroller?.querySelector<HTMLElement>(`[data-prb-section="${id}"]`);
    if (!scroller || !section) return;
    event.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gutter = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
    scroller.scrollTo({
      top: section.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - gutter,
      behavior: reduce ? 'auto' : 'smooth',
    });
    // Keyboard and screen-reader users land on the section, not back at the nav.
    const heading = section.querySelector<HTMLElement>('h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    clickedAt.current = Date.now();
    setActive(id);
  };

  return (
    <div ref={ref} className={styles['sections-rail']}>
      <nav className={styles['sections-rail__nav']} aria-label={RAIL.navLabel}>
        <div className={styles['sections-rail__heading']}>
          <Icon glyph={<TextBoxOutlineIcon />} size="16" />
          {RAIL.heading}
        </div>
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#prb-${s.id}`}
            aria-current={s.id === active ? 'location' : undefined}
            className={[
              styles['sections-rail__item'],
              s.id === active ? styles['sections-rail__item--active'] : '',
            ].join(' ')}
            onClick={(e) => go(e, s.id)}
          >
            <span className={styles['sections-rail__label']}>{s.label}</span>
            {s.status ? (
              <span
                className={[
                  styles['sections-rail__status'],
                  styles[`sections-rail__status--${s.status.tone}`],
                ].join(' ')}
              >
                <Icon
                  glyph={s.status.tone === 'danger' ? <AlertCircleOutlineIcon /> : <AlertOutlineIcon />}
                  size="16"
                />
                <span className={styles['sections-rail__visually-hidden']}>, {s.status.label}</span>
              </span>
            ) : null}
          </a>
        ))}
      </nav>
      {children}
    </div>
  );
}
