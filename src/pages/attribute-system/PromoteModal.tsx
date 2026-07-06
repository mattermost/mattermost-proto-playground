import ArrowUpIcon from '@mattermost/compass-icons/components/arrow-up-bold-circle-outline';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle-outline';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal/Modal';
import { ownerBadgeText } from './data';
import type { AttrDef } from './data';
import styles from './AttributeSystem.module.scss';

interface PromoteModalProps {
  def: AttrDef;
  onConfirm: (defId: string) => void;
  onClose: () => void;
}

export default function PromoteModal({
  def,
  onConfirm,
  onClose,
}: PromoteModalProps) {
  const origin = def.appliesTo[0] ?? 'this resource type';
  const originNoun = origin.toLowerCase().replace(/s$/, '');

  return (
    <div
      className={styles.modalOverlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Modal
        size="Medium"
        title={`Promote ‘${def.name}’ to a global attribute`}
        subtitle="Add to global attributes to use the attribute and its values across resource types."
        onClose={onClose}
        footer={
          <>
            <Button emphasis="Tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              emphasis="Primary"
              leadingIcon={<Icon size="16" glyph={<ArrowUpIcon />} />}
              onClick={() => onConfirm(def.id)}
            >
              Promote to global
            </Button>
          </>
        }
      >
        <ul className={styles.consequences}>
          <li>
            <Icon size="16" glyph={<SitemapIcon />} />
            <span>
              Available everywhere. Can be applied to Teams, Channels, and
              Posts, not just {originNoun}s. You configure each binding
              separately.
            </span>
          </li>
          <li>
            <Icon size="16" glyph={<CheckCircleIcon />} />
            <span>
              Shared, policy-comparable values. Its value list becomes one
              system-wide vocabulary. Because the values stay identical across
              resources, an access policy can compare them:
              <code className={styles.policyCode}>
                user.attribute.clearance &nbsp;≥&nbsp;
                channel.attribute.classification
              </code>
            </span>
          </li>
          <li>
            <Icon size="16" glyph={<LockOutlineIcon />} />
            <span>
              Source of truth is preserved.{' '}
              {def.owner
                ? `Values remain controlled by ${ownerBadgeText(def.owner)}.`
                : 'Values remain controlled by the original source.'}
            </span>
          </li>
          <li>
            <Icon size="16" glyph={<CheckCircleIcon />} />
            <span>
              Existing assignments and configuration stays. Current{' '}
              {originNoun} assignments are unchanged, value identity and access
              restrictions are retained.
            </span>
          </li>
        </ul>
      </Modal>
    </div>
  );
}
