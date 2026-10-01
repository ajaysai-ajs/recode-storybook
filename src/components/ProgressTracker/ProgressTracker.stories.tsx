import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ProgressTrackerItem, type ProgressTrackerItemState, type ProgressTrackerItemStatus } from './ProgressTracker';

const ITEMS: ProgressTrackerItemStatus[] = ['visited', 'current', 'unvisited', 'disabled'];
const STATES: ProgressTrackerItemState[] = ['default', 'hover', 'press', 'focused'];

// An item is as wide as its container; Figma draws it 160 wide
const itemWidth: CSSProperties = { width: 'var(--size-192)' };

const meta = {
  title: 'Components/Progress Tracker Item',
  component: ProgressTrackerItem,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A progress tracker item is one named step of a short, linear flow - a sign-up, a ' +
          'checkout, a setup wizard. Its bar and label show where the step is: **visited** ' +
          '(finished, blue bar), **current** (blue bar and a heavier label), **unvisited** ' +
          '(still to come, grey) or **disabled**. Set **start** on the first step so its bar ' +
          'has rounded ends; the others are square on the left, so the bars read as one track.\n\n' +
          'An item becomes a link or button only when you give it `href` or `onClick` - usually ' +
          'just the finished steps, so people can go back. Screen readers hear the step\'s ' +
          'status before its label, e.g. "Completed: Research", and the current step is marked ' +
          'as the current one.',
      },
    },
  },
  args: {
    label: 'Step',
    item: 'current',
    state: 'default',
    start: false,
  },
  argTypes: {
    item: { control: 'inline-radio', options: ITEMS },
    state: { control: 'inline-radio', options: STATES },
    href: { control: 'text' },
    onClick: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={itemWidth}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressTrackerItem>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- One story per item (Figma: item) ---------------------------------------------------------

export const Visited: Story = { args: { item: 'visited' } };
export const Current: Story = { args: { item: 'current' } };
export const Unvisited: Story = { args: { item: 'unvisited' } };
export const Disabled: Story = { args: { item: 'disabled' } };

// ---- States (Figma: state) - forced looks, shown on a visited step -----------------------------

export const Hover: Story = { args: { item: 'visited', state: 'hover' } };
export const Press: Story = { args: { item: 'visited', state: 'press' } };
export const Focused: Story = { args: { item: 'visited', state: 'focused' } };

// ---- start ------------------------------------------------------------------------------------

/** The first step: its bar is rounded on both ends. */
export const Start: Story = { args: { item: 'visited', start: true } };

// ---- Clickable ----------------------------------------------------------------------------------

/** With onClick the step is a button (e.g. to go back to a finished step). */
export const AsButton: Story = { args: { item: 'visited', label: 'Research', onClick: fn() } };

/** With href the step is a link. */
export const AsLink: Story = { args: { item: 'visited', label: 'Research', href: '#research' } };

// ---- Every item x state, like the Figma component page ------------------------------------------

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `max-content repeat(${STATES.length}, var(--size-192))`,
  alignItems: 'center',
  gap: 'var(--gap-lg)',
};

export const AllVariants: Story = {
  parameters: { controls: { include: ['label'] } },
  decorators: [(Story) => <Story />],
  render: (args) => (
    <div style={grid}>
      <span />
      {STATES.map((state) => (
        <strong key={state} className="paragraph-mini">{state}</strong>
      ))}
      {ITEMS.map((item) => (
        <div key={item} style={{ display: 'contents' }}>
          <strong className="paragraph-mini">{item}</strong>
          {STATES.map((state) =>
            // Disabled has the default state only, as in Figma
            item === 'disabled' && state !== 'default' ? (
              <span key={state} />
            ) : (
              <ProgressTrackerItem key={state} label={args.label} item={item} state={state} />
            ),
          )}
        </div>
      ))}
      <strong className="paragraph-mini">start</strong>
      {ITEMS.map((item) => (
        <ProgressTrackerItem key={item} label={`${args.label} (${item})`} item={item} start />
      ))}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const ItemTellsItsStatus: Story = {
  args: { item: 'current', label: 'Build' },
  play: async ({ canvasElement }) => {
    // Marked as the current step, with its status read before the label
    const step = canvasElement.querySelector('[aria-current="step"]');
    await expect(step).toHaveTextContent('Current: Build');
    // Without href or onClick it is plain text, not a button
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

export const ClickableItem: Story = {
  args: { item: 'visited', label: 'Research', onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Completed: Research' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const LinkItem: Story = {
  args: { item: 'visited', label: 'Research', href: '#research' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'Completed: Research' })).toHaveAttribute('href', '#research');
  },
};

export const DisabledItemCannotBeUsed: Story = {
  args: { item: 'disabled', label: 'Design', onClick: fn() },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Unavailable: Design' })).toBeDisabled();
  },
};
