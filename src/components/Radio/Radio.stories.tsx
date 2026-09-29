import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Radio, type RadioState } from './Radio';

const STATES: RadioState[] = ['default', 'hover', 'press', 'focus'];

const meta = {
  title: 'Components/Radio',
  component: Radio,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Radios let people pick exactly one option from a short list (about 2-6 options) where ' +
          'all choices should stay visible. For many options use a Select; to pick several, use ' +
          'Checkbox; for an on/off setting, use Toggle.\n\n' +
          'Give all radios in a group the same `name` and wrap them in a `<fieldset>` with a ' +
          '`<legend>` that asks the question. The browser then handles the keyboard: Tab moves ' +
          'into the group, the arrow keys move between options and select them.',
      },
    },
  },
  args: {
    label: 'Label',
    name: 'example',
    isRequired: false,
    state: 'default',
    isInvalid: false,
    isDisabled: false,
    onChange: fn(),
  },
  argTypes: {
    state: { control: 'inline-radio', options: STATES },
    isSelected: { control: 'boolean' },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- Selection ------------------------------------------------------------------------------

export const Unselected: Story = { args: { isSelected: false } };
export const Selected: Story = { args: { isSelected: true } };
export const Required: Story = { args: { isRequired: true } };

// ---- States -----------------------------------------------------------------------------------

export const Hover: Story = { args: { state: 'hover' } };
export const Press: Story = { args: { state: 'press' } };
export const Focus: Story = { args: { state: 'focus' } };
export const Invalid: Story = { args: { isInvalid: true } };
export const Disabled: Story = { args: { isDisabled: true } };
export const DisabledSelected: Story = { args: { isDisabled: true, isSelected: true } };

/** The Figma "Radio item": just the circle. It needs an `aria-label` instead of a visible label. */
export const ItemOnly: Story = { args: { label: undefined, 'aria-label': 'Choose this plan' } };

// ---- All 18 variants, like the Figma component page -------------------------------------------

export const AllVariants: Story = {
  parameters: { controls: { include: ['label', 'isRequired'] } },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, max-content)', gap: 'var(--gap-lg) var(--gap-xl)', alignItems: 'center' }}>
      <span />
      {[...STATES, 'disabled'].map((s) => (
        <strong key={s} className="paragraph-mini">{s}</strong>
      ))}
      {[false, true].flatMap((isInvalid) =>
        [false, true].map((isSelected) => (
          <div key={`${isSelected}-${isInvalid}`} style={{ display: 'contents' }}>
            <strong className="paragraph-mini">
              {isSelected ? 'selected' : 'unselected'}
              {isInvalid ? ' + invalid' : ''}
            </strong>
            {/* Each radio gets its own name so they can all show as selected at once */}
            {STATES.map((state) => (
              <Radio key={state} {...args} name={`grid-${state}-${isSelected}-${isInvalid}`} state={state} isSelected={isSelected} isInvalid={isInvalid} />
            ))}
            {/* Disabled exists only for valid radios in Figma */}
            {isInvalid ? <span /> : <Radio {...args} name={`grid-disabled-${isSelected}`} isSelected={isSelected} isDisabled />}
          </div>
        )),
      )}
    </div>
  ),
};

// ---- A real group -----------------------------------------------------------------------------

const fieldset: CSSProperties = { display: 'flex', flexDirection: 'column', margin: 0, padding: 0, border: 0 };
const legend: CSSProperties = { padding: 0, marginBlockEnd: 'var(--spacing-2xs)' };

/** How to use radios: a fieldset + legend, one shared name, and the arrow keys to move. */
export const Group: Story = {
  render: () => {
    const [plan, setPlan] = useState('monthly');
    return (
      <fieldset style={fieldset}>
        <legend className="paragraph-small paragraph-medium" style={legend}>
          Billing period
        </legend>
        {['monthly', 'yearly', 'lifetime'].map((value) => (
          <Radio
            key={value}
            name="billing"
            value={value}
            label={value[0].toUpperCase() + value.slice(1)}
            isSelected={plan === value}
            onChange={() => setPlan(value)}
          />
        ))}
      </fieldset>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const monthly = canvas.getByRole('radio', { name: 'Monthly' });

    await userEvent.tab(); // Tab goes to the selected option
    await expect(monthly).toHaveFocus();
    // Regression test: only the radio's own ring, no extra shadow ring
    await expect(getComputedStyle(monthly).boxShadow).toBe('none');

    await userEvent.keyboard('{ArrowDown}'); // arrow keys move and select
    const yearly = canvas.getByRole('radio', { name: 'Yearly' });
    await expect(yearly).toHaveFocus();
    await expect(yearly).toBeChecked();
    await expect(monthly).not.toBeChecked();

    await userEvent.click(canvas.getByText('Lifetime')); // clicking a label selects it
    await expect(canvas.getByRole('radio', { name: 'Lifetime' })).toBeChecked();

    await expect(canvas.getByRole('group', { name: 'Billing period' })).toBeInTheDocument();
  },
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const RequiredAndInvalidAreAnnounced: Story = {
  args: { isRequired: true, isInvalid: true, label: 'Standard delivery' },
  play: async ({ canvasElement }) => {
    const radio = within(canvasElement).getByRole('radio', { name: 'Standard delivery' });
    await expect(radio).toBeRequired();
    await expect(radio).toBeInvalid();
  },
};

export const DisabledCannotBeSelected: Story = {
  args: { isDisabled: true, label: 'Sold out', onChange: undefined },
  play: async ({ canvasElement }) => {
    const radio = within(canvasElement).getByRole('radio', { name: 'Sold out' });
    await userEvent.click(radio);
    await expect(radio).not.toBeChecked();
  },
};
