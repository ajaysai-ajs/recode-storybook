import { useState, type ChangeEvent, type CSSProperties, type InputHTMLAttributes } from 'react';

import './Slider.css';

/*
 * Slider - built from the Figma component "Slider" (Slider page, node 3776:58).
 * Pick a value from a range by dragging the thumb.
 *
 * It is a real <input type="range">, restyled, so the browser gives us everything a slider
 * needs: drag or click the track, arrow keys to step, Page Up / Page Down for bigger steps,
 * Home / End for the ends, and screen readers announce "slider, 40".
 */

/**
 * Figma: State. `Disabled` blocks interaction. `Hover` and `Focus` only force the look for
 * previews; real sliders get them from the browser.
 */
export type SliderState = 'Default' | 'Hover' | 'Focus' | 'Disabled';

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'disabled'> {
  /** Figma: State */
  state?: SliderState;
  /** The value, when your code controls it (update it in onChange) */
  value?: number;
  /** The starting value, when the slider manages itself */
  defaultValue?: number;
  /** Lowest value (default 0) */
  min?: number;
  /** Highest value (default 100) */
  max?: number;
  /** How much one arrow key press moves it (default 1) */
  step?: number;
}

export function Slider({
  state = 'Default',
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
  style,
  ...rest
}: SliderProps) {
  // We need the current value to paint the filled part of the track
  const [ownValue, setOwnValue] = useState(defaultValue ?? min);
  const current = value ?? ownValue;
  const ratio = max > min ? (Math.min(max, Math.max(min, current)) - min) / (max - min) : 0;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOwnValue(Number(event.target.value));
    onChange?.(event);
  };

  const isDisabled = state === 'Disabled';

  return (
    <input
      {...rest}
      type="range"
      className={['rds-slider', className].filter(Boolean).join(' ')}
      data-state={state}
      min={min}
      max={max}
      step={step}
      // Only pass `value` when the parent controls it, otherwise the slider would be stuck
      value={value}
      defaultValue={value === undefined ? (defaultValue ?? min) : undefined}
      disabled={isDisabled}
      onChange={handleChange}
      // How far along the thumb is (0 to 1); the CSS uses it to fill the track up to the thumb
      style={{ ...style, '--_ratio': ratio } as CSSProperties}
    />
  );
}
