import PencilIcon from '@mattermost/compass-icons/components/pencil-outline';
import Icon from '@/components/ui/Icon/Icon';
import VerdictPill from './VerdictPill';
import type { SessionDecision, AdminRole, EntryContext, EditorScope, PolicyContext } from './types';
import styles from './SimulateAccess.module.scss';

export interface SessionRowProps {
  session: SessionDecision;
  role: AdminRole;
  context: EntryContext;
  scope: EditorScope;
  policy?: PolicyContext;
  /** True when this session's edit popover is currently open — drives active button styling. */
  editActive?: boolean;
  /** Number of attributes overridden on this session — drives the inline "(N)" suffix. */
  overrideCount?: number;
  /** When true, the pencil "Edit values" button is hidden. Used when an alternate custom-session affordance is active. */
  hideEdit?: boolean;
  /** When true, suppress the explanatory placeholder footer note ("No active session in last 30 days..."). */
  hidePlaceholderNote?: boolean;
  onPillClick?: (rect: DOMRect) => void;
  onEditClick?: (rect: DOMRect) => void;
}

export default function SessionRow({
  session,
  role,
  context,
  scope,
  editActive = false,
  overrideCount = 0,
  hideEdit = false,
  hidePlaceholderNote = false,
  onPillClick,
  onEditClick,
}: SessionRowProps) {
  const canEdit = !hideEdit && role === 'system' && !session.isPlaceholder;

  return (
    <div className={styles['sa-session-row']}>
      <div className={styles['sa-session-row__device']}>
        <span className={styles['sa-session-row__device-name']}>{session.deviceLabel}</span>
        <span className={styles['sa-session-row__device-meta']}>
          {session.isPlaceholder ? 'No active session in last 30 days · fail-secure' : `Last active ${session.lastActive}`}
        </span>
      </div>

      <div className={styles['sa-session-row__verdict']}>
        <VerdictPill
          verdict={session.verdict}
          role={role}
          context={context}
          scope={scope}
          onClick={
            onPillClick
              ? (e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  onPillClick(rect);
                }
              : undefined
          }
        />
      </div>

      <div className={styles['sa-session-row__edit']}>
        {canEdit && (
          <button
            type="button"
            className={[
              styles['sa-edit-btn'],
              editActive && styles['sa-edit-btn--active'],
            ].filter(Boolean).join(' ')}
            onClick={(e) => {
              e.stopPropagation();
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              onEditClick?.(rect);
            }}
            aria-label={`Edit session attributes for ${session.deviceLabel}`}
            aria-expanded={editActive}
          >
            <span className={styles['sa-edit-btn__icon']} aria-hidden>
              <Icon glyph={<PencilIcon />} size="12" />
            </span>
            <span>Edit values{overrideCount > 0 && (
              <span className={styles['sa-edit-btn__count']}> ({overrideCount})</span>
            )}</span>
          </button>
        )}
      </div>

      {session.isPlaceholder && !hidePlaceholderNote && (
        <div className={styles['sa-session-row__placeholder']}>
          No active session in last 30 days. Conditions referencing session attributes evaluate as null — fail-secure deny.
        </div>
      )}
    </div>
  );
}
