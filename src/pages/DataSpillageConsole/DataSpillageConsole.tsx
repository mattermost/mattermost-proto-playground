import { useState, type ReactNode } from 'react';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import ServerVariantIcon from '@mattermost/compass-icons/components/server-variant';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import PowerPlugOutlineIcon from '@mattermost/compass-icons/components/power-plug-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';

import ConsoleSidebar, {
  type ConsoleSidebarCategoryData,
} from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import ConsoleSetting from '@/components/ui/ConsoleSetting/ConsoleSetting';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import Radio from '@/components/ui/Radio/Radio';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';

import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarDavid from '@/assets/avatars/David Liang.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from './DataSpillageConsole.module.scss';

const CATEGORIES: ConsoleSidebarCategoryData[] = [
  {
    id: 'environment',
    label: 'Environment',
    icon: <ServerVariantIcon />,
    items: [
      { id: 'web-server', label: 'Web Server' },
      { id: 'database', label: 'Database' },
      { id: 'file-storage', label: 'File Storage' },
    ],
  },
  {
    id: 'site-configuration',
    label: 'Site Configuration',
    icon: <CogOutlineIcon />,
    items: [
      { id: 'customization', label: 'Customization' },
      { id: 'localization', label: 'Localization' },
      { id: 'users-and-teams', label: 'Users and Teams' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'posts', label: 'Posts' },
      { id: 'data-spillage-handling', label: 'Data Spillage Handling' },
      { id: 'file-sharing', label: 'File Sharing and Downloads' },
      { id: 'public-links', label: 'Public Links' },
    ],
  },
  {
    id: 'authentication',
    label: 'Authentication',
    icon: <ShieldOutlineIcon />,
    items: [
      { id: 'signup', label: 'Signup' },
      { id: 'email', label: 'Email' },
      { id: 'ldap', label: 'AD/LDAP' },
      { id: 'saml', label: 'SAML 2.0' },
    ],
  },
  {
    id: 'plugins',
    label: 'Plugins (Beta)',
    icon: <PowerPlugOutlineIcon />,
    items: [
      { id: 'plugin-management', label: 'Plugin Management' },
      { id: 'github', label: 'GitHub' },
      { id: 'jira', label: 'Jira' },
    ],
  },
];

const INITIAL_REVIEWERS = [
  { id: 'aiko', name: 'Aiko Tan', src: avatarAiko },
  { id: 'marco', name: 'Marco Rinaldi', src: avatarMarco },
  { id: 'emma', name: 'Emma Novak', src: avatarEmma },
  { id: 'david', name: 'David Liang', src: avatarDavid },
  { id: 'sofia', name: 'Sofia Bauer', src: avatarSofia },
];

const INITIAL_REASONS = [
  'Classification mismatch',
  'Need-to-know violation',
  'PII exposure',
  'OPSEC concern',
  'CUI violation',
];

interface ChannelRef {
  id: string;
  name: string;
  private: boolean;
}

const INITIAL_CHANNELS: ChannelRef[] = [
  { id: 'ux-design', name: 'UX Design', private: false },
  { id: 'ops-secure', name: 'Ops — Secure', private: true },
  { id: 'incident-response', name: 'Incident Response', private: true },
];

type TriState = boolean;

function RadioPair({
  name,
  value,
  onChange,
  trueLabel = 'True',
  falseLabel = 'False',
}: {
  name: string;
  value: TriState;
  onChange: (v: boolean) => void;
  trueLabel?: string;
  falseLabel?: string;
}) {
  return (
    <div className={styles['dsc__radio-row']}>
      <Radio name={name} checked={value} onChange={() => onChange(true)}>
        {trueLabel}
      </Radio>
      <Radio name={name} checked={!value} onChange={() => onChange(false)}>
        {falseLabel}
      </Radio>
    </div>
  );
}

export default function DataSpillageConsole() {
  const [active, setActive] = useState('data-spillage-handling');

  const [enabled, setEnabled] = useState(true);
  const [sameReviewers, setSameReviewers] = useState(true);
  const [reviewers, setReviewers] = useState(INITIAL_REVIEWERS);
  const [addlSysAdmin, setAddlSysAdmin] = useState(false);
  const [addlTeamAdmin, setAddlTeamAdmin] = useState(false);

  // Notification settings
  const [notifyQuarantined, setNotifyQuarantined] = useState({ reviewer: true, author: false });
  const [notifyAssigned, setNotifyAssigned] = useState({ reviewer: false });
  const [notifyRemoved, setNotifyRemoved] = useState({ reviewer: false, author: true, reporter: true });
  const [notifyDismissed, setNotifyDismissed] = useState({ reviewer: false, author: false, reporter: true });

  // NEW — Delivered to
  const [deliveredEnabled, setDeliveredEnabled] = useState(false);
  const [deliveredScope, setDeliveredScope] = useState<'all' | 'selected'>('all');
  const [channels, setChannels] = useState<ChannelRef[]>(INITIAL_CHANNELS);

  // Additional settings
  const [reasons, setReasons] = useState(INITIAL_REASONS);
  const [requireReporterComment, setRequireReporterComment] = useState(true);
  const [requireReviewerComment, setRequireReviewerComment] = useState(true);
  const [hideMessage, setHideMessage] = useState(true);

  const contentClass = [
    styles['dsc__content'],
    enabled ? '' : styles['dsc__content--disabled'],
  ]
    .filter(Boolean)
    .join(' ');

  const reviewersField = (
    <div className={styles['dsc__chip-row']}>
      {reviewers.map((r) => (
        <Chip
          key={r.id}
          leadingAvatar={{ src: r.src, alt: r.name }}
          onRemove={() => setReviewers((prev) => prev.filter((x) => x.id !== r.id))}
        >
          {r.name}
        </Chip>
      ))}
      <input
        className={styles['dsc__chip-input']}
        placeholder="Add reviewers…"
        aria-label="Add reviewers"
      />
    </div>
  );

  const channelsField = (
    <div className={styles['dsc__chip-row']}>
      {channels.map((c) => (
        <Chip
          key={c.id}
          leadingIcon={
            <Icon size="12" glyph={c.private ? <LockOutlineIcon /> : <GlobeIcon />} />
          }
          onRemove={() => setChannels((prev) => prev.filter((x) => x.id !== c.id))}
        >
          {c.name}
        </Chip>
      ))}
      <input
        className={styles['dsc__chip-input']}
        placeholder="Add channels…"
        aria-label="Add channels"
      />
    </div>
  );

  const checkRow = (children: ReactNode) => (
    <div className={styles['dsc__check-row']}>{children}</div>
  );

  return (
    <div className={styles['dsc']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={CATEGORIES}
        activeItemId={active}
        onItemClick={setActive}
      />

      <div className={styles['dsc__center']}>
        <ConsolePageHeader title="Data Spillage Handling" />

        <div className={styles['dsc__scroll']}>
          <div className={styles['dsc__page']}>
            <ConsoleSetting
              label="Enable Data Spillage Handling:"
              helpText="When true, users can quarantine messages for review. Quarantined messages are sent to designated Content Reviewers, who can assess the content and take action."
            >
              <RadioPair name="enable-dsh" value={enabled} onChange={setEnabled} />
            </ConsoleSetting>

            <div className={contentClass}>
              {/* ── Content Reviewers ─────────────────────────────── */}
              <ConsolePanel
                title="Content Reviewers"
                subtitle="Define who should review content that is quarantined for review in your environment"
              >
                <ConsoleSetting label="Same reviewers for all teams">
                  <RadioPair
                    name="same-reviewers"
                    value={sameReviewers}
                    onChange={setSameReviewers}
                  />
                </ConsoleSetting>
                <ConsoleSetting label="Reviewers">{reviewersField}</ConsoleSetting>
                <ConsoleSetting
                  label="Additional reviewers"
                  helpText="If enabled, system administrators will be sent quarantined posts for review from every team that they are a part of. Team administrators will only be sent quarantined posts for review from their respective teams."
                >
                  {checkRow(
                    <>
                      <Checkbox
                        checked={addlSysAdmin}
                        onChange={(e) => setAddlSysAdmin(e.target.checked)}
                      >
                        System Administrators
                      </Checkbox>
                      <Checkbox
                        checked={addlTeamAdmin}
                        onChange={(e) => setAddlTeamAdmin(e.target.checked)}
                      >
                        Team Administrators
                      </Checkbox>
                    </>,
                  )}
                </ConsoleSetting>
              </ConsolePanel>

              {/* ── Notification Settings ─────────────────────────── */}
              <ConsolePanel
                title="Notification Settings"
                subtitle="Choose who receives notifications from the Data Spillage bot when content is quarantined for review"
              >
                <ConsoleSetting label="Notify when content is quarantined:">
                  {checkRow(
                    <>
                      <Checkbox
                        checked={notifyQuarantined.reviewer}
                        onChange={(e) =>
                          setNotifyQuarantined((p) => ({ ...p, reviewer: e.target.checked }))
                        }
                      >
                        Reviewer(s)
                      </Checkbox>
                      <Checkbox
                        checked={notifyQuarantined.author}
                        onChange={(e) =>
                          setNotifyQuarantined((p) => ({ ...p, author: e.target.checked }))
                        }
                      >
                        Author
                      </Checkbox>
                    </>,
                  )}
                </ConsoleSetting>
                <ConsoleSetting label="Notify a reviewer is assigned:">
                  {checkRow(
                    <Checkbox
                      checked={notifyAssigned.reviewer}
                      onChange={(e) => setNotifyAssigned({ reviewer: e.target.checked })}
                    >
                      Reviewer(s)
                    </Checkbox>,
                  )}
                </ConsoleSetting>
                <ConsoleSetting label="Notify when content is removed:">
                  {checkRow(
                    <>
                      <Checkbox
                        checked={notifyRemoved.reviewer}
                        onChange={(e) =>
                          setNotifyRemoved((p) => ({ ...p, reviewer: e.target.checked }))
                        }
                      >
                        Reviewer(s)
                      </Checkbox>
                      <Checkbox
                        checked={notifyRemoved.author}
                        onChange={(e) =>
                          setNotifyRemoved((p) => ({ ...p, author: e.target.checked }))
                        }
                      >
                        Author
                      </Checkbox>
                      <Checkbox
                        checked={notifyRemoved.reporter}
                        onChange={(e) =>
                          setNotifyRemoved((p) => ({ ...p, reporter: e.target.checked }))
                        }
                      >
                        Reporter
                      </Checkbox>
                    </>,
                  )}
                </ConsoleSetting>
                <ConsoleSetting label="Notify when flag is dismissed:">
                  {checkRow(
                    <>
                      <Checkbox
                        checked={notifyDismissed.reviewer}
                        onChange={(e) =>
                          setNotifyDismissed((p) => ({ ...p, reviewer: e.target.checked }))
                        }
                      >
                        Reviewer(s)
                      </Checkbox>
                      <Checkbox
                        checked={notifyDismissed.author}
                        onChange={(e) =>
                          setNotifyDismissed((p) => ({ ...p, author: e.target.checked }))
                        }
                      >
                        Author
                      </Checkbox>
                      <Checkbox
                        checked={notifyDismissed.reporter}
                        onChange={(e) =>
                          setNotifyDismissed((p) => ({ ...p, reporter: e.target.checked }))
                        }
                      >
                        Reporter
                      </Checkbox>
                    </>,
                  )}
                </ConsoleSetting>
              </ConsolePanel>

              {/* ── NEW: Delivered to ─────────────────────────────── */}
              <ConsolePanel
                title="Delivered to"
                subtitle="Let Content Reviewers see who a quarantined message reached before it was removed, to support spillage cleanup. Tracking delivery adds storage and processing cost, so enable it only where it's needed."
              >
                <ConsoleSetting
                  label="Enable delivered-to list:"
                  helpText="When true, reviewers can generate the list of users a quarantined message reached. The list can only be generated while the message still exists."
                >
                  <RadioPair
                    name="delivered-enabled"
                    value={deliveredEnabled}
                    onChange={setDeliveredEnabled}
                  />
                </ConsoleSetting>

                {deliveredEnabled && (
                  <ConsoleSetting
                    label="Track delivery in:"
                    helpText="Tracking everywhere is the most complete but the most expensive. Limit it to the channels where spillage matters to keep storage and performance in check."
                  >
                    <RadioPair
                      name="delivered-scope"
                      value={deliveredScope === 'all'}
                      onChange={(v) => setDeliveredScope(v ? 'all' : 'selected')}
                      trueLabel="All channels"
                      falseLabel="Selected channels"
                    />
                  </ConsoleSetting>
                )}

                {deliveredEnabled && deliveredScope === 'selected' && (
                  <ConsoleSetting
                    label="Channels"
                    helpText="Delivery is tracked only in these channels. Tracking starts when you save and applies to messages quarantined from then on."
                  >
                    {channelsField}
                  </ConsoleSetting>
                )}
              </ConsolePanel>

              {/* ── Additional Settings ───────────────────────────── */}
              <ConsolePanel
                title="Additional Settings"
                subtitle="Configure options for the quarantine and review process"
              >
                <ConsoleSetting label="Reasons for flagging">
                  <div className={styles['dsc__chip-row']}>
                    {reasons.map((r) => (
                      <Chip
                        key={r}
                        onRemove={() => setReasons((prev) => prev.filter((x) => x !== r))}
                      >
                        {r}
                      </Chip>
                    ))}
                    <input
                      className={styles['dsc__chip-input']}
                      placeholder="Add reason…"
                      aria-label="Add reason"
                    />
                  </div>
                </ConsoleSetting>
                <ConsoleSetting label="Require reporters to add comment">
                  <RadioPair
                    name="require-reporter"
                    value={requireReporterComment}
                    onChange={setRequireReporterComment}
                  />
                </ConsoleSetting>
                <ConsoleSetting label="Require reviewers to add comment">
                  <RadioPair
                    name="require-reviewer"
                    value={requireReviewerComment}
                    onChange={setRequireReviewerComment}
                  />
                </ConsoleSetting>
                <ConsoleSetting label="Hide message from channel while under review">
                  <RadioPair
                    name="hide-message"
                    value={hideMessage}
                    onChange={setHideMessage}
                  />
                </ConsoleSetting>
              </ConsolePanel>
            </div>
          </div>
        </div>

        <ConsoleFooter saveDisabled={false} onSave={() => {}} onCancel={() => {}} />
      </div>
    </div>
  );
}
