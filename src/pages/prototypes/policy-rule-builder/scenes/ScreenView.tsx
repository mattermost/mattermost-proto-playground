// [AI DRAFT] Renders one screen: the System Console frame, the policy page
// with the chosen direction's editor, and any overlay the screen opens
// (Simulate, save confirmation). Reviewer notes sit outside the frame.
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useDialogFocus } from '../components/useDialogFocus';
import { noOnePasses, type NewlyAllowed } from '../model/behaviourDiff';
import ConsoleFrame from '../components/ConsoleFrame';
import { EditorA } from '../components/Editors';
import PolicyPage from '../components/PolicyPage';
import SaveConfirmModal from '../components/SaveConfirmModal';
import SimulateModal from '../components/SimulateModal';
import Stage from '../components/Stage';
import { impactLines, vocabForRole } from '../components/pageHelpers';
import type { GroupingMode } from '../model/celParse';
import type { Policy } from '../model/rules';
import type { ExplainPlacement } from '../components/explanation';
import { VOCABULARIES, type VocabularyId } from '../model/vocabulary';
import type { ScreenDef } from '../scenes';

export interface ScreenViewProps {
  screen: ScreenDef;
  grouping: GroupingMode;
  vocabulary: VocabularyId;
  explainPlacement: ExplainPlacement;
  /** Authoring page only: no save confirmation and no simulate dialog. */
  authoringOnly?: boolean;
}

/**
 * A menu the screen opens drops downward: bring all of it above the pinned
 * footer, even if its section's top scrolls out of view. (The menu surface,
 * not its role="menu" list, which has no height of its own.)
 */
function revealMenu(scroller: HTMLElement) {
  const menu = scroller.querySelector<HTMLElement>('[class*="policy-editor__cell-menu"]');
  if (!menu) return;
  const over = menu.getBoundingClientRect().bottom - scroller.getBoundingClientRect().bottom + 16;
  if (over > 0) scroller.scrollTop += over;
}

/** Wraps the whole Compass Modal (header, body, footer) so focus and Escape cover all of it. */
function DialogHost({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(ref, onClose);
  return (
    <div ref={ref} role="presentation" style={{ display: 'contents' }}>
      {children}
    </div>
  );
}

export default function ScreenView({
  screen,
  grouping,
  vocabulary,
  explainPlacement,
  authoringOnly = false,
}: ScreenViewProps) {
  const setup = screen.setup(grouping, VOCABULARIES[vocabulary]);
  const [policy, setPolicy] = useState<Policy>(setup.policy);
  // Simulate runs on the rules as they are when it opens, including Advanced edits (QA-1).
  const [simRoot, setSimRoot] = useState<Policy['root'] | null>(
    setup.simulate ? setup.policy.root : null,
  );
  const [saved] = useState<Policy>(setup.saved ?? setup.policy);
  const [saveOpen, setSaveOpen] = useState<string[] | null>(setup.save ? [] : null);
  const [saveCel, setSaveCel] = useState<string | undefined>(undefined);
  const [savePairs, setSavePairs] = useState<NewlyAllowed>({ count: 0, unit: 'pairs' });
  const rootRef = useRef<HTMLDivElement>(null);
  const vocab = VOCABULARIES[vocabulary];

  // Scroll only the console's own scroll region, never the page around it.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const scroller = root?.querySelector<HTMLElement>('[data-prb-scroll]');
    if (!scroller || !setup.scrollTo) return;
    if (setup.scrollTo === 'bottom') {
      scroller.scrollTop = scroller.scrollHeight;
      return;
    }
    const target = root?.querySelector<HTMLElement>(`[data-prb-section="${setup.scrollTo}"]`);
    if (!target) return;
    const t = target.getBoundingClientRect();
    const sc = scroller.getBoundingClientRect();
    // The section's scroll gutter (the workspace's 20px), so the previous panel
    // doesn't show as a strip at the top and the panel lines up with the rail.
    const gutter = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    scroller.scrollTop = t.top - sc.top + scroller.scrollTop - gutter;
    revealMenu(scroller);
    // Run once per screen mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fonts and menu sizes settle after mount; re-apply the scroll once.
  useEffect(() => {
    if (!setup.scrollTo) return;
    const id = window.setTimeout(() => {
      const scroller = rootRef.current?.querySelector<HTMLElement>('[data-prb-scroll]');
      if (!scroller) return;
      if (setup.scrollTo === 'bottom') scroller.scrollTop = scroller.scrollHeight;
      else revealMenu(scroller);
    }, 250);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overlay = authoringOnly ? undefined : simRoot ? (
    <DialogHost onClose={() => setSimRoot(null)}>
    <SimulateModal
      root={simRoot}
      role={policy.role}
      permissions={policy.permissions}
      vocab={vocabForRole(vocab, policy.role)}
      initial={setup.simulate}
      onClose={() => setSimRoot(null)}
    />
    </DialogHost>
  ) : saveOpen ? (
    <DialogHost onClose={() => setSaveOpen(null)}>
    <SaveConfirmModal
      policy={policy}
      saved={saved}
      vocab={vocab}
      widening={saveOpen}
      cel={saveCel}
      pairs={savePairs}
      onClose={() => setSaveOpen(null)}
    />
    </DialogHost>
  ) : undefined;

  return (
    <div ref={rootRef}>
      <Stage>
        <ConsoleFrame overlay={overlay}>
          <PolicyPage
            policy={policy}
            onChange={setPolicy}
            vocab={vocab}
            grouping={grouping}
            renderSimple={(p) => <EditorA {...p} />}
            initialAdvanced={setup.advanced}
            initialCel={setup.cel}
            authoringOnly={authoringOnly}
            initialCanonicalNote={authoringOnly ? false : setup.canonicalNote}
            initialPickerOpen={setup.pickerOpen}
            initialAddMenuOpen={setup.addMenuOpen}
            initialAddMenuQuery={setup.addMenuQuery}
            initialValueMenuOpen={setup.valueMenuOpen}
            initialWarningsOpen={setup.warningsOpen}
            initialExplainOpen={setup.explainOpen}
            initialRowMenuOpen={setup.rowMenuOpen}
            initialUndo={setup.undoFrom}
            explainPlacement={explainPlacement}
            saved={saved}
            onSimulate={authoringOnly ? undefined : (root) => setSimRoot(root)}
            onSave={authoringOnly ? undefined : (widening, root, cel, pairs) => {
              // Confirm only when there is something to confirm (D5-6), now
              // including a policy no one passes (M4).
              if (
                widening.length > 0 ||
                impactLines(root, vocab).length > 0 ||
                (!cel && noOnePasses({ ...policy, root }).permissions.length > 0)
              ) {
                setPolicy({ ...policy, root });
                setSaveCel(cel);
                setSavePairs(pairs ?? { count: 0, unit: 'pairs' });
                setSaveOpen(widening);
                return true;
              }
              return false;
            }}
          />
        </ConsoleFrame>
      </Stage>
    </div>
  );
}
