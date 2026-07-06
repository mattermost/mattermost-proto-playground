import { useMemo, useState } from 'react';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Select from '@/components/ui/Select/Select';
import TextInput from '@/components/ui/TextInput/TextInput';
import ConsoleFrame from '../shared/ConsoleFrame';
import PlatformIcons from '../shared/PlatformIcons';
import { SESSION_ATTRIBUTES } from '../shared/mockData';
import type { SessionAttribute } from '../shared/types';
import styles from './PolicyEditorSimple.module.scss';

interface PolicyEditorSimpleProps {
  role?: 'system' | 'channel';
  onBack?: () => void;
}

interface Condition {
  id: string;
  attrId: string;
  operator: string;
  value: string;
}

const OPERATORS_BY_TYPE: Record<string, string[]> = {
  String: ['equals', 'matches pattern', 'is one of'],
  IP: ['equals', 'in CIDR range', 'is one of'],
  Boolean: ['is true', 'is false'],
  Version: ['equals', 'greater than or equal', 'less than'],
  Enum: ['equals', 'is one of', 'not one of'],
};

const INITIAL_USER_CONDITIONS = [
  { id: 'u-1', label: 'user.attributes.department equals "Engineering — Cleared"' },
];

const INITIAL_SESSION_CONDITIONS: Condition[] = [
  {
    id: 'sc-1',
    attrId: 'mdm_enrolled',
    operator: 'is true',
    value: 'true',
  },
  {
    id: 'sc-2',
    attrId: 'vpn_active',
    operator: 'is true',
    value: 'true',
  },
  {
    id: 'sc-3',
    attrId: 'server_fqdn',
    operator: 'matches pattern',
    value: '*.il4.example.mil',
  },
];

export default function PolicyEditorSimple({
  role = 'system',
  onBack,
}: PolicyEditorSimpleProps) {
  const [conditions, setConditions] = useState<Condition[]>(
    INITIAL_SESSION_CONDITIONS,
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  const allAttrs = SESSION_ATTRIBUTES.filter((a) => a.enabled);

  const conditionsWithAttrs = useMemo(
    () =>
      conditions
        .map((c) => ({
          condition: c,
          attr: SESSION_ATTRIBUTES.find((a) => a.id === c.attrId),
        }))
        .filter((x): x is { condition: Condition; attr: SessionAttribute } => Boolean(x.attr)),
    [conditions],
  );

  const platformWarnings = useMemo(() => {
    const warnings: { attr: SessionAttribute; platforms: string[] }[] = [];
    for (const { attr } of conditionsWithAttrs) {
      const probs: string[] = [];
      if (attr.desktop.state !== 'available') probs.push('Desktop');
      if (attr.mobile.state !== 'available') probs.push('Mobile');
      if (attr.browser.state !== 'available') probs.push('Browser');
      if (probs.length) warnings.push({ attr, platforms: probs });
    }
    return warnings;
  }, [conditionsWithAttrs]);

  function addCondition(attr: SessionAttribute) {
    const operators = OPERATORS_BY_TYPE[attr.type] ?? ['equals'];
    setConditions((cs) => [
      ...cs,
      {
        id: `sc-${Math.random().toString(36).slice(2, 8)}`,
        attrId: attr.id,
        operator: operators[0],
        value: '',
      },
    ]);
    setPickerOpen(false);
  }

  function removeCondition(id: string) {
    setConditions((cs) => cs.filter((c) => c.id !== id));
  }

  function updateCondition(id: string, patch: Partial<Condition>) {
    setConditions((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  const title =
    role === 'channel'
      ? 'Channel Policy — Operation Aurora · Access policy'
      : 'Permission Policies — Edit policy: "Cleared engineers, government devices only"';

  return (
    <ConsoleFrame
      title={title}
      activeItemId={role === 'channel' ? 'channels' : 'permission-policies'}
      enterpriseTag
      backButton
      onBack={onBack}
      trailing={
        <>
          <Button emphasis="Tertiary" size="Small">Test policy</Button>
          <Button emphasis="Primary" size="Small">Save policy</Button>
        </>
      }
    >
      <div className={styles['editor__panel']}>
        <div className={styles['editor__section']}>
          <div className={styles['editor__section-header']}>
            <span className={styles['editor__section-icon']}>
              <Icon size="20" glyph={<AccountOutlineIcon />} />
            </span>
            <span className={styles['editor__section-title']}>User Attributes</span>
            <span className={styles['editor__section-meta']}>
              Evaluated once per user
            </span>
          </div>
          <ul className={styles['editor__conds']}>
            {INITIAL_USER_CONDITIONS.map((c) => (
              <li key={c.id} className={styles['editor__cond-row']}>
                <span className={styles['editor__cond-text']}>{c.label}</span>
                <IconButton
                  size="X-Small"
                  aria-label="Remove condition"
                  icon={<Icon size="12" glyph={<CloseIcon />} />}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className={styles['editor__section']}>
          <div className={styles['editor__section-header']}>
            <span className={`${styles['editor__section-icon']} ${styles['editor__section-icon--session']}`}>
              <Icon size="20" glyph={<ShieldOutlineIcon />} />
            </span>
            <span className={styles['editor__section-title']}>Session Attributes</span>
            <LabelTag label="Session-evaluated" type="Success" size="X-Small" />
            <span className={styles['editor__section-meta']}>
              Evaluated per device, on every request · <code className={styles['editor__namespace']}>user.session.*</code>
            </span>
          </div>
          <ul className={styles['editor__conds']}>
            {conditionsWithAttrs.map(({ condition, attr }) => {
              const operators = OPERATORS_BY_TYPE[attr.type] ?? ['equals'];
              return (
                <li
                  key={condition.id}
                  className={`${styles['editor__cond-row']} ${styles['editor__cond-row--session']}`}
                >
                  <div className={styles['editor__cond-attr']}>
                    <div className={styles['editor__cond-attr-text']}>
                      <span className={styles['editor__cond-name']}>{attr.displayName}</span>
                      <code className={styles['editor__cond-cel']}>user.session.{attr.name}</code>
                    </div>
                    <PlatformIcons
                      desktop={attr.desktop}
                      mobile={attr.mobile}
                      browser={attr.browser}
                      size={12}
                    />
                  </div>
                  <Select
                    size="Small"
                    value={condition.operator}
                    onChange={(e) =>
                      updateCondition(condition.id, { operator: e.target.value })
                    }
                    className={styles['editor__op']}
                  >
                    {operators.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </Select>
                  {attr.type !== 'Boolean' ? (
                    <TextInput
                      size="Small"
                      value={condition.value}
                      onChange={(e) =>
                        updateCondition(condition.id, { value: e.target.value })
                      }
                      placeholder={attr.type === 'IP' ? '10.0.0.0/24' : '...'}
                      className={styles['editor__value']}
                    />
                  ) : (
                    <span className={styles['editor__value-static']}>
                      {condition.operator === 'is true' ? 'true' : 'false'}
                    </span>
                  )}
                  <IconButton
                    size="X-Small"
                    aria-label="Remove condition"
                    icon={<Icon size="12" glyph={<CloseIcon />} />}
                    onClick={() => removeCondition(condition.id)}
                  />
                </li>
              );
            })}
          </ul>
          <div className={styles['editor__add']}>
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
              onClick={() => setPickerOpen((o) => !o)}
            >
              Add session attribute
            </Button>
            {pickerOpen && (
              <div className={styles['editor__picker']}>
                <div className={styles['editor__picker-header']}>
                  SESSION ATTRIBUTES
                </div>
                <ul className={styles['editor__picker-list']}>
                  {allAttrs.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        className={styles['editor__picker-row']}
                        onClick={() => addCondition(a)}
                      >
                        <div className={styles['editor__picker-row-main']}>
                          <div className={styles['editor__picker-row-name-row']}>
                            <span className={styles['editor__picker-row-name']}>
                              {a.displayName}
                            </span>
                            {a.source === 'server' && (
                              <LabelTag label="Server" type="Info Dim" size="X-Small" />
                            )}
                          </div>
                          <span className={styles['editor__picker-row-cel']}>
                            user.session.{a.name}
                          </span>
                        </div>
                        <PlatformIcons
                          desktop={a.desktop}
                          mobile={a.mobile}
                          browser={a.browser}
                          size={12}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {platformWarnings.length > 0 && (
        <SectionNotice
          type="Warning"
          title="Platform coverage warning"
          description={
            <div className={styles['editor__warning-body']}>
              <p className={styles['editor__warning-intro']}>
                This policy uses session attributes that are not fully available on every platform.
                Sessions from affected platforms will be denied by fail-secure when this policy is
                evaluated. You can save anyway.
              </p>
              <ul className={styles['editor__warning-list']}>
                {platformWarnings.map(({ attr, platforms }) => (
                  <li key={attr.id}>
                    <strong>{attr.displayName}</strong> — incomplete on {platforms.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          }
          primaryButtonLabel="Continue saving"
          secondaryButtonLabel="Review platform coverage"
        />
      )}

      <div className={styles['editor__footer']}>
        <p className={styles['editor__footer-note']}>
          {role === 'channel' ? (
            <>
              <strong>Channel-scoped policy.</strong> This policy only applies to channel
              "Operation Aurora." You can test against users you share channel membership with.
            </>
          ) : (
            <>
              All conditions must pass (AND). Session attribute conditions are evaluated per
              device — the same user on two devices may receive different access decisions.
            </>
          )}
        </p>
      </div>
    </ConsoleFrame>
  );
}
