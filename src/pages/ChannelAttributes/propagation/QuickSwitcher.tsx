import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import Icon from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import ChannelRowPill from '../shared/ChannelRowPill';
import type { MarkingStyle } from '../shared/SceneHarness';
import { CHANNEL_LIST, type ChannelListItem } from '../shared/channelListData';
import styles from './switcher.module.scss';

// Map DM rows to fixture faces (real avatars per playground convention).
const DM_AVATARS: Record<string, string> = {
  'dm-leonard-riley': avatarLeonard,
  'dm-danielle-okoro': avatarDanielle,
};

function byId(id: string): ChannelListItem {
  const found = CHANNEL_LIST.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown channel id: ${id}`);
  return found;
}

// Reference groups: UNREAD (has unread badge) then RECENT.
const UNREAD_IDS = ['feature-proposals', 'dm-leonard-riley', 'dm-finney-mcgrath', 'bugs'];
const RECENT_IDS = [
  'ask-r-and-d',
  'operation-aurora',
  'orion-launch-ops',
  'quick-wins-design-sprint',
];

// One row is highlighted (keyboard/hover selection), matching the reference.
const HIGHLIGHTED_ID = 'bugs';

function RowLead({ item }: { item: ChannelListItem }) {
  if (item.kind === 'dm') {
    const src = DM_AVATARS[item.id];
    if (item.id === 'dm-finney-mcgrath') {
      // Group DM in the reference shows a small "2" count tile, not a face.
      return (
        <span className={styles['switcher__lead-count']} aria-hidden>
          2
        </span>
      );
    }
    return (
      <span className={styles['switcher__lead-avatar']}>
        <UserAvatar alt={item.name} name={item.name} src={src} size="20" />
      </span>
    );
  }
  const glyph = item.kind === 'private' ? <LockOutlineIcon /> : <GlobeIcon />;
  return (
    <span className={styles['switcher__lead-icon']}>
      <Icon size="16" glyph={glyph} />
    </span>
  );
}

function SwitcherRow({ item, variant }: { item: ChannelListItem; variant: MarkingStyle }) {
  const highlighted = item.id === HIGHLIGHTED_ID;
  return (
    <div
      className={[styles['switcher__row'], highlighted ? styles['switcher__row--active'] : '']
        .filter(Boolean)
        .join(' ')}
    >
      <RowLead item={item} />
      <span className={styles['switcher__name']}>{item.name}</span>
      {/* Classification pill: after name, before handle. No-trace masking → DMs,
          masked, and unmarked channels render nothing here. */}
      <ChannelRowPill item={item} variant={variant} />
      <span className={styles['switcher__handle']}>{item.handle}</span>
      {item.unread ? (
        <span className={styles['switcher__badge']} aria-label={`${item.unread} unread`}>
          {item.unread}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Surface #1 — the "Find channels" quick channel switcher. Recreated faithfully
 * to the standard Mattermost modal (title + subtitle, search box, UNREAD/RECENT
 * groups, icon + name + ~handle + optional unread badge, one highlighted row),
 * with the propagation-surface addition: the compact classification pill after
 * each channel name that carries a value.
 */
export default function QuickSwitcher({ variant = 'abbrev' }: { variant?: MarkingStyle }) {
  return (
    <div className={styles.switcher} role="dialog" aria-label="Find channels">
      <div className={styles['switcher__header']}>
        <h2 className={styles['switcher__title']}>Find channels</h2>
        <button type="button" className={styles['switcher__close']} aria-label="Close">
          <Icon size="20" glyph={<CloseIcon />} />
        </button>
      </div>
      <p className={styles['switcher__subtitle']}>
        Type to find a channel. Use UP/DOWN to browse, ENTER to select, ESC to dismiss.
      </p>

      <div className={styles['switcher__search']}>
        <span className={styles['switcher__search-icon']} aria-hidden>
          <Icon size="20" glyph={<MagnifyIcon />} />
        </span>
        <input
          className={styles['switcher__search-input']}
          type="text"
          placeholder="Search for channels or direct messages"
          aria-label="Search for channels or direct messages"
        />
      </div>

      <div className={styles['switcher__results']}>
        <div className={styles['switcher__group-label']}>Unread</div>
        {UNREAD_IDS.map((id) => (
          <SwitcherRow key={id} item={byId(id)} variant={variant} />
        ))}

        <div className={styles['switcher__group-label']}>Recent</div>
        {RECENT_IDS.map((id) => (
          <SwitcherRow key={id} item={byId(id)} variant={variant} />
        ))}
      </div>
    </div>
  );
}
