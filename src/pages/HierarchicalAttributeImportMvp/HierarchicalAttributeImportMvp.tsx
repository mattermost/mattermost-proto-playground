import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import Select from '@/components/ui/Select/Select';
import TextInput from '@/components/ui/TextInput/TextInput';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  HUB_ACTIVE_ITEM,
  HUB_SIDEBAR_CATEGORIES,
} from '@/pages/AttributeManagementHub/hubSidebar';
import {
  newOptionId,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import shell from '@/pages/AttributeHubMVP/AttributeHubMVP.module.scss';
import detail from '@/pages/AttributeHubMVP/_components/MvpDetailView.module.scss';
import MvpImportOptions, {
  type AppliedState,
} from './_components/MvpImportOptions';
import {
  CLEAN_PAYLOAD,
  PAYLOADS,
  toOptions,
  validateImport,
  type ImportProblems,
  type PayloadKey,
} from './importMvpModel';
import styles from './HierarchicalAttributeImportMvp.module.scss';

type StateKey = 'empty' | 'imported' | 'import-error' | 'replace';

const STATE_OPTIONS: Array<{ value: StateKey; label: string }> = [
  { value: 'empty', label: 'Empty · no options yet' },
  { value: 'imported', label: 'Imported · clean file applied' },
  { value: 'import-error', label: 'Import error · file has problems' },
  { value: 'replace', label: 'Replace · re-import over existing options' },
];

const PAYLOAD_OPTIONS: Array<{ value: PayloadKey; label: string }> = [
  { value: 'clean', label: 'programs.json (clean)' },
  { value: 'violations', label: 'programs-draft.json (has problems)' },
];

const CLEAN_OPTIONS: GraphOption[] = toOptions(CLEAN_PAYLOAD.rows);

/** Small flat manual set used to seed the "replace" demo (something to overwrite). */
function seedManualOptions(): GraphOption[] {
  return ['Alpha Program', 'Bravo Program', 'Charlie Program'].map((label) => ({
    id: newOptionId(),
    label,
    parentIds: [],
    inUseCount: 0,
    policyRefCount: 0,
    source: 'manual' as const,
  }));
}

interface SeedResult {
  applied: AppliedState | null;
  error: ImportProblems | null;
  hasUndo: boolean;
  undoTarget: AppliedState | null;
}

function seedFor(stateKey: StateKey): SeedResult {
  switch (stateKey) {
    case 'imported':
      return {
        applied: {
          options: CLEAN_OPTIONS,
          fileName: CLEAN_PAYLOAD.fileName,
          count: CLEAN_OPTIONS.length,
          replaced: false,
        },
        error: null,
        hasUndo: true,
        undoTarget: null,
      };
    case 'import-error': {
      const result = validateImport(PAYLOADS.violations.rows);
      return {
        applied: null,
        error: result.ok ? null : result.problems,
        hasUndo: false,
        undoTarget: null,
      };
    }
    case 'replace': {
      const previous = seedManualOptions();
      return {
        applied: {
          options: CLEAN_OPTIONS,
          fileName: CLEAN_PAYLOAD.fileName,
          count: CLEAN_OPTIONS.length,
          replaced: true,
          replacedCount: previous.length,
        },
        error: null,
        hasUndo: true,
        undoTarget: {
          options: previous,
          fileName: 'manual entry',
          count: previous.length,
          replaced: false,
        },
      };
    }
    case 'empty':
    default:
      return { applied: null, error: null, hasUndo: false, undoTarget: null };
  }
}

interface ImportSceneProps {
  initial: StateKey;
  payloadKey: PayloadKey;
}

/**
 * The interactive product surface. Seeded once from the demo `?state=`, then
 * fully interactive: Import runs the real inline validate-and-apply, Undo reverts,
 * and re-import replaces. Remounted (via key) whenever the demo band changes so
 * each state reads as a clean scene.
 */
function ImportScene({ initial, payloadKey }: ImportSceneProps) {
  const seed = seedFor(initial);
  const [applied, setApplied] = useState<AppliedState | null>(seed.applied);
  const [error, setError] = useState<ImportProblems | null>(seed.error);
  const [hasUndo, setHasUndo] = useState(seed.hasUndo);
  const [undoTarget, setUndoTarget] = useState<AppliedState | null>(
    seed.undoTarget,
  );

  const payload = PAYLOADS[payloadKey];

  const doImport = () => {
    const result = validateImport(payload.rows);
    if (!result.ok) {
      // All-or-nothing: a broken graph never partially applies. Existing options
      // (if any) are left exactly as they were.
      setError(result.problems);
      return;
    }
    const prev = applied;
    setUndoTarget(prev);
    setApplied({
      options: result.options,
      fileName: payload.fileName,
      count: result.count,
      replaced: prev != null,
      replacedCount: prev?.count,
    });
    setHasUndo(true);
    setError(null);
  };

  const undo = () => {
    setApplied(undoTarget);
    setUndoTarget(null);
    setHasUndo(false);
    setError(null);
  };

  const dismissError = () => setError(null);

  const dismissConfirmation = () => {
    setHasUndo(false);
    setUndoTarget(null);
  };

  const addManual = (label: string) => {
    const opt: GraphOption = {
      id: newOptionId(),
      label,
      parentIds: [],
      inUseCount: 0,
      policyRefCount: 0,
      source: 'manual',
    };
    setError(null);
    setHasUndo(false);
    setApplied((prev) =>
      prev
        ? { ...prev, options: [...prev.options, opt], count: prev.count + 1 }
        : {
            options: [opt],
            fileName: 'manual entry',
            count: 1,
            replaced: false,
          },
    );
  };

  return (
    <div className={detail['detail']}>
      <ConsolePanel title="Definition" subtitle="Name, type, and options.">
        <div className={detail['detail__def']}>
          <div className={detail['detail__row']}>
            <span className={detail['detail__key']}>Name</span>
            <div className={detail['detail__field']}>
              <TextInput
                className={detail['detail__input']}
                size="Medium"
                value="Program"
                readOnly
                aria-label="Attribute name"
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
                <option value="Hierarchical">Hierarchical</option>
              </Select>
              <p className={styles['hint']}>
                A hierarchy of values (multi-parent). Bring one in from a file
                rather than typing dozens of nested options by hand.
              </p>
            </div>
          </div>

          <div className={detail['detail__row']}>
            <span className={detail['detail__key']}>Options</span>
            <div className={detail['detail__field']}>
              <MvpImportOptions
                applied={applied}
                error={error}
                hasUndo={hasUndo}
                selectedFile={payload}
                onImport={doImport}
                onUndo={undo}
                onDismissError={dismissError}
                onDismissConfirmation={dismissConfirmation}
                onAddManual={addManual}
              />
            </div>
          </div>
        </div>
      </ConsolePanel>

      <ConsolePanel
        title="Applies to"
        subtitle="Resources this attribute applies to, and who can set the value on each."
      >
        <div className={styles['applies']}>
          {[
            {
              resource: 'Users',
              detail: 'People carry one or more programs · set by System Admins',
            },
            {
              resource: 'Channels',
              detail: 'Channels are tagged with a program · set by Channel Admins',
            },
          ].map((row) => (
            <div key={row.resource} className={styles['applies__row']}>
              <span className={styles['applies__resource']}>{row.resource}</span>
              <span className={styles['applies__detail']}>{row.detail}</span>
            </div>
          ))}
          <p className={styles['applies__note']}>
            Users and Channels share the imported value list, so program access
            can be compared across them.
          </p>
        </div>
      </ConsolePanel>
    </div>
  );
}

/**
 * Hierarchical Attribute · Import (MVP, lightweight). [AI DRAFT]
 *
 * A P0-simple, single-action inline import of a hierarchical (graph/DAG) value
 * set, built INSIDE the Attribute Management MVP edit-attribute screen — the
 * lightweight counterpart to the full-page plan/apply flow at
 * `/prototypes/hierarchical-attribute-import`. Everything happens in the
 * Definition panel's Options row: pick a file → Import. Valid applies immediately
 * with a confirmation + Undo; invalid shows a compact inline error and applies
 * nothing; re-import replaces with a one-line caution + Undo. No preview page, no
 * acknowledge checkbox, no separate commit button.
 */
export default function HierarchicalAttributeImportMvp() {
  const [params, setParams] = useSearchParams();
  const stateKey = (params.get('state') as StateKey) || 'empty';
  const payloadKey = (params.get('payload') as PayloadKey) || 'clean';

  const setParam = (key: 'state' | 'payload', value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
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
        {/* Demo-only band — NOT part of the product surface. */}
        <div className={styles['demo']}>
          <span className={styles['demo__label']}>Prototype demo</span>
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
          <label className={styles['demo__control']}>
            <span>File</span>
            <Select
              size="Small"
              width="fit"
              value={payloadKey}
              aria-label="Demo file payload"
              onChange={(e) => setParam('payload', e.target.value)}
            >
              {PAYLOAD_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </label>
          <span className={styles['demo__note']}>
            Lightweight inline import · [AI DRAFT]
          </span>
        </div>

        <ConsolePageHeader
          title="Program"
          subtitle="System Console → Attribute Management · Hierarchical"
          tag="Hierarchical"
        />

        <div className={shell['console__scroll']}>
          <Scrollbars>
            <div className={shell['console__content']}>
              <ImportScene
                key={`${stateKey}:${payloadKey}`}
                initial={stateKey}
                payloadKey={payloadKey}
              />
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
}
