import { useMemo, useState, type ReactNode } from 'react';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DownloadOutlineIcon from '@mattermost/compass-icons/components/download-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import WebhookIcon from '@mattermost/compass-icons/components/webhook';
import PowerPlugOutlineIcon from '@mattermost/compass-icons/components/power-plug-outline';

import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';

import {
  ROSTER,
  TIER_META,
  REPORT,
  type ExposureItem,
  type SurfaceIcon,
  type Tier,
} from './fixtures';
import styles from './SeenByModal.module.scss';

const TIER_GLYPH: Record<Tier, ReactNode> = {
  confirmed: <CheckCircleIcon />,
  inferred: <AlertCircleOutlineIcon />,
  lateral: <AlertOutlineIcon />,
};

const LATERAL_GLYPH: Partial<Record<SurfaceIcon, ReactNode>> = {
  permalink: <LinkVariantIcon />,
  webhook: <WebhookIcon />,
  integration: <PowerPlugOutlineIcon />,
};

const TIER_ORDER: Tier[] = ['confirmed', 'inferred', 'lateral'];

// Short filter labels (the section headings are longer/plainer).
const FILTERS: { key: 'all' | Tier; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'inferred', label: 'May have' },
  { key: 'lateral', label: 'Beyond' },
];

function secondaryLabel(item: ExposureItem): string {
  return item.events.map((e) => `${e.surface} · ${e.time}`).join('   •   ');
}

function RosterRow({ item }: { item: ExposureItem }) {
  const leading = item.system ? (
    <span className={styles['seen-by-modal__sys-tile']} aria-hidden="true">
      <Icon size="16" glyph={LATERAL_GLYPH[item.events[0].icon] ?? <AlertOutlineIcon />} />
    </span>
  ) : (
    <UserAvatar src={item.src} alt={item.name} size="28" />
  );

  let trailing: ReactNode = null;
  if (item.system && item.reach != null) {
    trailing = (
      <Chip size="Small" tone="danger">
        {item.reach} reachable
      </Chip>
    );
  }

  return (
    <MenuItem
      label={item.name}
      secondaryLabel={secondaryLabel(item)}
      secondaryLabelPosition="Below"
      leadingVisual={leading}
      trailingVisual={trailing ?? undefined}
      trailingElement={trailing != null}
      destructive={item.tier === 'lateral'}
    />
  );
}

interface SeenByModalProps {
  onClose: () => void;
}

export default function SeenByModal({ onClose }: SeenByModalProps) {
  const [filter, setFilter] = useState<'all' | Tier>('all');
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<Tier>>(new Set());

  const q = query.trim().toLowerCase();

  const toggleCollapse = (t: Tier) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const counts = useMemo(
    () => ({
      all: ROSTER.length,
      confirmed: ROSTER.filter((r) => r.tier === 'confirmed').length,
      inferred: ROSTER.filter((r) => r.tier === 'inferred').length,
      lateral: ROSTER.filter((r) => r.tier === 'lateral').length,
    }),
    [],
  );

  const itemsFor = (tier: Tier) =>
    ROSTER.filter(
      (r) => r.tier === tier && (!q || r.name.toLowerCase().includes(q)),
    );

  const tiersToRender = TIER_ORDER.filter((t) => filter === 'all' || filter === t);
  const anyResults = tiersToRender.some((t) => itemsFor(t).length > 0);

  return (
    <Modal
      size="Medium"
      title="Exposed users"
      subtitle={`Quarantined in ~${REPORT.channel} · roster as of ${REPORT.asOf}`}
      onClose={onClose}
      noBodyPadding
      footer={
        <>
          <Button emphasis="Tertiary" onClick={onClose}>
            Close
          </Button>
          <Button
            emphasis="Primary"
            leadingIcon={<Icon size="16" glyph={<DownloadOutlineIcon />} />}
          >
            Add to report
          </Button>
        </>
      }
    >
      {/* Persistent completeness caveat — one line, carries into the exported report. */}
      <p className={styles['seen-by-modal__note']}>
        <span className={styles['seen-by-modal__note-icon']}>
          <Icon size="12" glyph={<InformationOutlineIcon />} />
        </span>
        This is who we know was exposed before the message was quarantined — it may
        not be everyone. Certainty decreases as you move down the list.
      </p>

      {/* Filter + search — pinned above the scrollable roster. */}
      <div className={styles['seen-by-modal__controls']}>
        <SearchInput
          size="Medium"
          placeholder="Search people"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
        />
        <div className={styles['seen-by-modal__filters']}>
          {FILTERS.map((f) => (
            <Chip
              key={f.key}
              as="button"
              size="Small"
              tone={filter === f.key ? 'info' : 'neutral'}
              onClick={() => setFilter(f.key)}
            >
              {f.label} {counts[f.key]}
            </Chip>
          ))}
        </div>
      </div>

      <Scrollbars style={{ maxHeight: '58vh' }}>
        <div className={styles['seen-by-modal']}>
          {!anyResults && (
            <p className={styles['seen-by-modal__empty']}>
              No people match “{query}”.
            </p>
          )}

          {anyResults &&
            tiersToRender.map((tier) => {
              const meta = TIER_META[tier];
              const items = itemsFor(tier);
              if (items.length === 0) return null;
              // Search force-expands so matches are never hidden behind a collapse.
              const isCollapsed = collapsed.has(tier) && !q;
              return (
                <section key={tier} className={styles['seen-by-modal__section']}>
                  <button
                    type="button"
                    className={styles['seen-by-modal__section-head']}
                    aria-expanded={!isCollapsed}
                    onClick={() => toggleCollapse(tier)}
                  >
                    <span className={styles['seen-by-modal__section-head-left']}>
                      <span
                        className={`${styles['seen-by-modal__section-chev']} ${
                          isCollapsed
                            ? styles['seen-by-modal__section-chev--collapsed']
                            : ''
                        }`}
                      >
                        <Icon size="16" glyph={<ChevronDownIcon />} />
                      </span>
                      <span
                        className={`${styles['seen-by-modal__section-icon']} ${
                          styles[`seen-by-modal__section-icon--${meta.tone}`]
                        }`}
                      >
                        <Icon size="16" glyph={TIER_GLYPH[tier]} />
                      </span>
                      <span className={styles['seen-by-modal__section-title']}>
                        {meta.label}
                      </span>
                    </span>
                    <Chip size="Small" tone={meta.tone}>
                      {items.length}
                    </Chip>
                  </button>
                  {!isCollapsed && (
                    <>
                      <p className={styles['seen-by-modal__section-def']}>
                        {meta.definition}
                      </p>
                      <div className={styles['seen-by-modal__rows']}>
                        {items.map((item) => (
                          <RosterRow key={item.key} item={item} />
                        ))}
                      </div>
                    </>
                  )}
                </section>
              );
            })}
        </div>
      </Scrollbars>
    </Modal>
  );
}
