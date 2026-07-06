// Surface 1 — Classification↔clearance link affordance (FR-1).
// Near-identical across A/B/C by design; the differences are in density only.
// V-1 dual provenance shown as co-equal peer rows; disable-not-delete on the
// shared value scale. Pristine System Console chrome — no spec residue.

import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import CheckIcon from '@mattermost/compass-icons/components/check';

import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import ConsoleSetting from '@/components/ui/ConsoleSetting/ConsoleSetting';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';

import type { SurfaceScreenProps } from '../shared/types';
import { CLASSIFICATION_SCALE, PROVENANCE_SOURCES } from '../shared/fixtures';
import shared from '../shared/shared.module.scss';

export default function Surface1Link({ approach, state }: SurfaceScreenProps) {
  if (state === 'default') {
    // Not yet linked — empty state with the CTA to create the link.
    return (
      <ConsolePanel
        title="Classification and clearance"
        subtitle="Link a channel classification attribute to a user clearance attribute so they share one ranked value scale."
      >
        <EmptyState
          title="No linked attributes yet"
          description="Link a classification attribute to a clearance attribute to keep their values on one ranked scale. Linking creates the relationship only — it does not create or apply any policy."
          action={{
            children: 'Link attributes',
            emphasis: 'Primary',
            leadingIcon: <Icon size="16" glyph={<LinkVariantIcon />} />,
          }}
        />
      </ConsolePanel>
    );
  }

  const provenanceRows = (
    <div className={shared['provenance']}>
      {PROVENANCE_SOURCES.map((p) => (
        <div key={p.id} className={shared['provenance__row']}>
          <span className={shared['provenance__label']}>
            <Icon size="16" glyph={<LockOutlineIcon />} />
            {p.label}
          </span>
          <span className={shared['provenance__meta']}>{p.managedNote}</span>
        </div>
      ))}
    </div>
  );

  const scaleRows = (
    <div className={shared['scale']}>
      {CLASSIFICATION_SCALE.map((lvl) => {
        const rowClass = [
          shared['scale__row'],
          lvl.disabledForNew ? shared['scale__row--disabled'] : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <div key={lvl.id} className={rowClass}>
            <span className={shared['scale__name']}>
              {!lvl.disabledForNew && <Icon size="12" glyph={<CheckIcon />} />}
              {lvl.label}
            </span>
            <span className={shared['scale__state']}>
              {lvl.disabledForNew
                ? 'Disabled for new assignment'
                : 'Available'}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <ConsolePanel
        title="Classification and clearance"
        subtitle="These attributes are linked and share one ranked value scale. Values in use can be disabled for new assignments but cannot be deleted."
      >
        <ConsoleSetting
          label="Linked attributes"
          helpText="channel.classification and user.clearance share this scale. New values added to one appear on the other."
        >
          <span className={shared['managed-value']}>
            <span className={shared['managed-value__lock']}>
              <Icon size="12" glyph={<LinkVariantIcon />} />
            </span>
            channel.classification ↔ user.clearance
          </span>
        </ConsoleSetting>

        <ConsoleSetting
          label="Value source"
          helpText="Clearance values are set by an external source and are read-only here."
        >
          {provenanceRows}
        </ConsoleSetting>

        <ConsoleSetting
          label="Shared value scale"
          helpText="Disabling a value hides it from new assignments but keeps it on existing users and channels."
        >
          {scaleRows}
        </ConsoleSetting>

        {/* Approach A surfaces more enforcement state inline (denser). */}
        {approach === 'a' && (
          <ConsoleSetting label="Users without a clearance value">
            <span className={shared['managed-value']}>
              1 user has no clearance value and will be denied by clearance policies.
            </span>
          </ConsoleSetting>
        )}
      </ConsolePanel>

      {/* Posture state adds the pre-save confirmation note about disable-not-delete. */}
      {state === 'posture' && (
        <SectionNotice
          type="Info"
          title="Disabling keeps existing assignments"
          description="Confidential is disabled for new assignments. Users and channels that already hold it keep the value until it is changed at the source."
        />
      )}

      {approach !== 'c' && (
        <div>
          <Button emphasis="Tertiary" size="Small">
            Edit shared scale
          </Button>
        </div>
      )}
    </>
  );
}
