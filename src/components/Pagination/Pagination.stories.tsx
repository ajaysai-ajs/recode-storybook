import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  Pagination,
  PaginationEllipsis,
  PaginationNavigator,
  PaginationPage,
  type PaginationNavigatorState,
  type PaginationPageState,
} from './Pagination';

const PAGE_STATES: PaginationPageState[] = ['Default', 'Hover', 'Press', 'Focus', 'Selected', 'Disabled'];
const NAV_STATES: PaginationNavigatorState[] = ['Default', 'Hover', 'Press', 'Focus', 'Disabled'];

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Pagination lets people move through a long list or table that is split into pages. ' +
          'Use it when the total is known and people may want to jump to a specific page; for ' +
          'feeds, prefer "Load more" or infinite scroll.\n\n' +
          'The bar always shows the first and last page, the pages around the current one, and ' +
          '"…" for skipped ranges - and keeps the same width as you move through the pages. The ' +
          'current page is marked for screen readers ("current page"), the arrows are named ' +
          '"Previous page" / "Next page", and the whole bar is a navigation landmark.\n\n' +
          'The three Figma parts (`PaginationPage`, `PaginationNavigator`, `PaginationEllipsis`) ' +
          'are exported too, for custom layouts.',
      },
    },
  },
  args: {
    currentPage: 1,
    totalPages: 20,
    siblingCount: 1,
    showLabels: false,
    onPageChange: fn(),
  },
  argTypes: {
    currentPage: { control: { type: 'number', min: 1 } },
    totalPages: { control: { type: 'number', min: 1 } },
    siblingCount: { control: { type: 'number', min: 0, max: 3 } },
  },
  // Stories with a real current page that changes when you click
  render: function Render(args) {
    const [page, setPage] = useState(args.currentPage);
    return (
      <Pagination
        {...args}
        currentPage={page}
        onPageChange={(p) => {
          setPage(p);
          args.onPageChange(p);
        }}
      />
    );
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- The assembled bar ----------------------------------------------------------------------

export const Default: Story = {};
export const InTheMiddle: Story = { args: { currentPage: 10 } };
export const AtTheEnd: Story = { args: { currentPage: 20 } };
export const FewPages: Story = { args: { totalPages: 5, currentPage: 2 } };
export const WithLabels: Story = { args: { showLabels: true, currentPage: 3 } };
export const MoreSiblings: Story = { args: { siblingCount: 2, currentPage: 10 } };

// ---- The parts, every state (like the Figma component pages) ---------------------------------

const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--gap-xl)' };
const col: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--gap-xs)' };

export const PageStates: Story = {
  render: () => (
    <div style={row}>
      {PAGE_STATES.map((state) => (
        <div key={state} style={col}>
          <PaginationPage label="1" state={state} />
          <span className="paragraph-mini text-muted">{state}</span>
        </div>
      ))}
    </div>
  ),
};

export const NavigatorStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      {[false, true].map((showLabel) =>
        (['Previous', 'Next'] as const).map((direction) => (
          <div key={`${direction}-${showLabel}`} style={row}>
            {NAV_STATES.map((state) => (
              <div key={state} style={col}>
                <PaginationNavigator direction={direction} state={state} showLabel={showLabel} />
                <span className="paragraph-mini text-muted">{state}</span>
              </div>
            ))}
          </div>
        )),
      )}
    </div>
  ),
};

export const Ellipsis: Story = { render: () => <PaginationEllipsis /> };

// ---- Behaviour tests --------------------------------------------------------------------------

export const ClickAndKeyboard: Story = {
  args: { currentPage: 1, totalPages: 20 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();

    // On page 1 the Previous arrow is disabled and page 1 is marked current
    await expect(canvas.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');

    // Clicking a page moves there
    await userEvent.click(canvas.getByRole('button', { name: 'Page 3' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(3);
    await expect(canvas.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');

    // The Next arrow works from the keyboard
    canvas.getByRole('button', { name: 'Next page' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPageChange).toHaveBeenLastCalledWith(4);
  },
};

export const LastPageDisablesNext: Story = {
  args: { currentPage: 20, totalPages: 20 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Previous page' })).toBeEnabled();
  },
};
