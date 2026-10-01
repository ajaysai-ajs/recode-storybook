import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';

import type { ButtonSize, ButtonState, ButtonVariant } from '../Button/Button';
import '../Button/Button.css'; // Icon Button shares Button's colours and states
import { Spinner, type SpinnerSize, type SpinnerTone } from '../Spinner/Spinner';
import './IconButton.css';

/*
 * Icon Button - built from the Figma component "RDS Icon Button" (Icon Button page,
 * node 6487:13351). A square button with only an icon. Same Variant x Size x State matrix as
 * Button and the same button/* colour tokens; only the square size comes from icon-button/*.
 */

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Figma: Icon - the icon to show, e.g. <Icon icon="clear" /> */
  icon: ReactNode;
  /**
   * What the button does, for screen readers (e.g. "Close"). Required: with no visible text,
   * this is the button's only name. Consider showing it in a Tooltip too.
   */
  label: string;
  /** Figma: Variant */
  variant?: ButtonVariant;
  /** Figma: Size */
  size?: ButtonSize;
  /** Figma: State. `Disabled` and `Loading` change behaviour; the rest only force the look. */
  state?: ButtonState;
}

export function IconButton({
  icon,
  label,
  variant = 'Primary',
  size = 'md',
  state = 'Default',
  type = 'button',
  disabled,
  onClick,
  className,
  ...rest
}: IconButtonProps) {
  const isDisabled = disabled || state === 'Disabled';
  const isLoading = state === 'Loading';

  // While loading, it stays focusable but ignores clicks (same as Button)
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isLoading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  // As in Figma: filled variants use the "On brand" spinner, the rest "Neutral";
  // the spinner matches the icon size (16px, or 20px on lg)
  const spinnerTone: SpinnerTone = variant === 'Primary' || variant === 'Destructive' ? 'On brand' : 'Neutral';
  const spinnerSize: SpinnerSize = size === 'lg' ? 'md' : 'sm';

  return (
    <button
      {...rest}
      type={type}
      className={['rds-button', 'rds-icon-button', className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
      data-state={isDisabled ? 'Disabled' : state}
      disabled={isDisabled}
      aria-label={label}
      aria-busy={isLoading || undefined}
      aria-disabled={isLoading || undefined}
      onClick={handleClick}
    >
      {isLoading ? (
        <Spinner tone={spinnerTone} size={spinnerSize} />
      ) : (
        <span className="rds-button__icon" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
}
