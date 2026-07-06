// Channel Permission Rules — FINAL direction.
// Locked from the persona panel + UX synthesis: noun = "rule", container =
// slide-in panel, Match mode default "All" with "Any" behind Advanced. Adds the
// "How access is decided" explainer + an Effective Access summary so the rule-
// combination model (any-of per action, tighten-only ceiling) is legible.
// [AI DRAFT].
import { useEffect, useState } from 'react';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import Icon from '@/components/ui/Icon/Icon';
import Modal from '@/components/ui/Modal/Modal';
import type { ChannelRule, Scenario } from './types';
import { COPY } from './copy';
import { STARTER_RULES, CHANNEL_NAME } from './fixtures';
import RulesListFinal from './RulesListFinal';
import RuleEditorFinal from './RuleEditorFinal';
import styles from './ChannelPermissionRulesFinal.module.scss';

function blankRule(id: string): ChannelRule {
  return {
    id,
    name: '',
    role: 'channel_user',
    matchMode: 'all',
    conditions: [{ id: 'c1', attribute: '', operator: 'is', values: '' }],
    permissions: [],
    status: 'active',
  };
}
const clone = (r: ChannelRule): ChannelRule => ({
  ...r,
  conditions: r.conditions.map((c) => ({ ...c })),
  permissions: r.permissions.map((p) => ({ ...p })),
});

type NavKey = 'info' | 'config' | 'membership' | 'permission' | 'archive';

export default function ChannelPermissionRulesFinal() {
  const [scenario, setScenario] = useState<Scenario>('populated');
  const [rules, setRules] = useState<ChannelRule[]>(STARTER_RULES.map(clone));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ChannelRule | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [newCounter, setNewCounter] = useState(1);
  const isNew = editingId?.startsWith('new') ?? false;

  useEffect(() => {
    if (scenario === 'empty') {
      setRules([]);
      setEditingId(null);
      setDraft(null);
    } else {
      setRules(STARTER_RULES.map(clone));
      if (scenario === 'blocked' || scenario === 'self-lockout') {
        setEditingId(STARTER_RULES[0].id);
        setDraft(clone(STARTER_RULES[0]));
      } else {
        setEditingId(null);
        setDraft(null);
      }
    }
  }, [scenario]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const onAdd = () => {
    const id = `new-${newCounter}`;
    setNewCounter((n) => n + 1);
    setDraft(blankRule(id));
    setEditingId(id);
  };
  const onEdit = (id: string) => {
    const r = rules.find((x) => x.id === id);
    if (!r) return;
    setDraft(clone(r));
    setEditingId(id);
  };
  const onChange = (patch: Partial<ChannelRule>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const onCancel = () => { setEditingId(null); setDraft(null); };
  const onSave = () => {
    if (!draft) return;
    setRules((prev) => (isNew ? [...prev, draft] : prev.map((r) => (r.id === draft.id ? draft : r))));
    setToast(`Rule “${draft.name || 'Untitled'}” saved.`);
    setEditingId(null);
    setDraft(null);
  };
  const onDelete = (id: string) => setRules((prev) => prev.filter((r) => r.id !== id));

  const navItem = (key: NavKey, label: string, icon: React.ReactNode) => (
    <div className={`${styles['cprf__nav-item']} ${key === 'permission' ? styles['cprf__nav-item--active'] : ''}`} aria-current={key === 'permission' ? 'page' : undefined}>
      <span className={styles['cprf__nav-icon']}>{icon}</span>
      {label}
    </div>
  );

  const panelOpen = editingId && draft;

  return (
    <div className={styles['cprf']}>
      <div className={styles['cprf__toolbar']}>
        <span className={styles['cprf__toolbar-title']}>Final direction · rule · slide-in</span>
        <div className={styles['cprf__toggle-group']}>
          <span className={styles['cprf__toggle-label']}>Preview state</span>
          {([
            ['populated', 'List'],
            ['empty', 'Empty'],
            ['blocked', 'Blocked by system'],
            ['self-lockout', 'Self-lockout'],
          ] as [Scenario, string][]).map(([s, label]) => (
            <button key={s} type="button" className={`${styles['cprf__toggle']} ${scenario === s ? styles['cprf__toggle--active'] : ''}`} onClick={() => setScenario(s)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className={styles['cprf__caption']}>
        Locked direction from the persona panel: <strong>“rule”</strong> noun, <strong>slide-in</strong> editor, Match mode default
        <strong> All</strong> (“Any” behind Advanced). The <strong>How access is decided</strong> explainer and the <strong>Effective access</strong>
        summary make rule combination legible: any-of per action, capped by the system ceiling. <strong>[AI DRAFT]</strong>
      </p>

      <div className={styles['cprf__modal-frame']}>
        <Modal size="Large" title="Channel Settings" subtitle={CHANNEL_NAME} onClose={() => {}} noBodyPadding>
          <div className={styles['cprf__split']}>
            <nav className={styles['cprf__nav']} aria-label="Channel settings">
              {navItem('info', 'Info', <Icon size="16" glyph={<InformationOutlineIcon />} />)}
              {navItem('config', 'Configuration', <Icon size="16" glyph={<CogOutlineIcon />} />)}
              {navItem('membership', 'Membership', <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />)}
              {navItem('permission', 'Permission Policy', <Icon size="16" glyph={<ShieldOutlineIcon />} />)}
              {navItem('archive', 'Archive channel', <Icon size="16" glyph={<ArchiveOutlineIcon />} />)}
            </nav>

            <div className={styles['cprf__content']}>
              <RulesListFinal rules={rules} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} />

              {panelOpen && (
                <>
                  <div className={styles['cprf__scrim']} onClick={onCancel} aria-hidden />
                  <aside className={styles['cprf__panel']} aria-label={isNew ? COPY.newHeader : COPY.editHeader}>
                    <div className={styles['cprf__panel-head']}>
                      <button type="button" className={styles['cprf__back']} onClick={onCancel}>
                        <Icon size="16" glyph={<ArrowLeftIcon />} />
                        {isNew ? COPY.newHeader : COPY.editHeader}
                      </button>
                    </div>
                    <RuleEditorFinal draft={draft} scenario={scenario} onChange={onChange} onSave={onSave} onCancel={onCancel} />
                  </aside>
                </>
              )}

              {toast && (
                <div className={styles['cprf__toast']} role="status">
                  <Icon size="16" glyph={<CheckCircleIcon />} />
                  {toast}
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
