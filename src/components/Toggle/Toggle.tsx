import type { InputHTMLAttributes } from 'react';

import './Toggle.css';

/*
 * Toggle - built from the Figma component "Toggle" (Toggle page, node 3726:82).
 * An on/off switch. In Figma every layer is bound to the components/switch/* tokens, so
 * those are the tokens used here (the components/toggle/* tokens belong to a different,
 * button-style toggle).
 *
 * It is a real checkbox with role="switch": Space turns it on and off, and screen readers
 * announce "switch, on" / "switch, off".
 */

/** Figma: State. `Disabled` blocks interaction; combine it with `defaultChecked` for "disabled + on". */
export type ToggleState = 'Off' | 'On' | 'Disabled';
/** Figma: Interaction. Only forces the look for previews; real toggles get these from the browser. */
export type ToggleInteraction = 'Default' | 'Hover' | 'Focus';

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role' | 'checked' | 'disabled'> {
  /**
   * Figma: State. Set it to 'On'/'Off' (and update it in `onChange`) when your code controls
   * the value; leave it out and use `defaultChecked` to let the toggle manage itself.
   */
  state?: ToggleState;
  /** Figma: Interaction */
  interaction?: ToggleInteraction;
  /**
   * Text shown next to the switch. Not in Figma, but every toggle needs a name: use this, or
   * `aria-label` when the name is visible elsewhere (e.g. a table column header).
   */
  label?: string;
}

export function Toggle({ state, interaction = 'Default', label, className, ...inputProps }: ToggleProps) {
  const isDisabled = state === 'Disabled';
  // Only pass `checked` when the parent controls it (On/Off), otherwise the toggle would be stuck
  const checked = state === 'On' ? true : state === 'Off' ? false : undefined;

  return (
    <label
      className={['rds-toggle', className].filter(Boolean).join(' ')}
      // A disabled toggle cannot be hovered or focused (as in Figma)
      data-interaction={isDisabled ? 'Default' : interaction}
    >
      <input
        {...inputProps}
        type="checkbox"
        role="switch"
        className="rds-toggle__control"
        checked={checked}
        disabled={isDisabled}
      />
      {label && <span className="rds-toggle__label">{label}</span>}
    </label>
  );
}
