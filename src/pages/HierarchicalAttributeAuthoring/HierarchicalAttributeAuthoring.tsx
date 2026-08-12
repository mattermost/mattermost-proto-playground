import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import PlayIcon from '@mattermost/compass-icons/components/play';
import ImportIcon from '@mattermost/compass-icons/components/import';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ConsoleFrame from '@/pages/hierarchical-attributes/shared/ConsoleFrame';
import Switch from '@/components/ui/Switch/Switch';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Modal from '@/components/ui/Modal/Modal';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Spinner from '@/components/ui/Spinner/Spinner';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import OptionsTable from './_components/OptionsTable';
import HierarchyView from './_components/HierarchyView';
import ReachabilityPanel from './_components/ReachabilityPanel';
import ImportVerifyPanel, {
  type ImportPhase,
} from './_components/ImportVerifyPanel';
import RenameImpactModal from './_components/RenameImpactModal';
import {
  SEED_OPTIONS,
  validateAddParent,
  optionMap,
  type GraphOption,
  type ParentRejection,
} from './graphModel';
import styles from './HierarchicalAttributeAuthoring.module.scss';

type StateKey =
  | 'empty'
  | 'populated'
  | 'validation-rejected'
  | 'delete-blocked'
  | 'read-only-inherited'
  | 'import-validating'
  | 'import-summary'
  | 'loading'
  | 'error';

const STATE_OPTIONS: Array<{ value: StateKey; label: string }> = [
  { value: 'empty', label: 'Empty schema (A1)' },
  { value: 'populated', label: 'Populated' },
  { value: 'validation-rejected', label: 'Validation rejected (A3)' },
  { value: 'delete-blocked', label: 'Delete blocked (A4)' },
  { value: 'read-only-inherited', label: 'Read-only inherited (A7/A9)' },
  { value: 'import-validating', label: 'Import — validating (A8)' },
  { value: 'import-summary', label: 'Import — summary (A8/F-5)' },
  { value: 'loading', label: 'Loading' },
  { value: 'error', label: 'Fail-secure error' },
];

const newId = () => `opt-${Date.now()}-${Math.round(Math.random() * 1e4)}`;

export default function HierarchicalAttributeAuthoring() {
  const [params, setParams] = useSearchParams();
  const stateKey = (params.get('state') as StateKey) || 'populated';
  const sdLedger = (params.get('sd') || 'ledger') !== 'roster';

  const [options, setOptions] = useState<GraphOption[]>(SEED_OPTIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [nudgeIds, setNudgeIds] = useState<string[]>([]);
  const [reachOpen, setReachOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [live, setLive] = useState<'idle' | 'refreshing' | 'updated'>('idle');
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  // Deep-link import states auto-open the import verify surface.
  useEffect(() => {
    if (stateKey === 'import-validating' || stateKey === 'import-summary') {
      setImportOpen(true);
    }
    if (stateKey === 'delete-blocked') {
      setSelectedId('fighter-jet');
    }
  }, [stateKey]);

  const setState = (value: StateKey) => {
    const next = new URLSearchParams(params);
    next.set('state', value);
    setParams(next, { replace: true });
  };

  const setSd = (ledger: boolean) => {
    const next = new URLSearchParams(params);
    next.set('sd', ledger ? 'ledger' : 'roster');
    setParams(next, { replace: true });
  };

  const displayOptions = useMemo<GraphOption[]>(() => {
    if (stateKey === 'empty') return [];
    if (stateKey === 'read-only-inherited') {
      return options.map((o) => ({ ...o, source: 'linked' as const }));
    }
    return options;
  }, [stateKey, options]);

  const seededRejection = useMemo<{
    childId: string;
    rejection: ParentRejection;
  } | null>(() => {
    if (stateKey !== 'validation-rejected') return null;
    const rej = validateAddParent(options, 'fighter-jet', 'f18');
    return rej ? { childId: 'fighter-jet', rejection: rej } : null;
  }, [stateKey, options]);

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleChangeParents = (childId: string, nextParentIds: string[]) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === childId ? { ...o, parentIds: nextParentIds } : o)),
    );
    setNudgeIds((prev) => (prev.includes(childId) ? prev : [...prev, childId]));
  };

  const handleAddOption = (label: string) => {
    setOptions((prev) => [
      ...prev,
      {
        id: newId(),
        label,
        color: 'var(--color-blue-400)',
        parentIds: [],
        inUseCount: 0,
        policyRefCount: 0,
        source: 'manual',
      },
    ]);
  };

  const handleDelete = (id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleRenameCommit = (newLabel: string) => {
    if (!renameId) return;
    setOptions((prev) =>
      prev.map((o) => (o.id === renameId ? { ...o, label: newLabel } : o)),
    );
    setRenameId(null);
  };

  const simulateLive = () => {
    setLive('refreshing');
    setRefreshingId('dragon');
    window.setTimeout(() => {
      setRefreshingId(null);
      setLive('updated');
      window.setTimeout(() => setLive('idle'), 2500);
    }, 800);
  };

  const importPhase: ImportPhase =
    stateKey === 'import-validating' ? 'validating' : 'summary';

  const renameOption = renameId ? optionMap(options).get(renameId) : undefined;

  // ── header trailing ──────────────────────────────────────────────────────────
  const trailing = (
    <div className={styles['authoring__trailing']}>
      <label className={styles['authoring__state-switch']}>
        <span>State</span>
        <Select
          size="Small"
          width="fit"
          value={stateKey}
          onChange={(e) => setState(e.target.value as StateKey)}
        >
          {STATE_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );

  const subtitle = (
    <span>
      System Console → Attribute Management · Field:{' '}
      <strong>Program</strong> (Hierarchical). Toggle the hierarchy view to
      compare <strong>SD-1 Roster</strong> (table only) with{' '}
      <strong>SD-3 Ledger + Map</strong> (table + read-only tree).
    </span>
  );

  return (
    <ConsoleFrame
      title="Hierarchical Attribute · Authoring"
      eyebrow="Graph (Hierarchical) attribute type · Surface A · authoring only"
      subtitle={subtitle}
      activeItemId="user-attributes"
      showExit={false}
      trailing={trailing}
    >
      <div className={styles['authoring']}>
        {/* Field toolbar */}
        <div className={styles['authoring__toolbar']}>
          <div className={styles['authoring__field-meta']}>
            <LabelTag
              label="Hierarchical"
              type="Info"
              size="Small"
              leadingIcon={<Icon size="12" glyph={<SitemapIcon />} />}
            />
            <span className={styles['authoring__field-note']}>
              Type is immutable after creation
            </span>
            <LiveIndicator live={live} onSimulate={simulateLive} />
          </div>

          <div className={styles['authoring__toolbar-actions']}>
            <Switch
              size="Medium"
              checked={sdLedger}
              onChange={(e) => setSd(e.target.checked)}
            >
              Hierarchy view (SD-3)
            </Switch>
            <Button
              emphasis="Tertiary"
              leadingIcon={<Icon size="16" glyph={<PlayIcon />} />}
              onClick={() => setReachOpen(true)}
            >
              Test coverage
            </Button>
            <Button
              emphasis="Tertiary"
              leadingIcon={<Icon size="16" glyph={<ImportIcon />} />}
              onClick={() => setImportOpen(true)}
            >
              Import batch
            </Button>
          </div>
        </div>

        {/* Applies-to / shared pool (A9) */}
        {stateKey === 'read-only-inherited' ? (
          <SectionNotice
            type="Info"
            title="Linked field — Options inherited from a shared pool (A9)"
            description="This channel-side Hierarchical field links to the user-side field so both draw from one Option pool (the precondition for covers*/within* policy comparison and shared_only masking). Inherited Options are read-only here."
          />
        ) : (
          <div className={styles['authoring__pool']}>
            <Icon size="16" glyph={<SyncIcon />} />
            <span>
              Shared Option pool — <strong>User: Program</strong> and{' '}
              <strong>Channel: Program</strong> both draw from this DAG.
            </span>
            <Chip size="Small" tone="neutral">
              2 linked fields
            </Chip>
          </div>
        )}

        {stateKey === 'delete-blocked' && (
          <SectionNotice
            type="Warning"
            icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
            title="Two-reason delete gate (A4)"
            description="“Fighter Jet” is blocked because it has child options (re-parent first). “F-18 Program” is blocked because it is referenced by active policies (update those first). The two reasons are checked independently and never collapse into one generic “in use” message — hover a disabled trash icon."
          />
        )}

        {stateKey === 'error' && (
          <SectionNotice
            type="Danger"
            icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
            title="Fail-secure — couldn't resolve the graph"
            description="Graph resolution failed. No relationship is implied and access is denied until resolution succeeds. There is no retry-to-allow or bypass affordance (800-207 Tenet 5)."
          />
        )}

        {/* Body */}
        {stateKey === 'loading' ? (
          <div className={styles['authoring__loading']}>
            <Spinner size={32} aria-label="Loading options" />
            <p>Loading options…</p>
          </div>
        ) : stateKey === 'empty' ? (
          <div className={styles['authoring__empty']}>
            <div className={styles['authoring__type-chooser']}>
              <span className={styles['authoring__type-chooser-label']}>
                Attribute type
              </span>
              <div className={styles['authoring__type-chips']}>
                {['Text', 'Select', 'Multiselect', 'Ranked'].map((t) => (
                  <Chip key={t} size="Small" tone="neutral">
                    {t}
                  </Chip>
                ))}
                <Chip
                  size="Small"
                  tone="info"
                  leadingIcon={<Icon size="12" glyph={<SitemapIcon />} />}
                >
                  Hierarchical
                </Chip>
              </div>
            </div>
            <EmptyState
              title="No options yet"
              description="A new Hierarchical field starts with an empty Option table (zero rows, zero edges). Add your first root option to begin building the DAG."
              action={{
                children: 'Add first option',
                leadingIcon: <Icon size="16" glyph={<PlusIcon />} />,
                onClick: () => setState('populated'),
              }}
            />
          </div>
        ) : (
          <div
            className={[
              styles['authoring__grid'],
              sdLedger && styles['authoring__grid--split'],
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className={styles['authoring__table']}>
              <OptionsTable
                options={displayOptions}
                selectedId={selectedId}
                hoveredId={hoveredId}
                onSelect={setSelectedId}
                onHover={setHoveredId}
                onChangeParents={handleChangeParents}
                onOpenRename={setRenameId}
                onDelete={handleDelete}
                onAddOption={handleAddOption}
                seededRejection={seededRejection}
                nudgeIds={nudgeIds}
              />
            </div>

            {sdLedger && (
              <div className={styles['authoring__map']}>
                <div className={styles['authoring__map-head']}>
                  <Icon size="16" glyph={<SitemapIcon />} />
                  Hierarchy view
                  <span className={styles['authoring__map-sub']}>
                    SD-3 only · read-only · cross-highlights the table
                  </span>
                </div>
                <HierarchyView
                  options={displayOptions}
                  selectedId={selectedId}
                  hoveredId={hoveredId}
                  refreshingId={refreshingId}
                  onSelect={setSelectedId}
                  onHover={setHoveredId}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reachability modal (A6 / F-4) */}
      {reachOpen && (
        <Modal
          size="Large"
          title="Test coverage / reachability"
          subtitle="A6 · verify access before it drives decisions"
          onClose={() => setReachOpen(false)}
        >
          <ReachabilityPanel
            options={options}
            forceError={stateKey === 'error'}
          />
        </Modal>
      )}

      {/* Import / verify modal (A8) */}
      {importOpen && (
        <Modal
          size="Large"
          title="Import & verify batch"
          subtitle="A8 · all-or-nothing validation → full edge list → approve/reject"
          onClose={() => setImportOpen(false)}
        >
          <ImportVerifyPanel
            options={options}
            initialPhase={
              stateKey === 'import-validating' || stateKey === 'import-summary'
                ? importPhase
                : 'idle'
            }
            onApprove={() => setImportOpen(false)}
          />
        </Modal>
      )}

      {/* Rename → impact modal (A5 / F-3 / F-6) */}
      {renameOption && (
        <RenameImpactModal
          option={renameOption}
          onClose={() => setRenameId(null)}
          onCommit={handleRenameCommit}
        />
      )}
    </ConsoleFrame>
  );
}

function LiveIndicator({
  live,
  onSimulate,
}: {
  live: 'idle' | 'refreshing' | 'updated';
  onSimulate: () => void;
}) {
  return (
    <button
      type="button"
      className={styles['authoring__live']}
      onClick={onSimulate}
      data-live={live}
      aria-label="Simulate a live websocket update"
    >
      <span className={styles['authoring__live-dot']} aria-hidden />
      {live === 'refreshing'
        ? 'Syncing…'
        : live === 'updated'
          ? 'Updated just now'
          : 'Live · simulate update'}
    </button>
  );
}
