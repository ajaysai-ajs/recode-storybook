import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

import { addDays, addMonths, isSameDay, monthGrid, startOfDay } from './dates';
import './DatePicker.css';

/*
 * Calendar - built from the Figma components "RDS Calendar" (node 6304:763) and
 * "RDS Calendar Day" (node 6303:775) on the Date Picker page.
 *
 * Follows the accessible date-grid pattern: one Tab stop for the whole grid, then
 *   arrows = previous/next day or week,  Page Up/Down = previous/next month
 *   (with Shift: year),  Home/End = start/end of the week,  Enter/Space = pick the day.
 */

// ---- RDS Calendar Day (the Figma part) ----------------------------------------------------------

/**
 * Figma: state. In a real calendar these come from the date itself (today, selected, other
 * month) and from hovering; set it by hand only for previews. `range` is for date ranges,
 * which this single-date calendar doesn't use yet.
 */
export type CalendarDayState = 'default' | 'hover' | 'selected' | 'today' | 'range' | 'muted';

export interface CalendarDayProps {
  /** Figma: day - the number shown */
  day: string;
  /** Figma: state */
  state?: CalendarDayState;
}

/** A single day, drawn on its own (for previews). The Calendar builds its own interactive days. */
export function CalendarDay({ day, state = 'default' }: CalendarDayProps) {
  return (
    <span className="rds-calendar__day" data-state={state}>
      {day}
    </span>
  );
}

// ---- RDS Calendar -------------------------------------------------------------------------------

export interface CalendarProps {
  /** The selected date */
  value?: Date | null;
  /** Called with the day someone picks */
  onSelect: (date: Date) => void;
  /** "Today", for the outlined day. Defaults to the real today; set it to keep stories stable. */
  today?: Date;
  /** Move keyboard focus to the selected day (or today) when the calendar appears */
  autoFocus?: boolean;
}

export function Calendar({ value, onSelect, today = startOfDay(new Date()), autoFocus = false }: CalendarProps) {
  const headingId = useId();
  // The day that has keyboard focus. It also decides which month is shown.
  const [focused, setFocused] = useState<Date>(() => startOfDay(value ?? today));
  const [moveFocus, setMoveFocus] = useState(autoFocus);
  const gridRef = useRef<HTMLTableElement>(null);

  // After a key press (or on open), put keyboard focus on the focused day's button.
  useEffect(() => {
    if (!moveFocus) return;
    gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
    setMoveFocus(false);
  }, [moveFocus, focused]);

  const month = focused.getMonth();
  const weeks = monthGrid(focused.getFullYear(), month);
  const monthLabel = focused.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goTo = (date: Date) => {
    setFocused(date);
    setMoveFocus(true);
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      PageUp: () => addMonths(focused, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, event.shiftKey ? 12 : 1),
      Home: () => addDays(focused, -focused.getDay()),
      End: () => addDays(focused, 6 - focused.getDay()),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    goTo(move());
  };

  return (
    <div className="rds-calendar">
      <div className="rds-calendar__heading">
        <button type="button" className="rds-calendar__nav" aria-label="Previous month" onClick={() => setFocused(addMonths(focused, -1))}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M14.5 7L9.5 12L14.5 17" />
          </svg>
        </button>
        {/* aria-live announces the new month when it changes */}
        <h2 id={headingId} className="rds-calendar__month" aria-live="polite">
          {monthLabel}
        </h2>
        <button type="button" className="rds-calendar__nav" aria-label="Next month" onClick={() => setFocused(addMonths(focused, 1))}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M9.5 7L14.5 12L9.5 17" />
          </svg>
        </button>
      </div>

      <table ref={gridRef} className="rds-calendar__grid" role="grid" aria-labelledby={headingId} onKeyDown={onGridKeyDown}>
        <thead>
          <tr>
            {weeks[0].map((d) => (
              // Short name on screen ("Sun"), full name for screen readers ("Sunday")
              <th key={d.getDay()} scope="col" abbr={d.toLocaleDateString('en-US', { weekday: 'long' })} className="rds-calendar__weekday">
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0].toISOString()}>
              {week.map((d) => {
                const isSelected = isSameDay(d, value);
                const state: CalendarDayState = isSelected
                  ? 'selected'
                  : isSameDay(d, today)
                    ? 'today'
                    : d.getMonth() !== month
                      ? 'muted'
                      : 'default';
                return (
                  <td key={d.toISOString()} aria-selected={isSelected}>
                    <button
                      type="button"
                      className="rds-calendar__day"
                      data-state={state}
                      // Only the focused day is in the Tab order; the arrow keys reach the rest
                      tabIndex={isSameDay(d, focused) ? 0 : -1}
                      aria-label={d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      aria-current={isSameDay(d, today) ? 'date' : undefined}
                      onClick={() => {
                        setFocused(d);
                        onSelect(d);
                      }}
                    >
                      {d.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
