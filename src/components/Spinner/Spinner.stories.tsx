import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { Spinner, type SpinnerSize, type SpinnerTone } from './Spinner';

const SIZES: SpinnerSize[] = ['sm', 'md', 'lg'];
const TONES: SpinnerTone[] = ['Brand', 'Neutral', 'On brand'];

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        // From the Figma component description
        component:
          'Spinner indicates an indeterminate wait. Use **Brand** on neutral surfaces, **Neutral** ' +
          'inside neutral controls, and **On brand** on coloured fills such as a Primary button. ' +
          'For waits over a few seconds prefer Progress, and for content placeholders prefer Skeleton.\n\n' +
          'Give a standalone spinner a `label` so screen readers announce what is loading.',
      },
    },
  },
  args: { size: 'md', tone: 'Brand', label: 'Loading' },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    tone: { control: 'inline-radio', options: TONES },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = { args: { tone: 'Brand' } };
export const Neutral: Story = { args: { tone: 'Neutral' } };

/** On brand is white, so it is shown on a primary-coloured surface. */
export const OnBrand: Story = {
  args: { tone: 'On brand' },
  decorators: [
    (Story) => (
      <div style={{ display: 'inline-flex', padding: 'var(--padding-md)', background: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
        <Story />
      </div>
    ),
  ],
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-xl)' }}>
      {SIZES.map((size) => (
        <Spinner key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, max-content)',
  alignItems: 'center',
  gap: 'var(--gap-xl)',
};

/** Every size x tone, like the Figma component page. */
export const AllVariants: Story = {
  render: () => (
    <div style={grid}>
      <span />
      {SIZES.map((s) => (
        <strong key={s} className="paragraph-mini">{s}</strong>
      ))}
      {TONES.map((tone) => (
        <div key={tone} style={{ display: 'contents' }}>
          <strong className="paragraph-mini">{tone}</strong>
          {SIZES.map((size) => (
            <span
              key={size}
              style={{
                display: 'inline-flex',
                padding: 'var(--padding-sm)',
                borderRadius: 'var(--radius-md)',
                // On brand needs a coloured background to be visible
                background: tone === 'On brand' ? 'var(--primary)' : 'transparent',
              }}
            >
              <Spinner size={size} tone={tone} />
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
};
