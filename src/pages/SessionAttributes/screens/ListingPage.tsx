import { useEffect, useMemo, useRef, useState } from 'react';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CheckIcon from '@mattermost/compass-icons/components/check';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import CloseCircleOutlineIcon from '@mattermost/compass-icons/components/close-circle-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import TextInput from '@/components/ui/TextInput/TextInput';
import ConsoleFrame from '../shared/ConsoleFrame';
import PlatformIcons from '../shared/PlatformIcons';
import { SESSION_ATTRIBUTES } from '../shared/mockData';
import type { AttributeCategory, SessionAttribute } from '../shared/types';
import DisableConfirmModal from './DisableConfirmModal';
import styles from './ListingPage.module.scss';

const CATEGORIES: AttributeCategory[] = [
  'Network Identity',
  'Device Identity',
  'Device Posture',
  'User-Agent',
];

interface Preset {
  label: string;
  seconds: number;
}

const TTL_PRESETS: Preset[] = [
  { label: '30 seconds', seconds: 30 },
  { label: '1 minute', seconds: 60 },
  { label: '5 minutes', seconds: 300 },
  { label: '1 hour', seconds: 3600 },
  { label: '24 hours', seconds: 86400 },
];

const GRACE_PRESETS: Preset[] = TTL_PRESETS;

function formatSeconds(s: number): string {
  if (s === 0) return '—';
  if (s % 3600 === 0) return `${s / 3600}h`;
  if (s % 60 === 0) return `${s / 60}m`;
  return `${s}s`;
}

interface ListingPageProps {
  onOpenSettings?: () => void;
}

type SubmenuKind = 'ttl' | 'grace' | null;

export default function ListingPage({ onOpenSettings }: ListingPageProps) {
  const [search, setSearch] = useState('');
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SESSION_ATTRIBUTES.map((a) => [a.id, a.enabled])),
  );
  const [ttlMap, setTtlMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(SESSION_ATTRIBUTES.map((a) => [a.id, a.ttlSeconds])),
  );
  const [graceMap, setGraceMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(SESSION_ATTRIBUTES.map((a) => [a.id, a.gracePeriodSeconds])),
  );
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<SubmenuKind>(null);
  const [disableTarget, setDisableTarget] = useState<SessionAttribute | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeMenu) return;
    function onDocMouseDown(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setActiveSubmenu(null);
      }
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [activeMenu]);

  const filtered = useMemo(() => {
    if (!search.trim()) return SESSION_ATTRIBUTES;
    const q = search.toLowerCase();
    return SESSION_ATTRIBUTES.filter(
      (a) => a.displayName.toLowerCase().includes(q) || a.name.toLowerCase().includes(q),
    );
  }, [search]);

  function closeAll() {
    setActiveMenu(null);
    setActiveSubmenu(null);
  }

  function openMenu(id: string) {
    setActiveMenu((prev) => (prev === id ? null : id));
    setActiveSubmenu(null);
  }

  function toggleSubmenu(kind: SubmenuKind) {
    setActiveSubmenu((prev) => (prev === kind ? null : kind));
  }

  function selectTtl(attrId: string, seconds: number) {
    setTtlMap((m) => ({ ...m, [attrId]: seconds }));
    closeAll();
  }

  function selectGrace(attrId: string, seconds: number) {
    setGraceMap((m) => ({ ...m, [attrId]: seconds }));
    closeAll();
  }

  function startDisable(attr: SessionAttribute) {
    setDisableTarget(attr);
    closeAll();
  }

  function confirmDisable() {
    if (!disableTarget) return;
    setEnabledMap((m) => ({ ...m, [disableTarget.id]: false }));
    setDisableTarget(null);
  }

  function enableAttribute(id: string) {
    setEnabledMap((m) => ({ ...m, [id]: true }));
    closeAll();
  }

  return (
    <>
      <ConsoleFrame
        title="Session Attributes"
        activeItemId="session-attributes"
        enterpriseTag
        trailing={
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<CogOutlineIcon />} />}
            onClick={onOpenSettings}
          >
            Settings
          </Button>
        }
      >
        <div className={styles['listing__header-card']}>
          <button
            type="button"
            className={styles['listing__header-toggle']}
            onClick={() => setHeaderExpanded((e) => !e)}
            aria-expanded={headerExpanded}
          >
            <div className={styles['listing__header-text']}>
              <div className={styles['listing__header-title']}>
                Configure session attributes
                <LabelTag label="Enterprise" type="Info Dim" size="X-Small" />
              </div>
              {headerExpanded && (
                <div className={styles['listing__header-desc']}>
                  Attribute values will be derived from the user's device or external services and can be used in access control policies
                </div>
              )}
            </div>
            <span className={`${styles['listing__chevron']} ${headerExpanded ? styles['listing__chevron--open'] : ''}`}>
              <Icon size="20" glyph={<ChevronDownIcon />} />
            </span>
          </button>
        </div>

        <div className={styles['listing__toolbar']}>
          <div className={styles['listing__search']}>
            <TextInput
              size="Medium"
              placeholder="Search attributes"
              leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className={styles['listing__count']}>
            {filtered.length} attribute{filtered.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className={styles['listing__table']}>
          <div className={styles['listing__table-head']}>
            <div className={`${styles['listing__col']} ${styles['listing__col--display']}`}>Display Name</div>
            <div className={`${styles['listing__col']} ${styles['listing__col--name']}`}>Name</div>
            <div className={`${styles['listing__col']} ${styles['listing__col--type']}`}>Type</div>
            <div className={`${styles['listing__col']} ${styles['listing__col--platform']}`}>Platform</div>
            <div className={`${styles['listing__col']} ${styles['listing__col--timing']}`}>TTL</div>
            <div className={`${styles['listing__col']} ${styles['listing__col--timing']}`}>Grace</div>
            <div className={`${styles['listing__col']} ${styles['listing__col--status']}`}>Status</div>
            <div className={`${styles['listing__col']} ${styles['listing__col--actions']}`}>Actions</div>
          </div>

          {CATEGORIES.map((cat) => {
            const rows = filtered.filter((a) => a.category === cat);
            if (rows.length === 0) return null;
            return (
              <div key={cat} className={styles['listing__group']}>
                <div className={styles['listing__group-header']}>{cat}</div>
                {rows.map((attr) => {
                  const enabled = enabledMap[attr.id];
                  const isMenuOpen = activeMenu === attr.id;
                  const ttl = ttlMap[attr.id];
                  const grace = graceMap[attr.id];
                  return (
                    <div key={attr.id} className={styles['listing__row']}>
                      <div className={`${styles['listing__col']} ${styles['listing__col--display']}`}>
                        <div className={styles['listing__display-cell']}>
                          <span className={styles['listing__display-name']}>{attr.displayName}</span>
                          {attr.source === 'server' && (
                            <LabelTag label="Server" type="Info Dim" size="X-Small" />
                          )}
                        </div>
                      </div>
                      <div className={`${styles['listing__col']} ${styles['listing__col--name']}`}>
                        <code className={styles['listing__name']}>{attr.name}</code>
                      </div>
                      <div className={`${styles['listing__col']} ${styles['listing__col--type']}`}>
                        <span className={styles['listing__type']}>{attr.type}</span>
                      </div>
                      <div className={`${styles['listing__col']} ${styles['listing__col--platform']}`}>
                        <PlatformIcons
                          desktop={attr.desktop}
                          mobile={attr.mobile}
                          browser={attr.browser}
                        />
                      </div>
                      <div className={`${styles['listing__col']} ${styles['listing__col--timing']}`}>
                        <span className={styles['listing__timing']}>{formatSeconds(ttl)}</span>
                      </div>
                      <div className={`${styles['listing__col']} ${styles['listing__col--timing']}`}>
                        <span className={styles['listing__timing']}>{formatSeconds(grace)}</span>
                      </div>
                      <div className={`${styles['listing__col']} ${styles['listing__col--status']}`}>
                        <span className={`${styles['listing__status']} ${enabled ? styles['listing__status--enabled'] : styles['listing__status--disabled']}`}>
                          <Icon size="12" glyph={enabled ? <CheckCircleIcon /> : <CloseCircleOutlineIcon />} />
                          {enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className={`${styles['listing__col']} ${styles['listing__col--actions']}`}>
                        <div className={styles['listing__menu-wrap']} ref={isMenuOpen ? menuRef : null}>
                          <IconButton
                            size="X-Small"
                            aria-label={`Actions for ${attr.displayName}`}
                            icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
                            onClick={() => openMenu(attr.id)}
                          />
                          {isMenuOpen && (
                            <div className={styles['listing__menu']}>
                              <PopoverMenu>
                                <RowMenuItem
                                  label="Time-to-live (TTL)"
                                  value={formatSeconds(ttl)}
                                  active={activeSubmenu === 'ttl'}
                                  onClick={() => toggleSubmenu('ttl')}
                                />
                                <RowMenuItem
                                  label="Grace Period"
                                  value={formatSeconds(grace)}
                                  active={activeSubmenu === 'grace'}
                                  onClick={() => toggleSubmenu('grace')}
                                />
                                <div className={styles['listing__menu-divider']} />
                                {enabled ? (
                                  <button
                                    type="button"
                                    className={`${styles['listing__menu-item']} ${styles['listing__menu-item--destructive']}`}
                                    onClick={() => startDisable(attr)}
                                  >
                                    Disable
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className={styles['listing__menu-item']}
                                    onClick={() => enableAttribute(attr.id)}
                                  >
                                    Enable
                                  </button>
                                )}
                              </PopoverMenu>

                              {activeSubmenu === 'ttl' && (
                                <PresetSubmenu
                                  presets={TTL_PRESETS}
                                  current={ttl}
                                  onSelect={(s) => selectTtl(attr.id, s)}
                                />
                              )}
                              {activeSubmenu === 'grace' && (
                                <PresetSubmenu
                                  presets={GRACE_PRESETS.filter((p) => p.seconds >= ttl)}
                                  current={grace}
                                  onSelect={(s) => selectGrace(attr.id, s)}
                                  offsetY={36}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className={styles['listing__footer-actions']}>
          <Button emphasis="Primary">Save</Button>
          <Button emphasis="Tertiary">Cancel</Button>
        </div>
      </ConsoleFrame>

      {disableTarget && (
        <div className={styles['listing__backdrop']}>
          <DisableConfirmModal
            displayName={disableTarget.displayName}
            onCancel={() => setDisableTarget(null)}
            onConfirm={confirmDisable}
          />
        </div>
      )}
    </>
  );
}

interface RowMenuItemProps {
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}

function RowMenuItem({ label, value, active, onClick }: RowMenuItemProps) {
  return (
    <button
      type="button"
      className={`${styles['listing__menu-item']} ${active ? styles['listing__menu-item--active'] : ''}`}
      onClick={onClick}
    >
      <span className={styles['listing__menu-item-label']}>{label}</span>
      <span className={styles['listing__menu-item-value']}>{value}</span>
      <Icon size="12" glyph={<ChevronRightIcon />} />
    </button>
  );
}

interface PresetSubmenuProps {
  presets: Preset[];
  current: number;
  onSelect: (seconds: number) => void;
  offsetY?: number;
}

function PresetSubmenu({ presets, current, onSelect, offsetY = 0 }: PresetSubmenuProps) {
  return (
    <div
      className={styles['listing__submenu']}
      style={{ top: `${offsetY}px` }}
    >
      <PopoverMenu>
        {presets.map((p) => (
          <button
            key={p.seconds}
            type="button"
            className={styles['listing__submenu-item']}
            onClick={() => onSelect(p.seconds)}
          >
            <span className={styles['listing__submenu-item-label']}>{p.label}</span>
            {p.seconds === current && (
              <Icon size="12" glyph={<CheckIcon />} />
            )}
          </button>
        ))}
      </PopoverMenu>
    </div>
  );
}
