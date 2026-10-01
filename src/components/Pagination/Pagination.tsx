import type { ButtonHTMLAttributes } from 'react';

import { Icon } from '../Icon/Icon';
import './Pagination.css';

/*
 * Pagination - built from the Figma components on the Pagination page:
 *   "Pagination Page"      (node 6425:791)  one numbered page
 *   "Pagination Navigator" (node 6425:832)  the previous / next arrows
 *   "Pagination Ellipsis"  (node 6425:833)  the "…" for skipped pages
 *   "Pagination"           (node 6420:8215) the assembled bar
 * The three parts are exported too, in case a screen needs a custom arrangement.
 */

// ---- Pagination Page ---------------------------------------------------------------------------

/** `Selected` and `Disabled` change behaviour; `Hover`, `Press` and `Focus` only force the look. */
export type PaginationPageState = 'Default' | 'Hover' | 'Press' | 'Focus' | 'Selected' | 'Disabled';

export interface PaginationPageProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Figma: Label - the page number */
  label: string;
  /** Figma: State */
  state?: PaginationPageState;
}

export function PaginationPage({ label, state = 'Default', className, ...rest }: PaginationPageProps) {
  const isSelected = state === 'Selected';
  return (
    <button
      type="button"
      {...rest}
      className={['rds-pagination__item', 'rds-pagination__page', className].filter(Boolean).join(' ')}
      data-state={state}
      disabled={state === 'Disabled'}
      // Screen readers hear "Page 3" and, for the current one, "current page"
      aria-label={rest['aria-label'] ?? `Page ${label}`}
      aria-current={isSelected ? 'page' : undefined}
    >
      {label}
    </button>
  );
}

// ---- Pagination Navigator ----------------------------------------------------------------------

export type PaginationDirection = 'Previous' | 'Next';
/** `Disabled` changes behaviour; `Hover`, `Press` and `Focus` only force the look. */
export type PaginationNavigatorState = 'Default' | 'Hover' | 'Press' | 'Focus' | 'Disabled';

export interface PaginationNavigatorProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Figma: Direction */
  direction: PaginationDirection;
  /** Figma: Label. Shown when `showLabel` is on; always used as the name for screen readers. */
  label?: string;
  /** Figma: Show label - off for icon-only arrows */
  showLabel?: boolean;
  /** Figma: State */
  state?: PaginationNavigatorState;
}

export function PaginationNavigator({
  direction,
  label = direction,
  showLabel = false,
  state = 'Default',
  className,
  ...rest
}: PaginationNavigatorProps) {
  const chevron = <Icon icon={direction === 'Previous' ? 'chevron_left' : 'chevron_right'} />;
  return (
    <button
      type="button"
      {...rest}
      className={['rds-pagination__item', 'rds-pagination__navigator', className].filter(Boolean).join(' ')}
      data-state={state}
      disabled={state === 'Disabled'}
      // Icon-only arrows still need a name: "Previous page" / "Next page"
      aria-label={showLabel ? undefined : `${label} page`}
    >
      {/* As in Figma: the chevron points away from the label */}
      {direction === 'Previous' && chevron}
      {showLabel && <span>{label}</span>}
      {direction === 'Next' && chevron}
    </button>
  );
}

// ---- Pagination Ellipsis -----------------------------------------------------------------------

/** Not interactive, so it has no states (as in Figma). Hidden from screen readers. */
export function PaginationEllipsis() {
  return (
    <span className="rds-pagination__item rds-pagination__ellipsis" aria-hidden="true">
      …
    </span>
  );
}

// ---- Pagination (the assembled bar) -------------------------------------------------------------

export interface PaginationProps {
  /** The page being shown, starting at 1 */
  currentPage: number;
  /** How many pages there are in total */
  totalPages: number;
  /** Called with the new page number when someone picks a page or an arrow */
  onPageChange: (page: number) => void;
  /** How many pages to show on each side of the current one before collapsing into "…" */
  siblingCount?: number;
  /** Show "Previous" / "Next" text next to the arrows (Figma: Show label) */
  showLabels?: boolean;
  /** Name of the navigation landmark for screen readers */
  'aria-label'?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showLabels = false,
  'aria-label': ariaLabel = 'Pagination',
  className,
}: PaginationProps) {
  const items = getPageItems(currentPage, totalPages, siblingCount);

  return (
    // A <nav> landmark lets screen reader users jump straight to the pagination
    <nav className={['rds-pagination', className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      <ul className="rds-pagination__list">
        <li>
          <PaginationNavigator
            direction="Previous"
            showLabel={showLabels}
            state={currentPage <= 1 ? 'Disabled' : 'Default'}
            onClick={() => onPageChange(currentPage - 1)}
          />
        </li>
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <li key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </li>
          ) : (
            <li key={item}>
              <PaginationPage
                label={String(item)}
                state={item === currentPage ? 'Selected' : 'Default'}
                onClick={() => onPageChange(item)}
              />
            </li>
          ),
        )}
        <li>
          <PaginationNavigator
            direction="Next"
            showLabel={showLabels}
            state={currentPage >= totalPages ? 'Disabled' : 'Default'}
            onClick={() => onPageChange(currentPage + 1)}
          />
        </li>
      </ul>
    </nav>
  );
}

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * Works out which page numbers to show, following the Figma arrangement:
 * first page, (leading …), pages around the current one, (trailing …), last page.
 *
 * The bar always has the same number of slots, so it doesn't change width as you page:
 *   20 pages, siblingCount 1:  page 1 -> 1 2 3 4 5 … 20   page 10 -> 1 … 9 10 11 … 20
 */
export function getPageItems(currentPage: number, totalPages: number, siblingCount = 1): (number | 'ellipsis')[] {
  // first + last + current + siblings on both sides + two ellipsis slots
  const slots = siblingCount * 2 + 5;
  if (totalPages <= slots) return range(1, totalPages);

  // The run of pages around the current one, pushed away from the ends so it never
  // overlaps page 1 or the last page (and an ellipsis never hides just one page).
  const start = Math.max(Math.min(currentPage - siblingCount, totalPages - siblingCount * 2 - 2), 3);
  const end = Math.min(Math.max(currentPage + siblingCount, siblingCount * 2 + 3), totalPages - 2);

  return [
    1,
    start > 3 ? 'ellipsis' : 2, // leading ellipsis, or page 2 when nothing is skipped
    ...range(start, end),
    end < totalPages - 2 ? 'ellipsis' : totalPages - 1, // trailing ellipsis, or the second-last page
    totalPages,
  ];
}
