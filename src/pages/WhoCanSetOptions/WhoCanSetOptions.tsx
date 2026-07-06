import { useState, type ComponentType } from 'react';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import { type WhoCanSet } from '../AttributeManagementHub/hubData';
import OptionStatement, { type OptionProps } from './OptionStatement';
import OptionQuickPick from './OptionQuickPick';
import OptionDropdownCustom from './OptionDropdownCustom';
import { OPTION_META, emptyWhoCanSet, type OptionMeta } from './optionsData';
import styles from './WhoCanSetOptions.module.scss';

const COMPONENTS: Record<OptionMeta['id'], ComponentType<OptionProps>> = {
  statement: OptionStatement,
  'quick-pick': OptionQuickPick,
  dropdown: OptionDropdownCustom,
};

export default function WhoCanSetOptions() {
  const [values, setValues] = useState<Record<OptionMeta['id'], WhoCanSet>>({
    statement: emptyWhoCanSet(),
    'quick-pick': emptyWhoCanSet(),
    dropdown: emptyWhoCanSet(),
  });

  const update = (id: OptionMeta['id'], next: WhoCanSet) =>
    setValues((v) => ({ ...v, [id]: next }));

  return (
    <div className={styles['page']}>
      <header className={styles['page__head']}>
        <h1 className={styles['page__title']}>
          Who can set the value — 3 options
        </h1>
        <p className={styles['page__intro']}>
          Redesign of the “Who can set the value” control, optimized for the real
          usage curve: ~80% never change the default, ~10% pick another quick
          default, ~5% add a role, and fewer still combine roles, users, and
          attribute rules. Each card below is live — change the default or add
          grants to see how each pattern scales from the simple to the complex
          case. Demo binding: <strong>Classification → Channels</strong>.
        </p>
      </header>

      {OPTION_META.map((meta) => {
        const Component = COMPONENTS[meta.id];
        return (
          <section key={meta.id} className={styles['card']}>
            <div className={styles['card__head']}>
              <div className={styles['card__title-block']}>
                <span className={styles['card__eyebrow']}>Option {meta.n}</span>
                <h2 className={styles['card__title']}>{meta.title}</h2>
              </div>
              <LabelTag
                label={meta.optimizedFor}
                type="Info"
                size="Small"
              />
            </div>
            <p className={styles['card__blurb']}>{meta.blurb}</p>

            <div className={styles['field']}>
              <span className={styles['field__label']}>
                Who can set the value
              </span>
              <Component
                value={values[meta.id]}
                onChange={(next) => update(meta.id, next)}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
