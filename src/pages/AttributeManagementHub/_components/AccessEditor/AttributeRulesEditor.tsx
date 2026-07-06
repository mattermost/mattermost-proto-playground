import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import TextInput from '@/components/ui/TextInput/TextInput';
import {
  operatorLabel,
  operatorsForAttrType,
  userRuleAttributes,
  type AttributeAccessRule,
} from '../../hubData';
import styles from './AttributeRulesEditor.module.scss';

export interface AttributeRulesEditorProps {
  rules: AttributeAccessRule[];
  readOnly?: boolean;
  onChange: (rules: AttributeAccessRule[]) => void;
}

function newRuleId(): string {
  return `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AttributeRulesEditor({
  rules,
  readOnly = false,
  onChange,
}: AttributeRulesEditorProps) {
  const attributes = userRuleAttributes();

  const updateRule = (id: string, patch: Partial<AttributeAccessRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRule = (id: string) => {
    onChange(rules.filter((r) => r.id !== id));
  };

  const addRule = () => {
    const first = attributes[0];
    if (!first) return;
    const operator = operatorsForAttrType(first.type)[0]?.id ?? 'is';
    onChange([
      ...rules,
      {
        id: newRuleId(),
        attributeId: first.id,
        attributeLabel: first.label,
        operator,
        value: first.values[0] ?? '',
      },
    ]);
  };

  const onAttributeChange = (id: string, attributeId: string) => {
    const attr = attributes.find((a) => a.id === attributeId);
    if (!attr) return;
    const operator = operatorsForAttrType(attr.type)[0]?.id ?? 'is';
    updateRule(id, {
      attributeId: attr.id,
      attributeLabel: attr.label,
      operator,
      value: attr.values[0] ?? '',
    });
  };

  return (
    <div className={styles['rules']}>
      <div className={styles['rules__table']}>
        <div className={styles['rules__head']}>
          <span>Attribute</span>
          <span>Operator</span>
          <span>Values</span>
          <span className={styles['rules__head-action']} aria-hidden />
        </div>
        {rules.map((rule) => {
          const attr =
            attributes.find((a) => a.id === rule.attributeId) ?? attributes[0];
          const operators = attr ? operatorsForAttrType(attr.type) : [];
          const valueOptions = attr?.values ?? [];

          return (
            <div key={rule.id} className={styles['rules__row']}>
              <div className={styles['rules__cell-attribute']}>
                <Icon
                  size="16"
                  glyph={<DotsHorizontalIcon />}
                  className={styles['rules__drag']}
                />
                <Select
                  className={styles['rules__select']}
                  size="Small"
                  value={rule.attributeId}
                  disabled={readOnly}
                  aria-label="Attribute"
                  onChange={(e) => onAttributeChange(rule.id, e.target.value)}
                >
                  {attributes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Select
                className={styles['rules__select']}
                size="Small"
                value={rule.operator}
                disabled={readOnly || operators.length <= 1}
                aria-label="Operator"
                onChange={(e) =>
                  updateRule(rule.id, { operator: e.target.value })
                }
              >
                {operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    = {op.label}
                  </option>
                ))}
              </Select>
              {valueOptions.length > 0 ? (
                <Select
                  className={styles['rules__select']}
                  size="Small"
                  value={rule.value}
                  disabled={readOnly}
                  aria-label="Value"
                  onChange={(e) =>
                    updateRule(rule.id, { value: e.target.value })
                  }
                >
                  {valueOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </Select>
              ) : (
                <TextInput
                  className={styles['rules__input']}
                  size="Small"
                  value={rule.value}
                  readOnly={readOnly}
                  placeholder="Value"
                  aria-label="Value"
                  onChange={(e) =>
                    updateRule(rule.id, { value: e.target.value })
                  }
                />
              )}
              {!readOnly && (
                <IconButton
                  size="Small"
                  destructive
                  aria-label={`Remove rule for ${rule.attributeLabel}`}
                  icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
                  onClick={() => removeRule(rule.id)}
                />
              )}
            </div>
          );
        })}
        {!readOnly && (
          <div className={styles['rules__add']}>
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
              onClick={addRule}
            >
              Select attribute
            </Button>
          </div>
        )}
      </div>
      <p className={styles['rules__helper']}>
        Each row is a single condition. All rules are combined with logical AND (
        {operatorLabel('is')} means exact match).
      </p>
      {rules.length > 0 && (
        <div className={styles['rules__summary']}>
          {rules.map((rule) => (
            <span key={rule.id} className={styles['rules__summary-chip']}>
              {rule.attributeLabel} {operatorLabel(rule.operator)} {rule.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
