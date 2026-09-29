import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { expect, within } from 'storybook/test';

import { Link, type LinkAppearance, type LinkState } from './Link';

const APPEARANCES: LinkAppearance[] = ['default', 'subtle', 'inverse'];
const STATES: LinkState[] = ['default', 'hover', 'press'];

/** Inverse links need a dark surface behind them. */
const surfaceFor = (appearance: LinkAppearance): CSSProperties => ({
  display: 'inline-flex',
  padding: 'var(--padding-sm)',
  borderRadius: 'var(--radius-md)',
  background: appearance === 'inverse' ? 'var(--surface-inverted)' : 'transparent',
});

const meta = {
  title: 'Components/Link',
  component: Link,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Links take people to another page or place. Use **default** in body text, **subtle** ' +
          'where a quieter link fits (footers, metadata), and **inverse** on dark surfaces. For ' +
          'actions that do something on the page (save, open a dialog), use a Button instead.\n\n' +
          'With `target="_blank"` the link shows the "opens in new" icon and tells screen reader ' +
          'users that it opens a new tab.',
      },
    },
  },
  args: {
    // Not "#": that points at the current page, which browsers treat as already visited.
    href: '#example-destination',
    label: 'Link',
    appearance: 'default',
    state: 'default',
    target: '_self',
    hasVisited: false,
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: APPEARANCES },
    state: { control: 'inline-radio', options: STATES },
    target: { control: 'inline-radio', options: ['_self', '_blank'] },
  },
  decorators: [
    (Story, { args }) => (
      <div style={surfaceFor(args.appearance ?? 'default')}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- One story per appearance -------------------------------------------------------------

export const Default: Story = {};
export const Subtle: Story = { args: { appearance: 'subtle' } };
export const Inverse: Story = { args: { appearance: 'inverse' } };

// ---- States -------------------------------------------------------------------------------

export const Hover: Story = { args: { state: 'hover' } };
export const Press: Story = { args: { state: 'press' } };
export const Visited: Story = { args: { hasVisited: true } };

export const OpensInNewTab: Story = {
  args: { target: '_blank', label: 'Documentation' },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Documentation (opens in a new tab)' });
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};

// ---- Every combination, like the Figma component page -------------------------------------

export const AllVariants: Story = {
  parameters: { controls: { include: ['label', 'target'] } },
  decorators: [(Story) => <Story />], // skip the single-link surface
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: 'var(--gap-lg)', alignItems: 'center' }}>
      <span />
      {STATES.map((s) => (
        <strong key={s} className="paragraph-mini">{s}</strong>
      ))}
      {APPEARANCES.flatMap((appearance) =>
        [false, true]
          // Figma has no visited look for inverse
          .filter((visited) => !(appearance === 'inverse' && visited))
          .map((visited) => (
            <div key={`${appearance}-${visited}`} style={{ display: 'contents' }}>
              <strong className="paragraph-mini">
                {appearance}
                {visited ? ' + visited' : ''}
              </strong>
              {STATES.map((state) => (
                <span key={state} style={surfaceFor(appearance)}>
                  <Link {...args} appearance={appearance} state={state} hasVisited={visited} />
                </span>
              ))}
            </div>
          )),
      )}
    </div>
  ),
};
