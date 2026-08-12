import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import Select from '@/components/ui/Select/Select';
import Spinner from '@/components/ui/Spinner/Spinner';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Icon from '@/components/ui/Icon/Icon';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  HUB_ACTIVE_ITEM,
  HUB_SIDEBAR_CATEGORIES,
} from '@/pages/AttributeManagementHub/hubSidebar';
import shell from '@/pages/AttributeHubSimplified/AttributeHubSimplified.module.scss';
import {
  SEED_V2,
  wouldCreateCycle,
  validateAddParent,
  structuralDeleteBlock,
  labelOf,
  newOptionId,
  type GraphOption,
} from './nonTreeModel';
import type { EdgeActions } from './_components/repProps';
import LineageTable from './_components/LineageTable';
import AdjacencyMatrix from './_components/AdjacencyMatrix';
import NodeLinkList from './_components/NodeLinkList';
import NodeLinkDiagramEdit from './_components/NodeLinkDiagramEdit';
import styles from './HierarchicalAttributeNonTree.module.scss';

type Viz = 'table' | 'matrix' | 'graph' | 'graph-edit';
type StateKey =
  | 'populated'
  | 'empty'
  | 'cycle-rejected'
  | 'delete-blocked'
  | 'loading'
  | 'error';

const VIZ_OPTIONS: Array<{ value: Viz; label: string; note: string }> = [
  {
    value: 'table',
    label: 'Lineage table (NT-1 + NT-2)',
    note: 'Two-column Parents | Children table; rows expand to full paths',
  },
  {
    value: 'matrix',
    label: 'Adjacency matrix (NT-3)',
    note: 'Parent × child cell grid; toggle a cell to set one edge',
  },
  {
    value: 'graph',
    label: 'Node-link + list (NT-4)',
    note: 'Bold/exploratory arm — read-only diagram paired with an editable list',
  },
  {
    value: 'graph-edit',
    label: 'Interactive diagram (NT-4b)',
    note: 'Diagram nodes open a popover to edit — no side list.',
  },
];

const STATE_OPTIONS: Array<{ value: StateKey; label: string }> = [
  { value: 'populated', label: 'Populated (14-node Programs graph)' },
  { value: 'empty', label: 'Create from scratch (empty)' },
  { value: 'cycle-rejected', label: 'Add-parent blocked — cycle' },
  { value: 'delete-blocked', label: 'Delete blocked — structural' },
  { value: 'loading', label: 'Loading' },
  { value: 'error', label: 'Fail-secure error' },
];

export default function HierarchicalAttributeNonTree() {
  const [params, setParams] = useSearchParams();
  const vizParam = params.get('viz') as Viz | null;
  const viz: Viz =
    vizParam === 'matrix' || vizParam === 'graph' || vizParam === 'graph-edit'
      ? vizParam
      : 'table';
  const stateKey = (params.get('state') as StateKey) || 'populated';

  const [options, setOptions] = useState<GraphOption[]>(() =>
    stateKey === 'empty' ? [] : SEED_V2,
  );

  // Reset the graph to match the demo state synchronously during render.
  const [prevStateKey, setPrevStateKey] = useState(stateKey);
  if (stateKey !== prevStateKey) {
    setPrevStateKey(stateKey);
    setOptions(stateKey === 'empty' ? [] : SEED_V2);
  }

  const setViz = (value: Viz) => {
    const next = new URLSearchParams(params);
    next.set('viz', value);
    setParams(next, { replace: true });
  };
  const setState = (value: StateKey) => {
    const next = new URLSearchParams(params);
    next.set('state', value);
    setParams(next, { replace: true });
  };

  // ── Edge-authoring actions, shared by all three representations ──────────────
  const actions: EdgeActions = {
    addParent: (childId, parentId) => {
      // Fail-closed cycle re-check (800-207 Tenet 5) even though pickers/cells
      // already exclude descendants.
      if (wouldCreateCycle(options, childId, parentId)) {
        return `'${labelOf(options, parentId)}' can't be a parent of '${labelOf(
          options,
          childId,
        )}' — that would create a loop.`;
      }
      const rej = validateAddParent(options, childId, parentId);
      if (rej) return rej.message;
      setOptions((prev) =>
        prev.map((o) =>
          o.id === childId ? { ...o, parentIds: [...o.parentIds, parentId] } : o,
        ),
      );
      return null;
    },
    removeEdge: (childId, parentId) => {
      setOptions((prev) =>
        prev.map((o) =>
          o.id === childId
            ? { ...o, parentIds: o.parentIds.filter((p) => p !== parentId) }
            : o,
        ),
      );
    },
    addValue: (label) => {
      setOptions((prev) => [
        ...prev,
        {
          id: newOptionId(),
          label,
          parentIds: [],
          inUseCount: 0,
          policyRefCount: 0,
          source: 'manual',
        },
      ]);
    },
    renameValue: (id, label) => {
      setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, label } : o)));
    },
    toggleDeactivate: (id) => {
      setOptions((prev) =>
        prev.map((o) => (o.id === id ? { ...o, disabled: !o.disabled } : o)),
      );
    },
    deleteValue: (id) => {
      if (structuralDeleteBlock(options, id)) return; // gate — fail-closed
      setOptions((prev) => prev.filter((o) => o.id !== id));
    },
    deleteBlock: (id) => structuralDeleteBlock(options, id),
  };

  const vizNote = VIZ_OPTIONS.find((v) => v.value === viz)?.note ?? '';
  const showSurface = stateKey !== 'loading' && stateKey !== 'error';

  // Real, model-derived guardrail messages for the seeded demo states.
  const cycleMsg =
    validateAddParent(SEED_V2, 'air', 'raptor')?.message ??
    'Linking a value under one of its own descendants would create a loop.';
  const deleteMsg =
    structuralDeleteBlock(SEED_V2, 'falcon') ??
    'This value has nested options — re-parent them before deleting.';

  const renderRep = () => {
    if (viz === 'matrix') return <AdjacencyMatrix options={options} actions={actions} />;
    if (viz === 'graph') return <NodeLinkList options={options} actions={actions} />;
    if (viz === 'graph-edit')
      return <NodeLinkDiagramEdit options={options} actions={actions} />;
    return <LineageTable options={options} actions={actions} />;
  };

  return (
    <div className={shell['console']}>
      <ConsoleSidebar
        className={sidebarStyles['console-sidebar--product']}
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={HUB_SIDEBAR_CATEGORIES}
        activeItemId={HUB_ACTIVE_ITEM}
      />
      <div className={shell['console__center']}>
        {/* Demo-only band — NOT part of the product surface. Codenames live here. */}
        <div className={styles['demo']}>
          <span className={styles['demo__label']}>Prototype demo</span>
          <label className={styles['demo__control']}>
            <span>Representation</span>
            <Select
              size="Small"
              width="fit"
              value={viz}
              aria-label="Representation"
              onChange={(e) => setViz(e.target.value as Viz)}
            >
              {VIZ_OPTIONS.map((v) => (
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
              onChange={(e) => setState(e.target.value as StateKey)}
            >
              {STATE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </label>
          <span className={styles['demo__note']}>
            {vizNote} · authoring surface only · [AI DRAFT]
          </span>
        </div>

        <ConsolePageHeader
          title="Program"
          subtitle="System Console → Attribute Management · Hierarchical · used by 3 policies"
          tag="Hierarchical"
        />

        <div className={shell['console__scroll']}>
          <Scrollbars>
            <div className={shell['console__content']}>
              {stateKey === 'loading' && (
                <div className={styles['status']}>
                  <Spinner size={32} aria-label="Loading options" />
                  <p className={styles['status__text']}>Loading options…</p>
                </div>
              )}

              {stateKey === 'error' && (
                <SectionNotice
                  type="Danger"
                  icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                  title="Fail-secure — couldn’t resolve the hierarchy"
                  description="The option graph couldn’t be loaded. No relationships are assumed and access stays denied until it resolves. There is no retry-to-allow or bypass here."
                />
              )}

              {showSurface && (
                <ConsolePanel
                  title="Options"
                  subtitle="Parents and children of every value. Multi-parent values are shown natively — no indentation."
                >
                  {stateKey === 'cycle-rejected' && (
                    <div className={styles['banner']}>
                      <SectionNotice
                        type="Warning"
                        title="That parent would create a loop"
                        description={`${cycleMsg} The parent picker greys out any value that sits below the one you’re editing, and the commit re-checks fail-closed.`}
                      />
                    </div>
                  )}
                  {stateKey === 'delete-blocked' && (
                    <div className={styles['banner']}>
                      <SectionNotice
                        type="Warning"
                        title="This value can’t be deleted yet"
                        description={`${deleteMsg} Delete is a structural gate only — there is no per-value policy reference to clear here.`}
                      />
                    </div>
                  )}
                  {renderRep()}
                </ConsolePanel>
              )}
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
}
