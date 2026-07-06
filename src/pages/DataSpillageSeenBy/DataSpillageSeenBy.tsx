import { useState, type ReactNode } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import DownloadOutlineIcon from '@mattermost/compass-icons/components/download-outline';
import PlayOutlineIcon from '@mattermost/compass-icons/components/play-outline';

import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import RightSidebar, {
  RightSidebarHeader,
} from '@/components/ui/RightSidebar';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import Spinner from '@/components/ui/Spinner/Spinner';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import UserAvatarGroup from '@/components/ui/UserAvatarGroup/UserAvatarGroup';

import SeenByModal from './SeenByModal';
import { REPORT, ROSTER, USER_EXPOSED } from './fixtures';
import styles from './DataSpillageSeenBy.module.scss';

type SeenByState = 'idle' | 'loading' | 'ready';

// Faces for the collapsed "Seen by" preview — people only (lateral leak is destinations).
const SEENBY_FACES = ROSTER.filter((r) => !r.system).map((r) => ({
  key: r.key,
  src: r.src,
  name: r.name,
}));

const SCENARIOS: { key: SeenByState; label: string }[] = [
  { key: 'idle', label: 'Idle (Show users)' },
  { key: 'loading', label: 'Fetching (async)' },
  { key: 'ready', label: 'Ready (roster)' },
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
      className={`${styles['dssb__prop']} ${
        align === 'start' ? styles['dssb__prop--start'] : ''
      }`}
    >
      <span className={styles['dssb__prop-label']}>{label}</span>
      <span className={styles['dssb__prop-value']}>{children}</span>
    </div>
  );
}

export default function DataSpillageSeenBy() {
  const [seenBy, setSeenBy] = useState<SeenByState>('idle');
  const [modalOpen, setModalOpen] = useState(false);

  const seenByRow = (
    <>
      {seenBy === 'idle' && (
        <div className={styles['dssb__seenby-idle']}>
          <Button
            emphasis="Secondary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<AccountMultipleOutlineIcon />} />}
            onClick={() => setSeenBy('loading')}
          >
            Show users
          </Button>
          <span className={styles['dssb__seenby-help']}>
            Find who was exposed before this message was quarantined.
          </span>
        </div>
      )}

      {seenBy === 'loading' && (
        <div className={styles['dssb__seenby-loading']}>
          <span className={styles['dssb__seenby-loading-head']}>
            <Spinner size={16} />
            Finding exposed users…
          </span>
          <span className={styles['dssb__seenby-help']}>
            This can take up to 30 minutes. We&apos;ll notify you when it&apos;s
            ready — you can leave this open.
          </span>
        </div>
      )}

      {seenBy === 'ready' && (
        <div className={styles['dssb__seenby-ready']}>
          <div className={styles['dssb__seenby-summary']}>
            <UserAvatarGroup avatars={SEENBY_FACES} max={3} size="24" />
            <span className={styles['dssb__seenby-count']}>
              {USER_EXPOSED} users as of {REPORT.asOf}
            </span>
          </div>
          <Button
            emphasis="Secondary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<AccountMultipleOutlineIcon />} />}
            onClick={() => setModalOpen(true)}
          >
            Show all users
          </Button>
        </div>
      )}
    </>
  );

  const reportPanel = (
    <div className={styles['dssb__report']}>
      <div className={styles['dssb__report-msghead']}>
        <UserAvatar alt="Content Review" size="28" />
        <span className={styles['dssb__report-botname']}>Content Review</span>
        <span className={styles['dssb__report-bot']}>BOT</span>
        <span className={styles['dssb__report-time']}>10:43 AM</span>
      </div>
      <h3 className={styles['dssb__report-title']}>
        <span className={styles['dssb__mention']}>@{REPORT.reporter}</span>{' '}
        submitted a message for review
      </h3>

      <div className={styles['dssb__props']}>
        <PropRow label="Status">
          <Chip size="Small" tone="info">
            Reviewer Assigned
          </Chip>
        </PropRow>
        <PropRow label="Reason">
          <Chip size="Small">{REPORT.reason}</Chip>
        </PropRow>
        <PropRow label="Message" align="start">
          <div className={styles['dssb__preview']}>
            <div className={styles['dssb__preview-head']}>
              <UserAvatar alt={REPORT.author} size="20" />
              <span className={styles['dssb__preview-name']}>{REPORT.author}</span>
              <span className={styles['dssb__preview-time']}>10:43 AM</span>
            </div>
            <p className={styles['dssb__preview-text']}>
              At eu sed tristique gravida et fames vel pellentesque. Urna phasellus
              integer eu tempor mauris amet sagittis. Mollis risus mi felis magna.…
            </p>
            <span className={styles['dssb__preview-origin']}>
              Originally posted in ~{REPORT.channel}
            </span>
          </div>
        </PropRow>
        <PropRow label="Reviewer">
          <span className={styles['dssb__person']}>
            <UserAvatar alt="Ronald Richards" size="20" />
            Ronald Richards
          </span>
        </PropRow>
        <PropRow label="Quarantined by">
          <span className={styles['dssb__person']}>
            <UserAvatar alt={REPORT.reporter} size="20" />
            {REPORT.reporter}
          </span>
        </PropRow>
        <PropRow label="Comment" align="start">
          <span className={styles['dssb__muted-val']}>{REPORT.comment}</span>
        </PropRow>
        <PropRow label="Posted in">~{REPORT.channel}</PropRow>
        <PropRow label="Posted by">{REPORT.author}</PropRow>
        <PropRow label="Posted at">{REPORT.postedAt}</PropRow>
        <PropRow label="Duration visible">{REPORT.durationVisible}</PropRow>

        <div className={styles['dssb__divider']} />

        <PropRow label="Seen by" align="start">
          {seenByRow}
        </PropRow>

        <PropRow label="Report">
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<DownloadOutlineIcon />} />}
          >
            Download report
          </Button>
        </PropRow>
        <PropRow label="Actions">
          <span className={styles['dssb__actions']}>
            <Button emphasis="Secondary" size="Small" destructive>
              Remove message
            </Button>
            <Button emphasis="Secondary" size="Small">
              Keep message
            </Button>
          </span>
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
    <div className={styles['dssb__center']}>
      <div className={styles['dssb__center-head']}>
        <UserAvatar alt="Content Review" size="24" />
        <span className={styles['dssb__report-botname']}>Content Review</span>
        <span className={styles['dssb__report-bot']}>BOT</span>
        <span className={styles['dssb__report-time']}>10:43 AM</span>
      </div>
      <div className={styles['dssb__center-card']}>
        <h3 className={styles['dssb__report-title']}>
          <span className={styles['dssb__mention']}>@{REPORT.reporter}</span>{' '}
          submitted a message for review
        </h3>
        <div className={styles['dssb__props']}>
          <PropRow label="Status">
            <Chip size="Small" tone="info">
              Reviewer Assigned
            </Chip>
          </PropRow>
          <PropRow label="Reason">
            <Chip size="Small">{REPORT.reason}</Chip>
          </PropRow>
          <PropRow label="Reviewer">
            <span className={styles['dssb__person']}>
              <UserAvatar alt="Ronald Richards" size="20" />
              Ronald Richards
            </span>
          </PropRow>
        </div>
        <Button emphasis="Secondary" size="Small">
          View details
        </Button>
      </div>
    </div>
  );

  return (
    <div className={styles['dssb']}>
      <div className={styles['dssb__toolbar']} aria-label="Reviewer aid — not product UI">
        <span className={styles['dssb__toolbar-label']}>
          Reviewer aid — “Seen by” state (not product UI)
        </span>
        <div className={styles['dssb__toolbar-chips']}>
          {SCENARIOS.map((s) => (
            <Chip
              key={s.key}
              as="button"
              size="Small"
              tone={seenBy === s.key ? 'info' : 'neutral'}
              onClick={() => {
                setSeenBy(s.key);
                if (s.key !== 'ready') setModalOpen(false);
              }}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className={styles['dssb__shell']}>
        <ChannelShell
          activeTeamId="contributors"
          teamName="Contributors"
          channelHeader={
            <div className={styles['dssb__channel-header']}>
              <UserAvatar alt="Content Review" size="24" />
              <span className={styles['dssb__channel-name']}>Content Review</span>
              <span className={styles['dssb__report-bot']}>BOT</span>
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
          overlay={
            modalOpen && seenBy === 'ready' ? (
              <div className={styles['dssb__overlay']} role="presentation">
                <SeenByModal onClose={() => setModalOpen(false)} />
              </div>
            ) : undefined
          }
        >
          {centerColumn}
        </ChannelShell>
      </div>
    </div>
  );
}
