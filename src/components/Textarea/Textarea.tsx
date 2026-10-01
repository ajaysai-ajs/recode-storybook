import type { TextareaHTMLAttributes } from 'react';

import './Textarea.css';

/*
 * Textarea - built from the Figma component "Text area" (Textarea page, node 6152:19725).
 * A multi-line text field. It is a real <textarea>, so typing, autofill, spell-check and
 * screen readers all work; people can also drag its corner to make it taller.
 */

export type TextareaAppearance = 'Default' | 'Subtle' | 'Ghost';
/**
 * `Error` and `Disabled` change behaviour. `Hover`, `Focus` and `Typing` only force the look
 * for previews - real textareas get them from the browser. `Filled` is simply one with a value.
 */
export type TextareaState = 'Default' | 'Hover' | 'Focus' | 'Typing' | 'Filled' | 'Error' | 'Disabled';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Figma: Appearance */
  appearance?: TextareaAppearance;
  /** Figma: State */
  state?: TextareaState;
  /** Figma: Placeholder - hint shown while empty. Not a replacement for a label. */
  placeholder?: string;
  /** Figma: Value */
  value?: string;
}

export function Textarea({
  appearance = 'Default',
  state = 'Default',
  disabled,
  className,
  'aria-invalid': ariaInvalid,
  ...rest
}: TextareaProps) {
  const isDisabled = disabled || state === 'Disabled';
  const isInvalid = state === 'Error' || ariaInvalid === true || ariaInvalid === 'true';

  return (
    <textarea
      {...rest}
      className={['rds-textarea', className].filter(Boolean).join(' ')}
      data-appearance={appearance}
      data-state={isDisabled ? 'Disabled' : state}
      disabled={isDisabled}
      // Tells screen readers the value is wrong. Pair it with a visible error message
      // (the Field component does this) - colour alone is not enough.
      aria-invalid={isInvalid || undefined}
    />
  );
}
