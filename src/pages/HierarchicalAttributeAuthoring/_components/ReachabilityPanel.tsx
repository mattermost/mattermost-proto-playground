import { useState } from 'react';
import PlayIcon from '@mattermost/compass-icons/components/play';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Spinner from '@/components/ui/Spinner/Spinner';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Chip from '@/components/ui/Chip/Chip';
import OptionTokenSelect from './OptionTokenSelect';
import {
  labelOf,
  reachabilityCoversAll,
  type GraphOption,
} from '../graphModel';
import styles from './ReachabilityPanel.module.scss';

interface ReachabilityPanelProps {
  options: GraphOption[];
  seedUser?: string[];
  seedTarget?: string[];
  /** Fail-secure: reachability query failed to compute (CN6 — no relation implied). */
  forceError?: boolean;
}

type Phase = 'idle' | 'computing' | 'result';

/**
 * A6 reachability preview / F-4 verification (also the coarse test-this-rule).
 * "Does the user's program set COVER the target set?" — uses coversAll semantics
 * (user holds the target or a broader ancestor). Fail-secure: a compute failure
 * implies NO relationship, with no "assume related" affordance (CN6).
 */
export default function ReachabilityPanel({
  options,
  seedUser = [],
  seedTarget = [],
  forceError = false,
}: ReachabilityPanelProps) {
  const [userSet, setUserSet] = useState<string[]>(seedUser);
  const [targetSet, setTargetSet] = useState<string[]>(seedTarget);
  const [phase, setPhase] = useState<Phase>(
    seedUser.length && seedTarget.length ? 'result' : 'idle',
  );

  const run = () => {
    setPhase('computing');
    window.setTimeout(() => setPhase('result'), 450);
  };

  const result = reachabilityCoversAll(options, userSet, targetSet);
  const emptySide = userSet.length === 0 || targetSet.length === 0;

  return (
    <div className={styles['reach']}>
      <p className={styles['reach__intro']}>
        Verify access before it drives decisions. Pick a user&apos;s programs and
        a channel&apos;s target programs; the check reports whether the user
        covers every target (holds it or a broader ancestor).
      </p>

      <div className={styles['reach__inputs']}>
        <OptionTokenSelect
          options={options}
          selectedIds={userSet}
          label="User's programs"
          addLabel="Add program"
          onChange={(ids) => {
            setUserSet(ids);
            setPhase('idle');
          }}
        />
        <OptionTokenSelect
          options={options}
          selectedIds={targetSet}
          label="Target programs (channel)"
          addLabel="Add target"
          onChange={(ids) => {
            setTargetSet(ids);
            setPhase('idle');
          }}
        />
      </div>

      <div className={styles['reach__actions']}>
        <Button
          emphasis="Secondary"
          leadingIcon={<Icon size="16" glyph={<PlayIcon />} />}
          disabled={phase === 'computing'}
          onClick={run}
        >
          Check coverage
        </Button>
        {phase === 'computing' && (
          <span className={styles['reach__computing']}>
            <Spinner size={16} aria-label="Computing reachability" />
            Computing…
          </span>
        )}
      </div>

      {forceError ? (
        <SectionNotice
          type="Danger"
          icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
          title="Couldn't compute reachability"
          description="No relationship is implied. Access is denied until the check succeeds — there is no assume-related override."
        />
      ) : phase === 'result' ? (
        emptySide ? (
          <SectionNotice
            type="Warning"
            title="Denied — an empty side denies"
            description="A rule with an empty user side or empty target side evaluates to deny (no vacuous truth)."
          />
        ) : (
          <div
            className={[
              styles['reach__verdict'],
              result.pass
                ? styles['reach__verdict--pass']
                : styles['reach__verdict--deny'],
            ].join(' ')}
          >
            <div className={styles['reach__verdict-head']}>
              <Icon
                size="20"
                glyph={
                  result.pass ? <CheckCircleIcon /> : <AlertOutlineIcon />
                }
              />
              <span>
                {result.pass
                  ? 'PASS — the user covers every target'
                  : 'DENY — the user does not cover all targets'}
              </span>
            </div>

            {result.covered.length > 0 && (
              <div className={styles['reach__row']}>
                <span className={styles['reach__row-label']}>Covered</span>
                <div className={styles['reach__row-chips']}>
                  {result.covered.map((id) => (
                    <Chip key={id} size="Small" tone="success">
                      {labelOf(options, id)}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {result.uncovered.length > 0 && (
              <div className={styles['reach__row']}>
                <span className={styles['reach__row-label']}>
                  Not covered (different branch — incomparable)
                </span>
                <div className={styles['reach__row-chips']}>
                  {result.uncovered.map((id) => (
                    <Chip key={id} size="Small" tone="danger">
                      {labelOf(options, id)}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <p className={styles['reach__hint']}>
          Add programs to both sides, then run the check.
        </p>
      )}
    </div>
  );
}
