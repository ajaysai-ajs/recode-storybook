import type { ReactNode } from 'react';

import './Banner.css';

/*
 * Banner - built from the Figma component "RDS Banner" (Banner page, node 6275:48).
 * A full-width strip at the top of a page or section with one short message about the whole
 * product or page: a warning, an error, or an announcement.
 */

export type BannerAppearance = 'warning' | 'error' | 'announcement';

export interface BannerProps {
  /** Figma: message */
  message: ReactNode;
  /** Figma: appearance */
  appearance?: BannerAppearance;
  /**
   * Figma: showIcon. Warning and error show their status icon by default. Announcement has no
   * icon in Figma, so it only shows one if you pass `iconSlot`.
   */
  showIcon?: boolean;
  /** Figma: iconSlot - replaces the default icon, e.g. <Icon icon="check" /> */
  iconSlot?: ReactNode;
  className?: string;
}

export function Banner({ message, appearance = 'warning', showIcon = true, iconSlot, className }: BannerProps) {
  // Announcement has no default icon, so without an iconSlot it shows none
  const icon = iconSlot ?? (appearance === 'announcement' ? null : <DefaultIcon appearance={appearance} />);

  return (
    <div
      className={['rds-banner', className].filter(Boolean).join(' ')}
      data-appearance={appearance}
      // Warnings and errors interrupt screen readers; announcements wait for a pause
      role={appearance === 'announcement' ? 'status' : 'alert'}
    >
      {showIcon && icon && (
        <span className="rds-banner__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <p className="rds-banner__message">{message}</p>
    </div>
  );
}

/**
 * The status icons from the Figma usage example (Material "warning" and "error"), drawn in
 * the banner's text colour.
 */
function DefaultIcon({ appearance }: { appearance: 'warning' | 'error' }) {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path
        d={
          appearance === 'warning'
            ? 'M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z'
            : 'M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z'
        }
      />
    </svg>
  );
}
