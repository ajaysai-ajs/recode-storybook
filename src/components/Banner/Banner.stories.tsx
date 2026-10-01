import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Icon } from '../Icon/Icon';
import { Banner, type BannerAppearance } from './Banner';

const APPEARANCES: BannerAppearance[] = ['warning', 'error', 'announcement'];

const MESSAGE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
const LONG_MESSAGE =
  'Scheduled maintenance: the dashboard will be read-only on Saturday from 22:00 to 02:00 UTC. ' +
  'Changes you make during this time will not be saved, so please finish any edits before it starts.';

const meta = {
  title: 'Components/Banner',
  component: Banner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A banner is a full-width strip at the top of a page or section with one short ' +
          'message that affects the whole product or page. Use **warning** for something ' +
          'people should know before they carry on (e.g. an expiring licence), **error** when ' +
          'something is broken (e.g. the service is down) and **announcement** for neutral news ' +
          '(e.g. planned maintenance).\n\n' +
          'Show one banner at a time and keep the message to one sentence. For feedback about ' +
          'something the person just did, use an Alert instead. Warnings and errors are ' +
          'announced to screen readers immediately; announcements are announced politely.',
      },
    },
  },
  args: {
    message: MESSAGE,
    appearance: 'warning',
    showIcon: true,
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: APPEARANCES },
    message: { control: 'text' },
    iconSlot: { control: false },
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- One story per appearance (Figma: appearance) ---------------------------------------------

export const Warning: Story = {};
// Named ErrorBanner so it doesn't hide JavaScript's built-in Error; shown as "Error"
export const ErrorBanner: Story = { name: 'Error', args: { appearance: 'error' } };
export const Announcement: Story = { args: { appearance: 'announcement' } };

// ---- showIcon, iconSlot, long text -----------------------------------------------------------

export const WithoutIcon: Story = { args: { showIcon: false } };

/** Figma: iconSlot - swap in any icon; it takes the banner's text colour. */
export const CustomIcon: Story = { args: { appearance: 'announcement', iconSlot: <Icon icon="check" /> } };

/** Long messages wrap onto more lines (the Figma text is set to grow in height). */
export const LongMessage: Story = { args: { message: LONG_MESSAGE } };

// ---- All variants, like the Figma component page ----------------------------------------------

export const AllVariants: Story = {
  parameters: { controls: { include: ['message', 'showIcon'] } },
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--gap-2xl)' }}>
      {APPEARANCES.map((appearance) => (
        <Banner key={appearance} {...args} appearance={appearance} />
      ))}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const AnnouncedToScreenReaders: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--gap-2xl)' }}>
      <Banner {...args} appearance="warning" message="Your licence expires in 3 days." />
      <Banner {...args} appearance="error" message="We can't reach the server." />
      <Banner {...args} appearance="announcement" message="New reports are available." />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Warning and error interrupt; announcement is polite
    const alerts = canvas.getAllByRole('alert');
    await expect(alerts).toHaveLength(2);
    await expect(alerts[0]).toHaveTextContent('Your licence expires in 3 days.');
    await expect(alerts[1]).toHaveTextContent("We can't reach the server.");
    await expect(canvas.getByRole('status')).toHaveTextContent('New reports are available.');

    // The icons are decoration: hidden from screen readers
    for (const icon of canvasElement.querySelectorAll('.rds-banner__icon')) {
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
    }
    // Announcement has no icon by default (as in Figma)
    await expect(canvas.getByRole('status').querySelector('.rds-banner__icon')).toBeNull();
  },
};

export const IconCanBeHidden: Story = {
  args: { showIcon: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert').querySelector('.rds-banner__icon')).toBeNull();
  },
};
