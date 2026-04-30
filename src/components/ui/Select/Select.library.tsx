import Select from '@/components/ui/Select/Select';
import styles from '@/pages/Components/Components.module.scss';

export default function SelectLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>Sizes</span>
                  <Select size="Small" label="Small">
                    <option value="">Select…</option>
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                  </Select>
                  <Select size="Medium" label="Medium">
                    <option value="">Select…</option>
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                  </Select>
                  <Select size="Large" label="Large">
                    <option value="">Select…</option>
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                  </Select>
                </div>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>States</span>
                  <Select label="Invalid" invalid defaultValue="">
                    <option value="">Select…</option>
                    <option value="a">Option A</option>
                  </Select>
                  <Select label="Disabled" disabled defaultValue="">
                    <option value="">Select…</option>
                    <option value="a">Option A</option>
                  </Select>
                </div>
              </div>
    </>
  );
}
