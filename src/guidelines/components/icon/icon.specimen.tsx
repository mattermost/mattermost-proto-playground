import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import { Icon } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

const SIZE_DEMOS: { size: '16' | '20' | '24' | '28' | '32' | '40' | '52' | '64' }[] = [
  { size: '16' },
  { size: '20' },
  { size: '24' },
  { size: '28' },
  { size: '32' },
  { size: '40' },
  { size: '52' },
  { size: '64' },
];

export default function IconLibrary() {
  return (
    <>
      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>
          Compass Icons package
        </h3>
        <p className={styles['components__paragraph']}>
          Mattermost UI icons ship in <code>@mattermost/compass-icons</code>.
          The package provides tree-shakeable React SVG components and an icon
          font, sourced from <a href="https://pictogrammers.com/library/mdi/">Material Design Icons</a>{' '}
          plus custom icons drawn for Mattermost. The repository is at{' '}
          <a
            href="https://github.com/mattermost/compass-icons"
            target="_blank"
            rel="noreferrer"
          >
            github.com/mattermost/compass-icons
          </a>
          .
        </p>
        <p className={styles['components__paragraph']}>Import a glyph by name and pass it to the <code>Icon</code> wrapper:</p>
        <pre className={styles['components__code-block']}>
          <code>{`import GlobeIcon from '@mattermost/compass-icons/components/globe';
import { Icon } from '@mattermost/compass-ui';

<Icon glyph={<GlobeIcon />} size="24" />`}</code>
        </pre>
      </div>

      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>
          Container size vs. glyph size
        </h3>
        <p className={styles['components__paragraph']}>
          The <code>size</code> prop sets the <strong>container</strong>, not the
          SVG itself. <code>Icon</code> auto-injects the correct SVG render size
          (slightly larger than the container) so the glyph bleeds past
          compass-icons' built-in clear-space padding. This is what keeps mixed
          icons optically aligned at the same nominal size.
        </p>
      </div>

      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>Sizes</h3>
        <div className={styles['components__row']}>
          {SIZE_DEMOS.map(({ size }) => (
            <div key={size} className={styles['components__instance']}>
              <span className={styles['components__instance-label']}>
                {size}
              </span>
              <Icon glyph={<GlobeIcon />} size={size} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>Default glyph</h3>
        <div className={styles['components__row']}>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              No glyph prop
            </span>
            <Icon size="24" />
          </div>
          <div className={styles['components__instance']}>
            <span className={styles['components__instance-label']}>
              Explicit Emoticon
            </span>
            <Icon glyph={<EmoticonHappyOutlineIcon />} size="32" />
          </div>
        </div>
      </div>
    </>
  );
}
