import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import Icon from '@/components/ui/Icon/Icon';
import {
  INHERITANCE_MODE_LABEL,
  appliesToPostsAndChannels,
  inheritanceStatus,
  WRITE_TIER_LABEL,
} from './data';
import type { AttrDef, Binding } from './data';
import styles from './AttributeSystem.module.scss';

/** Compact, scannable binding state — used in resource-scoped lists. */
export default function BindingSummary({
  binding,
  def,
}: {
  binding: Binding;
  def?: AttrDef;
}) {
  const inheritState =
    def && appliesToPostsAndChannels(def) ? inheritanceStatus(def) : 'off';
  const postMode =
    def && binding.resource === 'Posts'
      ? binding.inheritanceMode ?? 'none'
      : null;

  return (
    <div className={styles.summary}>
      {binding.required === 'Required' ? (
        <span className={`${styles.tag} ${styles['tag--danger']}`}>Required</span>
      ) : (
        <span className={`${styles.tag} ${styles['tag--neutral']}`}>Optional</span>
      )}

      {binding.showInHeader && (
        <span className={`${styles.tag} ${styles['tag--accent']}`}>In header</span>
      )}

      <span className={`${styles.tag} ${styles['tag--neutral']}`}>
        {binding.vocabulary === 'Closed' ? 'Closed vocab' : 'Open vocab'}
      </span>

      {(binding.mutability === 'Locked' ||
        binding.mutability === 'Ratchet' ||
        binding.mutability === 'Approval') && (
        <span className={`${styles.tag} ${styles['tag--lock']}`}>
          <Icon size="12" glyph={<LockOutlineIcon />} />
          {binding.mutability === 'Locked'
            ? 'Locked after set'
            : binding.mutability === 'Ratchet'
              ? 'Raise-only'
              : 'Needs approval'}
        </span>
      )}

      <span className={`${styles.tag} ${styles['tag--neutral']}`}>
        Set by: {WRITE_TIER_LABEL[binding.whoCanSet]}
      </span>

      {binding.delegable && (
        <span className={`${styles.tag} ${styles['tag--neutral']}`}>
          Delegated
        </span>
      )}

      {binding.resource === 'Channels' && binding.propagateToPosts && (
        <span className={`${styles.tag} ${styles['tag--inherit']}`}>
          <Icon size="12" glyph={<LinkVariantIcon />} />
          Posts inherit
        </span>
      )}

      {postMode && postMode !== 'none' && (
        <span className={`${styles.tag} ${styles['tag--inherit']}`}>
          <Icon size="12" glyph={<LinkVariantIcon />} />
          {INHERITANCE_MODE_LABEL[postMode]}
        </span>
      )}

      {inheritState === 'active' && (
        <span className={`${styles.tag} ${styles['tag--accent']}`}>
          Inheritance active
        </span>
      )}
    </div>
  );
}
