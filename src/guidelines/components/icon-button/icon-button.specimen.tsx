import GlobeIcon from '@mattermost/compass-icons/components/globe';
import { ICON_BUTTON_ICON_SIZES } from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import styles from '@/styles/library-demo/components.module.scss';

export default function IconButtonLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Default</span>
          <IconButton
            aria-label="Icon button"
            icon={
              <Icon
                glyph={<GlobeIcon />}
                size={ICON_BUTTON_ICON_SIZES.Medium}
              />
            }
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <IconButton
            aria-label="X-Small"
            icon={<Icon glyph={<GlobeIcon />} size="12" />}
            size="X-Small"
          />
          <IconButton
            aria-label="Small"
            icon={<Icon glyph={<GlobeIcon />} size="16" />}
            size="Small"
          />
          <IconButton
            aria-label="Medium"
            icon={<Icon glyph={<GlobeIcon />} size="20" />}
            size="Medium"
          />
          <IconButton
            aria-label="Large"
            icon={<Icon glyph={<GlobeIcon />} size="24" />}
            size="Large"
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Compact, rounded, toggled
          </span>
          <IconButton
            aria-label="Compact"
            icon={<Icon glyph={<GlobeIcon />} size="16" />}
            padding="Compact"
            size="Small"
          />
          <IconButton
            aria-label="Rounded"
            icon={<Icon glyph={<GlobeIcon />} size="20" />}
            rounded
          />
          <IconButton
            aria-label="Toggled"
            icon={<Icon glyph={<GlobeIcon />} size="20" />}
            toggled
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Destructive & disabled
          </span>
          <IconButton
            aria-label="Destructive"
            destructive
            icon={<Icon glyph={<GlobeIcon />} size="20" />}
          />
          <IconButton
            aria-label="Disabled"
            disabled
            icon={<Icon glyph={<GlobeIcon />} size="20" />}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Count</span>
          <IconButton
            aria-label="12 notifications, X-Small"
            count={12}
            icon={<Icon glyph={<GlobeIcon />} size="12" />}
            size="X-Small"
          />
          <IconButton
            aria-label="48 notifications, Small"
            count={48}
            icon={<Icon glyph={<GlobeIcon />} size="16" />}
            size="Small"
          />
          <IconButton
            aria-label="425 notifications, Medium"
            count={425}
            icon={<Icon glyph={<GlobeIcon />} size="20" />}
          />
          <IconButton
            aria-label="9 notifications, Large"
            count={9}
            icon={<Icon glyph={<GlobeIcon />} size="24" />}
            size="Large"
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Unread badge
          </span>
          <IconButton
            aria-label="Unread, X-Small"
            icon={<Icon glyph={<GlobeIcon />} size="12" />}
            size="X-Small"
            unreadBadge
          />
          <IconButton
            aria-label="Unread, Small"
            icon={<Icon glyph={<GlobeIcon />} size="16" />}
            size="Small"
            unreadBadge
          />
          <IconButton
            aria-label="Unread, Medium"
            icon={<Icon glyph={<GlobeIcon />} size="20" />}
            unreadBadge
          />
          <IconButton
            aria-label="Unread, Large"
            icon={<Icon glyph={<GlobeIcon />} size="24" />}
            size="Large"
            unreadBadge
          />
          <IconButton
            aria-label="Unread, toggled"
            icon={<Icon glyph={<GlobeIcon />} size="20" />}
            toggled
            unreadBadge
          />
          <IconButton
            aria-label="Unread with count"
            count={3}
            icon={<Icon glyph={<GlobeIcon />} size="20" />}
            unreadBadge
          />
        </div>
        <div
          className={[
            styles['components__button-row'],
            styles['components__button-row--inverted-bg'],
          ].join(' ')}
        >
          <span className={styles['components__instance-label']}>
            Style = Inverted
          </span>
          <IconButton
            aria-label="Inverted icon button"
            icon={<Icon glyph={<GlobeIcon />} size="20" />}
            style="Inverted"
          />
          <IconButton
            aria-label="Inverted with count"
            count={7}
            icon={<Icon glyph={<GlobeIcon />} size="20" />}
            style="Inverted"
          />
          <IconButton
            aria-label="Inverted with unread badge"
            icon={<Icon glyph={<GlobeIcon />} size="20" />}
            style="Inverted"
            unreadBadge
          />
        </div>
      </div>
    </>
  );
}
