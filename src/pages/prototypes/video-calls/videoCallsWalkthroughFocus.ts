/**
 * Stamp `data-wt-focus` / `data-wt-shell` on video-call nodes that lack data-attr props.
 * Call from useLayoutEffect after the scene paints; returns cleanup.
 *
 * One focus id → one parent box (never parent + children with the same id).
 */
export function stampVideoCallsWalkthroughFocus(): () => void {
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

  // Header Start call button (icon-only; the menu trigger, not the whole header).
  stamp(byLabel('Start call'), 'start-call');

  // The widget card: setup, outgoing, joining or active (only one is mounted).
  stamp(
    byLabel('Call setup') ??
      byLabel('Outgoing call') ??
      byLabel('Joining call') ??
      byLabel('Active call'),
    'call-widget',
  );

  stamp(
    document.querySelector('[aria-label^="Incoming video call"]'),
    'incoming-call',
  );

  // Ongoing group/channel banner (the join pill under the header).
  stamp(byLabel('Ongoing call'), 'call-banner');

  stamp(byLabel('Call controls'), 'call-controls');

  // Window header layout switch (visible label is "View").
  stamp(byLabel('Change call layout'), 'call-layout');

  return () => cleanups.forEach((fn) => fn());
}
