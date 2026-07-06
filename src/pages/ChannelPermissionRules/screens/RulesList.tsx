import { useState } from 'react';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import type { ChannelRule, Container, Scenario } from '../types';
import { ROLE_LABEL } from '../types';
import type { Lexicon } from '../lexicon';
import { CURRENT_ACCESS_SUMMARY } from '../fixtures';
import RuleEditor from './RuleEditor';
import styles from '../ChannelPermissionRules.module.scss';

interface Props {
  lex: Lexicon;
  rules: ChannelRule[];
  scenario: Scenario;
  container: Container;
  editingId: string | null;
  draft: ChannelRule | null;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (patch: Partial<ChannelRule>) => void;
  onSave: () => void;
  onCancel: () => void;
}

// Does any (role, permission) appear in 2+ rules? Then the OR-union hint is relevant.
function hasOverlap(rules: ChannelRule[]): boolean {
  const seen = new Set<string>();
  for (const r of rules) {
    for (const p of r.permissions) {
      const key = `${r.role}:${p.key}`;
      if (seen.has(key)) return true;
      seen.add(key);
    }
  }
  return false;
}

export default function RulesList({
  lex,
  rules,
  scenario,
  container,
  editingId,
  draft,
  onAdd,
  onEdit,
  onDelete,
  onChange,
  onSave,
  onCancel,
}: Props) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const isEmpty = rules.length === 0;

  return (
    <div className={styles['cpr__list']}>
      <div className={styles['cpr__list-head']}>
        <div>
          <h2 className={styles['cpr__h1']}>{lex.h1}</h2>
          <p className={styles['cpr__framing']}>{lex.framing}</p>
        </div>
        <Button
          emphasis="Primary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={onAdd}
        >
          {lex.addCta}
        </Button>
      </div>

      {isEmpty ? (
        <div className={styles['cpr__empty']}>
          <p className={styles['cpr__empty-title']}>{lex.empty}</p>
          <p className={styles['cpr__empty-baseline']}>
            Right now, {CURRENT_ACCESS_SUMMARY} can access this channel.
          </p>
          <Button
            emphasis="Secondary"
            leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
            onClick={onAdd}
          >
            {lex.addCta}
          </Button>
        </div>
      ) : (
        <>
          <SearchInput placeholder={`Search by name or permission`} aria-label="Search" />

          {hasOverlap(rules) && (
            <div className={styles['cpr__hint']}>
              <Icon size="16" glyph={<InformationOutlineIcon />} />
              <span>{lex.anyHint}</span>
            </div>
          )}

          <div className={styles['cpr__table']}>
            <div className={styles['cpr__thead']}>
              <span>Name</span>
              <span>Role</span>
              <span>Conditions</span>
              <span>Permissions</span>
              <span aria-hidden />
            </div>

            {rules.map((r) => {
              const open = editingId === r.id;
              return (
                <div key={r.id} className={styles['cpr__row-group']}>
                  <div
                    className={`${styles['cpr__row']} ${open ? styles['cpr__row--open'] : ''}`}
                  >
                    <button
                      type="button"
                      className={styles['cpr__row-name']}
                      onClick={() => onEdit(r.id)}
                    >
                      {container === 'accordion' && (
                        <span
                          className={`${styles['cpr__chev']} ${open ? styles['cpr__chev--open'] : ''}`}
                        >
                          <Icon size="16" glyph={<ChevronDownIcon />} />
                        </span>
                      )}
                      {r.name}
                    </button>
                    <span className={styles['cpr__cell']}>
                      <LabelTag label={ROLE_LABEL[r.role]} size="X-Small" type="Default" />
                    </span>
                    <span className={styles['cpr__cell']}>
                      {r.conditions.length}
                    </span>
                    <span className={styles['cpr__cell']}>
                      {r.permissions.length} {r.permissions.length === 1 ? 'permission' : 'permissions'}
                    </span>
                    <span className={styles['cpr__row-actions']}>
                      <button
                        type="button"
                        className={styles['cpr__icon-btn']}
                        aria-label={`${r.name} actions`}
                        aria-haspopup="menu"
                        aria-expanded={menuId === r.id}
                        onClick={() => setMenuId(menuId === r.id ? null : r.id)}
                      >
                        <Icon size="16" glyph={<DotsHorizontalIcon />} />
                      </button>
                      {menuId === r.id && (
                        <div className={styles['cpr__row-menu']} role="menu">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setMenuId(null);
                              onEdit(r.id);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className={styles['cpr__row-menu-danger']}
                            onClick={() => {
                              setMenuId(null);
                              setDeleteId(r.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </span>
                  </div>

                  {/* Accordion: editor expands in place under the row. */}
                  {container === 'accordion' && open && draft && (
                    <div className={styles['cpr__accordion-body']}>
                      <RuleEditor
                        lex={lex}
                        draft={draft}
                        scenario={scenario}
                        onChange={onChange}
                        onSave={onSave}
                        onCancel={onCancel}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles['cpr__pagination']}>
            1–{rules.length} of {rules.length}
          </div>
        </>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className={styles['cpr__confirm-overlay']}>
          <div className={styles['cpr__confirm']} role="alertdialog" aria-modal="true">
            <h3 className={styles['cpr__confirm-title']}>
              {lex.deleteTitle(rules.find((r) => r.id === deleteId)?.name ?? '')}
            </h3>
            <p className={styles['cpr__confirm-body']}>{lex.deleteBody}</p>
            <div className={styles['cpr__confirm-actions']}>
              <Button emphasis="Tertiary" size="Small" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button
                emphasis="Primary"
                size="Small"
                onClick={() => {
                  onDelete(deleteId);
                  setDeleteId(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
