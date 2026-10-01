import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import type { ButtonSize, ButtonState, ButtonVariant } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { Tooltip } from '../Tooltip/Tooltip';
import { IconButton } from './IconButton';

const VARIANTS: ButtonVariant[] = ['Primary', 'Secondary', 'Destructive', 'Outline', 'Ghost', 'Link'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];
const STATES: ButtonState[] = ['Default', 'Hover', 'Press', 'Focus', 'Disabled', 'Loading'];

const meta = {
  title: 'Components/Icon Button',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A square button with only an icon, for compact or repeated actions - close, edit, ' +
          'more options, toolbar controls. It has the same variants and states as Button. Only ' +
          'use it when the icon is widely understood; otherwise use a Button with a label.\n\n' +
          'The `label` is required: with no visible text it is the button\'s only name for ' +
          'screen readers. Pair it with a Tooltip showing the same text, so sighted users can ' +
          'check what an icon means.',
      },
    },
  },
  args: {
    icon: <Icon icon="clear" />,
    label: 'Close',
    variant: 'Primary',
    size: 'md',
    state: 'Default',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    state: { control: 'select', options: STATES },
    icon: { control: false },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- One story per variant ------------------------------------------------------------------

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'Secondary' } };
export const Destructive: Story = { args: { variant: 'Destructive', icon: <Icon icon="remove" />, label: 'Remove' } };
export const Outline: Story = { args: { variant: 'Outline' } };
export const Ghost: Story = { args: { variant: 'Ghost' } };
export const Link: Story = { args: { variant: 'Link' } };

// ---- States -----------------------------------------------------------------------------------

export const Hover: Story = { args: { state: 'Hover' } };
export const Press: Story = { args: { state: 'Press' } };
export const Focus: Story = { args: { state: 'Focus' } };
export const Disabled: Story = { args: { state: 'Disabled' } };
export const Loading: Story = { args: { state: 'Loading', label: 'Saving' } };

const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--gap-lg)' };

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      {SIZES.map((size) => (
        <IconButton key={size} {...args} size={size} label={`Close (${size})`} />
      ))}
    </div>
  ),
};

/** The recommended pattern: a Tooltip showing the same text as the label. */
export const WithTooltip: Story = {
  args: { variant: 'Ghost', icon: <Icon icon="unfold_more" />, label: 'Expand all' },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--spacing-3xl)' }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Tooltip label={args.label}>
      <IconButton {...args} />
    </Tooltip>
  ),
};

// ---- Every variant x state, like the Figma component page -------------------------------------

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(${STATES.length + 1}, max-content)`,
  alignItems: 'center',
  gap: 'var(--gap-lg) var(--gap-xl)',
};

export const AllVariants: Story = {
  parameters: { controls: { include: ['size'] } },
  render: (args) => (
    <div style={grid}>
      <span />
      {STATES.map((s) => (
        <strong key={s} className="paragraph-mini">{s}</strong>
      ))}
      {VARIANTS.map((variant) => (
        <div key={variant} style={{ display: 'contents' }}>
          <strong className="paragraph-mini">{variant}</strong>
          {STATES.map((state) => (
            <IconButton key={state} {...args} variant={variant} state={state} label={`${variant} ${state}`} />
          ))}
        </div>
      ))}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const NamedAndKeyboardAccessible: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Close' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Square, as in Figma
    const box = button.getBoundingClientRect();
    await expect(box.width).toBe(box.height);
  },
};

export const LoadingIgnoresClicks: Story = {
  args: { state: 'Loading', label: 'Saving' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Saving' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
