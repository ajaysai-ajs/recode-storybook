import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties, type FormEvent } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../Button/Button';
import { DatePicker } from '../DatePicker/DatePicker';
import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';
import { Field, FieldMessage, type FieldMessageTone, type FieldState } from './Field';

const STATES: FieldState[] = ['default', 'invalid', 'valid'];
const TONES: FieldMessageTone[] = ['default', 'error', 'success'];

const narrow: CSSProperties = { width: 'var(--size-256)' };

const meta = {
  title: 'Components/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Field gives a form control its label, required marker and message. Use it around ' +
          'every Input, Textarea and Date Picker - never rely on a placeholder as the label.\n\n' +
          'The **message** is a hint by default, an error when `state="invalid"` and a ' +
          'confirmation when `state="valid"`. Errors and successes get an icon and a hidden ' +
          '"Error:" / "Success:" prefix, so they don\'t rely on colour alone.\n\n' +
          'Field connects everything for you: the label is tied to the control (clicking it ' +
          'focuses the control), the message is read as the control\'s description, and ' +
          'required / invalid are passed on. For a group of checkboxes or radios, use a ' +
          '`<fieldset>` with a `<legend>` instead.',
      },
    },
  },
  args: {
    label: 'Field label',
    isRequired: false,
    state: 'default',
    showMessage: true,
    message: 'Message content',
    children: <Input placeholder="Placeholder" />,
  },
  argTypes: {
    state: { control: 'inline-radio', options: STATES },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={narrow}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- States (Figma: state) ----------------------------------------------------------------------

export const Default: Story = { args: { label: 'Email', message: 'We only use this to send receipts.' } };
export const Invalid: Story = {
  args: { label: 'Email', state: 'invalid', message: 'Enter an email address like name@example.com', children: <Input value="name@" onChange={() => {}} /> },
};
export const Valid: Story = {
  args: { label: 'Username', state: 'valid', message: 'This username is available', children: <Input value="ada.lovelace" onChange={() => {}} /> },
};
export const Required: Story = { args: { label: 'Full name', isRequired: true, message: 'As it appears on your ID' } };
export const WithoutMessage: Story = { args: { label: 'Company', showMessage: false } };

// ---- With the other form controls --------------------------------------------------------------

export const WithTextarea: Story = {
  args: { label: 'Description', message: 'Up to 500 characters', children: <Textarea placeholder="What is this about?" rows={3} /> },
};
export const WithDatePicker: Story = {
  args: { label: 'Start date', isRequired: true, message: 'MM/DD/YYYY', children: <DatePicker today={new Date(2022, 11, 20)} /> },
};

// ---- All states, like the Figma component page ----------------------------------------------------

export const AllVariants: Story = {
  parameters: { controls: { include: ['isRequired', 'showMessage'] } },
  decorators: [(Story) => <Story />],
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, var(--size-256))', gap: 'var(--gap-2xl)' }}>
      {STATES.map((state) => (
        <Field key={state} {...args} state={state} label={`Field label (${state})`} message="Message content">
          <Input placeholder="Placeholder" />
        </Field>
      ))}
    </div>
  ),
};

/** "RDS Field Message" on its own, every tone. */
export const MessageTones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
      {TONES.map((tone) => (
        <FieldMessage key={tone} tone={tone} message={`Message content (${tone})`} />
      ))}
    </div>
  ),
};

// ---- A working form ------------------------------------------------------------------------------

/** Errors appear when you submit with an empty or wrong email - and screen readers announce them. */
export const FormValidation: Story = {
  decorators: [(Story) => <Story />],
  render: () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const error = !email ? 'Enter your email address' : !/^\S+@\S+\.\S+$/.test(email) ? 'Enter an email address like name@example.com' : '';
    const showError = submitted && !!error;
    const onSubmit = (e: FormEvent) => {
      e.preventDefault();
      setSubmitted(true);
    };
    return (
      // noValidate: we show our own messages instead of the browser's pop-ups
      <form noValidate onSubmit={onSubmit} style={{ ...narrow, display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)', alignItems: 'flex-start' }}>
        <Field
          label="Email"
          isRequired
          state={showError ? 'invalid' : submitted ? 'valid' : 'default'}
          message={showError ? error : submitted ? 'Looks good' : 'We only use this to send receipts.'}
        >
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Button type="submit" label="Submit" />
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByRole('textbox', { name: 'Email' });

    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await expect(email).toBeInvalid();
    await expect(email).toHaveAccessibleDescription('Error: Enter your email address');

    await userEvent.type(email, 'ada@example.com');
    await expect(email).toBeValid();
    await expect(email).toHaveAccessibleDescription('Success: Looks good');
  },
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const LabelAndMessageAreConnected: Story = {
  args: { label: 'Email', isRequired: true, message: 'We only use this to send receipts.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The label names the control (no asterisk in the name), and clicking it focuses the control
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await userEvent.click(canvas.getByText('Email'));
    await expect(input).toHaveFocus();

    await expect(input).toBeRequired();
    await expect(input).toHaveAccessibleDescription('We only use this to send receipts.');
  },
};

export const InvalidIsPassedToTheControl: Story = {
  args: { label: 'Email', state: 'invalid', message: 'Enter a valid email' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Email' });
    await expect(input).toBeInvalid();
    // The control shows its error look too (red border)
    await expect(canvasElement.querySelector('.rds-input')).toHaveAttribute('data-invalid', 'true');
  },
};
