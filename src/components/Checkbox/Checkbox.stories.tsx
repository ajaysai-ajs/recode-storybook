import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Checkbox, type CheckboxState } from './Checkbox';

const STATES: CheckboxState[] = ['default', 'hover', 'press', 'focus'];
const MARKS = [
  { name: 'unchecked', isChecked: false, isIndeterminate: false },
  { name: 'checked', isChecked: true, isIndeterminate: false },
  { name: 'indeterminate', isChecked: false, isIndeterminate: true },
];

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Checkboxes let people pick any number of options from a list, or turn a single ' +
          'setting on or off in a form that is saved later. Use **indeterminate** on a "select ' +
          'all" checkbox when only some of its items are selected. For a setting that applies ' +
          'immediately, use a Toggle; to pick exactly one option, use Radio.\n\n' +
          'It is a real checkbox: Space toggles it, clicking the label toggles it, and screen ' +
          'readers announce checked, mixed, required and invalid. Mark `isInvalid` together ' +
          'with an error message - never with colour alone.',
      },
    },
  },
  args: {
    label: 'Label',
    isRequired: false,
    state: 'default',
    isIndeterminate: false,
    isInvalid: false,
    isDisabled: false,
    onChange: fn(),
  },
  argTypes: {
    state: { control: 'inline-radio', options: STATES },
    isChecked: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- Marks ------------------------------------------------------------------------------------

export const Unchecked: Story = { args: { isChecked: false } };
export const Checked: Story = { args: { isChecked: true } };
export const Indeterminate: Story = { args: { isIndeterminate: true } };
export const Required: Story = { args: { isRequired: true } };

// ---- States -----------------------------------------------------------------------------------

export const Hover: Story = { args: { state: 'hover' } };
export const Press: Story = { args: { state: 'press' } };
export const Focus: Story = { args: { state: 'focus' } };
export const Invalid: Story = { args: { isInvalid: true, label: 'I accept the terms' } };
export const Disabled: Story = { args: { isDisabled: true } };
export const DisabledChecked: Story = { args: { isDisabled: true, isChecked: true } };

/** The Figma "Checkbox item": just the box. It needs an `aria-label` instead of a visible label. */
export const ItemOnly: Story = { args: { label: undefined, 'aria-label': 'Select row' } };

// ---- All 27 variants, like the Figma component page -------------------------------------------

export const AllVariants: Story = {
  parameters: { controls: { include: ['label', 'isRequired'] } },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, max-content)', gap: 'var(--gap-lg) var(--gap-xl)', alignItems: 'center' }}>
      <span />
      {[...STATES, 'disabled'].map((s) => (
        <strong key={s} className="paragraph-mini">{s}</strong>
      ))}
      {[false, true].flatMap((isInvalid) =>
        MARKS.map((mark) => (
          <div key={`${mark.name}-${isInvalid}`} style={{ display: 'contents' }}>
            <strong className="paragraph-mini">
              {mark.name}
              {isInvalid ? ' + invalid' : ''}
            </strong>
            {STATES.map((state) => (
              <Checkbox
                key={state}
                {...args}
                {...mark}
                state={state}
                isInvalid={isInvalid}
                aria-label={args.label ? undefined : `${mark.name} ${state}`}
              />
            ))}
            {/* Disabled exists only for valid checkboxes in Figma */}
            {isInvalid ? <span /> : <Checkbox {...args} {...mark} isDisabled />}
          </div>
        )),
      )}
    </div>
  ),
};

/** A "select all" checkbox that shows indeterminate when only some items are ticked. */
export const SelectAll: Story = {
  render: () => {
    const [items, setItems] = useState({ Email: true, SMS: false, Push: false });
    const values = Object.values(items);
    const all = values.every(Boolean);
    const some = values.some(Boolean) && !all;
    const setAll = (on: boolean) => setItems({ Email: on, SMS: on, Push: on });
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xs)' }}>
        <Checkbox label="All notifications" isChecked={all} isIndeterminate={some} onChange={() => setAll(!all)} />
        <div style={{ display: 'flex', flexDirection: 'column', paddingInlineStart: 'var(--padding-xl)' }}>
          {Object.entries(items).map(([name, on]) => (
            <Checkbox key={name} label={name} isChecked={on} onChange={() => setItems({ ...items, [name]: !on })} />
          ))}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole('checkbox', { name: 'All notifications' });
    await expect(all).toBePartiallyChecked(); // announced as "mixed"
    await userEvent.click(all);
    await expect(canvas.getByRole('checkbox', { name: 'SMS' })).toBeChecked();
  },
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const KeyboardAndLabel: Story = {
  args: { label: 'Subscribe', onChange: undefined, defaultChecked: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox', { name: 'Subscribe' });

    await userEvent.click(canvas.getByText('Subscribe')); // clicking the label toggles it
    await expect(box).toBeChecked();

    await userEvent.keyboard(' '); // Space toggles the focused checkbox
    await expect(box).not.toBeChecked();

    // Regression test: keyboard focus shows only the checkbox's own ring, no extra shadow ring
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await expect(getComputedStyle(box).boxShadow).toBe('none');
  },
};

export const RequiredAndInvalidAreAnnounced: Story = {
  args: { label: 'I accept the terms', isRequired: true, isInvalid: true },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox', { name: 'I accept the terms' });
    await expect(box).toBeRequired();
    await expect(box).toBeInvalid();
  },
};

export const DisabledCannotBeToggled: Story = {
  args: { label: 'Locked', isDisabled: true, onChange: undefined, defaultChecked: false },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox', { name: 'Locked' });
    await userEvent.click(box);
    await expect(box).not.toBeChecked();
  },
};
