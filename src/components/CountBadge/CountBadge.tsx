import './CountBadge.css';

/*
 * CountBadge - built from the Figma component "RDS Count Badge" (node 6251:31463).
 * A small number pill. It is not clickable on its own; it reacts to hover/press when it sits
 * inside something clickable (a tab, a button, a link).
 */

export type CountBadgeAppearance =
  | 'neutral'
  | 'danger'
  | 'warning'
  | 'success'
  | 'information'
  | 'discovery'
  | 'inverse';
/** `Hover` and `Press` only force the look for previews. */
export type CountBadgeState = 'Default' | 'Hover' | 'Press';

export interface CountBadgeProps {
  /** Figma: count */
  count: string;
  /** Figma: appearance */
  appearance?: CountBadgeAppearance;
  /** Figma: state */
  state?: CountBadgeState;
  /**
   * What the number means, for screen readers, e.g. "unread messages". A bare "25" is
   * ambiguous when heard out of context.
   */
  label?: string;
  className?: string;
}

export function CountBadge({ count, appearance = 'neutral', state = 'Default', label, className }: CountBadgeProps) {
  return (
    <span
      className={['rds-count-badge', className].filter(Boolean).join(' ')}
      data-appearance={appearance}
      data-state={state}
    >
      {count}
      {label && <span className="rds-count-badge__label"> {label}</span>}
    </span>
  );
}
