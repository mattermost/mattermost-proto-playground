// [AI DRAFT] Direction B: the Permission Policies list, the "Add policy"
// chooser (starting rules or blank), and the mandatory attribute-mapping step.
import { Button } from '@mattermost/compass-ui/components/button';
import { AdminConsoleHeader } from '@mattermost/compass-ui/components/admin-console-header';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { Radio } from '@mattermost/compass-ui/components/radio';
import { Select } from '@mattermost/compass-ui/components/select';
import { Tag } from '@mattermost/compass-ui/components/tag';
import {
  SESSION_ATTRIBUTES,
  USER_ATTRIBUTES,
  valuesFor,
  type AttributeKey,
} from '../dmgmData';
import {
  STARTING_RULES,
  isMappingComplete,
  type Mapping,
  type StartingRule,
} from '../policyModel';
import { SUMMARY } from '../copy';
import styles from './AddPolicyFlow.module.scss';

/* ------------------------------------------------------------------ */
/* Permission Policies list (background page)                          */
/* ------------------------------------------------------------------ */

const EXISTING_POLICIES = [
  {
    name: 'Managed devices only for files',
    permissions: 'Download Files, Upload Files',
    role: 'Members',
  },
  {
    name: 'Guest file uploads',
    permissions: 'Upload Files',
    role: 'Guest users',
  },
];

export function PoliciesListPage({
  onAddPolicy,
}: {
  onAddPolicy?: () => void;
}) {
  return (
    <div className={styles['add-policy']}>
      {/* Shipped admin.permission_policies.page_title / .add_policy / .description */}
      <AdminConsoleHeader
        title="Permission Policies"
        trailing={
          <Button emphasis="primary" size="small" onClick={onAddPolicy}>
            Add policy
          </Button>
        }
      />
      <div className={styles['add-policy__page-body']}>
        <p className={styles['add-policy__page-description']}>
          Create policies to control what users can do, based on their
          attributes.
        </p>
        <div className={styles['add-policy__list']}>
          <table className={styles['add-policy__table']}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Applies to</th>
                <th>Permissions</th>
              </tr>
            </thead>
            <tbody>
              {EXISTING_POLICIES.map((p) => (
                <tr key={p.name}>
                  <td className={styles['add-policy__strong']}>{p.name}</td>
                  <td>{p.role}</td>
                  <td>{p.permissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chooser                                                             */
/* ------------------------------------------------------------------ */

export const BLANK_ID = 'blank';

function ChoiceCard({
  id,
  checked,
  onSelect,
  title,
  description,
  tags,
}: {
  id: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  tags?: string[];
}) {
  return (
    <div
      className={[
        styles['add-policy__choice'],
        checked ? styles['add-policy__choice--checked'] : '',
      ]
        .join(' ')
        .trim()}
    >
      <Radio
        id={`dmgm-choice-${id}`}
        name="dmgm-starting-rule"
        value={id}
        checked={checked}
        onChange={onSelect}
        className={styles['add-policy__radio']}
      >
        <span className={styles['add-policy__choice-text']}>
          <span className={styles['add-policy__choice-head']}>
            <span className={styles['add-policy__choice-title']}>{title}</span>
            {tags && tags.length > 0 ? (
              <span className={styles['add-policy__choice-tags']}>
                {tags.map((t) => (
                  <Tag
                    key={t}
                    label={t}
                    type={t === SUMMARY.tagOneWay ? 'warning' : 'default'}
                  />
                ))}
              </span>
            ) : null}
          </span>
          <span className={styles['add-policy__choice-description']}>
            {description}
          </span>
        </span>
      </Radio>
    </div>
  );
}

export function StartingRuleChooser({
  selected,
  onSelect,
  onContinue,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <Modal
      size="medium"
      title="Add policy"
      subtitle="Start from a rule for direct and group messages, or start from a blank policy."
      footer={
        <>
          <Button emphasis="tertiary">Cancel</Button>
          <Button emphasis="primary" onClick={onContinue}>
            Continue
          </Button>
        </>
      }
    >
      <div className={styles['add-policy__chooser']}>
        <h3 className={styles['add-policy__section-label']}>
          Direct and group message rules
        </h3>
        <div
          className={styles['add-policy__choices']}
          role="radiogroup"
          aria-label="Starting rule"
        >
          {STARTING_RULES.map((rule) => (
            <ChoiceCard
              key={rule.id}
              id={rule.id}
              checked={selected === rule.id}
              onSelect={() => onSelect(rule.id)}
              title={rule.name}
              description={rule.description}
              tags={rule.tags}
            />
          ))}
        </div>
        <h3 className={styles['add-policy__section-label']}>Other</h3>
        <ChoiceCard
          id={BLANK_ID}
          checked={selected === BLANK_ID}
          onSelect={() => onSelect(BLANK_ID)}
          title="Blank policy"
          description="Choose the permissions and conditions yourself."
        />
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Mapping step                                                        */
/* ------------------------------------------------------------------ */

function attributeOptions(kind: 'user-attribute' | 'session-attribute') {
  const keys =
    kind === 'user-attribute'
      ? Object.keys(USER_ATTRIBUTES)
      : Object.keys(SESSION_ATTRIBUTES);
  return keys.map((k) => ({ value: k, label: k }));
}

export function MappingStep({
  rule,
  mapping,
  onChange,
  onBack,
  onContinue,
}: {
  rule: StartingRule;
  mapping: Mapping;
  onChange: (next: Mapping) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const complete = isMappingComplete(rule, mapping);
  const mappedCount = rule.placeholders.filter((p) => mapping[p.id]).length;

  return (
    <Modal
      size="medium"
      title="Map attributes"
      subtitle={`“${rule.name}” refers to the attributes below. Choose the attribute and value on this server that each one means.`}
      showBackButton
      onBack={onBack}
      footerLeading={
        <span
          className={styles['add-policy__progress']}
          id="dmgm-mapping-status"
          role="status"
        >
          {complete
            ? 'All attributes mapped'
            : `${mappedCount} of ${rule.placeholders.length} mapped. Map every attribute to continue.`}
        </span>
      }
      footer={
        <>
          <Button emphasis="tertiary">Cancel</Button>
          <Button
            emphasis="primary"
            disabled={!complete}
            aria-describedby="dmgm-mapping-status"
            onClick={complete ? onContinue : undefined}
          >
            Open in editor
          </Button>
        </>
      }
    >
      <div className={styles['add-policy__mapping']}>
        {rule.placeholders.map((p) => {
          const isValue = p.kind === 'value';
          const parent =
            isValue && p.of
              ? (mapping[p.of] as AttributeKey | undefined)
              : undefined;
          const options = isValue
            ? parent
              ? valuesFor(parent).map((v) => ({ value: v, label: v }))
              : []
            : attributeOptions(
                p.kind as 'user-attribute' | 'session-attribute',
              );
          return (
            <div
              key={p.id}
              className={[
                styles['add-policy__map-row'],
                isValue ? styles['add-policy__map-row--value'] : '',
              ]
                .join(' ')
                .trim()}
            >
              <div className={styles['add-policy__map-text']}>
                <span className={styles['add-policy__map-label']}>
                  {isValue ? `Value: ${p.label}` : p.label}
                  {p.kind === 'session-attribute' ? (
                    <Tag label="Session" type="default" />
                  ) : null}
                </span>
                <span className={styles['add-policy__map-hint']}>{p.hint}</span>
              </div>
              <Select
                className={styles['add-policy__map-select']}
                aria-label={
                  isValue ? `Value for ${p.label}` : `Attribute for ${p.label}`
                }
                placeholder={
                  isValue
                    ? parent
                      ? 'Select a value'
                      : 'Map the attribute first'
                    : 'Select an attribute'
                }
                disabled={isValue && !parent}
                invalid={false}
                options={options}
                value={mapping[p.id] ?? ''}
                onChange={(v) => {
                  const next: Mapping = { ...mapping, [p.id]: v };
                  // A new attribute invalidates any value chosen for the old one.
                  for (const child of rule.placeholders) {
                    if (child.of === p.id) {
                      delete next[child.id];
                    }
                  }
                  onChange(next);
                }}
              />
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
