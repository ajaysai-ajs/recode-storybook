import type { Meta, StoryObj } from '@storybook/react-vite';

import { Blanket } from './Blanket';

const meta = {
  title: 'Components/Blanket',
  component: Blanket,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      // Render in an iframe so the full-screen blanket doesn't cover the docs page
      story: { inline: false, height: '240px' },
      description: {
        // From the Figma component description
        component:
          'Blanket is the dimmed layer that sits between a modal surface (Dialog, Alert Dialog, ' +
          'Drawer) and the page beneath it. It signals that the content behind is inactive. ' +
          'It has no variants. Place the modal as a sibling after the Blanket, not inside it.',
      },
    },
  },
} satisfies Meta<typeof Blanket>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Blanket over some page content, with a surface placed above it. */
export const Default: Story = {
  render: () => (
    <div style={{ padding: 'var(--spacing-xl)' }}>
      <p className="paragraph">Page content behind the blanket.</p>
      <Blanket />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          translate: '-50% -50%',
          padding: 'var(--padding-xl)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        A dialog sits here, above the blanket.
      </div>
    </div>
  ),
};
