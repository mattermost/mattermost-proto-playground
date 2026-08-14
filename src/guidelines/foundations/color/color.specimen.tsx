import Swatch, { SwatchGrid } from '@/guidelines/_components/Swatch';
import { Divider } from '@mattermost/compass-ui';
import styles from './color.specimen.module.scss';

const PALETTES: { label: string; base: string; shades: number[] }[] = [
  {
    label: 'Indigo',
    base: 'color-indigo',
    shades: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    label: 'Blue',
    base: 'color-blue',
    shades: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    label: 'Cyan',
    base: 'color-cyan',
    shades: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    label: 'Green',
    base: 'color-green',
    shades: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    label: 'Orange',
    base: 'color-orange',
    shades: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    label: 'Purple',
    base: 'color-purple',
    shades: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    label: 'Red',
    base: 'color-red',
    shades: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    label: 'Teal',
    base: 'color-teal',
    shades: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    label: 'Yellow',
    base: 'color-yellow',
    shades: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    label: 'Neutral',
    base: 'color-neutral',
    shades: [
      0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700,
      750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200,
    ],
  },
];

export function ColorPalettesContent() {
  return (
    <>
      {PALETTES.map(({ label, base, shades }) => (
        <div key={label} className={styles.colorSpecimen__palette}>
          <div className={styles.colorSpecimen__paletteTitle}>{label}</div>
          <SwatchGrid size="medium">
            {shades.map((shade) => (
              <Swatch
                key={shade}
                token={`${base}-${shade}`}
                size="medium"
                showFullColorMeta
              />
            ))}
          </SwatchGrid>
          <Divider />
        </div>
      ))}
    </>
  );
}

export default function ColorLibrary() {
  return <ColorPalettesContent />;
}
