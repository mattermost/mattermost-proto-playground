import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import EyeOffOutlineIcon from '@mattermost/compass-icons/components/eye-off-outline';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import TextInput from '@/components/ui/TextInput/TextInput';
import TextArea from '@/components/ui/TextArea/TextArea';
import Select from '@/components/ui/Select/Select';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import SyncPill from '../AttributeManagementHub/_components/SyncPill/SyncPill';
import StreamlinedValues from './StreamlinedValues';
import {
  eligibility,
  isPolicyLocked,
  isSourceOwned,
  ALL_RESOURCES,
  type AttrType,
  type HubAttribute,
  type ResourceKind,
} from '../AttributeManagementHub/hubData';
import {
  attributeOwners,
  readIntoStatus,
  setterLabel,
} from './data';
import styles from './streamlined.module.scss';

const ATTR_TYPES: AttrType[] = [
  'Select',
  'Multiselect',
  'Ranked',
  'Ranked-hierarchical',
  'Text',
];

export interface StreamlinedDetailProps {
  attribute: HubAttribute;
  onDefinitionChange: (
    next: Partial<Pick<HubAttribute, 'name' | 'type' | 'description'>>,
  ) => void;
  onAddValue: (label: string, asTier?: boolean) => void;
  onAddChild: (parentId: string, label: string) => void;
  onDeleteValue: (valueId: string) => void;
  onReorderValue: (valueId: string, dir: -1 | 1) => void;
  onValuesLockedAttempt: () => void;
  onSharedScale: () => void;
  onUnlink: () => void;
  onToggleResource: (resource: ResourceKind) => void;
  onToggleRequired: (resource: ResourceKind) => void;
}

/**
 * Approach A drill-in — a single flat, minimal page. No advanced tier, no
 * collapsed panels, no per-resource grant editor, no value subsets, no
 * attribute-rules, no read-into toggle. Everything the pole keeps sits on one
 * short scroll: Values (primary) → Definition (demoted) → Applies to (resource
 * multiselect + Required) → one "who sets the value" answer → one owner list →
 * source health + read-into status pills.
 */
export default function StreamlinedDetail({
  attribute,
  onDefinitionChange,
  onAddValue,
  onAddChild,
  onDeleteValue,
  onReorderValue,
  onValuesLockedAttempt,
  onSharedScale,
  onUnlink,
  onToggleResource,
  onToggleRequired,
}: StreamlinedDetailProps) {
  const elig = eligibility(attribute);
  const sourceOwned = isSourceOwned(attribute);
  const policyLocked = isPolicyLocked(attribute);
  const nameReadOnly = sourceOwned;
  const typeReadOnly = sourceOwned || !!attribute.valuesLink || policyLocked;

  const owners = attributeOwners(attribute);
  const readInto = readIntoStatus(attribute);
  const appliedResources = new Set(attribute.appliesTo.map((c) => c.resource));

  return (
    <div className={styles['detail']}>
      {/* Honest in-scene note: Approach A reverses locked per-resource ownership. */}
      <SectionNotice
        type="Warning"
        title="Approach A — aggressive cut"
        description="One owner, one page, no advanced tier. The value has a single per-attribute setter (not per-resource) and a single owner list. This deliberately reverses per-resource-type ownership (locked D1/D2/D3, §4b) — it is the “cut hard” pole for the A vs B review."
      />

      {/* Values — primary editing surface, first (§28 Values-above-Definition). */}
      <ConsolePanel title="Values">
        <StreamlinedValues
          attribute={attribute}
          onAddValue={onAddValue}
          onAddChild={onAddChild}
          onDeleteValue={onDeleteValue}
          onReorder={onReorderValue}
          onLockedAttempt={onValuesLockedAttempt}
          onSharedScale={onSharedScale}
          onUnlink={onUnlink}
        />
      </ConsolePanel>

      {/* Definition — demoted below Values. Name, Type, Description. */}
      <ConsolePanel title="Definition">
        <div className={styles['detail__def']}>
          <div className={styles['detail__def-row']}>
            <span className={styles['detail__def-key']}>Name</span>
            <TextInput
              className={styles['detail__def-input']}
              size="Medium"
              value={attribute.name}
              readOnly={nameReadOnly}
              aria-label="Attribute name"
              onChange={(e) => onDefinitionChange({ name: e.target.value })}
            />
          </div>
          <div className={styles['detail__def-row']}>
            <span className={styles['detail__def-key']}>Type</span>
            <Select
              className={styles['detail__def-input']}
              size="Medium"
              value={attribute.type}
              disabled={typeReadOnly}
              aria-label="Attribute type"
              onChange={(e) =>
                onDefinitionChange({ type: e.target.value as AttrType })
              }
            >
              {ATTR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div className={styles['detail__def-row']}>
            <span className={styles['detail__def-key']}>Description</span>
            <TextArea
              className={styles['detail__def-input']}
              size="Medium"
              value={attribute.description}
              aria-label="Attribute description"
              onChange={(e) =>
                onDefinitionChange({ description: e.target.value })
              }
            />
          </div>
          <div className={styles['detail__def-row']}>
            <span className={styles['detail__def-key']}>Eligibility</span>
            <div className={styles['detail__elig']}>
              <span
                className={[
                  styles['detail__elig-badge'],
                  elig.eligible
                    ? styles['detail__elig-badge--yes']
                    : styles['detail__elig-badge--no'],
                ].join(' ')}
              >
                <Icon
                  size="16"
                  glyph={
                    elig.eligible ? (
                      <CheckCircleOutlineIcon />
                    ) : (
                      <AlertCircleOutlineIcon />
                    )
                  }
                />
                {elig.eligible
                  ? 'Usable in access policies'
                  : 'Not eligible for access policies'}
              </span>
              <span className={styles['detail__elig-why']}>{elig.why}</span>
            </div>
          </div>
        </div>
      </ConsolePanel>

      {/* Applies to — resource multiselect + Required per resource. */}
      <ConsolePanel
        title="Applies to"
        subtitle="Which resources this attribute applies to, and whether it is required on each."
      >
        <div className={styles['detail__resources']}>
          {ALL_RESOURCES.map((r) => {
            const applied = appliedResources.has(r);
            const binding = attribute.appliesTo.find((c) => c.resource === r);
            return (
              <div
                key={r}
                className={[
                  styles['detail__resource'],
                  applied && styles['detail__resource--on'],
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Checkbox
                  size="Medium"
                  checked={applied}
                  disabled={sourceOwned}
                  onChange={() => onToggleResource(r)}
                >
                  {r}
                </Checkbox>
                {applied && (
                  <Checkbox
                    size="Small"
                    checked={!!binding?.required}
                    disabled={sourceOwned}
                    onChange={() => onToggleRequired(r)}
                  >
                    Required
                  </Checkbox>
                )}
              </div>
            );
          })}
        </div>
      </ConsolePanel>

      {/* Who sets the value — ONE derived answer per attribute (not per-resource). */}
      <ConsolePanel
        title="Who sets the value"
        subtitle="A single answer for this attribute, derived from where it applies."
      >
        <div className={styles['detail__single']}>
          <Chip size="Medium" tone="info" leadingIcon={<AccountOutlineIcon />}>
            {setterLabel(attribute)}
          </Chip>
          <p className={styles['detail__single-note']}>
            Approach A uses one setter per attribute — there is no per-resource
            grant editor.
          </p>
        </div>
      </ConsolePanel>

      {/* Who can edit this attribute — ONE owner list (roles + named users). */}
      <ConsolePanel
        title="Who can edit this attribute"
        subtitle="One owner list — no separate edit-definition and manage-values controls."
      >
        {sourceOwned && (
          <LabelTag
            label={`Values locked to ${attribute.source.system}`}
            type="Info"
            size="Small"
          />
        )}
        <div className={styles['detail__owners']}>
          {owners.length === 0 ? (
            <span className={styles['detail__owners-empty']}>
              No owners yet.
            </span>
          ) : (
            owners.map((o) => (
              <Chip
                key={o.subject}
                size="Medium"
                leadingIcon={<ShieldOutlineIcon />}
              >
                {o.subject}
                {o.owner ? ' · owner' : ''}
              </Chip>
            ))
          )}
        </div>
      </ConsolePanel>

      {/* Source health + read-into status — read-only pills, no toggle. */}
      {(sourceOwned || readInto.forced) && (
        <ConsolePanel title="Source">
          <div className={styles['detail__source']}>
            {sourceOwned && attribute.source.state && (
              <SyncPill
                state={attribute.source.state}
                system={attribute.source.system}
                size="Medium"
              />
            )}
            {attribute.source.status && (
              <p className={styles['detail__source-status']}>
                {attribute.source.status}
              </p>
            )}
            {readInto.forced && (
              <Chip
                size="Medium"
                tone={readInto.active ? 'warning' : 'neutral'}
                leadingIcon={<EyeOffOutlineIcon />}
              >
                {readInto.active
                  ? 'Hiding values viewer isn’t cleared for (required for UAS)'
                  : 'Read-into filtering available for UAS'}
              </Chip>
            )}
          </div>
        </ConsolePanel>
      )}
    </div>
  );
}
