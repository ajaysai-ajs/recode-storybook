import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';

import './Field.css';

/*
 * Field - built from the Figma components "RDS Field" (node 6436:200) and
 * "RDS Field Message" (node 6436:153) on the Field page.
 *
 * Wraps one form control (Input, Textarea, Date Picker...) with a label, a required marker
 * and a message, and connects them for screen readers automatically:
 *   - clicking the label focuses the control (label "for" = control id)
 *   - the message is read out as the control's description
 *   - "required" and "invalid" are passed on to the control
 */

// ---- RDS Field Message ---------------------------------------------------------------------------

export type FieldMessageTone = 'default' | 'error' | 'success';

export interface FieldMessageProps {
  /** Figma: message */
  message: string;
  /** Figma: tone - `error` and `success` add an icon, so the meaning isn't carried by colour alone */
  tone?: FieldMessageTone;
  id?: string;
}

export function FieldMessage({ message, tone = 'default', id }: FieldMessageProps) {
  return (
    <p id={id} className="rds-field__message" data-tone={tone}>
      {tone === 'error' && (
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M0.666667 14.3333H15.3333L8 1.66667L0.666667 14.3333ZM8.66667 12.3333H7.33333V11H8.66667V12.3333ZM8.66667 9.66667H7.33333V7H8.66667V9.66667Z" />
        </svg>
      )}
      {tone === 'success' && (
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M8 1.33333C4.32 1.33333 1.33333 4.32 1.33333 8C1.33333 11.68 4.32 14.6667 8 14.6667C11.68 14.6667 14.6667 11.68 14.6667 8C14.6667 4.32 11.68 1.33333 8 1.33333ZM6.66667 11.3333L3.33333 8L4.27333 7.06L6.66667 9.44667L11.7267 4.38667L12.6667 5.33333L6.66667 11.3333Z" />
        </svg>
      )}
      {/* Screen readers hear "Error: ..." / "Success: ..." instead of seeing the icon */}
      {tone === 'error' && <span className="rds-field__hint">Error: </span>}
      {tone === 'success' && <span className="rds-field__hint">Success: </span>}
      <span>{message}</span>
    </p>
  );
}

// ---- RDS Field ------------------------------------------------------------------------------------

/** Figma: state - picks the message tone and marks the control invalid */
export type FieldState = 'default' | 'invalid' | 'valid';

export interface FieldProps {
  /** Figma: label */
  label: string;
  /** Figma: isRequired - shows a red asterisk and marks the control required */
  isRequired?: boolean;
  /** Figma: state */
  state?: FieldState;
  /** Figma: showMessage */
  showMessage?: boolean;
  /**
   * The message under the control: a hint, an error or a success note. Figma has no property
   * for this text (it always says "Message content"), but code needs one.
   */
  message?: string;
  /** Figma: control - the form control this field labels (one element, e.g. an Input) */
  children: ReactNode;
  className?: string;
}

/** The props Field adds to its control. All our form controls pass these to the real input. */
type ControlProps = {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  required?: boolean;
};

export function Field({
  label,
  isRequired = false,
  state = 'default',
  showMessage = true,
  message,
  children,
  className,
}: FieldProps) {
  const autoId = useId();
  const hasMessage = showMessage && !!message;

  // Connect the control to the label and message (keeping any id/describedby it already has)
  let controlId = `${autoId}-control`;
  let control = children;
  if (isValidElement(children)) {
    const child = children as ReactElement<ControlProps>;
    controlId = child.props.id ?? controlId;
    control = cloneElement(child, {
      id: controlId,
      'aria-describedby': [child.props['aria-describedby'], hasMessage ? `${autoId}-message` : undefined].filter(Boolean).join(' ') || undefined,
      'aria-invalid': state === 'invalid' || child.props['aria-invalid'] || undefined,
      required: isRequired || child.props.required || undefined,
    });
  }

  const tone: FieldMessageTone = state === 'invalid' ? 'error' : state === 'valid' ? 'success' : 'default';

  return (
    <div className={['rds-field', className].filter(Boolean).join(' ')} data-state={state}>
      <label className="rds-field__label" htmlFor={controlId}>
        {label}
        {/* The asterisk is visual; `required` on the control tells screen readers instead */}
        {isRequired && (
          <span className="rds-field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {control}

      {/* A live region, so an error that appears after submitting is announced */}
      <div className="rds-field__message-area" aria-live="polite">
        {hasMessage && <FieldMessage id={`${autoId}-message`} message={message} tone={tone} />}
      </div>
    </div>
  );
}
