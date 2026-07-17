import { useEffect, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { Button, Icon, IconButton, Select } from '@mattermost/compass-ui';
import {
  CLEARANCE_NOT_REQUIRED_ID,
  type ClassificationLevel,
  type RankMap,
  type RankedAttributeValue,
} from '../classificationMarkingsData';
import styles from './LevelsTable.module.scss';

export type LevelsTableClearanceMapping = {
  attributeName: string;
  values: RankedAttributeValue[];
  mapping: RankMap;
  onChange: (levelId: string, clearanceValueId: string) => void;
};

export type LevelsTableProps = {
  levels: ClassificationLevel[];
  onChangeText: (id: string, text: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  clearanceMapping?: LevelsTableClearanceMapping;
};

function LevelTextCell({
  id,
  value,
  rank,
  onCommit,
}: {
  id: string;
  value: string;
  rank: number;
  onCommit: (id: string, text: string) => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <input
      type="text"
      className={styles['levels-table__cell-input']}
      value={localValue}
      aria-label={`Level text, rank ${rank}`}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        const next = localValue.trim();
        if (next !== value) {
          onCommit(id, next);
        } else {
          setLocalValue(value);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}

function LevelColorCell({
  id,
  value,
  label,
  onCommit,
}: {
  id: string;
  value: string;
  label: string;
  onCommit: (id: string, color: string) => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const commitIfValid = (next: string) => {
    const trimmed = next.trim();
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed) && trimmed !== value) {
      onCommit(id, trimmed.length === 4
        ? `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`
        : trimmed.toUpperCase());
      return;
    }
    setLocalValue(value);
  };

  return (
    <div className={styles['levels-table__color-cell']}>
      <label className={styles['levels-table__swatch-wrap']}>
        <span
          className={styles['levels-table__swatch']}
          style={{ backgroundColor: value }}
          aria-hidden
        />
        <input
          type="color"
          className={styles['levels-table__color-picker']}
          value={/^#[0-9a-fA-F]{6}$/i.test(value) ? value : '#000000'}
          aria-label={`Pick color for ${label || 'level'}`}
          onChange={(e) => {
            const next = e.target.value.toUpperCase();
            setLocalValue(next);
            onCommit(id, next);
          }}
        />
      </label>
      <input
        type="text"
        className={styles['levels-table__cell-input']}
        value={localValue}
        spellCheck={false}
        aria-label={`Color hex for ${label || 'level'}`}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => commitIfValid(localValue)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
    </div>
  );
}

export default function LevelsTable({
  levels,
  onChangeText,
  onChangeColor,
  onDelete,
  onAdd,
  clearanceMapping,
}: LevelsTableProps) {
  const showMapping = clearanceMapping != null;

  return (
    <div
      className={[
        styles['levels-table'],
        showMapping ? styles['levels-table--with-mapping'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['levels-table__frame']}>
        <table className={styles['levels-table__grid']}>
          <thead>
            <tr>
              <th className={styles['levels-table__th']} scope="col">
                Text
              </th>
              <th
                className={[
                  styles['levels-table__th'],
                  styles['levels-table__th--color'],
                ].join(' ')}
                scope="col"
              >
                Color
              </th>
              <th
                className={[
                  styles['levels-table__th'],
                  styles['levels-table__th--rank'],
                ].join(' ')}
                scope="col"
              >
                Rank
              </th>
              {showMapping ? (
                <th
                  className={[
                    styles['levels-table__th'],
                    styles['levels-table__th--mapping'],
                  ].join(' ')}
                  scope="col"
                >
                  {clearanceMapping.attributeName}
                </th>
              ) : null}
              <th
                className={[
                  styles['levels-table__th'],
                  styles['levels-table__th--actions'],
                ].join(' ')}
                scope="col"
              >
                <span className={styles['levels-table__visually-hidden']}>
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.id} className={styles['levels-table__tr']}>
                <td className={styles['levels-table__td']}>
                  <LevelTextCell
                    id={level.id}
                    value={level.text}
                    rank={level.rank}
                    onCommit={onChangeText}
                  />
                </td>
                <td
                  className={[
                    styles['levels-table__td'],
                    styles['levels-table__td--color'],
                  ].join(' ')}
                >
                  <LevelColorCell
                    id={level.id}
                    value={level.color}
                    label={level.text}
                    onCommit={onChangeColor}
                  />
                </td>
                <td
                  className={[
                    styles['levels-table__td'],
                    styles['levels-table__td--rank'],
                  ].join(' ')}
                >
                  <span className={styles['levels-table__rank']}>
                    {level.rank}
                  </span>
                </td>
                {showMapping ? (
                  <td
                    className={[
                      styles['levels-table__td'],
                      styles['levels-table__td--mapping'],
                    ].join(' ')}
                  >
                    <div className={styles['levels-table__mapping-select']}>
                      <Select
                        size="Medium"
                        value={
                          clearanceMapping.mapping[level.id] ??
                          CLEARANCE_NOT_REQUIRED_ID
                        }
                        aria-label={`${clearanceMapping.attributeName} value for ${level.text || level.rank}`}
                        onChange={(e) =>
                          clearanceMapping.onChange(level.id, e.target.value)
                        }
                      >
                        <option value={CLEARANCE_NOT_REQUIRED_ID}>
                          Clearance not required
                        </option>
                        <hr />
                        {clearanceMapping.values.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </td>
                ) : null}
                <td
                  className={[
                    styles['levels-table__td'],
                    styles['levels-table__td--actions'],
                  ].join(' ')}
                >
                  <IconButton
                    type="button"
                    style="Default"
                    size="Small"
                    aria-label={`Delete ${level.text || 'level'}`}
                    disabled={levels.length <= 1}
                    onClick={() => onDelete(level.id)}
                    icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles['levels-table__footer']}>
        <Button
          type="button"
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={onAdd}
        >
          Add level
        </Button>
      </div>
    </div>
  );
}
