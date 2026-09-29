import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button, type ButtonSize, type ButtonState, type ButtonVariant } from './Button';

const VARIANTS: ButtonVariant[] = ['Primary', 'Secondary', 'Destructive', 'Outline', 'Ghost', 'Link'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];
const STATES: ButtonState[] = ['Default', 'Hover', 'Press', 'Focus', 'Disabled', 'Loading'];

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        // From the Figma component description
        component:
          'Buttons trigger an action or navigation. Use **Primary** for the single highest-emphasis ' +
          'action in a view, **Secondary** for supporting actions, **Outline** and **Ghost** for ' +
          'low-emphasis or toolbar contexts, **Destructive** for irreversible actions, and **Link** ' +
          'for inline navigation.\n\n' +
          'Props match the Figma component properties. `State` = Hover, Press and Focus only force ' +
          'the look for previews; real buttons get those states from the browser automatically.',
      },
    },
  },
  args: {
    label: 'Button',
    variant: 'Primary',
    size: 'md',
    state: 'Default',
    leadingIcon: false,
    trailingIcon: false,
    onClick: fn(), // records clicks in the Actions panel
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    state: { control: 'select', options: STATES },
    icon: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- One story per variant ------------------------------------------------------------------

export const Primary: Story = { args: { variant: 'Primary' } };
export const Secondary: Story = { args: { variant: 'Secondary' } };
export const Destructive: Story = { args: { variant: 'Destructive' } };
export const Outline: Story = { args: { variant: 'Outline' } };
export const Ghost: Story = { args: { variant: 'Ghost' } };
export const Link: Story = { args: { variant: 'Link' } };

// ---- States -----------------------------------------------------------------------------------

export const Default: Story = { args: { state: 'Default' } };
export const Hover: Story = { args: { state: 'Hover' } };
export const Press: Story = { args: { state: 'Press' } };
export const Focus: Story = { args: { state: 'Focus' } };
export const Disabled: Story = { args: { state: 'Disabled' } };
export const Loading: Story = { args: { state: 'Loading', label: 'Saving' } };

// ---- Sizes and icons --------------------------------------------------------------------------

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--gap-lg)' };

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      {SIZES.map((size) => (
        <Button key={size} {...args} size={size} label={`Size ${size}`} />
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} leadingIcon label="Leading icon" />
      <Button {...args} trailingIcon label="Trailing icon" />
      <Button {...args} leadingIcon trailingIcon label="Both icons" />
    </div>
  ),
};

// ---- Every variant x state, like the Figma component page -------------------------------------

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(${STATES.length + 1}, max-content)`, // label column + one per state
  alignItems: 'center',
  gap: 'var(--gap-xl)',
};

export const AllVariants: Story = {
  parameters: { controls: { include: ['size', 'label', 'leadingIcon', 'trailingIcon'] } },
  render: (args) => (
    <div style={grid}>
      <span />
      {STATES.map((state) => (
        <strong key={state} className="paragraph-mini">{state}</strong>
      ))}
      {VARIANTS.map((variant) => (
        <div key={variant} style={{ display: 'contents' }}>
          <strong className="paragraph-mini">{variant}</strong>
          {STATES.map((state) => (
            <Button key={state} {...args} variant={variant} state={state} />
          ))}
        </div>
      ))}
    </div>
  ),
};

// ---- Behaviour tests (run in the Storybook "Interactions" panel and with Vitest) ---------------

export const KeyboardSupport: Story = {
  args: { label: 'Press me' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Press me' });

    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const LoadingIgnoresClicks: Story = {
  args: { state: 'Loading', label: 'Saving' },
  play: async ({ args, canvasElement }) => {
    // The label is hidden visually but still gives the button its accessible name
    const button = within(canvasElement).getByRole('button', { name: 'Saving' });
    await expect(button).toHaveAttribute('aria-busy', 'true');

    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
