import { Icon } from '@mattermost/compass-ui/components/icon';
import { ProgressBar } from '@mattermost/compass-ui/components/progress-bar';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Tag } from '@mattermost/compass-ui/components/tag';
import LayersOutlineIcon from '@mattermost/compass-icons/components/layers-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import LockIcon from '@mattermost/compass-icons/components/lock';
import { ViewingAs } from '../components/ViewingAs';
import {
  FRESHNESS_LABEL,
  FRESHNESS_TAG,
  rollupNodes,
  type EnvironmentFixture,
  type RollupNode,
  type RollupView,
  type SpaceFixture,
} from '../environments';
import shared from '../Spaces.module.scss';
import styles from './SpaceDetail.module.scss';

export interface SpaceDetailProps {
  environment: EnvironmentFixture;
  space: SpaceFixture;
  rollup: RollupView;
  onRollupChange: (value: RollupView) => void;
  onOpenSpace: (spaceId: string) => void;
}

function Tree({ nodes }: { nodes: RollupNode[] }) {
  return (
    <ul className={styles['space-detail__tree']}>
      {nodes.map((node) => (
        <li key={node.id} className={styles['space-detail__node']}>
          <div className={styles['space-detail__node-row']}>
            {node.leaked ? (
              <Icon glyph={<LockIcon />} size="16" />
            ) : (
              <Icon glyph={<LayersOutlineIcon />} size="16" />
            )}
            <span className={styles['space-detail__kind']}>{node.kind}</span>
            <span className={shared['spaces__row-title']}>{node.name}</span>
            {node.state ? <Tag label={node.state} size="x-small" /> : null}
            {node.freshness ? (
              <Tag
                label={FRESHNESS_LABEL[node.freshness]}
                type={FRESHNESS_TAG[node.freshness]}
                size="x-small"
              />
            ) : null}
            {node.leaked ? (
              <Tag label="Existence only" type="danger" size="x-small" />
            ) : null}
          </div>
          {node.note ? (
            <p className={styles['space-detail__note']}>{node.note}</p>
          ) : null}
          {node.progress != null && !node.leaked ? (
            <ProgressBar
              value={node.progress}
              size="small"
              aria-label={`${node.name} progress`}
            />
          ) : null}
          {node.children && node.children.length > 0 ? (
            <Tree nodes={node.children} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function SpaceDetail({
  environment,
  space,
  rollup,
  onRollupChange,
  onOpenSpace,
}: SpaceDetailProps) {
  const leak = rollup === 'leak';
  const children = rollupNodes(space.children, leak);
  const standing = space.tenure === 'standing';

  return (
    <Scrollbar className={shared['spaces__scroll']}>
      <div className={shared['spaces__body']}>
        {environment.compareRollup ? (
          <ViewingAs value={rollup} onChange={onRollupChange} />
        ) : null}
        <header className={styles['space-detail__header']}>
          <span className={styles['space-detail__eyebrow']}>
            <Icon glyph={<LayersOutlineIcon />} size="16" />
            {space.vocabulary} · {standing ? 'Standing' : 'Temporary'}
          </span>
          <div className={styles['space-detail__title-row']}>
            <h1 className={styles['space-detail__title']}>{space.name}</h1>
            {standing && space.freshness ? (
              <Tag
                label={FRESHNESS_LABEL[space.freshness]}
                type={FRESHNESS_TAG[space.freshness]}
                size="small"
              />
            ) : null}
            {!standing && space.state ? (
              <Tag label={space.state} type="info" size="small" />
            ) : null}
          </div>
          <p className={styles['space-detail__summary']}>{space.summary}</p>
          {standing ? (
            <p className={styles['space-detail__summary']}>
              No timeframe and no close-out. Freshness rolls up instead of
              progress.
            </p>
          ) : (
            <p className={styles['space-detail__summary']}>
              {space.timeframe}. {space.closeOut}
            </p>
          )}
          {!standing && space.progress != null ? (
            <ProgressBar
              value={space.progress}
              size="small"
              aria-label={`${space.name} progress`}
            />
          ) : null}
        </header>

        {space.references && space.references.length > 0 ? (
          <section
            className={shared['spaces__panel']}
            aria-labelledby="references-title"
          >
            <div className={shared['spaces__panel-header']}>
              <h2
                id="references-title"
                className={shared['spaces__panel-title']}
              >
                References
              </h2>
              <span className={shared['spaces__panel-aside']}>
                Not contained here
              </span>
            </div>
            <ul className={shared['spaces__list']}>
              {space.references.map((ref) => (
                <li key={ref.spaceId}>
                  <button
                    type="button"
                    className={styles['space-detail__reference']}
                    onClick={() => onOpenSpace(ref.spaceId)}
                  >
                    <Icon glyph={<LinkVariantIcon />} size="16" />
                    <span className={shared['spaces__row-main']}>
                      <span className={shared['spaces__row-title']}>
                        {ref.name}
                        {ref.version ? ` · pinned ${ref.version}` : ''}
                      </span>
                      <span className={shared['spaces__row-meta']}>
                        {ref.version
                          ? 'Pinned version. The standing Space stays outside this one.'
                          : 'Referenced, not nested inside this Space.'}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          className={shared['spaces__panel']}
          aria-labelledby="children-title"
        >
          <div className={shared['spaces__panel-header']}>
            <h2 id="children-title" className={shared['spaces__panel-title']}>
              {standing ? 'Contents' : 'Rollup'}
            </h2>
          </div>
          <div className={styles['space-detail__body']}>
            {environment.compareRollup ? (
              <p className={styles['space-detail__note']}>
                {leak
                  ? 'Unsafe rollup: a hidden child is listed so you can tell it exists.'
                  : 'Safe rollup: hidden children are removed.'}
              </p>
            ) : null}
            {children.length === 0 ? (
              <p className={styles['space-detail__note']}>
                Nothing in this rollup.
              </p>
            ) : (
              <Tree nodes={children} />
            )}
          </div>
        </section>
      </div>
    </Scrollbar>
  );
}
