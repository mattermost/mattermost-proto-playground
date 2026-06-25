import type { ChangeEvent } from 'react';
import { useState } from 'react';

/**
 * Handles the controlled/uncontrolled pattern for boolean inputs (checkbox, radio, switch).
 *
 * - If `controlled` is provided (not undefined), the component is controlled and the
 *   caller owns the value. Changes are forwarded to `onChange` only.
 * - If `controlled` is undefined, the component manages its own state, initialised
 *   from `defaultValue`.
 *
 * Returns `[value, handleChange]`.
 */
export function useControllable(
  controlled: boolean | undefined,
  defaultValue: boolean | undefined,
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
): [boolean, (e: ChangeEvent<HTMLInputElement>) => void] {
  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? false);

  const value = isControlled ? controlled! : uncontrolled;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolled(e.target.checked);
    onChange?.(e);
  };

  return [value, handleChange];
}
