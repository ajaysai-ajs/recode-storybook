import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '../Icon/Icon';
import { Badge, type BadgeAppearance, type BadgeSpacing } from './Badge';

const STATUS: BadgeAppearance[] = ['neutral', 'danger', 'warning', 'success', 'information', 'discovery'];
const ACCENTS: BadgeAppearance[] = [
  'accent-gray',
  'accent-red',
  'accent-orange',
  'accent-yellow',
  'accent-lime',
  'accent-green',
  'accent-teal',
  'accent-blue',
  'accent-purple',
  'accent-magenta',
];
const SPACINGS: BadgeSpacing[] = ['default', 'spacious'];

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A badge is a static label for a status or category. Use the **status** appearances ' +
          '(neutral, danger, warning, success, information, discovery) when the colour carries ' +
          'meaning, and the **accent** colours to tell categories apart. Badges are not clickable; ' +
          'for filters or removable items use a Tag.\n\n' +
          'Colour alone should not carry meaning: always keep a clear text label.',
      },
    },
  },
  args: {
    label: 'Label',
    appearance: 'neutral',
    spacing: 'default',
    showIcon: true,
    iconSlot: <Icon icon="check" />,
    showBadge: false,
    count: '25',
  },
  argTypes: {
    appearance: { control: 'select', options: [...STATUS, ...ACCENTS] },
    spacing: { control: 'inline-radio', options: SPACINGS },
    iconSlot: { control: false },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// One story per status appearance (accents are shown together below)
export const Neutral: Story = {};
export const Danger: Story = { args: { appearance: 'danger', label: 'Failed', iconSlot: <Icon icon="clear" /> } };
export const Warning: Story = { args: { appearance: 'warning', label: 'Pending' } };
export const Success: Story = { args: { appearance: 'success', label: 'Approved' } };
export const Information: Story = { args: { appearance: 'information', label: 'New' } };
export const Discovery: Story = { args: { appearance: 'discovery', label: 'Beta' } };

export const Spacious: Story = { args: { spacing: 'spacious' } };
export const WithCount: Story = { args: { showBadge: true, label: 'Comments' } };
export const WithoutIcon: Story = { args: { showIcon: false } };

/** Every appearance in both spacings, like the Figma component page. */
export const AllVariants: Story = {
  parameters: { controls: { include: ['label', 'showIcon', 'showBadge'] } },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 'var(--gap-lg)', alignItems: 'center' }}>
      <span />
      {SPACINGS.map((s) => (
        <strong key={s} className="paragraph-mini">{s}</strong>
      ))}
      {[...STATUS, ...ACCENTS].map((appearance) => (
        <div key={appearance} style={{ display: 'contents' }}>
          <strong className="paragraph-mini">{appearance}</strong>
          {SPACINGS.map((spacing) => (
            <span key={spacing}>
              <Badge {...args} appearance={appearance} spacing={spacing} />
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
};
