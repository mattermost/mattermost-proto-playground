import { useState } from 'react';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import type { ChannelRule } from './types';
import { ROLE_LABEL } from './types';
import { COPY, HOW_IT_WORKS } from './copy';
import { CURRENT_ACCESS_SUMMARY } from './fixtures';
import EffectiveAccess from './EffectiveAccess';
import styles from './ChannelPermissionRulesFinal.module.scss';

interface Props {
  rules: ChannelRule[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Rule ids that share a (role, permission) with at least one other rule → OR-combined.
function combiningIds(rules: ChannelRule[]): Set<string> {
  const byKey = new Map<string, string[]>();
  for (const r of rules)
    for (const p of r.permissions) {
      const k = `${r.role}:${p.key}`;
      byKey.set(k, [...(byKey.get(k) ?? []), r.id]);
    }
  const out = new Set<string>();
  for (const ids of byKey.values()) if (ids.length > 1) ids.forEach((id) => out.add(id));
  return out;
}

export default function RulesListFinal({ rules, onAdd, onEdit, onDelete }: Props) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [howOpen, setHowOpen] = useState(false);
  const isEmpty = rules.length === 0;
  const combine = combiningIds(rules);

  return (
    <div className={styles['cprf__list']}>
      <div className={styles['cprf__list-head']}>
        <div>
          <h2 className={styles['cprf__h1']}>{COPY.h1}</h2>
          <p className={styles['cprf__framing']}>{COPY.framing}</p>
        </div>
        <Button emphasis="Primary" size="Small" leadingIcon={<Icon size="16" glyph={<PlusIcon />} />} onClick={onAdd}>
          {COPY.addCta}
        </Button>
      </div>

      {/* How access is decided — collapsible explainer (the two-axis model + 3 levels). */}
      <div className={styles['cprf__how']}>
        <button
          type="button"
          className={styles['cprf__how-head']}
          aria-expanded={howOpen}
          onClick={() => setHowOpen((v) => !v)}
        >
          <span className={styles['cprf__how-lead']}>{HOW_IT_WORKS.collapsedLead}</span>
          <span className={styles['cprf__how-summary']}>{HOW_IT_WORKS.collapsedSummary}</span>
          <span className={`${styles['cprf__how-chev']} ${howOpen ? styles['cprf__how-chev--open'] : ''}`}>
            <Icon size="16" glyph={<ChevronDownIcon />} />
          </span>
        </button>
        {howOpen && (
          <div className={styles['cprf__how-body']}>
            <div className={styles['cprf__how-axes']}>
              {HOW_IT_WORKS.axes.map((a) => (
                <div key={a.n} className={styles['cprf__how-axis']}>
                  <span className={styles['cprf__how-axis-n']}>{a.n}</span>
                  <div>
                    <strong>{a.title}</strong>
                    <p>{a.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles['cprf__how-levels']}>
              {HOW_IT_WORKS.levels.map((l) => (
                <div key={l.title} className={styles['cprf__how-level']}>
                  <span className={styles['cprf__how-level-title']}>{l.title}</span>
                  <span className={styles['cprf__how-level-body']}>{l.body}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className={styles['cprf__empty']}>
          <p className={styles['cprf__empty-title']}>{COPY.empty}</p>
          <p className={styles['cprf__empty-baseline']}>Right now, {CURRENT_ACCESS_SUMMARY} can access this channel.</p>
          <Button emphasis="Secondary" leadingIcon={<Icon size="16" glyph={<PlusIcon />} />} onClick={onAdd}>
            {COPY.addCta}
          </Button>
        </div>
      ) : (
        <>
          <EffectiveAccess rules={rules} />

          <div className={styles['cprf__rules-section']}>
            <span className={styles['cprf__rules-section-title']}>Rules</span>
            <SearchInput placeholder="Search by name or permission" aria-label="Search" />
          </div>

          <div className={styles['cprf__table']}>
            <div className={styles['cprf__thead']}>
              <span>Name</span>
              <span>Role</span>
              <span>Conditions</span>
              <span>Permissions</span>
              <span aria-hidden />
            </div>
            {rules.map((r) => (
              <div key={r.id} className={styles['cprf__row']}>
                <button type="button" className={styles['cprf__row-name']} onClick={() => onEdit(r.id)}>
                  {r.name}
                  {combine.has(r.id) && (
                    <span className={styles['cprf__combine-tag']} title="Combines with another rule (any match grants)">
                      <Icon size="12" glyph={<LinkVariantIcon />} /> any-of
                    </span>
                  )}
                </button>
                <span className={styles['cprf__cell']}>
                  <LabelTag label={ROLE_LABEL[r.role]} size="X-Small" type="Default" />
                </span>
                <span className={styles['cprf__cell']}>
                  {r.conditions.length} · {r.matchMode === 'all' ? 'all' : 'any'}
                </span>
                <span className={styles['cprf__cell']}>
                  {r.permissions.length} {r.permissions.length === 1 ? 'permission' : 'permissions'}
                </span>
                <span className={styles['cprf__row-actions']}>
                  <button
                    type="button"
                    className={styles['cprf__icon-btn']}
                    aria-label={`${r.name} actions`}
                    aria-haspopup="menu"
                    aria-expanded={menuId === r.id}
                    onClick={() => setMenuId(menuId === r.id ? null : r.id)}
                  >
                    <Icon size="16" glyph={<DotsHorizontalIcon />} />
                  </button>
                  {menuId === r.id && (
                    <div className={styles['cprf__row-menu']} role="menu">
                      <button type="button" role="menuitem" onClick={() => { setMenuId(null); onEdit(r.id); }}>Edit</button>
                      <button
                        type="button"
                        role="menuitem"
                        className={styles['cprf__row-menu-danger']}
                        onClick={() => { setMenuId(null); setDeleteId(r.id); }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className={styles['cprf__pagination']}>1–{rules.length} of {rules.length}</div>
        </>
      )}

      {deleteId && (
        <div className={styles['cprf__confirm-overlay']}>
          <div className={styles['cprf__confirm']} role="alertdialog" aria-modal="true">
            <h3 className={styles['cprf__confirm-title']}>Delete “{rules.find((r) => r.id === deleteId)?.name ?? ''}”?</h3>
            <p className={styles['cprf__confirm-body']}>
              Users matched only by this rule will fall back to your system and team policies.
            </p>
            <div className={styles['cprf__confirm-actions']}>
              <Button emphasis="Tertiary" size="Small" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button emphasis="Primary" size="Small" onClick={() => { onDelete(deleteId); setDeleteId(null); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
