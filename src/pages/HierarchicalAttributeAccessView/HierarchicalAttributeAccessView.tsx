import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Icon from '@/components/ui/Icon/Icon';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Select from '@/components/ui/Select/Select';
import Spinner from '@/components/ui/Spinner/Spinner';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  HUB_ACTIVE_ITEM,
  HUB_SIDEBAR_CATEGORIES,
} from '@/pages/AttributeManagementHub/hubSidebar';
import shell from '@/pages/AttributeHubSimplified/AttributeHubSimplified.module.scss';
import CoverageDiagram from './_components/CoverageDiagram';
import CoverageResultPanel from './_components/CoverageResultPanel';
import LineageTable from './_components/LineageTable';
import MemberAccessSummary from './_components/MemberAccessSummary';
import ViewToggle, { type AccessViewMode } from './_components/ViewToggle';
import { familyLayeredLayout } from './accessLayout';
import {
  ACCESS_SEED,
  ATTRIBUTE_NAME,
  VIEWER_HELD_IDS,
  coverageOf,
  grantsSentence,
  lineageRows,
  memberWhySentence,
  reachableBySentence,
  scopeGraph,
  viewerScopeIds,
  type ViewerKind,
} from './accessModel';
import styles from './HierarchicalAttributeAccessView.module.scss';

type StateKey = 'populated' | 'empty' | 'loading' | 'error';

const STATE_OPTIONS: Array<{ value: StateKey; label: string }> = [
  { value: 'populated', label: 'Populated (14-value Programs graph)' },
  { value: 'empty', label: 'No values yet' },
  { value: 'loading', label: 'Resolving coverage' },
  { value: 'error', label: 'Fail-secure error' },
];

const VIEWER_OPTIONS: Array<{ value: ViewerKind; label: string }> = [
  { value: 'admin', label: 'Admin — the whole graph' },
  { value: 'member', label: 'Member — only my own access' },
];

/**
 * Hierarchical attribute · Access and coverage explainer.
 *
 * A read-only surface that answers, in two scoped variants on one page:
 *   • admin  (?viewer=admin)  — "what does this value grant, and who already
 *                               reaches it?" over the whole graph.
 *   • member (?viewer=member) — "what access do I have?" over the viewer's own
 *                               down-set and nothing else.
 *
 * It re-houses the interaction model of the standalone Three.js demo at
 * `specs/graph-attributes/graph-attributes-visualization.html` — click a value,
 * everything it covers stays lit, everything else dims, in-set edges thicken;
 * click empty space to reset; every edge carries an arrowhead pointing
 * child→parent; `?select=` runs a query on load.
 *
 * It does NOT re-house the renderer, for three reasons, all recorded here so the
 * decision survives the next review:
 *   1. Section 508 / WCAG — a WebGL canvas has no DOM, no focus order and no
 *      screen-reader semantics. A graphics-only affordance is not shippable in a
 *      multi-classification interface.
 *   2. The hierarchy must not reach the client — the reference builds the whole
 *      lattice in the browser and runs covers() there. Value names plus
 *      relationships are a compartmentation map; see `accessModel.scopeGraph`.
 *   3. It already occludes at 24 nodes in its default camera. Orbiting fixes that
 *      for a mouse user and for nobody reading a screenshot, a printout, or a
 *      screen reader.
 *
 * Every screen-visible sentence is generated in `accessModel`, so the diagram,
 * the results panel and the lineage table cannot disagree with covers().
 */
export default function HierarchicalAttributeAccessView() {
  const [params, setParams] = useSearchParams();

  const viewer: ViewerKind =
    params.get('viewer') === 'member' ? 'member' : 'admin';
  const viewParam = params.get('view');
  const view: AccessViewMode =
    viewParam === 'diagram' || viewParam === 'table' ? viewParam : 'both';
  const stateParam = params.get('state');
  const stateKey: StateKey =
    stateParam === 'empty' || stateParam === 'loading' || stateParam === 'error'
      ? stateParam
      : 'populated';
  const demoVisible = params.get('demo') !== 'off';

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value == null) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  // ── Data. The member variant NEVER receives the full graph: `scopeGraph`
  // stands in for the server-side projection, so an out-of-scope value has no
  // label, no edge, no path and no count anywhere on this page.
  const graph = useMemo(() => {
    if (stateKey === 'empty') return [];
    if (viewer === 'member') {
      return scopeGraph(
        ACCESS_SEED,
        viewerScopeIds(ACCESS_SEED, VIEWER_HELD_IDS),
      );
    }
    return ACCESS_SEED;
  }, [viewer, stateKey]);

  const layout = useMemo(() => familyLayeredLayout(graph), [graph]);

  const selectParam = params.get('select');
  const selectedId =
    selectParam && graph.some((o) => o.id === selectParam) ? selectParam : null;
  const compareParam = params.get('compare');
  const compareId =
    viewer === 'admin' &&
    compareParam &&
    compareParam !== selectedId &&
    graph.some((o) => o.id === compareParam)
      ? compareParam
      : null;

  const result = selectedId ? coverageOf(graph, selectedId) : null;
  const coveredIds = result?.coveredIds ?? null;

  const rows = useMemo(
    () =>
      lineageRows(graph, {
        heldIds: viewer === 'member' ? VIEWER_HELD_IDS : undefined,
        withUsage: viewer === 'admin',
      }),
    [graph, viewer],
  );

  const onSelect = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) {
      next.set('select', id);
      if (next.get('compare') === id) next.delete('compare');
    } else {
      next.delete('select');
      next.delete('compare');
    }
    setParams(next, { replace: true });
  };

  /**
   * The live-region sentence. Same generated copy the results panel shows, so a
   * screen-reader user and a sighted user get the identical answer. For the
   * member variant it is the MASKED explanation — it can only name values inside
   * the viewer's own scope.
   */
  const announcement = (() => {
    if (!result) return 'No value selected. All values shown.';
    if (viewer === 'member') {
      return `${memberWhySentence(graph, result.id, VIEWER_HELD_IDS)} ${grantsSentence(
        graph,
        result,
      )}`;
    }
    return `${grantsSentence(graph, result)} ${reachableBySentence(graph, result)}`;
  })();

  const showDiagram = view === 'diagram' || view === 'both';
  const showTable = view === 'table' || view === 'both';
  const showSurface = stateKey === 'populated';

  const tableCaption =
    viewer === 'member'
      ? 'Every program you can reach. One row per program: the path from the program you hold down to it, what it lets you reach, and why you can reach it. This table carries the same information as the diagram and can be used on its own.'
      : 'Every value in this attribute. One row per value: each path from the top down to it, what holding it grants, what grants it, how many resources carry it, and how many active policies reference it. This table carries the same information as the diagram and can be used on its own.';

  const center = (
    <div className={shell['console__center']}>
      {demoVisible && (
        // Demo-only band — NOT part of the product surface. The view switcher is
        // deliberately NOT here: the table is the Section 508 answer, so reaching
        // it must survive ?demo=off.
        <div className={styles['demo']}>
          <span className={styles['demo__label']}>Prototype demo</span>
          <label className={styles['demo__control']}>
            <span>Viewer</span>
            <Select
              size="Small"
              width="fit"
              value={viewer}
              aria-label="Demo viewer"
              onChange={(e) => {
                const next = new URLSearchParams(params);
                next.set('viewer', e.target.value);
                next.delete('select');
                next.delete('compare');
                setParams(next, { replace: true });
              }}
            >
              {VIEWER_OPTIONS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </Select>
          </label>
          <label className={styles['demo__control']}>
            <span>State</span>
            <Select
              size="Small"
              width="fit"
              value={stateKey}
              aria-label="Demo state"
              onChange={(e) => setParam('state', e.target.value)}
            >
              {STATE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </label>
          <span className={styles['demo__note']}>
            2D, keyboard-operable port of the covers() demo in
            specs/graph-attributes/graph-attributes-visualization.html · [AI
            DRAFT]
          </span>
        </div>
      )}

      <ConsolePageHeader
        title={viewer === 'member' ? 'Your program access' : ATTRIBUTE_NAME}
        subtitle={
          viewer === 'member'
            ? 'Profile → Access · the programs you hold and what they reach'
            : 'System Console → Attribute Management · Hierarchical · access and coverage'
        }
        tag={viewer === 'member' ? undefined : 'Hierarchical'}
      />

      <div className={shell['console__scroll']}>
        <Scrollbars>
          <div className={shell['console__content']}>
            {stateKey === 'loading' && (
              <div className={styles['status']}>
                <Spinner size={32} aria-label="Resolving coverage" />
                <p className={styles['status__text']}>
                  Resolving what these values reach…
                </p>
              </div>
            )}

            {stateKey === 'error' && (
              <SectionNotice
                type="Danger"
                icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                title="Fail-secure — couldn’t resolve coverage"
                description="The value graph couldn’t be resolved, so no coverage answer is shown. Nothing is assumed reachable and access stays denied until it resolves. There is no retry-to-allow or bypass here."
              />
            )}

            {stateKey === 'empty' && viewer === 'admin' && (
              <ConsolePanel
                title="Access and coverage"
                subtitle="What each value grants, and who can already reach it."
              >
                <EmptyState
                  title="No values yet"
                  description="This attribute has no values, so there is nothing to explain. Add values in the attribute’s definition and their coverage will appear here."
                />
              </ConsolePanel>
            )}

            {stateKey === 'empty' && viewer === 'member' && (
              <ConsolePanel
                title="Your program access"
                subtitle="The programs you hold and everything they let you reach."
              >
                <EmptyState
                  title="No programs assigned to you"
                  description="You don’t hold any programs. If you think that is wrong, ask a security administrator to review your access."
                />
              </ConsolePanel>
            )}

            {showSurface && (
              <ConsolePanel
                title={
                  viewer === 'member'
                    ? 'Your program access'
                    : 'Access and coverage'
                }
                subtitle={
                  viewer === 'member'
                    ? 'Select a program to see why you can reach it and what it reaches in turn.'
                    : 'Select a value to see everything holding it grants, and everyone who can already reach it.'
                }
                trailing={
                  <ViewToggle
                    value={view}
                    onChange={(next) => setParam('view', next)}
                  />
                }
              >
                <div className={styles['access']}>
                  <div className={styles['access__main']}>
                    {showDiagram && (
                      <CoverageDiagram
                        key={`${viewer}:${stateKey}`}
                        options={graph}
                        layout={layout}
                        selectedId={selectedId}
                        coveredIds={coveredIds}
                        heldIds={viewer === 'member' ? VIEWER_HELD_IDS : []}
                        compareId={compareId}
                        memberScoped={viewer === 'member'}
                        onSelect={onSelect}
                      />
                    )}
                    {showTable && (
                      <LineageTable
                        rows={rows}
                        selectedId={selectedId}
                        coveredIds={coveredIds}
                        variant={viewer}
                        explain={
                          viewer === 'member'
                            ? (id) =>
                                memberWhySentence(graph, id, VIEWER_HELD_IDS)
                            : undefined
                        }
                        caption={tableCaption}
                        onSelect={onSelect}
                      />
                    )}
                  </div>

                  <div className={styles['access__side']}>
                    {viewer === 'member' ? (
                      <MemberAccessSummary
                        scoped={graph}
                        heldIds={VIEWER_HELD_IDS}
                        result={result}
                        onSelect={onSelect}
                      />
                    ) : (
                      <CoverageResultPanel
                        options={graph}
                        result={result}
                        compareId={compareId}
                        onCompareChange={(id) => setParam('compare', id)}
                        onSelect={onSelect}
                      />
                    )}
                  </div>
                </div>

                {/* Live region: every selection's coverage result is announced in
                    the same words the panel shows. */}
                <div
                  className={styles['live']}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {announcement}
                </div>
              </ConsolePanel>
            )}
          </div>
        </Scrollbars>
      </div>
    </div>
  );

  return (
    <div className={shell['console']}>
      {/* The admin variant lives in the System Console; the member variant is a
          personal surface and gets no console navigation. */}
      {viewer === 'admin' && (
        <ConsoleSidebar
          className={sidebarStyles['console-sidebar--product']}
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          username="leonard.riley"
          categories={HUB_SIDEBAR_CATEGORIES}
          activeItemId={HUB_ACTIVE_ITEM}
        />
      )}
      {center}
    </div>
  );
}
