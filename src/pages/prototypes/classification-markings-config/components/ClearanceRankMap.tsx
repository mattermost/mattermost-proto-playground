import { Select } from '@mattermost/compass-ui';
import {
  CLEARANCE_NOT_REQUIRED_ID,
  type ClassificationLevel,
  type RankMap,
  type RankedAttributeValue,
} from '../classificationMarkingsData';
import styles from './ClearanceRankMap.module.scss';

export type ClearanceRankMapProps = {
  levels: ClassificationLevel[];
  clearanceValues: RankedAttributeValue[];
  mapping: RankMap;
  onChangeMapping: (levelId: string, clearanceValueId: string) => void;
  locked?: boolean;
  attributeName: string;
};

export default function ClearanceRankMap({
  levels,
  clearanceValues,
  mapping,
  onChangeMapping,
  locked = false,
  attributeName,
}: ClearanceRankMapProps) {
  return (
    <div className={styles['rank-map']}>
      <h3 className={styles['rank-map__heading']}>Rank mapping</h3>
      <p className={styles['rank-map__help']}>
        Map each classification level to a value on {attributeName}, or choose
        Clearance not required when that level should not require a matching
        user attribute. Access is granted when a user&apos;s{' '}
        {attributeName.toLowerCase()} rank meets or exceeds the mapped value.
      </p>
      <div className={styles['rank-map__frame']}>
        <table className={styles['rank-map__grid']}>
          <thead>
            <tr>
              <th className={styles['rank-map__th']} scope="col">
                Classification level
              </th>
              <th className={styles['rank-map__th']} scope="col">
                {attributeName} value
              </th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.id} className={styles['rank-map__tr']}>
                <td className={styles['rank-map__td']}>
                  <div className={styles['rank-map__level']}>
                    <span className={styles['rank-map__rank']}>
                      {level.rank}
                    </span>
                    <span
                      className={styles['rank-map__swatch']}
                      style={{ backgroundColor: level.color }}
                      aria-hidden
                    />
                    <span className={styles['rank-map__label']}>
                      {level.text || `Level ${level.rank}`}
                    </span>
                  </div>
                </td>
                <td className={styles['rank-map__td']}>
                  <div className={styles['rank-map__select']}>
                    <Select
                      size="Medium"
                      label={attributeName}
                      value={mapping[level.id] ?? CLEARANCE_NOT_REQUIRED_ID}
                      disabled={locked}
                      aria-label={`${attributeName} value for ${level.text || level.rank}`}
                      onChange={(e) =>
                        onChangeMapping(level.id, e.target.value)
                      }
                    >
                      <option value={CLEARANCE_NOT_REQUIRED_ID}>
                        Clearance not required
                      </option>
                      <hr />
                      {clearanceValues.map((value) => (
                        <option key={value.id} value={value.id}>
                          {value.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
