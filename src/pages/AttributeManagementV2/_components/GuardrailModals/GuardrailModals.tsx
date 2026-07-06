import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Button from '@/components/ui/Button/Button';
import SideSheet from '../SideSheet/SideSheet';
import styles from './GuardrailModals.module.scss';

export type GuardrailKind =
  | 'in-use-dry-run'
  | 'self-edit-on-bound'
  | 'duplicate-name'
  | 'stale-source-block'
  | 'deactivate-forbidden'
  | 'shared-schema-edit'
  | 'unlink-shared-schema';

export interface GuardrailContext {
  attributeName: string;
  /** Policy names this attribute is bound to. */
  policies?: string[];
  /** Sibling attribute names sharing the same values schema. */
  siblings?: string[];
  /** The specific sibling being unlinked from (finding 5). */
  linkedName?: string;
}

export interface GuardrailModalsProps {
  open: GuardrailKind | null;
  context: GuardrailContext;
  onClose: () => void;
  onConfirm?: () => void;
}

function HeaderIcon({ tone }: { tone: 'warning' | 'danger' | 'neutral' }) {
  if (tone === 'danger')
    return (
      <span className={`${styles['icon']} ${styles['icon--danger']}`}>
        <LockOutlineIcon size={20} />
      </span>
    );
  if (tone === 'warning')
    return (
      <span className={`${styles['icon']} ${styles['icon--warning']}`}>
        <AlertOutlineIcon size={20} />
      </span>
    );
  return (
    <span className={`${styles['icon']} ${styles['icon--neutral']}`}>
      <AlertOutlineIcon size={20} />
    </span>
  );
}

export default function GuardrailModals({
  open,
  context,
  onClose,
  onConfirm,
}: GuardrailModalsProps) {
  if (open == null) return null;

  const policies = context.policies ?? [];
  const siblings = context.siblings ?? [];

  if (open === 'in-use-dry-run') {
    return (
      <SideSheet
        open
        title={`In use by ${policies.length} ${policies.length === 1 ? 'policy' : 'policies'}`}
        onClose={onClose}
        footer={
          <Button emphasis="Tertiary" onClick={onClose}>
            Close
          </Button>
        }
      >
        <div className={styles['body']}>
          <div className={styles['body__head']}>
            <HeaderIcon tone="neutral" />
            <p className={styles['body__lede']}>
              Editing <strong>{context.attributeName}</strong> can affect every
              policy listed here. Review them before you change its values or
              order.
            </p>
          </div>
          <ul className={styles['list']}>
            {policies.map((p) => (
              <li key={p} className={styles['list__item']}>
                <span className={styles['list__bullet']} aria-hidden>
                  ⊙
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </SideSheet>
    );
  }

  if (open === 'self-edit-on-bound') {
    return (
      <SideSheet
        open
        title="Turn self-edit on?"
        onClose={onClose}
        footer={
          <>
            <Button emphasis="Tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button emphasis="Primary" destructive onClick={onConfirm}>
              Continue
            </Button>
          </>
        }
      >
        <div className={styles['body']}>
          <div className={styles['body__head']}>
            <HeaderIcon tone="warning" />
            <p className={styles['body__lede']}>
              Turning self-edit On for <strong>{context.attributeName}</strong>{' '}
              means users can change their own value. This attribute is
              currently used by {policies.length}{' '}
              {policies.length === 1 ? 'policy' : 'policies'}.
            </p>
          </div>
          <p className={styles['body__note']}>
            Changes here are recorded as a trust-state change in the audit log.
          </p>
          <ul className={styles['list']}>
            {policies.map((p) => (
              <li key={p} className={styles['list__item']}>
                <span className={styles['list__bullet']} aria-hidden>
                  ⊙
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </SideSheet>
    );
  }

  if (open === 'duplicate-name') {
    return (
      <SideSheet
        open
        title="Name already in use"
        onClose={onClose}
        footer={
          <Button emphasis="Tertiary" onClick={onClose}>
            Close
          </Button>
        }
      >
        <div className={styles['body']}>
          <div className={styles['body__head']}>
            <HeaderIcon tone="danger" />
            <p className={styles['body__lede']}>
              An attribute named <strong>{context.attributeName}</strong>{' '}
              already exists. Names must be unique. Link to the existing
              attribute or choose a different name.
            </p>
          </div>
        </div>
      </SideSheet>
    );
  }

  if (open === 'stale-source-block') {
    return (
      <SideSheet
        open
        title="Source is stale"
        onClose={onClose}
        footer={
          <Button emphasis="Tertiary" onClick={onClose}>
            Close
          </Button>
        }
      >
        <div className={styles['body']}>
          <div className={styles['body__head']}>
            <HeaderIcon tone="danger" />
            <p className={styles['body__lede']}>
              The source for <strong>{context.attributeName}</strong> hasn&apos;t
              successfully synced within the configured window. Access checks
              against this attribute are <strong>failing closed</strong> until
              the source recovers.
            </p>
          </div>
          <p className={styles['body__note']}>
            Open Access &amp; editing → Value source for last-attempt details,
            run ID, and retry.
          </p>
        </div>
      </SideSheet>
    );
  }

  if (open === 'deactivate-forbidden') {
    return (
      <SideSheet
        open
        title="Clear bindings before deactivating"
        onClose={onClose}
        footer={
          <Button emphasis="Tertiary" onClick={onClose}>
            Close
          </Button>
        }
      >
        <div className={styles['body']}>
          <div className={styles['body__head']}>
            <HeaderIcon tone="danger" />
            <p className={styles['body__lede']}>
              <strong>{context.attributeName}</strong> is still bound to{' '}
              {policies.length}{' '}
              {policies.length === 1 ? 'policy' : 'policies'} and applied to{' '}
              one or more resources. Remove these bindings before deactivating.
            </p>
          </div>
          <ul className={styles['list']}>
            {policies.map((p) => (
              <li key={p} className={styles['list__item']}>
                <span className={styles['list__bullet']} aria-hidden>
                  ⊙
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </SideSheet>
    );
  }

  if (open === 'unlink-shared-schema') {
    const linked = context.linkedName ?? 'the linked attribute';
    return (
      <SideSheet
        open
        title="Unlink shared values?"
        onClose={onClose}
        footer={
          <>
            <Button emphasis="Tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button emphasis="Primary" destructive onClick={onConfirm}>
              Unlink anyway
            </Button>
          </>
        }
      >
        <div className={styles['body']}>
          <div className={styles['body__head']}>
            <HeaderIcon tone="danger" />
            <p className={styles['body__lede']}>
              <strong>{context.attributeName}</strong> shares its value scale
              with <strong>{linked}</strong>. Unlinking forks the two scales:{' '}
              from now on they can drift apart, and any policy that{' '}
              <strong>compares</strong> them can silently stop matching.
            </p>
          </div>
          {policies.length > 0 ? (
            <>
              <p className={styles['body__note']}>
                These policies compare {context.attributeName} and {linked}.
                Unlinking puts each at risk:
              </p>
              <ul className={styles['list']}>
                {policies.map((p) => (
                  <li key={p} className={styles['list__item']}>
                    <span className={styles['list__bullet']} aria-hidden>
                      ⊙
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className={styles['body__note']}>
              No active policies compare these two attributes today, but the
              shared scale and order will no longer stay in sync after
              unlinking.
            </p>
          )}
          <p className={styles['body__note']}>
            Unlink keeps a copy of the current values on {context.attributeName};
            they just stop tracking {linked}. This is recorded in the audit log.
          </p>
        </div>
      </SideSheet>
    );
  }

  // shared-schema-edit: two-sided dry-run.
  return (
    <SideSheet
      open
      title="Edit shared values schema?"
      onClose={onClose}
      footer={
        <>
          <Button emphasis="Tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button emphasis="Primary" onClick={onConfirm}>
            Continue
          </Button>
        </>
      }
    >
      <div className={styles['body']}>
        <div className={styles['body__head']}>
          <HeaderIcon tone="warning" />
          <p className={styles['body__lede']}>
            The values schema for <strong>{context.attributeName}</strong> is
            shared. This edit applies to every linked attribute and every
            bound policy below.
          </p>
        </div>
        <div className={styles['two-up']}>
          <div className={styles['two-up__col']}>
            <h3 className={styles['two-up__head']}>Linked attributes</h3>
            <ul className={styles['list']}>
              {siblings.map((s) => (
                <li key={s} className={styles['list__item']}>
                  <span className={styles['list__bullet']} aria-hidden>
                    🔗
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles['two-up__col']}>
            <h3 className={styles['two-up__head']}>Bound policies</h3>
            <ul className={styles['list']}>
              {policies.map((p) => (
                <li key={p} className={styles['list__item']}>
                  <span className={styles['list__bullet']} aria-hidden>
                    ⊙
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className={styles['body__note']}>
          Rank-order parity check: this edit would change the ordering that{' '}
          <code>Clearance ≥ Classification</code> depends on. Audit will name
          every touched attribute.
        </p>
      </div>
    </SideSheet>
  );
}
