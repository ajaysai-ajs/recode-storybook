import { useRef, type InputHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

import './Input.css';

/*
 * Input - built from the Figma component "Input v2" (Input page, node 6079:16607).
 * A single-line text field. The box (border, background, icons) is a <div>; the text
 * field itself is a real <input>, so typing, autofill and screen readers all work.
 */

export type InputAppearance = 'Default' | 'Subtle' | 'Ghost';
export type InputSize = 'sm' | 'md' | 'lg';
/**
 * `Error` and `Disabled` change behaviour. `Hover`, `Focus` and `Typing` only force the look
 * for previews - real inputs get them from the browser. `Filled` is simply an input with a value.
 */
export type InputState = 'Default' | 'Hover' | 'Focus' | 'Typing' | 'Filled' | 'Error' | 'Disabled';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Figma: Appearance */
  appearance?: InputAppearance;
  /** Figma: Size */
  size?: InputSize;
  /** Figma: State */
  state?: InputState;
  /** Figma: Placeholder - hint shown while the field is empty. Not a replacement for a label. */
  placeholder?: string;
  /** Figma: Value */
  value?: string;
  /** Figma: Leading Icon - show an icon before the text */
  leadingIcon?: boolean;
  /**
   * Figma: "Tailing Icon" (spelled that way in Figma) - show an icon after the text.
   * Named `trailingIcon` here to match Date Picker, which spells it correctly.
   */
  trailingIcon?: boolean;
  /** The icon for the leading slot. Figma has no property for this, so it defaults to its placeholder. */
  leadingIconSlot?: ReactNode;
  /** The icon for the trailing slot. Defaults to the Figma placeholder. */
  trailingIconSlot?: ReactNode;
  /** Class for the outer box */
  className?: string;
}

export function Input({
  appearance = 'Default',
  size = 'md',
  state = 'Default',
  leadingIcon = false,
  trailingIcon = false,
  leadingIconSlot,
  trailingIconSlot,
  disabled,
  className,
  'aria-invalid': ariaInvalid,
  ...inputProps
}: InputProps) {
  const isDisabled = disabled || state === 'Disabled';
  const isInvalid = state === 'Error' || ariaInvalid === true || ariaInvalid === 'true';

  // Clicking anywhere in the box (padding, icons) puts the cursor in the text field.
  const inputRef = useRef<HTMLInputElement>(null);
  const focusInput = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== inputRef.current) inputRef.current?.focus();
  };

  return (
    <div
      onClick={focusInput}
      className={['rds-input', className].filter(Boolean).join(' ')}
      data-appearance={appearance}
      data-size={size}
      data-state={isDisabled ? 'Disabled' : state}
      data-invalid={isInvalid || undefined}
    >
      {leadingIcon && <span className="rds-input__icon" aria-hidden="true">{leadingIconSlot ?? <PlaceholderIcon />}</span>}
      <input
        {...inputProps}
        ref={inputRef}
        className="rds-input__control"
        disabled={isDisabled}
        // Tells screen readers the value is wrong. Pair it with a visible error message
        // (the Field component does this) - colour alone is not enough.
        aria-invalid={isInvalid || undefined}
      />
      {trailingIcon && <span className="rds-input__icon" aria-hidden="true">{trailingIconSlot ?? <PlaceholderIcon />}</span>}
    </div>
  );
}

/** The placeholder glyph Figma puts in the icon slots (Material "image", 20x20). */
function PlaceholderIcon() {
  return (
    <svg viewBox="0 0 20 20" focusable="false">
      <path d="M15.8333 4.16667V15.8333H4.16667V4.16667H15.8333ZM15.8333 2.5H4.16667C3.25 2.5 2.5 3.25 2.5 4.16667V15.8333C2.5 16.75 3.25 17.5 4.16667 17.5H15.8333C16.75 17.5 17.5 16.75 17.5 15.8333V4.16667C17.5 3.25 16.75 2.5 15.8333 2.5ZM11.7833 9.88333L9.28333 13.1083L7.5 10.95L5 14.1667H15L11.7833 9.88333Z" />
    </svg>
  );
}
