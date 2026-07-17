import GlobeIcon from '@mattermost/compass-icons/components/globe';
import {
  ICON_BUTTON_ICON_SIZES,
  type IconButtonPadding,
  type IconButtonSize,
  type IconButtonStyle,
  IconButton} from '@mattermost/compass-ui';
import { Icon } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

const SIZES: IconButtonSize[] = ['X-Small', 'Small', 'Medium', 'Large'];

const MATRIX_ROWS: {
  label: string;
  padding: IconButtonPadding;
  rounded: boolean;
}[] = [
  { label: 'Default', padding: 'Default', rounded: false },
  { label: 'Compact', padding: 'Compact', rounded: false },
  { label: 'Rounded', padding: 'Default', rounded: true },
];

function IconButtonPermutationGrid({
  surfaceStyle,
  destructive,
  disabled,
}: {
  surfaceStyle: IconButtonStyle;
  destructive: boolean;
  disabled: boolean;
}) {
  const cellClass = [
    styles['components__button-variant-matrix__cell'],
    styles['components__button-variant-matrix__cell--icon'],
  ].join(' ');

  return (
    <div className={styles['components__button-variant-matrix']}>
      <div className={styles['components__button-variant-matrix__head']}>
        <span
          className={styles['components__button-variant-matrix__corner']}
          aria-hidden
        />
        {SIZES.map((size) => (
          <span
            key={size}
            className={styles['components__button-variant-matrix__size-heading']}
          >
            {size}
          </span>
        ))}
      </div>
      {MATRIX_ROWS.map((row) => (
        <div
          key={row.label}
          className={styles['components__button-variant-matrix__row']}
        >
          <span
            className={
              styles['components__button-variant-matrix__emphasis-label']
            }
          >
            {row.label}
          </span>
          {SIZES.map((size) => (
            <div key={size} className={cellClass}>
              <IconButton
                aria-label={`${row.label}, ${size}`}
                style={surfaceStyle}
                destructive={destructive}
                disabled={disabled}
                size={size}
                padding={row.padding}
                rounded={row.rounded}
                icon={
                  <Icon
                    glyph={<GlobeIcon />}
                    size={ICON_BUTTON_ICON_SIZES[size]}
                  />
                }
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function IconButtonLibrary() {
  return (
    <div className={styles['components__button-block']}>
      <p className={styles['components__paragraph']}>
        Prop matrix for visual testing: each row is padding or shape mode
        (Default, Compact, Rounded), columns are sizes (12 icon buttons per
        section). Toggled, count, and unread badge are shown separately below.
      </p>

      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>
          Default
        </h3>
        <IconButtonPermutationGrid
          surfaceStyle="Default"
          destructive={false}
          disabled={false}
        />
      </div>

      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>
          Destructive
        </h3>
        <IconButtonPermutationGrid
          surfaceStyle="Default"
          destructive
          disabled={false}
        />
      </div>

      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>
          Disabled
        </h3>
        <IconButtonPermutationGrid
          surfaceStyle="Default"
          destructive={false}
          disabled
        />
      </div>

      <div className={styles['components__button-surface--inverted']}>
        <div className={styles['components__section']}>
          <h3 className={styles['components__section-title']}>
            Inverted
          </h3>
          <IconButtonPermutationGrid
            surfaceStyle="Inverted"
            destructive={false}
            disabled={false}
          />
        </div>

        <div className={styles['components__section']}>
          <h3 className={styles['components__section-title']}>
            Inverted Destructive
          </h3>
          <IconButtonPermutationGrid
            surfaceStyle="Inverted"
            destructive
            disabled={false}
          />
        </div>

        <div className={styles['components__section']}>
          <h3 className={styles['components__section-title']}>
            Inverted Disabled
          </h3>
          <IconButtonPermutationGrid
            surfaceStyle="Inverted"
            destructive={false}
            disabled
          />
        </div>
      </div>

      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>Count</h3>
        <div className={styles['components__button-row']}>
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
      </div>

      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>Unread badge</h3>
        <div className={styles['components__button-row']}>
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
      </div>

      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>
          Inverted — count & badge
        </h3>
        <div
          className={[
            styles['components__button-row'],
            styles['components__button-row--inverted-bg'],
          ].join(' ')}
        >
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
    </div>
  );
}
