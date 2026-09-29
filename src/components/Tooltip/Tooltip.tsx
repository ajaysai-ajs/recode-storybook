import { cloneElement, isValidElement, useEffect, useId, useState, type ReactElement, type ReactNode } from 'react';

import './Tooltip.css';

/*
 * Tooltip - built from the Figma component "Tooltip" (node 3741:66).
 * Wraps a trigger (usually a button). Shows on hover and on keyboard focus, hides on
 * mouse-out, blur or Escape - so keyboard and mouse users both get it.
 */

export type TooltipSide = 'Top' | 'Bottom' | 'Left' | 'Right';

export interface TooltipProps {
  /** Figma: Label - the tooltip text */
  label: string;
  /** Figma: Side - where the tooltip appears relative to the trigger */
  side?: TooltipSide;
  /** The element the tooltip describes, e.g. a Button */
  children: ReactNode;
  /** Keep the tooltip open (for previews). Leave it out for normal hover/focus behaviour. */
  open?: boolean;
}

export function Tooltip({ label, side = 'Top', children, open }: TooltipProps) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const isOpen = open ?? shown;

  // Escape closes the tooltip without moving focus away (WCAG "dismissible" content).
  useEffect(() => {
    if (!shown) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShown(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shown]);

  // Link the trigger to the tooltip text so screen readers read it as a description.
  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, { 'aria-describedby': id })
    : children;

  return (
    <span
      className="rds-tooltip"
      onMouseEnter={() => setShown(true)}
      onMouseLeave={() => setShown(false)}
      onFocus={() => setShown(true)}
      onBlur={() => setShown(false)}
    >
      {trigger}
      <span role="tooltip" id={id} className="rds-tooltip__bubble" data-side={side} hidden={!isOpen}>
        {label}
      </span>
    </span>
  );
}
