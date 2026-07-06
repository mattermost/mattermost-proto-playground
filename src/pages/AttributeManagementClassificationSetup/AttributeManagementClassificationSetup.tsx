import { useMemo, useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ArrowDownIcon from '@mattermost/compass-icons/components/arrow-down';
import AppShellAM from '../AttributeManagementV2/_components/AppShellAM/AppShellAM';
import PageHeader from '../AttributeManagementV2/_components/PageHeader/PageHeader';
import DetailShell from '../AttributeManagementV2/_components/DetailShell/DetailShell';
import Section from '../AttributeManagementV2/_components/Section/Section';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import {
  CATALOG,
  treeCounts,
  type CatalogAttr,
  type ClassificationNode,
} from './csData';
import styles from './AttributeManagementClassificationSetup.module.scss';

/**
 * Attribute Management — Classification setup (Variation E).
 *
 * Copy of the Variation D catalog + per-resource detail pattern, remodeled to
 * express Classification as ONE ranked-hierarchical attribute (ranked tiers as
 * the spine compared to Clearance; nested display-only markings) and
 * Releasability as a SEPARATE Select attribute compared to Nationality.
 */
export default function AttributeManagementClassificationSetup() {
  const initialParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const [selectedId, setSelectedId] = useState<string | null>(
    initialParams.get('attr'),
  );

  const selected = selectedId
    ? CATALOG.find((a) => a.id === selectedId) ?? null
    : null;

  return (
    <AppShellAM>
      <div className={styles['page']}>
        {selected ? (
          <ClassificationDetail
            attr={selected}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <>
            <PageHeader
              title="Attribute Management"
              description="Define an attribute once, then apply it across channels, posts, and teams. Classification is ranked and hierarchical; releasability and clearance are separate attributes."
              primaryActionLabel="New attribute"
              onPrimaryAction={() => undefined}
            />
            <CatalogTable
              attributes={CATALOG}
              onOpenDetail={setSelectedId}
            />
          </>
        )}
      </div>
    </AppShellAM>
  );
}

// ─── Catalog table ────────────────────────────────────────────────────────────

function CatalogTable({
  attributes,
  onOpenDetail,
}: {
  attributes: CatalogAttr[];
  onOpenDetail: (id: string) => void;
}) {
  return (
    <div className={styles['catalog']}>
      <div className={styles['catalog__panel']}>
        <div className={styles['catalog__panel-head']}>
          <h2 className={styles['catalog__panel-title']}>Configure attributes</h2>
          <p className={styles['catalog__panel-subtitle']}>
            Define an attribute once and apply it across channels, posts, and
            teams.
          </p>
        </div>
        <div className={styles['catalog__table-wrap']}>
          <table className={styles['catalog__grid']}>
            <thead>
              <tr>
                <th>Property</th>
                <th className={styles['catalog__col-applies']}>Applies to</th>
                <th className={styles['catalog__col-type']}>Type</th>
                <th>Values</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr) => (
                <tr
                  key={attr.id}
                  className={styles['catalog__row']}
                  onClick={() => onOpenDetail(attr.id)}
                >
                  <td>
                    <div className={styles['catalog__property-row']}>
                      <span className={styles['catalog__property']}>
                        {attr.name}
                      </span>
                      {attr.externallyOwned && (
                        <span
                          className={styles['catalog__source-lock']}
                          title={`Values are managed by ${attr.externalSystem} and read-only here.`}
                        >
                          <Icon size="12" glyph={<LockOutlineIcon />} />
                        </span>
                      )}
                      {attr.linkedScaleTo && (
                        <span
                          className={styles['catalog__linked']}
                          title={`Tier scale linked to ${attr.linkedScaleTo}`}
                        >
                          <Icon size="12" glyph={<LinkVariantIcon />} />
                          Linked to {attr.linkedScaleTo}
                        </span>
                      )}
                    </div>
                    <p className={styles['catalog__compared']}>
                      {attr.comparedAgainst}
                    </p>
                  </td>
                  <td>
                    <div className={styles['catalog__applies']}>
                      {attr.appliesTo.map((r) => (
                        <span
                          key={r}
                          className={styles['catalog__applies-chip']}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={styles['catalog__type']}>{attr.type}</span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <ValuesCell attr={attr} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ValuesCell({ attr }: { attr: CatalogAttr }) {
  if (attr.externallyOwned && attr.externalSystem) {
    return (
      <span className={styles['catalog__provenance']}>
        <Icon size="12" glyph={<SyncIcon />} />
        Managed by {attr.externalSystem}
      </span>
    );
  }
  if (attr.tree) {
    const { tiers, markings } = treeCounts(attr.tree);
    return (
      <div className={styles['catalog__values']}>
        <div className={styles['catalog__chips']}>
          {topTiers(attr.tree).map((n) => (
            <RankedValueChip
              key={n.id}
              label={n.label}
              rank={(n.rank ?? 0) + 1}
            />
          ))}
        </div>
        <p className={styles['catalog__values-note']}>
          {tiers} ranked tiers · {markings} display-only markings
        </p>
      </div>
    );
  }
  if (attr.values) {
    return (
      <div className={styles['catalog__chips']}>
        {attr.values.map((v) =>
          v.rank != null ? (
            <RankedValueChip key={v.id} label={v.label} rank={v.rank + 1} />
          ) : (
            <Chip key={v.id} size="Small" tone="neutral">
              {v.label}
            </Chip>
          ),
        )}
      </div>
    );
  }
  return <span className={styles['catalog__values-empty']}>—</span>;
}

function topTiers(tree: ClassificationNode[]): ClassificationNode[] {
  return tree.filter((n) => n.rank != null);
}

// ─── Detail — Classification hierarchy tree ─────────────────────────────────────

function ClassificationDetail({
  attr,
  onBack,
}: {
  attr: CatalogAttr;
  onBack: () => void;
}) {
  const meta = useMemo(
    () => (
      <>
        <span>{attr.type}</span>
        <span aria-hidden>·</span>
        <span>Applies to {attr.appliesTo.join(' · ')}</span>
        {attr.inUseByPolicies > 0 && (
          <>
            <span aria-hidden>·</span>
            <span>
              In use by {attr.inUseByPolicies}{' '}
              {attr.inUseByPolicies === 1 ? 'policy' : 'policies'}
            </span>
          </>
        )}
      </>
    ),
    [attr],
  );

  return (
    <DetailShell title={attr.name} meta={meta} onBack={onBack}>
      {attr.tree ? (
        <>
          <Section
            title="Value hierarchy"
            description="Ranked tiers form the spine that is compared against a user’s Clearance. Markings nested under a tier are display-only — they travel with the tier but never change the comparison."
          >
            {attr.linkedScaleTo && (
              <div className={styles['detail__linked-banner']}>
                <span
                  className={styles['detail__linked-icon']}
                  aria-hidden
                >
                  <LinkVariantIcon size={16} />
                </span>
                <span>
                  Tier scale linked to <strong>{attr.linkedScaleTo}</strong>.
                  Ranks stay in sync — a user’s {attr.linkedScaleTo} must be at
                  or above a resource’s Classification tier.
                </span>
              </div>
            )}
            <div className={styles['detail__legend']}>
              <span className={styles['detail__legend-item']}>
                <LabelTag label="1" type="Default" size="X-Small" />
                Ranked tier — compared to Clearance
              </span>
              <span className={styles['detail__legend-item']}>
                <span className={styles['detail__display-tag']}>
                  Display only
                </span>
                Marking — travels with the tier, not compared
              </span>
            </div>
            <ClassificationTree nodes={attr.tree} />
          </Section>

          <Section
            title="Tier comparison"
            description="How the ranked spine evaluates against Clearance."
          >
            <div className={styles['detail__comparison']}>
              <span className={styles['detail__comparison-side']}>
                <span className={styles['detail__comparison-label']}>
                  Resource · Classification tier
                </span>
                <RankedValueChip label="Protected B" rank={3} />
              </span>
              <span className={styles['detail__comparison-op']} aria-hidden>
                <Icon size="16" glyph={<ArrowDownIcon />} />
              </span>
              <span className={styles['detail__comparison-side']}>
                <span className={styles['detail__comparison-label']}>
                  User · Clearance must be at least
                </span>
                <RankedValueChip label="Protected B" rank={3} />
              </span>
            </div>
            <p className={styles['detail__comparison-note']}>
              Nested markings (Official use only, TLP-CLEAR … TLP-RED) are shown
              on the resource but do not enter this comparison.
            </p>
          </Section>
        </>
      ) : (
        <Section
          title="Values"
          description={attr.comparedAgainst}
        >
          {attr.externallyOwned && attr.externalSystem && (
            <div className={styles['detail__source-banner']}>
              <span className={styles['detail__source-icon']} aria-hidden>
                <SyncIcon size={16} />
              </span>
              <span>
                Values are managed by {attr.externalSystem} and read-only here.
              </span>
            </div>
          )}
          <div className={styles['detail__values']}>
            {(attr.values ?? []).map((v) =>
              v.rank != null ? (
                <RankedValueChip
                  key={v.id}
                  label={v.label}
                  rank={v.rank + 1}
                />
              ) : (
                <Chip key={v.id} size="Small" tone="neutral">
                  {v.label}
                </Chip>
              ),
            )}
          </div>
          {attr.id === 'releasability' && (
            <p className={styles['detail__separate-note']}>
              Releasability is a separate attribute because it is enforced
              against a user’s Nationality, not Clearance. It is compared
              independently of the Classification tier.
            </p>
          )}
        </Section>
      )}
    </DetailShell>
  );
}

function ClassificationTree({ nodes }: { nodes: ClassificationNode[] }) {
  return (
    <ul className={styles['tree']}>
      {nodes.map((n) => (
        <TreeRow key={n.id} node={n} depth={0} />
      ))}
    </ul>
  );
}

function TreeRow({ node, depth }: { node: ClassificationNode; depth: number }) {
  const [open, setOpen] = useState(true);
  const hasChildren = !!node.children && node.children.length > 0;
  const isTier = node.rank != null;

  return (
    <li className={styles['tree__item']}>
      <div
        className={styles['tree__row']}
        style={{ paddingLeft: `${depth * 24}px` }}
      >
        <span className={styles['tree__toggle']}>
          {hasChildren ? (
            <button
              type="button"
              className={styles['tree__toggle-btn']}
              aria-label={open ? 'Collapse' : 'Expand'}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <Icon
                size="16"
                glyph={open ? <ChevronDownIcon /> : <ChevronRightIcon />}
              />
            </button>
          ) : (
            <span className={styles['tree__toggle-spacer']} aria-hidden />
          )}
        </span>

        {isTier ? (
          <span className={styles['tree__rank']}>
            <LabelTag
              label={String((node.rank ?? 0) + 1)}
              type="Default"
              size="X-Small"
            />
          </span>
        ) : (
          <span className={styles['tree__rank-spacer']} aria-hidden />
        )}

        <span
          className={[
            styles['tree__label'],
            isTier ? styles['tree__label--tier'] : '',
            node.branch ? styles['tree__label--branch'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {node.label}
        </span>

        {isTier ? (
          <span className={styles['tree__compared']}>compared to Clearance</span>
        ) : (
          !node.branch && (
            <span className={styles['tree__display-tag']}>Display only</span>
          )
        )}
      </div>

      {hasChildren && open && (
        <ul className={styles['tree__children']}>
          {node.children!.map((c) => (
            <TreeRow key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
