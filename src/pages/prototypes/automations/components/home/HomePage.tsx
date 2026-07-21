import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import StarIcon from '@mattermost/compass-icons/components/star';
import {
  Button,
  Icon,
  IconButton,
  MenuItem,
  PopoverMenu,
  Scrollbar,
  SearchInput,
  Switch,
  Tag,
} from '@mattermost/compass-ui';
import { useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { SYSTEM_TAGS } from '../../data/automationsData';
import type { AutomationScope, AutomationStatus } from '../../data/types';
import { useAutomations } from '../../context/AutomationsContext';
import styles from './HomePage.module.scss';

const BASE = '/prototypes/automations';

function formatWhen(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

function scopeLabel(scope: AutomationScope) {
  return scope.toUpperCase();
}

export default function HomePage() {
  const navigate = useNavigate();
  const {
    automations,
    createBlank,
    setStatus,
    toggleFavorite,
    recordRecent,
  } = useAutomations();

  const [query, setQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<AutomationScope | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AutomationStatus | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const stats = useMemo(() => {
    const enabled = automations.filter((a) => a.status === 'enabled').length;
    const disabled = automations.filter((a) => a.status === 'disabled').length;
    return { total: automations.length, enabled, disabled };
  }, [automations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return automations.filter((a) => {
      if (scopeFilter !== 'all' && a.scope !== scopeFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (tagFilter && !a.tags.includes(tagFilter)) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.creator.toLowerCase().includes(q)
      );
    });
  }, [automations, query, scopeFilter, statusFilter, tagFilter]);

  const openEditor = (id: string) => {
    recordRecent(id);
    navigate(`${BASE}/${id}/editor`);
  };

  const onNewBlank = () => {
    setNewOpen(false);
    const id = createBlank();
    openEditor(id);
  };

  return (
    <div className={styles.home}>
      <div className={styles.home__header}>
        <div>
          <h1 className={styles.home__title}>Automations</h1>
          <p className={styles.home__stats}>
            {stats.total} automations · {stats.enabled} enabled · {stats.disabled}{' '}
            disabled
          </p>
        </div>
        <div className={styles.home__actions}>
          <Button
            emphasis="Tertiary"
            size="Small"
            onClick={() => navigate(`${BASE}/templates`)}
          >
            Templates
          </Button>
          <div style={{ position: 'relative' }}>
            <Button
              emphasis="Primary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
              onClick={() => setNewOpen((v) => !v)}
            >
              New
            </Button>
            {newOpen ? (
              <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 20 }}>
                <PopoverMenu>
                  <MenuItem
                    label="Blank automation"
                    leadingElement={false}
                    onClick={onNewBlank}
                  />
                  <MenuItem
                    label="From template"
                    leadingElement={false}
                    onClick={() => {
                      setNewOpen(false);
                      navigate(`${BASE}/templates`);
                    }}
                  />
                </PopoverMenu>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.home__filters}>
        <div className={styles.home__search}>
          <SearchInput
            label="Search automations or tags…"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            size="Small"
          />
        </div>
        <div className={styles['home__filter-row']}>
          <span className={styles['home__filter-label']}>Status</span>
          {(['all', 'draft', 'enabled', 'disabled'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={[
                styles.home__pill,
                statusFilter === s ? styles['home__pill--active'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className={styles['home__filter-row']}>
          <span className={styles['home__filter-label']}>Scope</span>
          {(['all', 'global', 'team', 'channel'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={[
                styles.home__pill,
                scopeFilter === s ? styles['home__pill--active'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setScopeFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className={styles['home__filter-row']}>
          <span className={styles['home__filter-label']}>Tags</span>
          {SYSTEM_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={[
                styles.home__pill,
                tagFilter === tag ? styles['home__pill--active'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setTagFilter((t) => (t === tag ? null : tag))}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className={styles['home__table-wrap']}>
        {filtered.length === 0 ? (
          <div className={styles.home__empty}>
            <p>
              {automations.length === 0
                ? 'No automations yet. Create one to get started.'
                : 'No automations match your filters.'}
            </p>
            <Button emphasis="Primary" size="Small" onClick={onNewBlank}>
              New automation
            </Button>
          </div>
        ) : (
          <Scrollbar style={{ height: '100%' }}>
            <table className={styles.home__table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Last run</th>
                  <th>Scope</th>
                  <th>Creator</th>
                  <th>Last edited</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    className={styles.home__row}
                    onClick={() => openEditor(a.id)}
                  >
                    <td>
                      <div className={styles.home__name}>{a.name}</div>
                      <div className={styles.home__tags}>
                        {a.tags.map((tag) => (
                          <Tag key={tag} label={tag} size="X-Small" type="Info Dim" />
                        ))}
                      </div>
                    </td>
                    <td
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      {a.status === 'draft' ? (
                        <Tag label="Draft" size="X-Small" type="Default" />
                      ) : (
                        <Switch
                          size="Small"
                          checked={a.status === 'enabled'}
                          aria-label={`Enable ${a.name}`}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setStatus(a.id, e.target.checked ? 'enabled' : 'disabled')
                          }
                        >
                          {a.status === 'enabled' ? 'Enabled' : 'Disabled'}
                        </Switch>
                      )}
                    </td>
                    <td>
                      <span className={styles.home__run}>
                        <span
                          className={[
                            styles.home__dot,
                            a.lastRunStatus === 'success'
                              ? styles['home__dot--success']
                              : '',
                            a.lastRunStatus === 'failed'
                              ? styles['home__dot--failed']
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        />
                        {formatWhen(a.lastRunAt)}
                      </span>
                    </td>
                    <td>
                      <Tag
                        label={scopeLabel(a.scope)}
                        size="X-Small"
                        type="Info"
                        casing="All Caps"
                      />
                    </td>
                    <td>{a.creator}</td>
                    <td>
                      {formatWhen(a.lastEditedAt)}
                      <div style={{ opacity: 0.64 }}>{a.lastEditedBy}</div>
                    </td>
                    <td
                      className={styles['home__menu-cell']}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <IconButton
                          aria-label={`Actions for ${a.name}`}
                          size="Small"
                          padding="Compact"
                          icon={<Icon size="16" glyph={<DotsVerticalIcon />} />}
                          onClick={() =>
                            setMenuFor((id) => (id === a.id ? null : a.id))
                          }
                        />
                        {menuFor === a.id ? (
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: '110%',
                              zIndex: 20,
                            }}
                          >
                            <PopoverMenu>
                              <MenuItem
                                label={a.favorite ? 'Unfavorite' : 'Favorite'}
                                leadingVisual={
                                  <Icon
                                    size="16"
                                    glyph={
                                      a.favorite ? <StarIcon /> : <StarOutlineIcon />
                                    }
                                  />
                                }
                                onClick={() => {
                                  toggleFavorite(a.id);
                                  setMenuFor(null);
                                }}
                              />
                              <MenuItem
                                label="Run history"
                                leadingElement={false}
                                onClick={() => {
                                  setMenuFor(null);
                                  navigate(`${BASE}/${a.id}/runs`);
                                }}
                              />
                              <MenuItem
                                label="Change history"
                                leadingElement={false}
                                onClick={() => {
                                  setMenuFor(null);
                                  navigate(`${BASE}/${a.id}/history`);
                                }}
                              />
                              <MenuItem
                                label="Delete"
                                leadingElement={false}
                                destructive
                                onClick={() => setMenuFor(null)}
                              />
                            </PopoverMenu>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Scrollbar>
        )}
      </div>
    </div>
  );
}
