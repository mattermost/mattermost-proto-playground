import { useMemo, useState } from 'react';
import ImportIcon from '@mattermost/compass-icons/components/import';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Spinner from '@/components/ui/Spinner/Spinner';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import {
  edgesOf,
  labelOf,
  rootsOf,
  depthOf,
  type GraphOption,
} from '../graphModel';
import styles from './ImportVerifyPanel.module.scss';

export type ImportPhase =
  | 'idle'
  | 'validating'
  | 'summary'
  | 'violations'
  | 'stale';

interface ImportVerifyPanelProps {
  options: GraphOption[];
  initialPhase?: ImportPhase;
  onApprove?: () => void;
}

/**
 * A8 batch import / verify. All-or-nothing validation → a summary that renders
 * the FULL parent→child edge list (F-5: counts alone invite rubber-stamping).
 * Approve is gated on acknowledging the edge list; approving a summary that went
 * stale during a concurrent re-ingest is blocked for re-review (F-9).
 */
export default function ImportVerifyPanel({
  options,
  initialPhase = 'idle',
  onApprove,
}: ImportVerifyPanelProps) {
  const [phase, setPhase] = useState<ImportPhase>(initialPhase);
  const [acked, setAcked] = useState(false);

  const edges = useMemo(() => edgesOf(options), [options]);
  const roots = useMemo(() => rootsOf(options), [options]);
  const maxDepth = useMemo(
    () => Math.max(...options.map((o) => depthOf(options, o.id))),
    [options],
  );

  const startImport = () => {
    setPhase('validating');
    setAcked(false);
    window.setTimeout(() => setPhase('summary'), 700);
  };

  if (phase === 'idle') {
    return (
      <div className={styles['import']}>
        <SectionNotice
          type="Info"
          title="Import a batch-defined graph"
          description="Ingest a JSON/CSV payload (≤10,000 items). The graph is validated all-or-nothing, then rendered read-only for verification before it commits."
        />
        <Button
          emphasis="Secondary"
          leadingIcon={<Icon size="16" glyph={<ImportIcon />} />}
          onClick={startImport}
        >
          Import batch (programs.json)
        </Button>
      </div>
    );
  }

  if (phase === 'validating') {
    return (
      <div className={styles['import__loading']}>
        <Spinner size={28} aria-label="Validating import" />
        <p>Validating the whole payload… (all-or-nothing)</p>
      </div>
    );
  }

  if (phase === 'violations') {
    return (
      <div className={styles['import']}>
        <SectionNotice
          type="Danger"
          icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
          title="Import rejected — 2 violations"
          description="All-or-nothing: nothing is committed until every violation is resolved. Every problem is listed below (not just the first)."
        />
        <ul className={styles['import__violations']}>
          <li>
            <strong>Cycle</strong> — edge “Fighter Jet → F-18 → Fighter Jet”
            makes Fighter Jet its own ancestor.
          </li>
          <li>
            <strong>Depth</strong> — “Relay North” lands at depth 101; the limit
            is 100.
          </li>
        </ul>
        <div className={styles['import__actions']}>
          <Button emphasis="Tertiary" onClick={() => setPhase('idle')}>
            Re-upload
          </Button>
        </div>
      </div>
    );
  }

  const summaryHead = (
    <div className={styles['import__stats']}>
      <Stat n={options.length} label="options" />
      <Stat n={edges.length} label="edges" />
      <Stat n={roots.length} label="roots" />
      <Stat n={maxDepth} label="max depth" />
    </div>
  );

  return (
    <div className={styles['import']}>
      {phase === 'stale' ? (
        <SectionNotice
          type="Warning"
          icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
          title="Graph changed since this summary"
          description="A concurrent re-ingest updated the edges after this summary was computed. Re-review before approving — the stale approval is blocked."
        />
      ) : (
        <SectionNotice
          type="Success"
          icon={<Icon size="20" glyph={<CheckCircleIcon />} />}
          title="Payload valid — review before approving"
          description="Validation passed as a whole. Review the full edge list below, then approve to commit and render read-only."
        />
      )}

      {summaryHead}

      <div className={styles['import__edges-head']}>
        Full parent → child edge list ({edges.length})
      </div>
      <div className={styles['import__edges']}>
        <Scrollbars>
          <ul className={styles['import__edge-list']}>
            {edges.map((e) => (
              <li key={`${e.parentId}->${e.childId}`}>
                <span className={styles['import__edge-parent']}>
                  {labelOf(options, e.parentId)}
                </span>
                <span className={styles['import__edge-arrow']} aria-hidden>
                  →
                </span>
                <span className={styles['import__edge-child']}>
                  {labelOf(options, e.childId)}
                </span>
              </li>
            ))}
          </ul>
        </Scrollbars>
      </div>

      <Checkbox
        checked={acked}
        onChange={(e) => setAcked(e.target.checked)}
        disabled={phase === 'stale'}
      >
        I have reviewed the full edge list above
      </Checkbox>

      <div className={styles['import__actions']}>
        <Button emphasis="Tertiary" onClick={() => setPhase('idle')}>
          Reject
        </Button>
        <Button
          emphasis="Primary"
          disabled={!acked || phase === 'stale'}
          onClick={onApprove}
        >
          Approve &amp; commit
        </Button>
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className={styles['import__stat']}>
      <span className={styles['import__stat-n']}>{n.toLocaleString()}</span>
      <span className={styles['import__stat-label']}>{label}</span>
    </div>
  );
}
