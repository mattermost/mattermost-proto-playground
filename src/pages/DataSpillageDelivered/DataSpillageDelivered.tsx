import { useState, type ReactNode } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import DownloadOutlineIcon from '@mattermost/compass-icons/components/download-outline';
import PlayOutlineIcon from '@mattermost/compass-icons/components/play-outline';
import WebhookIcon from '@mattermost/compass-icons/components/webhook';
import PowerPlugOutlineIcon from '@mattermost/compass-icons/components/power-plug-outline';

import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import RightSidebar, { RightSidebarHeader } from '@/components/ui/RightSidebar';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import Spinner from '@/components/ui/Spinner/Spinner';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import UserAvatarGroup from '@/components/ui/UserAvatarGroup/UserAvatarGroup';

import DeliveredModal from './DeliveredModal';
import { RemoveWizard, RemoveConfirm, RemoveDownloadFlow } from './RemoveFlow';
import {
  REPORT,
  USER_COUNT,
  INTEGRATION_COUNT,
  USER_FACES,
  INTEGRATION_ITEMS,
  type DeliveryIcon,
} from './fixtures';
import styles from './DataSpillageDelivered.module.scss';

const INTEGRATION_GLYPH: Partial<Record<DeliveryIcon, ReactNode>> = {
  webhook: <WebhookIcon />,
  integration: <PowerPlugOutlineIcon />,
};

type View = 'idle' | 'fetching' | 'ready' | 'removed';
type ActiveModal = null | 'recipients' | 'remove';

const SCENARIOS: { key: View; label: string }[] = [
  { key: 'idle', label: 'Idle' },
  { key: 'fetching', label: 'Fetching' },
  { key: 'ready', label: 'Ready' },
  { key: 'removed', label: 'Removed (disabled)' },
];

function PropRow({
  label,
  children,
  align = 'center',
}: {
  label: string;
  children: ReactNode;
  align?: 'center' | 'start';
}) {
  return (
    <div
      className={`${styles['dsd__prop']} ${
        align === 'start' ? styles['dsd__prop--start'] : ''
      }`}
    >
      <span className={styles['dsd__prop-label']}>{label}</span>
      <span className={styles['dsd__prop-value']}>{children}</span>
    </div>
  );
}

export interface DataSpillageDeliveredProps {
  /** Which message-removal flow this variant demonstrates. */
  removeFlow: 'wizard' | 'inline' | 'download';
  /** How the full recipient detail is surfaced: an in-app modal, or a CSV download. */
  listMode?: 'modal' | 'csv';
  /** Copy/layout revision. 'v4' = the latest design variation with vetted copy. */
  variant?: 'v3' | 'v4';
}

export default function DataSpillageDelivered({
  removeFlow,
  listMode = 'modal',
  variant = 'v3',
}: DataSpillageDeliveredProps) {
  const [view, setView] = useState<View>('idle');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const removed = view === 'removed';
  const csv = listMode === 'csv';
  const v4 = variant === 'v4';

  // v4 — styled to match the Figma "Seen By Container" states exactly.
  const deliveredRowV4 = (
    <div className={styles['dsd__v4']}>
      {view === 'idle' && (
        <>
          <button
            type="button"
            className={styles['dsd__v4-action']}
            onClick={() => setView('fetching')}
          >
            <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
            Generate recipient list
          </button>
          <span className={styles['dsd__v4-help']}>
            You can only generate the recipient list before removing the message.
          </span>
        </>
      )}

      {view === 'fetching' && (
        <>
          <span className={styles['dsd__v4-finding']}>
            <span className={styles['dsd__v4-spinner']}>
              <Spinner size={16} />
            </span>
            Finding exposed users…
          </span>
          <span className={styles['dsd__v4-help']}>
            This might take some time. We&apos;ll notify you when the list is ready.
          </span>
        </>
      )}

      {view === 'ready' && (
        <>
          <div className={styles['dsd__v4-head']}>
            <UserAvatarGroup avatars={USER_FACES} max={3} size="24" />
            {INTEGRATION_ITEMS.length > 0 && (
              <span
                className={styles['dsd__v4-badges']}
                aria-label={`${INTEGRATION_COUNT} plugins`}
              >
                {INTEGRATION_ITEMS.map((it) => (
                  <span
                    key={it.key}
                    className={styles['dsd__v4-badge']}
                    title={it.name}
                  >
                    <Icon
                      size="12"
                      glyph={INTEGRATION_GLYPH[it.icon] ?? <AlertOutlineIcon />}
                    />
                  </span>
                ))}
              </span>
            )}
          </div>
          <span className={styles['dsd__v4-summary']}>
            {USER_COUNT} users, {INTEGRATION_COUNT} plugins at {REPORT.asOf}
          </span>
          <button type="button" className={styles['dsd__v4-action']}>
            <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
            Download recipient list
          </button>
        </>
      )}

      {removed && (
        <>
          <span className={styles['dsd__v4-unavailable']}>
            <Icon size="16" glyph={<AlertCircleOutlineIcon />} />
            Recipient list not available
          </span>
          <span className={styles['dsd__v4-help']}>
            This message was permanently removed on {REPORT.removedAt}. This list can
            only be generated while the message exists.
          </span>
        </>
      )}
    </div>
  );

  const deliveredRowDefault = (
    <>
      {view === 'idle' && (
        <div className={styles['dsd__recip-idle']}>
          <Button
            emphasis="Secondary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<AccountMultipleOutlineIcon />} />}
            onClick={() => setView('fetching')}
          >
            {csv ? 'Generate recipient list' : 'Show recipients'}
          </Button>
          <span className={styles['dsd__recip-help']}>
            {csv
              ? "Generate the list before the message is removed — it can't be created afterward. You'll get it as a downloadable report."
              : 'See everyone the message reached — generate this before the message is removed.'}
          </span>
        </div>
      )}

      {view === 'fetching' && (
        <div className={styles['dsd__recip-loading']}>
          <span className={styles['dsd__recip-loading-head']}>
            <Spinner size={16} />
            Preparing the recipient list…
          </span>
          <span className={styles['dsd__recip-help']}>
            This can take up to 30 minutes. We&apos;ll notify you when it&apos;s ready
            — you can leave this open.
          </span>
        </div>
      )}

      {view === 'ready' && (
        <div className={styles['dsd__recip-ready']}>
          <div className={styles['dsd__recip-head']}>
            <UserAvatarGroup avatars={USER_FACES} max={3} size="24" />
            <div className={styles['dsd__recip-meta']}>
              <span className={styles['dsd__recip-count']}>
                {USER_COUNT} recipients
              </span>
              <span className={styles['dsd__recip-asof']}>As of {REPORT.asOf}</span>
            </div>
          </div>
          {csv && INTEGRATION_COUNT > 0 && (
            <Chip size="Small" tone="danger" leadingIcon={<AlertOutlineIcon />}>
              {INTEGRATION_COUNT} integrations
            </Chip>
          )}
          {csv ? (
            <Button
              emphasis="Secondary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<DownloadOutlineIcon />} />}
            >
              Download list (CSV)
            </Button>
          ) : (
            <Button
              emphasis="Secondary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<AccountMultipleOutlineIcon />} />}
              onClick={() => setActiveModal('recipients')}
            >
              Show all recipients
            </Button>
          )}
        </div>
      )}

      {removed && (
        <div className={styles['dsd__recip-disabled']}>
          <span className={styles['dsd__recip-disabled-icon']}>
            <Icon size="16" glyph={<AlertCircleOutlineIcon />} />
          </span>
          <span>
            Recipient list unavailable. This message was permanently removed on{' '}
            {REPORT.removedAt}. The list can only be generated while the message
            exists.
          </span>
        </div>
      )}
    </>
  );

  const deliveredRow = v4 ? deliveredRowV4 : deliveredRowDefault;

  const reportPanel = (
    <div className={styles['dsd__report']}>
      <div className={styles['dsd__report-msghead']}>
        <UserAvatar alt="Content Review" size="28" />
        <span className={styles['dsd__report-botname']}>Content Review</span>
        <span className={styles['dsd__report-bot']}>BOT</span>
        <span className={styles['dsd__report-time']}>10:43 AM</span>
      </div>
      <h3 className={styles['dsd__report-title']}>
        <span className={styles['dsd__mention']}>@{REPORT.reporter}</span> submitted a
        message for review
      </h3>

      <div className={styles['dsd__props']}>
        <PropRow label="Status">
          {removed ? (
            <Chip size="Small" tone="danger">
              Removed
            </Chip>
          ) : (
            <Chip size="Small" tone="info">
              Reviewer Assigned
            </Chip>
          )}
        </PropRow>
        <PropRow label="Reason">
          <Chip size="Small">{REPORT.reason}</Chip>
        </PropRow>
        <PropRow label="Message" align="start">
          <div className={styles['dsd__preview']}>
            <div className={styles['dsd__preview-head']}>
              <UserAvatar alt={REPORT.author} size="20" />
              <span className={styles['dsd__preview-name']}>{REPORT.author}</span>
              <span className={styles['dsd__preview-time']}>10:43 AM</span>
            </div>
            <p className={styles['dsd__preview-text']}>
              At eu sed tristique gravida et fames vel pellentesque. Urna phasellus
              integer eu tempor mauris amet sagittis. Mollis risus mi felis magna.…
            </p>
            <span className={styles['dsd__preview-origin']}>
              Originally posted in ~{REPORT.channel}
            </span>
          </div>
        </PropRow>
        <PropRow label="Reviewer">
          <span className={styles['dsd__person']}>
            <UserAvatar alt="Ronald Richards" size="20" />
            Ronald Richards
          </span>
        </PropRow>
        <PropRow label="Quarantined by">
          <span className={styles['dsd__person']}>
            <UserAvatar alt={REPORT.reporter} size="20" />
            {REPORT.reporter}
          </span>
        </PropRow>
        <PropRow label="Posted in">~{REPORT.channel}</PropRow>
        <PropRow label="Posted at">{REPORT.postedAt}</PropRow>
        <PropRow label="Duration visible">{REPORT.durationVisible}</PropRow>

        <div className={styles['dsd__divider']} />

        <PropRow label="Delivered to" align="start">
          {deliveredRow}
        </PropRow>

        <PropRow label="Report">
          <Button
            emphasis="Tertiary"
            size="Small"
            disabled={removed}
            leadingIcon={<Icon size="16" glyph={<DownloadOutlineIcon />} />}
          >
            Download report
          </Button>
        </PropRow>
        <PropRow label="Actions">
          {removed ? (
            <span className={styles['dsd__muted-val']}>
              Removed by Ronald Richards · {REPORT.asOf}
            </span>
          ) : (
            <span className={styles['dsd__actions']}>
              <Button
                emphasis="Secondary"
                size="Small"
                destructive
                onClick={() => setActiveModal('remove')}
              >
                Remove message
              </Button>
              <Button emphasis="Secondary" size="Small">
                Keep message
              </Button>
            </span>
          )}
        </PropRow>
        <PropRow label="Playbook">
          <Button
            emphasis="Quaternary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<PlayOutlineIcon />} />}
          >
            Run playbook
          </Button>
        </PropRow>
      </div>
    </div>
  );

  const centerColumn = (
    <div className={styles['dsd__center']}>
      <div className={styles['dsd__center-head']}>
        <UserAvatar alt="Content Review" size="24" />
        <span className={styles['dsd__report-botname']}>Content Review</span>
        <span className={styles['dsd__report-bot']}>BOT</span>
        <span className={styles['dsd__report-time']}>10:43 AM</span>
      </div>
      <div className={styles['dsd__center-card']}>
        <h3 className={styles['dsd__report-title']}>
          <span className={styles['dsd__mention']}>@{REPORT.reporter}</span> submitted
          a message for review
        </h3>
        <div className={styles['dsd__props']}>
          <PropRow label="Status">
            {removed ? (
              <Chip size="Small" tone="danger">
                Removed
              </Chip>
            ) : (
              <Chip size="Small" tone="info">
                Reviewer Assigned
              </Chip>
            )}
          </PropRow>
          <PropRow label="Reason">
            <Chip size="Small">{REPORT.reason}</Chip>
          </PropRow>
        </div>
        <Button emphasis="Secondary" size="Small">
          View details
        </Button>
      </div>
    </div>
  );

  let overlay: ReactNode = undefined;
  if (activeModal === 'recipients' && view === 'ready') {
    overlay = (
      <div className={styles['dsd__overlay']} role="presentation">
        <DeliveredModal onClose={() => setActiveModal(null)} />
      </div>
    );
  } else if (activeModal === 'remove') {
    const onComplete = () => {
      setView('removed');
      setActiveModal(null);
    };
    overlay = (
      <div className={styles['dsd__overlay']} role="presentation">
        {removeFlow === 'wizard' && (
          <RemoveWizard onClose={() => setActiveModal(null)} onComplete={onComplete} />
        )}
        {removeFlow === 'inline' && (
          <RemoveConfirm onClose={() => setActiveModal(null)} onComplete={onComplete} />
        )}
        {removeFlow === 'download' && (
          <RemoveDownloadFlow
            onClose={() => setActiveModal(null)}
            onComplete={onComplete}
            listGenerated={view === 'ready'}
          />
        )}
      </div>
    );
  }

  return (
    <div className={styles['dsd']}>
      <div className={styles['dsd__toolbar']} aria-label="Reviewer aid — not product UI">
        <span className={styles['dsd__toolbar-label']}>
          Reviewer aid — “Delivered to” state ({removeFlow} remove flow · not product
          UI)
        </span>
        <div className={styles['dsd__toolbar-chips']}>
          {SCENARIOS.map((s) => (
            <Chip
              key={s.key}
              as="button"
              size="Small"
              tone={view === s.key ? 'info' : 'neutral'}
              onClick={() => {
                setView(s.key);
                setActiveModal(null);
              }}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className={styles['dsd__shell']}>
        <ChannelShell
          activeTeamId="contributors"
          teamName="Contributors"
          channelHeader={
            <div className={styles['dsd__channel-header']}>
              <UserAvatar alt="Content Review" size="24" />
              <span className={styles['dsd__channel-name']}>Content Review</span>
              <span className={styles['dsd__report-bot']}>BOT</span>
            </div>
          }
          trailing={
            <RightSidebar
              header={
                <RightSidebarHeader
                  title="Thread"
                  secondaryTitle="Content Review"
                  actionLabel="Following"
                  actionActive
                  onExpand={() => {}}
                  onClose={() => {}}
                />
              }
            >
              {reportPanel}
            </RightSidebar>
          }
          overlay={overlay}
        >
          {centerColumn}
        </ChannelShell>
      </div>
    </div>
  );
}
