// SG2 — Add Teams to Policy modal. Mirrors the Add Channels modal pattern
// from the ABAC file (Figma node 5707:155553, file UCCKYrwLe2Bs2xYqMAEZCI):
// combined chip-bar input + Add button on the right + keyboard-nav row list.
//
// Spec §3.4 additions layered on top of the channel pattern:
//   - Mutual exclusivity: group-synced teams disabled with inline note
//   - Already-on-another-policy teams dimmed with inline note
//   - Already-assigned-to-this-policy excluded from list (server-side)
//
// Interactive:
//   1. Type to filter rows
//   2. Click eligible row OR click +  to add team -> chip appears in bar
//   3. Click chip X to remove from selection
//   4. Click "Add" -> closes (stub)
//   5. Arrow key navigation highlights rows (visual only)
import { useMemo, useRef, useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import Icon from '@/components/ui/Icon/Icon';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import styles from '../MembershipPoliciesTeams.module.scss';

interface PickerTeam {
  id: string;
  name: string;
  initials: string;
  state: 'eligible' | 'assigned-other' | 'group-synced';
  otherPolicy?: string;
}

const ALL_TEAMS: PickerTeam[] = [
  { id: 't1', name: 'Mission Planning', initials: 'MP', state: 'eligible' },
  { id: 't2', name: 'Cyber Operations North', initials: 'CO', state: 'eligible' },
  { id: 't3', name: 'Logistics & Supply', initials: 'LS', state: 'eligible' },
  {
    id: 't4',
    name: 'Program BRAVO',
    initials: 'PB',
    state: 'assigned-other',
    otherPolicy: 'BRAVO Clearance',
  },
  { id: 't5', name: 'Intel Fusion Cell', initials: 'IF', state: 'eligible' },
  {
    id: 't6',
    name: 'External Partners',
    initials: 'EP',
    state: 'group-synced',
  },
  { id: 't7', name: 'Headquarters Staff', initials: 'HQ', state: 'eligible' },
  {
    id: 't8',
    name: 'Training Pipeline',
    initials: 'TP',
    state: 'group-synced',
  },
  {
    id: 't9',
    name: 'Maritime Wing',
    initials: 'MW',
    state: 'assigned-other',
    otherPolicy: 'Maritime Restricted',
  },
  { id: 't10', name: 'Joint Task Force OMEGA', initials: 'JT', state: 'eligible' },
];

const DEFAULT_SELECTED = new Set([
  't1',
  't2',
  't3',
  't5',
  't7',
]);

export default function SG2AddTeamsModal() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(DEFAULT_SELECTED);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(() => {
    if (!query) {
      return ALL_TEAMS;
    }
    const q = query.toLowerCase();
    return ALL_TEAMS.filter((t) => t.name.toLowerCase().includes(q));
  }, [query]);

  const handleAdd = (t: PickerTeam) => {
    if (t.state !== 'eligible') return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.add(t.id);
      return next;
    });
    setQuery('');
    inputRef.current?.focus();
  };

  const handleRemove = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (visible.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, visible.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const t = visible[highlightIdx];
      if (t && t.state === 'eligible' && !selected.has(t.id)) {
        handleAdd(t);
      }
    } else if (
      e.key === 'Backspace' &&
      query === '' &&
      selected.size > 0
    ) {
      const last = Array.from(selected).pop();
      if (last) handleRemove(last);
    }
  };

  const selectedTeams = ALL_TEAMS.filter((t) => selected.has(t.id));

  return (
    <div>
      <div
        className={`${styles['mpt__modal-frame']} ${styles['mpt__modal-frame--small']}`}
      >
        <Modal
          size="Small"
          title="Add Teams to Policy"
          onClose={() => {}}
          noBodyPadding
        >
          <div className={styles['mpt__add2-section']}>
            {/* Chip-bar + Add button row */}
            <div className={styles['mpt__add2-bar-row']}>
              <div className={styles['mpt__add2-chipbar']}>
                {selectedTeams.map((t) => (
                  <span key={t.id} className={styles['mpt__add2-chip']}>
                    <span className={styles['mpt__add2-chip-label']}>
                      {t.name}
                    </span>
                    <button
                      type="button"
                      className={styles['mpt__add2-chip-close']}
                      aria-label={`Remove ${t.name}`}
                      onClick={() => handleRemove(t.id)}
                    >
                      <Icon size="12" glyph={<CloseIcon />} />
                    </button>
                  </span>
                ))}
                <input
                  ref={inputRef}
                  type="text"
                  className={styles['mpt__add2-input']}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlightIdx(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={selected.size === 0 ? 'Search teams' : ''}
                  aria-label="Search teams"
                />
              </div>
              <Button
                emphasis="Primary"
                disabled={selected.size === 0}
                onClick={() => {}}
              >
                Add
              </Button>
            </div>

            <p className={styles['mpt__add2-hint']}>
              Use ↑↓ to browse, ⏎ to select.
            </p>

            {/* Result list */}
            <div className={styles['mpt__add2-list']} role="listbox">
              {visible.length === 0 ? (
                <div className={styles['mpt__diag-empty']}>
                  No teams match "{query}"
                </div>
              ) : (
                visible.map((t, idx) => {
                  const isSelected = selected.has(t.id);
                  const isHighlighted = idx === highlightIdx;
                  const isEligible = t.state === 'eligible' && !isSelected;
                  const rowClass = [
                    styles['mpt__add2-row'],
                    isHighlighted ? styles['mpt__add2-row--highlight'] : '',
                    t.state === 'assigned-other'
                      ? styles['mpt__add2-row--dimmed']
                      : '',
                    t.state === 'group-synced'
                      ? styles['mpt__add2-row--disabled']
                      : '',
                    isSelected ? styles['mpt__add2-row--selected'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <div
                      key={t.id}
                      className={rowClass}
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseEnter={() => setHighlightIdx(idx)}
                      onClick={() => isEligible && handleAdd(t)}
                    >
                      <span className={styles['mpt__add2-row-icon']}>
                        <Icon
                          size="16"
                          glyph={
                            t.state === 'group-synced' ? (
                              <LockOutlineIcon />
                            ) : (
                              <AccountMultipleOutlineIcon />
                            )
                          }
                        />
                      </span>
                      <span className={styles['mpt__add2-row-main']}>
                        <span className={styles['mpt__add2-row-name']}>
                          {t.name}
                        </span>
                        {t.state === 'assigned-other' && (
                          <span className={styles['mpt__add2-row-note']}>
                            <Icon size="12" glyph={<LinkVariantIcon />} />{' '}
                            Assigned to policy "{t.otherPolicy}". Remove it
                            from that policy first.
                          </span>
                        )}
                        {t.state === 'group-synced' && (
                          <span className={styles['mpt__add2-row-note']}>
                            <Icon size="12" glyph={<LockOutlineIcon />} />{' '}
                            Group-synced — remove group sync to use membership
                            policies.
                          </span>
                        )}
                      </span>
                      {isEligible && isHighlighted && (
                        <IconButton
                          aria-label={`Add ${t.name}`}
                          size="Small"
                          icon={<Icon size="16" glyph={<PlusIcon />} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(t);
                          }}
                        />
                      )}
                      {isSelected && (
                        <span className={styles['mpt__add2-row-selected']}>
                          <LabelTag label="Selected" type="Info" size="X-Small" />
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className={styles['mpt__anno']}>
              <span className={styles['mpt__anno-icon']}>
                <Icon size="16" glyph={<InformationOutlineIcon />} />
              </span>
              <span>
                <strong>Pattern:</strong> mirrors the existing Add Channels
                modal (chip-bar input + inline Add button + keyboard-nav
                list).
                <br />
                <strong>Three states demonstrated:</strong>{' '}
                <em>eligible</em> rows (Mission Planning, Cyber Operations
                North) → addable;{' '}
                <em>assigned-to-other-policy</em>{' '}
                <LabelTag label="Assigned" type="Info Dim" size="X-Small" />
                {' '}
                rows (Program BRAVO, Maritime Wing) → dimmed, selection
                blocked; <em>group-synced</em>{' '}
                <LabelTag label="Group Sync" type="Warning" size="X-Small" />
                {' '}
                rows (External Partners, Training Pipeline) → disabled, mutual
                exclusivity with ABAC.
              </span>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
