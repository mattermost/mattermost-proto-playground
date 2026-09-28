import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type FormEvent,
  type MouseEvent,
  type RefObject,
} from 'react';
import { Link } from 'react-router-dom';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import {
  PROTOTYPES,
  BRANCH_FOCUS_PROTOTYPE_IDS,
  GROUP_META,
  type PrototypeEntry,
  type PrototypeGroup,
} from '@/manifests/prototypes';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import Modal from '@/components/ui/Modal/Modal';
import PopoverMenu, {
  PopoverMenuTitle,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import TextInput from '@/components/ui/TextInput/TextInput';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import PageHero from '@/components/layout/PageHero/PageHero';
import shellStyles from '@/pages/_shell/DocShell.module.scss';
import {
  addCustomInitiative,
  buildOrganizedInitiativeGroups,
  listAllInitiativeMetas,
  movePrototypeToInitiative,
  resolveInitiativeId,
  resolveInitiativeMeta,
  type OrganizedInitiativeMeta,
} from './initiativeOrganization';
import styles from './PrototypesIndex.module.scss';

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const CATEGORY_ORDER: PrototypeGroup[] = [
  'zero-trust-abac',
  'data-policy',
  'navigation',
  'encryption-privacy',
  'calls-platform',
];

const LISTED_PROTOTYPES = PROTOTYPES.filter((entry) => {
  if (entry.unlisted) return false;
  if (BRANCH_FOCUS_PROTOTYPE_IDS.size === 0) return true;
  return BRANCH_FOCUS_PROTOTYPE_IDS.has(entry.id);
});

type CategoryFilter = PrototypeGroup | 'all';

export default function PrototypesIndex() {
  const [orgTick, setOrgTick] = useState(0);
  const refreshOrg = useCallback(() => setOrgTick((n) => n + 1), []);

  const initiativeGroups = useMemo(
    () => buildOrganizedInitiativeGroups(LISTED_PROTOTYPES),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- orgTick forces rebuild after localStorage writes
    [orgTick],
  );

  const activeCategories = useMemo(
    () =>
      CATEGORY_ORDER.filter((cat) =>
        initiativeGroups.some(
          (g) => resolveInitiativeMeta(g.initiative).group === cat,
        ),
      ),
    [initiativeGroups],
  );

  const [expanded, setExpanded] = useState<Set<string>>(
    () =>
      new Set(
        buildOrganizedInitiativeGroups(LISTED_PROTOTYPES).length
          ? [buildOrganizedInitiativeGroups(LISTED_PROTOTYPES)[0].initiative]
          : [],
      ),
  );
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newBlurb, setNewBlurb] = useState('');
  const [newGroup, setNewGroup] = useState<PrototypeGroup>('zero-trust-abac');
  const [moveMenuFor, setMoveMenuFor] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const draggedRef = useRef(false);
  const moveMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClose(moveMenuRef, moveMenuFor !== null, () => setMoveMenuFor(null));

  const visibleGroups = useMemo(
    () =>
      category === 'all'
        ? initiativeGroups
        : initiativeGroups.filter(
            (g) => resolveInitiativeMeta(g.initiative).group === category,
          ),
    [category, initiativeGroups],
  );

  const allInitiatives = useMemo(
    () => listAllInitiativeMetas(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgTick],
  );

  function toggle(initiative: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(initiative)) next.delete(initiative);
      else next.add(initiative);
      return next;
    });
  }

  function expandAll() {
    setExpanded(new Set(visibleGroups.map((g) => g.initiative)));
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  function movePrototype(prototypeId: string, initiativeId: string) {
    movePrototypeToInitiative(prototypeId, initiativeId);
    setMoveMenuFor(null);
    setExpanded((prev) => new Set(prev).add(initiativeId));
    refreshOrg();
  }

  function handleCreateInitiative(e: FormEvent) {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    const created = addCustomInitiative({
      label,
      blurb: newBlurb,
      group: newGroup,
    });
    setAddOpen(false);
    setNewLabel('');
    setNewBlurb('');
    setNewGroup('zero-trust-abac');
    setExpanded((prev) => new Set(prev).add(created.id));
    setCategory('all');
    refreshOrg();
  }

  function onCardDragStart(prototypeId: string, e: DragEvent) {
    draggedRef.current = true;
    setDraggingId(prototypeId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', prototypeId);
  }

  function onCardDragEnd() {
    setDraggingId(null);
    setDropTarget(null);
    window.setTimeout(() => {
      draggedRef.current = false;
    }, 0);
  }

  function onInitiativeDragOver(initiativeId: string, e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(initiativeId);
    setExpanded((prev) => {
      if (prev.has(initiativeId)) return prev;
      return new Set(prev).add(initiativeId);
    });
  }

  function onInitiativeDrop(initiativeId: string, e: DragEvent) {
    e.preventDefault();
    const prototypeId =
      e.dataTransfer.getData('text/plain') || draggingId || '';
    if (!prototypeId) return;
    if (resolveInitiativeId(prototypeId) === initiativeId) {
      setDropTarget(null);
      setDraggingId(null);
      return;
    }
    draggedRef.current = true;
    movePrototype(prototypeId, initiativeId);
    setDropTarget(null);
    setDraggingId(null);
  }

  const visibleCount = visibleGroups.reduce((n, g) => n + g.entries.length, 0);
  const allVisibleOpen =
    visibleGroups.length > 0 &&
    visibleGroups.every((g) => expanded.has(g.initiative));

  return (
    <div className={shellStyles['doc-shell']}>
      <div className={shellStyles['doc-shell__top']}>
        <PageHero
          breadcrumb="Prototypes"
          title="Prototypes"
          description="End-to-end flow prototypes used for design exploration and stakeholder review."
        />
      </div>

      <div
        className={`${shellStyles['doc-shell__body']} ${shellStyles['doc-shell__body--standalone']}`}
      >
        {LISTED_PROTOTYPES.length === 0 && (
          <p className={styles['prototypes-index__empty']}>
            No prototypes registered yet. Add entries to <code>PROTOTYPES</code>{' '}
            in <code>src/manifests/prototypes.ts</code>.
          </p>
        )}

        <section className={styles['prototypes-index__section']}>
          <div className={styles['prototypes-index__section-header']}>
            <h2 className={styles['prototypes-index__section-heading']}>
              Browse by initiative
            </h2>
            <span className={styles['prototypes-index__group-count']}>
              {visibleCount} {visibleCount === 1 ? 'prototype' : 'prototypes'} ·{' '}
              {visibleGroups.length}{' '}
              {visibleGroups.length === 1 ? 'initiative' : 'initiatives'}
            </span>
          </div>

          <div className={styles['prototypes-index__toolbar']}>
            <div
              className={styles['prototypes-index__filters']}
              role="group"
              aria-label="Filter by category"
            >
              <button
                type="button"
                className={styles['prototypes-index__chip']}
                aria-pressed={category === 'all'}
                onClick={() => setCategory('all')}
              >
                All
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={styles['prototypes-index__chip']}
                  aria-pressed={category === cat}
                  onClick={() => setCategory(cat)}
                  style={
                    {
                      '--proto-accent': GROUP_META[cat].accentColor,
                    } as CSSProperties
                  }
                >
                  <span
                    className={styles['prototypes-index__chip-dot']}
                    aria-hidden="true"
                  />
                  {GROUP_META[cat].label}
                </button>
              ))}
            </div>

            <div className={styles['prototypes-index__toolbar-actions']}>
              <Button
                emphasis="Tertiary"
                size="Small"
                leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                onClick={() => setAddOpen(true)}
              >
                Add initiative
              </Button>
              <button
                type="button"
                className={styles['prototypes-index__expand-toggle']}
                onClick={allVisibleOpen ? collapseAll : expandAll}
              >
                {allVisibleOpen ? 'Collapse all' : 'Expand all'}
              </button>
            </div>
          </div>

          <p className={styles['prototypes-index__hint']}>
            Drag a prototype onto an initiative, or use Move on the card menu.
          </p>

          <div className={styles['prototypes-index__accordion']}>
            {visibleGroups.map(({ initiative, entries }) => {
              const meta = resolveInitiativeMeta(initiative);
              const groupMeta = GROUP_META[meta.group];
              const isOpen = expanded.has(initiative);
              const panelId = `initiative-${initiative}`;
              const isDropTarget = dropTarget === initiative && draggingId;

              return (
                <div
                  key={initiative}
                  className={[
                    styles['prototypes-index__init'],
                    isDropTarget
                      ? styles['prototypes-index__init--drop-target']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={
                    {
                      '--proto-accent': groupMeta.accentColor,
                    } as CSSProperties
                  }
                  onDragOver={(e) => onInitiativeDragOver(initiative, e)}
                  onDragLeave={() =>
                    setDropTarget((current) =>
                      current === initiative ? null : current,
                    )
                  }
                  onDrop={(e) => onInitiativeDrop(initiative, e)}
                >
                  <button
                    type="button"
                    className={styles['prototypes-index__init-header']}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(initiative)}
                  >
                    <span
                      className={`${styles['prototypes-index__chevron']} ${
                        isOpen ? styles['prototypes-index__chevron--open'] : ''
                      }`}
                      aria-hidden="true"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M3 1.5L6.5 5L3 8.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className={styles['prototypes-index__init-heading']}>
                      <span className={styles['prototypes-index__init-title']}>
                        {meta.label}
                      </span>
                      {meta.blurb && (
                        <span className={styles['prototypes-index__init-blurb']}>
                          {meta.blurb}
                        </span>
                      )}
                    </span>
                    <span className={styles['prototypes-index__init-meta']}>
                      <span className={styles['prototypes-index__init-tag']}>
                        {groupMeta.label}
                      </span>
                      <span className={styles['prototypes-index__init-count']}>
                        {entries.length}
                      </span>
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      className={styles['prototypes-index__init-panel']}
                    >
                      {entries.length === 0 ? (
                        <p className={styles['prototypes-index__init-empty']}>
                          Drop prototypes here, or use Move on a card.
                        </p>
                      ) : (
                        <div className={styles['prototypes-index__cards-grid']}>
                          {entries.map((p) => (
                            <PrototypeCard
                              key={p.id}
                              prototype={p}
                              moveMenuOpen={moveMenuFor === p.id}
                              moveMenuRef={
                                moveMenuFor === p.id ? moveMenuRef : undefined
                              }
                              allInitiatives={allInitiatives}
                              currentInitiative={initiative}
                              dragging={draggingId === p.id}
                              onOpenMoveMenu={() =>
                                setMoveMenuFor((current) =>
                                  current === p.id ? null : p.id,
                                )
                              }
                              onMove={(target) => movePrototype(p.id, target)}
                              onDragStart={(e) => onCardDragStart(p.id, e)}
                              onDragEnd={onCardDragEnd}
                              onNavigateClick={(e) => {
                                if (draggedRef.current) {
                                  e.preventDefault();
                                }
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {addOpen && (
        <div
          className={styles['prototypes-index__modal-root']}
          role="presentation"
          onClick={() => setAddOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Modal
              size="Small"
              title="Add initiative"
              subtitle="Group related prototypes. You can move cards into it anytime."
              onClose={() => setAddOpen(false)}
            >
              <form
                className={styles['prototypes-index__add-form']}
                onSubmit={handleCreateInitiative}
              >
                <label className={styles['prototypes-index__field']}>
                  <span className={styles['prototypes-index__field-label']}>
                    Name
                  </span>
                  <TextInput
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.currentTarget.value)}
                    placeholder="e.g. Bot attributes"
                    autoFocus
                    required
                  />
                </label>
                <label className={styles['prototypes-index__field']}>
                  <span className={styles['prototypes-index__field-label']}>
                    Description (optional)
                  </span>
                  <TextInput
                    value={newBlurb}
                    onChange={(e) => setNewBlurb(e.currentTarget.value)}
                    placeholder="Short blurb for the accordion"
                  />
                </label>
                <label className={styles['prototypes-index__field']}>
                  <span className={styles['prototypes-index__field-label']}>
                    Category
                  </span>
                  <select
                    className={styles['prototypes-index__select']}
                    value={newGroup}
                    onChange={(e) =>
                      setNewGroup(e.target.value as PrototypeGroup)
                    }
                  >
                    {CATEGORY_ORDER.map((cat) => (
                      <option key={cat} value={cat}>
                        {GROUP_META[cat].label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className={styles['prototypes-index__add-actions']}>
                  <Button
                    type="button"
                    emphasis="Tertiary"
                    onClick={() => setAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    emphasis="Primary"
                    disabled={!newLabel.trim()}
                  >
                    Create initiative
                  </Button>
                </div>
              </form>
            </Modal>
          </div>
        </div>
      )}
    </div>
  );
}

function PrototypeCard({
  prototype: p,
  moveMenuOpen,
  moveMenuRef,
  allInitiatives,
  currentInitiative,
  dragging,
  onOpenMoveMenu,
  onMove,
  onDragStart,
  onDragEnd,
  onNavigateClick,
}: {
  prototype: PrototypeEntry;
  moveMenuOpen: boolean;
  moveMenuRef?: RefObject<HTMLDivElement | null>;
  allInitiatives: OrganizedInitiativeMeta[];
  currentInitiative: string;
  dragging: boolean;
  onOpenMoveMenu: () => void;
  onMove: (initiativeId: string) => void;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
  onNavigateClick: (e: MouseEvent) => void;
}) {
  const destinations = allInitiatives.filter(
    (item) => item.id !== currentInitiative,
  );

  return (
    <div
      className={[
        styles['prototypes-index__card'],
        dragging ? styles['prototypes-index__card--dragging'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        { '--proto-accent': GROUP_META[p.group].accentColor } as CSSProperties
      }
      draggable
      onDragStart={(e) => {
        const target = e.target as HTMLElement | null;
        if (target?.closest(`.${styles['prototypes-index__card-menu']}`)) {
          e.preventDefault();
          return;
        }
        onDragStart(e);
      }}
      onDragEnd={onDragEnd}
    >
      <Link
        to={p.path}
        className={styles['prototypes-index__card-link']}
        onClick={onNavigateClick}
      >
        <div className={styles['prototypes-index__card-accent']} />
        <div className={styles['prototypes-index__card-body']}>
          <div className={styles['prototypes-index__card-title']}>{p.label}</div>
          {p.description && (
            <div className={styles['prototypes-index__card-desc']}>
              {p.description}
            </div>
          )}
          <div className={styles['prototypes-index__card-date']}>
            {formatDate(p.addedAt)}
          </div>
        </div>
      </Link>

      <div className={styles['prototypes-index__card-menu']} ref={moveMenuRef}>
        <IconButton
          size="Small"
          aria-label={`Move ${p.label}`}
          aria-expanded={moveMenuOpen}
          aria-haspopup="menu"
          icon={<Icon size="16" glyph={<DotsVerticalIcon />} />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenMoveMenu();
          }}
        />
        {moveMenuOpen && (
          <div className={styles['prototypes-index__move-menu']}>
            <PopoverMenu aria-label={`Move ${p.label} to initiative`}>
              <PopoverMenuTitle>Move to initiative</PopoverMenuTitle>
              {destinations.length === 0 ? (
                <p className={styles['prototypes-index__move-empty']}>
                  Add another initiative to move this prototype.
                </p>
              ) : (
                destinations.map((item) => (
                  <MenuItem
                    key={item.id}
                    label={item.label}
                    secondaryLabel={GROUP_META[item.group].label}
                    secondaryLabelPosition="Inline"
                    leadingElement={false}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(item.id);
                    }}
                  />
                ))
              )}
            </PopoverMenu>
          </div>
        )}
      </div>
    </div>
  );
}
