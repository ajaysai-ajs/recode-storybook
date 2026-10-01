import type { MouseEvent } from 'react';

import './ProgressTracker.css';

/*
 * Progress tracker - built from the Figma components on the Progress tracker page:
 *   "Progress tracker item" (node 6385:107) - one labelled step (the part)
 *   "Progress tracker"      (node 6385:33457) - the row of steps
 * Shows the named steps of a short, linear flow and which one the person is on.
 * It is an ordered list (<ol>), so screen readers announce "step 2 of 5".
 */

export type ProgressTrackerItemStatus = 'visited' | 'current' | 'unvisited' | 'disabled';
/** Only forces the look for previews; real steps get these from the browser. */
export type ProgressTrackerItemState = 'default' | 'hover' | 'press' | 'focused';
export type ProgressTrackerSpacing = 'comfortable' | 'cozy' | 'compact';

// Read by screen readers before each label, because the bar colour alone isn't enough
const STATUS_TEXT: Record<ProgressTrackerItemStatus, string> = {
  visited: 'Completed: ',
  current: 'Current: ',
  unvisited: 'Not started: ',
  disabled: 'Unavailable: ',
};

// ---- Progress tracker item (the part) -------------------------------------------------------

export interface ProgressTrackerItemProps {
  /** Figma: label */
  label: string;
  /** Figma: item - where this step is in the flow */
  item?: ProgressTrackerItemStatus;
  /** Figma: state */
  state?: ProgressTrackerItemState;
  /** Figma: start - the first step, whose bar has rounded ends on both sides */
  start?: boolean;
  /** Makes the step a link (e.g. back to a finished step) */
  href?: string;
  /** Makes the step a button */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export function ProgressTrackerItem({
  label,
  item = 'unvisited',
  state = 'default',
  start = false,
  href,
  onClick,
}: ProgressTrackerItemProps) {
  const isDisabled = item === 'disabled';
  const common = {
    className: 'rds-progress-tracker__item',
    'data-item': item,
    // A disabled step can't be hovered, pressed or focused (as in Figma)
    'data-state': isDisabled ? 'default' : state,
    'data-start': start || undefined,
    // Tells screen readers which step the person is on
    'aria-current': item === 'current' ? ('step' as const) : undefined,
  };
  const content = (
    <>
      <span className="rds-progress-tracker__label">
        <span className="rds-progress-tracker__status">{STATUS_TEXT[item]}</span>
        {label}
      </span>
      <span className="rds-progress-tracker__bar" aria-hidden="true" />
    </>
  );

  // Only steps you can go to are links or buttons; the rest are plain text.
  // A disabled step with onClick stays a (disabled) button, so it is still announced.
  if (href && !isDisabled) {
    return (
      <a {...common} href={href} onClick={onClick}>
        {content}
      </a>
    );
  }
  if (onClick) {
    return (
      <button {...common} type="button" disabled={isDisabled} onClick={onClick}>
        {content}
      </button>
    );
  }
  return <div {...common}>{content}</div>;
}

// ---- Progress tracker (the row) -------------------------------------------------------------

export interface ProgressTrackerStep {
  label: string;
  /** Set to override where this step is, e.g. 'disabled'. Otherwise it follows currentStep. */
  item?: ProgressTrackerItemStatus;
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export interface ProgressTrackerProps {
  /** The steps, in order */
  steps: ProgressTrackerStep[];
  /** Which step the person is on (0 = the first). Earlier steps are visited, later ones unvisited. */
  currentStep?: number;
  /** Figma: spacing - the gap between steps */
  spacing?: ProgressTrackerSpacing;
  /** Names the list for screen readers */
  label?: string;
  className?: string;
}

export function ProgressTracker({
  steps,
  currentStep = 0,
  spacing = 'cozy',
  label = 'Progress',
  className,
}: ProgressTrackerProps) {
  const statusOf = (index: number): ProgressTrackerItemStatus =>
    index < currentStep ? 'visited' : index === currentStep ? 'current' : 'unvisited';

  return (
    <ol
      className={['rds-progress-tracker', className].filter(Boolean).join(' ')}
      data-spacing={spacing}
      aria-label={label}
    >
      {steps.map((step, index) => (
        <li key={`${index}-${step.label}`} className="rds-progress-tracker__step">
          <ProgressTrackerItem
            label={step.label}
            item={step.item ?? statusOf(index)}
            start={index === 0}
            href={step.href}
            onClick={step.onClick}
          />
        </li>
      ))}
    </ol>
  );
}
