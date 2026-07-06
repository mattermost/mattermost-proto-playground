// The unit editor — shared body across all containers (slide-in / accordion /
// shipped in-modal). The container only decides how this is framed; the fields
// and the save-time warnings are identical so a comparison isolates noun + container.
import { useState } from 'react';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import KeyVariantIcon from '@mattermost/compass-icons/components/key-variant';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import TextInput from '@/components/ui/TextInput/TextInput';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import type { ChannelRule, Condition, Scenario } from '../types';
import { ROLE_LABEL } from '../types';
import type { Lexicon } from '../lexicon';
import { SHARED } from '../lexicon';
import {
  AVAILABLE_ATTRIBUTES,
  AVAILABLE_PERMISSIONS,
  OPERATORS,
  SYSTEM_CEILING,
  CHANNEL_NAME,
} from '../fixtures';
import styles from '../ChannelPermissionRules.module.scss';

interface Props {
  lex: Lexicon;
  draft: ChannelRule;
  scenario: Scenario;
  onChange: (patch: Partial<ChannelRule>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function RuleEditor({
  lex,
  draft,
  scenario,
  onChange,
  onSave,
  onCancel,
}: Props) {
  const [confirmText, setConfirmText] = useState('');
  const selfLockout = scenario === 'self-lockout';
  const blocked = scenario === 'blocked';
  const saveDisabled = selfLockout && confirmText.trim() !== CHANNEL_NAME;

  const updateCondition = (id: string, patch: Partial<Condition>) =>
    onChange({
      conditions: draft.conditions.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    });

  const addCondition = () =>
    onChange({
      conditions: [
        ...draft.conditions,
        { id: `c${draft.conditions.length + 1}`, attribute: '', operator: 'is', values: '' },
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
    <div className={styles['cpr__editor']}>
      {/* Visible ceiling — axis-2 framing (tighten-only), respects minimum disclosure. */}
      <div className={styles['cpr__ceiling']}>
        <span className={styles['cpr__ceiling-icon']}>
          <Icon size="16" glyph={<ShieldOutlineIcon />} />
        </span>
        <div className={styles['cpr__ceiling-body']}>
          <span className={styles['cpr__ceiling-title']}>{SHARED.ceilingTitle}</span>
          <span className={styles['cpr__ceiling-text']}>{SHARED.ceilingBody}</span>
          <ul className={styles['cpr__ceiling-list']}>
            {SYSTEM_CEILING.map((p) => (
              <li key={p.name} className={styles['cpr__ceiling-item']}>
                <strong>{p.name}</strong> · {p.role} · allows {p.allows.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Name */}
      <div className={styles['cpr__field']}>
        <label className={styles['cpr__field-label']}>{lex.nameLabel}</label>
        <TextInput
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={lex.nameLabel}
        />
        <p className={styles['cpr__field-help']}>{lex.nameHelp}</p>
      </div>

      {/* Role */}
      <div className={styles['cpr__field']}>
        <label className={styles['cpr__field-label']}>{SHARED.roleLabel}</label>
        <Select
          value={draft.role}
          onChange={(e) => onChange({ role: e.target.value as ChannelRule['role'] })}
        >
          <option value="channel_user">{ROLE_LABEL.channel_user}</option>
          <option value="channel_guest">{ROLE_LABEL.channel_guest}</option>
          <option value="channel_admin">{ROLE_LABEL.channel_admin}</option>
        </Select>
      </div>

      {/* Conditions + Match mode */}
      <div className={styles['cpr__field']}>
        <div className={styles['cpr__section-head']}>
          <label className={styles['cpr__field-label']}>{SHARED.conditionsLabel}</label>
          <div className={styles['cpr__matchmode']} role="radiogroup" aria-label={SHARED.matchModeLabel}>
            <span className={styles['cpr__matchmode-label']}>{SHARED.matchModeLabel}</span>
            <button
              type="button"
              role="radio"
              aria-checked={draft.matchMode === 'all'}
              className={`${styles['cpr__seg']} ${draft.matchMode === 'all' ? styles['cpr__seg--active'] : ''}`}
              onClick={() => onChange({ matchMode: 'all' })}
            >
              {SHARED.matchAll}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={draft.matchMode === 'any'}
              className={`${styles['cpr__seg']} ${draft.matchMode === 'any' ? styles['cpr__seg--active'] : ''}`}
              onClick={() => onChange({ matchMode: 'any' })}
            >
              {SHARED.matchAny}
            </button>
          </div>
        </div>
        <p className={styles['cpr__field-help']}>{SHARED.conditionsHelp}</p>

        <div className={styles['cpr__cond-table']}>
          <div className={styles['cpr__cond-head']}>
            <span>Attribute</span>
            <span>Operator</span>
            <span>Values</span>
            <span aria-hidden />
          </div>
          {draft.conditions.map((c) => (
            <div key={c.id} className={styles['cpr__cond-row']}>
              <Select
                value={c.attribute}
                onChange={(e) => updateCondition(c.id, { attribute: e.target.value })}
                aria-label="Attribute"
              >
                <option value="">Select…</option>
                {AVAILABLE_ATTRIBUTES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
              <Select
                value={c.operator}
                onChange={(e) => updateCondition(c.id, { operator: e.target.value })}
                aria-label="Operator"
              >
                {OPERATORS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </Select>
              <TextInput
                value={c.values}
                onChange={(e) => updateCondition(c.id, { values: e.target.value })}
                aria-label="Values"
                placeholder="Value"
              />
              <button
                type="button"
                className={styles['cpr__icon-btn']}
                aria-label="Remove condition"
                onClick={() => removeCondition(c.id)}
              >
                <Icon size="16" glyph={<TrashCanOutlineIcon />} />
              </button>
            </div>
          ))}
          <button type="button" className={styles['cpr__add-link']} onClick={addCondition}>
            <Icon size="12" glyph={<PlusIcon />} /> {SHARED.addCondition}
          </button>
        </div>
      </div>

      {/* Permissions */}
      <div className={styles['cpr__field']}>
        <label className={styles['cpr__field-label']}>{SHARED.permissionsLabel}</label>
        <p className={styles['cpr__field-help']}>{lex.permissionsHelp}</p>
        <div className={styles['cpr__perm-table']}>
          {AVAILABLE_PERMISSIONS.map((p) => {
            const on = draft.permissions.some((d) => d.key === p.key);
            return (
              <label key={p.key} className={styles['cpr__perm-row']}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => togglePermission(p.key)}
                  className={styles['cpr__perm-check']}
                />
                <span className={styles['cpr__perm-name']}>{p.label}</span>
                <span className={styles['cpr__perm-desc']}>{p.description}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Save-time warnings (the recommendation's core proactive safety nets) */}
      {blocked && (
        <SectionNotice
          type="Warning"
          title={`Blocked by a system policy`}
          description={`A system policy (“File Downloads”) denies “Download files” for the users this ${lex.unit} targets. They won’t get it here, even though this ${lex.unit} grants it. Remove the conflicting permission, or ask a system admin.`}
        />
      )}
      {selfLockout && (
        <div className={styles['cpr__lockout']}>
          <SectionNotice
            type="Danger"
            title={`This ${lex.unit} matches your own account`}
            description={`Saving it may remove your own access to this channel. Type the channel name to confirm you intend this.`}
          />
          <TextInput
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CHANNEL_NAME}
            aria-label={`Type ${CHANNEL_NAME} to confirm`}
          />
        </div>
      )}

      {/* Footer */}
      <div className={styles['cpr__editor-footer']}>
        <Button
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<KeyVariantIcon />} />}
        >
          {SHARED.simulate}
        </Button>
        <span className={styles['cpr__footer-spacer']} />
        <Button emphasis="Tertiary" size="Small" onClick={onCancel}>
          Cancel
        </Button>
        <Button emphasis="Primary" size="Small" onClick={onSave} disabled={saveDisabled}>
          {lex.saveCta}
        </Button>
      </div>
    </div>
  );
}
