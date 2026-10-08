// [AI DRAFT] Direction B: the Permission Policies list and the "Add policy"
// chooser. Starting rules are generated from this server's attributes, so no
// mapping step is needed; rules the server can't support are not listed.
import { Button } from '@mattermost/compass-ui/components/button';
import { AdminConsoleHeader } from '@mattermost/compass-ui/components/admin-console-header';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { Radio } from '@mattermost/compass-ui/components/radio';
import { Tag } from '@mattermost/compass-ui/components/tag';
import type { RuleUse, StartingRule } from '../policyModel';
import { CHOOSER, SUMMARY } from '../copy';
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
  uses,
}: {
  id: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  tags?: string[];
  uses?: RuleUse[];
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
          {uses && uses.length > 0 ? (
            <span className={styles['add-policy__choice-uses']}>
              <span className={styles['add-policy__choice-uses-label']}>
                {CHOOSER.usesLabel}
              </span>
              {uses.map((u) => (
                <Tag
                  key={`${u.attribute}-${u.value ?? ''}`}
                  label={CHOOSER.usesTag(u.attribute, u.value)}
                  size="x-small"
                />
              ))}
            </span>
          ) : null}
        </span>
      </Radio>
    </div>
  );
}

export function StartingRuleChooser({
  rules,
  selected,
  onSelect,
  onContinue,
}: {
  rules: StartingRule[];
  selected: string;
  onSelect: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <Modal
      size="medium"
      className={styles['add-policy__modal']}
      title="Add policy"
      subtitle="Pick a starting rule for direct and group messages, or begin with a blank policy."
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
        {rules.length > 0 ? (
          <>
            <h3 className={styles['add-policy__section-label']}>
              {CHOOSER.rulesHeading}
            </h3>
            <div
              className={styles['add-policy__choices']}
              role="radiogroup"
              aria-label="Starting rule"
            >
              {rules.map((rule) => (
                <ChoiceCard
                  key={rule.id}
                  id={rule.id}
                  checked={selected === rule.id}
                  onSelect={() => onSelect(rule.id)}
                  title={rule.name}
                  description={rule.description}
                  tags={rule.tags}
                  uses={rule.uses}
                />
              ))}
            </div>
          </>
        ) : null}
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
