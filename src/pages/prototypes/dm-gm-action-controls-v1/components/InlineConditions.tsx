// [AI DRAFT] PRIMARY variation, "Inline conditions": recipient conditions are
// rows in the shipped "User attribute requirements" table, next to the user
// rows. Each row names its subject (User / Recipient). Comparisons work in
// both directions: whichever subject a row has, "is same as" compares it with
// an attribute of the OTHER subject. One All / Any join covers the table
// (draft). Advanced mode shows one CEL expression over `user.` and `target.`.
// Session attributes are user-only and never compared: a recipient has no
// evaluable session.
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
import { ACTING_LABEL, COMPARISON, EDITOR, TARGET_LABEL } from '../copy';
import { AttributeChip, CellMenu } from './CellMenu';
import MatchControl from './MatchControl';
import styles from './PolicyEditor.module.scss';

type InlineOperator = 'is' | 'is not' | 'same' | 'not-same';

const OPERATOR_LABEL: Record<InlineOperator, string> = {
  is: 'is',
  'is not': 'is not',
  same: COMPARISON.isSameAs,
  'not-same': COMPARISON.isNotSameAs,
};

/** Left-side choices, grouped by subject. Session attributes are user-only. */
const ATTRIBUTE_GROUPS = [
  {
    heading: ACTING_LABEL,
    options: (Object.keys(USER_ATTRIBUTES) as UserAttributeKey[]).map((a) => ({
      value: `acting:${a}`,
      label: `${ACTING_LABEL}: ${a}`,
    })),
  },
  {
    heading: EDITOR.actingSessionGroup,
    options: (Object.keys(SESSION_ATTRIBUTES) as AttributeKey[]).map((a) => ({
      value: `acting:${a}`,
      label: `${EDITOR.actingSessionGroup}: ${a}`,
    })),
  },
  {
    heading: TARGET_LABEL,
    options: (Object.keys(USER_ATTRIBUTES) as UserAttributeKey[]).map((a) => ({
      value: `other:${a}`,
      label: `${TARGET_LABEL}: ${a}`,
    })),
  },
];

const FIXED_OPERATORS: InlineOperator[] = ['is', 'is not'];
const COMPARE_OPERATORS: InlineOperator[] = [
  'is',
  'is not',
  'same',
  'not-same',
];

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
          <MenuGroupHeading label={ACTING_LABEL} />
          {userKeys.map((k) => (
            <MenuItem
              key={`a-${k}`}
              label={k}
              leadingVisual={<Icon glyph={<TextShortIcon />} />}
              onClick={() => pick('acting', k)}
            />
          ))}
          <MenuGroupHeading label={EDITOR.actingSessionGroup} />
          {sessionKeys.map((k) => (
            <MenuItem
              key={`s-${k}`}
              label={k}
              leadingVisual={<Icon glyph={<LaptopIcon />} />}
              onClick={() => pick('acting', k)}
            />
          ))}
          <MenuGroupHeading label={TARGET_LABEL} />
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

/**
 * One requirements row. For "is same as", the value side is an attribute of
 * the OTHER subject: a User row compares with the Recipient and vice versa.
 * It defaults to the same-named attribute and can be changed to any user
 * attribute (all demo attributes are select type, so all are compatible).
 */
function ConditionRow({
  subject,
  attribute,
  session,
  operators,
  operator,
  fixedValues,
  fixedValue,
  compareAttrs,
  compareAttr,
  onOperator,
  onValue,
  onRemove,
  onAttribute,
}: {
  subject: 'acting' | 'other';
  attribute: AttributeKey;
  session: boolean;
  operators: InlineOperator[];
  operator: InlineOperator;
  fixedValues: string[];
  fixedValue: string;
  compareAttrs: UserAttributeKey[];
  compareAttr?: UserAttributeKey;
  onOperator: (op: InlineOperator) => void;
  onValue: (value: string) => void;
  onRemove: () => void;
  /** Change the left side: "acting:Program", "acting:Network" or "other:Program". */
  onAttribute: (key: string) => void;
}) {
  const label = subject === 'acting' ? ACTING_LABEL : TARGET_LABEL;
  const otherLabel = subject === 'acting' ? TARGET_LABEL : ACTING_LABEL;
  const compare = operator === 'same' || operator === 'not-same';
  const compared = compareAttr ?? (attribute as UserAttributeKey);
  // "User: Program", or "User's session: Network" for session attributes.
  const subjectPrefix =
    session && subject === 'acting' ? EDITOR.actingSessionGroup : label;
  return (
    <tr>
      <td className={styles['policy-editor__cell--trigger']}>
        {/* The attribute is a variable too: a chip, and editable like the
            other cells. Picking one can also switch the row's subject. */}
        <CellMenu
          ariaLabel={EDITOR.rowAria(label, attribute, 'attribute')}
          groups={ATTRIBUTE_GROUPS}
          value={`${subject}:${attribute}`}
          onChange={onAttribute}
        >
          <AttributeChip label={`${subjectPrefix}: ${attribute}`} />
        </CellMenu>
      </td>
      <td className={styles['policy-editor__cell--trigger']}>
        <CellMenu
          ariaLabel={EDITOR.rowAria(label, attribute, 'operator')}
          options={operators.map((o) => ({
            value: o,
            label: OPERATOR_LABEL[o],
          }))}
          value={operator}
          onChange={(v) => onOperator(v as InlineOperator)}
        >
          {OPERATOR_LABEL[operator]}
        </CellMenu>
      </td>
      <td className={styles['policy-editor__cell--trigger']}>
        {compare ? (
          <CellMenu
            ariaLabel={EDITOR.compareAria(label, attribute)}
            options={compareAttrs.map((a) => ({
              value: a,
              label: `${otherLabel}: ${a}`,
            }))}
            value={compared}
            onChange={onValue}
            chevron
          >
            <AttributeChip label={`${otherLabel}: ${compared}`} />
          </CellMenu>
        ) : (
          <CellMenu
            ariaLabel={EDITOR.rowAria(label, attribute, 'value')}
            options={fixedValues.map((v) => ({ value: v, label: v }))}
            value={fixedValue}
            onChange={onValue}
            chevron
          >
            {fixedValue}
          </CellMenu>
        )}
      </td>
      <td className={styles['policy-editor__table-right']}>
        <DeleteRow
          label={EDITOR.removeRowAria(label, attribute)}
          onClick={onRemove}
        />
      </td>
    </tr>
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
    new Set([
      ...policy.other.map((c) => c.attribute),
      ...policy.acting.flatMap((c) => (c.compareTo ? [c.compareTo] : [])),
    ]),
  );

  const userAttrs = Object.keys(USER_ATTRIBUTES) as UserAttributeKey[];

  const setActing = (id: string, op: InlineOperator, value?: string) =>
    onChange({
      ...policy,
      acting: policy.acting.map((c) => {
        if (c.id !== id) return c;
        const compare = op === 'same' || op === 'not-same';
        const operator: Operator =
          op === 'is' || op === 'same' ? 'is' : 'is not';
        if (compare) {
          const target =
            (value as UserAttributeKey | undefined) ??
            c.compareTo ??
            (c.attribute as UserAttributeKey);
          return { ...c, operator, compareTo: target };
        }
        const fixed =
          value ?? (c.compareTo ? valuesFor(c.attribute)[0] : c.value);
        return { ...c, operator, value: fixed, compareTo: undefined };
      }),
    });

  const setOther = (id: string, op: InlineOperator, value?: string) =>
    onChange({
      ...policy,
      other: policy.other.map((c) => {
        if (c.id !== id) return c;
        const compare = op === 'same' || op === 'not-same';
        const operator: Operator =
          op === 'is' || op === 'same' ? 'is' : 'is not';
        if (compare) {
          const userAttr =
            (value as UserAttributeKey | undefined) ??
            (c.value.kind === 'same'
              ? (c.value.attribute ?? c.attribute)
              : c.attribute);
          return {
            ...c,
            operator,
            value: { kind: 'same' as const, attribute: userAttr },
          };
        }
        const fixed =
          value ??
          (c.value.kind === 'fixed'
            ? c.value.value
            : USER_ATTRIBUTES[c.attribute][0]);
        return {
          ...c,
          operator,
          value: { kind: 'fixed' as const, value: fixed },
        };
      }),
    });

  /**
   * Change a row's left side. The row keeps its id and position in its list;
   * a subject change moves it between the User and Recipient lists. A
   * comparison survives when the new attribute can be compared (not session);
   * otherwise the row resets to "is" and the attribute's first value.
   */
  const retarget = (from: 'acting' | 'other', id: string, key: string) => {
    const [to, attr] = key.split(':') as ['acting' | 'other', AttributeKey];
    const current =
      from === 'acting'
        ? policy.acting.find((c) => c.id === id)
        : policy.other.find((c) => c.id === id);
    if (!current) return;
    if (from === to && current.attribute === attr) return;
    const wasCompare =
      from === 'acting'
        ? Boolean((current as (typeof policy.acting)[number]).compareTo)
        : (current as (typeof policy.other)[number]).value.kind === 'same';
    const keepCompare = wasCompare && !isSessionAttribute(attr);
    const operator = current.operator;
    const acting = policy.acting.filter((c) => c.id !== id);
    const other = policy.other.filter((c) => c.id !== id);
    if (to === 'acting') {
      const row = {
        id,
        attribute: attr,
        operator: keepCompare ? operator : ('is' as Operator),
        value: valuesFor(attr)[0],
        compareTo: keepCompare ? (attr as UserAttributeKey) : undefined,
      };
      const at =
        from === 'acting'
          ? policy.acting.findIndex((c) => c.id === id)
          : acting.length;
      acting.splice(at, 0, row);
    } else {
      const userAttr = attr as UserAttributeKey;
      const row = {
        id,
        attribute: userAttr,
        operator: keepCompare ? operator : ('is' as Operator),
        value: keepCompare
          ? { kind: 'same' as const, attribute: userAttr }
          : { kind: 'fixed' as const, value: USER_ATTRIBUTES[userAttr][0] },
      };
      const at =
        from === 'other'
          ? policy.other.findIndex((c) => c.id === id)
          : other.length;
      other.splice(at, 0, row);
    }
    onChange({ ...policy, acting, other });
  };

  const removeActing = (id: string) =>
    onChange({ ...policy, acting: policy.acting.filter((c) => c.id !== id) });
  const removeOther = (id: string) =>
    onChange({ ...policy, other: policy.other.filter((c) => c.id !== id) });

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
                <th className={styles['policy-editor__table-right']}>
                  <MatchControl
                    value={policy.match}
                    onChange={(match) => onChange({ ...policy, match })}
                  />
                </th>
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
              {policy.acting.map((row) => {
                const session = isSessionAttribute(row.attribute);
                const op: InlineOperator = row.compareTo
                  ? row.operator === 'is'
                    ? 'same'
                    : 'not-same'
                  : row.operator;
                return (
                  <ConditionRow
                    key={row.id}
                    subject="acting"
                    attribute={row.attribute}
                    session={session}
                    // A session attribute can't be compared with a recipient.
                    operators={session ? FIXED_OPERATORS : COMPARE_OPERATORS}
                    operator={op}
                    fixedValues={valuesFor(row.attribute)}
                    fixedValue={row.value}
                    compareAttrs={userAttrs}
                    compareAttr={row.compareTo}
                    onOperator={(v) => setActing(row.id, v)}
                    onValue={(v) => setActing(row.id, op, v)}
                    onRemove={() => removeActing(row.id)}
                    onAttribute={(key) => retarget('acting', row.id, key)}
                  />
                );
              })}
              {policy.other.map((row) => {
                const compare = row.value.kind === 'same';
                const op: InlineOperator = compare
                  ? row.operator === 'is'
                    ? 'same'
                    : 'not-same'
                  : row.operator;
                return (
                  <ConditionRow
                    key={row.id}
                    subject="other"
                    attribute={row.attribute}
                    session={false}
                    operators={COMPARE_OPERATORS}
                    operator={op}
                    fixedValues={USER_ATTRIBUTES[row.attribute]}
                    fixedValue={
                      row.value.kind === 'fixed' ? row.value.value : ''
                    }
                    compareAttrs={userAttrs}
                    compareAttr={
                      row.value.kind === 'same'
                        ? (row.value.attribute ?? row.attribute)
                        : undefined
                    }
                    onOperator={(v) => setOther(row.id, v)}
                    onValue={(v) => setOther(row.id, op, v)}
                    onRemove={() => removeOther(row.id)}
                    onAttribute={(key) => retarget('other', row.id, key)}
                  />
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
            title={EDITOR.missingAttribute(missingAttrs)}
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
