import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Calendar, CalendarDay, type CalendarDayState } from './Calendar';
import { DatePicker, type DatePickerAppearance, type DatePickerSize, type DatePickerState } from './DatePicker';

// Fixed dates so screenshots and tests don't change from day to day (the Figma example)
const TODAY = new Date(2022, 11, 20);
const EXAMPLE = new Date(2022, 11, 18);

const APPEARANCES: DatePickerAppearance[] = ['Default', 'Subtle', 'Ghost'];
const SIZES: DatePickerSize[] = ['sm', 'md', 'lg'];
// "Open" is shown in its own story: it opens a real calendar
const STATES: DatePickerState[] = ['Default', 'Hover', 'Focus', 'Typing', 'Filled', 'Error', 'Disabled'];
const DAY_STATES: CalendarDayState[] = ['default', 'hover', 'selected', 'today', 'range', 'muted'];

const narrow: CSSProperties = { width: 'var(--size-256)' };

const meta = {
  title: 'Components/Date Picker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A date field with a calendar. People can type a date (MM/DD/YYYY) or press the ' +
          'calendar button to pick one. It follows the Input API - same appearances, sizes and ' +
          'states - so it sits alongside text fields in a form. Use it for single dates that are ' +
          'near today (bookings, deadlines); for dates far away, like a birth date, typing is ' +
          'often faster than paging through months.\n\n' +
          'Keyboard: in the calendar, the arrows move by day/week, Page Up/Down by month ' +
          '(Shift for a year), Home/End to the start/end of the week, Enter picks the day and ' +
          'Escape closes it. Focus then returns to the calendar button. Give the field a visible ' +
          'label (the Field component); in these stories it is named with `aria-label`.',
      },
    },
  },
  args: {
    'aria-label': 'Start date',
    appearance: 'Default',
    size: 'md',
    state: 'Default',
    placeholder: 'Select date',
    leadingIcon: false,
    trailingIcon: true,
    today: TODAY,
    onChange: fn(),
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: APPEARANCES },
    size: { control: 'inline-radio', options: SIZES },
    state: { control: 'select', options: [...STATES, 'Open'] },
    value: { control: 'date' },
    leadingIconSlot: { control: false },
    today: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={narrow}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- One story per appearance ---------------------------------------------------------------

export const Default: Story = {};
export const Subtle: Story = { args: { appearance: 'Subtle' } };
export const Ghost: Story = { args: { appearance: 'Ghost' } };

// ---- States -----------------------------------------------------------------------------------

export const Hover: Story = { args: { state: 'Hover' } };
export const Focus: Story = { args: { state: 'Focus' } };
export const Filled: Story = { args: { state: 'Filled', defaultValue: EXAMPLE } };
export const Error: Story = { args: { state: 'Error', defaultValue: EXAMPLE } };
export const Disabled: Story = { args: { state: 'Disabled' } };
/** Opens a real calendar, attached under the field. */
export const Open: Story = {
  args: { state: 'Open', defaultValue: EXAMPLE },
  parameters: { docs: { story: { inline: false, height: '380px' } } },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      {SIZES.map((size) => (
        <DatePicker key={size} {...args} size={size} aria-label={`Size ${size}`} />
      ))}
    </div>
  ),
};

export const WithLeadingIcon: Story = { args: { leadingIcon: true } };

// ---- Every appearance x state (field only), like the Figma component page --------------------

export const AllVariants: Story = {
  parameters: { controls: { include: ['size'] } },
  decorators: [(Story) => <Story />],
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: `max-content repeat(${APPEARANCES.length}, var(--size-256))`, gap: 'var(--gap-lg) var(--gap-xl)', alignItems: 'center' }}>
      <span />
      {APPEARANCES.map((a) => (
        <strong key={a} className="paragraph-mini">{a}</strong>
      ))}
      {STATES.map((state) => (
        <div key={state} style={{ display: 'contents' }}>
          <strong className="paragraph-mini">{state}</strong>
          {APPEARANCES.map((appearance) => (
            <DatePicker
              key={appearance}
              {...args}
              appearance={appearance}
              state={state}
              defaultValue={['Typing', 'Filled', 'Error'].includes(state) ? EXAMPLE : null}
              aria-label={`${appearance} ${state}`}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

// ---- The calendar parts ---------------------------------------------------------------------------

/** "RDS Calendar" on its own, e.g. to embed inline on a page. */
export const CalendarOnly: Story = {
  decorators: [(Story) => <Story />],
  render: () => {
    const [picked, setPicked] = useState<Date | null>(EXAMPLE);
    return <Calendar value={picked} onSelect={setPicked} today={TODAY} />;
  },
};

/** "RDS Calendar Day", every state. */
export const DayStates: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-lg)' }}>
      {DAY_STATES.map((state) => (
        <div key={state} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-xs)' }}>
          <CalendarDay day="18" state={state} />
          <span className="paragraph-mini text-muted">{state}</span>
        </div>
      ))}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const TypeADate: Story = {
  play: async ({ args, canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Start date' });
    await userEvent.type(field, '3/7/2023');
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith(new Date(2023, 2, 7));
    await expect(field).toHaveValue('03/07/2023'); // tidied into MM/DD/YYYY

    // Something that isn't a real date is marked invalid instead of being accepted
    await userEvent.clear(field);
    await userEvent.type(field, '02/31/2023');
    await userEvent.tab();
    await expect(field).toBeInvalid();
  },
};

export const PickWithTheKeyboard: Story = {
  args: { defaultValue: EXAMPLE },
  play: async ({ args, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body); // the calendar opens in the top layer
    const button = within(canvasElement).getByRole('button', { name: 'Change date, 12/18/2022' });

    // Open it: focus lands on the chosen day
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    const dialog = await page.findByRole('dialog', { name: 'Choose date' });
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Sunday, December 18, 2022' })).toHaveFocus());

    // Arrow keys move by day and week; Page Down moves to the next month
    await userEvent.keyboard('{ArrowRight}');
    await expect(within(dialog).getByRole('button', { name: 'Monday, December 19, 2022' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(within(dialog).getByRole('button', { name: 'Monday, December 26, 2022' })).toHaveFocus();
    await userEvent.keyboard('{PageDown}');
    await expect(within(dialog).getByText('January 2023')).toBeInTheDocument();

    // Enter picks the day, closes the calendar and returns focus to the button
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith(new Date(2023, 0, 26));
    await expect(within(canvasElement).getByRole('textbox', { name: 'Start date' })).toHaveValue('01/26/2023');
    await waitFor(() => expect(within(canvasElement).getByRole('button', { name: 'Change date, 01/26/2023' })).toHaveFocus());
  },
};

export const EscapeCloses: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const button = within(canvasElement).getByRole('button', { name: 'Choose date' });
    await userEvent.click(button);
    await page.findByRole('dialog', { name: 'Choose date' });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'));
    await expect(button).toHaveFocus();
  },
};
