import {
  Children,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import './Resizable.css';

/*
 * Resizable - built from the Figma component "Resizable" (Resizable page, node 3827:70).
 * Two panels with a handle between them that people can drag to share out the space.
 *
 * The handle is a focusable "separator" (the WAI-ARIA window splitter pattern), so it also
 * works from the keyboard: arrow keys move it, Home / End jump to the limits, and Enter
 * collapses the first panel (when collapsible) and brings it back.
 */

export type ResizableOrientation = 'Horizontal' | 'Vertical';
/** Only forces the look for previews; real handles get this from the browser. */
export type ResizableState = 'Idle' | 'Hover';

export interface ResizableProps {
  /** The two panels, in order. Anything can go inside. */
  children: [ReactNode, ReactNode];
  /** Figma: Orientation - Horizontal puts the panels side by side, Vertical stacks them */
  orientation?: ResizableOrientation;
  /** Figma: State */
  state?: ResizableState;
  /** The first panel's size, in % of the whole, when your code controls it */
  size?: number;
  /** The first panel's starting size in %, when the component manages itself */
  defaultSize?: number;
  /** The first panel can't get smaller than this (in %). Never let a panel shrink to nothing. */
  minSize?: number;
  /** The first panel can't get bigger than this (in %), so the second keeps some room too */
  maxSize?: number;
  /** How far one arrow key press moves the handle (in %) */
  keyboardStep?: number;
  /** Allow Enter on the handle to collapse the first panel to 0 (Enter again restores it) */
  isCollapsible?: boolean;
  /** Called with the first panel's new size (in %) */
  onSizeChange?: (size: number) => void;
  /** Names the handle for screen readers */
  handleLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const round = (value: number) => Math.round(value * 10) / 10; // one decimal is plenty

export function Resizable({
  children,
  orientation = 'Horizontal',
  state = 'Idle',
  size,
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  keyboardStep = 5,
  isCollapsible = false,
  onSizeChange,
  handleLabel = 'Resize panels',
  className,
  style,
}: ResizableProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const firstId = useId();
  const [ownSize, setOwnSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  // The size before collapsing, so Enter can bring the panel back
  const restoreRef = useRef(defaultSize);

  const current = size ?? ownSize;
  const isHorizontal = orientation === 'Horizontal';
  const isCollapsed = isCollapsible && current === 0;
  const [first, second] = Children.toArray(children);

  const update = (next: number) => {
    const value = round(next);
    if (value === current) return;
    setOwnSize(value);
    onSizeChange?.(value);
  };
  const resizeTo = (next: number) => update(clamp(next, minSize, maxSize));

  // ---- Dragging with a mouse, pen or finger ----
  // Pointer capture keeps the drag going even if the pointer leaves the handle
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault(); // don't select text while dragging
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // The browser refuses capture for a pointer that isn't really pressed; dragging still works
    }
    event.currentTarget.focus();
    setIsDragging(true);
  };
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !rootRef.current) return;
    const box = rootRef.current.getBoundingClientRect();
    const ratio = isHorizontal ? (event.clientX - box.left) / box.width : (event.clientY - box.top) / box.height;
    resizeTo(ratio * 100);
  };
  const stopDragging = () => setIsDragging(false);

  // ---- Keyboard ----
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Left/Up make the first panel smaller, Right/Down make it bigger
    const smaller = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const bigger = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const from = isCollapsed ? minSize : current;
    let handled = true;
    if (event.key === smaller) resizeTo(from - keyboardStep);
    else if (event.key === bigger) resizeTo(from + keyboardStep);
    else if (event.key === 'Home') resizeTo(minSize);
    else if (event.key === 'End') resizeTo(maxSize);
    else if (event.key === 'Enter' && isCollapsible) {
      if (isCollapsed) update(restoreRef.current);
      else {
        restoreRef.current = current;
        update(0);
      }
    } else handled = false;
    if (handled) event.preventDefault(); // stop arrow keys from scrolling the page
  };

  return (
    <div
      ref={rootRef}
      className={['rds-resizable', className].filter(Boolean).join(' ')}
      data-orientation={orientation}
      data-dragging={isDragging || undefined}
      style={style}
    >
      <div
        id={firstId}
        className="rds-resizable__panel"
        // The first panel's share of the space; the second panel takes the rest
        style={{ flexBasis: `${current}%` }}
        hidden={isCollapsed || undefined}
      >
        {first}
      </div>

      <div
        className="rds-resizable__handle"
        data-state={isDragging ? 'Hover' : state}
        role="separator"
        tabIndex={0}
        aria-label={handleLabel}
        // A side-by-side split has an upright handle, and the other way round
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        aria-controls={firstId}
        aria-valuenow={current}
        aria-valuemin={isCollapsible ? 0 : minSize}
        aria-valuemax={maxSize}
        aria-valuetext={isCollapsed ? 'Collapsed' : `${Math.round(current)}%`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onKeyDown={handleKeyDown}
      >
        <span className="rds-resizable__line" aria-hidden="true" />
        <span className="rds-resizable__grip" aria-hidden="true" />
      </div>

      <div className="rds-resizable__panel" data-grow>
        {second}
      </div>
    </div>
  );
}
