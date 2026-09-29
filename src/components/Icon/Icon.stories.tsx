import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { Icon } from './Icon';
import { RDS_ICONS, type RdsIconName } from './icons';

const ICONS = Object.keys(RDS_ICONS) as RdsIconName[];

const meta = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The RDS icon set (Material Design Icons geometry on a 24px grid). Use icons to support ' +
          'a label, not replace it. When an icon is the only content of a control, give it a `label` ' +
          'so screen readers can announce it.\n\n' +
          'Size and colour come from `--icon-size` and `--icon-fg`. For status colours, override ' +
          '`--icon-fg` (or `color`) where you use the icon.',
      },
    },
  },
  args: { icon: 'check' },
  argTypes: { icon: { control: 'select', options: ICONS } },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** An icon with a `label` is announced by screen readers ("Done, image"). */
export const WithLabel: Story = { args: { icon: 'check', label: 'Done' } };

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(7rem, 1fr))',
  gap: 'var(--gap-xl)',
};
const cell: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-sm)' };

export const AllIcons: Story = {
  render: () => (
    <div style={grid}>
      {ICONS.map((name) => (
        <div key={name} style={cell}>
          <Icon icon={name} />
          <code className="paragraph-mini">{name}</code>
        </div>
      ))}
    </div>
  ),
};

/** Status colours: override `--icon-fg` with a semantic colour token. */
export const StatusColours: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-xl)' }}>
      <Icon icon="check" label="Success" style={{ '--icon-fg': 'var(--success)' } as CSSProperties} />
      <Icon icon="clear" label="Error" style={{ '--icon-fg': 'var(--destructive)' } as CSSProperties} />
      <Icon icon="remove" label="Warning" style={{ '--icon-fg': 'var(--warning-active)' } as CSSProperties} />
    </div>
  ),
};
