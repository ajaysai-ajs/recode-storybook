import { useEffect, useRef, type InputHTMLAttributes } from 'react';

import './Checkbox.css';

/*
 * Checkbox - built from the Figma components "Checkbox" (node 6200:27047, with label) and
 * "Checkbox item" (node 6202:580, the box on its own).
 * The box is a real <input type="checkbox">, restyled, so Space toggles it, forms submit it
 * and screen readers announce it as a checkbox. Clicking the label also toggles it.
 */

/** Only forces the look for previews; real checkboxes get these from the browser. */
export type CheckboxState = 'default' | 'hover' | 'press' | 'focus';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'disabled' | 'required'> {
  /**
   * Figma: Label. Leave it out only for the bare "Checkbox item" (e.g. in a table row) - then
   * you must give the box a name with `aria-label`.
   */
  label?: string;
  /** Figma: isRequired - shows a red asterisk and marks the field as required */
  isRequired?: boolean;
  /** Figma: state */
  state?: CheckboxState;
  /**
   * Figma: isChecked. Set it (with `onChange`) when your code controls the value; leave it out
   * and use `defaultChecked` to let the checkbox manage itself.
   */
  isChecked?: boolean;
  /** Figma: isIndeterminate - the "some selected" dash. Wins over isChecked, as in Figma. */
  isIndeterminate?: boolean;
  /** Figma: isInvalid. Pair it with an error message (the Field component does this). */
  isInvalid?: boolean;
  /** Figma: isDisabled */
  isDisabled?: boolean;
}

export function Checkbox({
  label,
  isRequired = false,
  state = 'default',
  isChecked,
  isIndeterminate = false,
  isInvalid = false,
  isDisabled = false,
  className,
  ...inputProps
}: CheckboxProps) {
  // "Indeterminate" can't be set in HTML, only from code, so we set it after rendering.
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = isIndeterminate;
  }, [isIndeterminate]);

  return (
    <label
      className={['rds-checkbox', className].filter(Boolean).join(' ')}
      // A disabled checkbox cannot be hovered, pressed or focused (as in Figma)
      data-state={isDisabled ? 'default' : state}
    >
      <span className="rds-checkbox__target">
        <input
          {...inputProps}
          ref={inputRef}
          type="checkbox"
          className="rds-checkbox__control"
          // Only pass `checked` when the parent controls it, otherwise the box would be stuck
          checked={isChecked === undefined ? undefined : isChecked && !isIndeterminate}
          disabled={isDisabled}
          required={isRequired}
          aria-invalid={isInvalid || undefined}
        />
      </span>
      {label && (
        <span className="rds-checkbox__label">
          {label}
          {/* The asterisk is visual; `required` on the input tells screen readers instead */}
          {isRequired && <span className="rds-checkbox__required" aria-hidden="true">*</span>}
        </span>
      )}
    </label>
  );
}
