import { useId, useState } from 'react';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import Radio from '@/components/ui/Radio/Radio';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Select from '@/components/ui/Select/Select';
import TextInput from '@/components/ui/TextInput/TextInput';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import ConsoleSetting from '@/components/ui/ConsoleSetting/ConsoleSetting';
import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import styles from './ClassificationMarkingsPage.module.scss';

export interface ClassificationMarkingsPageProps {
  /** Ranked user attributes available as clearance sources. */
  clearanceAttributes: HubAttribute[];
  onCancel?: () => void;
  onSave?: () => void;
}

type Level = {
  id: string;
  text: string;
  color: string;
  rank: number;
  clearance: string;
};

const US_LEVELS: Level[] = [
  {
    id: 'unclassified',
    text: 'UNCLASSIFIED',
    color: '#007A33',
    rank: 1,
    clearance: 'none',
  },
  {
    id: 'cui',
    text: 'CUI',
    color: '#502B85',
    rank: 2,
    clearance: 'none',
  },
  {
    id: 'confidential',
    text: 'CONFIDENTIAL',
    color: '#0033A0',
    rank: 3,
    clearance: 'CONFIDENTIAL',
  },
  {
    id: 'secret',
    text: 'SECRET',
    color: '#C8102E',
    rank: 4,
    clearance: 'SECRET',
  },
  {
    id: 'top-secret',
    text: 'TOP SECRET',
    color: '#FF8C00',
    rank: 5,
    clearance: 'TOP SECRET',
  },
  {
    id: 'ts-sci',
    text: 'TOP SECRET//SCI',
    color: '#FCE83A',
    rank: 6,
    clearance: 'TOP SECRET//SCI',
  },
];

const PRESETS = [
  { id: 'us', label: 'United States' },
  { id: 'nato', label: 'NATO' },
  { id: 'custom', label: 'Custom' },
] as const;

function RadioPair({
  name,
  value,
  onChange,
  trueLabel = 'True',
  falseLabel = 'False',
}: {
  name: string;
  value: boolean;
  onChange: (v: boolean) => void;
  trueLabel?: string;
  falseLabel?: string;
}) {
  return (
    <div className={styles['markings__radio-row']}>
      <Radio
        className={styles['markings__radio']}
        name={name}
        checked={value}
        onChange={() => onChange(true)}
      >
        {trueLabel}
      </Radio>
      <Radio
        className={styles['markings__radio']}
        name={name}
        checked={!value}
        onChange={() => onChange(false)}
      >
        {falseLabel}
      </Radio>
    </div>
  );
}

/**
 * System Console — Classification Markings admin page (interactive duplicate of
 * the markings concept). Linked from Classification in Attribute Management;
 * edits live here rather than on the locked Classification attribute detail.
 */
export default function ClassificationMarkingsPage({
  clearanceAttributes,
  onCancel,
  onSave,
}: ClassificationMarkingsPageProps) {
  const uid = useId();
  const [enabled, setEnabled] = useState(true);
  const [preset, setPreset] = useState<string>('us');
  const [enforce, setEnforce] = useState(true);
  const [clearanceAttrId, setClearanceAttrId] = useState(
    () => clearanceAttributes.find((a) => a.id === 'clearance')?.id ?? '',
  );
  const [enforceResources, setEnforceResources] = useState({
    Channels: true,
    Posts: false,
  });
  const [levels, setLevels] = useState<Level[]>(US_LEVELS);
  const [globalBanner, setGlobalBanner] = useState(true);
  const [bannerVisibility, setBannerVisibility] = useState<'top' | 'both'>(
    'top',
  );
  const [globalLevelId, setGlobalLevelId] = useState('unclassified');
  const [dirty, setDirty] = useState(false);

  const markDirty = () => setDirty(true);

  const clearanceOptions = [
    { id: 'none', label: 'Clearance not required' },
    ...levels
      .filter((l) => l.clearance !== 'none')
      .map((l) => ({ id: l.text, label: l.text })),
    // Keep mapped option labels even if not in levels text list.
    ...['CONFIDENTIAL', 'SECRET', 'TOP SECRET', 'TOP SECRET//SCI']
      .filter((label) => !levels.some((l) => l.text === label))
      .map((label) => ({ id: label, label })),
  ];

  const updateLevel = (id: string, patch: Partial<Level>) => {
    setLevels((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    markDirty();
  };

  const removeLevel = (id: string) => {
    setLevels((prev) =>
      prev
        .filter((l) => l.id !== id)
        .map((l, i) => ({ ...l, rank: i + 1 })),
    );
    markDirty();
  };

  const addLevel = () => {
    const n = levels.length + 1;
    setLevels((prev) => [
      ...prev,
      {
        id: `level-${Date.now()}`,
        text: `LEVEL ${n}`,
        color: '#808080',
        rank: n,
        clearance: 'none',
      },
    ]);
    setPreset('custom');
    markDirty();
  };

  const moveLevel = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= levels.length) return;
    setLevels((prev) => {
      const next = [...prev];
      const [row] = next.splice(index, 1);
      next.splice(target, 0, row);
      return next.map((l, i) => ({ ...l, rank: i + 1 }));
    });
    markDirty();
  };

  const toggleEnforceResource = (key: keyof typeof enforceResources) => {
    setEnforceResources((prev) => ({ ...prev, [key]: !prev[key] }));
    markDirty();
  };

  const contentDisabled = !enabled;

  return (
    <div className={styles['markings']}>
      <div className={styles['markings__body']}>
        <ConsoleSetting
          label="Enable classification markings"
          helpText="Use this to enable classification markings as banners at the system and channel level. You can select text and colors for your banner, as well as set a default option for consistency."
        >
          <RadioPair
            name={`${uid}-enable`}
            value={enabled}
            onChange={(v) => {
              setEnabled(v);
              markDirty();
            }}
          />
        </ConsoleSetting>

        <div
          className={[
            styles['markings__sections'],
            contentDisabled ? styles['markings__sections--disabled'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <ConsoleSetting
            label="Classification preset"
            helpText="Select a classification preset based on your country affiliation, or pick custom to define your own levels below."
          >
            <Select
              size="Medium"
              className={styles['markings__control']}
              value={preset}
              aria-label="Classification preset"
              onChange={(e) => {
                const next = e.target.value;
                setPreset(next);
                if (next === 'us') setLevels(US_LEVELS);
                markDirty();
              }}
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
          </ConsoleSetting>

          <ConsolePanel
            title="Classification Enforcement"
            subtitle="Restrict access to classified resources based on a user's clearance. When enforced, users must hold a ranked clearance attribute that meets each resource's classification level."
          >
            <div className={styles['markings__settings']}>
              <ConsoleSetting
                label="Enforce classification markings"
                helpText="When enabled, access can be gated by a users' clearance attribute. This will be managed by a corresponding Membership policy."
              >
                <RadioPair
                  name={`${uid}-enforce`}
                  value={enforce}
                  onChange={(v) => {
                    setEnforce(v);
                    markDirty();
                  }}
                />
              </ConsoleSetting>
              <ConsoleSetting
                label="Clearance attribute"
                helpText="Must be a ranked type applied to users. After you select an attribute, map it to each level in the Classification levels section below."
              >
                <div className={styles['markings__inline']}>
                  <Select
                    size="Medium"
                    className={styles['markings__control']}
                    value={clearanceAttrId}
                    disabled={!enforce}
                    aria-label="Clearance attribute"
                    onChange={(e) => {
                      setClearanceAttrId(e.target.value);
                      markDirty();
                    }}
                  >
                    {clearanceAttributes.length === 0 && (
                      <option value="">No ranked user attributes</option>
                    )}
                    {clearanceAttributes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </Select>
                  <Button
                    emphasis="Tertiary"
                    size="Medium"
                    leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                    disabled={!enforce}
                    onClick={() => undefined}
                  >
                    Create new
                  </Button>
                </div>
              </ConsoleSetting>
              <ConsoleSetting
                label="Resources to enforce"
                helpText="Choose which resource types require classification for access decisions."
              >
                <div className={styles['markings__check-row']}>
                  {(['Channels', 'Posts'] as const).map((r) => (
                    <Checkbox
                      key={r}
                      className={styles['markings__check']}
                      checked={enforceResources[r]}
                      disabled={!enforce}
                      onChange={() => toggleEnforceResource(r)}
                    >
                      {r}
                    </Checkbox>
                  ))}
                </div>
              </ConsoleSetting>
            </div>
          </ConsolePanel>

          <ConsolePanel
            title="Classification levels"
            subtitle="Text, colors, and Clearance mapping for classification levels. Saving creates a Classification attribute from these levels."
          >
            <div className={styles['markings__table-wrap']}>
              <table className={styles['markings__table']}>
                <thead>
                  <tr>
                    <th className={styles['markings__col-drag']} aria-label="Reorder" />
                    <th>Text</th>
                    <th>Color</th>
                    <th className={styles['markings__col-rank']}>Rank</th>
                    <th>Clearance</th>
                    <th className={styles['markings__col-actions']} aria-label="Remove" />
                  </tr>
                </thead>
                <tbody>
                  {levels.map((level, index) => (
                    <tr key={level.id}>
                      <td>
                        <div className={styles['markings__drag']}>
                          <IconButton
                            size="Small"
                            padding="Compact"
                            aria-label={`Move ${level.text} up`}
                            disabled={index === 0}
                            onClick={() => moveLevel(index, -1)}
                            icon={<Icon size="16" glyph={<DragVerticalIcon />} />}
                          />
                        </div>
                      </td>
                      <td>
                        <TextInput
                          size="Small"
                          value={level.text}
                          aria-label={`Level text ${level.rank}`}
                          onChange={(e) =>
                            updateLevel(level.id, { text: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <div className={styles['markings__color']}>
                          <input
                            type="color"
                            className={styles['markings__color-picker']}
                            value={level.color}
                            aria-label={`Color for ${level.text}`}
                            onChange={(e) =>
                              updateLevel(level.id, { color: e.target.value })
                            }
                          />
                          <TextInput
                            size="Small"
                            className={styles['markings__color-hex']}
                            value={level.color}
                            aria-label={`Hex color for ${level.text}`}
                            onChange={(e) =>
                              updateLevel(level.id, { color: e.target.value })
                            }
                          />
                        </div>
                      </td>
                      <td className={styles['markings__rank']}>{level.rank}</td>
                      <td>
                        <Select
                          size="Small"
                          value={level.clearance}
                          aria-label={`Clearance mapping for ${level.text}`}
                          onChange={(e) =>
                            updateLevel(level.id, {
                              clearance: e.target.value,
                            })
                          }
                        >
                          {clearanceOptions.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td>
                        <IconButton
                          size="Small"
                          padding="Compact"
                          aria-label={`Remove ${level.text}`}
                          onClick={() => removeLevel(level.id)}
                          icon={
                            <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              emphasis="Tertiary"
              size="Medium"
              leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
              onClick={addLevel}
            >
              Add level
            </Button>
          </ConsolePanel>

          <ConsolePanel
            title="Global Classification Indicators"
            subtitle="Configure the global classification banner to be displayed at the very top of the Mattermost application."
          >
            <div className={styles['markings__settings']}>
              <ConsoleSetting
                label="Global Classification Banner"
                helpText="Displays a global banner for the system-wide classification."
              >
                <RadioPair
                  name={`${uid}-global-banner`}
                  value={globalBanner}
                  onChange={(v) => {
                    setGlobalBanner(v);
                    markDirty();
                  }}
                />
              </ConsoleSetting>
              <ConsoleSetting label="Banner visibility">
                <div className={styles['markings__radio-row']}>
                  <Radio
                    className={styles['markings__radio']}
                    name={`${uid}-banner-vis`}
                    checked={bannerVisibility === 'top'}
                    disabled={!globalBanner}
                    onChange={() => {
                      setBannerVisibility('top');
                      markDirty();
                    }}
                  >
                    Top only
                  </Radio>
                  <Radio
                    className={styles['markings__radio']}
                    name={`${uid}-banner-vis`}
                    checked={bannerVisibility === 'both'}
                    disabled={!globalBanner}
                    onChange={() => {
                      setBannerVisibility('both');
                      markDirty();
                    }}
                  >
                    Top and bottom
                  </Radio>
                </div>
              </ConsoleSetting>
              <ConsoleSetting
                label="Global classification level"
                helpText="Select the level at which your entire Mattermost server is required to operate."
              >
                <div className={styles['markings__level-control']}>
                  <Select
                    size="Medium"
                    className={styles['markings__control']}
                    value={globalLevelId}
                    disabled={!globalBanner}
                    aria-label="Global classification level"
                    onChange={(e) => {
                      setGlobalLevelId(e.target.value);
                      markDirty();
                    }}
                  >
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.text}
                      </option>
                    ))}
                  </Select>
                  {levels.find((l) => l.id === globalLevelId) && (
                    <span
                      className={styles['markings__level-swatch']}
                      style={{
                        background: levels.find((l) => l.id === globalLevelId)!
                          .color,
                      }}
                      aria-hidden
                    />
                  )}
                </div>
              </ConsoleSetting>
            </div>
          </ConsolePanel>
        </div>
      </div>

      <div className={styles['markings__footer']}>
        <Button
          emphasis="Primary"
          size="Medium"
          disabled={!dirty}
          onClick={() => {
            setDirty(false);
            onSave?.();
          }}
        >
          Save
        </Button>
        {onCancel && (
          <Button emphasis="Tertiary" size="Medium" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
