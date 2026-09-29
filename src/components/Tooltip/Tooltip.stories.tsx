import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../Button/Button';
import { Tooltip, type TooltipSide } from './Tooltip';

const SIDES: TooltipSide[] = ['Top', 'Bottom', 'Left', 'Right'];

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    // Room around the trigger so every side has space
    layout: 'centered',
    docs: {
      description: {
        component:
          'A tooltip is a short hint that appears when someone hovers over or tabs to an element. ' +
          'Use it to name an icon-only control or add a small clarification. Keep it to a few ' +
          'words, and never put essential information or interactive content (links, buttons) ' +
          'in a tooltip - touch users cannot hover.\n\n' +
          'It opens on hover and keyboard focus, and closes on mouse-out, blur or Escape.',
      },
    },
  },
  args: {
    label: 'Copy to clipboard',
    side: 'Top',
    children: <Button label="Copy" variant="Outline" />,
  },
  argTypes: {
    side: { control: 'inline-radio', options: SIDES },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--spacing-3xl)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover over or tab to the button to see the tooltip. */
export const Default: Story = {};

// One story per side (kept open so you can see it)
export const Top: Story = { args: { side: 'Top', open: true } };
export const Bottom: Story = { args: { side: 'Bottom', open: true } };
export const Left: Story = { args: { side: 'Left', open: true } };
export const Right: Story = { args: { side: 'Right', open: true } };

export const LongText: Story = {
  args: {
    open: true,
    label: 'Tooltips wrap once they reach the maximum width, so long hints stay readable.',
  },
};

/** Keyboard: Tab shows the tooltip, Escape hides it, and it describes the button. */
export const KeyboardSupport: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Copy' });

    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(canvas.getByRole('tooltip')).toBeVisible();
    await expect(button).toHaveAccessibleDescription('Copy to clipboard');

    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByRole('tooltip', { hidden: true })).not.toBeVisible();
  },
};
