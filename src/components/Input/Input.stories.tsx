import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Icon } from '../Icon/Icon';
import { Input, type InputAppearance, type InputSize, type InputState } from './Input';

const APPEARANCES: InputAppearance[] = ['Default', 'Subtle', 'Ghost'];
const SIZES: InputSize[] = ['sm', 'md', 'lg'];
const STATES: InputState[] = ['Default', 'Hover', 'Focus', 'Typing', 'Filled', 'Error', 'Disabled'];

/** As in Figma: empty states show the placeholder, the others show a value. */
const showsValue = (state: InputState) => state === 'Typing' || state === 'Filled' || state === 'Error';

// Inputs fill their container; this gives the stories the Figma width.
const narrow: CSSProperties = { width: 'var(--size-256)' };

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A single-line text field. Use **Default** in forms, **Subtle** on busy or tinted ' +
          'surfaces where a filled field reads better, and **Ghost** inline (e.g. an editable ' +
          'title) where the field should blend in until focused. Sizes match Button, so a field ' +
          'and the button next to it line up.\n\n' +
          'Always give an input a visible label (use the Field component) - a placeholder is ' +
          'only a hint and disappears as you type. In these stories the fields are named with ' +
          '`aria-label` because there is no label around them. Never signal an error with colour ' +
          'alone: show a message too.',
      },
    },
  },
  args: {
    'aria-label': 'Example field',
    appearance: 'Default',
    size: 'md',
    state: 'Default',
    placeholder: 'Placeholder',
    leadingIcon: false,
    trailingIcon: false,
    onChange: fn(),
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: APPEARANCES },
    size: { control: 'inline-radio', options: SIZES },
    state: { control: 'select', options: STATES },
    leadingIconSlot: { control: false },
    trailingIconSlot: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={narrow}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

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

// ---- Sizes and icons --------------------------------------------------------------------------

const stack: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' };

export const Sizes: Story = {
  render: (args) => (
    <div style={stack}>
      {SIZES.map((size) => (
        <Input key={size} {...args} size={size} aria-label={`Size ${size}`} placeholder={`Size ${size}`} />
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    leadingIcon: true,
    trailingIcon: true,
    leadingIconSlot: <Icon icon="unfold_more" />,
    trailingIconSlot: <Icon icon="clear" />,
    placeholder: 'Search',
    'aria-label': 'Search',
  },
};

/** Without a slot, the Figma placeholder glyph is shown. */
export const PlaceholderIcons: Story = { args: { leadingIcon: true, trailingIcon: true } };

// ---- Every appearance x state, like the Figma component page ----------------------------------

export const AllVariants: Story = {
  parameters: { controls: { include: ['size', 'leadingIcon', 'trailingIcon'] } },
  decorators: [(Story) => <Story />], // no narrow wrapper; the grid sets widths
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
            <Input
              key={appearance}
              {...args}
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
  args: { 'aria-label': 'Name', onChange: undefined },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Name' });
    await userEvent.click(input);
    await expect(input).toHaveFocus();
    await userEvent.type(input, 'Ada Lovelace');
    await expect(input).toHaveValue('Ada Lovelace');
  },
};

/** Regression test: focus shows ONE ring (on the box), never a second one on the inner field. */
export const OneFocusRing: Story = {
  args: { 'aria-label': 'Name', onChange: undefined },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Name' });
    await userEvent.click(input);
    const inner = getComputedStyle(input);
    await expect(inner.outlineStyle).toBe('none');
    await expect(inner.boxShadow).toBe('none');
    await expect(getComputedStyle(canvasElement.querySelector('.rds-input') as HTMLElement).outlineStyle).toBe('solid');
  },
};

export const ClickingThePaddingFocuses: Story = {
  args: { 'aria-label': 'Search', leadingIcon: true, leadingIconSlot: <Icon icon="unfold_more" />, onChange: undefined },
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.rds-input') as HTMLElement;
    await userEvent.click(box.querySelector('.rds-input__icon') as HTMLElement);
    await expect(within(canvasElement).getByRole('textbox', { name: 'Search' })).toHaveFocus();
  },
};

export const ErrorIsAnnounced: Story = {
  args: { state: 'Error', value: 'not-an-email', 'aria-label': 'Email' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox', { name: 'Email' })).toBeInvalid();
  },
};

export const DisabledCannotBeEdited: Story = {
  args: { state: 'Disabled', 'aria-label': 'Locked', onChange: undefined },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Locked' });
    await expect(input).toBeDisabled();
    await userEvent.type(input, 'abc');
    await expect(input).toHaveValue('');
  },
};
