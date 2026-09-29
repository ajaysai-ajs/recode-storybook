import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Icon } from '../Icon/Icon';
import { Tag, TAG_COLORS, type TagAppearance, type TagState } from './Tag';

const APPEARANCES: TagAppearance[] = ['default', 'rounded'];
const STATES: TagState[] = ['Default', 'Hover', 'Press', 'Focus'];

const meta = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Tags label, categorise or filter content, for example keywords on an item or the ' +
          'filters a user has picked. Make a tag **removable** when the user can take it away. ' +
          'Use **subtle** colours for most tags and the solid colours sparingly for emphasis. ' +
          'For a read-only status, use a Badge instead.\n\n' +
          'The remove button is a real button named "Remove <tag text>", so it works with Tab, ' +
          'Enter and Space.',
      },
    },
  },
  args: {
    tagText: 'Tag',
    appearance: 'default',
    color: 'standard',
    state: 'Default',
    elemBefore: false,
    elemBeforeIcon: <Icon icon="check" />,
    isRemovable: false,
    onRemove: fn(),
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: APPEARANCES },
    color: { control: 'select', options: TAG_COLORS },
    state: { control: 'inline-radio', options: STATES },
    elemBeforeIcon: { control: false },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

// Appearances
export const Default: Story = {};
export const Rounded: Story = { args: { appearance: 'rounded' } };
export const Removable: Story = { args: { isRemovable: true } };
export const WithElemBefore: Story = { args: { elemBefore: true } };

// States
export const Hover: Story = { args: { state: 'Hover' } };
export const Press: Story = { args: { state: 'Press' } };
export const Focus: Story = { args: { state: 'Focus' } };

/** Every colour in both appearances. */
export const AllColors: Story = {
  parameters: { controls: { include: ['tagText', 'isRemovable', 'elemBefore', 'state'] } },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 'var(--gap-md) var(--gap-xl)', alignItems: 'center' }}>
      <span />
      {APPEARANCES.map((a) => (
        <strong key={a} className="paragraph-mini">{a}</strong>
      ))}
      {TAG_COLORS.map((color) => (
        <div key={color} style={{ display: 'contents' }}>
          <strong className="paragraph-mini">{color}</strong>
          {APPEARANCES.map((appearance) => (
            <span key={appearance}>
              <Tag {...args} color={color} appearance={appearance} tagText={color} />
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** A working list: removing a tag takes it out, and the keyboard works. */
export const RemovableList: Story = {
  render: () => {
    const [tags, setTags] = useState(['Design', 'Research', 'Accessibility']);
    return (
      <div style={{ display: 'flex', gap: 'var(--gap-sm)', flexWrap: 'wrap' }}>
        {tags.map((t) => (
          <Tag key={t} tagText={t} color="blue subtle" isRemovable onRemove={() => setTags(tags.filter((x) => x !== t))} />
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Tab to the first remove button and press Enter
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Remove Design' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.queryByText('Design')).not.toBeInTheDocument();
  },
};
