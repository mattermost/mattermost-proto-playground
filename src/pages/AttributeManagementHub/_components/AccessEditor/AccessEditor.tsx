import { useState, type ReactNode } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import CapabilityGrants from './CapabilityGrants';
import {
  capabilitiesEqual,
  type AccessCapability,
  type AccessModel,
} from '../../hubData';
import styles from './AccessEditor.module.scss';

export interface AccessEditorProps {
  access: AccessModel;
  sourceOwned?: boolean;
  onChange: (next: AccessModel) => void;
}

const COMBINE_HINT =
  'Combine roles, named users, and attribute rules — anyone matching any grant below receives this capability.';

function Card({
  title,
  help,
  locked,
  children,
}: {
  title: string;
  help: string;
  locked?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles['access__cap']}>
      <div className={styles['access__cap-head']}>
        <div className={styles['access__cap-title-block']}>
          <span className={styles['access__cap-title']}>{title}</span>
          <span className={styles['access__cap-help']}>{help}</span>
        </div>
        {locked && (
          <span className={styles['access__cap-lock']}>
            <Icon size="16" glyph={<LockOutlineIcon />} />
            Managed by sync
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function AccessEditor({
  access,
  sourceOwned = false,
  onChange,
}: AccessEditorProps) {
  // Auto-split when values are sync-locked or when the two capabilities already diverge.
  const [separate, setSeparate] = useState(
    sourceOwned || !capabilitiesEqual(access.editDefinition, access.manageValues),
  );

  const setEditDefinition = (next: AccessCapability) =>
    onChange({ ...access, editDefinition: next });
  const setManageValues = (next: AccessCapability) =>
    onChange({ ...access, manageValues: next });
  const setBoth = (next: AccessCapability) =>
    onChange({ editDefinition: next, manageValues: next });

  if (!separate) {
    return (
      <div className={styles['access']}>
        <Card
          title="Edit attribute"
          help="Rename, change type, edit description, and manage values."
        >
          <CapabilityGrants
            capability={access.editDefinition}
            combineHint={COMBINE_HINT}
            addCaption="Grant access to"
            onChange={setBoth}
          />
        </Card>
        <div className={styles['access__split-toggle']}>
          <Button
            emphasis="Tertiary"
            size="Small"
            onClick={() => setSeparate(true)}
          >
            Manage values separately
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['access']}>
      <Card
        title="Edit definition"
        help="Rename, change type, edit description."
      >
        <CapabilityGrants
          capability={access.editDefinition}
          combineHint={COMBINE_HINT}
          addCaption="Grant access to"
          onChange={setEditDefinition}
        />
      </Card>

      <Card
        title="Manage values"
        help="Add, reorder, disable, and link values."
        locked={sourceOwned}
      >
        {sourceOwned ? (
          <p className={styles['access__readonly']}>
            Values sync from an external source — managed by the sync system, not
            editable here.
          </p>
        ) : (
          <CapabilityGrants
            capability={access.manageValues}
            combineHint={COMBINE_HINT}
            addCaption="Grant access to"
            onChange={setManageValues}
          />
        )}
      </Card>

      {!sourceOwned && (
        <div className={styles['access__split-toggle']}>
          <Button
            emphasis="Tertiary"
            size="Small"
            onClick={() => {
              setBoth(access.editDefinition);
              setSeparate(false);
            }}
          >
            Use the same access for both
          </Button>
        </div>
      )}
    </div>
  );
}
