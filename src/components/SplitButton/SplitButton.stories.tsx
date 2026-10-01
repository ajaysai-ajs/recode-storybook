import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { SplitButton, type SplitButtonAppearance, type SplitButtonItem, type SplitButtonSize } from './SplitButton';

const APPEARANCES: SplitButtonAppearance[] = ['default', 'primary'];
const SIZES: SplitButtonSize[] = ['sm', 'md'];

const onSaveAsDraft = fn();
const onSaveAsTemplate = fn();
const ITEMS: SplitButtonItem[] = [
  { label: 'Save as draft', onSelect: onSaveAsDraft },
  { label: 'Save as template', onSelect: onSaveAsTemplate },
  { label: 'Export (coming soon)', onSelect: fn(), isDisabled: true },
  { label: 'Discard changes', onSelect: fn(), isDestructive: true },
];

const meta = {
  title: 'Components/Split Button',
  component: SplitButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      // Leave room below for the menu in the docs page
      story: { inline: false, height: '260px' },
      description: {
        component:
          'A split button pairs one main action with a menu of related actions - for example ' +
          '"Save" with "Save as draft" and "Save as template". Pressing the main half does the ' +
          'most common action; the arrow opens the others. Use it only when there is a clear ' +
          'default; if all options are equal, use a plain menu button instead.\n\n' +
          'Keyboard: Tab reaches each half. On the arrow, Enter, Space or Down open the menu ' +
          '(Up opens it on the last item); Up/Down move, Home/End jump, Enter picks, Escape or ' +
          'Tab close. Give the arrow a clear `triggerLabel`, e.g. "More save options".',
      },
    },
  },
  args: {
    label: 'Save',
    onClick: fn(),
    items: ITEMS,
    appearance: 'default',
    size: 'md',
    isOpen: false,
    isDisabled: false,
    placement: 'bottom-start',
    triggerLabel: 'More save options',
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: APPEARANCES },
    size: { control: 'inline-radio', options: SIZES },
    placement: { control: 'inline-radio', options: ['bottom-start', 'bottom-end'] },
    items: { control: false },
  },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- Appearances and sizes -----------------------------------------------------------------------

export const Default: Story = {};
export const Primary: Story = { args: { appearance: 'primary' } };
export const Small: Story = { args: { size: 'sm' } };
export const Disabled: Story = { args: { isDisabled: true } };

// ---- Open (Figma: isOpen, placement) ---------------------------------------------------------------

export const Open: Story = { args: { isOpen: true } };
export const OpenAlignedToEnd: Story = {
  args: { isOpen: true, placement: 'bottom-end' },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Story />
      </div>
    ),
  ],
};

/** Both appearances in both sizes, plus disabled, like the Figma component page (closed). */
export const AllVariants: Story = {
  parameters: { controls: { include: ['label'] } },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 'var(--gap-lg) var(--gap-2xl)', alignItems: 'center' }}>
      {APPEARANCES.flatMap((appearance) =>
        SIZES.map((size) => (
          <div key={`${appearance}-${size}`} style={{ display: 'contents' }}>
            <strong className="paragraph-mini">
              {appearance} / {size}
            </strong>
            <SplitButton {...args} appearance={appearance} size={size} />
            <SplitButton {...args} appearance={appearance} size={size} isDisabled />
          </div>
        )),
      )}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const MainActionAndMenu: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body); // the menu opens in the top layer

    // The main half does the main action
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // The arrow opens the menu
    const trigger = canvas.getByRole('button', { name: 'More save options' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Picking an item runs it, closes the menu and returns focus to the arrow
    await userEvent.click(await page.findByRole('menuitem', { name: 'Save as template' }));
    await expect(onSaveAsTemplate).toHaveBeenCalled();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();
  },
};

export const KeyboardSupport: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'More save options' });

    // Down arrow on the trigger opens the menu on the first item
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(page.getByRole('menuitem', { name: 'Save as draft' })).toHaveFocus());

    // Down skips the disabled item; End / Home jump; Up wraps round
    await userEvent.keyboard('{ArrowDown}');
    await expect(page.getByRole('menuitem', { name: 'Save as template' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(page.getByRole('menuitem', { name: 'Discard changes' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(page.getByRole('menuitem', { name: 'Save as draft' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(page.getByRole('menuitem', { name: 'Discard changes' })).toHaveFocus();

    // Escape closes and returns focus to the trigger
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();

    // Enter on an item picks it
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(page.getByRole('menuitem', { name: 'Save as draft' })).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await expect(onSaveAsDraft).toHaveBeenCalled();
  },
};

export const DisabledCannotOpen: Story = {
  args: { isDisabled: true, appearance: 'primary' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const main = canvas.getByRole('button', { name: 'Save' });
    const trigger = canvas.getByRole('button', { name: 'More save options' });
    await expect(main).toBeDisabled();
    await expect(trigger).toBeDisabled();
    // Regression test: the disabled trigger looks disabled too (same fill as the main half)
    await expect(getComputedStyle(trigger).backgroundColor).toBe(getComputedStyle(main).backgroundColor);
  },
};
