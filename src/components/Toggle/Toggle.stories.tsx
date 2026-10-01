import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Toggle, type ToggleInteraction, type ToggleState } from './Toggle';

const STATES: ToggleState[] = ['Off', 'On', 'Disabled'];
const INTERACTIONS: ToggleInteraction[] = ['Default', 'Hover', 'Focus'];

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A toggle (switch) turns a single setting on or off, and the change takes effect ' +
          'immediately - like Wi-Fi or notifications. If the choice is only applied when a form ' +
          'is submitted, use a Checkbox instead.\n\n' +
          'Every toggle needs a name: pass `label` (shown next to it) or `aria-label`. Screen ' +
          'readers announce it as a switch, and Space turns it on and off.',
      },
    },
  },
  args: {
    label: 'Notifications',
    interaction: 'Default',
    onChange: fn(),
  },
  argTypes: {
    state: { control: 'inline-radio', options: STATES },
    interaction: { control: 'inline-radio', options: INTERACTIONS },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- States (Figma: State) --------------------------------------------------------------------

export const Off: Story = { args: { state: 'Off' } };
export const On: Story = { args: { state: 'On' } };
export const Disabled: Story = { args: { state: 'Disabled' } };
/** Figma can't show this (Disabled is its own state); in code it is Disabled + defaultChecked. */
export const DisabledOn: Story = { args: { state: 'Disabled', defaultChecked: true } };

// ---- Interactions (Figma: Interaction) --------------------------------------------------------

export const Hover: Story = { args: { state: 'Off', interaction: 'Hover' } };
export const Focus: Story = { args: { state: 'On', interaction: 'Focus' } };

/** Without a visible label - the name comes from `aria-label`. */
export const WithoutLabel: Story = { args: { label: undefined, 'aria-label': 'Dark mode', state: 'Off' } };

// ---- All 9 variants, like the Figma component page --------------------------------------------

export const AllVariants: Story = {
  parameters: { controls: { include: [] } },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: 'var(--gap-xl) var(--gap-2xl)', alignItems: 'center' }}>
      <span />
      {STATES.map((s) => (
        <strong key={s} className="paragraph-mini">{s}</strong>
      ))}
      {INTERACTIONS.map((interaction) => (
        <div key={interaction} style={{ display: 'contents' }}>
          <strong className="paragraph-mini">{interaction}</strong>
          {STATES.map((state) => (
            <Toggle key={state} onChange={args.onChange} state={state} interaction={interaction} aria-label={`${state} ${interaction}`} />
          ))}
        </div>
      ))}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

/** A working toggle controlled by the page, as you'd use it in an app. */
export const Controlled: Story = {
  render: () => {
    const [on, setOn] = useState(false);
    return <Toggle label="Wi-Fi" state={on ? 'On' : 'Off'} onChange={(e) => setOn(e.target.checked)} />;
  },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch', { name: 'Wi-Fi' });
    await expect(toggle).not.toBeChecked();

    await userEvent.click(within(canvasElement).getByText('Wi-Fi')); // clicking the label works
    await expect(toggle).toBeChecked();

    await userEvent.keyboard(' '); // Space turns it off again
    await expect(toggle).not.toBeChecked();

    // Keyboard focus shows exactly one ring
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await expect(getComputedStyle(toggle).outlineStyle).toBe('solid');
    await expect(getComputedStyle(toggle).boxShadow).toBe('none');
  },
};

export const DisabledCannotBeToggled: Story = {
  args: { state: 'Disabled', label: 'Locked setting', onChange: undefined },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch', { name: 'Locked setting' });
    await expect(toggle).toBeDisabled();
    await userEvent.click(toggle);
    await expect(toggle).not.toBeChecked();
  },
};
