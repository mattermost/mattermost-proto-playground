import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import type { AttrValue, HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import styles from './MvpMarkingsPage.module.scss';

export interface MvpMarkingsPageProps {
  attribute: HubAttribute;
}

function MarkingTree({ values }: { values: AttrValue[] }) {
  return (
    <ul className={styles['markings__list']}>
      {values.map((v) => (
        <li key={v.id} className={styles['markings__item']}>
          <span className={styles['markings__leaf']}>{v.label}</span>
          {v.children && v.children.length > 0 && (
            <MarkingTree values={v.children} />
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Read-only markings page reached by clicking the Classification row in the MVP
 * listing (build brief: "Classification row → click-through to the markings
 * page, still read-only"). Ranked tiers form the spine; display-only markings
 * nest beneath each tier. Managed in its own section, not editable here.
 */
export default function MvpMarkingsPage({ attribute }: MvpMarkingsPageProps) {
  const tiers = attribute.values.filter((v) => v.tier != null);

  return (
    <div className={styles['markings']}>
      <ConsolePanel
        title="Classification markings"
        subtitle="Ranked tiers and their nested handling markings. Managed in this dedicated section — read-only elsewhere."
        trailing={
          <Button
            emphasis="Tertiary"
            size="Small"
            trailingIcon={<Icon size="16" glyph={<OpenInNewIcon />} />}
            onClick={() =>
              window.open(
                'https://docs.mattermost.com/comply/data-retention-policy.html',
                '_blank',
                'noopener,noreferrer',
              )
            }
          >
            Open full markings guide
          </Button>
        }
      >
        <div className={styles['markings__tiers']}>
          {tiers.map((tier) => (
            <div key={tier.id} className={styles['markings__tier']}>
              <div className={styles['markings__tier-head']}>
                <RankedValueChip
                  label={tier.label}
                  rank={(tier.tier ?? 1) - 1}
                />
                <span className={styles['markings__tier-meta']}>
                  Tier {tier.tier}
                </span>
              </div>
              {tier.children && tier.children.length > 0 ? (
                <MarkingTree values={tier.children} />
              ) : (
                <p className={styles['markings__none']}>No nested markings.</p>
              )}
            </div>
          ))}
        </div>
      </ConsolePanel>
    </div>
  );
}
