import type { ReactNode } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import { Button } from '@mattermost/compass-ui';
import type {
  ButtonAppearance,
  ButtonEmphasis,
  ButtonSize,
} from '@mattermost/compass-ui';
import { Icon } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

const EMPHASES: ButtonEmphasis[] = [
  'Primary',
  'Secondary',
  'Tertiary',
  'Quaternary',
];

const SIZES: ButtonSize[] = ['X-Small', 'Small', 'Medium', 'Large'];

function VariantCell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles['components__button-variant-cell']}>
      <span className={styles['components__instance-label']}>{label}</span>
      {children}
    </div>
  );
}

function ButtonPermutationGrid({
  appearance,
  destructive,
  disabled,
}: {
  appearance: ButtonAppearance;
  destructive: boolean;
  disabled: boolean;
}) {
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
            className={
              styles['components__button-variant-matrix__size-heading']
            }
          >
            {size}
          </span>
        ))}
      </div>
      {EMPHASES.map((emphasis) => (
        <div
          key={emphasis}
          className={styles['components__button-variant-matrix__row']}
        >
          <span
            className={
              styles['components__button-variant-matrix__emphasis-label']
            }
          >
            {emphasis}
          </span>
          {SIZES.map((size) => (
            <div
              key={size}
              className={styles['components__button-variant-matrix__cell']}
            >
              <Button
                appearance={appearance}
                emphasis={emphasis}
                destructive={destructive}
                disabled={disabled}
                size={size}
              >
                Label
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ButtonLibrary() {
  const icon16 = <Icon glyph={<GlobeIcon />} size="16" />;

  return (
    <div className={styles['components__button-block']}>
      <p className={styles['components__paragraph']}>
        Full prop matrix for visual testing: each row is an emphasis, columns
        are sizes (16 buttons per section). Icon slots are covered separately
        below.
      </p>

      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>
          Default
        </h3>
        <ButtonPermutationGrid
          appearance="Default"
          destructive={false}
          disabled={false}
        />
      </div>

      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>
          Destructive
        </h3>
        <ButtonPermutationGrid
          appearance="Default"
          destructive
          disabled={false}
        />
      </div>

      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>
          Disabled
        </h3>
        <ButtonPermutationGrid
          appearance="Default"
          destructive={false}
          disabled
        />
      </div>

      <div className={styles['components__button-surface--inverted']}>
        <div className={styles['components__section']}>
          <h3 className={styles['components__section-title']}>
            Inverted
          </h3>
          <ButtonPermutationGrid
            appearance="Inverted"
            destructive={false}
            disabled={false}
          />
        </div>

        <div className={styles['components__section']}>
          <h3 className={styles['components__section-title']}>
            Inverted Destructive
          </h3>
          <ButtonPermutationGrid
            appearance="Inverted"
            destructive
            disabled={false}
          />
        </div>

        <div className={styles['components__section']}>
          <h3 className={styles['components__section-title']}>
            Inverted Disabled
          </h3>
          <ButtonPermutationGrid
            appearance="Inverted"
            destructive={false}
            disabled
          />
        </div>
      </div>

      <div className={styles['components__section']}>
        <h3 className={styles['components__section-title']}>
          Icon slots — Primary · Medium
        </h3>
        <div className={styles['components__button-variant-grid']}>
          <VariantCell label="Leading">
            <Button leadingIcon={icon16}>Label</Button>
          </VariantCell>
          <VariantCell label="Trailing">
            <Button trailingIcon={icon16}>Label</Button>
          </VariantCell>
          <VariantCell label="Both">
            <Button leadingIcon={icon16} trailingIcon={icon16}>
              Label
            </Button>
          </VariantCell>
        </div>
      </div>
    </div>
  );
}
