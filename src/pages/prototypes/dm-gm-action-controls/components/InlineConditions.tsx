// [AI DRAFT] PRIMARY variation, "Inline conditions": other-person conditions are
// rows in the shipped "User attribute requirements" table, next to the
// acting-user rows. Each row names its subject (Acting user / Other person).
// Rows are joined with AND, as shipped. Advanced mode shows one CEL expression
// over `user.` and `target.`. Session attributes are offered for the acting
// user only, because the other person's session can't be evaluated.
import { useCallback, useRef, useState } from 'react';
import LaptopIcon from '@mattermost/compass-icons/components/laptop';
import TextShortIcon from '@mattermost/compass-icons/components/text-short';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import { SectionNotice } from '@mattermost/compass-ui/components/section-notice';
import { Select } from '@mattermost/compass-ui/components/select';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  SESSION_ATTRIBUTES,
  USER_ATTRIBUTES,
  isSessionAttribute,
  valuesFor,
  type AttributeKey,
  type UserAttributeKey,
} from '../dmgmData';
import {
  isSimpleExpressible,
  nextConditionId,
  toCel,
  type DmPolicy,
  type Operator,
} from '../policyModel';
import styles from './PolicyEditor.module.scss';

type InlineOperator = 'is' | 'is not' | 'is same as' | 'is not same as';

const ACTING_OPERATORS: InlineOperator[] = ['is', 'is not'];
const OTHER_OPERATORS: InlineOperator[] = [
  'is',
  'is not',
  'is same as',
  'is not same as',
];

function SubjectTag({ subject }: { subject: 'acting' | 'other' }) {
  return subject === 'acting' ? (
    <Tag label="Acting user" size="small" />
  ) : (
    <Tag label="Other person" type="info" size="small" />
  );
}

function AddConditionButton({
  onAdd,
}: {
  onAdd: (subject: 'acting' | 'other', a: AttributeKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClose(ref, open, close);
  const userKeys = Object.keys(USER_ATTRIBUTES) as UserAttributeKey[];
  const sessionKeys = Object.keys(SESSION_ATTRIBUTES) as AttributeKey[];
  const pick = (subject: 'acting' | 'other', a: AttributeKey) => {
    onAdd(subject, a);
    close();
  };
  return (
    <div className={styles['policy-editor__anchor']} ref={ref}>
      <Button
        emphasis="tertiary"
        size="small"
        onClick={() => setOpen((o) => !o)}
      >
        + Add attribute
      </Button>
      {open ? (
        <PopoverMenu className={styles['policy-editor__add-menu']}>
          <MenuGroupHeading label="Acting user" />
          {userKeys.map((k) => (
            <MenuItem
              key={`a-${k}`}
              label={k}
              leadingVisual={<Icon glyph={<TextShortIcon />} />}
              onClick={() => pick('acting', k)}
            />
          ))}
          <MenuGroupHeading label="Acting user's session" />
          {sessionKeys.map((k) => (
            <MenuItem
              key={`s-${k}`}
              label={k}
              leadingVisual={<Icon glyph={<LaptopIcon />} />}
              onClick={() => pick('acting', k)}
            />
          ))}
          <MenuGroupHeading label="Other person" />
          {userKeys.map((k) => (
            <MenuItem
              key={`o-${k}`}
              label={k}
              leadingVisual={<Icon glyph={<TextShortIcon />} />}
              onClick={() => pick('other', k)}
            />
          ))}
        </PopoverMenu>
      ) : null}
    </div>
  );
}

function DeleteRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <IconButton
      size="small"
      destructive
      icon={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
      aria-label={label}
      onClick={onClick}
    />
  );
}

export interface InlineConditionsProps {
  policy: DmPolicy;
  onChange: (next: DmPolicy) => void;
  onSimulate?: () => void;
  /** Open in Advanced mode. Forced when the policy can't be written as AND rows. */
  initialAdvanced?: boolean;
}

export default function InlineConditions({
  policy,
  onChange,
  onSimulate,
  initialAdvanced = false,
}: InlineConditionsProps) {
  const simple = isSimpleExpressible(policy);
  const [advanced, setAdvanced] = useState(initialAdvanced || !simple);
  const showAdvanced = advanced || !simple;
  const missingAttrs = Array.from(
    new Set(policy.other.map((c) => c.attribute)),
  );

  const setActing = (id: string, op: InlineOperator, value?: string) =>
    onChange({
      ...policy,
      acting: policy.acting.map((c) =>
        c.id === id
          ? { ...c, operator: op as Operator, value: value ?? c.value }
          : c,
      ),
    });

  const setOther = (id: string, op: InlineOperator, value?: string) =>
    onChange({
      ...policy,
      other: policy.other.map((c) => {
        if (c.id !== id) return c;
        const same = op === 'is same as' || op === 'is not same as';
        const operator: Operator =
          op === 'is' || op === 'is same as' ? 'is' : 'is not';
        const fixed =
          value ??
          (c.value.kind === 'fixed'
            ? c.value.value
            : USER_ATTRIBUTES[c.attribute][0]);
        return {
          ...c,
          operator,
          value: same
            ? { kind: 'same' as const }
            : { kind: 'fixed' as const, value: fixed },
        };
      }),
    });

  return (
    <>
      <div
        className={styles['policy-editor__table-head-row']}
        data-dmgm-section="acting"
      >
        {/* Shipped admin.permission_policies.edit.who.attributes_title */}
        <h3 className={styles['policy-editor__subhead']}>
          User attribute requirements
        </h3>
        {showAdvanced ? (
          <Button
            emphasis="secondary"
            size="small"
            aria-disabled={!simple || undefined}
            aria-describedby={!simple ? 'dmgm-complex-expression' : undefined}
            className={
              !simple ? styles['policy-editor__button--blocked'] : undefined
            }
            onClick={() => {
              if (simple) setAdvanced(false);
            }}
          >
            Switch to Simple Mode
          </Button>
        ) : (
          <Button
            emphasis="secondary"
            size="small"
            onClick={() => setAdvanced(true)}
          >
            Switch to Advanced Mode
          </Button>
        )}
      </div>

      {showAdvanced ? (
        <div className={styles['policy-editor__cel']}>
          <TextArea
            className={styles['policy-editor__cel-input']}
            aria-label="Access expression"
            rows={4}
            readOnly
            value={toCel(policy)}
          />
          {!simple ? (
            // Shipped admin.permission_policies.edit.complex_expression_tooltip
            <p
              className={styles['policy-editor__cel-hint']}
              id="dmgm-complex-expression"
            >
              Complex expression detected. Simple expressions editor is not
              available at the moment.
            </p>
          ) : null}
        </div>
      ) : (
        <div className={styles['policy-editor__table-wrap']}>
          <table className={styles['policy-editor__table']}>
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Operator</th>
                <th>Values</th>
                <th className={styles['policy-editor__table-right']} />
              </tr>
            </thead>
            <tbody>
              {policy.acting.length + policy.other.length === 0 ? (
                <tr>
                  {/* Shipped admin.access_control.table_editor.blank_state */}
                  <td
                    colSpan={4}
                    className={styles['policy-editor__empty-other']}
                  >
                    Select a user attribute and values to create a rule
                  </td>
                </tr>
              ) : null}
              {policy.acting.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className={styles['policy-editor__cell-icon-text']}>
                      <SubjectTag subject="acting" />
                      <Icon
                        glyph={
                          isSessionAttribute(row.attribute) ? (
                            <LaptopIcon />
                          ) : (
                            <TextShortIcon />
                          )
                        }
                        size="16"
                      />
                      {row.attribute}
                    </span>
                  </td>
                  <td>
                    <Select
                      size="small"
                      className={styles['policy-editor__cell-select--narrow']}
                      aria-label={`Acting user ${row.attribute} operator`}
                      options={ACTING_OPERATORS.map((o) => ({
                        value: o,
                        label: o,
                      }))}
                      value={row.operator}
                      onChange={(v) => setActing(row.id, v as InlineOperator)}
                    />
                  </td>
                  <td>
                    <Select
                      size="small"
                      className={styles['policy-editor__cell-select']}
                      aria-label={`Acting user ${row.attribute} value`}
                      options={valuesFor(row.attribute).map((v) => ({
                        value: v,
                        label: v,
                      }))}
                      value={row.value}
                      onChange={(v) => setActing(row.id, row.operator, v)}
                    />
                  </td>
                  <td className={styles['policy-editor__table-right']}>
                    <DeleteRow
                      label={`Remove acting user ${row.attribute} condition`}
                      onClick={() =>
                        onChange({
                          ...policy,
                          acting: policy.acting.filter((c) => c.id !== row.id),
                        })
                      }
                    />
                  </td>
                </tr>
              ))}
              {policy.other.map((row) => {
                const same = row.value.kind === 'same';
                const op: InlineOperator = same
                  ? row.operator === 'is'
                    ? 'is same as'
                    : 'is not same as'
                  : row.operator;
                return (
                  <tr key={row.id}>
                    <td>
                      <span className={styles['policy-editor__cell-icon-text']}>
                        <SubjectTag subject="other" />
                        <Icon glyph={<TextShortIcon />} size="16" />
                        {row.attribute}
                      </span>
                    </td>
                    <td>
                      <Select
                        size="small"
                        className={styles['policy-editor__cell-select--narrow']}
                        aria-label={`Other person ${row.attribute} operator`}
                        options={OTHER_OPERATORS.map((o) => ({
                          value: o,
                          label: o,
                        }))}
                        value={op}
                        onChange={(v) => setOther(row.id, v as InlineOperator)}
                      />
                    </td>
                    <td>
                      {same ? (
                        <span
                          className={styles['policy-editor__cell-icon-text']}
                        >
                          <SubjectTag subject="acting" />
                          {row.attribute}
                        </span>
                      ) : (
                        <Select
                          size="small"
                          className={styles['policy-editor__cell-select']}
                          aria-label={`Other person ${row.attribute} value`}
                          options={USER_ATTRIBUTES[row.attribute].map((v) => ({
                            value: v,
                            label: v,
                          }))}
                          value={
                            row.value.kind === 'fixed' ? row.value.value : ''
                          }
                          onChange={(v) => setOther(row.id, op, v)}
                        />
                      )}
                    </td>
                    <td className={styles['policy-editor__table-right']}>
                      <DeleteRow
                        label={`Remove other person ${row.attribute} condition`}
                        onClick={() =>
                          onChange({
                            ...policy,
                            other: policy.other.filter((c) => c.id !== row.id),
                          })
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className={styles['policy-editor__table-footer']}>
            <AddConditionButton
              onAdd={(subject, attribute) =>
                subject === 'acting'
                  ? onChange({
                      ...policy,
                      acting: [
                        ...policy.acting,
                        {
                          id: nextConditionId(),
                          attribute,
                          operator: 'is',
                          value: valuesFor(attribute)[0],
                        },
                      ],
                    })
                  : onChange({
                      ...policy,
                      other: [
                        ...policy.other,
                        {
                          id: nextConditionId(),
                          attribute: attribute as UserAttributeKey,
                          operator: 'is',
                          value: { kind: 'same' },
                        },
                      ],
                    })
              }
            />
          </div>
        </div>
      )}

      {missingAttrs.length > 0 ? (
        <div className={styles['policy-editor__missing-note']}>
          <SectionNotice
            type="info"
            title={`People and bots without ${missingAttrs.join(' or ')} are denied, including users on connected servers.`}
          />
        </div>
      ) : null}

      <div className={styles['policy-editor__table-caption-row']}>
        {/* Shipped admin.permission_policies.edit.who.attributes_subtitle */}
        <p className={styles['policy-editor__muted']}>
          Select attributes and values that users must have for this policy
        </p>
        {/* Shipped admin.permission_policies.editor.simulate_rules */}
        <Button emphasis="tertiary" size="small" onClick={onSimulate}>
          Simulate rules
        </Button>
      </div>
    </>
  );
}
