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
import TextInput from '@/components/ui/TextInput/TextInput';
import Icon from '@/components/ui/Icon/Icon';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  HUB_ACTIVE_ITEM,
  HUB_SIDEBAR_CATEGORIES,
} from '@/pages/AttributeManagementHub/hubSidebar';
import type { AccessGrant } from '@/pages/AttributeManagementHub/hubData';
import WhoCanEdit from '@/pages/AttributeHubSimplified/_components/WhoCanEdit';
import shell from '@/pages/AttributeHubSimplified/AttributeHubSimplified.module.scss';
import detail from '@/pages/AttributeHubSimplified/_components/SimplifiedDetailView.module.scss';
// Shared DAG model — imported read-only from the non-tree re-pass (which itself
// re-exports the v2 graphAuthoringModel verbatim). This page adds no model math.
import {
  SEED_V2,
  wouldCreateCycle,
  validateAddParent,
  structuralDeleteBlock,
  labelOf,
  newOptionId,
  type GraphOption,
} from '@/pages/HierarchicalAttributeNonTree/nonTreeModel';
import {
  PROGRAM_ATTRIBUTE,
  PROGRAM_EDITORS,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import type { EdgeActions } from './_components/edgeActions';
import DiagramCanvas from './_components/DiagramCanvas';
import styles from './HierarchicalAttributeDiagramHub.module.scss';

type StateKey =
  | 'populated'
  | 'empty'
  | 'cycle-rejected'
  | 'delete-blocked'
  | 'loading'
  | 'error';

const STATE_OPTIONS: Array<{ value: StateKey; label: string }> = [
  { value: 'populated', label: 'Populated (14-node Programs graph)' },
  { value: 'empty', label: 'Create from scratch (empty)' },
  { value: 'cycle-rejected', label: 'Add-parent blocked — cycle' },
  { value: 'delete-blocked', label: 'Delete blocked — structural' },
  { value: 'loading', label: 'Loading' },
  { value: 'error', label: 'Fail-secure error' },
];

const TYPE_OPTIONS = ['Text', 'Select', 'Multiselect', 'Ranked', 'Hierarchical'];

/**
 * Hierarchical Attribute · Diagram (hub page) — NT-4b re-cut.
 *
 * The interactive node-link diagram (NT-4b) dropped into the FULL attribute
 * detail page structure, mirroring AttributeHubSimplified's SimplifiedDetailView
 * layout: a Definition ConsolePanel (Name · Type · Options · Who-can-edit) plus
 * an Applies-to ConsolePanel. The diagram is the OPTIONS content — it lives
 * inside the ConsolePanel exactly where the tree DefinitionValues lives today,
 * not as a bare full-screen canvas.
 *
 * This page owns the adjacency store + the shared EdgeActions bundle (forked from
 * the non-tree host, same fail-closed cycle gate and structural delete gate). It
 * adds two authoring improvements over NT-4b, both inside DiagramCanvas /
 * NodePopover: on-node ghost "+" create-and-connect affordances, and a single
 * creatable combobox per direction in the per-node popover.
 */
export default function HierarchicalAttributeDiagramHub() {
  const [params, setParams] = useSearchParams();
  const stateKey = (params.get('state') as StateKey) || 'populated';

  const [options, setOptions] = useState<GraphOption[]>(() =>
    stateKey === 'empty' ? [] : SEED_V2,
  );
  const [name, setName] = useState('Program');
  const [editors, setEditors] = useState<{
    roles: AccessGrant[];
    users: AccessGrant[];
  }>(PROGRAM_EDITORS);

  // Reset the graph to match the selected demo state synchronously during render.
  const [prevStateKey, setPrevStateKey] = useState(stateKey);
  if (stateKey !== prevStateKey) {
    setPrevStateKey(stateKey);
    setOptions(stateKey === 'empty' ? [] : SEED_V2);
  }

  const setState = (value: StateKey) => {
    const next = new URLSearchParams(params);
    next.set('state', value);
    setParams(next, { replace: true });
  };

  // ── Edge-authoring actions (forked from the non-tree host, verbatim math) ────
  const actions: EdgeActions = {
    addParent: (childId, parentId) => {
      // Fail-closed cycle re-check (800-207 Tenet 5) even though the pickers and
      // ghost affordances already exclude descendants / ancestors.
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

  const showSurface = stateKey !== 'loading' && stateKey !== 'error';

  // Real, model-derived guardrail messages for the seeded demo states.
  const cycleMsg =
    validateAddParent(SEED_V2, 'air', 'raptor')?.message ??
    'Linking a value under one of its own descendants would create a loop.';
  const deleteMsg =
    structuralDeleteBlock(SEED_V2, 'falcon') ??
    'This value has nested options — re-parent them before deleting.';

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
        {/* Demo-only band — NOT part of the product surface. Codenames stay here. */}
        <div className={styles['demo']}>
          <span className={styles['demo__label']}>Prototype demo</span>
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
            Interactive diagram in the full hub page · authoring surface only ·
            [AI DRAFT]
          </span>
        </div>

        <ConsolePageHeader
          title={name || 'Untitled attribute'}
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
                <>
                  <ConsolePanel
                    title="Definition"
                    subtitle="Name, type, options, and editors."
                  >
                    <div className={detail['detail__def']}>
                      <div className={detail['detail__row']}>
                        <span className={detail['detail__key']}>Name</span>
                        <div className={detail['detail__field']}>
                          <TextInput
                            className={detail['detail__input']}
                            size="Medium"
                            value={name}
                            aria-label="Attribute name"
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className={detail['detail__row']}>
                        <span className={detail['detail__key']}>Type</span>
                        <div className={detail['detail__field']}>
                          <Select
                            className={detail['detail__input']}
                            size="Medium"
                            value="Hierarchical"
                            readOnly
                            aria-label="Attribute type"
                          >
                            {TYPE_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </Select>
                          <p className={detail['detail__lock']}>
                            Type can’t change after creation.
                          </p>
                        </div>
                      </div>

                      <div className={detail['detail__row']}>
                        <span className={detail['detail__key']}>Options</span>
                        <div className={detail['detail__field']}>
                          {stateKey === 'cycle-rejected' && (
                            <div className={styles['banner']}>
                              <SectionNotice
                                type="Warning"
                                title="That parent would create a loop"
                                description={`${cycleMsg} The parent combobox hides any value that sits below the one you’re editing, and the commit re-checks fail-closed.`}
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
                          <DiagramCanvas options={options} actions={actions} />
                        </div>
                      </div>

                      <div className={detail['detail__row']}>
                        <span className={detail['detail__key']}>
                          Who can edit
                        </span>
                        <div className={detail['detail__field']}>
                          <WhoCanEdit
                            attribute={PROGRAM_ATTRIBUTE}
                            editors={editors}
                            onChange={setEditors}
                          />
                        </div>
                      </div>
                    </div>
                  </ConsolePanel>

                  <ConsolePanel
                    title="Applies to"
                    subtitle="Where this attribute applies, and who can set the value on each."
                  >
                    {/* Static summary — AppliesToSection needs a full binding-editor
                        handler surface this authoring-only page doesn't wire, so we
                        replicate the same read-only summary the v2 authoring page uses. */}
                    <div className={styles['applies']}>
                      {[
                        {
                          resource: 'Users',
                          detail:
                            'People hold one or more programs · anyone in Security Administrators can set',
                        },
                        {
                          resource: 'Channels',
                          detail:
                            'Channels are tagged with programs · draws from the same option list',
                        },
                      ].map((row) => (
                        <div key={row.resource} className={styles['applies__row']}>
                          <span className={styles['applies__resource']}>
                            {row.resource}
                          </span>
                          <span className={styles['applies__detail']}>
                            {row.detail}
                          </span>
                        </div>
                      ))}
                      <p className={styles['applies__note']}>
                        Users and Channels share one option list, so program access
                        can be compared across them.
                      </p>
                    </div>
                  </ConsolePanel>
                </>
              )}
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
}
