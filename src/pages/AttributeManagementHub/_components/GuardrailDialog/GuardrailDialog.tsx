import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import styles from './GuardrailDialog.module.scss';

export type GuardrailKind =
  | 'duplicate-name'
  | 'values-locked'
  | 'deactivate-blocked'
  | 'delete-blocked'
  | 'unlink-gated'
  | 'source-stale'
  | 'remove-binding'
  | 'self-edit-warning';

export interface GuardrailContext {
  attributeName: string;
  /** Linked / mirrored attribute name (unlink gate). */
  linkedName?: string;
  /** Policy names named by the guardrail. */
  policies?: string[];
  /** Channel-binding count (deactivate gate). */
  bindingCount?: number;
  /** Existing attribute to link to (duplicate-name gate). */
  existingName?: string;
  /** Source system + freshness (stale gate). */
  sourceSystem?: string;
  /** Resource being removed (remove-binding gate). */
  resource?: string;
}

export interface GuardrailDialogProps {
  kind: GuardrailKind | null;
  context: GuardrailContext;
  onClose: () => void;
  /** Confirm action label + handler for gates that can proceed. */
  onConfirm?: () => void;
  /** Duplicate-name → link to existing instead of creating. */
  onLinkExisting?: () => void;
}

interface GuardrailCopy {
  title: string;
  tone: 'Info' | 'Warning' | 'Danger';
  noticeTitle: string;
  body: string;
  confirmLabel?: string;
  primary?: { label: string; kind: 'link' };
  /** Confirm button styling — defaults to true (matches existing destructive gates). */
  destructive?: boolean;
}

function copyFor(kind: GuardrailKind, c: GuardrailContext): GuardrailCopy {
  switch (kind) {
    case 'duplicate-name':
      return {
        title: 'An attribute with this name already exists',
        tone: 'Warning' as const,
        noticeTitle: `“${c.existingName ?? c.attributeName}” is already defined`,
        body: 'Attribute names must be unique so policies and resources resolve to one definition. Link to the existing attribute instead of creating a duplicate.',
        confirmLabel: undefined,
        primary: { label: 'Link to existing', kind: 'link' as const },
      };
    case 'values-locked':
      return {
        title: 'Values are locked',
        tone: 'Info' as const,
        noticeTitle: `${c.attributeName} is used by ${c.policies?.length ?? 0} ${
          (c.policies?.length ?? 0) === 1 ? 'policy' : 'policies'
        }`,
        body: 'Reordering or editing values would re-evaluate access for every policy that compares this attribute. Detach the policies below first to unlock editing.',
        confirmLabel: undefined,
        primary: undefined,
      };
    case 'deactivate-blocked':
      return {
        title: 'Cannot deactivate yet',
        tone: 'Danger' as const,
        noticeTitle: `${c.attributeName} is bound to ${c.bindingCount ?? 0} channels`,
        body: `Clear the ${c.bindingCount ?? 0} channel bindings before deactivating this attribute. Deactivating now would strip the value from channels that still enforce it.`,
        confirmLabel: undefined,
        primary: undefined,
      };
    case 'delete-blocked':
      return {
        title: 'Cannot delete yet',
        tone: 'Danger' as const,
        noticeTitle: `${c.attributeName} is still in use`,
        body: 'Remove policy references and resource bindings before deleting this attribute. Deactivate first if you need to stop new assignments while existing values remain.',
        confirmLabel: undefined,
        primary: undefined,
      };
    case 'unlink-gated':
      return {
        title: 'Unlink from the shared scale?',
        tone: 'Warning' as const,
        noticeTitle: `${c.attributeName} mirrors ${c.linkedName}`,
        body: 'These policies compare the two attributes on the same tier scale. Unlinking lets the scales drift, which changes how those policies resolve access.',
        confirmLabel: 'Unlink anyway',
        primary: undefined,
      };
    case 'source-stale':
      return {
        title: 'Source is past its freshness budget',
        tone: 'Danger' as const,
        noticeTitle: `${c.attributeName} last synced from ${c.sourceSystem} too long ago`,
        body: 'Editing is blocked while the source is stale past budget — a downstream change now could conflict with the next sync. Restore the sync, then retry.',
        confirmLabel: undefined,
        primary: undefined,
      };
    case 'remove-binding': {
      const resource = c.resource ?? 'this resource';
      const lower = resource.toLowerCase();
      const hasPolicies = (c.policies?.length ?? 0) > 0;
      return {
        title: `Stop applying to ${resource}?`,
        tone: hasPolicies ? ('Danger' as const) : ('Warning' as const),
        noticeTitle: hasPolicies
          ? `${c.attributeName} is used by ${c.policies!.length} ${
              c.policies!.length === 1 ? 'policy' : 'policies'
            }`
          : `${c.attributeName} will no longer apply to ${lower}`,
        body: hasPolicies
          ? `Removing the ${lower} binding stops new assignments and hides the value on existing ${lower}. Policies that compare this attribute may stop resolving as expected.`
          : `New ${lower} won't be able to carry this value, and existing values on ${lower} will be hidden. You can re-add it later.`,
        confirmLabel: `Remove ${resource}`,
        primary: undefined,
      };
    }
    case 'self-edit-warning': {
      const count = c.policies?.length ?? 0;
      return {
        title: 'Members can set their own value',
        tone: 'Warning' as const,
        noticeTitle: `${c.attributeName} is used by ${count} ${count === 1 ? 'policy' : 'policies'}`,
        body: 'Letting members set their own value means self-reported data now feeds those policies. This is a warning, not a block — you can still proceed.',
        confirmLabel: 'Allow self-edit',
        primary: undefined,
        destructive: false,
      };
    }
  }
}

export default function GuardrailDialog({
  kind,
  context,
  onClose,
  onConfirm,
  onLinkExisting,
}: GuardrailDialogProps) {
  if (!kind) return null;
  const copy = copyFor(kind, context);
  const policies = context.policies ?? [];

  return (
    <div
      className={styles['guardrail']}
      role="presentation"
      data-tour-focus={
        kind === 'self-edit-warning' ? 'self-edit-warning-dialog' : undefined
      }
    >
      <button
        type="button"
        className={styles['guardrail__scrim']}
        aria-label="Close"
        onClick={onClose}
      />
      <div className={styles['guardrail__dialog']}>
        <Modal
          size="Small"
          title={copy.title}
          onClose={onClose}
          footer={
            <div className={styles['guardrail__footer']}>
              <Button emphasis="Tertiary" onClick={onClose}>
                {copy.confirmLabel || copy.primary ? 'Cancel' : 'Close'}
              </Button>
              {copy.primary?.kind === 'link' && (
                <Button emphasis="Primary" onClick={onLinkExisting}>
                  {copy.primary.label}
                </Button>
              )}
              {copy.confirmLabel && (
                <Button
                  emphasis="Primary"
                  destructive={copy.destructive ?? true}
                  onClick={onConfirm}
                >
                  {copy.confirmLabel}
                </Button>
              )}
            </div>
          }
        >
          <div className={styles['guardrail__body']}>
            <SectionNotice
              type={copy.tone}
              icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
              title={copy.noticeTitle}
              description={copy.body}
            />
            {policies.length > 0 && (
              <div className={styles['guardrail__policies']}>
                <p className={styles['guardrail__policies-title']}>
                  Policies affected
                </p>
                <ul className={styles['guardrail__policy-list']}>
                  {policies.map((p) => (
                    <li key={p} className={styles['guardrail__policy']}>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
