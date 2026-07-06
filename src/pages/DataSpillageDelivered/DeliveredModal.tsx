import { useMemo, useState, type ReactNode } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DownloadOutlineIcon from '@mattermost/compass-icons/components/download-outline';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import MonitorIcon from '@mattermost/compass-icons/components/monitor';
import CellphoneIcon from '@mattermost/compass-icons/components/cellphone';
import EmailOutlineIcon from '@mattermost/compass-icons/components/email-outline';
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
  REPORT,
  USER_COUNT,
  INTEGRATION_COUNT,
  type DeliveredItem,
  type DeliveredKind,
  type DeliveryIcon,
} from './fixtures';
import styles from './DeliveredModal.module.scss';

const METHOD_GLYPH: Record<DeliveryIcon, ReactNode> = {
  view: <EyeOutlineIcon />,
  session: <MonitorIcon />,
  push: <CellphoneIcon />,
  email: <EmailOutlineIcon />,
  permalink: <LinkVariantIcon />,
  webhook: <WebhookIcon />,
  integration: <PowerPlugOutlineIcon />,
};

interface GroupMeta {
  key: DeliveredKind;
  label: string;
  glyph: ReactNode;
  tone: 'neutral' | 'danger';
  definition: string;
}

const GROUPS: GroupMeta[] = [
  {
    key: 'user',
    label: 'People',
    glyph: <AccountMultipleOutlineIcon />,
    tone: 'neutral',
    definition: 'Everyone the message reached on any device, by any delivery method.',
  },
  {
    key: 'integration',
    label: 'Integrations & webhooks',
    glyph: <AlertOutlineIcon />,
    tone: 'danger',
    definition:
      'External systems the message was sent to. Treat as a possible leak beyond your control.',
  },
];

const FILTERS: { key: 'all' | DeliveredKind; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'user', label: 'People' },
  { key: 'integration', label: 'Integrations' },
];

function RosterRow({ item }: { item: DeliveredItem }) {
  const leading =
    item.kind === 'integration' ? (
      <span className={styles['delivered-modal__sys-tile']} aria-hidden="true">
        <Icon size="16" glyph={METHOD_GLYPH[item.icon]} />
      </span>
    ) : (
      <UserAvatar src={item.src} alt={item.name} size="28" />
    );

  return (
    <MenuItem
      label={item.name}
      secondaryLabel={`${item.method} · ${item.time}`}
      secondaryLabelPosition="Below"
      leadingVisual={leading}
      destructive={item.kind === 'integration'}
    />
  );
}

interface DeliveredModalProps {
  onClose: () => void;
}

export default function DeliveredModal({ onClose }: DeliveredModalProps) {
  const [filter, setFilter] = useState<'all' | DeliveredKind>('all');
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<DeliveredKind>>(new Set());

  const q = query.trim().toLowerCase();

  const counts = useMemo(
    () => ({ all: ROSTER.length, user: USER_COUNT, integration: INTEGRATION_COUNT }),
    [],
  );

  const itemsFor = (kind: DeliveredKind) =>
    ROSTER.filter(
      (r) => r.kind === kind && (!q || r.name.toLowerCase().includes(q)),
    );

  const groupsToRender = GROUPS.filter((g) => filter === 'all' || filter === g.key);
  const anyResults = groupsToRender.some((g) => itemsFor(g.key).length > 0);

  const toggleCollapse = (k: DeliveredKind) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  return (
    <Modal
      size="Medium"
      title="Delivered to"
      subtitle={`Quarantined in ~${REPORT.channel} · as of ${REPORT.asOf}`}
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
      <p className={styles['delivered-modal__note']}>
        <span className={styles['delivered-modal__note-icon']}>
          <Icon size="12" glyph={<InformationOutlineIcon />} />
        </span>
        Everyone the message reached before it was quarantined — through any channel,
        notification, email, or integration.
      </p>

      <div className={styles['delivered-modal__controls']}>
        <SearchInput
          size="Medium"
          placeholder="Search people"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
        />
        <div className={styles['delivered-modal__filters']}>
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
        <div className={styles['delivered-modal']}>
          {!anyResults && (
            <p className={styles['delivered-modal__empty']}>
              No people match “{query}”.
            </p>
          )}

          {anyResults &&
            groupsToRender.map((group) => {
              const items = itemsFor(group.key);
              if (items.length === 0) return null;
              const isCollapsed = collapsed.has(group.key) && !q;
              return (
                <section key={group.key} className={styles['delivered-modal__section']}>
                  <button
                    type="button"
                    className={styles['delivered-modal__section-head']}
                    aria-expanded={!isCollapsed}
                    onClick={() => toggleCollapse(group.key)}
                  >
                    <span className={styles['delivered-modal__section-head-left']}>
                      <span
                        className={`${styles['delivered-modal__section-chev']} ${
                          isCollapsed
                            ? styles['delivered-modal__section-chev--collapsed']
                            : ''
                        }`}
                      >
                        <Icon size="16" glyph={<ChevronDownIcon />} />
                      </span>
                      <span
                        className={`${styles['delivered-modal__section-icon']} ${
                          styles[`delivered-modal__section-icon--${group.tone}`]
                        }`}
                      >
                        <Icon size="16" glyph={group.glyph} />
                      </span>
                      <span className={styles['delivered-modal__section-title']}>
                        {group.label}
                      </span>
                    </span>
                    <Chip size="Small" tone={group.tone}>
                      {items.length}
                    </Chip>
                  </button>
                  {!isCollapsed && (
                    <>
                      <p className={styles['delivered-modal__section-def']}>
                        {group.definition}
                      </p>
                      <div className={styles['delivered-modal__rows']}>
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
