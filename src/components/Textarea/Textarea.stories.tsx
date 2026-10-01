import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Textarea, type TextareaAppearance, type TextareaState } from './Textarea';

const APPEARANCES: TextareaAppearance[] = ['Default', 'Subtle', 'Ghost'];
const STATES: TextareaState[] = ['Default', 'Hover', 'Focus', 'Typing', 'Filled', 'Error', 'Disabled'];

/** As in Figma: empty states show the placeholder, the others show a value. */
const showsValue = (state: TextareaState) => state === 'Typing' || state === 'Filled' || state === 'Error';

const wide: CSSProperties = { width: 'var(--size-384)' };

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A multi-line text field for longer answers - comments, descriptions, messages. For a ' +
          'single line (a name, an email) use Input. Use **Default** in forms, **Subtle** on ' +
          'tinted surfaces, and **Ghost** for inline editing where the field should blend in.\n\n' +
          'People can drag the bottom-right corner to make it taller. Always give it a visible ' +
          'label (use the Field component); in these stories it is named with `aria-label`. ' +
          'Never signal an error with colour alone: show a message too.',
      },
    },
  },
  args: {
    'aria-label': 'Comment',
    appearance: 'Default',
    state: 'Default',
    placeholder: 'Placeholder',
    rows: 4,
    onChange: fn(),
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: APPEARANCES },
    state: { control: 'select', options: STATES },
  },
  decorators: [
    (Story) => (
      <div style={wide}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- One story per appearance ---------------------------------------------------------------

export const Default: Story = {};
export const Subtle: Story = { args: { appearance: 'Subtle' } };
export const Ghost: Story = { args: { appearance: 'Ghost' } };

// ---- States -----------------------------------------------------------------------------------

export const Hover: Story = { args: { state: 'Hover' } };
export const Focus: Story = { args: { state: 'Focus' } };
export const Typing: Story = { args: { state: 'Typing', value: 'Value' } };
export const Filled: Story = { args: { state: 'Filled', value: 'Value' } };
export const Error: Story = { args: { state: 'Error', value: 'Value' } };
export const Disabled: Story = { args: { state: 'Disabled' } };

// ---- Every appearance x state, like the Figma component page ----------------------------------

export const AllVariants: Story = {
  parameters: { controls: { include: ['rows'] } },
  decorators: [(Story) => <Story />], // no wrapper; the grid sets widths
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: `max-content repeat(${APPEARANCES.length}, var(--size-256))`, gap: 'var(--gap-lg) var(--gap-xl)', alignItems: 'start' }}>
      <span />
      {APPEARANCES.map((a) => (
        <strong key={a} className="paragraph-mini">{a}</strong>
      ))}
      {STATES.map((state) => (
        <div key={state} style={{ display: 'contents' }}>
          <strong className="paragraph-mini">{state}</strong>
          {APPEARANCES.map((appearance) => (
            <Textarea
              key={appearance}
              {...args}
              rows={3}
              appearance={appearance}
              state={state}
              value={showsValue(state) ? 'Value' : undefined}
              aria-label={`${appearance} ${state}`}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const TypingWorks: Story = {
  args: { 'aria-label': 'Message', onChange: undefined },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox', { name: 'Message' });
    await userEvent.click(box);
    await userEvent.type(box, 'First line{Enter}Second line');
    await expect(box).toHaveValue('First line\nSecond line');

    // Focus shows one ring (drawn inside the box), never a second shadow ring
    await expect(getComputedStyle(box).outlineStyle).toBe('solid');
    await expect(getComputedStyle(box).boxShadow).toBe('none');
  },
};

export const GhostFocusIsVisible: Story = {
  args: { appearance: 'Ghost', 'aria-label': 'Notes', onChange: undefined },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox', { name: 'Notes' });
    await userEvent.click(box);
    await expect(getComputedStyle(box).outlineStyle).toBe('solid');
  },
};

export const ErrorIsAnnounced: Story = {
  args: { state: 'Error', value: 'Too short', 'aria-label': 'Description' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox', { name: 'Description' })).toBeInvalid();
  },
};

export const DisabledCannotBeEdited: Story = {
  args: { state: 'Disabled', 'aria-label': 'Locked', onChange: undefined },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('textbox', { name: 'Locked' });
    await expect(box).toBeDisabled();
    await userEvent.type(box, 'abc');
    await expect(box).toHaveValue('');
  },
};
