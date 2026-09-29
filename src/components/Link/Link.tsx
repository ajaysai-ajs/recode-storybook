import type { AnchorHTMLAttributes } from 'react';

import { EXTRA_GLYPHS } from '../Icon/icons';
import './Link.css';

/*
 * Link - built from the Figma component "RDS Link" (node 6282:143).
 * Renders a real <a href>, so it works with the keyboard, middle-click and "open in new tab".
 */

export type LinkAppearance = 'default' | 'subtle' | 'inverse';
/** `hover` and `press` only force the look for previews; real links get them from the browser. */
export type LinkState = 'default' | 'hover' | 'press';

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'target'> {
  /** Where the link goes */
  href: string;
  /** Figma: label */
  label: string;
  /** Figma: appearance. Use `inverse` on dark surfaces. */
  appearance?: LinkAppearance;
  /** Figma: state */
  state?: LinkState;
  /** Figma: target. `_blank` opens a new tab and shows the "opens in new" icon. */
  target?: '_self' | '_blank';
  /**
   * Figma: hasVisited. Browsers already colour visited links automatically; this forces the
   * visited look for previews.
   */
  hasVisited?: boolean;
}

export function Link({
  href,
  label,
  appearance = 'default',
  state = 'default',
  target = '_self',
  hasVisited = false,
  className,
  rel,
  ...rest
}: LinkProps) {
  const opensNewTab = target === '_blank';

  return (
    <a
      {...rest}
      href={href}
      target={target}
      // noopener stops the new page from controlling this one (a security best practice)
      rel={opensNewTab ? (rel ?? 'noopener noreferrer') : rel}
      className={['rds-link', className].filter(Boolean).join(' ')}
      data-appearance={appearance}
      data-state={state}
      data-visited={hasVisited || undefined}
    >
      {label}
      {opensNewTab && (
        <>
          <svg className="rds-link__icon" viewBox={EXTRA_GLYPHS.open_in_new.viewBox} aria-hidden="true" focusable="false">
            <path d={EXTRA_GLYPHS.open_in_new.d} />
          </svg>
          {/* The icon is visual only, so screen readers hear this instead */}
          <span className="rds-link__hint">(opens in a new tab)</span>
        </>
      )}
    </a>
  );
}
