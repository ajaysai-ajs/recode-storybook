import type { Meta, StoryObj } from '@storybook/react-vite';

import { CountBadge, type CountBadgeAppearance, type CountBadgeState } from './CountBadge';

const APPEARANCES: CountBadgeAppearance[] = ['neutral', 'danger', 'warning', 'success', 'information', 'discovery', 'inverse'];
const STATES: CountBadgeState[] = ['Default', 'Hover', 'Press'];

const meta = {
  title: 'Components/Count Badge',
  component: CountBadge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A count badge shows a number, such as unread items or results, next to a label, tab ' +
          'or button. Use **neutral** by default, the status colours when the number means ' +
          'something (e.g. **danger** for errors), and **inverse** on light surfaces that need ' +
          'more emphasis.\n\nAdd a `label` so screen readers hear "25 unread", not just "25".',
      },
    },
  },
  args: { count: '25', appearance: 'neutral', state: 'Default', label: 'unread' },
  argTypes: {
    appearance: { control: 'select', options: APPEARANCES },
    state: { control: 'inline-radio', options: STATES },
  },
} satisfies Meta<typeof CountBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

// One story per appearance
export const Neutral: Story = { args: { appearance: 'neutral' } };
export const Danger: Story = { args: { appearance: 'danger' } };
export const Warning: Story = { args: { appearance: 'warning' } };
export const Success: Story = { args: { appearance: 'success' } };
export const Information: Story = { args: { appearance: 'information' } };
export const Discovery: Story = { args: { appearance: 'discovery' } };
export const Inverse: Story = { args: { appearance: 'inverse' } };

// States
export const Hover: Story = { args: { state: 'Hover' } };
export const Press: Story = { args: { state: 'Press' } };

/** Every appearance x state, like the Figma component page. */
export const AllVariants: Story = {
  parameters: { controls: { include: ['count'] } },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: 'var(--gap-lg)', alignItems: 'center' }}>
      <span />
      {STATES.map((s) => (
        <strong key={s} className="paragraph-mini">{s}</strong>
      ))}
      {APPEARANCES.map((appearance) => (
        <div key={appearance} style={{ display: 'contents' }}>
          <strong className="paragraph-mini">{appearance}</strong>
          {STATES.map((state) => (
            <CountBadge key={state} {...args} appearance={appearance} state={state} />
          ))}
        </div>
      ))}
    </div>
  ),
};
