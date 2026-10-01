import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { FileCard, type FileCardState, type FileCardType } from './FileCard';

const FILE_TYPES: FileCardType[] = ['Generic', 'PDF', 'Image', 'Audio', 'Video'];
const STATES: FileCardState[] = ['Default', 'Uploading', 'Error'];

const width: CSSProperties = { width: 'var(--size-384)' };

const meta = {
  title: 'Components/File Card',
  component: FileCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A file card shows one file - its type icon, name and size - and its upload state. ' +
          'Use it under a **File Picker** to list the chosen files: one card per file, in a list. ' +
          'Each card is independent, so one can be uploading while another has failed.\n\n' +
          '**Uploading** shows a progress bar; **Error** tints the card and shows the message. ' +
          'The download and delete buttons only appear when you pass `onDownload` / `onDelete`; ' +
          'with neither, the card is read-only. Long names are cut to one line with "…".',
      },
    },
  },
  args: {
    fileName: 'example.pdf',
    fileSize: '9.8 KB',
    showFileSize: true,
    fileType: 'PDF',
    state: 'Default',
    uploadProgress: 40,
    errorMessage: 'Error uploading file',
    onDownload: fn(),
    onDelete: fn(),
  },
  argTypes: {
    fileType: { control: 'select', options: FILE_TYPES },
    state: { control: 'inline-radio', options: STATES },
    uploadProgress: { control: { type: 'range', min: 0, max: 100 } },
  },
  decorators: [
    (Story) => (
      <div style={width}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- States (Figma: State) --------------------------------------------------------------------

export const Default: Story = {};
export const Uploading: Story = { args: { state: 'Uploading' } };
export const Error_: Story = { name: 'Error', args: { state: 'Error' } };

// ---- File types (Figma: File type) -------------------------------------------------------------

export const Generic: Story = { args: { fileType: 'Generic', fileName: 'notes.txt', fileSize: '2.1 KB' } };
export const Image: Story = { args: { fileType: 'Image', fileName: 'photo.jpg', fileSize: '1.4 MB' } };
export const Audio: Story = { args: { fileType: 'Audio', fileName: 'interview.mp3', fileSize: '5.2 MB' } };
export const Video: Story = { args: { fileType: 'Video', fileName: 'demo.mp4', fileSize: '48 MB' } };

// ---- Booleans and edge cases ------------------------------------------------------------------

/** No onDownload / onDelete: no buttons, the card is read-only. */
export const ReadOnly: Story = { args: { onDownload: undefined, onDelete: undefined } };
export const WithoutFileSize: Story = { args: { showFileSize: false } };
export const LongFileName: Story = {
  args: { fileName: 'quarterly-report-final-v3-approved-by-finance-and-legal-2026.pdf', state: 'Uploading' },
};

// ---- Every File type x State, like the Figma component page -----------------------------------

export const AllVariants: Story = {
  parameters: { controls: { include: ['fileName', 'fileSize', 'showFileSize', 'uploadProgress', 'errorMessage'] } },
  decorators: [(Story) => <Story />],
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, var(--size-384))', gap: 'var(--gap-xl)', alignItems: 'start' }}>
      {FILE_TYPES.flatMap((fileType) =>
        STATES.map((state) => <FileCard key={`${fileType}-${state}`} {...args} fileType={fileType} state={state} />),
      )}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const ActionsAreNamed: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    // Each button says which file it acts on - important when many cards are stacked
    await userEvent.click(canvas.getByRole('button', { name: 'Download example.pdf' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Delete example.pdf' }));
    await expect(args.onDownload).toHaveBeenCalledTimes(1);
    await expect(args.onDelete).toHaveBeenCalledTimes(1);
  },
};

export const ProgressAndError: Story = {
  args: { state: 'Uploading', uploadProgress: 62.4 },
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--file-picker-list-gap)' }}>
      <FileCard {...args} />
      <FileCard {...args} fileName="broken.pdf" state="Error" errorMessage="The file is larger than 10 MB" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar', { name: 'Uploading example.pdf' });
    await expect(bar).toHaveAttribute('aria-valuenow', '62');
    // A failed upload is announced
    await expect(canvas.getByRole('alert')).toHaveTextContent('The file is larger than 10 MB');
  },
};
