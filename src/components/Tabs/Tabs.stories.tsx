import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Tabs, TabsTrigger, type TabItem, type TabsTriggerState } from './Tabs';

const panel = (text: string) => <p className="paragraph-small">{text}</p>;

const ITEMS: TabItem[] = [
  { id: 'overview', label: 'Overview', content: panel('An overview of the project.') },
  { id: 'activity', label: 'Activity', content: panel('Recent activity and comments.') },
  { id: 'files', label: 'Files', content: panel('Documents attached to the project.') },
  { id: 'settings', label: 'Settings', content: panel('Project settings and permissions.') },
];

const TRIGGER_STATES: TabsTriggerState[] = ['Default', 'Hover', 'Press', 'Focus', 'Disabled'];

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Tabs split related content into views on the same page, so people can switch ' +
          'between them without leaving it. Use short labels (one or two words) and keep the ' +
          'number of tabs small. Don\'t use tabs for steps in a sequence (use Progress tracker) ' +
          'or to navigate to other pages (use navigation links).\n\n' +
          'Keyboard: Tab moves into the row (to the selected tab), the arrow keys move between ' +
          'tabs and select them, Home/End jump to the ends, and Tab again moves into the panel. ' +
          'Disabled tabs are skipped. Give the set an `aria-label` that says what it is about.\n\n' +
          '`TabsTrigger` is the single Figma part, exported for previews and custom layouts.',
      },
    },
  },
  args: { items: ITEMS, 'aria-label': 'Project', onChange: fn() },
  argTypes: { items: { control: false } },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- Tabs ---------------------------------------------------------------------------------------

export const Default: Story = {};
export const StartOnAnotherTab: Story = { args: { defaultSelectedId: 'files' } };
export const WithDisabledTab: Story = {
  args: { items: ITEMS.map((t) => (t.id === 'files' ? { ...t, disabled: true } : t)) },
};

/** Your code owns the selected tab (e.g. to keep it in the URL). */
export const Controlled: Story = {
  render: (args) => {
    const [tab, setTab] = useState('activity');
    return (
      <>
        <Tabs {...args} selectedId={tab} onChange={setTab} />
        <p className="paragraph-mini text-muted">Selected: {tab}</p>
      </>
    );
  },
};

// ---- The Figma trigger, all 7 variants --------------------------------------------------------

const col: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-xs)' };

export const TriggerVariants: Story = {
  render: () => (
    // The previews sit in a tablist so they're valid, but they're not a working set of tabs
    <div role="tablist" aria-label="Tab trigger variants" style={{ display: 'flex', gap: 'var(--gap-xl)', alignItems: 'flex-start' }}>
      {TRIGGER_STATES.map((state) => (
        <div key={state} style={col}>
          <TabsTrigger label="Tab" state={state} />
          <span className="paragraph-mini text-muted">{state}</span>
        </div>
      ))}
      {(['Default', 'Focus'] as const).map((state) => (
        <div key={`selected-${state}`} style={col}>
          <TabsTrigger label="Tab" state={state} isSelected />
          <span className="paragraph-mini text-muted">{state} + selected</span>
        </div>
      ))}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const KeyboardSupport: Story = {
  args: { items: ITEMS.map((t) => (t.id === 'files' ? { ...t, disabled: true } : t)) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const tab = (name: string) => canvas.getByRole('tab', { name });

    // One Tab stop: Tab lands on the selected tab
    await userEvent.tab();
    await expect(tab('Overview')).toHaveFocus();
    await expect(tab('Overview')).toHaveAttribute('aria-selected', 'true');

    // Arrow keys move and select; the disabled "Files" tab is skipped
    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Activity')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Settings')).toHaveFocus();
    await expect(args.onChange).toHaveBeenLastCalledWith('settings');

    // Wraps round, and Home/End jump to the ends
    await userEvent.keyboard('{ArrowRight}');
    await expect(tab('Overview')).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(tab('Settings')).toHaveFocus();

    // The panel shows the selected tab's content and is named by it
    await expect(canvas.getByRole('tabpanel', { name: 'Settings' })).toHaveTextContent('Project settings');

    // Tab again moves out of the row into the panel
    await userEvent.tab();
    await expect(canvas.getByRole('tabpanel', { name: 'Settings' })).toHaveFocus();
  },
};

export const ClickSelects: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Files' }));
    await expect(canvas.getByRole('tab', { name: 'Files' })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel', { name: 'Files' })).toBeVisible();
    // Only one panel is visible at a time
    await expect(canvas.getAllByRole('tabpanel')).toHaveLength(1);
  },
};
