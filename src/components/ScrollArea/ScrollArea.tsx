import type { CSSProperties, ReactNode } from 'react';

import './ScrollArea.css';

/*
 * Scroll Area - built from the Figma components "RDS Scroll Area" (node 6495:41) and
 * "RDS Scrollbar" (node 6493:53) on the Scroll Area page.
 *
 * Uses the browser's own scrolling (mouse wheel, touch, keyboard and screen readers all work)
 * and restyles its scrollbar to the Figma design. The scrollbar's Hover and Dragging states
 * come from the browser, so they happen automatically.
 */

/** Figma: Scroll - which way the content can scroll */
export type ScrollAreaScroll = 'Vertical' | 'Horizontal' | 'Both';

export interface ScrollAreaProps {
  /** Figma: Scroll */
  scroll?: ScrollAreaScroll;
  /** The content that scrolls */
  children: ReactNode;
  /**
   * What the scrolling region contains, e.g. "Release notes". Required: the region can be
   * focused with Tab (so keyboard users can scroll it) and needs a name when it is.
   */
  'aria-label': string;
  /** Set the size here (e.g. height), or with a class. The area scrolls when content is bigger. */
  style?: CSSProperties;
  className?: string;
}

export function ScrollArea({ scroll = 'Vertical', children, 'aria-label': ariaLabel, style, className }: ScrollAreaProps) {
  return (
    <div className={['rds-scroll-area', className].filter(Boolean).join(' ')} style={style}>
      <div
        className="rds-scroll-area__viewport"
        data-scroll={scroll}
        // Focusable, so keyboard users can scroll it with the arrow keys and Page Up/Down
        tabIndex={0}
        role="region"
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </div>
  );
}
