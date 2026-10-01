import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Alert, type AlertAppearance } from './Alert';

const APPEARANCES: AlertAppearance[] = ['default', 'success', 'destructive', 'warning', 'info'];

const TITLE = "This is the flag's title";
const DESCRIPTION = 'Additional information that will help users understand the flag';

/** As in Figma: the default alert has link actions... */
const linkActions = (
  <>
    <Button variant="Link" size="sm" label="Understood" />
    <span aria-hidden="true">·</span>
    <Button variant="Link" size="sm" label="No thanks" />
  </>
);
/** ...and the status alerts show three placeholder badges. */
const badgeActions = (
  <>
    <Badge label="Badge" showIcon={false} />
    <Badge label="Badge" showIcon={false} />
    <Badge label="Badge" showIcon={false} />
  </>
);

const width: CSSProperties = { width: 'var(--size-384)' };

const meta = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'An alert (flag) tells people about something that happened or needs their attention - ' +
          'a saved change, a failed upload, a warning about their account. Use **default** for ' +
          'neutral news; it can be dismissed with the close button. Use the filled status ' +
          'appearances for **success**, **destructive** (something failed), **warning** and ' +
          '**info**; their chevron shows or hides the details.\n\n' +
          'Destructive and warning alerts are announced to screen readers immediately; the ' +
          'others are announced politely. Keep the title short and put detail in the description.',
      },
    },
  },
  args: {
    title: TITLE,
    description: DESCRIPTION,
    showDescription: true,
    showIcon: true,
    appearance: 'default',
    isOpen: false,
    onDismiss: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: APPEARANCES },
    actions: { control: false },
    icon: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={width}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- One story per appearance (Figma: appearance) ---------------------------------------------

export const Default: Story = { args: { isOpen: true, actions: linkActions } };
export const Success: Story = { args: { appearance: 'success', actions: badgeActions } };
export const Destructive: Story = { args: { appearance: 'destructive', actions: badgeActions } };
export const Warning: Story = { args: { appearance: 'warning', actions: badgeActions } };
export const Info: Story = { args: { appearance: 'info', actions: badgeActions } };

// ---- isOpen, icon ------------------------------------------------------------------------------

export const Collapsed: Story = { args: { isOpen: false } };
export const Expanded: Story = { args: { appearance: 'success', isOpen: true, actions: badgeActions } };
export const WithoutIcon: Story = { args: { showIcon: false, isOpen: true } };

// ---- All 10 variants, like the Figma component page ---------------------------------------------

export const AllVariants: Story = {
  parameters: { controls: { include: ['title', 'description', 'showIcon', 'showDescription'] } },
  decorators: [(Story) => <Story />],
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, var(--size-384))', gap: 'var(--gap-2xl)', alignItems: 'start' }}>
      {APPEARANCES.flatMap((appearance) =>
        [false, true].map((isOpen) => (
          <Alert
            key={`${appearance}-${isOpen}`}
            {...args}
            appearance={appearance}
            isOpen={isOpen}
            actions={appearance === 'default' ? linkActions : badgeActions}
          />
        )),
      )}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const Dismissing: Story = {
  render: (args) => {
    const [shown, setShown] = useState(true);
    return shown ? <Alert {...args} onDismiss={() => setShown(false)} /> : <p className="paragraph-small">Dismissed.</p>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent(TITLE);
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }));
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
  },
};

export const ExpandAndCollapse: Story = {
  args: { appearance: 'warning', actions: badgeActions },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    // Warnings are announced immediately
    await expect(canvas.getByRole('alert')).toHaveTextContent(TITLE);

    const toggle = canvas.getByRole('button', { name: 'Show more' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByText(DESCRIPTION)).not.toBeVisible();

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAccessibleName('Show less');
    await expect(canvas.getByText(DESCRIPTION)).toBeVisible();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
  },
};
