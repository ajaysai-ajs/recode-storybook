import {
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type ToggleEvent,
} from 'react';

import { Calendar } from './Calendar';
import { formatDate, parseDate } from './dates';
import './DatePicker.css';

/*
 * Date Picker - built from the Figma component "Date Picker" (node 6397:1910), with the
 * "RDS Calendar" part as its pop-up.
 *
 * People can type a date (MM/DD/YYYY) or press the calendar button to pick one. The calendar
 * opens in the browser's popover layer, so it always sits above the page; Escape or a click
 * outside closes it and returns focus to the button.
 */

export type DatePickerAppearance = 'Default' | 'Subtle' | 'Ghost';
export type DatePickerSize = 'sm' | 'md' | 'lg';
/**
 * `Open`, `Error` and `Disabled` change behaviour (Open shows the calendar). `Hover`, `Focus`
 * and `Typing` only force the look for previews. `Filled` is simply a picker with a value.
 */
export type DatePickerState = 'Default' | 'Hover' | 'Focus' | 'Open' | 'Typing' | 'Filled' | 'Error' | 'Disabled';

export interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'type'> {
  /** Figma: Appearance */
  appearance?: DatePickerAppearance;
  /** Figma: Size */
  size?: DatePickerSize;
  /** Figma: State */
  state?: DatePickerState;
  /** Figma: Placeholder */
  placeholder?: string;
  /** Figma: Value - the chosen date. Set it with `onChange` when your code controls it. */
  value?: Date | null;
  /** The date to start with, when the picker manages itself */
  defaultValue?: Date | null;
  /** Called with the new date, or null when the field is cleared */
  onChange?: (date: Date | null) => void;
  /** Figma: Leading Icon */
  leadingIcon?: boolean;
  /** Figma: Trailing Icon - the calendar button. On by default, as in Figma. */
  trailingIcon?: boolean;
  /** The icon for the leading slot. Defaults to the calendar glyph Figma uses. */
  leadingIconSlot?: ReactNode;
  /** "Today", for the outlined day in the calendar. Set it to keep stories and tests stable. */
  today?: Date;
  /** Class for the outer wrapper */
  className?: string;
}

export function DatePicker({
  appearance = 'Default',
  size = 'md',
  state = 'Default',
  placeholder = 'Select date',
  value,
  defaultValue = null,
  onChange,
  leadingIcon = false,
  trailingIcon = true,
  leadingIconSlot,
  today,
  disabled,
  className,
  'aria-invalid': ariaInvalid,
  ...inputProps
}: DatePickerProps) {
  const popoverId = useId();
  const fieldRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // The date (controlled by the parent when `value` is given, otherwise kept here)
  const [ownDate, setOwnDate] = useState<Date | null>(defaultValue);
  const date = value !== undefined ? value : ownDate;

  // What's typed in the field. Kept separately so half-typed dates aren't thrown away.
  const [text, setText] = useState(date ? formatDate(date) : '');
  const [typedInvalid, setTypedInvalid] = useState(false);
  const [open, setOpen] = useState(false);

  // When the date changes from outside (or from the calendar), show it in the field
  useEffect(() => {
    setText(date ? formatDate(date) : '');
    setTypedInvalid(false);
  }, [date]);

  const isDisabled = disabled || state === 'Disabled';
  const isInvalid = state === 'Error' || typedInvalid || ariaInvalid === true || ariaInvalid === 'true';

  const commit = (next: Date | null) => {
    if (value === undefined) setOwnDate(next);
    onChange?.(next);
  };

  // Typed text is checked when the field loses focus or Enter is pressed
  const commitText = () => {
    if (text.trim() === '') return commit(null);
    const parsed = parseDate(text);
    if (parsed) commit(parsed);
    else setTypedInvalid(true);
  };

  // Place the calendar under the field. It lives in the top layer, so it is positioned
  // against the window using the field's current position on screen.
  const place = () => {
    const field = fieldRef.current?.getBoundingClientRect();
    const popover = popoverRef.current;
    if (!field || !popover) return;
    popover.style.top = `${field.bottom}px`;
    popover.style.left = `${field.left}px`;
  };

  const onToggle = (event: ToggleEvent<HTMLDivElement>) => {
    const isOpen = event.newState === 'open';
    setOpen(isOpen);
    if (isOpen) place();
  };

  // Keep the calendar attached to the field while the page scrolls or resizes
  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  // The forced "Open" state (for previews) opens the calendar on first render
  useEffect(() => {
    if (state === 'Open' && !isDisabled) popoverRef.current?.showPopover();
  }, [state, isDisabled]);

  return (
    <div className={['rds-date-picker', className].filter(Boolean).join(' ')}>
      <div
        ref={fieldRef}
        className="rds-date-picker__field"
        data-appearance={appearance}
        data-size={size}
        data-state={isDisabled ? 'Disabled' : open ? 'Open' : state}
        data-invalid={isInvalid || undefined}
      >
        {leadingIcon && (
          <span className="rds-date-picker__icon" aria-hidden="true">
            {leadingIconSlot ?? <CalendarGlyph />}
          </span>
        )}
        <input
          {...inputProps}
          className="rds-date-picker__control"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          value={text}
          disabled={isDisabled}
          aria-invalid={isInvalid || undefined}
          onChange={(e) => {
            setText(e.target.value);
            setTypedInvalid(false);
          }}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitText();
          }}
        />
        {trailingIcon && (
          // Opens and closes the calendar. popoverTarget lets the browser handle the toggling,
          // Escape and clicking outside.
          <button
            type="button"
            className="rds-date-picker__button"
            popoverTarget={popoverId}
            disabled={isDisabled}
            aria-label={date ? `Change date, ${formatDate(date)}` : 'Choose date'}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <CalendarGlyph />
          </button>
        )}
      </div>

      <div
        ref={popoverRef}
        id={popoverId}
        className="rds-date-picker__popover"
        popover="auto"
        role="dialog"
        aria-label="Choose date"
        onToggle={onToggle}
        // Browsers close popovers on Escape by themselves; handling it here too makes sure it
        // always works (and returns focus to the calendar button).
        onKeyDown={(e) => {
          if (e.key === 'Escape') popoverRef.current?.hidePopover();
        }}
      >
        {/* Only rendered while open, so it starts on the chosen month each time */}
        {open && (
          <Calendar
            value={date}
            today={today}
            autoFocus
            onSelect={(picked) => {
              commit(picked);
              popoverRef.current?.hidePopover();
            }}
          />
        )}
      </div>
    </div>
  );
}

/** Material "calendar_today", the glyph Figma uses in the Date Picker (16x16). */
function CalendarGlyph() {
  return (
    <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
      <path d="M13.3333 2H12.6667V0.666667H11.3333V2H4.66667V0.666667H3.33333V2H2.66667C1.93333 2 1.33333 2.6 1.33333 3.33333V14C1.33333 14.7333 1.93333 15.3333 2.66667 15.3333H13.3333C14.0667 15.3333 14.6667 14.7333 14.6667 14V3.33333C14.6667 2.6 14.0667 2 13.3333 2ZM13.3333 14H2.66667V6.66667H13.3333V14ZM13.3333 5.33333H2.66667V3.33333H13.3333V5.33333Z" />
    </svg>
  );
}
