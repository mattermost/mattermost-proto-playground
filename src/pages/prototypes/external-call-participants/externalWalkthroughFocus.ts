/**
 * Stamp `data-wt-focus` / `data-wt-shell` on Compass proto nodes that lack data-attr props.
 * Call from useLayoutEffect after scene / overlay paint; return cleanup.
 *
 * One focus id → one parent box (never parent + children with the same id).
 */

/** Wrap sibling nodes [fromEl … toEl] in a stamped parent; unwrap on cleanup. */
function wrapSiblingsWithFocus(
  fromEl: Element,
  toEl: Element,
  focusId: string,
): () => void {
  const parent = fromEl.parentElement;
  if (!parent) {
    fromEl.setAttribute('data-wt-focus', focusId);
    return () => fromEl.removeAttribute('data-wt-focus');
  }

  const wrap = document.createElement('div');
  wrap.setAttribute('data-wt-focus', focusId);
  parent.insertBefore(wrap, fromEl);

  let node: ChildNode | null = fromEl;
  while (node) {
    const next: ChildNode | null = node.nextSibling;
    wrap.appendChild(node);
    if (node === toEl) break;
    node = next;
  }

  return () => {
    while (wrap.firstChild) {
      parent.insertBefore(wrap.firstChild, wrap);
    }
    wrap.remove();
  };
}

export function stampExternalWalkthroughFocus(): () => void {
  const cleanups: Array<() => void> = [];

  const stamp = (el: Element | null | undefined, id: string) => {
    if (!el) return;
    el.setAttribute('data-wt-focus', id);
    cleanups.push(() => el.removeAttribute('data-wt-focus'));
  };

  const stampShell = (el: Element | null | undefined) => {
    if (!el) return;
    el.setAttribute('data-wt-shell', '');
    cleanups.push(() => el.removeAttribute('data-wt-shell'));
  };

  const byLabel = (label: string) =>
    document.querySelector(`[aria-label="${CSS.escape(label)}"]`);

  stampShell(document.querySelector('[class*="channel-shell"]'));
  stampShell(byLabel('Call - UX Design'));
  stampShell(document.querySelector('[class*="welcome"]'));

  stamp(byLabel('Active call'), 'call-widget');
  stamp(byLabel('Call - UX Design'), 'guest-popout');
  stamp(byLabel('Call info'), 'call-info-panel');

  const callInfo = byLabel('Call info');
  if (callInfo) {
    stamp(
      callInfo.querySelector('[class*="call-info__toggle-row"]'),
      'call-info-external-toggle',
    );
    stamp(
      callInfo.querySelector('[class*="call-info__external"]'),
      'call-info-external-details',
    );
  }

  const participantsPanel = document.querySelector('[aria-label="Participants"]');
  if (participantsPanel) {
    const groupTitle = Array.from(
      participantsPanel.querySelectorAll(
        '[class*="participants-panel__group-title"]',
      ),
    ).find((el) => el.textContent?.includes('External'));
    const lists = participantsPanel.querySelectorAll(
      '[class*="participants-panel__list"]',
    );
    const externalList =
      lists.length > 1 ? lists[lists.length - 1] : null;

    if (groupTitle && externalList) {
      // Single parent around heading + rows — avoids overlapping per-row rings.
      cleanups.push(
        wrapSiblingsWithFocus(groupTitle, externalList, 'participants-external'),
      );
    } else if (externalList) {
      stamp(externalList, 'participants-external');
    }
  }

  // Popout grid: wrapping tiles would break CSS grid — sibling stamps only (non-nested).
  for (const tile of document.querySelectorAll(
    '[class*="call-participant-avatar--kind-external-link"], [class*="call-participant-avatar--kind-dial-in"]',
  )) {
    stamp(tile, 'popout-external-tiles');
  }

  return () => cleanups.forEach((fn) => fn());
}
