import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { Resizable, type ResizableOrientation, type ResizableState } from './Resizable';

const ORIENTATIONS: ResizableOrientation[] = ['Horizontal', 'Vertical'];
const STATES: ResizableState[] = ['Idle', 'Hover'];

/** The Figma placeholder content: a centred label in the item/description colour. */
function Panel({ children }: { children: ReactNode }) {
  return (
    <div
      className="paragraph-small paragraph-medium"
      style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--item-description)' }}
    >
      {children}
    </div>
  );
}

// Figma draws the component 400 x 220
const size: CSSProperties = { width: 'var(--size-384)', height: 'calc(var(--size-192) + var(--size-24))' };

const meta = {
  title: 'Components/Resizable',
  component: Resizable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Resizable splits a region into two panels that people can share out by dragging the ' +
          'handle between them. Use it where the right split really varies by task - code ' +
          'editors, inspectors, split previews. If one arrangement suits everyone, a fixed ' +
          'layout is simpler and better.\n\n' +
          'Give the first panel a `minSize` and `maxSize` (in %) so neither panel can be ' +
          'dragged to nothing. Keyboard: Tab to the handle, then the arrow keys move it by ' +
          '`keyboardStep`, Home / End jump to the limits, and - with `isCollapsible` - Enter ' +
          'collapses the first panel and brings it back. Save the size (`onSizeChange`) so the ' +
          'split is remembered next time. Don\'t nest more than two levels of splits.',
      },
    },
  },
  args: {
    orientation: 'Horizontal',
    state: 'Idle',
    defaultSize: 50,
    minSize: 20,
    maxSize: 80,
    keyboardStep: 5,
    isCollapsible: false,
    handleLabel: 'Resize panels',
    onSizeChange: fn(),
    style: size,
    children: [<Panel key="1">Panel one</Panel>, <Panel key="2">Panel two</Panel>],
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ORIENTATIONS },
    state: { control: 'inline-radio', options: STATES },
    children: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Resizable>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- Orientation x State (Figma) -------------------------------------------------------------

export const Horizontal: Story = {};
export const Vertical: Story = { args: { orientation: 'Vertical' } };
export const HorizontalHover: Story = { args: { state: 'Hover' } };
export const VerticalHover: Story = { args: { orientation: 'Vertical', state: 'Hover' } };

export const AllVariants: Story = {
  parameters: { controls: { include: ['defaultSize', 'minSize', 'maxSize'] } },
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', gap: 'var(--gap-2xl)' }}>
      {ORIENTATIONS.flatMap((orientation) =>
        STATES.map((state) => (
          <Resizable key={`${orientation}-${state}`} {...args} orientation={orientation} state={state} handleLabel={`Resize panels (${orientation}, ${state})`} />
        )),
      )}
    </div>
  ),
};

// ---- Behaviour options ------------------------------------------------------------------------

/** Enter on the handle collapses the first panel; Enter again (or an arrow key) brings it back. */
export const Collapsible: Story = { args: { isCollapsible: true, defaultSize: 35 } };

/** Your code controls the size - e.g. to save it and restore it next visit. */
export const RememberedSize: Story = {
  render: (args) => {
    const [value, setValue] = useState(30);
    return (
      <div style={{ display: 'grid', gap: 'var(--gap-lg)' }}>
        <Resizable {...args} size={value} onSizeChange={setValue} />
        <p className="paragraph-small" style={{ margin: 0 }}>First panel: {value}% (save this to remember the split)</p>
      </div>
    );
  },
};

/** Panels hold anything; content that doesn't fit scrolls inside its panel. */
export const WithContent: Story = {
  args: {
    defaultSize: 35,
    children: [
      <nav key="nav" aria-label="Files" className="paragraph-small" style={{ padding: 'var(--padding-lg)' }}>
        <ul style={{ margin: 0, paddingInlineStart: 'var(--padding-lg)' }}>
          {['index.tsx', 'Button.tsx', 'Button.css', 'Table.tsx', 'Table.css', 'tokens.json'].map((file) => (
            <li key={file}>{file}</li>
          ))}
        </ul>
      </nav>,
      <div key="editor" className="paragraph-small" style={{ padding: 'var(--padding-lg)' }}>
        <h3 className="heading-4">Button.tsx</h3>
        <p>Drag the handle to give the editor more room, or Tab to it and use the arrow keys.</p>
      </div>,
    ],
  },
};

// ---- Behaviour tests --------------------------------------------------------------------------

const firstPanel = (canvasElement: HTMLElement) => canvasElement.querySelector<HTMLElement>('.rds-resizable__panel')!;

export const KeyboardResizing: Story = {
  play: async ({ args, canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator', { name: 'Resize panels' });
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    await expect(handle).toHaveAttribute('aria-valuenow', '50');

    await userEvent.tab();
    await expect(handle).toHaveFocus();

    // Right makes the first panel bigger, Left smaller, by keyboardStep (5%)
    await userEvent.keyboard('{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '55');
    await expect(firstPanel(canvasElement).style.flexBasis).toBe('55%');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(handle).toHaveAttribute('aria-valuenow', '45');

    // Home / End jump to minSize / maxSize, and it never goes past them
    await userEvent.keyboard('{Home}{ArrowLeft}');
    await expect(handle).toHaveAttribute('aria-valuenow', '20');
    await userEvent.keyboard('{End}{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '80');
    await expect(args.onSizeChange).toHaveBeenLastCalledWith(80);
  },
};

export const VerticalUsesUpAndDown: Story = {
  args: { orientation: 'Vertical' },
  play: async ({ canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator');
    await expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
    handle.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(handle).toHaveAttribute('aria-valuenow', '55');
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await expect(handle).toHaveAttribute('aria-valuenow', '45');
  },
};

export const CollapseAndRestore: Story = {
  args: { isCollapsible: true, defaultSize: 35 },
  play: async ({ canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator');
    handle.focus();
    await userEvent.keyboard('{Enter}');
    await expect(handle).toHaveAttribute('aria-valuetext', 'Collapsed');
    await expect(firstPanel(canvasElement)).not.toBeVisible();

    // Collapsing is always recoverable: Enter brings back the earlier size
    await userEvent.keyboard('{Enter}');
    await expect(handle).toHaveAttribute('aria-valuenow', '35');
    await expect(firstPanel(canvasElement)).toBeVisible();
  },
};

export const DraggingTheHandle: Story = {
  play: async ({ args, canvasElement }) => {
    const handle = within(canvasElement).getByRole('separator');
    const box = canvasElement.querySelector('.rds-resizable')!.getBoundingClientRect();
    const y = box.top + box.height / 2;

    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: box.left + box.width / 2, clientY: y });
    await expect(handle).toHaveFocus();
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: box.left + box.width * 0.3, clientY: y });
    await expect(handle).toHaveAttribute('aria-valuenow', '30');

    // Dragging past the limit stops at minSize
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: box.left, clientY: y });
    await expect(handle).toHaveAttribute('aria-valuenow', '20');
    fireEvent.pointerUp(handle, { pointerId: 1 });

    // After letting go, moving the pointer does nothing
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: box.left + box.width * 0.7, clientY: y });
    await expect(handle).toHaveAttribute('aria-valuenow', '20');
    await expect(args.onSizeChange).toHaveBeenLastCalledWith(20);
  },
};
