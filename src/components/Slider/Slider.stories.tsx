import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { Field } from '../Field/Field';
import { Slider, type SliderState } from './Slider';

const STATES: SliderState[] = ['Default', 'Hover', 'Focus', 'Disabled'];

const meta = {
  title: 'Components/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A slider lets people pick a value from a range by dragging the thumb - volume, ' +
          'brightness, a price limit. Use it when the exact number matters less than the ' +
          'feel of "more or less"; when people need an exact value, use an Input (or show ' +
          'the value next to the slider).\n\n' +
          'Keyboard: Tab to the thumb, then the arrow keys move it by `step`, Page Up / Page ' +
          'Down by bigger steps, and Home / End jump to the ends. Every slider needs a name: ' +
          'put it in a **Field** (which adds a visible label), or give it `aria-label`. If the ' +
          'number alone is unclear, add `aria-valuetext` (e.g. "40 percent").',
      },
    },
  },
  args: {
    state: 'Default',
    defaultValue: 40,
    min: 0,
    max: 100,
    step: 1,
    'aria-label': 'Volume',
    onChange: fn(),
  },
  argTypes: {
    state: { control: 'inline-radio', options: STATES },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- One story per state (Figma: State) -------------------------------------------------------

export const Default: Story = {};
export const Hover: Story = { args: { state: 'Hover' } };
export const Focus: Story = { args: { state: 'Focus' } };
export const Disabled: Story = { args: { state: 'Disabled' } };

// ---- Labels, values, ranges -------------------------------------------------------------------

/** In a Field: a visible label that names the slider. */
export const WithLabel: Story = {
  args: { 'aria-label': undefined },
  render: (args) => (
    <Field label="Volume" message="Drag, or use the arrow keys">
      <Slider {...args} />
    </Field>
  ),
};

/** Showing the value next to the slider; your code controls the value. */
export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = useState(40);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-lg)' }}>
        <Slider {...args} value={value} aria-valuetext={`${value} percent`} onChange={(e) => setValue(Number(e.target.value))} />
        <output className="paragraph-small" aria-hidden="true">{value}%</output>
      </div>
    );
  },
};

/** Any range and step: here 0-10 in steps of 0.5. */
export const CustomRangeAndStep: Story = { args: { min: 0, max: 10, step: 0.5, defaultValue: 6.5, 'aria-label': 'Rating' } };

/** Sliders fill whatever width you give them (Figma's default is 192px). */
export const FullWidth: Story = { args: { style: { width: '100%' } } };

// ---- All states, like the Figma component page ------------------------------------------------

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'max-content max-content',
  alignItems: 'center',
  gap: 'var(--gap-xl) var(--gap-2xl)',
};

export const AllVariants: Story = {
  render: (args) => (
    <div style={grid}>
      {STATES.map((state) => (
        <div key={state} style={{ display: 'contents' }}>
          <strong className="paragraph-mini">{state}</strong>
          <Slider {...args} state={state} aria-label={`Volume (${state})`} />
        </div>
      ))}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

/*
 * Note: the arrow keys, Page Up/Down and Home/End are handled by the browser itself. The
 * test tool's simulated key presses don't trigger that, so these tests set the value the way
 * the browser does after a key press. (Real key presses were checked in a real browser.)
 */

export const ReachableByKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider', { name: 'Volume' });
    await userEvent.tab();
    await expect(slider).toHaveFocus();
    // Screen readers read the value and the range from these
    await expect(slider).toHaveValue('40');
    await expect(slider).toHaveAttribute('min', '0');
    await expect(slider).toHaveAttribute('max', '100');
    await expect(slider).toHaveAttribute('step', '1');
  },
};

export const FillFollowsTheValue: Story = {
  play: async ({ args, canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider');
    // The filled part is painted from --_ratio (0 to 1)
    await expect(slider.style.getPropertyValue('--_ratio')).toBe('0.4');
    fireEvent.change(slider, { target: { value: '100' } });
    await expect(slider.style.getPropertyValue('--_ratio')).toBe('1');
    fireEvent.change(slider, { target: { value: '25' } });
    await expect(slider.style.getPropertyValue('--_ratio')).toBe('0.25');
    await expect(args.onChange).toHaveBeenCalledTimes(2);
  },
};

export const NamedByItsField: Story = {
  args: { 'aria-label': undefined },
  render: WithLabel.render,
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider', { name: 'Volume' });
    await expect(slider).toHaveAccessibleDescription('Drag, or use the arrow keys');
  },
};

export const DisabledCannotMove: Story = {
  args: { state: 'Disabled' },
  play: async ({ args, canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider');
    await expect(slider).toBeDisabled();
    await userEvent.tab();
    await expect(slider).not.toHaveFocus();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
