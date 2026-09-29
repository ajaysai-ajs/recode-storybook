import type { InputHTMLAttributes } from 'react';

import './Radio.css';

/*
 * Radio - built from the Figma components "Radio" (node 6211:27073, with label) and
 * "Radio item" (node 6211:26847, the circle on its own).
 * The circle is a real <input type="radio">, restyled. Give every radio in a group the same
 * `name`: the browser then lets people move between them with the arrow keys and makes sure
 * only one is selected.
 */

/** Only forces the look for previews; real radios get these from the browser. */
export type RadioState = 'default' | 'hover' | 'press' | 'focus';

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'disabled' | 'required'> {
  /**
   * Figma: Label. Leave it out only for the bare "Radio item" - then give the circle a name
   * with `aria-label`.
   */
  label?: string;
  /** Figma: isRequired - shows a red asterisk and marks the group as required */
  isRequired?: boolean;
  /** Figma: state */
  state?: RadioState;
  /**
   * Figma: isSelected. Set it (with `onChange`) when your code controls the value; leave it out
   * and use `defaultChecked` to let the group manage itself.
   */
  isSelected?: boolean;
  /** Figma: isInvalid. Pair it with an error message (the Field component does this). */
  isInvalid?: boolean;
  /** Figma: isDisabled */
  isDisabled?: boolean;
}

export function Radio({
  label,
  isRequired = false,
  state = 'default',
  isSelected,
  isInvalid = false,
  isDisabled = false,
  className,
  ...inputProps
}: RadioProps) {
  return (
    <label
      className={['rds-radio', className].filter(Boolean).join(' ')}
      // A disabled radio cannot be hovered, pressed or focused (as in Figma)
      data-state={isDisabled ? 'default' : state}
    >
      <span className="rds-radio__target">
        <input
          {...inputProps}
          type="radio"
          className="rds-radio__control"
          // Only pass `checked` when the parent controls it, otherwise the radio would be stuck
          checked={isSelected}
          disabled={isDisabled}
          required={isRequired}
          aria-invalid={isInvalid || undefined}
        />
      </span>
      {label && (
        <span className="rds-radio__label">
          {label}
          {/* The asterisk is visual; `required` on the input tells screen readers instead */}
          {isRequired && <span className="rds-radio__required" aria-hidden="true">*</span>}
        </span>
      )}
    </label>
  );
}
