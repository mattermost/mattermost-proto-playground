import {
  forwardRef,
  useId,
  type ChangeEvent,
  type InputHTMLAttributes,
} from 'react';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import { Icon } from '@mattermost/compass-ui';
import styles from './MobileSearchField.module.scss';

export interface MobileSearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Optional CSS class name on the field wrapper. */
  className?: string;
  /** Accessible name when no visible label is present. */
  'aria-label'?: string;
}

/**
 * Sidebar-styled mobile search field — magnifier + input on a translucent
 * sidebar fill. Used on the Search tab and Home “Find channels” navigator.
 *
 * @see Figma Patterns — Mobile — Top Nav Bar — Search
 */
const MobileSearchField = forwardRef<HTMLInputElement, MobileSearchFieldProps>(
  function MobileSearchField(
    {
      className = '',
      id: idProp,
      placeholder = 'Search messages & files',
      'aria-label': ariaLabel,
      onChange,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const rootClass = [styles['mobile-search-field'], className]
      .filter(Boolean)
      .join(' ');

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
    };

    return (
      <label className={rootClass} htmlFor={id}>
        <span className={styles['mobile-search-field__icon']} aria-hidden>
          <Icon size='20' glyph={<MagnifyIcon />} />
        </span>
        <input
          {...rest}
          ref={ref}
          id={id}
          className={styles['mobile-search-field__input']}
          type='search'
          placeholder={placeholder}
          aria-label={ariaLabel ?? placeholder}
          onChange={handleChange}
        />
      </label>
    );
  },
);

export default MobileSearchField;
