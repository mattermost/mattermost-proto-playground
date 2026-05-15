import { useEffect, useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronUpIcon from '@mattermost/compass-icons/components/chevron-up';
import Icon from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import EvaluationTrace from './EvaluationTrace';
import type { TraceNode } from './EvaluationTrace';
import { ACTION_LABELS } from '../shared/types';
import type { PermissionAction, UserSimulationRow } from '../shared/types';
import styles from './IbrahimVariant.module.scss';

/** Per-permission decision detail, with optional trace for denials at the current rule level. */
export interface DecisionPerm {
  action: PermissionAction;
  /** 'allowed' | 'denied' */
  verdict: 'allowed' | 'denied';
  /** Source attribution shown next to the verdict (e.g. "system policy", "channel rule"). */
  attribution?: string;
  /** Whether a trace is available — only true for denials at the current rule level. */
  traceAvailable: boolean;
  /** The trace tree, when available. */
  trace?: { ruleHeader: string; root: TraceNode };
}

export interface DecisionDetailsModalProps {
  user: UserSimulationRow;
  perms: DecisionPerm[];
  onClose: () => void;
}

function PermPill({ verdict, attribution }: { verdict: 'allowed' | 'denied'; attribution?: string }) {
  const tone = verdict === 'allowed' ? 'allow' : 'deny';
  const Icn = verdict === 'allowed' ? CheckCircleIcon : CloseCircleIcon;
  return (
    <span className={[styles['iv-dd-perm__pill'], styles[`iv-dd-perm__pill--${tone}`]].join(' ')}>
      <Icon glyph={<Icn />} size="12" />
      <span>{verdict === 'allowed' ? 'Allowed' : 'Denied'}</span>
      {attribution && (
        <span className={styles['iv-dd-perm__attribution']}>· {attribution}</span>
      )}
    </span>
  );
}

export default function DecisionDetailsModal({ user, perms, onClose }: DecisionDetailsModalProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [onClose]);

  return (
    <div
      className={styles['iv-dd-overlay']}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles['iv-dd-card']} role="dialog" aria-label="Decision details">
        <div className={styles['iv-dd-header']}>
          <h2 className={styles['iv-dd-header__title']}>Decision details</h2>
          <button
            type="button"
            className={styles['iv-dd-header__close']}
            onClick={onClose}
            aria-label="Close decision details"
          >
            <Icon glyph={<CloseIcon />} size="20" />
          </button>
        </div>

        <div className={styles['iv-dd-body']}>
          <div className={styles['iv-dd-user']}>
            <UserAvatar src={user.avatarSrc} alt={user.name} size="32" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className={styles['iv-dd-user__name']}>{user.name}</span>
              <span className={styles['iv-dd-user__handle']}>@{user.handle}</span>
            </div>
          </div>

          {perms.map((p) => {
            const isOpen = !!expanded[p.action];
            return (
              <div className={styles['iv-dd-perm']} key={p.action}>
                <div className={styles['iv-dd-perm__row']}>
                  <span className={styles['iv-dd-perm__name']}>{ACTION_LABELS[p.action]}</span>
                  <PermPill verdict={p.verdict} attribution={p.attribution} />
                </div>
                {p.traceAvailable && p.trace && (
                  <button
                    type="button"
                    className={styles['iv-dd-perm__trace-toggle']}
                    onClick={() => setExpanded((prev) => ({ ...prev, [p.action]: !prev[p.action] }))}
                    aria-expanded={isOpen}
                  >
                    <Icon glyph={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />} size="12" />
                    {isOpen ? 'Hide evaluation trace' : 'Show evaluation trace'}
                  </button>
                )}
                {p.traceAvailable && p.trace && isOpen && (
                  <EvaluationTrace ruleHeader={p.trace.ruleHeader} root={p.trace.root} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
