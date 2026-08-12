import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ImportIcon from '@mattermost/compass-icons/components/import';
import FileCodeOutlineIcon from '@mattermost/compass-icons/components/file-code-outline';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import DownloadOutlineIcon from '@mattermost/compass-icons/components/download-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import Select from '@/components/ui/Select/Select';
import Spinner from '@/components/ui/Spinner/Spinner';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Switch from '@/components/ui/Switch/Switch';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  HUB_ACTIVE_ITEM,
  HUB_SIDEBAR_CATEGORIES,
} from '@/pages/AttributeManagementHub/hubSidebar';
import {
  edgesOf,
  rootsOf,
  depthOf,
} from '@/pages/HierarchicalAttributeAuthoring/graphModel';
import shell from '@/pages/AttributeHubSimplified/AttributeHubSimplified.module.scss';
import ImportPreviewTree from './_components/ImportPreviewTree';
import DiffLineageTable from './_components/DiffLineageTable';
import {
  PAYLOADS,
  LIVE_GRAPH,
  parsePayload,
  validateAll,
  computeDiff,
  ackSummary,
  formatBytes,
  type PayloadKey,
  type ImportStep,
} from './importModel';
import styles from './HierarchicalAttributeImport.module.scss';

const EXTERNAL_SOURCE = 'Unified Attribute Service';

const PAYLOAD_OPTIONS: Array<{ value: PayloadKey; label: string }> = [
  { value: 'clean', label: '(a) Clean first import' },
  { value: 'reimport', label: '(b) Re-import with changes' },
  { value: 'violations', label: '(c) Payload with violations' },
];

const STEP_OPTIONS: Array<{ value: ImportStep; label: string }> = [
  { value: 'upload', label: 'Upload' },
  { value: 'validating', label: 'Validating' },
  { value: 'violations', label: 'Violations' },
  { value: 'preview-first', label: 'Preview · first import' },
  { value: 'preview-reimport', label: 'Preview · re-import (diff)' },
  { value: 'ack', label: 'Acknowledgement' },
  { value: 'committing', label: 'Committing' },
  { value: 'committed', label: 'Committed' },
  { value: 'no-changes', label: 'No changes (idempotent)' },
  { value: 'error', label: 'Commit error (rollback)' },
  { value: 'stale', label: 'Stale-guard (drift)' },
];

const RAIL: Array<{ key: string; label: string; steps: ImportStep[] }> = [
  { key: 'upload', label: 'Upload', steps: ['upload'] },
  { key: 'validate', label: 'Validate', steps: ['validating', 'violations'] },
  {
    key: 'preview',
    label: 'Preview',
    steps: ['preview-first', 'preview-reimport'],
  },
  { key: 'ack', label: 'Acknowledge', steps: ['ack', 'stale'] },
  { key: 'commit', label: 'Commit', steps: ['committing'] },
  {
    key: 'done',
    label: 'Done',
    steps: ['committed', 'no-changes', 'error'],
  },
];

export default function HierarchicalAttributeImport() {
  const [params, setParams] = useSearchParams();
  const payload = (params.get('payload') as PayloadKey) || 'reimport';
  const step = (params.get('step') as ImportStep) || 'upload';
  const drift = params.get('drift') === '1';

  const file = PAYLOADS[payload];
  const parsed = parsePayload(file);
  const violations = validateAll(parsed);
  const live = file.isReimport ? LIVE_GRAPH : [];
  const diff = computeDiff(live, parsed);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  };
  const setStep = (s: ImportStep) => setParam('step', s);

  const choosePayload = (p: PayloadKey) => {
    const next = new URLSearchParams(params);
    next.set('payload', p);
    next.set('step', 'upload');
    setParams(next, { replace: true });
  };

  // Auto-advance the transient phases (validating → result; committing → result).
  useEffect(() => {
    if (step === 'validating') {
      const t = window.setTimeout(() => {
        if (violations.length > 0) setStep('violations');
        else setStep(file.isReimport ? 'preview-reimport' : 'preview-first');
      }, 750);
      return () => window.clearTimeout(t);
    }
    if (step === 'committing') {
      const t = window.setTimeout(() => {
        if (diff.isNoChange) setStep('no-changes');
        else setStep('committed');
      }, 750);
      return () => window.clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, payload]);

  const onApprove = () => {
    // Re-validate + stale-guard at commit time (02d §9 step 5). No bypass.
    if (drift) {
      setStep('stale');
      return;
    }
    setStep('committing');
  };

  const railIndex = RAIL.findIndex((r) => r.steps.includes(step));

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
            <span>Payload</span>
            <Select
              size="Small"
              width="fit"
              value={payload}
              aria-label="Demo payload"
              onChange={(e) => choosePayload(e.target.value as PayloadKey)}
            >
              {PAYLOAD_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </label>
          <label className={styles['demo__control']}>
            <span>Step</span>
            <Select
              size="Small"
              width="fit"
              value={step}
              aria-label="Demo step"
              onChange={(e) => setStep(e.target.value as ImportStep)}
            >
              {STEP_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </label>
          <span className={styles['demo__control']}>
            <Switch
              size="Small"
              checked={drift}
              onChange={(e) => setParam('drift', e.target.checked ? '1' : '0')}
            >
              Simulate concurrent re-sync (drift)
            </Switch>
          </span>
          <span className={styles['demo__note']}>Import flow · [AI DRAFT]</span>
        </div>

        <ConsolePageHeader
          title="Import values"
          subtitle="System Console → Attribute Management · Program (Hierarchical) · import from local media"
          tag="Hierarchical"
        />

        <div className={shell['console__scroll']}>
          <Scrollbars>
            <div className={shell['console__content']}>
              {/* Step rail */}
              <ol className={styles['rail']} aria-label="Import progress">
                {RAIL.map((r, i) => (
                  <li
                    key={r.key}
                    className={styles['rail__step']}
                    data-state={
                      i < railIndex
                        ? 'done'
                        : i === railIndex
                          ? 'active'
                          : 'todo'
                    }
                    aria-current={i === railIndex ? 'step' : undefined}
                  >
                    <span className={styles['rail__dot']} aria-hidden>
                      {i + 1}
                    </span>
                    <span className={styles['rail__label']}>{r.label}</span>
                  </li>
                ))}
              </ol>

              {renderPhase()}
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );

  function renderPhase() {
    switch (step) {
      case 'upload':
        return renderUpload();
      case 'validating':
        return renderValidating();
      case 'violations':
        return renderViolations();
      case 'preview-first':
      case 'preview-reimport':
      case 'ack':
        return renderPreview();
      case 'committing':
        return renderCommitting();
      case 'committed':
        return renderCommitted();
      case 'no-changes':
        return renderNoChanges();
      case 'error':
        return renderError();
      case 'stale':
        return renderStale();
      default:
        return renderUpload();
    }
  }

  function renderUpload() {
    return (
      <ConsolePanel
        title="Upload a value file"
        subtitle="Import an externally-authored program graph from local media. This enclave is air-gapped — files are uploaded from local media, never pulled from a live source."
      >
        <div className={styles['upload']}>
          <div className={styles['dropzone']}>
            <span className={styles['dropzone__icon']} aria-hidden>
              <Icon size="24" glyph={<FileCodeOutlineIcon />} />
            </span>
            <div className={styles['dropzone__body']}>
              <p className={styles['dropzone__file']}>{file.filename}</p>
              <p className={styles['dropzone__meta']}>
                {file.format.toUpperCase()} edge-list ·{' '}
                {formatBytes(file.bytes)} · {file.nodes.length} values ·{' '}
                {file.edges.length} edges
              </p>
            </div>
            <span className={styles['dropzone__ready']}>Ready</span>
          </div>
          <p className={styles['upload__formats']}>
            Accepted: JSON edge-list (primary) or CSV{' '}
            <code>parent_id,child_id</code> + label sheet (fallback). The whole
            file is validated together — nothing commits until you review and
            approve it.
          </p>
          <div className={styles['actions']}>
            <Button
              emphasis="Primary"
              leadingIcon={<Icon size="16" glyph={<ImportIcon />} />}
              onClick={() => setStep('validating')}
            >
              Validate
            </Button>
          </div>
        </div>
      </ConsolePanel>
    );
  }

  function renderValidating() {
    return (
      <div className={styles['status']}>
        <Spinner size={32} aria-label="Validating the whole payload" />
        <p className={styles['status__text']}>
          Validating the whole payload… (all-or-nothing, read-only)
        </p>
      </div>
    );
  }

  function renderViolations() {
    return (
      <ConsolePanel
        title="Import rejected"
        subtitle="Fail-closed: nothing is committed."
      >
        <div className={styles['phase']}>
          <SectionNotice
            type="Danger"
            icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
            title={`Import rejected — ${violations.length} ${
              violations.length === 1 ? 'violation' : 'violations'
            }`}
            description="All-or-nothing: nothing is committed until every violation is resolved. Every problem is listed below — not just the first. There is no “commit anyway” and no skip-bad-rows."
          />
          <ul className={styles['violations']}>
            {violations.map((v, i) => (
              <li key={i} className={styles['violations__item']}>
                <span
                  className={styles['violations__kind']}
                  data-kind={v.kind}
                >
                  {v.kind}
                </span>
                <span className={styles['violations__msg']}>{v.message}</span>
              </li>
            ))}
          </ul>
          <div className={styles['actions']}>
            <Button
              emphasis="Tertiary"
              leadingIcon={<Icon size="16" glyph={<DownloadOutlineIcon />} />}
              onClick={() => undefined}
            >
              Download report
            </Button>
            <Button emphasis="Secondary" onClick={() => setStep('upload')}>
              Re-upload
            </Button>
          </div>
        </div>
      </ConsolePanel>
    );
  }

  function renderPreview() {
    const isReimport = file.isReimport;
    const nextGraph = diff.next;
    const stats = {
      values: nextGraph.length,
      edges: edgesOf(nextGraph).length,
      roots: rootsOf(nextGraph).length,
      maxDepth: nextGraph.length
        ? Math.max(...nextGraph.map((o) => depthOf(nextGraph, o.id)))
        : 0,
    };

    if (isReimport && diff.isNoChange) {
      return renderNoChanges();
    }

    return (
      <div className={styles['phase']}>
        <SectionNotice
          type="Success"
          icon={<Icon size="20" glyph={<CheckCircleIcon />} />}
          title="Payload valid — review before approving"
          description={
            isReimport
              ? 'Validation passed as a whole. Below is exactly what this import changes versus the live graph — review it in the tree and in the change record, then acknowledge to commit.'
              : 'Validation passed as a whole. Below is exactly what you’ll get — review the full graph in the surface it will live in, then acknowledge to commit.'
          }
        />

        <div className={styles['stats']}>
          <Stat n={stats.values} label="values" />
          <Stat n={stats.edges} label="edges" />
          <Stat n={stats.roots} label="roots" />
          <Stat n={stats.maxDepth} label="max depth" />
        </div>

        <ConsolePanel
          title={isReimport ? 'Preview — changes to the graph' : 'Preview — the graph you’ll get'}
          subtitle={
            isReimport
              ? 'The result graph, in the same read-only tree the values will live in. Added and re-parented values carry a badge; removed values are listed below the tree.'
              : 'The parsed graph, rendered into the same read-only tree the values will live in.'
          }
        >
          <ImportPreviewTree
            options={nextGraph}
            nodeStatus={isReimport ? diff.nodeStatus : undefined}
            removedNodes={isReimport ? diff.removedNodes : []}
            ariaLabel={
              isReimport
                ? 'Program values after this import (with changes marked)'
                : 'Program values this import will create'
            }
          />
        </ConsolePanel>

        {isReimport && (
          <ConsolePanel
            title="Change record"
            subtitle="The complete, screen-reader-primary record of every edge this import adds, removes, or leaves unchanged. Shown as changes-only by default."
          >
            <DiffLineageTable
              diff={diff}
              liveOptions={live}
              nextOptions={nextGraph}
            />
          </ConsolePanel>
        )}

        <ConsolePanel
          title="Acknowledge & commit"
          subtitle="Never a one-click import. Confirm you reviewed the change, then commit."
        >
          <div className={styles['ack']}>
            <Checkbox
              checked={step === 'ack'}
              onChange={(e) =>
                setStep(
                  e.target.checked
                    ? 'ack'
                    : isReimport
                      ? 'preview-reimport'
                      : 'preview-first',
                )
              }
            >
              {isReimport
                ? `I reviewed the ${ackSummary(diff)} — apply exactly this change set.`
                : `I reviewed the full graph above (${stats.values} values, ${stats.edges} edges) — create it.`}
            </Checkbox>
            <div className={styles['actions']}>
              <Button
                emphasis="Tertiary"
                onClick={() => setStep('upload')}
              >
                Cancel
              </Button>
              <Button
                emphasis="Primary"
                disabled={step !== 'ack'}
                onClick={onApprove}
              >
                Approve &amp; commit
              </Button>
            </div>
            <p className={styles['ack__note']}>
              On commit the import re-validates against current state and commits
              exactly the previewed set atomically. If the source re-synced since
              this preview, the commit is blocked for re-review — no “commit
              anyway” bypass.
            </p>
          </div>
        </ConsolePanel>
      </div>
    );
  }

  function renderCommitting() {
    return (
      <div className={styles['status']}>
        <Spinner size={32} aria-label="Committing the import" />
        <p className={styles['status__text']}>
          Re-validating and committing exactly the previewed set…
        </p>
      </div>
    );
  }

  function renderCommitted() {
    const isReimport = file.isReimport;
    return (
      <ConsolePanel title="Import committed" subtitle="Atomic commit complete.">
        <div className={styles['phase']}>
          <SectionNotice
            type="Success"
            icon={<Icon size="20" glyph={<CheckCircleIcon />} />}
            title={
              isReimport
                ? `Committed — ${ackSummary(diff)}`
                : `Committed — ${diff.next.length} values created`
            }
            description={`Exactly the previewed change set was written to the graph, atomically. An audit event (AU-2/AU-3) records the before/after edge diff for this commit. The values are now live in the read-only view synced from ${EXTERNAL_SOURCE}.`}
          />
          <div className={styles['actions']}>
            <Button
              emphasis="Primary"
              leadingIcon={<Icon size="16" glyph={<OpenInNewIcon />} />}
              onClick={() =>
                window.open(
                  `${import.meta.env.BASE_URL}prototypes/hierarchical-attribute-external-readonly`,
                  '_blank',
                  'noopener',
                )
              }
            >
              Open the read-only values view
            </Button>
            <Button emphasis="Tertiary" onClick={() => setStep('upload')}>
              Import another file
            </Button>
          </div>
        </div>
      </ConsolePanel>
    );
  }

  function renderNoChanges() {
    return (
      <ConsolePanel
        title="No changes"
        subtitle="Idempotent re-import."
      >
        <div className={styles['phase']}>
          <SectionNotice
            type="Info"
            icon={<Icon size="20" glyph={<AlertCircleOutlineIcon />} />}
            title="No changes — this import matches the live graph"
            description="Every value and edge in this file already exists in the live graph, and nothing was removed. Re-running the same file is a safe no-op — nothing was committed because nothing changed."
          />
          <div className={styles['actions']}>
            <Button emphasis="Tertiary" onClick={() => setStep('upload')}>
              Import another file
            </Button>
          </div>
        </div>
      </ConsolePanel>
    );
  }

  function renderError() {
    return (
      <ConsolePanel title="Commit failed" subtitle="Fail-closed rollback.">
        <div className={styles['phase']}>
          <SectionNotice
            type="Danger"
            icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
            title="Commit failed — nothing was committed"
            description="The atomic commit could not complete, so it was rolled back in full. The graph is unchanged — there is no partial state and no half-applied import. Re-validate and try again once the source is reachable."
          />
          <div className={styles['actions']}>
            <Button emphasis="Secondary" onClick={() => setStep('upload')}>
              Back to upload
            </Button>
          </div>
        </div>
      </ConsolePanel>
    );
  }

  function renderStale() {
    return (
      <ConsolePanel
        title="Preview is stale"
        subtitle="Drift detected between preview and commit."
      >
        <div className={styles['phase']}>
          <SectionNotice
            type="Warning"
            icon={<Icon size="20" glyph={<AlertCircleOutlineIcon />} />}
            title="Graph changed since this preview"
            description="A concurrent re-sync updated the graph after this preview was computed. The change set you approved no longer matches current state, so the commit is blocked. Re-review the recomputed diff before approving — there is no “commit anyway” bypass."
          />
          <div className={styles['actions']}>
            <Button
              emphasis="Primary"
              onClick={() => {
                setParam('drift', '0');
                setStep(file.isReimport ? 'preview-reimport' : 'preview-first');
              }}
            >
              Re-review the recomputed diff
            </Button>
          </div>
        </div>
      </ConsolePanel>
    );
  }
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className={styles['stat']}>
      <span className={styles['stat__n']}>{n.toLocaleString()}</span>
      <span className={styles['stat__label']}>{label}</span>
    </div>
  );
}
