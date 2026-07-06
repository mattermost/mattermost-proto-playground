import { Fragment, useState } from 'react';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import KeyVariantIcon from '@mattermost/compass-icons/components/key-variant';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import TuneIcon from '@mattermost/compass-icons/components/tune';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import TextInput from '@/components/ui/TextInput/TextInput';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import type { ChannelRule, Condition, Scenario } from './types';
import { ROLE_LABEL } from './types';
import { COPY, CEILING } from './copy';
import {
  AVAILABLE_ATTRIBUTES,
  AVAILABLE_PERMISSIONS,
  OPERATORS,
  SYSTEM_CEILING,
  CHANNEL_NAME,
} from './fixtures';
import styles from './ChannelPermissionRulesFinal.module.scss';

interface Props {
  draft: ChannelRule;
  scenario: Scenario;
  onChange: (patch: Partial<ChannelRule>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function RuleEditorFinal({ draft, scenario, onChange, onSave, onCancel }: Props) {
  const [confirmText, setConfirmText] = useState('');
  // "Any" lives behind Advanced; auto-open if the rule already uses it (no hidden state).
  const [showMatchOptions, setShowMatchOptions] = useState(draft.matchMode === 'any');

  const selfLockout = scenario === 'self-lockout';
  const blocked = scenario === 'blocked';
  const saveDisabled = selfLockout && confirmText.trim() !== CHANNEL_NAME;
  const multiCondition = draft.conditions.length > 1;

  const updateCondition = (id: string, patch: Partial<Condition>) =>
    onChange({ conditions: draft.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const addCondition = () =>
    onChange({
      conditions: [
        ...draft.conditions,
        { id: `c${Date.now()}`, attribute: '', operator: 'is', values: '' },
      ],
    });
  const removeCondition = (id: string) =>
    onChange({ conditions: draft.conditions.filter((c) => c.id !== id) });
  const togglePermission = (key: string) => {
    const has = draft.permissions.some((p) => p.key === key);
    onChange({
      permissions: has
        ? draft.permissions.filter((p) => p.key !== key)
        : [...draft.permissions, AVAILABLE_PERMISSIONS.find((p) => p.key === key)!],
    });
  };

  return (
    <div className={styles['cprf__editor']}>
      {/* Visible ceiling (tighten-only). "policy" appears only here, as a read-only parent label. */}
      <div className={styles['cprf__ceiling']}>
        <span className={styles['cprf__ceiling-icon']}>
          <Icon size="16" glyph={<ShieldOutlineIcon />} />
        </span>
        <div className={styles['cprf__ceiling-body']}>
          <span className={styles['cprf__ceiling-title']}>{CEILING.title}</span>
          <span className={styles['cprf__ceiling-text']}>{CEILING.body}</span>
          <span className={styles['cprf__ceiling-applied']}>{CEILING.appliedLabel}</span>
          <ul className={styles['cprf__ceiling-list']}>
            {SYSTEM_CEILING.map((p) => (
              <li key={p.name} className={styles['cprf__ceiling-item']}>
                <strong>{p.name}</strong> · {p.role} · allows {p.allows.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles['cprf__field']}>
        <label className={styles['cprf__field-label']}>{COPY.nameLabel}</label>
        <TextInput value={draft.name} onChange={(e) => onChange({ name: e.target.value })} placeholder={COPY.nameLabel} />
        <p className={styles['cprf__field-help']}>{COPY.nameHelp}</p>
      </div>

      <div className={styles['cprf__field']}>
        <label className={styles['cprf__field-label']}>{COPY.roleLabel}</label>
        <Select value={draft.role} onChange={(e) => onChange({ role: e.target.value as ChannelRule['role'] })}>
          <option value="channel_user">{ROLE_LABEL.channel_user}</option>
          <option value="channel_guest">{ROLE_LABEL.channel_guest}</option>
          <option value="channel_admin">{ROLE_LABEL.channel_admin}</option>
        </Select>
      </div>

      {/* Conditions */}
      <div className={styles['cprf__field']}>
        <label className={styles['cprf__field-label']}>{COPY.conditionsLabel}</label>
        <p className={styles['cprf__field-help']}>{COPY.conditionsHelp}</p>

        {/* Match mode: only relevant with 2+ conditions. Default All; Any behind Advanced. */}
        {multiCondition && (
          <div className={styles['cprf__matchmode']}>
            <span className={styles['cprf__matchmode-current']}>
              {draft.matchMode === 'all' ? COPY.matchAll : COPY.matchAny}
            </span>
            {!showMatchOptions ? (
              <button type="button" className={styles['cprf__match-advanced']} onClick={() => setShowMatchOptions(true)}>
                <Icon size="16" glyph={<TuneIcon />} /> {COPY.matchAdvanced}
              </button>
            ) : (
              <div className={styles['cprf__match-radios']} role="radiogroup" aria-label={COPY.matchModeLabel}>
                <label className={styles['cprf__match-radio']}>
                  <input type="radio" checked={draft.matchMode === 'all'} onChange={() => onChange({ matchMode: 'all' })} />
                  {COPY.matchAll}
                </label>
                <label className={styles['cprf__match-radio']} title={COPY.matchAnyTooltip}>
                  <input type="radio" checked={draft.matchMode === 'any'} onChange={() => onChange({ matchMode: 'any' })} />
                  {COPY.matchAny}
                  <span className={styles['cprf__match-hint']}>{COPY.matchAnyTooltip}</span>
                </label>
              </div>
            )}
          </div>
        )}

        <div className={styles['cprf__cond-table']}>
          <div className={styles['cprf__cond-head']}>
            <span>Attribute</span>
            <span>Operator</span>
            <span>Values</span>
            <span aria-hidden />
          </div>
          {draft.conditions.map((c, idx) => (
            <Fragment key={c.id}>
              {/* Plain-language joiner between conditions reflects Match mode. */}
              {idx > 0 && (
                <span className={styles['cprf__cond-joiner']}>
                  {draft.matchMode === 'all' ? 'and' : 'or'}
                </span>
              )}
              <div className={styles['cprf__cond-row']}>
              <Select value={c.attribute} onChange={(e) => updateCondition(c.id, { attribute: e.target.value })} aria-label="Attribute">
                <option value="">Select…</option>
                {AVAILABLE_ATTRIBUTES.map((a) => (<option key={a} value={a}>{a}</option>))}
              </Select>
              <Select value={c.operator} onChange={(e) => updateCondition(c.id, { operator: e.target.value })} aria-label="Operator">
                {OPERATORS.map((o) => (<option key={o} value={o}>{o}</option>))}
              </Select>
              <TextInput value={c.values} onChange={(e) => updateCondition(c.id, { values: e.target.value })} aria-label="Values" placeholder="Value" />
              <button type="button" className={styles['cprf__icon-btn']} aria-label="Remove condition" onClick={() => removeCondition(c.id)}>
                <Icon size="16" glyph={<TrashCanOutlineIcon />} />
              </button>
              </div>
            </Fragment>
          ))}
          <button type="button" className={styles['cprf__add-link']} onClick={addCondition}>
            <Icon size="12" glyph={<PlusIcon />} /> {COPY.addCondition}
          </button>
        </div>
      </div>

      {/* Permissions */}
      <div className={styles['cprf__field']}>
        <label className={styles['cprf__field-label']}>{COPY.permissionsLabel}</label>
        <p className={styles['cprf__field-help']}>{COPY.permissionsHelp}</p>
        <div className={styles['cprf__perm-table']}>
          {AVAILABLE_PERMISSIONS.map((p) => {
            const on = draft.permissions.some((d) => d.key === p.key);
            return (
              <label key={p.key} className={styles['cprf__perm-row']}>
                <input type="checkbox" checked={on} onChange={() => togglePermission(p.key)} className={styles['cprf__perm-check']} />
                <span className={styles['cprf__perm-name']}>{p.label}</span>
                <span className={styles['cprf__perm-desc']}>{p.description}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* How this rule combines with others */}
      <div className={styles['cprf__combine-note']}>
        <Icon size="16" glyph={<LinkVariantIcon />} />
        <span>
          For each action, a user is allowed if they match <strong>any</strong> rule here — adding rules widens who qualifies, within the
          system ceiling above.
        </span>
      </div>

      {/* Save-time controls */}
      {blocked && (
        <SectionNotice
          type="Warning"
          title="Blocked by a system policy"
          description="A system policy (“File Downloads”) denies “Upload files” for the users this rule targets. You can’t change this here — contact your system admin to request an exception."
          primaryButtonLabel="Request exception"
          onPrimaryAction={() => {}}
        />
      )}
      {selfLockout && (
        <div className={styles['cprf__lockout']}>
          <SectionNotice
            type="Danger"
            title="This rule matches your own account"
            description="Saving it may remove your own access to this channel. Type the channel name to confirm."
          />
          <TextInput value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={CHANNEL_NAME} aria-label={`Type ${CHANNEL_NAME} to confirm`} />
        </div>
      )}

      <div className={styles['cprf__editor-footer']}>
        <Button emphasis="Tertiary" size="Small" leadingIcon={<Icon size="16" glyph={<KeyVariantIcon />} />}>
          {COPY.simulate}
        </Button>
        <span className={styles['cprf__footer-spacer']} />
        <Button emphasis="Tertiary" size="Small" onClick={onCancel}>Cancel</Button>
        <Button emphasis="Primary" size="Small" onClick={onSave} disabled={saveDisabled}>{COPY.saveCta}</Button>
      </div>
    </div>
  );
}
