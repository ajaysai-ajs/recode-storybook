import type { HTMLAttributes } from 'react';

import './Blanket.css';

/*
 * Blanket - built from the Figma component "Blanket" (node 6351:62).
 * The dimmed layer between a modal (Dialog, Alert Dialog, Drawer) and the page. It covers the
 * whole viewport. Place the modal as a sibling after it, not inside it (as Figma describes).
 */

export type BlanketProps = HTMLAttributes<HTMLDivElement>;

export function Blanket({ className, ...rest }: BlanketProps) {
  return (
    <div
      {...rest}
      className={['rds-blanket', className].filter(Boolean).join(' ')}
      // Purely visual: screen readers should skip it and go to the dialog.
      aria-hidden="true"
    />
  );
}
