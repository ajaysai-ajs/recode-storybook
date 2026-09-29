import './Spinner.css';

/*
 * Spinner - built from the Figma component "Spinner" (node 3653:46).
 * A 2px track ring with an arc that turns. Same shape at every size, as in Figma.
 */

export type SpinnerSize = 'sm' | 'md' | 'lg';
/** Brand on neutral surfaces, Neutral inside neutral controls, On brand on coloured fills. */
export type SpinnerTone = 'Brand' | 'Neutral' | 'On brand';

export interface SpinnerProps {
  /** Figma: Size */
  size?: SpinnerSize;
  /** Figma: Tone */
  tone?: SpinnerTone;
  /**
   * What is loading, for screen readers. Set it when the spinner is on its own; leave it out
   * when it sits inside a control that already says it is busy (e.g. a loading Button).
   */
  label?: string;
  className?: string;
}

export function Spinner({ size = 'md', tone = 'Brand', label, className }: SpinnerProps) {
  return (
    <svg
      className={['rds-spinner', className].filter(Boolean).join(' ')}
      data-size={size}
      data-tone={tone}
      viewBox="0 0 16 16"
      focusable="false"
      // With a label it announces itself as a status ("Loading results"); without one it is decoration.
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle className="rds-spinner__track" cx="8" cy="8" r="7" />
      {/* pathLength="100" lets us describe the arc in percent: the Figma arc covers ~42% of the ring. */}
      <circle
        className="rds-spinner__indicator"
        cx="8"
        cy="8"
        r="7"
        pathLength="100"
        strokeDasharray="42 100"
        transform="rotate(-90 8 8)"
      />
    </svg>
  );
}
