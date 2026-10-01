import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState, type CSSProperties } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FileCard, type FileCardType } from './FileCard';
import { FilePicker, type FilePickerProps, type FilePickerState, type FilePickerType } from './FilePicker';

const TYPES: FilePickerType[] = ['Field', 'Dropzone'];
const STATES: FilePickerState[] = ['Default', 'Hover', 'Focus', 'Dragover', 'Disabled', 'Error'];

const width: CSSProperties = { width: 'var(--size-384)' };

const meta = {
  title: 'Components/File Picker',
  component: FilePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A file picker lets people choose files from their device - by clicking, or by dragging ' +
          'files onto it. Use **Field** where space is tight (a form row) and **Dropzone** when ' +
          'uploading is the main task on the page.\n\n' +
          'It only chooses files: show the chosen files with **File card** underneath, one card ' +
          'per file. Use the description for the rules (types, sizes, how many); with state ' +
          '**Error** it becomes the error message.\n\n' +
          'Keyboard: Tab to the button or drop area and press Enter or Space to open the file ' +
          'chooser. Screen readers hear the label, the button text and the description.',
      },
    },
  },
  args: {
    type: 'Field',
    state: 'Default',
    showLabel: true,
    labelText: 'Attachments',
    showDescription: true,
    descriptionText: 'PDF, PNG or JPG up to 10 MB each. Up to 5 files.',
    prompt: 'Drag and drop files, or browse',
    fieldText: 'No files selected',
    buttonLabel: 'Choose files',
    accept: '.pdf,.png,.jpg,.jpeg',
    multiple: true,
    onFilesSelected: fn(),
    onFilesRejected: fn(),
  },
  argTypes: {
    type: { control: 'inline-radio', options: TYPES },
    state: { control: 'select', options: STATES },
  },
  decorators: [
    (Story) => (
      <div style={width}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- One story per type (Figma: Type) ---------------------------------------------------------

export const Field: Story = {};
export const Dropzone: Story = { args: { type: 'Dropzone' } };

// ---- States (Figma: State) - shown on the Dropzone; AllVariants shows both types -------------

export const Hover: Story = { args: { type: 'Dropzone', state: 'Hover' } };
export const Focus: Story = { args: { type: 'Dropzone', state: 'Focus' } };
export const Dragover: Story = { args: { type: 'Dropzone', state: 'Dragover' } };
export const Disabled: Story = { args: { type: 'Dropzone', state: 'Disabled' } };
export const Error_: Story = {
  name: 'Error',
  args: { type: 'Dropzone', state: 'Error', descriptionText: 'Upload a PDF, PNG or JPG file.' },
};

// ---- Label and Description booleans -----------------------------------------------------------

/** The label is hidden visually but still read by screen readers. */
export const WithoutLabelAndDescription: Story = { args: { showLabel: false, showDescription: false } };

// ---- Every Type x State, like the Figma component page ----------------------------------------

export const AllVariants: Story = {
  parameters: { controls: { include: ['labelText', 'descriptionText', 'showLabel', 'showDescription'] } },
  decorators: [(Story) => <Story />],
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, var(--size-384))', gap: 'var(--gap-2xl)' }}>
      {STATES.flatMap((state) =>
        TYPES.map((type) => (
          <FilePicker
            key={`${type}-${state}`}
            {...args}
            type={type}
            state={state}
            labelText={`${type} - ${state}`}
          />
        )),
      )}
    </div>
  ),
};

// ---- The picker with File cards underneath - how you'd use it ---------------------------------

interface Upload {
  id: number;
  name: string;
  size: string;
  type: FileCardType;
  progress: number;
}

function typeOf(file: File): FileCardType {
  if (file.type === 'application/pdf') return 'PDF';
  if (file.type.startsWith('image/')) return 'Image';
  if (file.type.startsWith('audio/')) return 'Audio';
  if (file.type.startsWith('video/')) return 'Video';
  return 'Generic';
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

let nextId = 1;

function PickerWithCards(args: FilePickerProps) {
  const [uploads, setUploads] = useState<Upload[]>([]);

  // Pretend to upload: each file's progress goes up until it reaches 100
  useEffect(() => {
    if (!uploads.some((u) => u.progress < 100)) return;
    const timer = setTimeout(
      () => setUploads((list) => list.map((u) => ({ ...u, progress: Math.min(100, u.progress + 25) }))),
      400,
    );
    return () => clearTimeout(timer);
  }, [uploads]);

  const add = (files: File[]) => {
    args.onFilesSelected?.(files);
    setUploads((list) => [
      ...list,
      ...files.map((file) => ({ id: nextId++, name: file.name, size: formatSize(file.size), type: typeOf(file), progress: 0 })),
    ]);
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--file-picker-list-margin-top)' }}>
      <FilePicker
        {...args}
        fieldText={uploads.length ? `${uploads.length} file${uploads.length === 1 ? '' : 's'} selected` : 'No files selected'}
        onFilesSelected={add}
      />
      {uploads.length > 0 && (
        <ul aria-label="Selected files" style={{ display: 'grid', gap: 'var(--file-picker-list-gap)', margin: 0, padding: 0, listStyle: 'none' }}>
          {uploads.map((u) => (
            <li key={u.id}>
              <FileCard
                fileName={u.name}
                fileSize={u.size}
                fileType={u.type}
                state={u.progress < 100 ? 'Uploading' : 'Default'}
                uploadProgress={u.progress}
                onDelete={() => setUploads((list) => list.filter((x) => x.id !== u.id))}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const WithFileCards: Story = {
  args: { type: 'Dropzone' },
  render: (args) => <PickerWithCards {...args} />,
};

// ---- Behaviour tests --------------------------------------------------------------------------

/** Build a real File for the tests */
const pdf = () => new File(['%PDF'], 'report.pdf', { type: 'application/pdf' });
const exe = () => new File(['MZ'], 'setup.exe', { type: 'application/x-msdownload' });

/** Send a real browser drag event carrying these files (like dragging from the desktop) */
function drag(target: Element, type: 'dragover' | 'drop', files: File[]) {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  target.dispatchEvent(new DragEvent(type, { dataTransfer, bubbles: true, cancelable: true }));
}

export const ChoosingFiles: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    // Named by the label and the button; described by the field text and the hint
    const button = canvas.getByRole('button', { name: 'Attachments Choose files' });
    await expect(button).toHaveAccessibleDescription('No files selected PDF, PNG or JPG up to 10 MB each. Up to 5 files.');

    // Clicking the button opens the browser's chooser (the hidden input gets the click)
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    const opened = fn();
    const block = (event: Event) => {
      event.preventDefault(); // don't really open the chooser in a test
      opened();
    };
    input.addEventListener('click', block);
    await userEvent.click(button);
    await expect(opened).toHaveBeenCalledTimes(1);
    input.removeEventListener('click', block);

    // Choosing a file hands it to your code
    await userEvent.upload(input, pdf());
    await expect(args.onFilesSelected).toHaveBeenCalledTimes(1);
    await expect((args.onFilesSelected as ReturnType<typeof fn>).mock.calls[0][0][0].name).toBe('report.pdf');
  },
};

export const DroppingFiles: Story = {
  args: { type: 'Dropzone' },
  play: async ({ args, canvasElement }) => {
    const zone = within(canvasElement).getByRole('button', { name: 'Attachments Drag and drop files, or browse' });
    const root = canvasElement.querySelector('.rds-file-picker')!;

    // Dragging over shows the Dragover look
    drag(zone, 'dragover', [pdf(), exe()]);
    await waitFor(() => expect(root).toHaveAttribute('data-state', 'Dragover'));

    // Dropping: the PDF is accepted, the .exe doesn't match `accept` and is rejected
    drag(zone, 'drop', [pdf(), exe()]);
    await waitFor(() => expect(root).toHaveAttribute('data-state', 'Default'));
    const accepted = (args.onFilesSelected as ReturnType<typeof fn>).mock.calls[0][0] as File[];
    const rejected = (args.onFilesRejected as ReturnType<typeof fn>).mock.calls[0][0] as File[];
    await expect(accepted.map((f) => f.name)).toEqual(['report.pdf']);
    await expect(rejected.map((f) => f.name)).toEqual(['setup.exe']);
  },
};

export const KeyboardOpensChooser: Story = {
  args: { type: 'Dropzone' },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    const opened = fn();
    input.addEventListener('click', (event) => {
      event.preventDefault();
      opened();
    });
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(opened).toHaveBeenCalledTimes(2);
  },
};

export const DisabledIgnoresFiles: Story = {
  args: { type: 'Dropzone', state: 'Disabled' },
  play: async ({ args, canvasElement }) => {
    const zone = within(canvasElement).getByRole('button');
    await expect(zone).toBeDisabled();
    drag(zone, 'drop', [pdf()]);
    await expect(args.onFilesSelected).not.toHaveBeenCalled();
  },
};

export const ErrorIsAnnounced: Story = {
  args: { state: 'Error', descriptionText: 'Upload a PDF, PNG or JPG file.' },
  play: async ({ canvasElement }) => {
    // The red text alone isn't enough: screen readers hear "Error:" first
    await expect(within(canvasElement).getByRole('button')).toHaveAccessibleDescription(
      'No files selected Error: Upload a PDF, PNG or JPG file.',
    );
  },
};
