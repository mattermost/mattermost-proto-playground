import { useEffect, useRef, useState, type ReactNode } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';

import Icon from '@/components/ui/Icon/Icon';
import {
  readWalkthroughFocus,
  WALKTHROUGH_FOCUS_LABELS,
  WALKTHROUGH_FOCUS_ANNOTATIONS,
} from './walkthroughFocus';
import styles from './WalkthroughFocus.module.scss';

type CalloutPos = {
  top: number;
  left: number;
  placement: 'above' | 'below';
};

type CalloutMode = 'anchored' | 'docked' | 'dismissed';

const CALLOUT_WIDTH = 300;
const GAP = 12;
const ESTIMATED_HEIGHT = 150;
const INTERACTIVE_SELECTOR =
  'select, input, textarea, button, [role="option"], [role="combobox"], a[href]';

function isFieldInteraction(
  target: EventTarget | null,
  calloutEl: HTMLElement | null,
): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  if (calloutEl?.contains(target)) {
    return false;
  }
  return target.closest(INTERACTIVE_SELECTOR) != null;
}

export default function WalkthroughFocusProvider({
  children,
}: {
  children: ReactNode;
}) {
  const focus = readWalkthroughFocus();
  const label = focus != null ? WALKTHROUGH_FOCUS_LABELS[focus] : null;
  const annotation =
    focus != null ? WALKTHROUGH_FOCUS_ANNOTATIONS[focus] : undefined;
  const [pos, setPos] = useState<CalloutPos | null>(null);
  const [calloutMode, setCalloutMode] = useState<CalloutMode>('anchored');
  const calloutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCalloutMode('anchored');
  }, [focus]);

  useEffect(() => {
    if (focus == null) {
      return undefined;
    }

    let raf = 0;

    const target = () =>
      document.querySelector<HTMLElement>(`[data-tour-focus="${focus}"]`);

    const place = () => {
      if (calloutMode !== 'anchored') {
        return;
      }
      const el = target();
      if (el == null || annotation == null) {
        setPos(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      const width = Math.min(CALLOUT_WIDTH, window.innerWidth - GAP * 2);
      const left = Math.max(
        GAP,
        Math.min(rect.left, window.innerWidth - width - GAP),
      );
      const roomBelow = rect.bottom + GAP + ESTIMATED_HEIGHT <= window.innerHeight;
      setPos({
        placement: roomBelow ? 'below' : 'above',
        left,
        top: roomBelow ? rect.bottom + GAP : rect.top - GAP - ESTIMATED_HEIGHT,
      });
    };

    const timer = window.setTimeout(() => {
      const el = target();
      if (el != null) {
        el.setAttribute('data-tour-highlight', 'true');
        el.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
      place();
    }, 80);

    const reflow = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(place);
    };
    // capture:true so scrolls inside the editor's own scroll container reposition the callout
    window.addEventListener('scroll', reflow, true);
    window.addEventListener('resize', reflow);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', reflow, true);
      window.removeEventListener('resize', reflow);
      document
        .querySelectorAll<HTMLElement>('[data-tour-highlight="true"]')
        .forEach((node) => node.removeAttribute('data-tour-highlight'));
    };
  }, [focus, annotation, calloutMode]);

  useEffect(() => {
    if (annotation == null || calloutMode !== 'anchored') {
      return undefined;
    }

    const dockOnInteract = (event: Event) => {
      if (isFieldInteraction(event.target, calloutRef.current)) {
        setCalloutMode('docked');
      }
    };

    document.addEventListener('mousedown', dockOnInteract, true);
    document.addEventListener('focusin', dockOnInteract, true);

    return () => {
      document.removeEventListener('mousedown', dockOnInteract, true);
      document.removeEventListener('focusin', dockOnInteract, true);
    };
  }, [annotation, calloutMode]);

  const showCallout =
    annotation != null && calloutMode !== 'dismissed' && (calloutMode === 'docked' || pos != null);

  return (
    <>
      {label != null && (
        <div className={styles['wf-banner']} role="note">
          {label}
        </div>
      )}
      {children}
      {showCallout && (
        <div
          ref={calloutRef}
          className={[
            styles['wf-callout'],
            calloutMode === 'docked'
              ? styles['wf-callout--docked']
              : styles[`wf-callout--${pos?.placement ?? 'below'}`],
          ].join(' ')}
          style={
            calloutMode === 'docked'
              ? undefined
              : { top: pos?.top, left: pos?.left }
          }
          role="note"
          aria-label={`Design note: ${annotation.title}`}
        >
          <p className={styles['wf-callout__eyebrow']}>Design note</p>
          <div className={styles['wf-callout__head']}>
            <div className={styles['wf-callout__title']}>{annotation.title}</div>
            <button
              type="button"
              className={styles['wf-callout__close']}
              aria-label="Dismiss annotation"
              onClick={() => setCalloutMode('dismissed')}
            >
              <Icon size="16" glyph={<CloseIcon />} />
            </button>
          </div>
          <ul className={styles['wf-callout__list']}>
            {annotation.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
