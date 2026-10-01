import { useEffect, useRef, useState, type MouseEventHandler } from 'react';

import './Breadcrumb.css';

/*
 * Breadcrumb - built from the Figma component "Breadcrumb Item" (Breadcrumb page, node 3756:131).
 * Figma has only the single item; `Breadcrumb` below assembles items into a trail the way the
 * item's description describes (links, then the current page, "…" for collapsed hops).
 */

// ---- Breadcrumb Item ---------------------------------------------------------------------------

/** Link = a page above this one, Current = the page you are on, Ellipsis = collapsed hops */
export type BreadcrumbVariant = 'Link' | 'Current' | 'Ellipsis';
/** Only forces the look for previews; real links get hover from the browser. */
export type BreadcrumbState = 'Default' | 'Hover';

export interface BreadcrumbItemProps {
  /** Figma: Label */
  label: string;
  /** Figma: Variant */
  variant?: BreadcrumbVariant;
  /** Figma: State */
  state?: BreadcrumbState;
  /** Figma: Separator - the chevron after the item. Turn it off on the last item. */
  separator?: boolean;
  /** Where a Link goes */
  href?: string;
  /** What the Ellipsis does when pressed (usually: show the hidden hops) */
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

/** One hop in the trail. Renders an <li>, so place it inside a list (Breadcrumb does this). */
export function BreadcrumbItem({ label, variant = 'Link', state = 'Default', separator = true, href, onClick }: BreadcrumbItemProps) {
  return (
    <li className="rds-breadcrumb__item" data-variant={variant} data-state={state}>
      {variant === 'Link' && (
        <a className="rds-breadcrumb__link" href={href}>
          {label}
        </a>
      )}

      {/* The current page is plain text, marked as "current page" for screen readers */}
      {variant === 'Current' && (
        <span className="rds-breadcrumb__current" aria-current="page">
          {label}
        </span>
      )}

      {/* The ellipsis is a button: pressing it reveals the hops it stands for */}
      {variant === 'Ellipsis' && (
        <button type="button" className="rds-breadcrumb__ellipsis" aria-label={label} onClick={onClick}>
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <circle cx="3.333" cy="8" r="0.667" />
            <circle cx="8" cy="8" r="0.667" />
            <circle cx="12.667" cy="8" r="0.667" />
          </svg>
        </button>
      )}

      {/* The chevron is decoration - the list structure already tells screen readers the order */}
      {separator && (
        <svg className="rds-breadcrumb__separator" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M6 12L10 8L6 4" />
        </svg>
      )}
    </li>
  );
}

// ---- Breadcrumb (the assembled trail) -----------------------------------------------------------

export interface BreadcrumbLink {
  label: string;
  href: string;
}

export interface BreadcrumbProps {
  /** The trail from the top level down to the current page. The last one is the current page. */
  items: BreadcrumbLink[];
  /**
   * When there are more items than this, the middle ones collapse into "…" (the first and last
   * stay visible). Pressing "…" shows them all.
   */
  maxItems?: number;
  /** Name of the navigation landmark for screen readers */
  'aria-label'?: string;
  className?: string;
}

export function Breadcrumb({ items, maxItems = 5, 'aria-label': ariaLabel = 'Breadcrumb', className }: BreadcrumbProps) {
  const [expanded, setExpanded] = useState(false);
  const collapse = !expanded && items.length > maxItems;

  // Pressing "…" removes it, so move keyboard focus to the first link it revealed
  // (otherwise focus would jump back to the top of the page).
  const listRef = useRef<HTMLOListElement>(null);
  const [focusRevealed, setFocusRevealed] = useState(false);
  useEffect(() => {
    if (!focusRevealed) return;
    listRef.current?.querySelectorAll('a')[1]?.focus();
    setFocusRevealed(false);
  }, [focusRevealed]);

  // Keep the first item and the last two (parent + current page); hide the rest behind "…"
  const visible = collapse ? [items[0], null, ...items.slice(-2)] : items;

  return (
    // A <nav> landmark lets screen reader users jump straight to the trail
    <nav className={['rds-breadcrumb', className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      <ol ref={listRef} className="rds-breadcrumb__list">
        {visible.map((item, index) => {
          const isLast = index === visible.length - 1;
          if (item === null) {
            return (
              <BreadcrumbItem
                key="ellipsis"
                variant="Ellipsis"
                label={`Show ${items.length - 3} more breadcrumbs`}
                onClick={() => {
                  setExpanded(true);
                  setFocusRevealed(true);
                }}
              />
            );
          }
          return (
            <BreadcrumbItem
              key={item.href}
              label={item.label}
              href={item.href}
              variant={isLast ? 'Current' : 'Link'}
              separator={!isLast}
            />
          );
        })}
      </ol>
    </nav>
  );
}
