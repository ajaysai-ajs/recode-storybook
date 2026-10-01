import type { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';

import { EXTRA_GLYPHS } from '../Icon/icons';
import { Spinner, type SpinnerSize, type SpinnerTone } from '../Spinner/Spinner';
import './Button.css';

/*
 * Button - built from the Figma component "Button" (RDS Foundation, node 6033:59513).
 * Prop names and values match the Figma component properties exactly, so a designer can
 * read a Figma variant ("Variant=Primary, Size=md, State=Default") straight into code.
 */

export type ButtonVariant = 'Primary' | 'Secondary' | 'Destructive' | 'Outline' | 'Ghost' | 'Link';
export type ButtonSize = 'sm' | 'md' | 'lg';
/**
 * `Disabled` and `Loading` change how the button behaves.
 * `Hover`, `Press` and `Focus` only force the look (for docs and previews); in real use the
 * browser applies those automatically when you hover, press or tab to the button.
 */
export type ButtonState = 'Default' | 'Hover' | 'Press' | 'Focus' | 'Disabled' | 'Loading';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Figma: Variant */
  variant?: ButtonVariant;
  /** Figma: Size */
  size?: ButtonSize;
  /** Figma: State */
  state?: ButtonState;
  /** Figma: label - the button text. Also used as the accessible name while loading. */
  label: string;
  /** Figma: leadingIcon - show the icon before the label */
  leadingIcon?: boolean;
  /** Figma: trailingIcon - show the icon after the label */
  trailingIcon?: boolean;
  /** Figma: icon - the icon to show in the leading/trailing slot. Falls back to a placeholder. */
  icon?: ReactNode;
  /** Lets other code reach the <button>, e.g. to move focus to it */
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = 'Primary',
  size = 'md',
  state = 'Default',
  label,
  leadingIcon = false,
  trailingIcon = false,
  icon,
  type = 'button', // so a button inside a <form> doesn't submit it by accident
  disabled,
  onClick,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || state === 'Disabled';
  const isLoading = state === 'Loading';

  // While loading, the button stays focusable (so keyboard users don't lose their place)
  // but ignores clicks.
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isLoading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const iconSlot = <span className="rds-button__icon" aria-hidden="true">{icon ?? <PlaceholderIcon />}</span>;

  // As in Figma: filled variants use the white "On brand" spinner, the rest "Neutral";
  // sm and md buttons use the 16px spinner, lg the 20px one.
  const spinnerTone: SpinnerTone = variant === 'Primary' || variant === 'Destructive' ? 'On brand' : 'Neutral';
  const spinnerSize: SpinnerSize = size === 'lg' ? 'md' : 'sm';

  return (
    <button
      {...rest}
      type={type}
      className={['rds-button', className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
      data-state={isDisabled ? 'Disabled' : state}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      aria-disabled={isLoading || undefined}
      onClick={handleClick}
    >
      {isLoading && <Spinner tone={spinnerTone} size={spinnerSize} />}
      {!isLoading && leadingIcon && iconSlot}
      {/* While loading, Figma shows only the spinner. The label stays in the page, hidden
          visually, so screen readers still announce what the button is. */}
      <span className="rds-button__label">{label}</span>
      {!isLoading && trailingIcon && iconSlot}
    </button>
  );
}

/** The placeholder glyph Figma uses in the icon slots. Drawn in currentColor so it matches the label. */
function PlaceholderIcon() {
  return (
    <svg viewBox={EXTRA_GLYPHS.placeholder.viewBox} focusable="false">
      <path fill="currentColor" d={EXTRA_GLYPHS.placeholder.d} />
    </svg>
  );
}
