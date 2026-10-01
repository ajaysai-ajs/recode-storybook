import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../Button/Button';
import {
  AlertDialog,
  DialogClose,
  type AlertDialogAppearance,
  type AlertDialogProps,
  type AlertDialogSize,
  type DialogCloseState,
} from './AlertDialog';

const APPEARANCES: AlertDialogAppearance[] = ['default', 'warning', 'danger'];
const SIZES: AlertDialogSize[] = ['small', 'medium', 'large', 'x-large', 'full-screen'];

const SHORT = 'Deleting this item removes it for everyone on the project. This cannot be undone.';
const LONG_PARAGRAPH =
  'Deleting this item removes it for everyone on the project and cannot be undone. Anyone with a ' +
  'link will lose access immediately, and any automations, reports or integrations that use it ' +
  'will stop working. Comments, attachments and the full history of changes are deleted too. If ' +
  'you might need it later, archive it instead: archived items are hidden but can be restored.';

const meta = {
  title: 'Components/Alert Dialog',
  component: AlertDialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'An alert dialog interrupts people to confirm an important action or tell them ' +
          'something they must respond to - "Delete this project?", "Discard unsaved changes?". ' +
          'Use it sparingly: for anything that can wait, use an Alert or Banner instead.\n\n' +
          'Use **default** for neutral confirmations, **warning** when the action has side effects, ' +
          'and **danger** when it destroys something (Confirm turns red). Write a title that asks ' +
          'the question and label Confirm with the action, e.g. "Delete".\n\n' +
          'Keyboard: focus starts on Cancel (the safe choice), Tab stays inside the dialog, and ' +
          'Escape closes it. Focus returns to the button that opened it. Clicking outside does ' +
          'not close it - an alert dialog needs an answer. The previews below are shown in the ' +
          'page (`isModal={false}`); open the **Modal** story to try the real thing.',
      },
    },
  },
  args: {
    title: 'Delete this item?',
    children: SHORT,
    appearance: 'default',
    size: 'small',
    showBody: true,
    showFooter: true,
    hasCloseButton: true,
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    isModal: false,
    onClose: fn(),
    onConfirm: fn(),
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: APPEARANCES },
    size: { control: 'select', options: SIZES },
    children: { control: 'text' },
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- One story per appearance (Figma: appearance) ---------------------------------------------

export const Default: Story = {};
export const Warning: Story = { args: { appearance: 'warning', title: 'Discard unsaved changes?', confirmLabel: 'Discard' } };
export const Danger: Story = { args: { appearance: 'danger' } };

// ---- One story per size (Figma: size) ---------------------------------------------------------

export const Small: Story = { args: { size: 'small' } };
export const Medium: Story = { args: { size: 'medium' } };
export const Large: Story = { args: { size: 'large' } };
export const XLarge: Story = { name: 'X-Large', args: { size: 'x-large' } };
export const FullScreen: Story = { args: { size: 'full-screen' } };

// ---- showBody, showFooter, hasCloseButton, long body ------------------------------------------

export const WithoutBody: Story = { args: { showBody: false } };
export const WithoutFooter: Story = { args: { showFooter: false } };
export const WithoutCloseButton: Story = { args: { hasCloseButton: false } };

/** Figma: Dialog body/text long - several paragraphs. */
export const LongBody: Story = {
  args: {
    size: 'medium',
    children: (
      <>
        <p>{SHORT}</p>
        <p>{LONG_PARAGRAPH}</p>
        <p>{LONG_PARAGRAPH}</p>
      </>
    ),
  },
};

// ---- Dialog close (the x button part) --------------------------------------------------------

const CLOSE_STATES: DialogCloseState[] = ['default', 'hover', 'press', 'focus'];
const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--gap-2xl)' };

export const CloseStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={row}>
      {CLOSE_STATES.map((state) => (
        <div key={state} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--gap-md)' }}>
          <DialogClose state={state} />
          <span className="paragraph-mini">{state}</span>
        </div>
      ))}
    </div>
  ),
};

// ---- All appearances side by side, like the Figma page ----------------------------------------

export const AllAppearances: Story = {
  parameters: { controls: { include: ['title', 'children', 'showBody', 'showFooter', 'hasCloseButton'] } },
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--gap-2xl)' }}>
      {APPEARANCES.map((appearance) => (
        <AlertDialog key={appearance} {...args} appearance={appearance} />
      ))}
    </div>
  ),
};

// ---- The real modal, with behaviour tests -----------------------------------------------------

/** A page with a button that opens the dialog - how you'd use it in an app. */
function ModalDemo(args: AlertDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState('');
  const close = (answer: string) => {
    setIsOpen(false);
    setResult(answer);
  };
  return (
    <div style={{ display: 'grid', gap: 'var(--gap-lg)', justifyItems: 'start' }}>
      <Button variant="Destructive" label="Delete item" onClick={() => setIsOpen(true)} />
      <p className="paragraph-small" aria-live="polite">{result}</p>
      <AlertDialog
        {...args}
        isModal
        isOpen={isOpen}
        onClose={() => {
          args.onClose?.();
          close('Cancelled.');
        }}
        onConfirm={() => {
          args.onConfirm?.();
          close('Deleted.');
        }}
      />
    </div>
  );
}

export const Modal: Story = {
  args: { appearance: 'danger' },
  render: (args) => <ModalDemo {...args} />,
};

export const KeyboardAndFocus: Story = {
  args: { appearance: 'danger' },
  render: (args) => <ModalDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Delete item' });
    await userEvent.click(trigger);

    // Opens as a named alert dialog, described by its message
    const dialog = await canvas.findByRole('alertdialog', { name: 'Danger: Delete this item?' });
    await expect(dialog).toHaveAccessibleDescription(SHORT);

    // Focus starts on Cancel, the safe choice; Confirm is the destructive button
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
    await waitFor(() => expect(cancel).toHaveFocus());
    await expect(within(dialog).getByRole('button', { name: 'Delete' })).toHaveAttribute('data-variant', 'Destructive');

    // Tab moves on to Delete
    await userEvent.tab();
    await expect(within(dialog).getByRole('button', { name: 'Delete' })).toHaveFocus();
    // It is a true modal: the browser makes the page behind it inert, so Tab can't leave it.
    // (The test's simulated Tab doesn't know about that, so we check the modal state instead.)
    await expect(dialog.matches(':modal')).toBe(true);

    // Escape closes it, and focus goes back to the button that opened it
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const ConfirmAndClose: Story = {
  render: (args) => <ModalDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Delete item' });

    // Confirm
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole('alertdialog', { name: 'Delete this item?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText('Deleted.')).toBeInTheDocument();

    // The close (x) button
    await userEvent.click(trigger);
    const again = await canvas.findByRole('alertdialog');
    await userEvent.click(within(again).getByRole('button', { name: 'Close' }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText('Cancelled.')).toBeInTheDocument();
  },
};
