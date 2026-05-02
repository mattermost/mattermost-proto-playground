import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './OnThisPage.module.scss';

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface OnThisPageProps {
  /**
   * Selector for the container that holds the rendered prose. The component
   * watches this container for DOM changes and updates the TOC reactively.
   * Defaults to `[data-doc-body]`.
   */
  containerSelector?: string;
}

function readHeadings(container: Element): Heading[] {
  const els = container.querySelectorAll<HTMLElement>('h2[id], h3[id]');
  const out: Heading[] = [];
  els.forEach((el) => {
    if (!el.id) return;
    out.push({
      id: el.id,
      text: (el.textContent ?? '').trim(),
      level: el.tagName === 'H2' ? 2 : 3,
    });
  });
  return out;
}

export default function OnThisPage({
  containerSelector = '[data-doc-body]',
}: OnThisPageProps) {
  const { pathname } = useLocation();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Watch the body container for DOM changes (lazy MDX may resolve after
  // initial mount). MutationObserver fires whenever a heading appears or
  // disappears, so we always reflect what's actually rendered.
  useEffect(() => {
    let cancelled = false;
    let mutationObserver: MutationObserver | null = null;

    const attach = () => {
      if (cancelled) return;
      const container = document.querySelector(containerSelector);
      if (!container) {
        // Body not in DOM yet (first paint). Try again next frame.
        window.requestAnimationFrame(attach);
        return;
      }

      const update = () => {
        if (cancelled) return;
        setHeadings(readHeadings(container));
      };

      update();
      mutationObserver = new MutationObserver(update);
      mutationObserver.observe(container, { childList: true, subtree: true });
    };

    setHeadings([]);
    setActiveId(null);
    attach();

    return () => {
      cancelled = true;
      mutationObserver?.disconnect();
    };
  }, [pathname, containerSelector]);

  // Track the heading currently in view.
  const headingsRef = useRef(headings);
  headingsRef.current = headings;

  useEffect(() => {
    if (headings.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        if (visible.size > 0) {
          // Pick the first heading (in document order) that's currently visible.
          const firstInOrder = headingsRef.current.find((h) =>
            visible.has(h.id),
          );
          if (firstInOrder) setActiveId(firstInOrder.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: [0, 1] },
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  // The page content scrolls inside an inner container, not the window —
  // so default anchor-click behaviour doesn't scroll there. Handle the click
  // ourselves with `scrollIntoView`.
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
    setActiveId(id);
  };

  if (headings.length === 0) return null;

  return (
    <nav className={styles['on-this-page']} aria-label="On this page">
      <p className={styles['on-this-page__eyebrow']}>On this page</p>
      <ul className={styles['on-this-page__list']}>
        {headings.map((h) => (
          <li
            key={h.id}
            className={[
              styles['on-this-page__item'],
              h.level === 3 ? styles['on-this-page__item--indent'] : '',
              h.id === activeId ? styles['on-this-page__item--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <a
              href={`#${h.id}`}
              className={styles['on-this-page__link']}
              onClick={(e) => handleClick(e, h.id)}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
