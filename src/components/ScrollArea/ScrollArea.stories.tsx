import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Tag } from '../Tag/Tag';
import { ScrollArea, type ScrollAreaScroll } from './ScrollArea';

const SCROLLS: ScrollAreaScroll[] = ['Vertical', 'Horizontal', 'Both'];

const size: CSSProperties = { width: 'var(--size-384)', height: 'var(--size-192)' };

const paragraphs = Array.from({ length: 8 }, (_, i) => (
  <p key={i} className="paragraph-small" style={{ margin: '0 0 var(--spacing-sm)' }}>
    {i + 1}. Release notes: this update improves loading speed, fixes an issue with saved
    filters, and makes keyboard navigation more consistent across the app.
  </p>
));

const wideRow = (
  <div style={{ display: 'flex', gap: 'var(--gap-sm)', width: 'max-content' }}>
    {['Design', 'Research', 'Accessibility', 'Tokens', 'Components', 'Patterns', 'Motion', 'Content', 'Documentation', 'Testing'].map((t) => (
      <Tag key={t} tagText={t} color="blue subtle" />
    ))}
  </div>
);

const bigGrid = (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, var(--size-80))', gap: 'var(--gap-sm)' }}>
    {Array.from({ length: 96 }, (_, i) => (
      <div key={i} className="paragraph-mini" style={{ padding: 'var(--padding-sm)', background: 'var(--muted)', borderRadius: 'var(--radius-sm)' }}>
        Cell {i + 1}
      </div>
    ))}
  </div>
);

const meta = {
  title: 'Components/Scroll Area',
  component: ScrollArea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A bordered box whose content scrolls, with the slim RDS scrollbar. Use it for long ' +
          'content that must stay inside a fixed-size region - a list in a side panel, a code ' +
          'sample, a wide row of tags. Prefer letting the page scroll when you can: nested ' +
          'scrolling areas are harder to use, especially on touch screens.\n\n' +
          'Set its size with `style` or a class. It uses the browser\'s own scrolling, so the ' +
          'mouse wheel, touch and screen readers all work; it can also be focused with Tab and ' +
          'scrolled with the arrow keys. Give it an `aria-label` describing its content. The ' +
          'scrollbar darkens on hover and while dragging (exact in Chrome, Edge and Safari; ' +
          'Firefox shows a thin scrollbar in the same colours).',
      },
    },
  },
  args: { scroll: 'Vertical', 'aria-label': 'Release notes', style: size, children: paragraphs },
  argTypes: {
    scroll: { control: 'inline-radio', options: SCROLLS },
    children: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- One story per scroll direction (Figma: Scroll) --------------------------------------------

export const Vertical: Story = {};
export const Horizontal: Story = {
  args: { scroll: 'Horizontal', 'aria-label': 'Topics', children: wideRow, style: { width: 'var(--size-384)' } },
};
export const Both: Story = { args: { scroll: 'Both', 'aria-label': 'Data grid', children: bigGrid } };

// ---- The scrollbar states (Figma: RDS Scrollbar) -------------------------------------------------

const track: CSSProperties = {
  boxSizing: 'border-box',
  width: 'var(--scroll-area-width)',
  height: 'var(--size-128)',
  padding: 'var(--scroll-area-padding)',
  borderRadius: 'var(--scroll-area-radius)',
  background: 'var(--scroll-area-track)',
  outline: 'var(--border-width-1) dashed var(--border)', // shows where the (transparent) track is
};
const thumb = (color: string): CSSProperties => ({
  height: 'var(--size-48)',
  borderRadius: 'var(--scroll-area-radius)',
  background: `var(${color})`,
});

/**
 * The three thumb colours, drawn as a picture (the real scrollbar is the browser's, so its
 * states can't be forced). Scroll the other stories and hover or drag the thumb to see them.
 */
export const ScrollbarStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-2xl)' }}>
      {[
        ['Default', '--scroll-area-thumb'],
        ['Hover', '--scroll-area-thumb-hover'],
        ['Dragging', '--scroll-area-thumb-active'],
      ].map(([name, token]) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-sm)' }}>
          <div style={track}>
            <div style={thumb(token)} />
          </div>
          <span className="paragraph-mini text-muted">{name}</span>
        </div>
      ))}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const KeyboardCanReachIt: Story = {
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('region', { name: 'Release notes' });

    // It can be focused with Tab, so keyboard users can scroll it with the arrow keys
    await userEvent.tab();
    await expect(region).toHaveFocus();

    // The content really is taller than the box, and it scrolls
    await expect(region.scrollHeight).toBeGreaterThan(region.clientHeight);
    region.scrollTop = region.scrollHeight;
    await expect(region.scrollTop).toBeGreaterThan(0);
  },
};
