// Channel Permission Rules — Options Explorer
// One prototype, two axes under test via toggles:
//   • Noun:      rule  ⇄  policy
//   • Container: slide-in panel ⇄ inline accordion ⇄ shipped (in-modal swap)
// Everything else (Conditions rename, Match mode, visible ceiling, Role column,
// fixed copy, empty/blocked/self-lockout/delete/save states) is shared so a
// comparison isolates only the noun + container. [AI DRAFT] copy throughout.
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
import type { ChannelRule, Container, Noun, Scenario } from './types';
import { LEXICONS } from './lexicon';
import { STARTER_RULES, CHANNEL_NAME } from './fixtures';
import RulesList from './screens/RulesList';
import RuleEditor from './screens/RuleEditor';
import styles from './ChannelPermissionRules.module.scss';

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

export default function ChannelPermissionRules() {
  const [noun, setNoun] = useState<Noun>('rule');
  const [container, setContainer] = useState<Container>('slide-in');
  const [scenario, setScenario] = useState<Scenario>('populated');

  const [rules, setRules] = useState<ChannelRule[]>(STARTER_RULES.map(clone));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ChannelRule | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [newCounter, setNewCounter] = useState(1);

  const lex = LEXICONS[noun];
  const isNew = editingId?.startsWith('new') ?? false;

  // Scenario switch resets the demo state so each state is reachable in one click.
  useEffect(() => {
    if (scenario === 'empty') {
      setRules([]);
      setEditingId(null);
      setDraft(null);
    } else {
      setRules(STARTER_RULES.map(clone));
      if (scenario === 'blocked' || scenario === 'self-lockout') {
        // Auto-open the first rule so the save-time warning is visible immediately.
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

  const onChange = (patch: Partial<ChannelRule>) =>
    setDraft((d) => (d ? { ...d, ...patch } : d));

  const onCancel = () => {
    setEditingId(null);
    setDraft(null);
  };

  const onSave = () => {
    if (!draft) return;
    setRules((prev) =>
      isNew ? [...prev, draft] : prev.map((r) => (r.id === draft.id ? draft : r)),
    );
    setToast(lex.savedToast(draft.name || lex.unitCap));
    setEditingId(null);
    setDraft(null);
  };

  const onDelete = (id: string) => setRules((prev) => prev.filter((r) => r.id !== id));

  const navItem = (key: NavKey, label: string, icon: React.ReactNode) => (
    <div
      className={`${styles['cpr__nav-item']} ${key === 'permission' ? styles['cpr__nav-item--active'] : ''}`}
      aria-current={key === 'permission' ? 'page' : undefined}
    >
      <span className={styles['cpr__nav-icon']}>{icon}</span>
      {label}
    </div>
  );

  const editorEl = draft && (
    <RuleEditor
      lex={lex}
      draft={draft}
      scenario={scenario}
      onChange={onChange}
      onSave={onSave}
      onCancel={onCancel}
    />
  );

  const showShippedEditor = container === 'shipped' && editingId && draft;
  const showSlideIn = container === 'slide-in' && editingId && draft;
  const showAccordionNew = container === 'accordion' && isNew && draft;

  return (
    <div className={styles['cpr']}>
      {/* Explorer toolbar */}
      <div className={styles['cpr__toolbar']}>
        <div className={styles['cpr__toggle-group']}>
          <span className={styles['cpr__toggle-label']}>Noun</span>
          {(['rule', 'policy'] as Noun[]).map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles['cpr__toggle']} ${noun === n ? styles['cpr__toggle--active'] : ''}`}
              onClick={() => setNoun(n)}
            >
              {n === 'rule' ? 'Rule' : 'Policy'}
            </button>
          ))}
        </div>
        <div className={styles['cpr__toggle-group']}>
          <span className={styles['cpr__toggle-label']}>Container</span>
          {(
            [
              ['slide-in', 'Slide-in panel'],
              ['accordion', 'Inline accordion'],
              ['shipped', 'Current (shipped)'],
            ] as [Container, string][]
          ).map(([c, label]) => (
            <button
              key={c}
              type="button"
              className={`${styles['cpr__toggle']} ${container === c ? styles['cpr__toggle--active'] : ''}`}
              onClick={() => {
                setContainer(c);
                onCancel();
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles['cpr__toggle-group']}>
          <span className={styles['cpr__toggle-label']}>State</span>
          {(
            [
              ['populated', 'List'],
              ['empty', 'Empty'],
              ['blocked', 'Blocked by system'],
              ['self-lockout', 'Self-lockout'],
            ] as [Scenario, string][]
          ).map(([s, label]) => (
            <button
              key={s}
              type="button"
              className={`${styles['cpr__toggle']} ${scenario === s ? styles['cpr__toggle--active'] : ''}`}
              onClick={() => setScenario(s)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className={styles['cpr__caption']}>
        Toggle <strong>Noun</strong> and <strong>Container</strong> to compare all four combinations. Everything else — “Conditions”
        rename, Match mode, the visible system ceiling, the Role column, fixed copy, and the blocked / self-lockout / empty / delete /
        save states — is shared, so the comparison isolates only those two variables. <strong>[AI DRAFT]</strong>
      </p>

      {/* Channel Settings modal */}
      <div className={styles['cpr__modal-frame']}>
        <Modal size="Large" title="Channel Settings" subtitle={CHANNEL_NAME} onClose={() => {}} noBodyPadding>
          <div className={styles['cpr__split']}>
            <nav className={styles['cpr__nav']} aria-label="Channel settings">
              {navItem('info', 'Info', <Icon size="16" glyph={<InformationOutlineIcon />} />)}
              {navItem('config', 'Configuration', <Icon size="16" glyph={<CogOutlineIcon />} />)}
              {navItem('membership', 'Membership', <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />)}
              {navItem('permission', 'Permission Policy', <Icon size="16" glyph={<ShieldOutlineIcon />} />)}
              {navItem('archive', 'Archive channel', <Icon size="16" glyph={<ArchiveOutlineIcon />} />)}
            </nav>

            <div className={styles['cpr__content']}>
              {showShippedEditor ? (
                <div className={styles['cpr__swap']}>
                  <button type="button" className={styles['cpr__back']} onClick={onCancel}>
                    <Icon size="16" glyph={<ArrowLeftIcon />} />
                    {isNew ? lex.newHeader : lex.editHeader}
                  </button>
                  {editorEl}
                </div>
              ) : (
                <>
                  {showAccordionNew && (
                    <div className={styles['cpr__accordion-new']}>
                      <span className={styles['cpr__accordion-new-title']}>{lex.newHeader}</span>
                      {editorEl}
                    </div>
                  )}
                  <RulesList
                    lex={lex}
                    rules={rules}
                    scenario={scenario}
                    container={container}
                    editingId={container === 'accordion' ? editingId : null}
                    draft={draft}
                    onAdd={onAdd}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onChange={onChange}
                    onSave={onSave}
                    onCancel={onCancel}
                  />
                </>
              )}

              {/* Slide-in panel */}
              {showSlideIn && (
                <>
                  <div className={styles['cpr__scrim']} onClick={onCancel} aria-hidden />
                  <aside className={styles['cpr__panel']} aria-label={isNew ? lex.newHeader : lex.editHeader}>
                    <div className={styles['cpr__panel-head']}>
                      <button type="button" className={styles['cpr__back']} onClick={onCancel}>
                        <Icon size="16" glyph={<ArrowLeftIcon />} />
                        {isNew ? lex.newHeader : lex.editHeader}
                      </button>
                    </div>
                    {editorEl}
                  </aside>
                </>
              )}

              {toast && (
                <div className={styles['cpr__toast']} role="status">
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
