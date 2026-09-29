import type { ReactNode } from 'react';

import { CountBadge } from '../CountBadge/CountBadge';
import './Badge.css';

/*
 * Badge - built from the Figma component "RDS Badge" (node 6256:31654).
 * A static label that shows a status or category. Not interactive.
 */

export type BadgeAppearance =
  | 'neutral'
  | 'danger'
  | 'warning'
  | 'success'
  | 'information'
  | 'discovery'
  | 'accent-gray'
  | 'accent-red'
  | 'accent-orange'
  | 'accent-yellow'
  | 'accent-lime'
  | 'accent-green'
  | 'accent-teal'
  | 'accent-blue'
  | 'accent-purple'
  | 'accent-magenta';
export type BadgeSpacing = 'default' | 'spacious';

export interface BadgeProps {
  /** Figma: label */
  label: string;
  /** Figma: appearance */
  appearance?: BadgeAppearance;
  /** Figma: spacing */
  spacing?: BadgeSpacing;
  /** Figma: showIcon - show the icon slot before the label (needs `iconSlot`) */
  showIcon?: boolean;
  /** Figma: iconSlot - the icon to show, e.g. <Icon icon="check" /> */
  iconSlot?: ReactNode;
  /** Figma: showBadge - show a neutral count badge after the label (needs `count`) */
  showBadge?: boolean;
  /**
   * The number in the count badge. Not a property in Figma (the nested badge always says "25"),
   * but code needs a real value.
   */
  count?: string;
  className?: string;
}

export function Badge({
  label,
  appearance = 'neutral',
  spacing = 'default',
  showIcon = true,
  iconSlot,
  showBadge = false,
  count,
  className,
}: BadgeProps) {
  return (
    <span
      className={['rds-badge', className].filter(Boolean).join(' ')}
      data-appearance={appearance}
      data-spacing={spacing}
    >
      {/* Figma shows a pink placeholder square here; in code the slot only appears with a real icon. */}
      {showIcon && iconSlot && (
        <span className="rds-badge__icon" aria-hidden="true">
          {iconSlot}
        </span>
      )}
      <span className="rds-badge__label">{label}</span>
      {/* As in Figma, the nested count badge is always the neutral appearance */}
      {showBadge && count && <CountBadge count={count} appearance="neutral" />}
    </span>
  );
}
